import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudio } from "./useAudio";

const POOL_SIZE = 4;
const SOUND_COUNT = 4;

const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockLoad = vi.fn();

vi.stubGlobal(
  "Audio",
  vi.fn().mockImplementation(function () {
    return {
      load: mockLoad,
      play: mockPlay,
      pause: vi.fn(),
      currentTime: 0,
      removeAttribute: vi.fn(),
    };
  }),
);

const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  }),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("useAudio", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockPlay.mockClear();
    mockLoad.mockClear();
    (globalThis.Audio as ReturnType<typeof vi.fn>).mockClear();
  });

  it("creates a bounded pool of audio elements on mount", () => {
    renderHook(() => useAudio());
    expect(globalThis.Audio).toHaveBeenCalledTimes(SOUND_COUNT * POOL_SIZE);
    expect(mockLoad).toHaveBeenCalledTimes(SOUND_COUNT * POOL_SIZE);
  });

  it("plays pop sound when not muted", () => {
    const { result } = renderHook(() => useAudio());
    act(() => result.current.playPop());
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it("plays chip click sound", () => {
    const { result } = renderHook(() => useAudio());
    act(() => result.current.playChipClick());
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it("plays chime sound", () => {
    const { result } = renderHook(() => useAudio());
    act(() => result.current.playChime());
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it("plays buzzer sound", () => {
    const { result } = renderHook(() => useAudio());
    act(() => result.current.playBuzzer());
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it("does not play when muted", () => {
    const { result } = renderHook(() => useAudio());
    act(() => result.current.toggleMute());
    expect(result.current.isMuted).toBe(true);
    mockPlay.mockClear();
    act(() => result.current.playPop());
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it("cycles through pool elements on repeated plays", () => {
    const { result } = renderHook(() => useAudio());
    act(() => result.current.playPop());
    act(() => result.current.playPop());
    act(() => result.current.playPop());
    act(() => result.current.playPop());
    act(() => result.current.playPop());
    // 5 plays should cycle back to the first pool element
    expect(mockPlay).toHaveBeenCalledTimes(5);
  });

  it("toggles mute and persists to localStorage", () => {
    const { result } = renderHook(() => useAudio());
    act(() => result.current.toggleMute());
    expect(result.current.isMuted).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "inspiror-muted",
      "true",
    );
  });

  it("reads initial mute state from localStorage", () => {
    mockStorage["inspiror-muted"] = "true";
    const { result } = renderHook(() => useAudio());
    expect(result.current.isMuted).toBe(true);
  });
});
