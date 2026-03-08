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
  let mockSubmit: any;

  beforeEach(() => {
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    
    // Default mock behavior for useObject
    mockSubmit = vi.fn();
    (aiSdkReact.experimental_useObject as any).mockReturnValue({
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
    (aiSdkReact.experimental_useObject as any).mockReturnValue({
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
});
