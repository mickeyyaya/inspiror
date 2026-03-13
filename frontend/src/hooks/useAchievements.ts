import { useState, useCallback, useRef } from "react";
import {
  ACHIEVEMENTS,
  BUDDY_AVATARS,
  DEFAULT_ACHIEVEMENT_STATE,
  type Achievement,
  type AchievementState,
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
  return {
    ...DEFAULT_ACHIEVEMENT_STATE,
    stats: { ...DEFAULT_ACHIEVEMENT_STATE.stats },
  };
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

  const pendingUnlocksRef = useRef<Achievement[]>([]);

  const showNextUnlock = useCallback(() => {
    const next = pendingUnlocksRef.current.shift();
    setNewlyUnlocked(next ?? null);
  }, []);

  const incrementStat = useCallback(
    (type: keyof AchievementState["stats"]) => {
      setState((prev) => {
        const newStats = { ...prev.stats, [type]: prev.stats[type] + 1 };
        const newUnlocked = [...prev.unlockedIds];
        const justUnlocked: Achievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
          if (
            achievement.type === type &&
            newStats[type] >= achievement.threshold &&
            !newUnlocked.includes(achievement.id)
          ) {
            newUnlocked.push(achievement.id);
            justUnlocked.push(achievement);
          }
        }

        const newState: AchievementState = {
          unlockedIds: newUnlocked,
          stats: newStats,
        };
        saveState(newState);

        if (justUnlocked.length > 0) {
          pendingUnlocksRef.current.push(...justUnlocked);
          // Show the first unlock; subsequent ones shown via dismissUnlock
          setTimeout(() => showNextUnlock(), 0);
        }

        return newState;
      });
    },
    [showNextUnlock],
  );

  const recordBuild = useCallback(
    () => incrementStat("builds"),
    [incrementStat],
  );
  const recordDebug = useCallback(
    () => incrementStat("debugs"),
    [incrementStat],
  );
  const recordRemix = useCallback(
    () => incrementStat("remixes"),
    [incrementStat],
  );
  const recordExplore = useCallback(
    () => incrementStat("explores"),
    [incrementStat],
  );

  const dismissUnlock = useCallback(() => showNextUnlock(), [showNextUnlock]);

  const selectAvatar = useCallback(
    (avatarId: string) => {
      const avatar = BUDDY_AVATARS.find((a) => a.id === avatarId);
      if (avatar && state.stats.builds >= avatar.requiredBuilds) {
        setSelectedAvatarId(avatarId);
        localStorage.setItem(AVATAR_KEY, avatarId);
      }
    },
    [state.stats.builds],
  );

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
