import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAutoFix } from "./useAutoFix";

function makeIframeErrorEvent(
  overrides: Partial<{
    type: string;
    message: string;
    blockId: string | null;
    origin: string;
  }> = {},
): MessageEvent {
  const data = {
    type: overrides.type ?? "iframe-error",
    message: overrides.message ?? "ReferenceError: x is not defined",
    blockId: overrides.blockId ?? null,
  };
  return new MessageEvent("message", {
    data,
    origin: overrides.origin ?? window.location.origin,
  });
}

describe("useAutoFix", () => {
  const submitMock = vi.fn();
  const playBuzzerMock = vi.fn();
  const recordDebugRefMock = { current: vi.fn() };
  const messagesRef = { current: [] as { id: string; role: string; content: string }[] };
  const blocksRef = { current: [] as unknown[] };
  const setMessagesMock = vi.fn();

  const baseProps = {
    isLoading: false,
    submit: submitMock,
    playBuzzer: playBuzzerMock,
    language: "en" as const,
    t: {
      error_oops: "Oops!",
      error_autofix_limit: "Auto-fix limit reached.",
    },
    blocksRef,
    messagesRef,
    recordDebugRef: recordDebugRefMock,
    setMessages: setMessagesMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    messagesRef.current = [];
    blocksRef.current = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers a message event listener on mount and removes it on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useAutoFix(baseProps));

    expect(addSpy).toHaveBeenCalledWith("message", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("does not trigger auto-fix when isLoading is true", () => {
    renderHook(() => useAutoFix({ ...baseProps, isLoading: true }));

    act(() => {
      window.dispatchEvent(makeIframeErrorEvent());
    });

    expect(submitMock).not.toHaveBeenCalled();
    expect(playBuzzerMock).not.toHaveBeenCalled();
  });

  it("increments counter and calls submit on valid iframe error", () => {
    renderHook(() => useAutoFix(baseProps));

    act(() => {
      window.dispatchEvent(makeIframeErrorEvent({ message: "TypeError: foo" }));
    });

    expect(playBuzzerMock).toHaveBeenCalledOnce();
    expect(submitMock).toHaveBeenCalledOnce();
    expect(setMessagesMock).toHaveBeenCalledOnce();
  });

  it("shows auto-fix limit message after 2 auto-fixes and stops further auto-fix", () => {
    renderHook(() => useAutoFix(baseProps));

    act(() => {
      window.dispatchEvent(makeIframeErrorEvent());
    });
    act(() => {
      window.dispatchEvent(makeIframeErrorEvent());
    });
    // Third event should trigger limit message, not another submit
    act(() => {
      window.dispatchEvent(makeIframeErrorEvent());
    });

    // submit called only for the first two events
    expect(submitMock).toHaveBeenCalledTimes(2);
    // setMessages called for the first two fixes + the limit warning
    expect(setMessagesMock).toHaveBeenCalledTimes(3);
  });

  it("ignores messages with invalid blockId (non-matching SAFE_BLOCK_ID_RE)", () => {
    // A message with blockId that contains special chars should be sanitized (blockId set to null)
    // The handler should still auto-fix but with null blockId
    renderHook(() => useAutoFix(baseProps));

    act(() => {
      window.dispatchEvent(
        makeIframeErrorEvent({ blockId: "<script>alert(1)</script>" }),
      );
    });

    expect(submitMock).toHaveBeenCalledOnce();
    // The submit call should not contain the dangerous blockId in message context
    const callArg = setMessagesMock.mock.calls[0][0];
    expect(JSON.stringify(callArg)).not.toContain("<script>");
  });

  it("ignores events from disallowed origins", () => {
    renderHook(() => useAutoFix(baseProps));

    act(() => {
      window.dispatchEvent(
        makeIframeErrorEvent({ origin: "https://evil.example.com" }),
      );
    });

    expect(submitMock).not.toHaveBeenCalled();
    expect(playBuzzerMock).not.toHaveBeenCalled();
  });

  it("ignores events that are not iframe-error type", () => {
    renderHook(() => useAutoFix(baseProps));

    act(() => {
      window.dispatchEvent(makeIframeErrorEvent({ type: "other-event" }));
    });

    expect(submitMock).not.toHaveBeenCalled();
  });

  it("resets counter when resetAutoFixCount is called", () => {
    const { result } = renderHook(() => useAutoFix(baseProps));

    // Trigger 2 auto-fixes
    act(() => {
      window.dispatchEvent(makeIframeErrorEvent());
    });
    act(() => {
      window.dispatchEvent(makeIframeErrorEvent());
    });
    // Counter is now at 2 — next event shows limit message
    act(() => {
      window.dispatchEvent(makeIframeErrorEvent());
    });
    expect(submitMock).toHaveBeenCalledTimes(2);

    // Reset counter
    act(() => {
      result.current.resetAutoFixCount();
    });

    // Now another event should trigger auto-fix again
    act(() => {
      window.dispatchEvent(makeIframeErrorEvent());
    });
    expect(submitMock).toHaveBeenCalledTimes(3);
  });
});
