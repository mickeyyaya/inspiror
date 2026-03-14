import { Zap, Check } from "lucide-react";
import type { DailyChallenge } from "../constants/dailyChallenges";
import type { Language, TranslationKeys } from "../i18n/translations";

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  isCompleted: boolean;
  language: Language;
  onAccept: (prompt: string) => void;
  t: TranslationKeys;
}

const DIFFICULTY_COLORS = {
  easy: "bg-[var(--color-candy-green)]",
  medium: "bg-[var(--color-candy-yellow)]",
  hard: "bg-[var(--color-candy-orange)]",
};

const DIFFICULTY_LABELS: Record<string, Record<Language, string>> = {
  easy: { "en-US": "Easy", "zh-TW": "簡單", "zh-CN": "简单" },
  medium: { "en-US": "Medium", "zh-TW": "中等", "zh-CN": "中等" },
  hard: { "en-US": "Hard", "zh-TW": "困難", "zh-CN": "困难" },
};

export function DailyChallengeCard({
  challenge,
  isCompleted,
  language,
  onAccept,
  t,
}: DailyChallengeCardProps) {
  return (
    <div
      className={`relative bg-gradient-to-br from-[var(--color-candy-purple)] to-[var(--color-candy-pink)] border-4 border-[#222] rounded-[2rem] shadow-[6px_6px_0_#222] p-5 mb-6 ${
        isCompleted ? "opacity-75" : ""
      }`}
      data-testid="daily-challenge-card"
    >
      <div className="flex items-start gap-4">
        <span className="text-5xl">{challenge.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={18} strokeWidth={3} className="text-[#222]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#222]">
              {t.daily_challenge}
            </span>
            <span
              className={`${DIFFICULTY_COLORS[challenge.difficulty]} text-[#222] text-xs font-bold px-2 py-0.5 rounded-full border-2 border-[#222]`}
            >
              {DIFFICULTY_LABELS[challenge.difficulty][language]}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#222] mb-1">
            {challenge.title[language]}
          </h3>
          <p className="text-sm font-bold text-[#222]/80 mb-3">
            {challenge.prompt[language]}
          </p>
          <button
            onClick={() => onAccept(challenge.prompt[language])}
            disabled={isCompleted}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-3 border-[#222] font-extrabold text-sm shadow-[3px_3px_0_#222] active:translate-y-[3px] active:shadow-none transition-all ${
              isCompleted
                ? "bg-gray-200 text-gray-500 cursor-default"
                : "bg-white text-[#222] hover-wiggle"
            }`}
            data-testid="accept-challenge-btn"
          >
            {isCompleted ? (
              <>
                <Check size={16} strokeWidth={3} />
                {t.daily_completed}
              </>
            ) : (
              <>
                <Zap size={16} strokeWidth={3} />
                {t.daily_accept}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
