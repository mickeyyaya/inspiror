import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatHeader, type BuddyEmotion } from "./ChatHeader";

const defaultT = {
  switch_language: "Switch Language",
  aria_my_projects: "My Projects",
  aria_disable_voice: "Disable Voice",
  aria_enable_voice: "Enable Voice",
  aria_mute: "Mute",
  aria_unmute: "Unmute",
  aria_reset: "Reset",
  aria_hide_chat: "Hide Chat",
  badge_title: "Badges",
  buddy_name: "Builder Buddy",
};

const defaultProps = {
  isLoading: false,
  isMuted: false,
  isAutoSpeakEnabled: false,
  language: "en-US" as const,
  buddyEmoji: "🤖",
  onBack: vi.fn(),
  onToggleLanguage: vi.fn(),
  onToggleAutoSpeak: vi.fn(),
  onToggleMute: vi.fn(),
  onReset: vi.fn(),
  onHideChat: vi.fn(),
  onOpenBadges: vi.fn(),
  t: defaultT,
};

describe("ChatHeader emotion prop", () => {
  it("shows buddy-avatar class for idle emotion", () => {
    render(<ChatHeader {...defaultProps} emotion="idle" />);
    const avatar = screen.getByTestId("buddy-avatar");
    expect(avatar.className).toContain("buddy-avatar");
    expect(avatar.getAttribute("data-emotion")).toBe("idle");
  });

  it("shows buddy-avatar-proud class and star overlay for proud emotion", () => {
    render(<ChatHeader {...defaultProps} emotion="proud" />);
    const avatar = screen.getByTestId("buddy-avatar");
    expect(avatar.className).toContain("buddy-avatar-proud");
    expect(avatar.getAttribute("data-emotion")).toBe("proud");
    expect(screen.getByTestId("buddy-emotion-overlay").textContent).toBe("⭐");
  });

  it("shows buddy-avatar-worried class and sweat overlay for worried emotion", () => {
    render(<ChatHeader {...defaultProps} emotion="worried" />);
    const avatar = screen.getByTestId("buddy-avatar");
    expect(avatar.className).toContain("buddy-avatar-worried");
    expect(avatar.getAttribute("data-emotion")).toBe("worried");
    expect(screen.getByTestId("buddy-emotion-overlay").textContent).toBe("💦");
  });

  it("shows buddy-avatar-curious class and question overlay for curious emotion", () => {
    render(<ChatHeader {...defaultProps} emotion="curious" />);
    const avatar = screen.getByTestId("buddy-avatar");
    expect(avatar.className).toContain("buddy-avatar-curious");
    expect(avatar.getAttribute("data-emotion")).toBe("curious");
    expect(screen.getByTestId("buddy-emotion-overlay").textContent).toBe("❓");
  });

  it("shows no overlay for idle emotion", () => {
    render(<ChatHeader {...defaultProps} emotion="idle" />);
    expect(screen.queryByTestId("buddy-emotion-overlay")).toBeNull();
  });

  it("defaults to idle when emotion prop is omitted", () => {
    render(<ChatHeader {...defaultProps} />);
    const avatar = screen.getByTestId("buddy-avatar");
    expect(avatar.getAttribute("data-emotion")).toBe("idle");
    expect(screen.queryByTestId("buddy-emotion-overlay")).toBeNull();
  });

  it("overrides emotion with thinking when isLoading is true", () => {
    render(<ChatHeader {...defaultProps} isLoading={true} emotion="proud" />);
    const avatar = screen.getByTestId("buddy-avatar");
    // When loading, thinking takes precedence
    expect(avatar.getAttribute("data-emotion")).toBe("thinking");
    expect(avatar.className).toContain("buddy-avatar-thinking");
    // No overlay for thinking
    expect(screen.queryByTestId("buddy-emotion-overlay")).toBeNull();
  });

  it("renders the buddyEmoji text content", () => {
    render(<ChatHeader {...defaultProps} buddyEmoji="🐱" />);
    const avatar = screen.getByTestId("buddy-avatar");
    expect(avatar.textContent).toBe("🐱");
  });
});

describe("BuddyEmotion type", () => {
  it("accepts all valid emotion values without TypeScript error", () => {
    const emotions: BuddyEmotion[] = [
      "idle",
      "thinking",
      "proud",
      "worried",
      "curious",
    ];
    emotions.forEach((emotion) => {
      const { unmount } = render(
        <ChatHeader {...defaultProps} emotion={emotion} />,
      );
      const avatar = screen.getByTestId("buddy-avatar");
      expect(avatar.getAttribute("data-emotion")).toBe(emotion);
      unmount();
    });
  });
});
