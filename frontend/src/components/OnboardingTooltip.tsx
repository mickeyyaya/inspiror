import { useEffect, useState, useCallback, useRef } from "react";
import { TOTAL_STEPS } from "../hooks/useOnboarding";

interface TooltipPosition {
  top: number;
  left: number;
  arrowSide: "top" | "bottom";
}

interface OnboardingTooltipProps {
  step: number;
  isActive: boolean;
  onAdvance: () => void;
  onSkip: () => void;
  t: {
    onboarding_step1_title: string;
    onboarding_step1_desc: string;
    onboarding_step2_title: string;
    onboarding_step2_desc: string;
    onboarding_step3_title: string;
    onboarding_step3_desc: string;
    onboarding_got_it: string;
    onboarding_skip: string;
  };
}

const STEP_TARGETS = [
  "[data-onboarding='suggestions']",
  "[data-onboarding='voice']",
  "[data-onboarding='blocks']",
] as const;

// Tooltip spacing from target element
const TOOLTIP_GAP = 12;
// Minimum distance from viewport edges
const EDGE_PADDING_X = 160;
const EDGE_PADDING_TOP = 8;
const EDGE_PADDING_BOTTOM = 200;
// Threshold to decide above vs below placement
const TOP_THRESHOLD = 160;

function getPosition(el: Element): TooltipPosition {
  const rect = el.getBoundingClientRect();
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  let top = rect.top - TOOLTIP_GAP;
  const left = Math.max(
    EDGE_PADDING_X,
    Math.min(rect.left + rect.width / 2, viewportW - EDGE_PADDING_X),
  );
  let arrowSide: "top" | "bottom" = "bottom";

  if (rect.top < TOP_THRESHOLD) {
    top = rect.bottom + TOOLTIP_GAP;
    arrowSide = "top";
  }

  top = Math.max(EDGE_PADDING_TOP, Math.min(top, viewportH - EDGE_PADDING_BOTTOM));

  return { top, left, arrowSide };
}

export function OnboardingTooltip({
  step,
  isActive,
  onAdvance,
  onSkip,
  t,
}: OnboardingTooltipProps) {
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const advanceBtnRef = useRef<HTMLButtonElement>(null);

  const updatePosition = useCallback(() => {
    if (!isActive || step >= STEP_TARGETS.length) return;
    const target = document.querySelector(STEP_TARGETS[step]);
    if (!target) return;
    setPosition(getPosition(target));
  }, [step, isActive]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [updatePosition]);

  // Focus the "Got it" button when tooltip appears
  useEffect(() => {
    if (isActive && position) {
      advanceBtnRef.current?.focus();
    }
  }, [isActive, position, step]);

  // Escape key dismisses the tour
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onSkip]);

  if (!isActive || step >= STEP_TARGETS.length || !position) return null;

  const titles = [
    t.onboarding_step1_title,
    t.onboarding_step2_title,
    t.onboarding_step3_title,
  ];
  const descs = [
    t.onboarding_step1_desc,
    t.onboarding_step2_desc,
    t.onboarding_step3_desc,
  ];

  const arrowClass =
    position.arrowSide === "bottom"
      ? "top-full left-1/2 -translate-x-1/2 border-t-[#222] border-x-transparent border-b-transparent border-[10px]"
      : "bottom-full left-1/2 -translate-x-1/2 border-b-[#222] border-x-transparent border-t-transparent border-[10px]";

  const translateY = position.arrowSide === "bottom" ? "-100%" : "0";

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding tour"
      data-testid="onboarding-overlay"
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onSkip} />

      {/* Tooltip card */}
      <div
        className="absolute pointer-events-auto"
        style={{
          top: position.top,
          left: position.left,
          transform: `translate(-50%, ${translateY})`,
        }}
        data-testid="onboarding-tooltip"
      >
        <div className="relative bg-white border-4 border-[#222] rounded-2xl p-4 shadow-[6px_6px_0_#222] max-w-[280px] w-max">
          {/* Arrow */}
          <div className={`absolute w-0 h-0 ${arrowClass}`} />

          {/* Pulsing indicator */}
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--color-candy-pink)] border-2 border-[#222] rounded-full onboarding-pulse" />

          <h3 className="font-extrabold text-[#222] text-base mb-1">
            {titles[step]}
          </h3>
          <p className="text-gray-600 text-sm font-medium mb-3">
            {descs[step]}
          </p>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onSkip}
              className="text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors"
              data-testid="onboarding-skip"
            >
              {t.onboarding_skip}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold">
                {step + 1}/{TOTAL_STEPS}
              </span>
              <button
                ref={advanceBtnRef}
                onClick={onAdvance}
                className="bg-[var(--color-candy-green)] text-[#222] border-3 border-[#222] px-4 py-1.5 rounded-full font-extrabold text-sm shadow-[3px_3px_0_#222] active:translate-y-[3px] active:shadow-none transition-all"
                data-testid="onboarding-advance"
              >
                {t.onboarding_got_it}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
