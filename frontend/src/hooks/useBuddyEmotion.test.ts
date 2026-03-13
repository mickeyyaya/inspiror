import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBuddyEmotion } from "./useBuddyEmotion";
import type { ChatMessage } from "../types/project";

describe("useBuddyEmotion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with idle emotion", () => {
    const { result } = renderHook(() =>
      useBuddyEmotion([{ id: "1", role: "assistant", content: "Hello!" }]),
    );
    expect(result.current.buddyEmotion).toBe("idle");
  });

  it("sets curious when last assistant message ends with ?", () => {
    const messages: ChatMessage[] = [
      { id: "1", role: "assistant", content: "What do you want to build?" },
    ];
    const { result } = renderHook(() => useBuddyEmotion(messages));
    expect(result.current.buddyEmotion).toBe("curious");
  });

  it("returns to idle when last message does not end with ?", () => {
    const messages: ChatMessage[] = [
      { id: "1", role: "assistant", content: "What do you want?" },
    ];
    const { result, rerender } = renderHook(
      ({ msgs }) => useBuddyEmotion(msgs),
      { initialProps: { msgs: messages } },
    );
    expect(result.current.buddyEmotion).toBe("curious");

    const updated: ChatMessage[] = [
      { id: "1", role: "assistant", content: "What do you want?" },
      { id: "2", role: "user", content: "A game" },
    ];
    rerender({ msgs: updated });
    expect(result.current.buddyEmotion).toBe("idle");
  });

  it("triggerEmotion sets emotion and reverts after duration", () => {
    const { result } = renderHook(() =>
      useBuddyEmotion([{ id: "1", role: "assistant", content: "Hi" }]),
    );

    act(() => {
      result.current.triggerEmotion("proud", 2000);
    });
    expect(result.current.buddyEmotion).toBe("proud");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.buddyEmotion).toBe("idle");
  });

  it("triggerEmotion cancels previous timer when called again", () => {
    const { result } = renderHook(() =>
      useBuddyEmotion([{ id: "1", role: "assistant", content: "Hi" }]),
    );

    act(() => {
      result.current.triggerEmotion("proud", 2000);
    });
    expect(result.current.buddyEmotion).toBe("proud");

    act(() => {
      vi.advanceTimersByTime(500);
      result.current.triggerEmotion("worried", 1000);
    });
    expect(result.current.buddyEmotion).toBe("worried");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.buddyEmotion).toBe("idle");
  });

  it("cleans up timer on unmount", () => {
    const { result, unmount } = renderHook(() =>
      useBuddyEmotion([{ id: "1", role: "assistant", content: "Hi" }]),
    );

    act(() => {
      result.current.triggerEmotion("proud", 5000);
    });

    unmount();
    // Should not throw after unmount
    act(() => {
      vi.advanceTimersByTime(5000);
    });
  });

  it("does not set curious for user messages ending with ?", () => {
    const messages: ChatMessage[] = [
      { id: "1", role: "user", content: "Can you help?" },
    ];
    const { result } = renderHook(() => useBuddyEmotion(messages));
    expect(result.current.buddyEmotion).toBe("idle");
  });
});
