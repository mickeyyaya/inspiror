import { Sparkles } from "lucide-react";

interface BuildingOverlayProps {
  isLoading: boolean;
  buildingText: string;
}

export function BuildingOverlay({
  isLoading,
  buildingText,
}: BuildingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      data-testid="hacker-mode-overlay"
      className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center overflow-hidden pointer-events-none"
    >
      <div className="absolute flex flex-col items-center justify-center z-20">
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

        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <pre
            className="text-[var(--color-candy-purple)] text-2xl font-bold font-mono opacity-50 absolute left-[10%] top-[20%] animate-bounce"
            style={{ animationDelay: "0.1s" }}
          >
            &lt;div&gt;
          </pre>
          <pre
            className="text-[var(--color-candy-green)] text-3xl font-bold font-mono opacity-50 absolute right-[20%] top-[30%] animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >{`{}`}</pre>
          <pre
            className="text-[var(--color-candy-orange)] text-2xl font-bold font-mono opacity-50 absolute left-[30%] bottom-[20%] animate-bounce"
            style={{ animationDelay: "0.3s" }}
          >
            function()
          </pre>
          <pre
            className="text-[var(--color-candy-pink)] text-4xl font-bold font-mono opacity-50 absolute right-[10%] bottom-[30%] animate-bounce"
            style={{ animationDelay: "0.7s" }}
          >
            const
          </pre>
        </div>
      </div>
    </div>
  );
}
