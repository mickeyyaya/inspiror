import { useState } from "react";

export const STREAK_STORAGE_KEY = "inspiror-streak-v1";

interface StreakData {
  lastDate: string;
  streak: number;
}

interface UseStreakResult {
  streakDays: number;
  isNewDay: boolean;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + "T00:00:00");
  const b = new Date(dateB + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function readStreak(): StreakData | null {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data.lastDate === "string" && typeof data.streak === "number") {
      return data as StreakData;
    }
    return null;
  } catch {
    return null;
  }
}

function writeStreak(data: StreakData): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full — ignore
  }
}

export function useStreak(): UseStreakResult {
  const [{ streakDays, isNewDay }] = useState<UseStreakResult>(() => {
    const today = todayStr();
    const saved = readStreak();

    if (!saved) {
      writeStreak({ lastDate: today, streak: 1 });
      return { streakDays: 1, isNewDay: true };
    }

    if (saved.lastDate === today) {
      return { streakDays: saved.streak, isNewDay: false };
    }

    const gap = daysBetween(saved.lastDate, today);
    if (gap === 1) {
      const newStreak = saved.streak + 1;
      writeStreak({ lastDate: today, streak: newStreak });
      return { streakDays: newStreak, isNewDay: true };
    }

    // Gap > 1 day — reset
    writeStreak({ lastDate: today, streak: 1 });
    return { streakDays: 1, isNewDay: true };
  });

  return { streakDays, isNewDay };
}
