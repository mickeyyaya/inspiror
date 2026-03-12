import { useMemo } from "react";
import { MessageCircle, Blocks } from "lucide-react";
import { injectErrorCatcher } from "../utils/injectErrorCatcher";
import { BuildingOverlay } from "./BuildingOverlay";

interface PreviewPanelProps {
  currentCode: string;
  isLoading: boolean;
  isChatVisible: boolean;
  onShowChat: () => void;
  onLookInside: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  codingFacts: string[];
  blockCount?: number;
  convertingText?: string;
  t: {
    aria_show_chat: string;
    aria_look_inside: string;
    overlay_building: string;
    overlay_did_you_know: string;
  };
}

export function PreviewPanel({
  currentCode,
  isLoading,
  isChatVisible,
  onShowChat,
  onLookInside,
  iframeRef,
  codingFacts,
  blockCount,
  convertingText,
  t,
}: PreviewPanelProps) {
  const srcDoc = useMemo(() => injectErrorCatcher(currentCode), [currentCode]);

  return (
    <div
      className="flex-1 relative bg-[#fdfbf7] overflow-hidden flex flex-col p-4 sm:p-8"
      onMouseEnter={() => iframeRef.current?.focus()}
    >
      <div className="absolute inset-0 bg-kids-pattern pointer-events-none z-0"></div>

      {!isChatVisible && (
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-30">
          <button
            onClick={onShowChat}
            className="bg-[var(--color-candy-pink)] border-4 border-[#222] text-[#222] p-3 rounded-full shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center btn-squish hover-wiggle"
            aria-label={t.aria_show_chat}
          >
            <MessageCircle size={28} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <div className="flex-1 w-full h-full relative z-10 bg-transparent border-4 border-[#222] rounded-[2rem] overflow-hidden shadow-[8px_8px_0_#222]">
        <iframe
          ref={iframeRef}
          title="Preview Sandbox"
          srcDoc={srcDoc}
          className={`w-full h-full border-none transition-all duration-300 ${
            isLoading
              ? "opacity-30 blur-[2px] scale-105"
              : "opacity-100 scale-100"
          }`}
          sandbox="allow-scripts"
        />
      </div>

      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-30">
        <button
          onClick={onLookInside}
          className="bg-[var(--color-candy-purple)] border-4 border-[#222] text-[#222] px-4 py-2 rounded-full shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center gap-2 btn-squish hover-wiggle font-bold text-sm"
          aria-label={t.aria_look_inside}
        >
          <Blocks size={20} strokeWidth={2.5} />
          <span className="hidden sm:inline">
            {blockCount !== undefined
              ? `${blockCount} Blocks`
              : t.aria_look_inside}
          </span>
        </button>
      </div>

      <BuildingOverlay
        isLoading={isLoading}
        buildingText={convertingText ?? t.overlay_building}
        didYouKnowLabel={t.overlay_did_you_know}
        facts={codingFacts}
      />
    </div>
  );
}
