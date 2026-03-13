import { useState, useEffect, useRef, useCallback } from "react";
import type { BuddyEmotion } from "../components/ChatHeader";
import type { ChatMessage } from "../types/project";

interface UseBuddyEmotionResult {
  buddyEmotion: BuddyEmotion;
  triggerEmotion: (emotion: BuddyEmotion, durationMs: number) => void;
}

export function useBuddyEmotion(messages: ChatMessage[]): UseBuddyEmotionResult {
  const [buddyEmotion, setBuddyEmotion] = useState<BuddyEmotion>("idle");
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wire "curious" emotion: when the last assistant message ends with "?"
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg?.role === "assistant" &&
      lastMsg.content.trimEnd().endsWith("?")
    ) {
      setBuddyEmotion("curious");
    } else if (buddyEmotion === "curious") {
      setBuddyEmotion("idle");
    }
    // buddyEmotion intentionally excluded — we only read it to clear "curious",
    // including it would cause an infinite re-render loop.
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup emotion timer on unmount
  useEffect(() => {
    return () => {
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
    };
  }, []);

  const triggerEmotion = useCallback(
    (emotion: BuddyEmotion, durationMs: number) => {
      if (emotionTimerRef.current) {
        clearTimeout(emotionTimerRef.current);
      }
      setBuddyEmotion(emotion);
      emotionTimerRef.current = setTimeout(() => {
        setBuddyEmotion("idle");
        emotionTimerRef.current = null;
      }, durationMs);
    },
    [],
  );

  return { buddyEmotion, triggerEmotion };
}
