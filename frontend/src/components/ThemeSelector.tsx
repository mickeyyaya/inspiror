import { useRef, useEffect } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { APP_THEMES } from "../constants/themes";
import { X, Check } from "lucide-react";
import type { TranslationKeys } from "../i18n/translations";

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
  t: TranslationKeys;
}

export function ThemeSelector({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  t,
}: ThemeSelectorProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-selector-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="bg-[#fdfbf7] border-[6px] border-[#222] rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-[12px_12px_0_#222] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--color-candy-blue)] border-b-[6px] border-[#222] p-6 flex items-center justify-between shrink-0">
          <h2
            id="theme-selector-title"
            className="text-3xl font-extrabold text-[#222] tracking-wide flex items-center gap-3"
            style={{ textShadow: "2px 2px 0px white" }}
          >
            <span className="text-4xl">🎨</span>
            {t.themes_title ?? "Choose a Background!"}
          </h2>
          <button
            onClick={onClose}
            className="bg-[var(--color-candy-pink)] border-4 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
            aria-label="Close"
          >
            <X size={24} className="text-[#222]" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {APP_THEMES.map((theme) => {
              const isSelected = theme.id === currentThemeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`relative flex flex-col items-center btn-squish group outline-none ${
                    isSelected ? "scale-105" : ""
                  }`}
                  aria-pressed={isSelected}
                >
                  <div
                    className={`w-full aspect-square rounded-[2rem] border-4 border-[#222] shadow-[6px_6px_0_#222] overflow-hidden mb-3 transition-all ${
                      isSelected
                        ? "shadow-[0_0_0_4px_var(--color-candy-green),6px_6px_0_#222] translate-y-[-4px]"
                        : "group-hover:shadow-[8px_8px_0_#222] group-hover:-translate-y-1"
                    }`}
                    style={{
                      backgroundColor: theme.backgroundColor,
                      backgroundImage: theme.backgroundImage,
                      backgroundSize: theme.backgroundImage?.includes("url") ? "cover" : (theme.backgroundSize ? "150%" : "auto"),
                      backgroundPosition: "center",
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[var(--color-candy-green)] text-[#222] rounded-full p-1 border-2 border-[#222] shadow-[2px_2px_0_#222]">
                        <Check size={16} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <span className="text-3xl mb-1">{theme.emoji}</span>
                  <span className="font-extrabold text-[#222] text-sm text-center leading-tight">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
