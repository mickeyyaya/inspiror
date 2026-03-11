import type { Achievement } from "../types/achievements";

interface AchievementModalProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementModal({
  achievement,
  onDismiss,
}: AchievementModalProps) {
  if (!achievement) return null;

  return (
    <div
      data-testid="achievement-modal"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div
        className="bg-white border-4 border-[#222] rounded-[2rem] p-8 shadow-[8px_8px_0_#222] text-center max-w-sm mx-4 animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4 drop-shadow-lg">{achievement.icon}</div>
        <h2 className="text-2xl font-extrabold text-[#222] mb-2">
          Achievement Unlocked!
        </h2>
        <h3 className="text-xl font-bold text-[var(--color-candy-purple)] mb-2">
          {achievement.title}
        </h3>
        <p className="text-gray-600 font-medium mb-6">
          {achievement.description}
        </p>
        <button
          onClick={onDismiss}
          className="bg-[var(--color-candy-green)] text-[#222] border-4 border-[#222] px-6 py-3 rounded-full font-extrabold shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all btn-squish"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
