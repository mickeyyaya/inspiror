import { useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { X, Trophy } from "lucide-react";
import {
  ACHIEVEMENTS,
  BUDDY_AVATARS,
  type BuddyAvatar,
} from "../types/achievements";

interface BadgeGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedIds: string[];
  stats: { builds: number; debugs: number; remixes: number; explores: number };
  selectedAvatar: BuddyAvatar;
  unlockedAvatars: BuddyAvatar[];
  onSelectAvatar: (avatarId: string) => void;
  t: {
    badge_title: string;
    badge_builds: string;
    badge_bugs_fixed: string;
    badge_achievements: string;
    badge_buddy_avatars: string;
    aria_close_gallery: string;
  };
}

export function BadgeGallery({
  isOpen,
  onClose,
  unlockedIds,
  stats,
  selectedAvatar,
  unlockedAvatars,
  onSelectAvatar,
  t,
}: BadgeGalleryProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="badge-gallery"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-gallery-title"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="bg-[#fdfbf7] border-4 border-[#222] rounded-[2rem] p-6 shadow-[8px_8px_0_#222] max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Trophy
              size={24}
              className="text-[var(--color-candy-yellow)]"
              strokeWidth={2.5}
            />
            <h2
              id="badge-gallery-title"
              className="text-2xl font-extrabold text-[#222]"
            >
              {t.badge_title}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="bg-white border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:shadow-none"
            aria-label={t.aria_close_gallery}
          >
            <X size={18} className="text-[#222]" strokeWidth={3} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[var(--color-candy-blue)] border-2 border-[#222] rounded-xl p-3 text-center shadow-[3px_3px_0_#222]">
            <div className="text-2xl font-extrabold text-[#222]">
              {stats.builds}
            </div>
            <div className="text-xs font-bold text-[#222]/70">
              {t.badge_builds}
            </div>
          </div>
          <div className="bg-[var(--color-candy-pink)] border-2 border-[#222] rounded-xl p-3 text-center shadow-[3px_3px_0_#222]">
            <div className="text-2xl font-extrabold text-[#222]">
              {stats.debugs}
            </div>
            <div className="text-xs font-bold text-[#222]/70">
              {t.badge_bugs_fixed}
            </div>
          </div>
        </div>

        {/* Badges */}
        <h3 className="text-sm font-extrabold text-[#222]/60 uppercase tracking-wider mb-3">
          {t.badge_achievements}
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedIds.includes(a.id);
            const isHiddenLocked = a.hidden && !unlocked;
            return (
              <div
                key={a.id}
                className={`border-2 border-[#222] rounded-xl p-3 text-center transition-all ${
                  unlocked
                    ? "bg-white shadow-[3px_3px_0_#222]"
                    : "bg-gray-100 opacity-50"
                }`}
                data-testid={isHiddenLocked ? "hidden-badge" : undefined}
              >
                <div className={`text-3xl mb-1 ${unlocked ? "" : "grayscale"}`}>
                  {isHiddenLocked ? "❓" : a.icon}
                </div>
                <div className="text-xs font-bold text-[#222]">
                  {isHiddenLocked ? "???" : a.title}
                </div>
                <div className="text-[10px] text-gray-500">
                  {isHiddenLocked ? "Keep playing to discover!" : a.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Buddy Avatars */}
        <h3 className="text-sm font-extrabold text-[#222]/60 uppercase tracking-wider mb-3">
          {t.badge_buddy_avatars}
        </h3>
        <div className="flex gap-3 flex-wrap">
          {BUDDY_AVATARS.map((avatar) => {
            const isUnlocked = unlockedAvatars.some((a) => a.id === avatar.id);
            const isSelected = selectedAvatar.id === avatar.id;
            return (
              <button
                key={avatar.id}
                onClick={() => isUnlocked && onSelectAvatar(avatar.id)}
                disabled={!isUnlocked}
                className={`border-3 rounded-xl p-3 text-center transition-all min-w-[70px] ${
                  isSelected
                    ? "bg-[var(--color-candy-yellow)] border-[#222] shadow-[3px_3px_0_#222] scale-110"
                    : isUnlocked
                      ? "bg-white border-[#222] shadow-[2px_2px_0_#222] hover:scale-105 cursor-pointer"
                      : "bg-gray-100 border-gray-300 opacity-40 cursor-not-allowed"
                }`}
                aria-label={
                  isUnlocked
                    ? `Select ${avatar.name}`
                    : `${avatar.name} - ${avatar.requiredBuilds} builds to unlock`
                }
              >
                <div className={`text-3xl ${isUnlocked ? "" : "grayscale"}`}>
                  {avatar.emoji}
                </div>
                <div className="text-[10px] font-bold text-[#222] mt-1">
                  {avatar.name}
                </div>
                {!isUnlocked && (
                  <div className="text-[9px] text-gray-400">
                    {avatar.requiredBuilds} builds
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
