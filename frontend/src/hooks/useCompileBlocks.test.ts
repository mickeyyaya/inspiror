import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCompileBlocks } from "./useCompileBlocks";
import type { Block } from "../types/block";

vi.mock("../compiler/compileBlocks", () => ({
  compileBlocks: vi.fn(
    (blocks: Block[], checks?: string[]) =>
      `compiled:${blocks.length}:${(checks ?? []).length}`,
  ),
}));

describe("useCompileBlocks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const makeBlock = (type: string, enabled = true): Block => ({
    id: `b-${type}`,
    type: type as Block["type"],
    params: {},
    enabled,
  });

  it("does not compile on initial render for legacy projects", () => {
    const setCurrentCode = vi.fn();
    renderHook(() =>
      useCompileBlocks({
        blocks: [makeBlock("setBg")],
        checksRef: { current: [] },
        isLegacyProject: true,
        setCurrentCode,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(setCurrentCode).not.toHaveBeenCalled();
  });

  it("compiles after debounce for non-legacy projects", () => {
    const setCurrentCode = vi.fn();
    renderHook(() =>
      useCompileBlocks({
        blocks: [makeBlock("setBg")],
        checksRef: { current: ["check1"] },
        isLegacyProject: false,
        setCurrentCode,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(setCurrentCode).toHaveBeenCalledWith("compiled:1:1");
  });

  it("debounces rapid block changes", () => {
    const setCurrentCode = vi.fn();
    const blocks1 = [makeBlock("setBg")];
    const blocks2 = [makeBlock("setBg"), makeBlock("addText")];

    const { rerender } = renderHook(
      ({ blocks }) =>
        useCompileBlocks({
          blocks,
          checksRef: { current: [] },
          isLegacyProject: false,
          setCurrentCode,
        }),
      { initialProps: { blocks: blocks1 } },
    );

    act(() => {
      vi.advanceTimersByTime(50);
    });
    rerender({ blocks: blocks2 });

    act(() => {
      vi.advanceTimersByTime(150);
    });
    // Should only compile with the latest blocks
    expect(setCurrentCode).toHaveBeenCalledTimes(1);
    expect(setCurrentCode).toHaveBeenCalledWith("compiled:2:0");
  });

  it("cleans up timer on unmount", () => {
    const setCurrentCode = vi.fn();
    const { unmount } = renderHook(() =>
      useCompileBlocks({
        blocks: [makeBlock("setBg")],
        checksRef: { current: [] },
        isLegacyProject: false,
        setCurrentCode,
      }),
    );

    unmount();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(setCurrentCode).not.toHaveBeenCalled();
  });

  it("compiles on subsequent changes even if first was legacy", () => {
    const setCurrentCode = vi.fn();
    const blocks1 = [makeBlock("setBg")];
    const blocks2 = [makeBlock("setBg"), makeBlock("addText")];

    const { rerender } = renderHook(
      ({ blocks, isLegacy }) =>
        useCompileBlocks({
          blocks,
          checksRef: { current: [] },
          isLegacyProject: isLegacy,
          setCurrentCode,
        }),
      { initialProps: { blocks: blocks1, isLegacy: true } },
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(setCurrentCode).not.toHaveBeenCalled();

    // After first render, isLegacy flag should be consumed
    rerender({ blocks: blocks2, isLegacy: false });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(setCurrentCode).toHaveBeenCalledWith("compiled:2:0");
  });
});
