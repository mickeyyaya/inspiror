import { useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Blocks } from "lucide-react";
import type { Block } from "../../types/block";
import type { TranslationKeys } from "../../i18n/translations";
import { BlockCard } from "./BlockCard";

interface BlockEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  isLoading?: boolean;
  t?: TranslationKeys;
}

export function BlockEditor({
  blocks,
  onBlocksChange,
  isLoading = false,
  t,
}: BlockEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id);
      const newIndex = sortedBlocks.findIndex((b) => b.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder: create new array with updated order values
      const reordered = [...sortedBlocks];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const updated = reordered.map((block, idx) => ({
        ...block,
        order: idx,
      }));

      onBlocksChange(updated);
    },
    [sortedBlocks, onBlocksChange],
  );

  const handleToggle = useCallback(
    (id: string) => {
      const updated = blocks.map((b) =>
        b.id === id ? { ...b, enabled: !b.enabled } : b,
      );
      onBlocksChange(updated);
    },
    [blocks, onBlocksChange],
  );

  const handleParamChange = useCallback(
    (blockId: string, paramKey: string, value: string | number | boolean) => {
      const updated = blocks.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          origin: "remix" as const,
          params: b.params.map((p) =>
            p.key === paramKey ? { ...p, value } : p,
          ),
        };
      });
      onBlocksChange(updated);
    },
    [blocks, onBlocksChange],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = sortedBlocks
        .filter((b) => b.id !== id)
        .map((b, idx) => ({ ...b, order: idx }));
      onBlocksChange(updated);
    },
    [sortedBlocks, onBlocksChange],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white p-4 shadow-md flex-shrink-0">
        <div className="flex items-center gap-2 font-bold">
          <Blocks size={20} />
          <span className="text-lg font-extrabold tracking-tight">
            {t?.block_panel_title ?? "Blocks"}
          </span>
          <span className="ml-auto text-sm opacity-80">
            {blocks.filter((b) => b.enabled).length}/{blocks.length}
          </span>
        </div>
        {blocks.length > 0 && (
          <p className="text-xs opacity-60 mt-1">
            {t?.block_panel_hint ?? "Drag to reorder · tap to toggle"}
          </p>
        )}
      </div>

      {/* Block list */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        role="list"
        aria-label={t?.aria_logic_blocks ?? "Logic blocks"}
      >
        {isLoading && blocks.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl border-3 border-gray-200 bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedBlocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedBlocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                onToggle={handleToggle}
                onParamChange={handleParamChange}
                onDelete={handleDelete}
                t={t}
              />
            ))}
          </SortableContext>
        </DndContext>

        {blocks.length > 0 && blocks.every((b) => !b.enabled) && (
          <div className="text-center py-6 px-4">
            <p className="text-3xl mb-2">💡</p>
            <p className="text-sm text-gray-500 font-semibold">
              {t?.block_all_disabled ?? "Enable a block to see your creation!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
