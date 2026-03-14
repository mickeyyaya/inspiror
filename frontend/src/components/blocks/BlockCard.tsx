import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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
  t?: TranslationKeys;
}

export function BlockCard({
  block,
  onToggle,
  onParamChange,
  onDelete,
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border-3 border-[#222] bg-white overflow-hidden transition-all
        ${isDragging ? "opacity-50 shadow-none" : "shadow-[4px_4px_0_#222]"}
        ${!block.enabled ? "opacity-60" : ""}`}
      role="listitem"
      aria-label={`Block: ${block.label}`}
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

        {/* Emoji + label */}
        <span className="text-lg" aria-hidden="true">
          {block.emoji}
        </span>
        <span className="flex-1 text-sm font-extrabold text-[#222] truncate">
          {block.label}
        </span>

        {/* Enable/disable toggle */}
        <button
          onClick={() => onToggle(block.id)}
          className={`w-10 h-6 rounded-full border-2 border-[#222] transition-colors relative flex-shrink-0 ${
            block.enabled ? "bg-[#39ff14]" : "bg-gray-300"
          }`}
          aria-label={`${block.enabled ? (t?.block_disable ?? "Disable") : (t?.block_enable ?? "Enable")} ${block.label}`}
          role="switch"
          aria-checked={block.enabled}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-[#222] transition-transform ${
              block.enabled ? "translate-x-[18px]" : "translate-x-0.5"
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
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
