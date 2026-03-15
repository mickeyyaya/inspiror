import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { Block } from "../../types/block";
import type { TranslationKeys } from "../../i18n/translations";
import { BLOCK_CATEGORIES } from "../../constants/blockCategories";
import { ParamEditor } from "./ParamEditor";

interface BlockCardProps {
  block: Block;
  onToggle: (id: string) => void;
  onParamChange: (
    blockId: string,
    paramKey: string,
    value: string | number | boolean,
  ) => void;
  onDelete?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  t?: TranslationKeys;
}

export function BlockCard({
  block,
  onToggle,
  onParamChange,
  onDelete,
  onAccept,
  onReject,
  t,
}: BlockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const category = BLOCK_CATEGORIES[block.type];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const isPending = block.status === "pending";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[1.5rem] border-4 overflow-hidden transition-all
        ${isPending ? "border-dashed border-amber-400 bg-amber-50 animate-pulse-subtle" : "border-[#222] bg-white"}
        ${isDragging ? "opacity-50 shadow-none" : isPending ? "shadow-[6px_6px_0_rgba(245,158,11,0.4)]" : "shadow-[6px_6px_0_#222]"}
        ${!block.enabled && !isPending ? "opacity-60" : ""}`}
      role="listitem"
      aria-label={`Block: ${block.label}${isPending ? ` (${t?.block_pending_label ?? "New"})` : ""}`}
    >
      {/* Category color band */}
      <div className="h-1.5" style={{ backgroundColor: category.color }} />

      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 touch-none"
          aria-label={`Drag to reorder ${block.label}`}
        >
          <GripVertical size={16} className="text-gray-400" />
        </button>

        {/* Emoji + label + origin badge */}
        <span className="text-lg" aria-hidden="true">
          {block.emoji}
        </span>
        <span className="flex-1 text-sm font-extrabold text-[#222] truncate">
          {block.label}
        </span>
        {block.origin && (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
              block.origin === "remix"
                ? "bg-[var(--color-candy-pink)]/20 border-[var(--color-candy-pink)] text-[#b44]"
                : block.origin === "template"
                  ? "bg-[var(--color-candy-blue)]/20 border-[var(--color-candy-blue)] text-[#2a8]"
                  : "bg-[var(--color-candy-purple)]/20 border-[var(--color-candy-purple)] text-[#7c3aed]"
            }`}
            title={
              block.origin === "remix"
                ? "You modified this block"
                : block.origin === "template"
                  ? "From a starter template"
                  : "AI generated"
            }
          >
            {block.origin === "remix"
              ? "✏️"
              : block.origin === "template"
                ? "📋"
                : "🤖"}
          </span>
        )}

        {isPending ? (
          <>
            {/* Pending badge */}
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-amber-800">
              {t?.block_pending_label ?? "New"}
            </span>
            {/* Accept button */}
            <button
              onClick={() => onAccept?.(block.id)}
              className="p-1.5 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 border-2 border-green-400 transition-colors"
              aria-label={`${t?.block_accept ?? "Keep this block"}: ${block.label}`}
            >
              <Check size={16} strokeWidth={3} />
            </button>
            {/* Reject button */}
            <button
              onClick={() => onReject?.(block.id)}
              className="p-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 border-2 border-red-400 transition-colors"
              aria-label={`${t?.block_reject ?? "Remove this block"}: ${block.label}`}
            >
              <X size={16} strokeWidth={3} />
            </button>
          </>
        ) : (
          <>
            {/* Enable/disable toggle */}
            <button
              onClick={() => onToggle(block.id)}
              className={`w-12 h-7 rounded-full border-[3px] border-[#222] transition-colors relative flex-shrink-0 ${
                block.enabled ? "bg-[var(--color-candy-green)]" : "bg-gray-300"
              }`}
              aria-label={`${block.enabled ? (t?.block_disable ?? "Disable") : (t?.block_enable ?? "Enable")} ${block.label}`}
              role="switch"
              aria-checked={block.enabled}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white border-2 border-[#222] transition-transform ${
                  block.enabled ? "translate-x-[20px]" : "translate-x-0.5"
                }`}
              />
            </button>

            {/* Expand/collapse */}
            {block.params.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label={
                  isExpanded
                    ? (t?.block_collapse_params ?? "Collapse parameters")
                    : (t?.block_expand_params ?? "Expand parameters")
                }
              >
                {isExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            )}

            {/* Delete button */}
            {onDelete && (
              <button
                onClick={() => onDelete(block.id)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                aria-label={`${t?.aria_delete_block ?? "Delete"} ${block.label}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Params panel (expandable) */}
      {isExpanded && block.params.length > 0 && (
        <div className="px-4 pb-3 space-y-2 border-t border-gray-200 pt-2">
          {block.params.map((param) => (
            <ParamEditor
              key={param.key}
              param={param}
              onChange={(key, value) => onParamChange(block.id, key, value)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
