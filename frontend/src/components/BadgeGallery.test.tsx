import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BadgeGallery } from "./BadgeGallery";
import { BUDDY_AVATARS } from "../types/achievements";

const defaultT = {
  badge_title: "My Badges",
  badge_builds: "Builds",
  badge_bugs_fixed: "Bugs Fixed",
  badge_achievements: "Achievements",
  badge_buddy_avatars: "Buddy Avatars",
  aria_close_gallery: "Close gallery",
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  unlockedIds: [] as string[],
  stats: { builds: 5, debugs: 2, remixes: 1, explores: 3 },
  selectedAvatar: BUDDY_AVATARS[0],
  unlockedAvatars: [BUDDY_AVATARS[0]],
  onSelectAvatar: vi.fn(),
  t: defaultT,
};

describe("BadgeGallery", () => {
  it("renders nothing when not open", () => {
    const { container } = render(
      <BadgeGallery {...defaultProps} isOpen={false} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders with role=dialog and aria-modal", () => {
    render(<BadgeGallery {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "badge-gallery-title");
  });

  it("displays translated text", () => {
    render(
      <BadgeGallery
        {...defaultProps}
        t={{
          badge_title: "我的徽章",
          badge_builds: "建造次數",
          badge_bugs_fixed: "修復次數",
          badge_achievements: "成就",
          badge_buddy_avatars: "夥伴頭像",
          aria_close_gallery: "關閉徽章",
        }}
      />,
    );
    expect(screen.getByText("我的徽章")).toBeInTheDocument();
    expect(screen.getByText("建造次數")).toBeInTheDocument();
    expect(screen.getByText("修復次數")).toBeInTheDocument();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<BadgeGallery {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("focuses the close button on open", () => {
    render(<BadgeGallery {...defaultProps} />);
    const closeBtn = screen.getByLabelText("Close gallery");
    expect(document.activeElement).toBe(closeBtn);
  });

  it("closes on backdrop click", () => {
    const onClose = vi.fn();
    render(<BadgeGallery {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("badge-gallery"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("displays stats correctly", () => {
    render(<BadgeGallery {...defaultProps} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
