import { useEffect } from "react";
import type { Block } from "../types/block";
import type { TranslationKeys } from "../i18n/translations";
import { BlockEditor } from "./blocks/BlockEditor";

export interface BlockPanelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  isLoading: boolean;
  t: TranslationKeys;
}

export function BlockPanelDrawer({
  isOpen,
  onClose,
  blocks,
  onBlocksChange,
  isLoading,
  t,
}: BlockPanelDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <div
      data-testid="block-panel"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      className={`fixed top-0 right-0 h-full z-40 flex flex-col
        w-full sm:w-[400px]
        bg-[#fdfbf7]
        border-l-4 border-[#222]
        shadow-[-8px_0_0_#222]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <BlockEditor
        blocks={blocks}
        onBlocksChange={onBlocksChange}
        isLoading={isLoading}
        t={t}
      />
      <div className="p-3 border-t-2 border-gray-200 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-2xl bg-[#222] text-white font-bold text-sm
            border-2 border-[#222] shadow-[4px_4px_0_rgba(0,0,0,0.2)]
            active:translate-y-[4px] active:shadow-none transition-all"
        >
          {t.block_panel_close}
        </button>
      </div>
    </div>
  );
}
