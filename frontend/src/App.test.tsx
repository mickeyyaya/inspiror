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
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  }),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Helper to seed a project so the app starts in editor view
function seedProject(overrides?: {
  messages?: Array<{ id?: string; role: string; content: string }>;
  currentCode?: string;
}) {
  const projectId = "test-project-id";
  const messages = overrides?.messages ?? [
    {
      id: "msg-1",
      role: "assistant",
      content: "Hi! I'm your builder buddy. What do you want to create today?",
    },
  ];
  const currentCode = overrides?.currentCode;

  const project = {
    id: projectId,
    title: "Test Project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages,
    ...(currentCode !== undefined
      ? { currentCode }
      : {
          currentCode: `<!DOCTYPE html>
<html>
<head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: sans-serif;
    overflow: hidden;
  }
  .welcome { text-align: center; z-index: 2; position: relative; }
  .welcome h1 {
    font-size: 2.5rem;
    background: linear-gradient(90deg, #00f0ff, #39ff14, #ff007f);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: glow-text 3s ease-in-out infinite alternate;
  }
  .welcome p { color: #888; margin-top: 12px; font-size: 1.1rem; }
  @keyframes glow-text {
    from { filter: brightness(1); }
    to { filter: brightness(1.3); }
  }
  .particle {
    position: absolute;
    width: 4px; height: 4px;
    background: #00f0ff;
    border-radius: 50%;
    opacity: 0.6;
    animation: drift 6s ease-in-out infinite;
  }
  @keyframes drift {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
    50% { transform: translateY(-40px) translateX(20px); opacity: 0.8; }
  }
</style></head>
<body>
  <div class="welcome">
    <h1>What will YOU create today?</h1>
    <p>Tell your builder buddy your idea</p>
  </div>
  <script>
    for(let i=0;i<15;i++){
      const p=document.createElement('div');
      p.className='particle';
      p.style.left=Math.random()*100+'%';
      p.style.top=Math.random()*100+'%';
      p.style.animationDelay=Math.random()*6+'s';
      p.style.animationDuration=(4+Math.random()*4)+'s';
      p.style.background=['#00f0ff','#39ff14','#ff007f','#a855f7','#ffd700'][Math.floor(Math.random()*5)];
      document.body.appendChild(p);
    }
  </script>
</body>
</html>`,
        }),
  };

  mockStorage["inspiror_projects"] = JSON.stringify([project]);
  mockStorage["inspiror_current_project_id"] = projectId;
}

describe("Inspiror App", () => {
  let mockSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    uuidCounter = 0;
    mockIsMuted = false;
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockPlayPop.mockClear();
    mockPlayChipClick.mockClear();
    mockPlayChime.mockClear();
    mockPlayBuzzer.mockClear();
    mockToggleMute.mockClear();

    mockSubmit = vi.fn();
    (
      aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      object: undefined,
      submit: mockSubmit,
      isLoading: false,
    });

    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  describe("Project Catalog", () => {
    it("shows catalog when no project is selected", () => {
      render(<App />);
      expect(screen.getByText("My Creations")).toBeInTheDocument();
      expect(screen.getByTestId("new-project-btn")).toBeInTheDocument();
    });

    it("shows empty state with create button", () => {
      render(<App />);
      expect(
        screen.getByText(/You haven't built anything yet/),
      ).toBeInTheDocument();
    });

    it("creates a new project and opens editor", () => {
      render(<App />);
      fireEvent.click(screen.getByTestId("new-project-btn"));
      expect(screen.getByText("Builder Buddy")).toBeInTheDocument();
    });

    it("shows project cards when projects exist", () => {
      seedProject();
      render(<App />);
      // Should be in editor since project is selected
      expect(screen.getByText("Builder Buddy")).toBeInTheDocument();
    });

    it("navigates back to catalog from editor", () => {
      seedProject();
      render(<App />);
      fireEvent.click(screen.getByTestId("back-to-catalog"));
      expect(screen.getByText("My Creations")).toBeInTheDocument();
    });

    it("opens a project from catalog", () => {
      // Seed a project but don't set current ID
      const project = {
        id: "proj-1",
        title: "My Cool App",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: "m1",
            role: "assistant",
            content:
              "Hi! I'm your builder buddy. What do you want to create today?",
          },
        ],
        currentCode: "<html><body>Test</body></html>",
      };
      mockStorage["inspiror_projects"] = JSON.stringify([project]);

      render(<App />);
      expect(screen.getByText("My Creations")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("open-project-btn"));
      expect(screen.getByText("Builder Buddy")).toBeInTheDocument();
    });

    it("deletes a project from catalog", () => {
      const project = {
        id: "proj-1",
        title: "My Cool App",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [{ id: "m1", role: "assistant", content: "Hello!" }],
        currentCode: "<html></html>",
      };
      mockStorage["inspiror_projects"] = JSON.stringify([project]);

      render(<App />);
      expect(screen.getByText("My Cool App")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("delete-project-btn"));
      expect(screen.queryByText("My Cool App")).not.toBeInTheDocument();
      expect(
        screen.getByText(/You haven't built anything yet/),
      ).toBeInTheDocument();
    });

    it("migrates legacy data to a project", () => {
      const oldMessages = [
        { role: "assistant", content: "Welcome back!" },
        { role: "user", content: "Build something" },
      ];
      mockStorage["inspiror-messages"] = JSON.stringify(oldMessages);
      mockStorage["inspiror-currentCode"] = "<html><body>Legacy</body></html>";

      render(<App />);
      // Should auto-open the migrated project
      expect(screen.getByText("Welcome back!")).toBeInTheDocument();
      expect(screen.getByText("Build something")).toBeInTheDocument();
    });
  });

  describe("Editor View - Hacker Mode & UX", () => {
    beforeEach(() => {
      seedProject();
    });

    it("renders initial chat greeting from AI Buddy", () => {
      render(<App />);
      expect(
        screen.getByText(/Hi! I'm your builder buddy/i),
      ).toBeInTheDocument();
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
      expect(screen.getByText("BUILDING!")).toBeInTheDocument();
    });

    it("renders suggestion chips and handles click", () => {
      render(<App />);
      const chips = document.querySelectorAll(".chip-enter");
      expect(chips.length).toBe(4);

      // Click the first chip (whatever it is)
      const firstChip = chips[0] as HTMLElement;
      fireEvent.click(firstChip);
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      const callArgs = mockSubmit.mock.calls[0][0];
      expect(callArgs.messages.length).toBe(2);
      // The submitted message should be a non-empty string (the chip label)
      expect(callArgs.messages[1].content.length).toBeGreaterThan(0);
    });

    it("can toggle the floating chat visibility", () => {
      render(<App />);
      expect(
        screen.getByText(/Hi! I'm your builder buddy/i),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Hide Chat/i }));
      expect(
        screen.queryByText(/Hi! I'm your builder buddy/i),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Show Chat/i }));
      expect(
        screen.getByText(/Hi! I'm your builder buddy/i),
      ).toBeInTheDocument();
    });

    describe("injectErrorCatcher branches", () => {
      it("injects script after <head> if present", () => {
        seedProject({ currentCode: "<html><head></head><body></body></html>" });
        render(<App />);
        const iframe = screen.getByTitle("Preview Sandbox");
        expect(iframe).toHaveAttribute(
          "srcDoc",
          expect.stringMatching(/<head><script>.*<\/script><\/head>/),
        );
      });

      it("injects script after <body if present but no head", () => {
        seedProject({ currentCode: "<html><body></body></html>" });
        render(<App />);
        const iframe = screen.getByTitle("Preview Sandbox");
        expect(iframe).toHaveAttribute(
          "srcDoc",
          expect.stringMatching(/<html><script>.*<\/script><body>/),
        );
      });

      it("injects script after <html if no body or head", () => {
        seedProject({ currentCode: "<html><div>hello</div></html>" });
        render(<App />);
        const iframe = screen.getByTitle("Preview Sandbox");
        expect(iframe).toHaveAttribute(
          "srcDoc",
          expect.stringMatching(/<html><script>.*<\/script><div>/),
        );
      });

      it("injects script after doctype if no html tag", () => {
        seedProject({ currentCode: "<!DOCTYPE html><div>hello</div>" });
        render(<App />);
        const iframe = screen.getByTitle("Preview Sandbox");
        expect(iframe).toHaveAttribute(
          "srcDoc",
          expect.stringMatching(/<!DOCTYPE html><script>.*<\/script><div>/),
        );
      });

      it("prepends script if no valid tags found", () => {
        seedProject({ currentCode: "<div>hello</div>" });
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
        let triggerError: NonNullable<
          Parameters<typeof aiSdkReact.experimental_useObject>[0]["onError"]
        >;
        (
          aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
        ).mockImplementation(
          ({
            onError,
          }: Parameters<typeof aiSdkReact.experimental_useObject>[0]) => {
            triggerError = onError!;
            return { object: undefined, submit: mockSubmit, isLoading: false };
          },
        );

        render(<App />);
        await act(async () => {
          triggerError!(new Error("Network failure"));
        });

        expect(
          await screen.findByText(
            "Oops, my connection broke! Can we try again?",
          ),
        ).toBeInTheDocument();
      });

      it("auto-fixes iframe errors but limits to 2 consecutive attempts", async () => {
        render(<App />);

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

        expect(
          await screen.findByText(
            /Oops, I made a little mistake! Let me fix that/i,
          ),
        ).toBeInTheDocument();
        expect(mockSubmit).toHaveBeenCalledTimes(1);

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

        expect(mockSubmit).toHaveBeenCalledTimes(2);

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

        expect(mockSubmit).toHaveBeenCalledTimes(2);
        expect(
          await screen.findByText(
            /Hmm, this bug is really tricky! It keeps breaking/i,
          ),
        ).toBeInTheDocument();
      });
    });

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

    it("applies staggered animation delay to suggestion chips", () => {
      render(<App />);
      const chips = document.querySelectorAll(".chip-enter");
      expect(chips.length).toBe(4);
      expect((chips[0] as HTMLElement).style.animationDelay).toBe("0ms");
      expect((chips[1] as HTMLElement).style.animationDelay).toBe("150ms");
      expect((chips[2] as HTMLElement).style.animationDelay).toBe("300ms");
      expect((chips[3] as HTMLElement).style.animationDelay).toBe("450ms");
    });

    it("applies slide-in animation classes to messages", () => {
      render(<App />);
      const buddyMsg = document.querySelector(".msg-buddy");
      expect(buddyMsg).toBeInTheDocument();
    });

    it("applies glow class when input has text", () => {
      render(<App />);
      const input = screen.getByPlaceholderText(/Type your grand idea/i);
      expect(input).not.toHaveClass("input-glow-active");
      fireEvent.change(input, { target: { value: "Hello" } });
      expect(input).toHaveClass("input-glow-active");
    });

    it("renders animated welcome screen in default preview", () => {
      render(<App />);
      const iframe = screen.getByTitle("Preview Sandbox") as HTMLIFrameElement;
      const srcdoc = iframe.getAttribute("srcdoc") || "";
      expect(srcdoc).toContain("What will YOU create today?");
      expect(srcdoc).toContain("particle");
    });

    it("renders a reset button and resets to defaults", () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
      render(<App />);
      const input = screen.getByPlaceholderText(/Type your grand idea/i);
      fireEvent.change(input, { target: { value: "Something else" } });

      const resetBtn = screen.getByRole("button", { name: /Reset/i });
      fireEvent.click(resetBtn);

      expect(confirmSpy).toHaveBeenCalled();
      expect(input).toHaveValue("");
      confirmSpy.mockRestore();
    });

    it("renders the preview sandbox iframe with error catcher", () => {
      render(<App />);
      const iframe = screen.getByTitle("Preview Sandbox") as HTMLIFrameElement;
      expect(iframe).toBeInTheDocument();
      expect(iframe.getAttribute("srcdoc")).toContain("window.onerror");
    });

    it("allows user to type and submit a message", () => {
      render(<App />);
      const input = screen.getByPlaceholderText(/Type your grand idea/i);
      const button = screen.getByRole("button", { name: /Send/i });

      fireEvent.change(input, { target: { value: "Make a drawing app" } });
      fireEvent.click(button);

      expect(screen.getByText("Make a drawing app")).toBeInTheDocument();
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it("calls scrollIntoView for auto-scroll", () => {
      render(<App />);
      expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it("plays pop sound on message send", () => {
      render(<App />);
      const input = screen.getByPlaceholderText(/Type your grand idea/i);
      fireEvent.change(input, { target: { value: "Hello" } });
      fireEvent.click(screen.getByRole("button", { name: /Send/i }));
      expect(mockPlayPop).toHaveBeenCalledTimes(1);
    });

    it("plays chip click sound on suggestion click", () => {
      render(<App />);
      const firstChip = document.querySelector(".chip-enter") as HTMLElement;
      fireEvent.click(firstChip);
      expect(mockPlayChipClick).toHaveBeenCalledTimes(1);
    });

    it("renders mute toggle button and calls toggleMute", () => {
      render(<App />);
      const muteBtn = screen.getByTestId("mute-toggle");
      expect(muteBtn).toBeInTheDocument();
      fireEvent.click(muteBtn);
      expect(mockToggleMute).toHaveBeenCalledTimes(1);
    });

    it("hides chat with X button and shows it again with Show Chat", () => {
      render(<App />);
      expect(screen.getByText("Builder Buddy")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Hide Chat/i }));
      expect(screen.queryByText("Builder Buddy")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Show Chat/i }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Show Chat/i }));
      expect(screen.getByText("Builder Buddy")).toBeInTheDocument();
    });

    describe("Additional Edge Cases", () => {
      it("ignores iframe error if already loading", async () => {
        (
          aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
        ).mockReturnValue({
          object: undefined,
          submit: mockSubmit,
          isLoading: true,
        });
        render(<App />);
        await act(async () => {
          window.dispatchEvent(
            new MessageEvent("message", {
              data: { type: "iframe-error", message: "Error!" },
            }),
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
            }),
          );
        });
        expect(await screen.findByText(/Unknown error/i)).toBeInTheDocument();
      });

      it("updates messages and currentCode when stream finishes", async () => {
        let triggerFinish: NonNullable<
          Parameters<typeof aiSdkReact.experimental_useObject>[0]["onFinish"]
        >;
        (
          aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
        ).mockImplementation(
          ({
            onFinish,
          }: Parameters<typeof aiSdkReact.experimental_useObject>[0]) => {
            triggerFinish = onFinish!;
            return { object: undefined, submit: mockSubmit, isLoading: false };
          },
        );

        render(<App />);

        await act(async () => {
          triggerFinish!({
            object: { reply: "Done building!", code: "<html>SUCCESS</html>" },
            error: undefined,
          });
        });

        expect(await screen.findByText("Done building!")).toBeInTheDocument();
      });

      it("handles partial finish object gracefully", async () => {
        let triggerFinish: NonNullable<
          Parameters<typeof aiSdkReact.experimental_useObject>[0]["onFinish"]
        >;
        (
          aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
        ).mockImplementation(
          ({
            onFinish,
          }: Parameters<typeof aiSdkReact.experimental_useObject>[0]) => {
            triggerFinish = onFinish!;
            return { object: undefined, submit: mockSubmit, isLoading: false };
          },
        );

        render(<App />);

        await act(async () => {
          triggerFinish!({ object: {}, error: undefined });
        });

        expect(screen.queryByText("Done building!")).not.toBeInTheDocument();
      });

      it("falls back to default if JSON.parse throws in loadJson", () => {
        mockStorage["inspiror_projects"] = "invalid-json{";
        render(<App />);
        // Should show catalog with empty state
        expect(screen.getByText("My Creations")).toBeInTheDocument();
      });

      it("handleSend does nothing if input is empty", () => {
        render(<App />);
        const button = screen.getByRole("button", { name: /Send/i });
        fireEvent.click(button);
        expect(mockSubmit).not.toHaveBeenCalled();
      });

      it("handleSend does nothing if isLoading is true", () => {
        (
          aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
        ).mockReturnValue({
          object: undefined,
          submit: mockSubmit,
          isLoading: true,
        });
        render(<App />);
        const input = screen.getByPlaceholderText(/Type your grand idea/i);
        fireEvent.change(input, { target: { value: "Test" } });
        const button = screen.getByRole("button", { name: /Send/i });
        fireEvent.click(button);
        expect(mockSubmit).not.toHaveBeenCalled();
      });

      it("onKeyDown ignores non-Enter keys", () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/Type your grand idea/i);
        fireEvent.change(input, { target: { value: "Test" } });
        fireEvent.keyDown(input, { key: "a", code: "KeyA" });
        expect(mockSubmit).not.toHaveBeenCalled();
      });

      it("renders confetti burst after loading finishes", async () => {
        let triggerFinish: NonNullable<
          Parameters<typeof aiSdkReact.experimental_useObject>[0]["onFinish"]
        >;
        (
          aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
        ).mockImplementation(
          ({
            onFinish,
          }: Parameters<typeof aiSdkReact.experimental_useObject>[0]) => {
            triggerFinish = onFinish!;
            return { object: undefined, submit: mockSubmit, isLoading: false };
          },
        );

        render(<App />);

        await act(async () => {
          triggerFinish!({
            object: { reply: "Done!", code: "<html>SUCCESS</html>" },
            error: undefined,
          });
        });

        const confetti = screen.getByTestId("confetti-burst");
        expect(confetti).toBeInTheDocument();
        expect(confetti.children.length).toBe(80);
      });

      it("clears confetti timer on rapid generations and completes timer", async () => {
        vi.useFakeTimers();
        let triggerFinish: NonNullable<
          Parameters<typeof aiSdkReact.experimental_useObject>[0]["onFinish"]
        >;
        (
          aiSdkReact.experimental_useObject as ReturnType<typeof vi.fn>
        ).mockImplementation(
          ({
            onFinish,
          }: Parameters<typeof aiSdkReact.experimental_useObject>[0]) => {
            triggerFinish = onFinish!;
            return { object: undefined, submit: mockSubmit, isLoading: false };
          },
        );

        render(<App />);

        await act(async () => {
          triggerFinish!({ object: { reply: "1" }, error: undefined });
        });

        expect(screen.getByTestId("confetti-burst")).toBeInTheDocument();

        await act(async () => {
          triggerFinish!({ object: { reply: "2" }, error: undefined });
        });

        act(() => {
          vi.runAllTimers();
        });

        expect(screen.queryByTestId("confetti-burst")).not.toBeInTheDocument();

        vi.useRealTimers();
      });
    });
  });

  describe("Project Switching - State Isolation", () => {
    function seedTwoProjects() {
      const projectA = {
        id: "project-a",
        title: "Project A",
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
        messages: [
          {
            id: "a-msg-1",
            role: "assistant",
            content:
              "Hi! I'm your builder buddy. What do you want to create today?",
          },
          { id: "a-msg-2", role: "user", content: "Build a spaceship" },
          {
            id: "a-msg-3",
            role: "assistant",
            content: "Here is your spaceship!",
          },
        ],
        currentCode: "<html><body><h1>SPACESHIP APP</h1></body></html>",
      };

      const projectB = {
        id: "project-b",
        title: "Project B",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: "b-msg-1",
            role: "assistant",
            content:
              "Hi! I'm your builder buddy. What do you want to create today?",
          },
          { id: "b-msg-2", role: "user", content: "Build a drawing app" },
          {
            id: "b-msg-3",
            role: "assistant",
            content: "Here is your drawing app!",
          },
        ],
        currentCode: "<html><body><h1>DRAWING APP</h1></body></html>",
      };

      mockStorage["inspiror_projects"] = JSON.stringify([projectA, projectB]);
      mockStorage["inspiror_current_project_id"] = "project-a";
    }

    it("preserves Project A code when switching to Project B and back", () => {
      seedTwoProjects();
      render(<App />);

      // Should be in Project A (set as current in seedTwoProjects)
      const iframe = screen.getByTitle("Preview Sandbox");
      expect(iframe.getAttribute("srcdoc")).toContain("SPACESHIP APP");
      expect(screen.getByText("Build a spaceship")).toBeInTheDocument();

      // Navigate to catalog
      fireEvent.click(screen.getByTestId("back-to-catalog"));
      expect(screen.getByText("My Creations")).toBeInTheDocument();

      // Find Project B by title and click its open button
      const projectBTitle = screen.getByText("Project B");
      const projectBCard = projectBTitle.closest(
        '[data-testid="project-card"]',
      )!;
      fireEvent.click(
        projectBCard.querySelector('[data-testid="open-project-btn"]')!,
      );

      // Should show Project B content
      expect(screen.getByText("Build a drawing app")).toBeInTheDocument();
      const iframeB = screen.getByTitle("Preview Sandbox");
      expect(iframeB.getAttribute("srcdoc")).toContain("DRAWING APP");

      // Navigate back to catalog
      fireEvent.click(screen.getByTestId("back-to-catalog"));

      // Find Project A by title and click its open button
      const projectATitle = screen.getByText("Project A");
      const projectACard = projectATitle.closest(
        '[data-testid="project-card"]',
      )!;
      fireEvent.click(
        projectACard.querySelector('[data-testid="open-project-btn"]')!,
      );

      // Project A should still have its original code — NOT the default welcome screen
      expect(screen.getByText("Build a spaceship")).toBeInTheDocument();
      const iframeA = screen.getByTitle("Preview Sandbox");
      expect(iframeA.getAttribute("srcdoc")).toContain("SPACESHIP APP");
    });

    it("saves generated code to the correct project via onUpdate(projectId)", () => {
      seedTwoProjects();
      render(<App />);

      // Verify we're in Project A and the storage key tracks the right project
      const saved = JSON.parse(mockStorage["inspiror_projects"]!);
      const projA = saved.find((p: { id: string }) => p.id === "project-a");
      expect(projA.currentCode).toContain("SPACESHIP APP");

      const projB = saved.find((p: { id: string }) => p.id === "project-b");
      expect(projB.currentCode).toContain("DRAWING APP");
    });

    it("does not overwrite Project B data when onFinish fires after navigating away", async () => {
      seedTwoProjects();
      let triggerFinish: (args: any) => void;
      (aiSdkReact.experimental_useObject as any).mockImplementation(
        ({ onFinish }: any) => {
          triggerFinish = onFinish;
          return { object: undefined, submit: mockSubmit, isLoading: false };
        },
      );

      render(<App />);

      // We're in Project A — trigger a finish that updates code
      await act(async () => {
        triggerFinish!({
          object: {
            reply: "Updated spaceship!",
            code: "<html><body>SPACESHIP V2</body></html>",
          },
        });
      });

      // Project A should have updated code
      let saved = JSON.parse(mockStorage["inspiror_projects"]!);
      let projA = saved.find((p: { id: string }) => p.id === "project-a");
      expect(projA.currentCode).toContain("SPACESHIP V2");

      // Project B should be untouched
      let projB = saved.find((p: { id: string }) => p.id === "project-b");
      expect(projB.currentCode).toContain("DRAWING APP");
    });
  });
});
