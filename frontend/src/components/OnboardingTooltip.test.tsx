import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OnboardingTooltip } from "./OnboardingTooltip";

const defaultT = {
  onboarding_step1_title: "Tap a Magic Button!",
  onboarding_step1_desc: "Pick a suggestion to get started.",
  onboarding_step2_title: "Talk to Me!",
  onboarding_step2_desc: "Tap the mic to speak.",
  onboarding_step3_title: "Look Inside!",
  onboarding_step3_desc: "See the building blocks.",
  onboarding_got_it: "Got it!",
  onboarding_skip: "Skip tour",
};

function addTarget(name: string) {
  const el = document.createElement("button");
  el.setAttribute("data-onboarding", name);
  el.style.position = "absolute";
  el.style.top = "200px";
  el.style.left = "200px";
  el.style.width = "100px";
  el.style.height = "40px";
  document.body.appendChild(el);
  return el;
}

describe("OnboardingTooltip", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders nothing when not active", () => {
    addTarget("suggestions");
    const { container } = render(
      <OnboardingTooltip
        step={0}
        isActive={false}
        onAdvance={vi.fn()}
        onSkip={vi.fn()}
        t={defaultT}
      />,
    );
    expect(container.querySelector("[data-testid='onboarding-overlay']")).toBeNull();
  });

  it("renders tooltip for step 0 with correct title", () => {
    addTarget("suggestions");
    render(
      <OnboardingTooltip
        step={0}
        isActive={true}
        onAdvance={vi.fn()}
        onSkip={vi.fn()}
        t={defaultT}
      />,
    );
    expect(screen.getByText("Tap a Magic Button!")).toBeInTheDocument();
    expect(screen.getByText("Pick a suggestion to get started.")).toBeInTheDocument();
  });

  it("renders step 1 title when step is 1", () => {
    addTarget("voice");
    render(
      <OnboardingTooltip
        step={1}
        isActive={true}
        onAdvance={vi.fn()}
        onSkip={vi.fn()}
        t={defaultT}
      />,
    );
    expect(screen.getByText("Talk to Me!")).toBeInTheDocument();
  });

  it("calls onAdvance when Got it! is clicked", () => {
    addTarget("suggestions");
    const onAdvance = vi.fn();
    render(
      <OnboardingTooltip
        step={0}
        isActive={true}
        onAdvance={onAdvance}
        onSkip={vi.fn()}
        t={defaultT}
      />,
    );
    fireEvent.click(screen.getByTestId("onboarding-advance"));
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it("calls onSkip when Skip tour is clicked", () => {
    addTarget("suggestions");
    const onSkip = vi.fn();
    render(
      <OnboardingTooltip
        step={0}
        isActive={true}
        onAdvance={vi.fn()}
        onSkip={onSkip}
        t={defaultT}
      />,
    );
    fireEvent.click(screen.getByTestId("onboarding-skip"));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("shows step counter", () => {
    addTarget("suggestions");
    render(
      <OnboardingTooltip
        step={0}
        isActive={true}
        onAdvance={vi.fn()}
        onSkip={vi.fn()}
        t={defaultT}
      />,
    );
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("dismisses on Escape key", () => {
    addTarget("suggestions");
    const onSkip = vi.fn();
    render(
      <OnboardingTooltip
        step={0}
        isActive={true}
        onAdvance={vi.fn()}
        onSkip={onSkip}
        t={defaultT}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("has dialog role and aria-modal", () => {
    addTarget("suggestions");
    render(
      <OnboardingTooltip
        step={0}
        isActive={true}
        onAdvance={vi.fn()}
        onSkip={vi.fn()}
        t={defaultT}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
