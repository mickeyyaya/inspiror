import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLegacyConversion, isValidBlock } from "./useLegacyConversion";
import type { Block } from "../types/block";

const validBlock: import("../types/block").Block = {
  id: "b1",
  type: "custom",
  code: "console.log(1)",
  enabled: true,
  label: "Log",
  emoji: "📝",
  order: 0,
  params: [],
};

function makeProject(
  overrides: { blocks?: Block[]; currentCode?: string } = {},
) {
  return {
    id: "proj-1",
    messages: [],
    currentCode: overrides.currentCode ?? "",
    blocks: overrides.blocks,
  };
}

describe("useLegacyConversion", () => {
  const onBlocksConvertedMock = vi.fn();
  const onConversionEndMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing when project.blocks is defined (non-legacy project)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { result } = renderHook(() =>
      useLegacyConversion({
        project: makeProject({ blocks: [validBlock] }),
        language: "en-US",
        onBlocksConverted: onBlocksConvertedMock,
        onConversionEnd: onConversionEndMock,
      }),
    );

    expect(result.current.isConverting).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onBlocksConvertedMock).not.toHaveBeenCalled();
  });

  it("does nothing when currentCode is shorter than 100 chars", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { result } = renderHook(() =>
      useLegacyConversion({
        project: makeProject({ currentCode: "short code" }),
        language: "en-US",
        onBlocksConverted: onBlocksConvertedMock,
        onConversionEnd: onConversionEndMock,
      }),
    );

    expect(result.current.isConverting).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls fetch with correct body on legacy project with substantial code", async () => {
    const longCode = "x".repeat(150);
    const mockBlocks = [validBlock];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blocks: mockBlocks }),
    } as Response);

    renderHook(() =>
      useLegacyConversion({
        project: makeProject({ currentCode: longCode }),
        language: "en-US",
        onBlocksConverted: onBlocksConvertedMock,
        onConversionEnd: onConversionEndMock,
      }),
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/api/convert-to-blocks");
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body).toEqual({ code: longCode, language: "en-US" });
  });

  it("sets isConverting true during fetch and false on completion", async () => {
    const longCode = "x".repeat(150);
    let resolvePromise!: (value: Response) => void;
    const fetchPromise = new Promise<Response>((res) => {
      resolvePromise = res;
    });
    vi.spyOn(globalThis, "fetch").mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() =>
      useLegacyConversion({
        project: makeProject({ currentCode: longCode }),
        language: "en-US",
        onBlocksConverted: onBlocksConvertedMock,
        onConversionEnd: onConversionEndMock,
      }),
    );

    await waitFor(() => {
      expect(result.current.isConverting).toBe(true);
    });

    resolvePromise({
      ok: true,
      json: async () => ({ blocks: [validBlock] }),
    } as Response);

    await waitFor(() => {
      expect(result.current.isConverting).toBe(false);
    });
  });

  it("handles fetch error gracefully (logs, keeps DEFAULT_BLOCKS)", async () => {
    const longCode = "x".repeat(150);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    const { result } = renderHook(() =>
      useLegacyConversion({
        project: makeProject({ currentCode: longCode }),
        language: "en-US",
        onBlocksConverted: onBlocksConvertedMock,
        onConversionEnd: onConversionEndMock,
      }),
    );

    await waitFor(() => {
      expect(result.current.isConverting).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(onBlocksConvertedMock).not.toHaveBeenCalled();
    expect(onConversionEndMock).toHaveBeenCalledOnce();
  });

  it("does not attempt conversion twice (hasAttemptedConversion guard)", async () => {
    const longCode = "x".repeat(150);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ blocks: [validBlock] }),
    } as Response);

    const { rerender } = renderHook(
      ({ code }: { code: string }) =>
        useLegacyConversion({
          project: makeProject({ currentCode: code }),
          language: "en-US",
          onBlocksConverted: onBlocksConvertedMock,
          onConversionEnd: onConversionEndMock,
        }),
      { initialProps: { code: longCode } },
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    rerender({ code: longCode + "extra" });

    // Still only called once despite rerender
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("calls onBlocksConverted with parsed blocks when conversion succeeds", async () => {
    const longCode = "x".repeat(150);
    const mockBlocks = [validBlock];
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blocks: mockBlocks }),
    } as Response);

    renderHook(() =>
      useLegacyConversion({
        project: makeProject({ currentCode: longCode }),
        language: "en-US",
        onBlocksConverted: onBlocksConvertedMock,
        onConversionEnd: onConversionEndMock,
      }),
    );

    await waitFor(() => {
      expect(onBlocksConvertedMock).toHaveBeenCalledWith(mockBlocks);
    });
    expect(onConversionEndMock).toHaveBeenCalledOnce();
  });

  it("rejects blocks with invalid fields from conversion response", async () => {
    const longCode = "x".repeat(150);
    const invalidBlocks = [{ id: "b1", code: "x", enabled: true }]; // missing type, label, emoji, order, params
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blocks: invalidBlocks }),
    } as Response);

    renderHook(() =>
      useLegacyConversion({
        project: makeProject({ currentCode: longCode }),
        language: "en-US",
        onBlocksConverted: onBlocksConvertedMock,
        onConversionEnd: onConversionEndMock,
      }),
    );

    await waitFor(() => {
      expect(onConversionEndMock).toHaveBeenCalledOnce();
    });
    // Invalid blocks should NOT be passed to onBlocksConverted
    expect(onBlocksConvertedMock).not.toHaveBeenCalled();
  });
});

describe("isValidBlock", () => {
  const valid: Block = {
    id: "b1",
    type: "custom",
    label: "Test",
    emoji: "🔲",
    enabled: true,
    params: [],
    code: "console.log(1)",
    order: 0,
  };

  it("returns true for a valid block", () => {
    expect(isValidBlock(valid)).toBe(true);
  });

  it("returns true for a valid block with css", () => {
    expect(isValidBlock({ ...valid, css: ".foo { color: red }" })).toBe(true);
  });

  it("returns true for a block with valid params", () => {
    const withParams = {
      ...valid,
      params: [
        { key: "speed", label: "Speed", type: "number", value: 5 },
        { key: "color", label: "Color", type: "color", value: "#ff0000" },
      ],
    };
    expect(isValidBlock(withParams)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isValidBlock(null)).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(isValidBlock("string")).toBe(false);
    expect(isValidBlock(42)).toBe(false);
  });

  it("returns false when id is missing", () => {
    const { id: _, ...noId } = valid;
    expect(isValidBlock(noId)).toBe(false);
  });

  it("returns false when type is invalid category", () => {
    expect(isValidBlock({ ...valid, type: "invalid" })).toBe(false);
  });

  it("returns false when label is missing", () => {
    const { label: _, ...noLabel } = valid;
    expect(isValidBlock(noLabel)).toBe(false);
  });

  it("returns false when emoji is missing", () => {
    const { emoji: _, ...noEmoji } = valid;
    expect(isValidBlock(noEmoji)).toBe(false);
  });

  it("returns false when enabled is not boolean", () => {
    expect(isValidBlock({ ...valid, enabled: "yes" })).toBe(false);
  });

  it("returns false when code is missing", () => {
    const { code: _, ...noCode } = valid;
    expect(isValidBlock(noCode)).toBe(false);
  });

  it("returns false when order is not number", () => {
    expect(isValidBlock({ ...valid, order: "zero" })).toBe(false);
  });

  it("returns false when params is not array", () => {
    expect(isValidBlock({ ...valid, params: {} })).toBe(false);
  });

  it("returns false when params has invalid entry", () => {
    expect(isValidBlock({ ...valid, params: [{ key: "x" }] })).toBe(false);
  });

  it("returns false when param has invalid type", () => {
    expect(
      isValidBlock({
        ...valid,
        params: [{ key: "x", label: "X", type: "invalid", value: 1 }],
      }),
    ).toBe(false);
  });

  it("returns false when css is non-string", () => {
    expect(isValidBlock({ ...valid, css: 42 })).toBe(false);
  });
});
