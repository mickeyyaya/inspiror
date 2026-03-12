import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useAudio } from "../hooks/useAudio";
import { useVoice, type VoiceLanguage } from "../hooks/useVoice";
import { useAchievements } from "../hooks/useAchievements";
import { useAutoFix } from "../hooks/useAutoFix";
import { useLegacyConversion } from "../hooks/useLegacyConversion";
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

export interface EditorViewProps {
  project: Pick<Project, "id" | "messages" | "currentCode" | "blocks">;
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
      project.messages[0].role === "assistant"
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
  const [suggestionChips, setSuggestionChips] = useState(() =>
    pickRandomChips(language),
  );
  const checksRef = useRef<string[]>([]);

  const isLegacyProject = useRef(project.blocks === undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
  } = useVoice(language, isMuted);
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
        checksRef.current = Array.isArray(finalObj.checks)
          ? (finalObj.checks as string[])
          : [];
        setBlocks(newBlocks);
        setCurrentCode(compileBlocks(newBlocks, checksRef.current));
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

  const { resetAutoFixCount } = useAutoFix({
    isLoading,
    submit,
    playBuzzer,
    language,
    t,
    blocksRef,
    messagesRef,
    recordDebugRef,
    setMessages,
  });

  const { isConverting } = useLegacyConversion({
    project,
    language,
    onBlocksConverted: (convertedBlocks) => {
      setBlocks(convertedBlocks);
      setCurrentCode(compileBlocks(convertedBlocks));
    },
  });

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    stopListening();
    resetAutoFixCount();
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
    resetAutoFixCount();
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
    if (!window.confirm(t.confirm_reset)) {
      return;
    }
    onReset();
    const freshBlocks = DEFAULT_BLOCKS.map((b) => ({ ...b }));
    checksRef.current = [];
    setMessages([withId("assistant", t.greeting)]);
    setBlocks(freshBlocks);
    setCurrentCode(compileBlocks(freshBlocks));
    setInputValue("");
    setSuggestionChips(pickRandomChips(language));
    resetAutoFixCount();
  };

  // Handle block edits from the BlockEditor (param changes, reorder, toggle)
  const handleBlocksChange = useCallback(
    (newBlocks: Block[]) => {
      setBlocks(newBlocks);
      recordRemix();
    },
    [recordRemix],
  );

  // Debounced compile: derive currentCode from blocks to avoid torn state.
  // Skip initial compile for legacy projects (no blocks field) to preserve saved currentCode.
  const compileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isLegacyProject.current) {
      isLegacyProject.current = false;
      return;
    }
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    compileTimerRef.current = setTimeout(() => {
      setCurrentCode(compileBlocks(blocks, checksRef.current));
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
            language={language}
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
        isLoading={isLoading || isConverting}
        isChatVisible={isChatVisible}
        onShowChat={() => setIsChatVisible(true)}
        onLookInside={() => setIsBlockPanelOpen(true)}
        iframeRef={iframeRef}
        codingFacts={codingFacts}
        blockCount={blockCount}
        t={t}
        convertingText={isConverting ? t.converting_blocks : undefined}
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
          t={t}
        />
        <div className="p-3 border-t-2 border-gray-200 flex-shrink-0">
          <button
            onClick={() => setIsBlockPanelOpen(false)}
            className="w-full px-4 py-2 rounded-2xl bg-[#222] text-white font-bold text-sm
              border-2 border-[#222] shadow-[4px_4px_0_rgba(0,0,0,0.2)]
              active:translate-y-[4px] active:shadow-none transition-all"
          >
            {t.block_panel_close}
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
