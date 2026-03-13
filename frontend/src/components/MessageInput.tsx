import { Send, Mic, MicOff } from "lucide-react";

interface MessageInputProps {
  inputValue: string;
  isLoading: boolean;
  isListening: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onToggleListening: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  t: {
    input_placeholder: string;
    aria_send: string;
    aria_disable_voice: string;
    aria_enable_voice: string;
  };
}

export function MessageInput({
  inputValue,
  isLoading,
  isListening,
  onInputChange,
  onSend,
  onToggleListening,
  inputRef,
  t,
}: MessageInputProps) {
  return (
    <div className="p-4 bg-[var(--color-candy-yellow)] border-t-4 border-[#222] flex gap-3 shadow-[0_-4px_0_#222] z-20">
      <button
        onClick={onToggleListening}
        data-onboarding="voice"
        className={`border-4 border-[#222] p-3 rounded-full shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center cursor-pointer btn-squish ${
          isListening
            ? "bg-[var(--color-candy-pink)] animate-pulse"
            : "bg-white"
        }`}
        aria-label={isListening ? t.aria_disable_voice : t.aria_enable_voice}
      >
        {isListening ? (
          <MicOff size={28} strokeWidth={2.5} className="text-[#222]" />
        ) : (
          <Mic size={28} strokeWidth={2.5} className="text-[#222]" />
        )}
      </button>
      <input
        ref={inputRef}
        type="text"
        placeholder={t.input_placeholder}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        className={`flex-1 bg-white text-[#222] px-5 py-3 rounded-[2rem] border-4 border-[#222] focus:outline-none placeholder-gray-500 text-[17px] font-bold transition-all input-glow ${
          inputValue.trim() ? "input-glow-active" : ""
        }`}
      />
      <button
        onClick={onSend}
        disabled={isLoading || !inputValue.trim()}
        className="bg-[var(--color-candy-green)] text-[#222] border-4 border-[#222] p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center cursor-pointer btn-squish"
        aria-label={t.aria_send}
      >
        <Send size={28} className="ml-1" strokeWidth={2.5} />
      </button>
    </div>
  );
}
