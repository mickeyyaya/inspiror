import { renderHook, act } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import { useStreak, STREAK_STORAGE_KEY } from "./useStreak";

describe("useStreak", () => {
  const store: Record<string, string> = {};
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
  });

  function setDate(dateStr: string) {
    vi.setSystemTime(new Date(dateStr));
  }

  it("starts at streak 1 with isNewDay true on first visit", () => {
    setDate("2026-03-13T10:00:00");
    const { result } = renderHook(() => useStreak());
    expect(result.current.streakDays).toBe(1);
    expect(result.current.isNewDay).toBe(true);
  });

  it("does not change streak on same-day revisit", () => {
    setDate("2026-03-13T10:00:00");
    store[STREAK_STORAGE_KEY] = JSON.stringify({
      lastDate: "2026-03-13",
      streak: 3,
    });
    const { result } = renderHook(() => useStreak());
    expect(result.current.streakDays).toBe(3);
    expect(result.current.isNewDay).toBe(false);
  });

  it("increments streak on consecutive day", () => {
    setDate("2026-03-14T08:00:00");
    store[STREAK_STORAGE_KEY] = JSON.stringify({
      lastDate: "2026-03-13",
      streak: 5,
    });
    const { result } = renderHook(() => useStreak());
    expect(result.current.streakDays).toBe(6);
    expect(result.current.isNewDay).toBe(true);
  });

  it("resets streak to 1 after a gap of more than 1 day", () => {
    setDate("2026-03-16T08:00:00");
    store[STREAK_STORAGE_KEY] = JSON.stringify({
      lastDate: "2026-03-13",
      streak: 5,
    });
    const { result } = renderHook(() => useStreak());
    expect(result.current.streakDays).toBe(1);
    expect(result.current.isNewDay).toBe(true);
  });

  it("persists to localStorage on new day", () => {
    setDate("2026-03-14T08:00:00");
    store[STREAK_STORAGE_KEY] = JSON.stringify({
      lastDate: "2026-03-13",
      streak: 2,
    });
    renderHook(() => useStreak());
    expect(store[STREAK_STORAGE_KEY]).toBe(
      JSON.stringify({ lastDate: "2026-03-14", streak: 3 }),
    );
  });

  it("handles corrupted localStorage gracefully", () => {
    setDate("2026-03-13T10:00:00");
    store[STREAK_STORAGE_KEY] = "not-json";
    const { result } = renderHook(() => useStreak());
    expect(result.current.streakDays).toBe(1);
    expect(result.current.isNewDay).toBe(true);
  });

  it("recordActivity updates streak when date has changed", () => {
    // Mount on day 1
    setDate("2026-03-13T10:00:00");
    const { result } = renderHook(() => useStreak());
    expect(result.current.streakDays).toBe(1);

    // Simulate next day (tab kept open overnight)
    vi.setSystemTime(new Date("2026-03-14T09:00:00"));
    // Update localStorage to simulate day 1 was written
    // (it already was by the initial mount)

    // Call recordActivity to refresh streak
    act(() => {
      result.current.recordActivity();
    });

    expect(result.current.streakDays).toBe(2);
    expect(result.current.isNewDay).toBe(true);
  });

  it("recordActivity returns same streak on same day", () => {
    setDate("2026-03-13T10:00:00");
    const { result } = renderHook(() => useStreak());
    expect(result.current.streakDays).toBe(1);

    act(() => {
      result.current.recordActivity();
    });

    expect(result.current.streakDays).toBe(1);
    expect(result.current.isNewDay).toBe(false);
  });
});
