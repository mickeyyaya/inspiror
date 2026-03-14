import { useRef, useEffect } from "react";
import type { ChatMessage } from "../types/project";
import { pickRandomChips, pickRandomScaffolds } from "../constants";
import type { VoiceLanguage } from "../hooks/useVoice";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingReply: string | undefined;
  showSuggestions: boolean;
  suggestionChips: { emoji: string; label: string }[];
  onSuggestionChipsShuffle: (chips: { emoji: string; label: string }[]) => void;
  onChipClick: (label: string) => void;
  thinkingText: string;
  magicButtonPrompt: string;
  moreIdeasText: string;
  ariaShuffleLabel?: string;
  buddyTipLabel?: string;
  scaffoldChips?: { emoji: string; label: string }[];
  onScaffoldClick?: (template: string) => void;
  onScaffoldShuffle?: (chips: { emoji: string; label: string }[]) => void;
  scaffoldHint?: string;
  language?: VoiceLanguage;
}

export function MessageList({
  messages,
  isLoading,
  streamingReply,
  showSuggestions,
  suggestionChips,
  onSuggestionChipsShuffle,
  onChipClick,
  thinkingText,
  magicButtonPrompt,
  moreIdeasText,
  ariaShuffleLabel,
  buddyTipLabel,
  scaffoldChips = [],
  onScaffoldClick,
  onScaffoldShuffle,
  scaffoldHint,
  language,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingReply, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM4ODgiIG9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] z-10">
      {messages.map((msg) =>
        msg.type === "tip" ? (
          <div
            key={msg.id}
            className="max-w-[85%] p-3 rounded-[1.5rem] text-[15px] leading-relaxed font-bold shadow-[3px_3px_0_#b8860b] border-3 border-[#b8860b] bg-[var(--color-candy-yellow)] text-[#222] self-start rounded-tl-sm msg-buddy relative"
          >
            <div className="absolute top-[-12px] left-[-12px] text-xl drop-shadow-sm">
              💡
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#b8860b] mr-2">
              {buddyTipLabel ?? "Buddy Tip"}
            </span>
            {msg.content}
          </div>
        ) : (
          <div
            key={msg.id}
            className={`max-w-[85%] p-4 rounded-[1.5rem] text-[17px] leading-relaxed font-bold shadow-[4px_4px_0_#222] border-4 border-[#222] relative ${
              msg.role === "user"
                ? "bg-[var(--color-candy-pink)] text-[#222] self-end rounded-tr-sm msg-user"
                : "bg-white text-[#222] self-start rounded-tl-sm msg-buddy"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="absolute top-[-15px] left-[-15px] text-2xl rotate-[-15deg] drop-shadow-sm">
                ✨
              </div>
            )}
            {msg.content}
          </div>
        ),
      )}

      {isLoading && streamingReply && (
        <div
          aria-live="polite"
          className="max-w-[85%] p-4 rounded-[1.5rem] text-[17px] leading-relaxed font-bold shadow-[4px_4px_0_#222] border-4 border-[#222] bg-white text-[#222] self-start rounded-tl-sm msg-buddy relative"
        >
          <div className="absolute top-[-15px] left-[-15px] text-2xl rotate-[-15deg] drop-shadow-sm animate-pulse">
            ✨
          </div>
          {streamingReply}
          <span className="inline-block w-2 h-4 ml-1 bg-[#222] animate-ping rounded-full"></span>
        </div>
      )}

      {isLoading && !streamingReply && (
        <div className="max-w-[85%] p-4 rounded-[1.5rem] text-[17px] leading-relaxed font-bold shadow-[4px_4px_0_#222] border-4 border-[#222] bg-white text-[#222] self-start rounded-tl-sm msg-buddy flex items-center gap-2">
          <span
            className="animate-bounce inline-block"
            style={{ animationDelay: "0ms" }}
          >
            .
          </span>
          <span
            className="animate-bounce inline-block"
            style={{ animationDelay: "150ms" }}
          >
            .
          </span>
          <span
            className="animate-bounce inline-block"
            style={{ animationDelay: "300ms" }}
          >
            .
          </span>
          <span className="ml-2 text-gray-500">{thinkingText}</span>
        </div>
      )}

      {showSuggestions && (
        <div className="flex flex-col gap-3 mt-4" data-onboarding="suggestions">
          <div className="flex items-center gap-2 ml-2">
            <p className="text-[#222] text-sm font-extrabold ml-2 uppercase tracking-wider bg-white/50 w-fit px-3 py-1 rounded-full border-2 border-[#222]/20">
              {magicButtonPrompt}
            </p>
            <button
              onClick={() =>
                onSuggestionChipsShuffle(pickRandomChips(language))
              }
              className="bg-white border-2 border-[#222] px-3 py-1 rounded-full text-sm font-bold text-[#222] hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
              aria-label={ariaShuffleLabel ?? "Shuffle suggestions"}
              data-testid="shuffle-chips"
            >
              🔀 {moreIdeasText}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {suggestionChips.map((chip, index) => {
              const bgColors = [
                "bg-[var(--color-candy-blue)]",
                "bg-[var(--color-candy-yellow)]",
                "bg-[var(--color-candy-orange)]",
                "bg-[var(--color-candy-green)]",
              ];
              return (
                <button
                  key={chip.label}
                  onClick={() => onChipClick(chip.label)}
                  className={`chip-enter ${bgColors[index % bgColors.length]} text-[#222] border-4 border-[#222] px-4 py-3 rounded-[1.5rem] shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none hover:shadow-[6px_6px_0_#222] transition-all text-[15px] font-bold flex items-center btn-squish`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <span className="text-2xl mr-2 drop-shadow-sm">
                    {chip.emoji}
                  </span>
                  {chip.label}
                </button>
              );
            })}
          </div>

          {scaffoldChips.length > 0 && onScaffoldClick && (
            <div className="mt-3">
              <p className="text-[#222] text-xs font-extrabold ml-2 mb-2 uppercase tracking-wider bg-[var(--color-candy-purple)]/30 w-fit px-3 py-1 rounded-full border-2 border-[var(--color-candy-purple)]/40">
                ✏️ {scaffoldHint ?? "Fill in the blanks, then send!"}
              </p>
              <div className="flex flex-wrap gap-3">
                {scaffoldChips.map((chip, index) => (
                  <button
                    key={chip.label}
                    onClick={() => onScaffoldClick(chip.label)}
                    className="chip-enter bg-white text-[#222] border-4 border-dashed border-[var(--color-candy-purple)] px-4 py-3 rounded-[1.5rem] shadow-[3px_3px_0_var(--color-candy-purple)] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none hover:shadow-[5px_5px_0_var(--color-candy-purple)] transition-all text-[15px] font-bold flex items-center btn-squish"
                    style={{ animationDelay: `${(index + 4) * 150}ms` }}
                    data-testid="scaffold-chip"
                  >
                    <span className="text-2xl mr-2 drop-shadow-sm">
                      {chip.emoji}
                    </span>
                    {chip.label}
                  </button>
                ))}
                {onScaffoldShuffle && (
                  <button
                    onClick={() =>
                      onScaffoldShuffle(pickRandomScaffolds(language))
                    }
                    className="bg-white border-2 border-[var(--color-candy-purple)] px-3 py-1 rounded-full text-sm font-bold text-[#222] hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0_var(--color-candy-purple)]"
                    data-testid="shuffle-scaffolds"
                  >
                    🔀
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
