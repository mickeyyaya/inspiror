import { useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { Achievement } from "../types/achievements";

interface AchievementModalProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  t: {
    achievement_unlocked: string;
    achievement_awesome: string;
  };
}

export function AchievementModal({
  achievement,
  onDismiss,
  t,
}: AchievementModalProps) {
  const dismissBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, achievement !== null);

  useEffect(() => {
    if (!achievement) return;
    dismissBtnRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div
      data-testid="achievement-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div
        ref={dialogRef}
        className="bg-white border-4 border-[#222] rounded-[2rem] p-8 shadow-[8px_8px_0_#222] text-center max-w-sm mx-4 animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4 drop-shadow-lg">{achievement.icon}</div>
        <h2
          id="achievement-title"
          className="text-2xl font-extrabold text-[#222] mb-2"
        >
          {t.achievement_unlocked}
        </h2>
        <h3 className="text-xl font-bold text-[var(--color-candy-purple)] mb-2">
          {achievement.title}
        </h3>
        <p className="text-gray-600 font-medium mb-6">
          {achievement.description}
        </p>
        <button
          ref={dismissBtnRef}
          onClick={onDismiss}
          className="bg-[var(--color-candy-green)] text-[#222] border-4 border-[#222] px-6 py-3 rounded-full font-extrabold shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all btn-squish"
        >
          {t.achievement_awesome}
        </button>
      </div>
    </div>
  );
}
