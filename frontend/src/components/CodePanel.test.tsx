import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CodePanel } from "./CodePanel";

describe("CodePanel", () => {
  const defaultProps = {
    code: "<html><body>Hello</body></html>",
    isOpen: true,
    onClose: vi.fn(),
    onRunCode: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onClose.mockClear();
    defaultProps.onRunCode.mockClear();
  });

  it("renders the panel when isOpen is true", () => {
    render(<CodePanel {...defaultProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("does not visually show the panel when isOpen is false", () => {
    render(<CodePanel {...defaultProps} isOpen={false} />);
    // Panel is in DOM but translated off screen
    const panel = screen.getByTestId("code-panel");
    expect(panel).toHaveClass("translate-x-full");
  });

  it("displays the provided code in the textarea", () => {
    render(<CodePanel {...defaultProps} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe(defaultProps.code);
  });

  it("allows editing the code in the textarea", () => {
    render(<CodePanel {...defaultProps} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "<html>edited</html>" } });
    expect(textarea.value).toBe("<html>edited</html>");
  });

  it("calls onRunCode with the current textarea value when Run My Code is clicked", () => {
    render(<CodePanel {...defaultProps} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "<html>my remix</html>" } });

    fireEvent.click(screen.getByRole("button", { name: /run my code/i }));
    expect(defaultProps.onRunCode).toHaveBeenCalledWith("<html>my remix</html>");
  });

  it("calls onRunCode with original code if no edits made", () => {
    render(<CodePanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /run my code/i }));
    expect(defaultProps.onRunCode).toHaveBeenCalledWith(defaultProps.code);
  });

  it("calls onClose when close button is clicked", () => {
    render(<CodePanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close panel/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("resets editable code to prop value when Reset to AI Version is clicked", () => {
    render(<CodePanel {...defaultProps} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: "<html>edited</html>" } });
    expect(textarea.value).toBe("<html>edited</html>");

    fireEvent.click(screen.getByRole("button", { name: /reset to ai version/i }));
    expect(textarea.value).toBe(defaultProps.code);
  });

  it("updates internal code when the code prop changes (new AI generation)", () => {
    const { rerender } = render(<CodePanel {...defaultProps} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("<html><body>Hello</body></html>");

    rerender(
      <CodePanel
        {...defaultProps}
        code="<html><body>New AI code</body></html>"
      />,
    );
    expect(textarea.value).toBe("<html><body>New AI code</body></html>");
  });

  it("preserves edits across open/close cycles (does not discard on close)", () => {
    const { rerender } = render(<CodePanel {...defaultProps} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: "<html>my edits</html>" } });

    // Close the panel
    rerender(<CodePanel {...defaultProps} isOpen={false} />);
    // Reopen the panel
    rerender(<CodePanel {...defaultProps} isOpen={true} />);

    const reopenedTextarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(reopenedTextarea.value).toBe("<html>my edits</html>");
  });

  it("uses monospace font on the textarea", () => {
    render(<CodePanel {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("font-mono");
  });

  it("renders panel title 'Look Inside'", () => {
    render(<CodePanel {...defaultProps} />);
    expect(screen.getByText(/look inside/i)).toBeInTheDocument();
  });
});
