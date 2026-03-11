import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface BuildingOverlayProps {
  isLoading: boolean;
  buildingText: string;
  didYouKnowLabel?: string;
  facts: string[];
}

const FACT_CYCLE_MS = 4000;

export function BuildingOverlay({
  isLoading,
  buildingText,
  didYouKnowLabel = "Did you know?",
  facts,
}: BuildingOverlayProps) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    if (!isLoading || facts.length === 0) return;

    setFactIndex(0);
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, FACT_CYCLE_MS);

    return () => clearInterval(interval);
  }, [isLoading, facts]);

  if (!isLoading) return null;

  const currentFact = facts[factIndex] ?? "";

  return (
    <div
      data-testid="hacker-mode-overlay"
      className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center overflow-hidden pointer-events-none"
    >
      <div className="absolute flex flex-col items-center justify-center z-20 max-w-lg px-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-[var(--color-candy-yellow)] rounded-full blur-[40px] animate-pulse opacity-80"></div>
          <div
            className="absolute w-48 h-48 bg-[var(--color-candy-pink)] rounded-full blur-[30px] animate-ping opacity-60"
            style={{ animationDuration: "2s" }}
          ></div>
          <div className="relative z-10 bg-white border-4 border-[#222] p-6 rounded-full shadow-[8px_8px_0_#222] flex items-center justify-center animate-bounce">
            <Sparkles
              className="text-[var(--color-candy-blue)]"
              size={72}
              strokeWidth={2}
              fill="var(--color-candy-blue)"
            />
          </div>
        </div>
        <p
          className="mt-10 text-[#222] text-5xl font-extrabold tracking-widest animate-pulse"
          style={{ textShadow: "4px 4px 0px var(--color-candy-blue)" }}
        >
          {buildingText}
        </p>

        {currentFact && (
          <div
            key={factIndex}
            data-testid="coding-fact"
            className="mt-6 bg-white/90 border-4 border-[#222] rounded-2xl px-6 py-4 shadow-[4px_4px_0_#222] text-center animate-fade-in"
          >
            <p className="text-sm font-bold text-[var(--color-candy-purple)] uppercase tracking-wider mb-1">
              {didYouKnowLabel}
            </p>
            <p className="text-[15px] font-bold text-[#222] leading-relaxed">
              {currentFact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
