import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useAudio } from "../hooks/useAudio";
import { useVoice, type VoiceLanguage } from "../hooks/useVoice";
import { useAchievements } from "../hooks/useAchievements";
import { translations } from "../i18n/translations";
import type { ChatMessage, Project } from "../types/project";
import type { Block } from "../types/block";
import { generationSchema, pickRandomChips, withId } from "../constants";
import { getCodingFacts } from "../constants/codingFacts";
import { compileBlocks } from "../compiler/compileBlocks";
import { DEFAULT_BLOCKS } from "../constants/defaultBlocks";
import { ConfettiBurst } from "./ConfettiBurst";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { PreviewPanel } from "./PreviewPanel";
import { AchievementModal } from "./AchievementModal";
import { BadgeGallery } from "./BadgeGallery";
import { BlockEditor } from "./blocks/BlockEditor";

const COMPILE_DEBOUNCE_MS = 150;
const SAFE_BLOCK_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

export interface EditorViewProps {
  project: Pick<Project, "id" | "messages" | "currentCode" | "blocks">;
  defaultCode: string;
  onUpdate: (
    projectId: string,
    updates: Partial<Pick<Project, "messages" | "currentCode" | "blocks">>,
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
  const [blocks, setBlocks] = useState<Block[]>(
    () => project.blocks ?? DEFAULT_BLOCKS.map((b) => ({ ...b })),
  );
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isBlockPanelOpen, setIsBlockPanelOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [suggestionChips, setSuggestionChips] = useState(pickRandomChips);

  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoFixCountRef = useRef(0);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef(messages);
  const blocksRef = useRef(blocks);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

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
    unlockedIds,
    stats,
    newlyUnlocked,
    dismissUnlock,
    recordBuild,
    recordDebug,
    recordExplore,
    recordRemix,
    selectedAvatar,
    unlockedAvatars,
    selectAvatar,
  } = useAchievements();
  const [isBadgeGalleryOpen, setIsBadgeGalleryOpen] = useState(false);
  const codingFacts = useMemo(() => getCodingFacts(language), [language]);
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
      if (
        finalObj?.blocks &&
        Array.isArray(finalObj.blocks) &&
        finalObj.blocks.length > 0
      ) {
        const newBlocks = finalObj.blocks as Block[];
        setBlocks(newBlocks);
        setCurrentCode(compileBlocks(newBlocks));
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
    submit({
      messages: newMessages,
      currentBlocks: JSON.stringify(blocksRef.current),
      language,
    });
  };

  const handleChipClick = (label: string) => {
    if (isLoading) return;
    stopListening();
    autoFixCountRef.current = 0;
    playChipClick();
    recordExplore();
    const newMessages: ChatMessage[] = [...messages, withId("user", label)];
    setMessages(newMessages);
    submit({
      messages: newMessages,
      currentBlocks: JSON.stringify(blocksRef.current),
      language,
    });
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
    const freshBlocks = DEFAULT_BLOCKS.map((b) => ({ ...b }));
    setMessages([withId("assistant", t.greeting)]);
    setBlocks(freshBlocks);
    setCurrentCode(compileBlocks(freshBlocks));
    setInputValue("");
    setSuggestionChips(pickRandomChips());
    autoFixCountRef.current = 0;
  };

  // Handle block edits from the BlockEditor (param changes, reorder, toggle)
  const handleBlocksChange = useCallback(
    (newBlocks: Block[]) => {
      setBlocks(newBlocks);
      recordRemix();
    },
    [recordRemix],
  );

  // Debounced compile: derive currentCode from blocks to avoid torn state
  const compileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    compileTimerRef.current = setTimeout(() => {
      setCurrentCode(compileBlocks(blocks));
      compileTimerRef.current = null;
    }, COMPILE_DEBOUNCE_MS);
    return () => {
      if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    };
  }, [blocks]);

  const showSuggestions =
    messages.length === 1 && messages[0]?.role === "assistant" && !isLoading;

  const projectId = project.id;

  useEffect(() => {
    onUpdate(projectId, { messages });
  }, [messages, onUpdate, projectId]);

  useEffect(() => {
    onUpdate(projectId, { currentCode, blocks });
  }, [currentCode, blocks, onUpdate, projectId]);

  // Error handler for iframe errors — includes blockId awareness
  useEffect(() => {
    const handleIframeError = (event: MessageEvent) => {
      const allowed = [window.location.origin, "null", ""];
      if (!allowed.includes(event.origin)) return;
      if (event.data?.type === "iframe-error") {
        const rawMsg = String(event.data.message || "Unknown error");
        const errorMsg = rawMsg.slice(0, 200);
        const rawBlockId = event.data.blockId
          ? String(event.data.blockId)
          : null;
        const blockId =
          rawBlockId && SAFE_BLOCK_ID_RE.test(rawBlockId) ? rawBlockId : null;
        console.error(
          `[Sandbox Error]${blockId ? ` Block: ${blockId}` : ""} ${errorMsg}`,
        );

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
          `The block${blockId ? ` "${blockId}"` : ""} caused this error: ${errorMsg}. Please fix it.`,
        );
        const updatedMessages = [
          ...messagesRef.current,
          oopsMessage,
          errorContext,
        ];
        setMessages(updatedMessages);
        submit({
          messages: updatedMessages,
          currentBlocks: JSON.stringify(blocksRef.current),
          language,
        });
      }
    };

    window.addEventListener("message", handleIframeError);
    return () => window.removeEventListener("message", handleIframeError);
  }, [isLoading, submit, playBuzzer, language, t]);

  const blockCount = blocks.filter((b) => b.enabled).length;

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
        onLookInside={() => setIsBlockPanelOpen(true)}
        iframeRef={iframeRef}
        codingFacts={codingFacts}
        blockCount={blockCount}
        t={t}
      />

      {/* Block Editor Panel (replaces CodePanel for block-mode projects) */}
      <div
        data-testid="block-panel"
        aria-hidden={!isBlockPanelOpen}
        className={`fixed top-0 right-0 h-full z-40 flex flex-col
          w-full sm:w-[400px]
          bg-[#fdfbf7]
          border-l-4 border-[#222]
          shadow-[-8px_0_0_#222]
          transition-transform duration-300 ease-in-out
          ${isBlockPanelOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <BlockEditor
          blocks={blocks}
          onBlocksChange={handleBlocksChange}
          isLoading={isLoading}
        />
        <div className="p-3 border-t-2 border-gray-200 flex-shrink-0">
          <button
            onClick={() => setIsBlockPanelOpen(false)}
            className="w-full px-4 py-2 rounded-2xl bg-[#222] text-white font-bold text-sm
              border-2 border-[#222] shadow-[4px_4px_0_rgba(0,0,0,0.2)]
              active:translate-y-[4px] active:shadow-none transition-all"
          >
            Close
          </button>
        </div>
      </div>

      <AchievementModal
        achievement={newlyUnlocked}
        onDismiss={dismissUnlock}
        t={t}
      />

      <BadgeGallery
        isOpen={isBadgeGalleryOpen}
        onClose={() => setIsBadgeGalleryOpen(false)}
        unlockedIds={unlockedIds}
        stats={stats}
        selectedAvatar={selectedAvatar}
        unlockedAvatars={unlockedAvatars}
        onSelectAvatar={selectAvatar}
        t={t}
      />
    </div>
  );
}
