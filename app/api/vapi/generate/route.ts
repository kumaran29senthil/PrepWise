import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { cookies } from "next/headers";

import { db, auth } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  // --- Parse body ---
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Log incoming request type for debugging
  console.log(
    "[vapi/generate] Request type:",
    body.message?.type || "browser-direct"
  );

  // --- Detect if this is a Vapi server call ---
  const isVapiCall = body.message?.type === "tool-calls";

  if (isVapiCall) {
    // ═══════════════════════════════════════════
    // PATH: Vapi server-to-server tool call
    // ═══════════════════════════════════════════
    const toolCall = body.message.toolCallList?.[0];
    if (!toolCall) {
      return Response.json(
        { results: [{ error: "No tool call found" }] },
        { status: 400 }
      );
    }

    const toolCallId = toolCall.id;

    // Arguments can be a string or object depending on Vapi version
    let args = toolCall.function?.arguments;
    if (typeof args === "string") {
      try {
        args = JSON.parse(args);
      } catch {
        return Response.json(
          {
            results: [
              { toolCallId, error: "Invalid function arguments" },
            ],
          },
          { status: 400 }
        );
      }
    }

    const { role, type, level, techstack, amount, userid } = args || {};

    console.log("[vapi/generate] Tool call args:", {
      role,
      type,
      level,
      techstack,
      amount,
      userid: userid ? "***" : "MISSING",
    });

    if (!userid) {
      return Response.json(
        {
          results: [
            { toolCallId, error: "Missing userid" },
          ],
        },
        { status: 400 }
      );
    }

    if (!type || !role || !level || !techstack || !amount) {
      return Response.json(
        {
          results: [
            { toolCallId, error: "Missing required fields" },
          ],
        },
        { status: 400 }
      );
    }

    // Verify user exists
    const userDoc = await db.collection("users").doc(userid).get();
    if (!userDoc.exists) {
      return Response.json(
        {
          results: [{ toolCallId, error: "Invalid user" }],
        },
        { status: 401 }
      );
    }

    try {
      const { text: questions } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: `Prepare questions for a job interview.
          The job role is ${role}.
          The job experience level is ${level}.
          The tech stack used in the job is: ${techstack}.
          The focus between behavioural and technical questions should lean towards: ${type}.
          The amount of questions required is: ${amount}.
          Please return only the questions, without any additional text.
          The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
          Return the questions formatted like this:
          ["Question 1", "Question 2", "Question 3"]
        `,
      });

      const interview = {
        role,
        type,
        level,
        techstack: techstack.split(",").map((s: string) => s.trim()),
        questions: JSON.parse(questions),
        userId: userid,
        finalized: true,
        coverImage: getRandomInterviewCover(),
        createdAt: new Date().toISOString(),
      };

      await db.collection("interviews").add(interview);
      console.log("[vapi/generate] ✅ Interview saved to Firestore");

      return Response.json({
        results: [
          {
            toolCallId,
            result: "Interview generated successfully. The user can now take the interview from their dashboard.",
          },
        ],
      });
    } catch (error) {
      console.error("[vapi/generate] ❌ Error:", error);
      return Response.json({
        results: [
          {
            toolCallId,
            error: "Failed to generate interview questions",
          },
        ],
      });
    }
  }

  // ═══════════════════════════════════════════
  // PATH: Browser request with session cookie
  // ═══════════════════════════════════════════
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let userId: string;
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    userId = decodedClaims.uid;
  } catch {
    return Response.json(
      { success: false, error: "Invalid session" },
      { status: 401 }
    );
  }

  const { type, role, level, techstack, amount } = body;

  if (!type || !role || !level || !techstack || !amount) {
    return Response.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const { text: questions } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
      `,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((s: string) => s.trim()),
      questions: JSON.parse(questions),
      userId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[vapi/generate] Error:", error);
    return Response.json(
      { success: false, error: "Failed to generate interview" },
      { status: 500 }
    );
  }
}