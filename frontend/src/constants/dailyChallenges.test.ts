import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DAILY_CHALLENGES,
  getTodayChallenge,
  isChallengeCompleted,
  markChallengeCompleted,
} from "./dailyChallenges";

describe("DAILY_CHALLENGES", () => {
  it("has at least 10 challenges", () => {
    expect(DAILY_CHALLENGES.length).toBeGreaterThanOrEqual(10);
  });

  it("each challenge has all required fields", () => {
    for (const c of DAILY_CHALLENGES) {
      expect(c.id).toBeTruthy();
      expect(c.emoji).toBeTruthy();
      expect(c.prompt["en-US"]).toBeTruthy();
      expect(c.prompt["zh-TW"]).toBeTruthy();
      expect(c.prompt["zh-CN"]).toBeTruthy();
      expect(c.title["en-US"]).toBeTruthy();
      expect(c.title["zh-TW"]).toBeTruthy();
      expect(c.title["zh-CN"]).toBeTruthy();
      expect(["easy", "medium", "hard"]).toContain(c.difficulty);
    }
  });

  it("has unique IDs", () => {
    const ids = DAILY_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getTodayChallenge", () => {
  it("returns a valid challenge", () => {
    const challenge = getTodayChallenge();
    expect(challenge.id).toBeTruthy();
    expect(challenge.emoji).toBeTruthy();
  });

  it("returns the same challenge for the same day", () => {
    const a = getTodayChallenge();
    const b = getTodayChallenge();
    expect(a.id).toBe(b.id);
  });

  it("returns a different challenge for a different day", () => {
    const today = getTodayChallenge();
    vi.useFakeTimers();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    vi.setSystemTime(tomorrow);
    const tomorrowChallenge = getTodayChallenge();
    vi.useRealTimers();
    expect(tomorrowChallenge.id).not.toBe(today.id);
  });
});

describe("isChallengeCompleted / markChallengeCompleted", () => {
  const store: Record<string, string> = {};
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          for (const key of Object.keys(store)) delete store[key];
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it("returns false when no challenge has been completed", () => {
    expect(isChallengeCompleted("bouncing-rainbow")).toBe(false);
  });

  it("returns true after marking a challenge as completed", () => {
    markChallengeCompleted("bouncing-rainbow");
    expect(isChallengeCompleted("bouncing-rainbow")).toBe(true);
  });

  it("returns false for a different challenge ID", () => {
    markChallengeCompleted("bouncing-rainbow");
    expect(isChallengeCompleted("pet-simulator")).toBe(false);
  });

  it("returns false if stored date is not today", () => {
    store["inspiror-daily-challenge"] = JSON.stringify({
      date: "2020-01-01",
      challengeId: "bouncing-rainbow",
    });
    expect(isChallengeCompleted("bouncing-rainbow")).toBe(false);
  });

  it("handles corrupted localStorage gracefully", () => {
    store["inspiror-daily-challenge"] = "not-json";
    expect(isChallengeCompleted("bouncing-rainbow")).toBe(false);
  });
});
