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

beforeEach(() => {
  mockFetch.mockReset();
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
    expect(screen.getByText(/Building.../i)).toBeInTheDocument();
  });

  it("can toggle the floating chat visibility", () => {
    render(<App />);

    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();

    const toggleButton = screen.getByRole("button", { name: /Hide Chat/i });
    fireEvent.click(toggleButton);

    expect(
      screen.queryByText(/Hi! I'm your builder buddy/i),
    ).not.toBeInTheDocument();

    const showButton = screen.getByRole("button", { name: /Show Chat/i });
    fireEvent.click(showButton);

    expect(screen.getByText(/Hi! I'm your builder buddy/i)).toBeInTheDocument();
  });

  it("renders the preview sandbox iframe", () => {
    render(<App />);
    const iframe = screen.getByTitle("Preview Sandbox");
    expect(iframe).toBeInTheDocument();
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
});
