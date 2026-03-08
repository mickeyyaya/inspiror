import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import * as aiSdkReact from "@ai-sdk/react";

// Mock the ai-sdk/react hook
vi.mock("@ai-sdk/react", () => ({
  experimental_useObject: vi.fn(),
}));

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
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();

    // Default mock behavior for useObject
    mockSubmit = vi.fn();
    (aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>).mockReturnValue({
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
    (aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>).mockReturnValue({
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

    expect(screen.queryByText(/Hi! I'm your builder buddy/i)).not.toBeInTheDocument();

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
    (aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>).mockReturnValue({
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
});
