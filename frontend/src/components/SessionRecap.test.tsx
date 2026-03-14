import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionRecap } from "./SessionRecap";
import { translations } from "../i18n/translations";

const t = translations["en-US"];

const defaultProps = {
  isOpen: true,
  onDismiss: vi.fn(),
  blocksUsed: 5,
  messagesExchanged: 8,
  buildsThisSession: 3,
  tipsEarned: 2,
  blockOrigins: { ai: 3, template: 1, remix: 1 },
  buddyEmoji: "🐶",
  buddyName: "Buddy",
  t,
};

describe("SessionRecap", () => {
  it("renders nothing when isOpen is false", () => {
    render(<SessionRecap {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("session-recap")).not.toBeInTheDocument();
  });

  it("shows the recap title and buddy info", () => {
    render(<SessionRecap {...defaultProps} />);
    expect(screen.getByText("What You Built!")).toBeInTheDocument();
    expect(screen.getByText("🐶")).toBeInTheDocument();
    expect(screen.getByText(/Buddy/)).toBeInTheDocument();
  });

  it("displays session stats", () => {
    render(<SessionRecap {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument(); // builds
    expect(screen.getByText("8")).toBeInTheDocument(); // messages
    expect(screen.getByText("5")).toBeInTheDocument(); // blocks
    expect(screen.getByText("2")).toBeInTheDocument(); // tips
  });

  it("displays block origin badges", () => {
    render(<SessionRecap {...defaultProps} />);
    expect(screen.getByText(/3 AI/)).toBeInTheDocument();
    expect(screen.getByText(/1 Template/)).toBeInTheDocument();
    expect(screen.getByText(/1 Remixed/)).toBeInTheDocument();
  });

  it("hides origin section when all origins are 0", () => {
    render(
      <SessionRecap
        {...defaultProps}
        blockOrigins={{ ai: 0, template: 0, remix: 0 }}
      />,
    );
    expect(screen.queryByText("Block Origins")).not.toBeInTheDocument();
  });

  it("calls onDismiss when button is clicked", () => {
    const onDismiss = vi.fn();
    render(<SessionRecap {...defaultProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId("recap-dismiss"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss when backdrop is clicked", () => {
    const onDismiss = vi.fn();
    render(<SessionRecap {...defaultProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId("session-recap"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
