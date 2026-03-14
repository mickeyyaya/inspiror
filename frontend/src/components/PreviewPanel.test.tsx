import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PreviewPanel } from "./PreviewPanel";

// Mock utility modules
vi.mock("../utils/injectErrorCatcher", () => ({
  injectErrorCatcher: (code: string) => `<!-- injected -->${code}`,
}));

vi.mock("../utils/downloadHtml", () => ({
  downloadHtml: vi.fn(),
}));

vi.mock("../utils/shareHtml", () => ({
  canWebShare: vi.fn(() => false),
  shareProject: vi.fn(() => Promise.resolve()),
  copyHtmlToClipboard: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("./BuildingOverlay", () => ({
  BuildingOverlay: ({
    isLoading,
    buildingText,
  }: {
    isLoading: boolean;
    buildingText: string;
  }) =>
    isLoading ? <div data-testid="building-overlay">{buildingText}</div> : null,
}));

vi.mock("./BackgroundBubbles", () => ({
  BackgroundBubbles: () => <div data-testid="bg-bubbles" />,
}));

import { downloadHtml } from "../utils/downloadHtml";
import {
  canWebShare,
  shareProject,
  copyHtmlToClipboard,
} from "../utils/shareHtml";

const defaultT = {
  aria_show_chat: "Show Chat",
  aria_look_inside: "Look Inside",
  overlay_building: "BUILDING!",
  overlay_did_you_know: "Did you know?",
  blocks_count: "Blocks",
  download_project: "Download",
  aria_download: "Download project",
  share_project: "Share",
  aria_share: "Share project",
  copy_html: "Copy HTML",
  aria_copy_html: "Copy HTML code",
  copied_feedback: "Copied!",
  aria_preview_sandbox: "Preview Sandbox",
  play_hud_tap: "Tap to interact!",
  play_hud_drag: "Drag things around to play",
};

function renderPanel(
  overrides: Partial<React.ComponentProps<typeof PreviewPanel>> = {},
) {
  const props = {
    currentCode: "<html><body>Hello</body></html>",
    isLoading: false,
    isChatVisible: true,
    onShowChat: vi.fn(),
    onLookInside: vi.fn(),
    iframeRef: { current: null },
    codingFacts: ["Fact 1"],
    t: defaultT,
    ...overrides,
  };
  return { ...render(<PreviewPanel {...props} />), props };
}

describe("PreviewPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(canWebShare).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the iframe with injected code", () => {
    renderPanel();
    const iframe = screen.getByTitle("Preview Sandbox");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "srcdoc",
      "<!-- injected --><html><body>Hello</body></html>",
    );
  });

  it("renders the look-inside button with block count", () => {
    renderPanel({ blockCount: 5 });
    expect(screen.getByLabelText("Look Inside")).toBeInTheDocument();
    expect(screen.getByText("5 Blocks")).toBeInTheDocument();
  });

  it("renders the look-inside button without block count", () => {
    renderPanel({ blockCount: undefined });
    const btn = screen.getByLabelText("Look Inside");
    expect(btn).toBeInTheDocument();
    // When no blockCount, shows the aria label text
    expect(btn.textContent).toContain("Look Inside");
  });

  it("calls onLookInside when blocks button clicked", () => {
    const { props } = renderPanel();
    fireEvent.click(screen.getByLabelText("Look Inside"));
    expect(props.onLookInside).toHaveBeenCalledOnce();
  });

  // --- Show Chat button ---

  it("does not show the show-chat button when chat is visible", () => {
    renderPanel({ isChatVisible: true });
    expect(screen.queryByLabelText("Show Chat")).not.toBeInTheDocument();
  });

  it("shows the show-chat button when chat is hidden", () => {
    renderPanel({ isChatVisible: false });
    expect(screen.getByLabelText("Show Chat")).toBeInTheDocument();
  });

  it("calls onShowChat when show-chat button clicked", () => {
    const { props } = renderPanel({ isChatVisible: false });
    fireEvent.click(screen.getByLabelText("Show Chat"));
    expect(props.onShowChat).toHaveBeenCalledOnce();
  });

  // --- Download button ---

  it("calls downloadHtml when download button clicked", () => {
    renderPanel({ projectTitle: "My Game" });
    fireEvent.click(screen.getByLabelText("Download project"));
    expect(downloadHtml).toHaveBeenCalledWith(
      "<html><body>Hello</body></html>",
      "My Game",
    );
  });

  it("uses empty string when projectTitle is undefined", () => {
    renderPanel({ projectTitle: undefined });
    fireEvent.click(screen.getByLabelText("Download project"));
    expect(downloadHtml).toHaveBeenCalledWith(
      "<html><body>Hello</body></html>",
      "",
    );
  });

  it("disables download button when loading", () => {
    renderPanel({ isLoading: true });
    expect(screen.getByLabelText("Download project")).toBeDisabled();
  });

  // --- Share button ---

  it("does not render share button when canWebShare returns false", () => {
    vi.mocked(canWebShare).mockReturnValue(false);
    renderPanel();
    expect(screen.queryByTestId("share-btn")).not.toBeInTheDocument();
  });

  it("renders share button when canWebShare returns true", () => {
    vi.mocked(canWebShare).mockReturnValue(true);
    renderPanel();
    expect(screen.getByTestId("share-btn")).toBeInTheDocument();
  });

  it("calls shareProject when share button clicked", () => {
    vi.mocked(canWebShare).mockReturnValue(true);
    renderPanel({ projectTitle: "Cool App" });
    fireEvent.click(screen.getByTestId("share-btn"));
    expect(shareProject).toHaveBeenCalledWith(
      "<html><body>Hello</body></html>",
      "Cool App",
    );
  });

  it("disables share button when loading", () => {
    vi.mocked(canWebShare).mockReturnValue(true);
    renderPanel({ isLoading: true });
    expect(screen.getByTestId("share-btn")).toBeDisabled();
  });

  // --- Copy HTML button ---

  it("calls copyHtmlToClipboard when copy button clicked", async () => {
    renderPanel();
    await act(async () => {
      fireEvent.click(screen.getByTestId("copy-html-btn"));
    });
    expect(copyHtmlToClipboard).toHaveBeenCalledWith(
      "<html><body>Hello</body></html>",
    );
  });

  it("shows copied feedback after successful copy", async () => {
    renderPanel();
    await act(async () => {
      fireEvent.click(screen.getByTestId("copy-html-btn"));
    });
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("reverts copied feedback after 2 seconds", async () => {
    renderPanel();
    await act(async () => {
      fireEvent.click(screen.getByTestId("copy-html-btn"));
    });
    expect(screen.getByText("Copied!")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    expect(screen.getByText("Copy HTML")).toBeInTheDocument();
  });

  it("does not show copied feedback when copy fails", async () => {
    vi.mocked(copyHtmlToClipboard).mockResolvedValue(false);
    renderPanel();
    await act(async () => {
      fireEvent.click(screen.getByTestId("copy-html-btn"));
    });
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
  });

  it("disables copy button when loading", () => {
    renderPanel({ isLoading: true });
    expect(screen.getByTestId("copy-html-btn")).toBeDisabled();
  });

  // --- Loading state ---

  it("applies blur/scale classes when loading", () => {
    renderPanel({ isLoading: true });
    const iframe = screen.getByTitle("Preview Sandbox");
    expect(iframe.className).toContain("blur-[2px]");
    expect(iframe.className).toContain("scale-105");
    expect(iframe.className).toContain("opacity-30");
  });

  it("applies normal classes when not loading", () => {
    renderPanel({ isLoading: false });
    const iframe = screen.getByTitle("Preview Sandbox");
    expect(iframe.className).toContain("opacity-100");
    expect(iframe.className).toContain("scale-100");
  });

  // --- BuildingOverlay ---

  it("shows building overlay when loading", () => {
    renderPanel({ isLoading: true });
    expect(screen.getByTestId("building-overlay")).toBeInTheDocument();
    expect(screen.getByText("BUILDING!")).toBeInTheDocument();
  });

  it("does not show building overlay when not loading", () => {
    renderPanel({ isLoading: false });
    expect(screen.queryByTestId("building-overlay")).not.toBeInTheDocument();
  });

  it("uses convertingText for building overlay when provided", () => {
    renderPanel({ isLoading: true, convertingText: "Converting blocks..." });
    expect(screen.getByText("Converting blocks...")).toBeInTheDocument();
  });

  // --- Cleanup ---

  it("cleans up without errors on unmount", () => {
    const { unmount } = renderPanel();
    // Unmount should clean up the useEffect without errors
    expect(() => unmount()).not.toThrow();
  });
});
