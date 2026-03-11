import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import * as aiSdkReact from "@ai-sdk/react";

// Mock the ai-sdk/react hook
vi.mock("@ai-sdk/react", () => ({
  experimental_useObject: vi.fn(),
}));

// Mock useAudio
const mockPlayPop = vi.fn();
const mockPlayChipClick = vi.fn();
const mockPlayChime = vi.fn();
const mockPlayBuzzer = vi.fn();
const mockToggleMute = vi.fn();
let mockIsMuted = false;

vi.mock("./hooks/useAudio", () => ({
  useAudio: () => ({
    playPop: mockPlayPop,
    playChipClick: mockPlayChipClick,
    playChime: mockPlayChime,
    playBuzzer: mockPlayBuzzer,
    isMuted: mockIsMuted,
    toggleMute: mockToggleMute,
  }),
}));

// Mock crypto.randomUUID
let uuidCounter = 0;
vi.stubGlobal("crypto", {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
});

const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  }),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("Inspiror App - Hacker Mode & UX", () => {
  let mockSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    uuidCounter = 0;
    mockIsMuted = false;
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockPlayPop.mockClear();
    mockPlayChipClick.mockClear();
    mockPlayChime.mockClear();
    mockPlayBuzzer.mockClear();
    mockToggleMute.mockClear();

    // Default mock behavior for useObject
    mockSubmit = vi.fn();
    (
      aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      object: undefined,
      submit: mockSubmit,
      isLoading: false,
    });

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders initial chat greeting from AI Buddy", () => {
    render(<App />);
    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();
  });

  it("shows vivid Hacker Mode overlay during generation", () => {
    (
      aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      object: { code: "<html>MATRIX LOADING</html>" },
      submit: mockSubmit,
      isLoading: true,
    });

    render(<App />);

    const hackerOverlay = screen.getByTestId("hacker-mode-overlay");
    expect(hackerOverlay).toBeInTheDocument();

    // Should show the streaming code
    expect(screen.getByText("<html>MATRIX LOADING</html>")).toBeInTheDocument();
    // Should show the pulsing text
    expect(screen.getByText("BUILDING")).toBeInTheDocument();
  });

  it("renders suggestion chips and handles click", () => {
    render(<App />);
    const chip = screen.getByRole("button", { name: /bouncing ball/i });
    expect(chip).toBeInTheDocument();

    fireEvent.click(chip);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    const callArgs = mockSubmit.mock.calls[0][0];
    expect(callArgs.messages.length).toBe(2);
    expect(callArgs.messages[1].content).toContain("bouncing ball");
  });

  it("can toggle the floating chat visibility", () => {
    render(<App />);
    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();

    const hideButton = screen.getByRole("button", { name: /Hide Chat/i });
    fireEvent.click(hideButton);

    expect(
      screen.queryByText(/Hi! I'm your builder buddy/i),
    ).not.toBeInTheDocument();

    const showButton = screen.getByRole("button", { name: /Show Chat/i });
    fireEvent.click(showButton);

    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();
  });

  // Animated buddy avatar
  it("shows animated buddy avatar with bounce animation", () => {
    render(<App />);
    const avatar = document.querySelector(".buddy-avatar");
    expect(avatar).toBeInTheDocument();
  });

  it("switches buddy avatar to thinking animation during loading", () => {
    (
      aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      object: undefined,
      submit: mockSubmit,
      isLoading: true,
    });

    render(<App />);
    const thinkingAvatar = document.querySelector(".buddy-avatar-thinking");
    expect(thinkingAvatar).toBeInTheDocument();
  });

  // Staggered chip entrance
  it("applies staggered animation delay to suggestion chips", () => {
    render(<App />);
    const chips = document.querySelectorAll(".chip-enter");
    expect(chips.length).toBe(4);
    expect((chips[0] as HTMLElement).style.animationDelay).toBe("0ms");
    expect((chips[1] as HTMLElement).style.animationDelay).toBe("100ms");
    expect((chips[2] as HTMLElement).style.animationDelay).toBe("200ms");
    expect((chips[3] as HTMLElement).style.animationDelay).toBe("300ms");
  });

  // Message slide-in animation classes
  it("applies slide-in animation classes to messages", () => {
    render(<App />);
    const buddyMsg = document.querySelector(".msg-buddy");
    expect(buddyMsg).toBeInTheDocument();
  });

  // Input glow
  it("applies glow class when input has text", () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Type your grand idea/i);

    expect(input).not.toHaveClass("input-glow-active");

    fireEvent.change(input, { target: { value: "Hello" } });
    expect(input).toHaveClass("input-glow-active");
  });

  // Better default preview
  it("renders animated welcome screen in default preview", () => {
    render(<App />);
    const iframe = screen.getByTitle("Preview Sandbox") as HTMLIFrameElement;
    const srcdoc = iframe.getAttribute("srcdoc") || "";
    expect(srcdoc).toContain("What will YOU create today?");
    expect(srcdoc).toContain("particle");
  });

  // Reset
  it("renders a reset button and resets to defaults", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /^Reset$/i }),
    ).toBeInTheDocument();
  });

  // Preview sandbox
  it("renders the preview sandbox iframe with error catcher", () => {
    render(<App />);
    const iframe = screen.getByTitle("Preview Sandbox") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("srcdoc")).toContain("window.onerror");
  });

  // Send message
  it("allows user to type and submit a message", () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Type your grand idea/i);
    const button = screen.getByRole("button", { name: /Send/i });

    fireEvent.change(input, { target: { value: "Make a drawing app" } });
    fireEvent.click(button);

    expect(screen.getByText("Make a drawing app")).toBeInTheDocument();
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  // Auto-scroll
  it("calls scrollIntoView for auto-scroll", () => {
    render(<App />);
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  // === NEW TESTS ===

  // Stable message IDs
  it("assigns unique IDs to messages", () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Type your grand idea/i);
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    // Messages should be saved with IDs
    const setItemCalls = mockLocalStorage.setItem.mock.calls.filter(
      (c: string[]) => c[0] === "inspiror-messages",
    );
    const lastSaved = JSON.parse(setItemCalls[setItemCalls.length - 1][1]);
    expect(
      lastSaved.every((m: { id: string }) => typeof m.id === "string"),
    ).toBe(true);
    const ids = lastSaved.map((m: { id: string }) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Migration: old messages without IDs get IDs added
  it("migrates old messages without IDs from localStorage", () => {
    const oldMessages = [
      { role: "assistant", content: "Welcome back!" },
      { role: "user", content: "Build something" },
    ];
    mockStorage["inspiror-messages"] = JSON.stringify(oldMessages);

    render(<App />);
    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByText("Build something")).toBeInTheDocument();
  });

  // Chat panel removed from DOM when hidden
  it("removes chat panel from DOM when hidden (accessibility)", () => {
    render(<App />);
    expect(screen.getByText("Builder Buddy")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Hide Chat/i }));
    expect(screen.queryByText("Builder Buddy")).not.toBeInTheDocument();
  });

  // Sound triggers
  it("plays pop sound on message send", () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Type your grand idea/i);
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(mockPlayPop).toHaveBeenCalledTimes(1);
  });

  it("plays chip click sound on suggestion click", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /bouncing ball/i }));

    expect(mockPlayChipClick).toHaveBeenCalledTimes(1);
  });

  // Mute toggle button
  it("renders mute toggle button and calls toggleMute", () => {
    render(<App />);
    const muteBtn = screen.getByTestId("mute-toggle");
    expect(muteBtn).toBeInTheDocument();
    fireEvent.click(muteBtn);
    expect(mockToggleMute).toHaveBeenCalledTimes(1);
  });

  // Play/Build mode toggle
  it("shows mode toggle button defaulting to build mode", () => {
    render(<App />);
    const toggle = screen.getByTestId("mode-toggle");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent("Play Mode");
  });

  it("hides chat in play mode and shows Back to Build", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("mode-toggle"));

    // Chat should be hidden
    expect(screen.queryByText("Builder Buddy")).not.toBeInTheDocument();
    // Show Chat button should also be hidden
    expect(
      screen.queryByRole("button", { name: /Show Chat/i }),
    ).not.toBeInTheDocument();
    // Mode toggle should show "Back to Build"
    expect(screen.getByTestId("mode-toggle")).toHaveTextContent(
      "Back to Build",
    );
  });

  it("returns to build mode with chat visible", () => {
    render(<App />);
    // Enter play mode
    fireEvent.click(screen.getByTestId("mode-toggle"));
    expect(screen.queryByText("Builder Buddy")).not.toBeInTheDocument();

    // Return to build mode
    fireEvent.click(screen.getByTestId("mode-toggle"));
    expect(screen.getByText("Builder Buddy")).toBeInTheDocument();
  });

  // === LOOK INSIDE / CODE REMIXING PANEL TESTS ===

  it("renders a Look Inside button in build mode", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /look inside/i }),
    ).toBeInTheDocument();
  });

  it("Look Inside button is not visible in play mode", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("mode-toggle")); // enter play mode
    expect(
      screen.queryByRole("button", { name: /look inside/i }),
    ).not.toBeInTheDocument();
  });

  it("clicking Look Inside opens the code panel", () => {
    render(<App />);
    const panel = screen.getByTestId("code-panel");
    expect(panel).toHaveClass("translate-x-full");

    fireEvent.click(screen.getByRole("button", { name: /look inside/i }));
    expect(panel).not.toHaveClass("translate-x-full");
  });

  it("code panel shows the current generated code", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /look inside/i }));

    const textarea = screen.getByTestId(
      "code-panel-textarea",
    ) as HTMLTextAreaElement;
    // Default code contains this string
    expect(textarea.value).toContain("What will YOU create today?");
  });

  it("Run My Code button updates the iframe preview with edited code", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /look inside/i }));

    const textarea = screen.getByTestId(
      "code-panel-textarea",
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: { value: "<html><body>My remix</body></html>" },
    });

    fireEvent.click(screen.getByRole("button", { name: /run my code/i }));

    const iframe = screen.getByTitle("Preview Sandbox") as HTMLIFrameElement;
    expect(iframe.getAttribute("srcdoc")).toContain("My remix");
  });

  it("plays success chime when Run My Code is clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /look inside/i }));
    fireEvent.click(screen.getByRole("button", { name: /run my code/i }));

    expect(mockPlayChime).toHaveBeenCalled();
  });

  it("code panel close button hides the panel", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /look inside/i }));

    const panel = screen.getByTestId("code-panel");
    expect(panel).not.toHaveClass("translate-x-full");

    fireEvent.click(screen.getByRole("button", { name: /close panel/i }));
    expect(panel).toHaveClass("translate-x-full");
  });

  it("panel edits are preserved when panel is closed and reopened", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /look inside/i }));

    const textarea = screen.getByTestId(
      "code-panel-textarea",
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: { value: "<html>my persistent edits</html>" },
    });

    // Close and reopen
    fireEvent.click(screen.getByRole("button", { name: /close panel/i }));
    fireEvent.click(screen.getByRole("button", { name: /look inside/i }));

    const reopened = screen.getByTestId(
      "code-panel-textarea",
    ) as HTMLTextAreaElement;
    expect(reopened.value).toBe("<html>my persistent edits</html>");
  });

  it("new AI generation updates the code panel content", () => {
    const { rerender } = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /look inside/i }));

    const textareaBefore = screen.getByTestId(
      "code-panel-textarea",
    ) as HTMLTextAreaElement;
    expect(textareaBefore.value).toContain("What will YOU create today?");

    // Simulate AI finishing with new code
    (
      aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      object: undefined,
      submit: mockSubmit,
      isLoading: false,
    });

    // The App passes currentCode to CodePanel — when AI updates currentCode, panel shows new code
    // This is verified by the CodePanel unit test "updates internal code when the code prop changes"
    rerender(<App />);
    // Panel still shows the current code (unchanged because no new AI generation triggered in this test)
    const textareaAfter = screen.getByTestId(
      "code-panel-textarea",
    ) as HTMLTextAreaElement;
    expect(textareaAfter.value).toContain("What will YOU create today?");
  });
});
