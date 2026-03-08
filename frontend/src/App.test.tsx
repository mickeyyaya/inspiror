import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import App from "./App";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  }),
  get length() {
    return Object.keys(mockStorage).length;
  },
  key: vi.fn((i: number) => Object.keys(mockStorage)[i] ?? null),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock scrollIntoView for auto-scroll tests
Element.prototype.scrollIntoView = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  mockLocalStorage.clear();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
});

describe("Inspiror App", () => {
  it("renders initial chat greeting from AI Buddy", () => {
    render(<App />);
    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();
  });

  it("allows user to type and submit a message and shows loading state", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Here you go!", code: "<html></html>" }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    const button = screen.getByRole("button", { name: /Send/i });

    fireEvent.change(input, { target: { value: "Make a drawing app" } });
    fireEvent.click(button);

    expect(screen.getByText("Make a drawing app")).toBeInTheDocument();
    expect(screen.getAllByText(/Building.../i).length).toBeGreaterThan(0);
  });

  it("can toggle the floating chat visibility via CSS slide", () => {
    render(<App />);

    // Chat panel is always in the DOM, but visible initially
    const chatPanel = document.querySelector(".chat-panel");
    expect(chatPanel).toHaveClass("chat-panel-visible");

    const toggleButton = screen.getByRole("button", { name: /Hide Chat/i });
    fireEvent.click(toggleButton);

    // Panel should have hidden class
    expect(chatPanel).toHaveClass("chat-panel-hidden");

    const showButton = screen.getByRole("button", { name: /Show Chat/i });
    fireEvent.click(showButton);

    // Panel should be visible again
    expect(chatPanel).toHaveClass("chat-panel-visible");
  });

  it("renders the preview sandbox iframe", () => {
    render(<App />);
    const iframe = screen.getByTitle("Preview Sandbox");
    expect(iframe).toBeInTheDocument();
  });

  it("injects error-catching script into iframe srcDoc", () => {
    render(<App />);
    const iframe = screen.getByTitle("Preview Sandbox") as HTMLIFrameElement;
    expect(iframe.getAttribute("srcdoc")).toContain("window.onerror");
    expect(iframe.getAttribute("srcdoc")).toContain("postMessage");
    expect(iframe.getAttribute("srcdoc")).toContain("iframe-error");
  });

  // Phase 2: Contextual Memory
  it("sends currentCode alongside messages in the API call", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: "Done!",
        code: "<html><body>Updated</body></html>",
      }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    const button = screen.getByRole("button", { name: /Send/i });

    fireEvent.change(input, { target: { value: "Change the color" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const fetchCall = mockFetch.mock.calls[0]!;
    const body = JSON.parse(fetchCall[1].body);
    expect(body).toHaveProperty("currentCode");
    expect(typeof body.currentCode).toBe("string");
  });

  // Phase 3: Auto-Fix Error Handling
  it("catches iframe errors and auto-triggers a fix request", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: "Fixed it!",
        code: "<html><body>Fixed</body></html>",
      }),
    });

    render(<App />);

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: "iframe-error",
            message: "Uncaught ReferenceError: x is not defined",
          },
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Oops, I made a little mistake/i),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]!;
      const body = JSON.parse(lastCall[1].body);
      const errorMessage = body.messages.find(
        (m: { role: string; content: string }) =>
          m.content.includes("Uncaught ReferenceError"),
      );
      expect(errorMessage).toBeDefined();
    });
  });

  // Phase 4: Local Storage Persistence
  it("saves messages and currentCode to localStorage when updated", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: "Here is your app!",
        code: "<html><body>App</body></html>",
      }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    const button = screen.getByRole("button", { name: /Send/i });

    fireEvent.change(input, { target: { value: "Build a calculator" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Here is your app!")).toBeInTheDocument();
    });

    const savedMessages = JSON.parse(mockStorage["inspiror-messages"] || "[]");
    const savedCode = mockStorage["inspiror-currentCode"];

    expect(savedMessages.length).toBeGreaterThan(1);
    expect(savedCode).toBe("<html><body>App</body></html>");
  });

  it("initializes state from localStorage on load", () => {
    const storedMessages = [
      { role: "assistant", content: "Welcome back!" },
      { role: "user", content: "Continue my game" },
    ];
    const storedCode = "<html><body>Saved Game</body></html>";

    mockStorage["inspiror-messages"] = JSON.stringify(storedMessages);
    mockStorage["inspiror-currentCode"] = storedCode;

    render(<App />);

    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByText("Continue my game")).toBeInTheDocument();
  });

  // Phase 2b: Suggestion Chips
  it("renders suggestion chips when only the initial greeting is shown", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /bouncing ball/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /neon paint/i }),
    ).toBeInTheDocument();
  });

  it("clicking a suggestion chip sends the message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Great choice!", code: "<html></html>" }),
    });

    render(<App />);
    const chip = screen.getByRole("button", { name: /bouncing ball/i });
    fireEvent.click(chip);

    // User message from chip should appear
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Chips should disappear after sending
    expect(
      screen.queryByRole("button", { name: /bouncing ball/i }),
    ).not.toBeInTheDocument();
  });

  // Phase 5: Clear/Reset
  it("renders a clear/reset button in the chat header", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();
  });

  it("clicking reset clears messages and code back to defaults", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: "Built it!",
        code: "<html><body>Custom</body></html>",
      }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    fireEvent.change(input, { target: { value: "Build something" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText("Built it!")).toBeInTheDocument();
    });

    // Click reset
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));

    // Should show initial greeting again
    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();
    // Custom message should be gone
    expect(screen.queryByText("Built it!")).not.toBeInTheDocument();
    // Suggestion chips should reappear
    expect(
      screen.getByRole("button", { name: /bouncing ball/i }),
    ).toBeInTheDocument();
  });

  // Phase 1.5: Hacker Mode UI
  it("shows hacker mode code overlay during generation", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Here you go!", code: "<html></html>" }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    fireEvent.change(input, { target: { value: "Build a game" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    // Hacker mode overlay should appear during generation
    expect(screen.getByTestId("hacker-mode-overlay")).toBeInTheDocument();
  });

  it("hides hacker mode overlay after generation completes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Done building!", code: "<html></html>" }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    fireEvent.change(input, { target: { value: "Build a game" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText("Done building!")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("hacker-mode-overlay")).not.toBeInTheDocument();
  });

  it("does not render suggestion chips after user has sent a message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Done!", code: "<html></html>" }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    fireEvent.change(input, { target: { value: "Build something" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText("Done!")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /bouncing ball/i }),
    ).not.toBeInTheDocument();
  });

  // === NEW TESTS FOR UI/UX IMPROVEMENTS ===

  // Improvement 4: Auto-scroll
  it("has an auto-scroll anchor element at the end of messages", () => {
    render(<App />);
    // The scrollIntoView mock should have been called
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  // Improvement 2: Confetti
  it("shows confetti after generation completes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: "Built your app!",
        code: "<html><body>Done</body></html>",
      }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    fireEvent.change(input, { target: { value: "Build something cool" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText("Built your app!")).toBeInTheDocument();
    });

    expect(screen.getByTestId("confetti-burst")).toBeInTheDocument();
  });

  // Improvement 5: Animated buddy avatar
  it("shows animated buddy avatar with bounce animation", () => {
    render(<App />);
    const avatar = document.querySelector(".buddy-avatar");
    expect(avatar).toBeInTheDocument();
  });

  // Improvement 5: Thinking animation during generation
  it("switches buddy avatar to thinking animation during generation", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Done!", code: "<html></html>" }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    fireEvent.change(input, { target: { value: "Build a game" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    const thinkingAvatar = document.querySelector(".buddy-avatar-thinking");
    expect(thinkingAvatar).toBeInTheDocument();
  });

  // Improvement 6: Staggered chip entrance
  it("applies staggered animation delay to suggestion chips", () => {
    render(<App />);
    const chips = document.querySelectorAll(".chip-enter");
    expect(chips.length).toBe(4);
    // Check that animation delays are staggered
    expect((chips[0] as HTMLElement).style.animationDelay).toBe("0ms");
    expect((chips[1] as HTMLElement).style.animationDelay).toBe("100ms");
    expect((chips[2] as HTMLElement).style.animationDelay).toBe("200ms");
    expect((chips[3] as HTMLElement).style.animationDelay).toBe("300ms");
  });

  // Improvement 8: Chat slide animation
  it("uses CSS transition classes instead of conditional render for chat panel", () => {
    render(<App />);
    const chatPanel = document.querySelector(".chat-panel");
    expect(chatPanel).toBeInTheDocument();
    expect(chatPanel).toHaveClass("chat-panel-visible");
  });

  // Improvement 10: Input glow
  it("applies glow class when input has text", () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);

    // No glow initially
    expect(input).not.toHaveClass("input-glow-active");

    // Type text
    fireEvent.change(input, { target: { value: "Hello" } });

    // Should have glow
    expect(input).toHaveClass("input-glow-active");
  });

  // Improvement 3: Message slide-in animation classes
  it("applies slide-in animation classes to messages", () => {
    render(<App />);
    // The initial assistant message should have msg-buddy class
    const buddyMsg = document.querySelector(".msg-buddy");
    expect(buddyMsg).toBeInTheDocument();
  });

  // Improvement 7: Better default preview
  it("renders an animated welcome screen in the default preview", () => {
    render(<App />);
    const iframe = screen.getByTitle("Preview Sandbox") as HTMLIFrameElement;
    const srcdoc = iframe.getAttribute("srcdoc") || "";
    expect(srcdoc).toContain("What will YOU create today?");
    expect(srcdoc).toContain("particle");
  });

  // Improvement 1: Matrix rain in hacker mode
  it("renders matrix rain columns during generation", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Done!", code: "<html></html>" }),
    });

    render(<App />);
    const input = screen.getByPlaceholderText(/Type your idea here/i);
    fireEvent.change(input, { target: { value: "Build a game" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    const matrixColumns = document.querySelectorAll(".matrix-column");
    expect(matrixColumns.length).toBeGreaterThan(0);

    const scanline = document.querySelector(".scanline-overlay");
    expect(scanline).toBeInTheDocument();
  });
});
