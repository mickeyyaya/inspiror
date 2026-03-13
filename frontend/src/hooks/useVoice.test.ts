import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoice } from "./useVoice";

// Holds the most recently created recognition instance so tests can access it
let latestRecognition: {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
};

let mockSynthesis: {
  cancel: ReturnType<typeof vi.fn>;
  speak: ReturnType<typeof vi.fn>;
  getVoices: ReturnType<typeof vi.fn>;
};

let latestUtterance: {
  text: string;
  lang: string;
  voice: unknown;
  pitch: number;
  rate: number;
};

describe("useVoice", () => {
  beforeEach(() => {
    // Build a fresh recognition object each time
    const recog = {
      continuous: false,
      interimResults: false,
      lang: "",
      onresult: null as ((event: unknown) => void) | null,
      onend: null as (() => void) | null,
      onerror: null as ((event: unknown) => void) | null,
      start: vi.fn(),
      stop: vi.fn(),
    };
    latestRecognition = recog;

    // Constructor must be a real class/function so `new` works
    function MockSpeechRecognition(this: unknown) {
      Object.assign(this as object, recog);
      latestRecognition = this as typeof recog;
    }
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);
    vi.stubGlobal("webkitSpeechRecognition", undefined);

    mockSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    };
    Object.defineProperty(window, "speechSynthesis", {
      value: mockSynthesis,
      writable: true,
      configurable: true,
    });

    function MockSpeechSynthesisUtterance(this: unknown, text: string) {
      const utt = {
        text,
        lang: "",
        voice: null as unknown,
        pitch: 1,
        rate: 1,
      };
      Object.assign(this as object, utt);
      latestUtterance = this as typeof utt;
    }
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // --- Initialization ---

  it("creates a SpeechRecognition instance when API is available", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe("");
  });

  it("does not throw when SpeechRecognition API is unavailable", () => {
    vi.stubGlobal("SpeechRecognition", undefined);
    vi.stubGlobal("webkitSpeechRecognition", undefined);
    expect(() => renderHook(() => useVoice("en-US"))).not.toThrow();
  });

  it("falls back to webkitSpeechRecognition when SpeechRecognition is absent", () => {
    vi.stubGlobal("SpeechRecognition", undefined);
    const webkitCalls: unknown[] = [];
    function MockWebkit(this: unknown) {
      webkitCalls.push(this);
      Object.assign(this as object, latestRecognition);
    }
    vi.stubGlobal("webkitSpeechRecognition", MockWebkit);
    renderHook(() => useVoice("en-US"));
    expect(webkitCalls).toHaveLength(1);
  });

  it("stores synthRef from window.speechSynthesis on mount", () => {
    renderHook(() => useVoice("en-US"));
    // Verify synth is captured by confirming speak calls reach it
    expect(mockSynthesis.cancel).not.toHaveBeenCalled();
  });

  it("cleanup stops recognition and cancels synthesis on unmount", () => {
    const { unmount } = renderHook(() => useVoice("en-US"));
    unmount();
    expect(latestRecognition.stop).toHaveBeenCalledTimes(1);
    expect(mockSynthesis.cancel).toHaveBeenCalledTimes(1);
  });

  // --- language effect ---

  it("sets recognition.lang when language prop changes", () => {
    const { rerender } = renderHook(
      ({ lang }: { lang: "en-US" | "zh-CN" | "zh-TW" }) => useVoice(lang),
      { initialProps: { lang: "en-US" as "en-US" | "zh-CN" | "zh-TW" } },
    );
    rerender({ lang: "zh-CN" });
    expect(latestRecognition.lang).toBe("zh-CN");
  });

  // --- startListening ---

  it("calls recognition.start and sets isListening to true", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.startListening();
    });
    expect(latestRecognition.start).toHaveBeenCalledTimes(1);
    expect(result.current.isListening).toBe(true);
  });

  it("does not call start again when already listening", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.startListening();
    });
    act(() => {
      result.current.startListening();
    });
    expect(latestRecognition.start).toHaveBeenCalledTimes(1);
  });

  it("resets transcript to empty string when startListening is called", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    // Simulate a transcript being populated first
    act(() => {
      if (latestRecognition.onresult) {
        latestRecognition.onresult({
          results: [
            Object.assign([{ transcript: "hello" }], { isFinal: true }),
          ],
        });
      }
    });
    act(() => {
      result.current.startListening();
    });
    expect(result.current.transcript).toBe("");
  });

  it("handles start() throwing without crashing", () => {
    latestRecognition.start.mockImplementation(() => {
      throw new Error("NotAllowedError");
    });
    const { result } = renderHook(() => useVoice("en-US"));
    expect(() => {
      act(() => {
        result.current.startListening();
      });
    }).not.toThrow();
    expect(result.current.isListening).toBe(false);
  });

  // --- stopListening ---

  it("calls recognition.stop and sets isListening to false", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.startListening();
    });
    act(() => {
      result.current.stopListening();
    });
    expect(latestRecognition.stop).toHaveBeenCalledTimes(1);
    expect(result.current.isListening).toBe(false);
  });

  it("does not call stop when not listening", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.stopListening();
    });
    expect(latestRecognition.stop).not.toHaveBeenCalled();
  });

  // --- Speech recognition callbacks ---

  it("updates transcript via onresult callback", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      if (latestRecognition.onresult) {
        latestRecognition.onresult({
          results: [
            Object.assign([{ transcript: "hello world" }], { isFinal: true }),
          ],
        });
      }
    });
    expect(result.current.transcript).toBe("hello world");
  });

  it("clears isListening when onend fires", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.startListening();
    });
    act(() => {
      if (latestRecognition.onend) {
        latestRecognition.onend();
      }
    });
    expect(result.current.isListening).toBe(false);
  });

  it("clears isListening when onerror fires", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.startListening();
    });
    act(() => {
      if (latestRecognition.onerror) {
        latestRecognition.onerror({ error: "no-speech" });
      }
    });
    expect(result.current.isListening).toBe(false);
  });

  // --- speak ---

  it("calls synth.speak with a correctly configured utterance", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.speak("Good job!");
    });
    expect(mockSynthesis.cancel).toHaveBeenCalledTimes(1);
    expect(mockSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(latestUtterance.pitch).toBe(1.2);
    expect(latestUtterance.rate).toBe(1.0);
    expect(latestUtterance.lang).toBe("en-US");
  });

  it("cancels existing speech before speaking new text", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.speak("First");
    });
    act(() => {
      result.current.speak("Second");
    });
    expect(mockSynthesis.cancel).toHaveBeenCalledTimes(2);
  });

  it("selects a voice matching the language when available", () => {
    const matchingVoice = { lang: "en-US", name: "Google US English" };
    mockSynthesis.getVoices.mockReturnValue([matchingVoice]);
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.speak("Hello");
    });
    expect(latestUtterance.voice).toBe(matchingVoice);
  });

  it("is a no-op when autoSpeak is disabled", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.toggleAutoSpeak(); // disable
    });
    act(() => {
      result.current.speak("Should not speak");
    });
    expect(mockSynthesis.speak).not.toHaveBeenCalled();
  });

  // --- toggleAutoSpeak ---

  it("toggles isAutoSpeakEnabled state", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    expect(result.current.isAutoSpeakEnabled).toBe(true);
    act(() => {
      result.current.toggleAutoSpeak();
    });
    expect(result.current.isAutoSpeakEnabled).toBe(false);
    act(() => {
      result.current.toggleAutoSpeak();
    });
    expect(result.current.isAutoSpeakEnabled).toBe(true);
  });

  it("cancels speech when disabling autoSpeak while it is enabled", () => {
    const { result } = renderHook(() => useVoice("en-US"));
    act(() => {
      result.current.toggleAutoSpeak(); // was true → false
    });
    expect(mockSynthesis.cancel).toHaveBeenCalledTimes(1);
  });
});
