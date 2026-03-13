import { describe, it, expect, vi, beforeEach } from "vitest";
import { canWebShare, shareProject, copyHtmlToClipboard } from "./shareHtml";

describe("shareHtml utilities", () => {
  beforeEach(() => {
    // Reset navigator mocks
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "canShare", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  describe("canWebShare", () => {
    it("returns false when navigator.share is undefined", () => {
      expect(canWebShare()).toBe(false);
    });

    it("returns true when navigator.share exists", () => {
      Object.defineProperty(navigator, "share", {
        value: vi.fn(),
        configurable: true,
      });
      expect(canWebShare()).toBe(true);
    });
  });

  describe("shareProject", () => {
    it("shares with file when canShare supports files", async () => {
      const shareFn = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "share", {
        value: shareFn,
        configurable: true,
      });
      Object.defineProperty(navigator, "canShare", {
        value: () => true,
        configurable: true,
      });

      await shareProject("<html>test</html>", "My Game");
      expect(shareFn).toHaveBeenCalledTimes(1);
      const callArg = shareFn.mock.calls[0][0];
      expect(callArg.files).toHaveLength(1);
      expect(callArg.files[0].name).toBe("My-Game.html");
    });

    it("falls back to text-only share when canShare rejects files", async () => {
      const shareFn = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "share", {
        value: shareFn,
        configurable: true,
      });
      Object.defineProperty(navigator, "canShare", {
        value: () => false,
        configurable: true,
      });

      await shareProject("<html>test</html>", "My Game");
      expect(shareFn).toHaveBeenCalledTimes(1);
      const callArg = shareFn.mock.calls[0][0];
      expect(callArg.files).toBeUndefined();
      expect(callArg.title).toBe("My Game");
    });

    it("falls back to text-only when canShare is undefined", async () => {
      const shareFn = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "share", {
        value: shareFn,
        configurable: true,
      });

      await shareProject("<html>test</html>", "My Game");
      const callArg = shareFn.mock.calls[0][0];
      expect(callArg.files).toBeUndefined();
    });

    it("silently catches AbortError (user cancelled)", async () => {
      const abortErr = new DOMException("Share cancelled", "AbortError");
      Object.defineProperty(navigator, "share", {
        value: vi.fn().mockRejectedValue(abortErr),
        configurable: true,
      });

      // Should not throw
      await expect(
        shareProject("<html></html>", "Test"),
      ).resolves.toBeUndefined();
    });

    it("re-throws non-AbortError errors", async () => {
      const err = new Error("Network failure");
      Object.defineProperty(navigator, "share", {
        value: vi.fn().mockRejectedValue(err),
        configurable: true,
      });

      await expect(shareProject("<html></html>", "Test")).rejects.toThrow(
        "Network failure",
      );
    });
  });

  describe("copyHtmlToClipboard", () => {
    it("copies text and returns true on success", async () => {
      const result = await copyHtmlToClipboard("<html>hello</html>");
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "<html>hello</html>",
      );
    });

    it("returns false when clipboard API fails", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error("Not allowed")),
        },
        configurable: true,
      });
      const result = await copyHtmlToClipboard("<html></html>");
      expect(result).toBe(false);
    });

    it("returns false when clipboard is undefined", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });
      const result = await copyHtmlToClipboard("<html></html>");
      expect(result).toBe(false);
    });
  });
});
