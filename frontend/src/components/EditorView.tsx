import { useState, useEffect, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useAudio } from "../hooks/useAudio";
import { useVoice, type VoiceLanguage } from "../hooks/useVoice";
import { useAchievements } from "../hooks/useAchievements";
import { translations } from "../i18n/translations";
import type { ChatMessage, Project } from "../types/project";
import { generationSchema, pickRandomChips, withId } from "../constants";
import { ConfettiBurst } from "./ConfettiBurst";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { PreviewPanel } from "./PreviewPanel";
import { AchievementModal } from "./AchievementModal";
import { BadgeGallery } from "./BadgeGallery";

export interface EditorViewProps {
  project: Pick<Project, "id" | "messages" | "currentCode">;
  defaultCode: string;
  onUpdate: (
    projectId: string,
    updates: Partial<Pick<Project, "messages" | "currentCode">>,
  ) => void;
  onReset: () => void;
  onBack: () => void;
  language: VoiceLanguage;
  onToggleLanguage: () => void;
}

export function EditorView({
  project,
  defaultCode,
  onUpdate,
  onReset,
  onBack,
  language,
  onToggleLanguage,
}: EditorViewProps) {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (
      project.messages.length === 1 &&
      project.messages[0].role === "assistant" &&
      project.messages[0].content.includes("Hi! I'm your builder buddy")
    ) {
      return [withId("assistant", t.greeting)];
    }
    return project.messages;
  });
  const [inputValue, setInputValue] = useState("");
  const [currentCode, setCurrentCode] = useState(project.currentCode);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [suggestionChips, setSuggestionChips] = useState(pickRandomChips);

  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoFixCountRef = useRef(0);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef(messages);

  // Keep messagesRef in sync to avoid stale closures
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const { playPop, playChipClick, playChime, playBuzzer, isMuted, toggleMute } =
    useAudio();
  const {
    isListening,
    transcript,
    isAutoSpeakEnabled,
    startListening,
    stopListening,
    speak,
    toggleAutoSpeak,
  } = useVoice(language);
  const {
    achievements,
    unlockedIds,
    stats,
    newlyUnlocked,
    dismissUnlock,
    recordBuild,
    recordDebug,
    recordExplore,
    selectedAvatar,
    unlockedAvatars,
    selectAvatar,
  } = useAchievements();
  const [isBadgeGalleryOpen, setIsBadgeGalleryOpen] = useState(false);
  const recordBuildRef = useRef(recordBuild);
  const recordDebugRef = useRef(recordDebug);
  const playChimeRef = useRef(playChime);
  const speakRef = useRef(speak);

  useEffect(() => {
    recordBuildRef.current = recordBuild;
  }, [recordBuild]);

  useEffect(() => {
    recordDebugRef.current = recordDebug;
  }, [recordDebug]);

  useEffect(() => {
    playChimeRef.current = playChime;
  }, [playChime]);

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  useEffect(() => {
    if (isListening && transcript) {
      setInputValue(transcript);
    }
  }, [isListening, transcript]);

  const { object, submit, isLoading } = useObject({
    api: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/generate",
    schema: generationSchema,
    onFinish({ object: finalObj }) {
      if (finalObj?.reply) {
        setMessages((prev) => [
          ...prev,
          withId("assistant", finalObj.reply as string),
        ]);
        speakRef.current(finalObj.reply as string);
      }
      if (finalObj?.code) {
        setCurrentCode(finalObj.code as string);
      }
      playChimeRef.current();
      recordBuildRef.current();

      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
      setShowConfetti(true);
      confettiTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        confettiTimerRef.current = null;
      }, 2500);
    },
    onError(err) {
      console.error("[UI] Stream error:", err);
      setMessages((prev) => [...prev, withId("assistant", t.error_connection)]);
    },
  });

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    stopListening();
    autoFixCountRef.current = 0;
    playPop();
    const newMessages: ChatMessage[] = [
      ...messages,
      withId("user", inputValue),
    ];
    setMessages(newMessages);
    setInputValue("");
    submit({ messages: newMessages, currentCode, language });
  };

  const handleChipClick = (label: string) => {
    if (isLoading) return;
    stopListening();
    autoFixCountRef.current = 0;
    playChipClick();
    recordExplore();
    const newMessages: ChatMessage[] = [...messages, withId("user", label)];
    setMessages(newMessages);
    submit({ messages: newMessages, currentCode, language });
  };

  const handleReset = () => {
    if (
      !window.confirm(
        t.confirm_reset ??
          "Reset this project? Your current work will be cleared.",
      )
    ) {
      return;
    }
    onReset();
    setMessages([withId("assistant", t.greeting)]);
    setCurrentCode(defaultCode);
    setInputValue("");
    setSuggestionChips(pickRandomChips());
    autoFixCountRef.current = 0;
  };

  const showSuggestions =
    messages.length === 1 && messages[0]?.role === "assistant" && !isLoading;

  const projectId = project.id;

  useEffect(() => {
    onUpdate(projectId, { messages });
  }, [messages, onUpdate, projectId]);

  useEffect(() => {
    onUpdate(projectId, { currentCode });
  }, [currentCode, onUpdate, projectId]);

  // Use messagesRef to avoid stale closure in iframe error handler
  useEffect(() => {
    const handleIframeError = (event: MessageEvent) => {
      // Validate origin to prevent cross-origin message spoofing
      // "null" is sent by sandboxed iframes (no allow-same-origin)
      const allowed = [window.location.origin, "null", ""];
      if (!allowed.includes(event.origin)) return;
      if (event.data?.type === "iframe-error") {
        // Truncate error message to prevent prompt injection via crafted errors
        const rawMsg = String(event.data.message || "Unknown error");
        const errorMsg = rawMsg.slice(0, 200);
        console.error(`[Sandbox Error] ${errorMsg}`);

        if (isLoading) return;

        if (autoFixCountRef.current >= 2) {
          console.warn("[App] Auto-fix limit reached. Stopping infinite loop.");
          const warningMessage = withId("assistant", t.error_autofix_limit);
          setMessages((prev) => [...prev, warningMessage]);
          return;
        }

        autoFixCountRef.current += 1;
        console.log(`[App] Triggering Auto-Fix (${autoFixCountRef.current}/2)`);

        playBuzzer();
        recordDebugRef.current();
        const oopsMessage = withId("assistant", t.error_oops);
        const errorContext = withId(
          "user",
          `The code you generated caused this error: ${errorMsg}. Please fix it.`,
        );
        const updatedMessages = [
          ...messagesRef.current,
          oopsMessage,
          errorContext,
        ];
        setMessages(updatedMessages);
        submit({ messages: updatedMessages, currentCode, language });
      }
    };

    window.addEventListener("message", handleIframeError);
    return () => window.removeEventListener("message", handleIframeError);
  }, [currentCode, isLoading, submit, playBuzzer, language, t]);

  return (
    <div className="w-screen h-dvh bg-[#fdfbf7] flex font-sans overflow-hidden">
      <ConfettiBurst show={showConfetti} />

      {isChatVisible && (
        <div
          className="h-full w-full sm:w-[26rem] lg:w-[30rem] flex-shrink-0 bg-[#fdfbf7] border-r-4 border-[#222] flex flex-col z-20 relative shadow-[8px_0px_0px_rgba(0,0,0,0.1)]"
          aria-hidden="false"
          onMouseEnter={() => inputRef.current?.focus()}
        >
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[20%] bg-[var(--color-candy-purple)] rounded-full opacity-30 blur-[60px] pointer-events-none"></div>

          <ChatHeader
            isLoading={isLoading}
            isMuted={isMuted}
            isAutoSpeakEnabled={isAutoSpeakEnabled}
            language={language}
            buddyEmoji={selectedAvatar.emoji}
            onBack={onBack}
            onToggleLanguage={onToggleLanguage}
            onToggleAutoSpeak={toggleAutoSpeak}
            onToggleMute={toggleMute}
            onReset={handleReset}
            onHideChat={() => setIsChatVisible(false)}
            onOpenBadges={() => setIsBadgeGalleryOpen(true)}
            t={t}
          />

          <MessageList
            messages={messages}
            isLoading={isLoading}
            streamingReply={object?.reply}
            showSuggestions={showSuggestions}
            suggestionChips={suggestionChips}
            onSuggestionChipsShuffle={setSuggestionChips}
            onChipClick={handleChipClick}
            thinkingText={t.thinking}
            magicButtonPrompt={t.magic_button_prompt}
          />

          <MessageInput
            inputValue={inputValue}
            isLoading={isLoading}
            isListening={isListening}
            onInputChange={setInputValue}
            onSend={handleSend}
            onToggleListening={isListening ? stopListening : startListening}
            inputRef={inputRef}
            t={t}
          />
        </div>
      )}

      <PreviewPanel
        currentCode={currentCode}
        isLoading={isLoading}
        isChatVisible={isChatVisible}
        onShowChat={() => setIsChatVisible(true)}
        iframeRef={iframeRef}
        t={t}
      />

      <AchievementModal achievement={newlyUnlocked} onDismiss={dismissUnlock} />

      <BadgeGallery
        isOpen={isBadgeGalleryOpen}
        onClose={() => setIsBadgeGalleryOpen(false)}
        unlockedIds={unlockedIds}
        stats={stats}
        selectedAvatar={selectedAvatar}
        unlockedAvatars={unlockedAvatars}
        onSelectAvatar={selectAvatar}
      />
    </div>
  );
}
