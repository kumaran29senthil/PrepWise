"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { getCurrentUser } from "./auth.action";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export async function getInterviewById(
  id: string,
  userId?: string
): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  if (!interview.exists) return null;

  const data = interview.data() as Interview;

  // IDOR protection: if userId is provided, validate ownership
  if (userId && data.userId !== userId && !data.finalized) {
    return null;
  }

  return { ...data, id: interview.id };
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

// ─── Admin Functions ────────────────────────────────────

// Get admin dashboard stats
export async function getAdminStats(): Promise<AdminStats | null> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return null;

  const [usersSnap, interviewsSnap, feedbackSnap] = await Promise.all([
    db.collection("users").get(),
    db.collection("interviews").get(),
    db.collection("feedback").get(),
  ]);

  let totalScore = 0;
  feedbackSnap.docs.forEach((doc) => {
    totalScore += doc.data().totalScore || 0;
  });

  return {
    totalUsers: usersSnap.size,
    totalInterviews: interviewsSnap.size,
    totalFeedbacks: feedbackSnap.size,
    averageScore: feedbackSnap.size > 0
      ? Math.round(totalScore / feedbackSnap.size)
      : 0,
  };
}

// Get all interviews (admin only)
export async function getAllInterviews(): Promise<AdminInterviewRow[]> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return [];

  // Fetch all data in parallel (avoid N+1 queries)
  const [interviewsSnap, usersSnap, feedbackSnap] = await Promise.all([
    db.collection("interviews").orderBy("createdAt", "desc").limit(50).get(),
    db.collection("users").get(),
    db.collection("feedback").get(),
  ]);

  // Build lookup maps
  const userMap = new Map<string, string>();
  usersSnap.docs.forEach((doc) => {
    userMap.set(doc.id, doc.data().name || "Unknown");
  });

  const feedbackMap = new Map<string, number>();
  feedbackSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.interviewId) {
      feedbackMap.set(data.interviewId, data.totalScore || 0);
    }
  });

  const rows: AdminInterviewRow[] = interviewsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      role: data.role || "",
      type: data.type || "",
      level: data.level || "",
      techstack: data.techstack || [],
      userId: data.userId || "",
      userName: userMap.get(data.userId) || `User-${(data.userId || "").slice(0, 6)}`,
      createdAt: data.createdAt || "",
      score: feedbackMap.has(doc.id) ? feedbackMap.get(doc.id)! : null,
      finalized: data.finalized || false,
    };
  });

  return rows;
}

// Delete interview (admin only)
export async function deleteInterview(interviewId: string) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { success: false, error: "Unauthorized" };

  try {
    // Delete associated feedback
    const feedbackSnap = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    const batch = db.batch();
    feedbackSnap.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(db.collection("interviews").doc(interviewId));
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, error: "Failed to delete interview" };
  }
}

// ─── User Analytics ─────────────────────────────────────

export async function getUserAnalytics(
  userId: string
): Promise<UserAnalytics> {
  const defaultAnalytics: UserAnalytics = {
    totalInterviews: 0,
    averageScore: 0,
    bestCategory: "N/A",
    latestScore: null,
    categoryAverages: [],
    recentScores: [],
  };

  if (!userId) return defaultAnalytics;

  const [interviewsSnap, feedbackSnap] = await Promise.all([
    db.collection("interviews").where("userId", "==", userId).get(),
    db.collection("feedback").where("userId", "==", userId).get(),
  ]);

  // Sort feedback by createdAt descending in-memory (avoids composite index requirement)
  const sortedFeedbackDocs = feedbackSnap.docs.sort((a, b) => {
    const aDate = a.data().createdAt || "";
    const bDate = b.data().createdAt || "";
    return bDate.localeCompare(aDate);
  });

  if (feedbackSnap.empty) {
    return {
      ...defaultAnalytics,
      totalInterviews: interviewsSnap.size,
    };
  }

  // Build interview role lookup map from already-fetched data (avoids N+1 queries)
  const interviewRoleMap = new Map<string, string>();
  interviewsSnap.docs.forEach((doc) => {
    interviewRoleMap.set(doc.id, doc.data().role || "Interview");
  });

  // Calculate average score
  let totalScore = 0;
  const categoryTotals: Record<string, { total: number; count: number }> = {};
  const recentScores: UserAnalytics["recentScores"] = [];

  for (const doc of sortedFeedbackDocs) {
    const data = doc.data();
    totalScore += data.totalScore || 0;

    // Aggregate category scores
    if (data.categoryScores) {
      for (const cat of data.categoryScores) {
        if (!categoryTotals[cat.name]) {
          categoryTotals[cat.name] = { total: 0, count: 0 };
        }
        categoryTotals[cat.name].total += cat.score;
        categoryTotals[cat.name].count += 1;
      }
    }

    // Get recent scores (last 5) — use the pre-built map instead of querying
    if (recentScores.length < 5) {
      recentScores.push({
        date: data.createdAt || "",
        score: data.totalScore || 0,
        role: interviewRoleMap.get(data.interviewId) || "Interview",
      });
    }
  }

  const avgScore = Math.round(totalScore / feedbackSnap.size);

  // Calculate category averages
  const categoryAverages = Object.entries(categoryTotals).map(
    ([name, { total, count }]) => ({
      name,
      avgScore: Math.round(total / count),
    })
  );

  // Find best category
  const bestCategory = categoryAverages.length > 0
    ? categoryAverages.reduce((best, cat) =>
        cat.avgScore > best.avgScore ? cat : best
      ).name
    : "N/A";

  return {
    totalInterviews: interviewsSnap.size,
    averageScore: avgScore,
    bestCategory,
    latestScore: sortedFeedbackDocs[0]?.data().totalScore || null,
    categoryAverages,
    recentScores,
  };
}