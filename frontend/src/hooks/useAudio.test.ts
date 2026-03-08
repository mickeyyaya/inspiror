import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudio } from "./useAudio";

const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockLoad = vi.fn();

vi.stubGlobal(
  "Audio",
  vi.fn().mockImplementation(function () {
    return {
      load: mockLoad,
      cloneNode: vi.fn().mockReturnValue({ play: mockPlay }),
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

  it("preloads 4 audio files on mount", () => {
    renderHook(() => useAudio());
    expect(globalThis.Audio).toHaveBeenCalledTimes(4);
    expect(mockLoad).toHaveBeenCalledTimes(4);
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
    act(() => result.current.playPop());
    expect(mockPlay).not.toHaveBeenCalled();
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
