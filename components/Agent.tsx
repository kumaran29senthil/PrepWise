"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { useVapiCall, CallStatus } from "@/hooks/useVapiCall";

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const {
    callStatus,
    messages,
    isSpeaking,
    lastMessage,
    callError,
    startCall,
    endCall,
  } = useVapiCall();
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Use a ref to always have the latest messages when the effect fires
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Handle post-call logic (feedback generation or redirect)
  useEffect(() => {
    if (callStatus !== CallStatus.FINISHED) return;
    if (isGeneratingFeedback) return; // prevent double-fire

    if (type === "generate") {
      router.push("/");
      return;
    }

    // Generate feedback from the transcript
    const handleGenerateFeedback = async () => {
      const currentMessages = messagesRef.current;

      if (!currentMessages || currentMessages.length === 0) {
        toast.error(
          "No conversation was recorded. Please try the interview again."
        );
        router.push("/");
        return;
      }

      setIsGeneratingFeedback(true);

      try {
        const result = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: currentMessages,
          feedbackId,
        });

        if (result.success && result.feedbackId) {
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          toast.error("Failed to generate feedback. Please try again.");
          router.push("/");
        }
      } catch (error) {
        console.error("Feedback generation threw error:", error);
        toast.error("Something went wrong. Please try again.");
        router.push("/");
      }
    };

    handleGenerateFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  const handleCall = async () => {
    if (type === "generate") {
      await startCall(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await startCall(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  // Show feedback loading state
  if (isGeneratingFeedback) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-200" />
        <h3>Generating your feedback...</h3>
        <p className="text-gray-400 text-sm">
          Our AI is analyzing your interview. This may take a moment.
        </p>
      </div>
    );
  }

  // Show error state when Vapi call fails
  if (callStatus === CallStatus.ERROR) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Call Failed
          </h3>
          <p className="text-gray-400 text-sm max-w-md">
            {callError ||
              "The voice call could not be completed. This usually happens when Vapi credits are exhausted."}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary px-6 py-2" onClick={() => handleCall()}>
            Try Again
          </button>
          <button
            className="btn-secondary px-6 py-2"
            onClick={() => router.push("/")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => endCall()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
