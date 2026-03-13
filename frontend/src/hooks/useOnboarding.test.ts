import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useOnboarding, ONBOARDING_STORAGE_KEY } from "./useOnboarding";

describe("useOnboarding", () => {
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

  it("starts at step 0 on first visit", () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.step).toBe(0);
    expect(result.current.isActive).toBe(true);
  });

  it("advances step by 1", () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.advanceStep());
    expect(result.current.step).toBe(1);
  });

  it("advances through all 3 steps then deactivates", () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.advanceStep()); // 0 -> 1
    act(() => result.current.advanceStep()); // 1 -> 2
    act(() => result.current.advanceStep()); // 2 -> done
    expect(result.current.isActive).toBe(false);
    expect(result.current.step).toBe(3);
  });

  it("skipAll completes immediately", () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.skipAll());
    expect(result.current.isActive).toBe(false);
    expect(result.current.step).toBe(3);
  });

  it("persists completed state to localStorage", () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.skipAll());
    expect(store[ONBOARDING_STORAGE_KEY]).toBe("done");
  });

  it("reads completed state from localStorage on mount", () => {
    store[ONBOARDING_STORAGE_KEY] = "done";
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.isActive).toBe(false);
    expect(result.current.step).toBe(3);
  });

  it("does not re-show after remount", () => {
    const { result, unmount } = renderHook(() => useOnboarding());
    act(() => result.current.skipAll());
    unmount();

    const { result: result2 } = renderHook(() => useOnboarding());
    expect(result2.current.isActive).toBe(false);
  });

  it("isActive is true for steps 0, 1, 2", () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.isActive).toBe(true); // step 0
    act(() => result.current.advanceStep());
    expect(result.current.isActive).toBe(true); // step 1
    act(() => result.current.advanceStep());
    expect(result.current.isActive).toBe(true); // step 2
  });
});
