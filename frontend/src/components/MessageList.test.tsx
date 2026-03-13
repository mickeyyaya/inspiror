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
