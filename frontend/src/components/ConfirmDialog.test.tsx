import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

const defaultProps = {
  isOpen: true,
  message: "Delete this project?",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  confirmLabel: "Delete",
  cancelLabel: "Cancel",
};

describe("ConfirmDialog", () => {
  it("renders nothing when not open", () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} isOpen={false} />,
    );
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("renders message when open", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Delete this project?")).toBeInTheDocument();
  });

  it("renders confirm and cancel buttons with labels", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId("confirm-dialog-confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId("confirm-dialog-cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Escape is pressed", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when scrim is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId("confirm-dialog-scrim"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("has dialog role and aria-modal", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("auto-focuses the cancel button (safe default)", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(document.activeElement).toBe(
      screen.getByTestId("confirm-dialog-cancel"),
    );
  });
});
