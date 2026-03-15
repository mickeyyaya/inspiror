import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  Languages,
  MessageSquareQuote,
  Trophy,
  Palette,
} from "lucide-react";
import type { VoiceLanguage } from "../hooks/useVoice";

export type BuddyEmotion =
  | "idle"
  | "thinking"
  | "proud"
  | "worried"
  | "curious";

const EMOTION_OVERLAY: Record<BuddyEmotion, string | null> = {
  idle: null,
  thinking: null,
  proud: "⭐",
  worried: "💦",
  curious: "❓",
};

const EMOTION_CLASS: Record<BuddyEmotion, string> = {
  idle: "buddy-avatar",
  thinking: "buddy-avatar-thinking",
  proud: "buddy-avatar-proud",
  worried: "buddy-avatar-worried",
  curious: "buddy-avatar-curious",
};

interface ChatHeaderProps {
  isLoading: boolean;
  isMuted: boolean;
  isAutoSpeakEnabled: boolean;
  language: VoiceLanguage;
  buddyEmoji: string;
  emotion?: BuddyEmotion;
  onBack: () => void;
  onToggleLanguage: () => void;
  onToggleAutoSpeak: () => void;
  onToggleMute: () => void;
  onReset: () => void;
  onHideChat: () => void;
  onOpenBadges: () => void;
  onOpenThemes: () => void;
  isClassroom?: boolean;
  classroomLabel?: string;
  classroomEmoji?: string;
  t: {
    switch_language: string;
    aria_my_projects: string;
    aria_disable_voice: string;
    aria_enable_voice: string;
    aria_mute: string;
    aria_unmute: string;
    aria_reset: string;
    aria_hide_chat: string;
    badge_title: string;
    buddy_name: string;
    ai_disclosure?: string;
  };
}

export function ChatHeader({
  isLoading,
  isMuted,
  isAutoSpeakEnabled,
  language,
  buddyEmoji,
  emotion = "idle",
  onBack,
  onToggleLanguage,
  onToggleAutoSpeak,
  onToggleMute,
  onReset,
  onHideChat,
  onOpenBadges,
  onOpenThemes,
  isClassroom = false,
  classroomLabel,
  classroomEmoji,
  t,
}: ChatHeaderProps) {
  const resolvedEmotion: BuddyEmotion = isLoading ? "thinking" : emotion;
  const overlayEmoji = EMOTION_OVERLAY[resolvedEmotion];

  return (
    <div className="bg-[var(--color-candy-blue)] text-[#222] p-4 flex justify-between items-center border-b-4 border-[#222] z-10 shadow-[0_4px_0_#222]">
      <div className="flex items-center gap-3 min-w-0">
        {isClassroom ? (
          <div
            className="bg-[var(--color-candy-yellow)] border-2 border-[#222] px-3 py-1.5 rounded-full font-bold text-sm shadow-[2px_2px_0_#222] flex items-center gap-1.5"
            data-testid="classroom-badge"
          >
            <span>{classroomEmoji}</span>
            <span>{classroomLabel}</span>
          </div>
        ) : (
          <button
            onClick={onBack}
            className="bg-white border-2 border-[#222] p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex-shrink-0"
            aria-label={t.aria_my_projects}
            data-testid="back-to-catalog"
          >
            <ArrowLeft size={18} className="text-[#222]" strokeWidth={3} />
          </button>
        )}
        <span
          className="relative inline-block flex-shrink-0"
          data-testid="buddy-avatar-wrapper"
        >
          <span
            className={`text-3xl ${EMOTION_CLASS[resolvedEmotion]}`}
            data-testid="buddy-avatar"
            data-emotion={resolvedEmotion}
          >
            {buddyEmoji}
          </span>
          {overlayEmoji !== null && (
            <span
              className="absolute -top-1.5 -right-1.5 text-sm leading-none"
              aria-hidden="true"
              data-testid="buddy-emotion-overlay"
            >
              {overlayEmoji}
            </span>
          )}
        </span>
        <span
          className="text-lg tracking-wide font-extrabold text-[#222] truncate"
          style={{ textShadow: "1px 1px 0px white" }}
        >
          {t.buddy_name}
        </span>
        {t.ai_disclosure && (
          <span className="text-[10px] text-[#222]/60 font-bold truncate">
            {t.ai_disclosure}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onOpenThemes}
          className="bg-[var(--color-candy-blue)] border-2 border-[#222] p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          title="Change Theme"
          data-testid="theme-selector-btn"
        >
          <Palette size={16} className="text-[#222]" strokeWidth={2.5} />
        </button>
        <button
          onClick={onOpenBadges}
          className="bg-[var(--color-candy-yellow)] border-2 border-[#222] p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          aria-label={t.badge_title}
          data-testid="badge-gallery-btn"
        >
          <Trophy size={16} className="text-[#222]" strokeWidth={2.5} />
        </button>
        <button
          onClick={onToggleLanguage}
          className={`border-2 border-[#222] px-2 py-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center gap-1 font-bold text-xs ${
            language !== "en-US" ? "bg-[var(--color-candy-green)]" : "bg-white"
          }`}
          title={t.switch_language}
        >
          <Languages size={14} strokeWidth={2.5} />
          {language === "zh-TW" ? "TW" : language === "zh-CN" ? "CN" : "EN"}
        </button>
        <button
          onClick={onToggleAutoSpeak}
          className={`border-2 border-[#222] p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none ${
            isAutoSpeakEnabled
              ? "bg-[var(--color-candy-purple)] text-white"
              : "bg-white text-[#222]"
          }`}
          aria-label={
            isAutoSpeakEnabled ? t.aria_disable_voice : t.aria_enable_voice
          }
        >
          <MessageSquareQuote size={16} strokeWidth={2.5} />
        </button>
        <button
          onClick={onToggleMute}
          className="bg-white border-2 border-[#222] p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          aria-label={isMuted ? t.aria_unmute : t.aria_mute}
          data-testid="mute-toggle"
        >
          {isMuted ? (
            <VolumeX size={16} className="text-[#222]" strokeWidth={2.5} />
          ) : (
            <Volume2 size={16} className="text-[#222]" strokeWidth={2.5} />
          )}
        </button>
        <button
          onClick={onReset}
          className="bg-[var(--color-candy-orange)] border-2 border-[#222] p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none hover-wiggle"
          aria-label={t.aria_reset}
        >
          <RotateCcw size={16} className="text-[#222]" strokeWidth={2.5} />
        </button>
        <button
          onClick={onHideChat}
          className="bg-[var(--color-candy-pink)] border-2 border-[#222] p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          aria-label={t.aria_hide_chat}
        >
          <X size={16} className="text-[#222]" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
