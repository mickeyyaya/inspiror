import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AchievementModal } from "./AchievementModal";
import type { Achievement } from "../types/achievements";

const mockAchievement: Achievement = {
  id: "first-build",
  title: "First Build!",
  description: "Build your very first app",
  icon: "🎉",
  threshold: 1,
  type: "builds",
};

const defaultT = {
  achievement_unlocked: "Achievement Unlocked!",
  achievement_awesome: "Awesome!",
};

describe("AchievementModal", () => {
  it("renders nothing when achievement is null", () => {
    const { container } = render(
      <AchievementModal achievement={null} onDismiss={vi.fn()} t={defaultT} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders with role=dialog and aria-modal", () => {
    render(
      <AchievementModal
        achievement={mockAchievement}
        onDismiss={vi.fn()}
        t={defaultT}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "achievement-title");
  });

  it("displays translated text", () => {
    render(
      <AchievementModal
        achievement={mockAchievement}
        onDismiss={vi.fn()}
        t={{ achievement_unlocked: "成就解鎖！", achievement_awesome: "太棒了！" }}
      />,
    );
    expect(screen.getByText("成就解鎖！")).toBeInTheDocument();
    expect(screen.getByText("太棒了！")).toBeInTheDocument();
  });

  it("closes on Escape key", () => {
    const onDismiss = vi.fn();
    render(
      <AchievementModal
        achievement={mockAchievement}
        onDismiss={onDismiss}
        t={defaultT}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("focuses the dismiss button on open", () => {
    render(
      <AchievementModal
        achievement={mockAchievement}
        onDismiss={vi.fn()}
        t={defaultT}
      />,
    );
    const btn = screen.getByText("Awesome!");
    expect(document.activeElement).toBe(btn);
  });

  it("closes on backdrop click", () => {
    const onDismiss = vi.fn();
    render(
      <AchievementModal
        achievement={mockAchievement}
        onDismiss={onDismiss}
        t={defaultT}
      />,
    );
    fireEvent.click(screen.getByTestId("achievement-modal"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inner content", () => {
    const onDismiss = vi.fn();
    render(
      <AchievementModal
        achievement={mockAchievement}
        onDismiss={onDismiss}
        t={defaultT}
      />,
    );
    fireEvent.click(screen.getByText("First Build!"));
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
