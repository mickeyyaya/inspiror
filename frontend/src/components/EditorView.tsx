import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useAudio } from "../hooks/useAudio";
import { useVoice, type VoiceLanguage } from "../hooks/useVoice";
import { useAchievements } from "../hooks/useAchievements";
import { useAutoFix } from "../hooks/useAutoFix";
import { useLegacyConversion } from "../hooks/useLegacyConversion";
import { useBuddyEmotion } from "../hooks/useBuddyEmotion";
import { useCompileBlocks } from "../hooks/useCompileBlocks";
import { usePersistProject } from "../hooks/usePersistProject";
import { translations } from "../i18n/translations";
import type { ChatMessage, Project } from "../types/project";
import type { Block } from "../types/block";
import {
  generationSchema,
  pickRandomChips,
  pickRandomScaffolds,
  withId,
} from "../constants";
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
import { BlockPanelDrawer } from "./BlockPanelDrawer";
import { OnboardingTooltip } from "./OnboardingTooltip";
import { ConfirmDialog } from "./ConfirmDialog";
import { SessionRecap } from "./SessionRecap";
import { ThemeSelector } from "./ThemeSelector";
import { useTheme } from "../hooks/useTheme";
import { useOnboarding } from "../hooks/useOnboarding";
import { getPersonalizedGreeting } from "../utils/greetingTiers";
import { useStreak } from "../hooks/useStreak";

if (!import.meta.env.VITE_API_URL && import.meta.env.MODE !== "development") {
  console.warn(
    "[Inspiror] VITE_API_URL is not set. API calls will fall back to localhost:3001 which will fail in production.",
  );
}

export interface EditorViewProps {
  project: Pick<
    Project,
    "id" | "title" | "messages" | "currentCode" | "blocks"
  >;
  onUpdate: (
    projectId: string,
    updates: Partial<Pick<Project, "messages" | "currentCode" | "blocks">>,
  ) => void;
  onReset: () => void;
  onBack: () => void;
  language: VoiceLanguage;
  onToggleLanguage: () => void;
  onBuild?: () => void;
  initialPrompt?: string;
}

export function EditorView({
  project,
  onUpdate,
  onReset,
  onBack,
  language,
  onToggleLanguage,
  onBuild,
  initialPrompt,
}: EditorViewProps) {
  const t = translations[language];
  const { streakDays } = useStreak();
  const {
    unlockedIds,
    stats,
    newlyUnlocked,
    dismissUnlock,
    recordBuild,
    recordDebug,
    recordExplore,
    recordRemix,
    recordDescribe,
    recordIterate,
    recordTip,
    selectedAvatar,
    unlockedAvatars,
    selectAvatar,
  } = useAchievements();
  const personalizedGreeting = useMemo(
    () =>
      getPersonalizedGreeting(
        stats.builds,
        streakDays,
        selectedAvatar,
        language,
      ),
    [stats.builds, streakDays, selectedAvatar, language],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (
      project.messages.length === 1 &&
      project.messages[0].role === "assistant"
    ) {
      return [withId("assistant", personalizedGreeting)];
    }
    return project.messages;
  });
  const [inputValue, setInputValue] = useState(initialPrompt ?? "");
  const [currentCode, setCurrentCode] = useState(project.currentCode);
  const [blocks, setBlocks] = useState<Block[]>(
    () => project.blocks ?? DEFAULT_BLOCKS.map((b) => ({ ...b })),
  );
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isBlockPanelOpen, setIsBlockPanelOpen] = useState(false);
  const closeBlockPanel = useCallback(() => setIsBlockPanelOpen(false), []);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const sessionBuildsRef = useRef(0);
  const sessionTipsRef = useRef(0);
  const sessionStartMessagesRef = useRef(messages.length);
  const { buddyEmotion, triggerEmotion } = useBuddyEmotion(messages);
  const [suggestionChips, setSuggestionChips] = useState(() =>
    pickRandomChips(language),
  );
  const [scaffoldChips, setScaffoldChips] = useState(() =>
    pickRandomScaffolds(language),
  );
  const checksRef = useRef<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const { themeId, setThemeId } = useTheme();
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isBadgeGalleryOpen, setIsBadgeGalleryOpen] = useState(false);
  const {
    step: onboardingStep,
    isActive: isOnboardingActive,
    advanceStep: advanceOnboarding,
    skipAll: skipOnboarding,
  } = useOnboarding();
  const codingFacts = useMemo(() => getCodingFacts(language), [language]);
  const recordBuildRef = useRef(recordBuild);
  const recordDebugRef = useRef(recordDebug);
  const recordIterateRef = useRef(recordIterate);
  const recordTipRef = useRef(recordTip);
  const playChimeRef = useRef(playChime);
  const speakRef = useRef(speak);

  useEffect(() => {
    recordBuildRef.current = recordBuild;
  }, [recordBuild]);

  useEffect(() => {
    recordDebugRef.current = recordDebug;
  }, [recordDebug]);

  useEffect(() => {
    recordIterateRef.current = recordIterate;
  }, [recordIterate]);

  useEffect(() => {
    recordTipRef.current = recordTip;
  }, [recordTip]);

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
        const newMessages: ReturnType<typeof withId>[] = [
          withId("assistant", finalObj.reply as string),
        ];
        if (finalObj.tip && typeof finalObj.tip === "string") {
          newMessages.push(withId("assistant", finalObj.tip as string, "tip"));
          recordTipRef.current();
        }
        setMessages((prev) => [...prev, ...newMessages]);
        speakRef.current(finalObj.reply as string);
      }
      if (
        finalObj?.blocks &&
        Array.isArray(finalObj.blocks) &&
        finalObj.blocks.length > 0
      ) {
        const newBlocks = (finalObj.blocks as Block[]).map((b) => ({
          ...b,
          origin: b.origin ?? ("ai" as const),
        }));
        checksRef.current = Array.isArray(finalObj.checks)
          ? (finalObj.checks as string[])
          : [];
        setBlocks(newBlocks);
        setCurrentCode(compileBlocks(newBlocks, checksRef.current));
      }
      playChimeRef.current();
      recordBuildRef.current();
      sessionBuildsRef.current += 1;
      if (finalObj?.tip) {
        sessionTipsRef.current += 1;
      }
      // Track iteration: if there are already assistant messages, this is an iteration
      if (messagesRef.current.some((m) => m.role === "assistant")) {
        recordIterateRef.current();
      }
      onBuild?.();
      // Show session recap every 3rd build
      if (sessionBuildsRef.current > 0 && sessionBuildsRef.current % 3 === 0) {
        setTimeout(() => setShowRecap(true), 3000);
      }

      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
      setShowConfetti(true);
      confettiTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        confettiTimerRef.current = null;
      }, 2500);
      triggerEmotion("proud", 2500);

      if (finalObj?.isComplete === false && finalObj?.nextPhasePlan) {
        const plan = finalObj.nextPhasePlan;
        const msgStr = `Continuing to next phase: ${plan}`;
        autoResumeTimerRef.current = setTimeout(() => {
          autoResumeTimerRef.current = null;
          const nextMessages: ChatMessage[] = [
            ...messagesRef.current,
            withId("user", msgStr)
          ];
          setMessages(nextMessages);
          submit({
            messages: nextMessages,
            currentBlocks: JSON.stringify(blocksRef.current),
            language,
            avatarId: selectedAvatar.id,
          });
        }, 8000);
      }
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
    avatarId: selectedAvatar.id,
    t,
    blocksRef,
    messagesRef,
    recordDebugRef,
    setMessages,
    onError: useCallback(
      () => triggerEmotion("worried", 2000),
      [triggerEmotion],
    ),
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
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
    stopListening();
    resetAutoFixCount();
    playPop();
    if (inputValue.trim().length >= 20) {
      recordDescribe();
    }
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
      avatarId: selectedAvatar.id,
    });
  };

  const handleChipClick = (label: string) => {
    if (isLoading) return;
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
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
      avatarId: selectedAvatar.id,
    });
  };

  const handleScaffoldClick = (template: string) => {
    if (isLoading) return;
    playChipClick();
    setInputValue(template);
    inputRef.current?.focus();
  };

  const showScaffolds = stats.describes < 5;

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleResetRequest = () => {
    setIsResetConfirmOpen(true);
  };

  const handleResetConfirm = () => {
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
    setIsResetConfirmOpen(false);
    onReset();
    const freshBlocks = DEFAULT_BLOCKS.map((b) => ({ ...b }));
    checksRef.current = [];
    setMessages([withId("assistant", personalizedGreeting)]);
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

  useCompileBlocks({
    blocks,
    checksRef,
    isLegacyProject: project.blocks === undefined,
    setCurrentCode,
  });

  const showSuggestions =
    messages.length === 1 && messages[0]?.role === "assistant" && !isLoading;

  usePersistProject({
    projectId: project.id,
    messages,
    currentCode,
    blocks,
    onUpdate,
  });

  const blockCount = blocks.filter((b) => b.enabled).length;

  return (
    <div className="w-screen h-dvh bg-transparent flex font-sans overflow-hidden">
      <ConfettiBurst show={showConfetti} />

      {isChatVisible && (
        <div
          className="h-full w-full sm:w-[26rem] lg:w-[30rem] flex-shrink-0 bg-transparent border-r-[6px] border-[#222] flex flex-col z-20 relative shadow-[8px_0px_0px_rgba(0,0,0,0.1)]"
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
            emotion={buddyEmotion}
            onBack={onBack}
            onToggleLanguage={onToggleLanguage}
            onToggleAutoSpeak={toggleAutoSpeak}
            onToggleMute={toggleMute}
            onReset={handleResetRequest}
            onHideChat={() => setIsChatVisible(false)}
            onOpenBadges={() => setIsBadgeGalleryOpen(true)}
            onOpenThemes={() => setIsThemeSelectorOpen(true)}
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
            moreIdeasText={t.more_ideas}
            ariaShuffleLabel={t.aria_shuffle}
            buddyTipLabel={t.buddy_tip_label}
            scaffoldChips={showScaffolds ? scaffoldChips : []}
            onScaffoldClick={handleScaffoldClick}
            onScaffoldShuffle={setScaffoldChips}
            scaffoldHint={t.scaffold_hint}
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
        projectTitle={project.title}
        t={t}
        convertingText={isConverting ? t.converting_blocks : undefined}
      />

      <BlockPanelDrawer
        isOpen={isBlockPanelOpen}
        onClose={closeBlockPanel}
        blocks={blocks}
        onBlocksChange={handleBlocksChange}
        isLoading={isLoading}
        t={t}
      />

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

      <OnboardingTooltip
        step={onboardingStep}
        isActive={isOnboardingActive}
        onAdvance={advanceOnboarding}
        onSkip={skipOnboarding}
        t={t}
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        message={t.confirm_reset}
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetConfirmOpen(false)}
        confirmLabel={t.confirm_ok}
        cancelLabel={t.confirm_cancel}
      />

      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
        currentThemeId={themeId}
        onSelectTheme={setThemeId}
        t={t}
      />

      <SessionRecap
        isOpen={showRecap}
        onDismiss={() => setShowRecap(false)}
        blocksUsed={blocks.filter((b) => b.enabled).length}
        messagesExchanged={messages.length - sessionStartMessagesRef.current}
        buildsThisSession={sessionBuildsRef.current}
        tipsEarned={sessionTipsRef.current}
        blockOrigins={{
          ai: blocks.filter((b) => b.origin === "ai").length,
          template: blocks.filter((b) => b.origin === "template").length,
          remix: blocks.filter((b) => b.origin === "remix").length,
        }}
        buddyEmoji={selectedAvatar.emoji}
        buddyName={selectedAvatar.name}
        t={t}
      />
    </div>
  );
}
