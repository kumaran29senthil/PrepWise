"use client";

import { useState, useEffect, useCallback } from "react";
import { vapi } from "@/lib/vapi.sdk";

export enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  ERROR = "ERROR",
}

export interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface UseVapiCallReturn {
  callStatus: CallStatus;
  messages: SavedMessage[];
  isSpeaking: boolean;
  lastMessage: string;
  callError: string | null;
  startCall: (assistantIdOrConfig: any, options?: any) => Promise<void>;
  endCall: () => void;
}

export function useVapiCall(): UseVapiCallReturn {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [callError, setCallError] = useState<string | null>(null);

  useEffect(() => {
    const onCallStart = () => {
      setCallError(null);
      setCallStatus(CallStatus.ACTIVE);
    };
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage: SavedMessage = {
          role: message.role,
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: any) => {
      console.error("Vapi error:", error);

      // Extract meaningful error message
      let errorMsg = "Call failed unexpectedly.";
      if (typeof error === "string") {
        try {
          const parsed = JSON.parse(error);
          errorMsg = parsed.errorMsg || parsed.error?.msg || errorMsg;
        } catch {
          errorMsg = error;
        }
      } else if (error?.errorMsg) {
        errorMsg = error.errorMsg;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      setCallError(errorMsg);
      setCallStatus(CallStatus.ERROR);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  // Keep lastMessage in sync
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  const startCall = useCallback(
    async (assistantIdOrConfig: any, options?: any) => {
      try {
        setCallError(null);
        setCallStatus(CallStatus.CONNECTING);
        await vapi.start(assistantIdOrConfig, options);
      } catch (err: any) {
        console.error("Vapi start failed:", err);
        setCallError(err?.message || "Failed to start the call. Please try again.");
        setCallStatus(CallStatus.ERROR);
      }
    },
    []
  );

  const endCall = useCallback(() => {
    vapi.stop();
  }, []);

  return {
    callStatus,
    messages,
    isSpeaking,
    lastMessage,
    callError,
    startCall,
    endCall,
  };
}

