import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

  describe("injectErrorCatcher branches", () => {
    it("injects script after <head> if present", () => {
      mockStorage["inspiror-currentCode"] =
        "<html><head></head><body></body></html>";
      render(<App />);
      const iframe = screen.getByTitle("Preview Sandbox");
      expect(iframe).toHaveAttribute(
        "srcDoc",
        expect.stringMatching(/<head><script>.*<\/script><\/head>/),
      );
    });

    it("injects script after <body if present but no head", () => {
      mockStorage["inspiror-currentCode"] = "<html><body></body></html>";
      render(<App />);
      const iframe = screen.getByTitle("Preview Sandbox");
      expect(iframe).toHaveAttribute(
        "srcDoc",
        expect.stringMatching(/<html><script>.*<\/script><body>/),
      );
    });

    it("injects script after <html if no body or head", () => {
      mockStorage["inspiror-currentCode"] = "<html><div>hello</div></html>";
      render(<App />);
      const iframe = screen.getByTitle("Preview Sandbox");
      expect(iframe).toHaveAttribute(
        "srcDoc",
        expect.stringMatching(/<html><script>.*<\/script><div>/),
      );
    });

    it("injects script after doctype if no html tag", () => {
      mockStorage["inspiror-currentCode"] = "<!DOCTYPE html><div>hello</div>";
      render(<App />);
      const iframe = screen.getByTitle("Preview Sandbox");
      expect(iframe).toHaveAttribute(
        "srcDoc",
        expect.stringMatching(/<!DOCTYPE html><script>.*<\/script><div>/),
      );
    });

    it("prepends script if no valid tags found", () => {
      mockStorage["inspiror-currentCode"] = "<div>hello</div>";
      render(<App />);
      const iframe = screen.getByTitle("Preview Sandbox");
      expect(iframe).toHaveAttribute(
        "srcDoc",
        expect.stringMatching(/^<script>.*<\/script><div>/),
      );
    });
  });

  describe("Error handling and auto-fix loop", () => {
    it("handles stream onError callback", async () => {
      let triggerError: (err: Error) => void;
      (aiSdkReact.experimental_useObject as any).mockImplementation(
        ({ onError }: any) => {
          triggerError = onError;
          return { object: undefined, submit: mockSubmit, isLoading: false };
        },
      );

      render(<App />);
      await act(async () => {
        triggerError!(new Error("Network failure"));
      });

      expect(
        await screen.findByText("Oops, my connection broke! Can we try again?"),
      ).toBeInTheDocument();
    });

    it("auto-fixes iframe errors but limits to 2 consecutive attempts", async () => {
      render(<App />);

      // Trigger first error
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: {
              type: "iframe-error",
              message: "SyntaxError: x is not defined",
            },
          }),
        );
      });

      // Verify first auto-fix
      expect(
        await screen.findByText(
          /Oops, I made a little mistake! Let me fix that/i,
        ),
      ).toBeInTheDocument();
      expect(mockSubmit).toHaveBeenCalledTimes(1);

      // Trigger second error
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: {
              type: "iframe-error",
              message: "ReferenceError: y is not defined",
            },
          }),
        );
      });

      // Verify second auto-fix attempt
      expect(mockSubmit).toHaveBeenCalledTimes(2);

      // Trigger third error (should hit limit)
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: {
              type: "iframe-error",
              message: "TypeError: z is not a function",
            },
          }),
        );
      });

      // Verify limit was reached, no new submit
      expect(mockSubmit).toHaveBeenCalledTimes(2);
      expect(
        await screen.findByText(
          /Hmm, this bug is really tricky! It keeps breaking/i,
        ),
      ).toBeInTheDocument();
    });
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
    expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();
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

  describe("Additional Edge Cases", () => {
    it("ignores iframe error if already loading", async () => {
      (aiSdkReact.experimental_useObject as any).mockReturnValue({
        object: undefined,
        submit: mockSubmit,
        isLoading: true,
      });
      render(<App />);
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "iframe-error", message: "Error!" },
          })
        );
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it("defaults to 'Unknown error' if message is missing in iframe event", async () => {
      render(<App />);
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "iframe-error" },
          })
        );
      });
      expect(await screen.findByText(/Unknown error/i)).toBeInTheDocument();
    });

    it("updates messages and currentCode when stream finishes", async () => {
      let triggerFinish: (args: any) => void;
      (aiSdkReact.experimental_useObject as any).mockImplementation(({ onFinish }: any) => {
        triggerFinish = onFinish;
        return { object: undefined, submit: mockSubmit, isLoading: false };
      });

      render(<App />);
      
      await act(async () => {
        triggerFinish!({ object: { reply: "Done building!", code: "<html>SUCCESS</html>" } });
      });

      expect(await screen.findByText("Done building!")).toBeInTheDocument();
    });

    it("handles partial finish object gracefully", async () => {
      let triggerFinish: (args: any) => void;
      (aiSdkReact.experimental_useObject as any).mockImplementation(({ onFinish }: any) => {
        triggerFinish = onFinish;
        return { object: undefined, submit: mockSubmit, isLoading: false };
      });

      render(<App />);
      
      await act(async () => {
        triggerFinish!({ object: {} });
      });

      expect(screen.queryByText("Done building!")).not.toBeInTheDocument();
    });

    it("falls back to default if JSON.parse throws in loadFromStorage", () => {
      mockLocalStorage.getItem.mockReturnValueOnce("invalid-json{");
      render(<App />);
      expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();
    });
  });
});
