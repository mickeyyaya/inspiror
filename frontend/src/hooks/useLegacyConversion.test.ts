import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLegacyConversion } from "./useLegacyConversion";
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
});
