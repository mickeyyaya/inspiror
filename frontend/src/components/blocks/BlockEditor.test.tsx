import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlockEditor } from "./BlockEditor";
import type { Block } from "../../types/block";

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: unknown) => void }) => {
    (window as Window & { __testDragEnd?: (e: unknown) => void }).__testDragEnd = onDragEnd;
    return <>{children}</>;
  },
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: () => ({}),
  useSensors: () => [],
}));

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: "vertical",
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => null } },
}));

function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: "test-block",
    type: "setup",
    label: "Test Block",
    emoji: "🧪",
    enabled: true,
    params: [],
    code: 'game.setBackground("#000");',
    order: 0,
    ...overrides,
  };
}

describe("BlockEditor", () => {
  describe("header", () => {
    it("shows 'Blocks' text in header", () => {
      render(<BlockEditor blocks={[]} onBlocksChange={vi.fn()} />);
      expect(screen.getByText("Blocks")).toBeInTheDocument();
    });

    it("shows enabled/total count in header", () => {
      const blocks = [
        makeBlock({ id: "a", enabled: true, order: 0 }),
        makeBlock({ id: "b", enabled: false, order: 1 }),
        makeBlock({ id: "c", enabled: true, order: 2 }),
      ];
      render(<BlockEditor blocks={blocks} onBlocksChange={vi.fn()} />);
      expect(screen.getByText("2/3")).toBeInTheDocument();
    });

    it("shows 0/0 when blocks array is empty", () => {
      render(<BlockEditor blocks={[]} onBlocksChange={vi.fn()} />);
      expect(screen.getByText("0/0")).toBeInTheDocument();
    });
  });

  describe("block list", () => {
    it("has role=list and aria-label on block list container", () => {
      render(<BlockEditor blocks={[]} onBlocksChange={vi.fn()} />);
      expect(screen.getByRole("list", { name: "Logic blocks" })).toBeInTheDocument();
    });

    it("renders no block cards when blocks array is empty", () => {
      render(<BlockEditor blocks={[]} onBlocksChange={vi.fn()} />);
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });

    it("renders correct number of block cards", () => {
      const blocks = [
        makeBlock({ id: "a", order: 0 }),
        makeBlock({ id: "b", order: 1 }),
        makeBlock({ id: "c", order: 2 }),
      ];
      render(<BlockEditor blocks={blocks} onBlocksChange={vi.fn()} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("renders blocks sorted by order field regardless of input order", () => {
      const blocks = [
        makeBlock({ id: "third", label: "Third", order: 2 }),
        makeBlock({ id: "first", label: "First", order: 0 }),
        makeBlock({ id: "second", label: "Second", order: 1 }),
      ];
      render(<BlockEditor blocks={blocks} onBlocksChange={vi.fn()} />);
      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveAttribute("aria-label", "Block: First");
      expect(items[1]).toHaveAttribute("aria-label", "Block: Second");
      expect(items[2]).toHaveAttribute("aria-label", "Block: Third");
    });
  });

  describe("loading state", () => {
    it("shows skeleton loader when isLoading=true and blocks are empty", () => {
      const { container } = render(
        <BlockEditor blocks={[]} onBlocksChange={vi.fn()} isLoading={true} />
      );
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("does not show skeleton loader when isLoading=false", () => {
      const { container } = render(
        <BlockEditor blocks={[]} onBlocksChange={vi.fn()} isLoading={false} />
      );
      expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
    });

    it("does not show skeleton loader when blocks are present even if isLoading=true", () => {
      const { container } = render(
        <BlockEditor
          blocks={[makeBlock()]}
          onBlocksChange={vi.fn()}
          isLoading={true}
        />
      );
      expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
    });
  });

  describe("toggle interaction", () => {
    it("calls onBlocksChange with toggled enabled state when toggle is clicked", () => {
      const onBlocksChange = vi.fn();
      const blocks = [makeBlock({ id: "a", enabled: true, order: 0 })];
      render(<BlockEditor blocks={blocks} onBlocksChange={onBlocksChange} />);
      fireEvent.click(screen.getByRole("switch", { name: "Disable Test Block" }));
      expect(onBlocksChange).toHaveBeenCalledWith([
        expect.objectContaining({ id: "a", enabled: false }),
      ]);
    });

    it("preserves other blocks when toggling one", () => {
      const onBlocksChange = vi.fn();
      const blocks = [
        makeBlock({ id: "a", label: "Block A", enabled: true, order: 0 }),
        makeBlock({ id: "b", label: "Block B", enabled: true, order: 1 }),
      ];
      render(<BlockEditor blocks={blocks} onBlocksChange={onBlocksChange} />);
      fireEvent.click(screen.getByRole("switch", { name: "Disable Block A" }));
      const result = onBlocksChange.mock.calls[0][0];
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: "a", enabled: false });
      expect(result[1]).toMatchObject({ id: "b", enabled: true });
    });
  });

  describe("drag end reordering", () => {
    it("calls onBlocksChange with reordered blocks when drag ends", () => {
      const onBlocksChange = vi.fn();
      const blocks = [
        makeBlock({ id: "a", label: "A", order: 0 }),
        makeBlock({ id: "b", label: "B", order: 1 }),
        makeBlock({ id: "c", label: "C", order: 2 }),
      ];
      render(<BlockEditor blocks={blocks} onBlocksChange={onBlocksChange} />);

      // Simulate drag: move "a" to position of "c"
      const dragEnd = (window as Window & { __testDragEnd?: (e: unknown) => void }).__testDragEnd;
      dragEnd?.({ active: { id: "a" }, over: { id: "c" } });

      expect(onBlocksChange).toHaveBeenCalled();
      const result = onBlocksChange.mock.calls[0][0] as Block[];
      // After moving "a" after "c", order values should be reassigned
      expect(result.map((b) => b.order)).toEqual([0, 1, 2]);
      // "a" should now be last
      expect(result[2].id).toBe("a");
    });

    it("does not call onBlocksChange when dragged onto same item", () => {
      const onBlocksChange = vi.fn();
      const blocks = [makeBlock({ id: "a", order: 0 })];
      render(<BlockEditor blocks={blocks} onBlocksChange={onBlocksChange} />);

      const dragEnd = (window as Window & { __testDragEnd?: (e: unknown) => void }).__testDragEnd;
      dragEnd?.({ active: { id: "a" }, over: { id: "a" } });

      expect(onBlocksChange).not.toHaveBeenCalled();
    });

    it("does not call onBlocksChange when over is null", () => {
      const onBlocksChange = vi.fn();
      const blocks = [makeBlock({ id: "a", order: 0 })];
      render(<BlockEditor blocks={blocks} onBlocksChange={onBlocksChange} />);

      const dragEnd = (window as Window & { __testDragEnd?: (e: unknown) => void }).__testDragEnd;
      dragEnd?.({ active: { id: "a" }, over: null });

      expect(onBlocksChange).not.toHaveBeenCalled();
    });
  });

  describe("param change interaction", () => {
    it("calls onBlocksChange with updated param value", () => {
      const onBlocksChange = vi.fn();
      const blocks = [
        makeBlock({
          id: "a",
          order: 0,
          params: [
            { key: "speed", label: "Speed", type: "number", value: 50, min: 0, max: 100, step: 1 },
          ],
        }),
      ];
      render(<BlockEditor blocks={blocks} onBlocksChange={onBlocksChange} />);

      // Expand params
      fireEvent.click(screen.getByRole("button", { name: "Expand parameters" }));
      fireEvent.change(screen.getByRole("slider", { name: "Speed" }), {
        target: { value: "75" },
      });

      expect(onBlocksChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "a",
          params: [expect.objectContaining({ key: "speed", value: 75 })],
        }),
      ]);
    });
  });
});
