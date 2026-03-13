import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sanitizeFilename, downloadHtml } from "./downloadHtml";

describe("sanitizeFilename", () => {
  it("converts spaces to hyphens and adds .html", () => {
    expect(sanitizeFilename("My Cool Game")).toBe("My-Cool-Game.html");
  });

  it("strips special characters", () => {
    expect(sanitizeFilename("game<script>alert</script>")).toBe(
      "gamescriptalertscript.html",
    );
  });

  it("truncates to 50 characters before adding extension", () => {
    const longTitle = "a".repeat(100);
    const result = sanitizeFilename(longTitle);
    expect(result).toBe("a".repeat(50) + ".html");
  });

  it("uses fallback for empty title after sanitization", () => {
    expect(sanitizeFilename("!!!")).toBe("my-project.html");
  });

  it("handles Unicode characters (CJK)", () => {
    expect(sanitizeFilename("我的遊戲")).toBe("我的遊戲.html");
  });

  it("collapses multiple spaces into single hyphen", () => {
    expect(sanitizeFilename("my   cool   game")).toBe("my-cool-game.html");
  });

  it("collapses consecutive hyphens", () => {
    expect(sanitizeFilename("my - cool - game")).toBe("my-cool-game.html");
  });
});

describe("downloadHtml", () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURLSpy = vi.fn().mockReturnValue("blob:test-url");
    revokeObjectURLSpy = vi.fn();
    Object.defineProperty(window, "URL", {
      value: {
        createObjectURL: createObjectURLSpy,
        revokeObjectURL: revokeObjectURLSpy,
      },
      writable: true,
    });

    clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      style: { display: "" },
      click: clickSpy,
    } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, "appendChild").mockImplementation(
      (node) => node as ChildNode,
    );
    vi.spyOn(document.body, "removeChild").mockImplementation(
      (node) => node as ChildNode,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a Blob from HTML content and triggers download", () => {
    downloadHtml("<html>hello</html>", "test project");

    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:test-url");
  });

  it("uses sanitized filename for the download", () => {
    const mockAnchor = {
      href: "",
      download: "",
      style: { display: "" },
      click: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockAnchor as unknown as HTMLAnchorElement,
    );

    downloadHtml("<html></html>", "My Game");

    expect(mockAnchor.download).toBe("My-Game.html");
  });
});
