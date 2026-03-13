import { describe, it, expect, vi, beforeEach } from "vitest";
import { safeSave } from "./safeSave";

describe("safeSave", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  it("returns true on successful save", () => {
    expect(safeSave("key", "value")).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith("key", "value");
  });

  it("returns false when localStorage throws QuotaExceededError", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(safeSave("key", "value")).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("returns false on any thrown error", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("generic error");
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(safeSave("key", "value")).toBe(false);

    consoleSpy.mockRestore();
  });
});
