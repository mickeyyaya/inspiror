import { useEffect, useRef } from "react";
import { withId } from "../constants";
import type { Block } from "../types/block";
import type { ChatMessage } from "../types/project";
import type { VoiceLanguage } from "./useVoice";
import type { translations } from "../i18n/translations";

const SAFE_BLOCK_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const AUTO_FIX_LIMIT = 2;

type T = (typeof translations)[VoiceLanguage];

export interface UseAutoFixParams {
  isLoading: boolean;
  submit: (payload: {
    messages: ChatMessage[];
    currentBlocks: string;
    language: string;
  }) => void;
  playBuzzer: () => void;
  language: VoiceLanguage;
  t: Pick<T, "error_oops" | "error_autofix_limit" | "error_block_fix">;
  blocksRef: React.MutableRefObject<Block[]>;
  messagesRef: React.MutableRefObject<ChatMessage[]>;
  recordDebugRef: React.MutableRefObject<() => void>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onError?: () => void;
}

export interface UseAutoFixReturn {
  resetAutoFixCount: () => void;
}

export function useAutoFix({
  isLoading,
  submit,
  playBuzzer,
  language,
  t,
  blocksRef,
  messagesRef,
  recordDebugRef,
  setMessages,
  onError,
}: UseAutoFixParams): UseAutoFixReturn {
  const autoFixCountRef = useRef(0);

  // Use a ref for isLoading to avoid stale closure in the message handler
  const isLoadingRef = useRef(isLoading);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Use refs for stable references to callbacks
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  const playBuzzerRef = useRef(playBuzzer);
  useEffect(() => {
    playBuzzerRef.current = playBuzzer;
  }, [playBuzzer]);

  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const setMessagesRef = useRef(setMessages);
  useEffect(() => {
    setMessagesRef.current = setMessages;
  }, [setMessages]);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const handleIframeError = (event: MessageEvent) => {
      const allowed = [window.location.origin, "null"];
      if (!allowed.includes(event.origin)) return;
      if (event.data?.type !== "iframe-error") return;

      const rawMsg = String(event.data.message || "Unknown error");
      const errorMsg = rawMsg.slice(0, 200);
      const rawBlockId = event.data.blockId ? String(event.data.blockId) : null;
      const blockId =
        rawBlockId && SAFE_BLOCK_ID_RE.test(rawBlockId) ? rawBlockId : null;

      console.error(
        `[Sandbox Error]${blockId ? ` Block: ${blockId}` : ""} ${errorMsg}`,
      );

      if (isLoadingRef.current) return;

      if (autoFixCountRef.current >= AUTO_FIX_LIMIT) {
        console.warn("[App] Auto-fix limit reached. Stopping infinite loop.");
        const warningMessage = withId(
          "assistant",
          tRef.current.error_autofix_limit,
        );
        setMessagesRef.current((prev) => [...prev, warningMessage]);
        return;
      }

      autoFixCountRef.current += 1;

      onErrorRef.current?.();
      playBuzzerRef.current();
      recordDebugRef.current();
      const oopsMessage = withId("assistant", tRef.current.error_oops);
      const blockLabel = blockId ? `"${blockId}"` : "";
      const errorContext = withId(
        "user",
        tRef.current.error_block_fix
          .replace("{blockId}", blockLabel)
          .replace("{error}", errorMsg),
      );
      const updatedMessages = [
        ...messagesRef.current,
        oopsMessage,
        errorContext,
      ];
      setMessagesRef.current(updatedMessages);
      submitRef.current({
        messages: updatedMessages,
        currentBlocks: JSON.stringify(blocksRef.current),
        language: languageRef.current,
      });
    };

    window.addEventListener("message", handleIframeError);
    return () => window.removeEventListener("message", handleIframeError);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetAutoFixCount = () => {
    autoFixCountRef.current = 0;
  };

  return { resetAutoFixCount };
}
