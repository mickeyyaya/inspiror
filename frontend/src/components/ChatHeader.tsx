import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  Languages,
  MessageSquareQuote,
  Trophy,
} from "lucide-react";
import type { VoiceLanguage } from "../hooks/useVoice";

interface ChatHeaderProps {
  isLoading: boolean;
  isMuted: boolean;
  isAutoSpeakEnabled: boolean;
  language: VoiceLanguage;
  buddyEmoji: string;
  onBack: () => void;
  onToggleLanguage: () => void;
  onToggleAutoSpeak: () => void;
  onToggleMute: () => void;
  onReset: () => void;
  onHideChat: () => void;
  onOpenBadges: () => void;
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
  };
}

export function ChatHeader({
  isLoading,
  isMuted,
  isAutoSpeakEnabled,
  language,
  buddyEmoji,
  onBack,
  onToggleLanguage,
  onToggleAutoSpeak,
  onToggleMute,
  onReset,
  onHideChat,
  onOpenBadges,
  t,
}: ChatHeaderProps) {
  return (
    <div className="bg-[var(--color-candy-blue)] text-[#222] p-4 flex justify-between items-center border-b-4 border-[#222] z-10 shadow-[0_4px_0_#222]">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-white border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          aria-label={t.aria_my_projects}
          data-testid="back-to-catalog"
        >
          <ArrowLeft size={22} className="text-[#222]" strokeWidth={3} />
        </button>
        <span
          className={`text-4xl ${isLoading ? "buddy-avatar-thinking" : "buddy-avatar"}`}
        >
          {buddyEmoji}
        </span>
        <span
          className="text-2xl tracking-wide font-extrabold text-[#222]"
          style={{ textShadow: "2px 2px 0px white" }}
        >
          Builder Buddy
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenBadges}
          className="bg-[var(--color-candy-yellow)] border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          aria-label={t.badge_title}
          data-testid="badge-gallery-btn"
        >
          <Trophy size={20} className="text-[#222]" strokeWidth={2.5} />
        </button>
        <button
          onClick={onToggleLanguage}
          className={`border-2 border-[#222] px-3 py-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center gap-2 font-bold text-sm ${
            language !== "en-US" ? "bg-[var(--color-candy-green)]" : "bg-white"
          }`}
          title={t.switch_language}
        >
          <Languages size={18} strokeWidth={2.5} />
          {language === "zh-TW" ? "TW" : language === "zh-CN" ? "CN" : "EN"}
        </button>
        <button
          onClick={onToggleAutoSpeak}
          className={`border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none ${
            isAutoSpeakEnabled
              ? "bg-[var(--color-candy-purple)] text-white"
              : "bg-white text-[#222]"
          }`}
          aria-label={
            isAutoSpeakEnabled ? t.aria_disable_voice : t.aria_enable_voice
          }
        >
          <MessageSquareQuote size={20} strokeWidth={2.5} />
        </button>
        <button
          onClick={onToggleMute}
          className="bg-white border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          aria-label={isMuted ? t.aria_unmute : t.aria_mute}
          data-testid="mute-toggle"
        >
          {isMuted ? (
            <VolumeX size={20} className="text-[#222]" strokeWidth={2.5} />
          ) : (
            <Volume2 size={20} className="text-[#222]" strokeWidth={2.5} />
          )}
        </button>
        <button
          onClick={onReset}
          className="bg-[var(--color-candy-orange)] border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none hover-wiggle"
          aria-label={t.aria_reset}
        >
          <RotateCcw size={20} className="text-[#222]" strokeWidth={2.5} />
        </button>
        <button
          onClick={onHideChat}
          className="bg-[var(--color-candy-pink)] border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          aria-label={t.aria_hide_chat}
        >
          <X size={20} className="text-[#222]" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
