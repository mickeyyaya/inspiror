import { useState, useCallback } from "react";

export const ONBOARDING_STORAGE_KEY = "inspiror-onboarding-v1";
export const TOTAL_STEPS = 3;

export interface OnboardingState {
  step: number;
  isActive: boolean;
  advanceStep: () => void;
  skipAll: () => void;
}

function readCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "done";
  } catch {
    return false;
  }
}

function markCompleted(): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "done");
  } catch {
    // Storage full — silently ignore
  }
}

export function useOnboarding(): OnboardingState {
  const [step, setStep] = useState(() => (readCompleted() ? TOTAL_STEPS : 0));

  const isActive = step < TOTAL_STEPS;

  const advanceStep = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= TOTAL_STEPS) {
        markCompleted();
      }
      return next;
    });
  }, []);

  const skipAll = useCallback(() => {
    setStep(TOTAL_STEPS);
    markCompleted();
  }, []);

  return { step, isActive, advanceStep, skipAll };
}
