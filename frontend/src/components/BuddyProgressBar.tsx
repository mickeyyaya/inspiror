import { BUDDY_AVATARS } from "../types/achievements";
import type { TranslationKeys } from "../i18n/translations";

interface BuddyProgressBarProps {
  builds: number;
  t: TranslationKeys;
}

export function BuddyProgressBar({ builds, t }: BuddyProgressBarProps) {
  const nextAvatar = BUDDY_AVATARS.find((a) => a.requiredBuilds > builds);

  if (!nextAvatar) {
    return (
      <div
        className="mt-3 bg-white/80 border-4 border-[#222] rounded-[1.5rem] p-4 shadow-[6px_6px_0_#222]"
        data-testid="buddy-progress-bar"
      >
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-candy-green)] mb-1">
          {t.progress_all_unlocked}
        </p>
        <div className="w-full h-5 rounded-full bg-[var(--color-candy-green)] border-[3px] border-[#222] overflow-hidden">
          <div className="h-full bg-[var(--color-candy-yellow)] rounded-full w-full" />
        </div>
      </div>
    );
  }

  const prevThreshold =
    [...BUDDY_AVATARS].reverse().find((a) => a.requiredBuilds <= builds)
      ?.requiredBuilds ?? 0;
  const range = nextAvatar.requiredBuilds - prevThreshold;
  const progress = builds - prevThreshold;
  const pct =
    range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 0;
  const remaining = nextAvatar.requiredBuilds - builds;

  return (
    <div
      className="mt-3 bg-white/80 border-4 border-[#222] rounded-[1.5rem] p-4 shadow-[6px_6px_0_#222]"
      data-testid="buddy-progress-bar"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#7c3aed]">
          {t.progress_next_buddy}
        </p>
        <span className="text-sm font-extrabold">
          {nextAvatar.emoji} {nextAvatar.name}
        </span>
      </div>
      <div className="w-full h-5 rounded-full bg-gray-200 border-[3px] border-[#222] overflow-hidden">
        <div
          className="h-full bg-[var(--color-candy-purple)] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs font-bold text-gray-500 mt-1">
        {remaining} {t.progress_builds_to_go}
      </p>
    </div>
  );
}
