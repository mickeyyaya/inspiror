import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useAchievements } from "./useAchievements";

describe("useAchievements", () => {
  const store: Record<string, string> = {};

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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with zero stats and no unlocked achievements", () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.stats.builds).toBe(0);
    expect(result.current.stats.debugs).toBe(0);
    expect(result.current.unlockedIds).toEqual([]);
    expect(result.current.newlyUnlocked).toBeNull();
  });

  it("increments build count on recordBuild", () => {
    const { result } = renderHook(() => useAchievements());
    act(() => result.current.recordBuild());
    expect(result.current.stats.builds).toBe(1);
  });

  it("unlocks first-build achievement after 1 build", () => {
    const { result } = renderHook(() => useAchievements());
    act(() => result.current.recordBuild());
    act(() => vi.runAllTimers());
    expect(result.current.unlockedIds).toContain("first-build");
    expect(result.current.newlyUnlocked?.id).toBe("first-build");
  });

  it("unlocks five-builds achievement after 5 builds", () => {
    const { result } = renderHook(() => useAchievements());
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordBuild());
      act(() => vi.runAllTimers());
    }
    expect(result.current.unlockedIds).toContain("five-builds");
    expect(result.current.stats.builds).toBe(5);
  });

  it("unlocks first-debug achievement after recordDebug", () => {
    const { result } = renderHook(() => useAchievements());
    act(() => result.current.recordDebug());
    act(() => vi.runAllTimers());
    expect(result.current.unlockedIds).toContain("first-debug");
    expect(result.current.newlyUnlocked?.id).toBe("first-debug");
  });

  it("dismisses newly unlocked achievement", () => {
    const { result } = renderHook(() => useAchievements());
    act(() => result.current.recordBuild());
    act(() => vi.runAllTimers());
    expect(result.current.newlyUnlocked).not.toBeNull();
    act(() => result.current.dismissUnlock());
    expect(result.current.newlyUnlocked).toBeNull();
  });

  it("persists state to localStorage", () => {
    const { result, unmount } = renderHook(() => useAchievements());
    act(() => result.current.recordBuild());
    unmount();

    const { result: result2 } = renderHook(() => useAchievements());
    expect(result2.current.stats.builds).toBe(1);
    expect(result2.current.unlockedIds).toContain("first-build");
  });

  it("loads default state on corrupted localStorage", () => {
    store["inspiror-achievements"] = "invalid json";
    const { result } = renderHook(() => useAchievements());
    expect(result.current.stats.builds).toBe(0);
    expect(result.current.unlockedIds).toEqual([]);
  });

  it("starts with default dog avatar", () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.selectedAvatar.id).toBe("dog");
    expect(result.current.selectedAvatar.emoji).toBe("🐶");
  });

  it("allows selecting an unlocked avatar", () => {
    const { result } = renderHook(() => useAchievements());
    // Build 3 times to unlock cat avatar
    for (let i = 0; i < 3; i++) {
      act(() => result.current.recordBuild());
      act(() => vi.runAllTimers());
    }
    act(() => result.current.selectAvatar("cat"));
    expect(result.current.selectedAvatar.id).toBe("cat");
    expect(result.current.selectedAvatar.emoji).toBe("🐱");
  });

  it("prevents selecting a locked avatar", () => {
    const { result } = renderHook(() => useAchievements());
    act(() => result.current.selectAvatar("dragon")); // requires 5 builds
    expect(result.current.selectedAvatar.id).toBe("dog");
  });

  it("tracks unlocked avatars based on build count", () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.unlockedAvatars.length).toBe(1); // only dog
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordBuild());
      act(() => vi.runAllTimers());
    }
    // At 5 builds: dog (0), cat (3), dragon (5) should be unlocked
    expect(result.current.unlockedAvatars.length).toBe(3);
  });

  it("persists avatar selection to localStorage", () => {
    const { result, unmount } = renderHook(() => useAchievements());
    for (let i = 0; i < 3; i++) {
      act(() => result.current.recordBuild());
      act(() => vi.runAllTimers());
    }
    act(() => result.current.selectAvatar("cat"));
    unmount();

    const { result: result2 } = renderHook(() => useAchievements());
    expect(result2.current.selectedAvatar.id).toBe("cat");
  });

  it("does not re-unlock already unlocked achievements", () => {
    const { result } = renderHook(() => useAchievements());
    act(() => result.current.recordBuild());
    act(() => vi.runAllTimers());
    act(() => result.current.dismissUnlock());

    // Second build should not re-trigger first-build
    act(() => result.current.recordBuild());
    act(() => vi.runAllTimers());
    expect(result.current.newlyUnlocked).toBeNull();
    expect(
      result.current.unlockedIds.filter((id: string) => id === "first-build")
        .length,
    ).toBe(1);
  });
});
