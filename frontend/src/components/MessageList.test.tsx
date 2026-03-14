import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll } from "vitest";
import { MessageList } from "./MessageList";

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

const defaultProps = {
  messages: [],
  isLoading: false,
  streamingReply: undefined as string | undefined,
  showSuggestions: false,
  suggestionChips: [],
  onSuggestionChipsShuffle: () => {},
  onChipClick: () => {},
  thinkingText: "Thinking",
  magicButtonPrompt: "Try a Magic Button!",
  moreIdeasText: "More ideas",
};

describe("MessageList", () => {
  it("renders streaming reply with aria-live=polite", () => {
    render(
      <MessageList
        {...defaultProps}
        isLoading={true}
        streamingReply="Building your app..."
      />,
    );
    const liveRegion = screen
      .getByText("Building your app...", {
        exact: false,
      })
      .closest("[aria-live]");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("does not render aria-live region when not streaming", () => {
    const { container } = render(<MessageList {...defaultProps} />);
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("renders messages", () => {
    render(
      <MessageList
        {...defaultProps}
        messages={[
          { id: "1", role: "assistant", content: "Hello!" },
          { id: "2", role: "user", content: "Make a game" },
        ]}
      />,
    );
    expect(screen.getByText("Hello!")).toBeInTheDocument();
    expect(screen.getByText("Make a game")).toBeInTheDocument();
  });

  it("renders tip messages with distinct styling and lightbulb", () => {
    render(
      <MessageList
        {...defaultProps}
        messages={[
          {
            id: "tip-1",
            role: "assistant",
            content: "Great detail about color!",
            type: "tip",
          },
        ]}
        buddyTipLabel="Buddy Tip"
      />,
    );
    expect(screen.getByText("Great detail about color!")).toBeInTheDocument();
    expect(screen.getByText("Buddy Tip")).toBeInTheDocument();
    expect(screen.getByText("💡")).toBeInTheDocument();
  });

  it("renders tip with fallback label when buddyTipLabel not provided", () => {
    render(
      <MessageList
        {...defaultProps}
        messages={[
          {
            id: "tip-2",
            role: "assistant",
            content: "Nice prompt!",
            type: "tip",
          },
        ]}
      />,
    );
    expect(screen.getByText("Buddy Tip")).toBeInTheDocument();
  });

  it("renders normal assistant messages without tip styling", () => {
    render(
      <MessageList
        {...defaultProps}
        messages={[
          { id: "msg-1", role: "assistant", content: "Here is your game!" },
        ]}
      />,
    );
    expect(screen.getByText("Here is your game!")).toBeInTheDocument();
    expect(screen.getByText("✨")).toBeInTheDocument();
    expect(screen.queryByText("💡")).not.toBeInTheDocument();
  });

  it("shows thinking dots when loading without streaming reply", () => {
    render(
      <MessageList
        {...defaultProps}
        isLoading={true}
        streamingReply={undefined}
      />,
    );
    expect(screen.getByText("Thinking")).toBeInTheDocument();
  });
});
