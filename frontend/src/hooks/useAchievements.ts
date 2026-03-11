import { useState, useCallback } from "react";
import {
  ACHIEVEMENTS,
  BUDDY_AVATARS,
  DEFAULT_ACHIEVEMENT_STATE,
  type Achievement,
  type AchievementState,
  type BuddyAvatar,
} from "../types/achievements";

const STORAGE_KEY = "inspiror-achievements";
const AVATAR_KEY = "inspiror-selected-avatar";

function loadState(): AchievementState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Corrupted data, start fresh
  }
  return { ...DEFAULT_ACHIEVEMENT_STATE, stats: { ...DEFAULT_ACHIEVEMENT_STATE.stats } };
}

function saveState(state: AchievementState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSelectedAvatar(): string {
  return localStorage.getItem(AVATAR_KEY) || "dog";
}

export function useAchievements() {
  const [state, setState] = useState<AchievementState>(loadState);
  const [selectedAvatarId, setSelectedAvatarId] = useState(loadSelectedAvatar);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  const incrementStat = useCallback(
    (type: keyof AchievementState["stats"]) => {
      setState((prev) => {
        const newStats = { ...prev.stats, [type]: prev.stats[type] + 1 };
        const newUnlocked = [...prev.unlockedIds];
        let justUnlocked: Achievement | null = null;

        for (const achievement of ACHIEVEMENTS) {
          if (
            achievement.type === type &&
            newStats[type] >= achievement.threshold &&
            !newUnlocked.includes(achievement.id)
          ) {
            newUnlocked.push(achievement.id);
            justUnlocked = achievement;
          }
        }

        const newState: AchievementState = {
          unlockedIds: newUnlocked,
          stats: newStats,
        };
        saveState(newState);

        if (justUnlocked) {
          // Use setTimeout to avoid setState during render
          setTimeout(() => setNewlyUnlocked(justUnlocked), 0);
        }

        return newState;
      });
    },
    [],
  );

  const recordBuild = useCallback(() => incrementStat("builds"), [incrementStat]);
  const recordDebug = useCallback(() => incrementStat("debugs"), [incrementStat]);
  const recordRemix = useCallback(() => incrementStat("remixes"), [incrementStat]);
  const recordExplore = useCallback(() => incrementStat("explores"), [incrementStat]);

  const dismissUnlock = useCallback(() => setNewlyUnlocked(null), []);

  const selectAvatar = useCallback((avatarId: string) => {
    const avatar = BUDDY_AVATARS.find((a) => a.id === avatarId);
    if (avatar && state.stats.builds >= avatar.requiredBuilds) {
      setSelectedAvatarId(avatarId);
      localStorage.setItem(AVATAR_KEY, avatarId);
    }
  }, [state.stats.builds]);

  const selectedAvatar =
    BUDDY_AVATARS.find((a) => a.id === selectedAvatarId) || BUDDY_AVATARS[0];

  const unlockedAvatars = BUDDY_AVATARS.filter(
    (a) => state.stats.builds >= a.requiredBuilds,
  );

  return {
    achievements: ACHIEVEMENTS,
    unlockedIds: state.unlockedIds,
    stats: state.stats,
    newlyUnlocked,
    dismissUnlock,
    recordBuild,
    recordDebug,
    recordRemix,
    recordExplore,
    selectedAvatar,
    unlockedAvatars,
    selectAvatar,
  };
}
