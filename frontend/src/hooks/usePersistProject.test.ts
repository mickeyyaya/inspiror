import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { usePersistProject } from "./usePersistProject";
import type { ChatMessage } from "../types/project";
import type { Block } from "../types/block";

describe("usePersistProject", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const msg = (role: "user" | "assistant", content: string): ChatMessage => ({
    id: `m-${content.slice(0, 5)}`,
    role,
    content,
  });

  const block = (type: string): Block => ({
    id: `b-${type}`,
    type: type as Block["type"],
    params: {},
    enabled: true,
  });

  it("saves messages immediately on change", () => {
    const onUpdate = vi.fn();
    const messages = [msg("assistant", "Hello!")];
    renderHook(() =>
      usePersistProject({
        projectId: "p1",
        messages,
        currentCode: "<html></html>",
        blocks: [block("setBg")],
        onUpdate,
      }),
    );
    expect(onUpdate).toHaveBeenCalledWith("p1", { messages });
  });

  it("saves code+blocks with debounce", () => {
    const onUpdate = vi.fn();
    renderHook(() =>
      usePersistProject({
        projectId: "p1",
        messages: [msg("assistant", "Hi")],
        currentCode: "<html>test</html>",
        blocks: [block("setBg")],
        onUpdate,
      }),
    );

    // messages saved immediately
    expect(onUpdate).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    // code+blocks saved after debounce
    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate).toHaveBeenLastCalledWith("p1", {
      currentCode: "<html>test</html>",
      blocks: [block("setBg")],
    });
  });

  it("debounces rapid code changes", () => {
    const onUpdate = vi.fn();
    const { rerender } = renderHook(
      ({ code }) =>
        usePersistProject({
          projectId: "p1",
          messages: [msg("assistant", "Hi")],
          currentCode: code,
          blocks: [],
          onUpdate,
        }),
      { initialProps: { code: "v1" } },
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ code: "v2" });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ code: "v3" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Find all code+blocks saves (not message saves)
    const codeSaves = onUpdate.mock.calls.filter(
      (call) => "currentCode" in call[1],
    );
    expect(codeSaves).toHaveLength(1);
    expect(codeSaves[0][1].currentCode).toBe("v3");
  });

  it("cleans up timer on unmount", () => {
    const onUpdate = vi.fn();
    const { unmount } = renderHook(() =>
      usePersistProject({
        projectId: "p1",
        messages: [msg("assistant", "Hi")],
        currentCode: "code",
        blocks: [],
        onUpdate,
      }),
    );

    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // Only messages save, no code save after unmount
    const codeSaves = onUpdate.mock.calls.filter(
      (call) => "currentCode" in call[1],
    );
    expect(codeSaves).toHaveLength(0);
  });
});
