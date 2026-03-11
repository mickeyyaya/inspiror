import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlockCard } from "./BlockCard";
import type { Block, BlockParam } from "../../types/block";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
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

function makeParam(overrides: Partial<BlockParam> = {}): BlockParam {
  return {
    key: "speed",
    label: "Speed",
    type: "number",
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    ...overrides,
  };
}

describe("BlockCard", () => {
  it("renders the block emoji", () => {
    render(
      <BlockCard block={makeBlock({ emoji: "🚀" })} onToggle={vi.fn()} onParamChange={vi.fn()} />
    );
    expect(screen.getByText("🚀")).toBeInTheDocument();
  });

  it("renders the block label", () => {
    render(
      <BlockCard block={makeBlock({ label: "My Block" })} onToggle={vi.fn()} onParamChange={vi.fn()} />
    );
    expect(screen.getByText("My Block")).toBeInTheDocument();
  });

  it("renders category color band with setup color", () => {
    const { container } = render(
      <BlockCard block={makeBlock({ type: "setup" })} onToggle={vi.fn()} onParamChange={vi.fn()} />
    );
    const colorBand = container.querySelector('[style*="background-color"]') as HTMLElement;
    expect(colorBand).toBeInTheDocument();
    expect(colorBand.style.backgroundColor).toBe("rgb(59, 130, 246)"); // #3b82f6
  });

  it("renders category color band with collision color", () => {
    const { container } = render(
      <BlockCard block={makeBlock({ type: "collision" })} onToggle={vi.fn()} onParamChange={vi.fn()} />
    );
    const colorBand = container.querySelector('[style*="background-color"]') as HTMLElement;
    expect(colorBand.style.backgroundColor).toBe("rgb(239, 68, 68)"); // #ef4444
  });

  it("has role=listitem and aria-label", () => {
    render(
      <BlockCard block={makeBlock({ label: "My Block" })} onToggle={vi.fn()} onParamChange={vi.fn()} />
    );
    expect(screen.getByRole("listitem", { name: "Block: My Block" })).toBeInTheDocument();
  });

  describe("toggle switch", () => {
    it("calls onToggle with block id when clicked", () => {
      const onToggle = vi.fn();
      render(
        <BlockCard block={makeBlock({ id: "abc123" })} onToggle={onToggle} onParamChange={vi.fn()} />
      );
      fireEvent.click(screen.getByRole("switch"));
      expect(onToggle).toHaveBeenCalledWith("abc123");
    });

    it("toggle shows green background class when block is enabled", () => {
      render(
        <BlockCard block={makeBlock({ enabled: true })} onToggle={vi.fn()} onParamChange={vi.fn()} />
      );
      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveClass("bg-[#39ff14]");
    });

    it("toggle shows gray background class when block is disabled", () => {
      render(
        <BlockCard block={makeBlock({ enabled: false })} onToggle={vi.fn()} onParamChange={vi.fn()} />
      );
      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveClass("bg-gray-300");
    });

    it("toggle has aria-checked=true when enabled", () => {
      render(
        <BlockCard block={makeBlock({ enabled: true })} onToggle={vi.fn()} onParamChange={vi.fn()} />
      );
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    });

    it("toggle has aria-checked=false when disabled", () => {
      render(
        <BlockCard block={makeBlock({ enabled: false })} onToggle={vi.fn()} onParamChange={vi.fn()} />
      );
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("disabled block", () => {
    it("has opacity-60 class when disabled", () => {
      const { container } = render(
        <BlockCard block={makeBlock({ enabled: false })} onToggle={vi.fn()} onParamChange={vi.fn()} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("opacity-60");
    });

    it("does not have opacity-60 class when enabled", () => {
      const { container } = render(
        <BlockCard block={makeBlock({ enabled: true })} onToggle={vi.fn()} onParamChange={vi.fn()} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain("opacity-60");
    });
  });

  describe("expand/collapse", () => {
    it("does not show expand button when params array is empty", () => {
      render(
        <BlockCard block={makeBlock({ params: [] })} onToggle={vi.fn()} onParamChange={vi.fn()} />
      );
      expect(screen.queryByRole("button", { name: /expand parameters/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /collapse parameters/i })).not.toBeInTheDocument();
    });

    it("shows expand button when params exist", () => {
      render(
        <BlockCard
          block={makeBlock({ params: [makeParam()] })}
          onToggle={vi.fn()}
          onParamChange={vi.fn()}
        />
      );
      expect(screen.getByRole("button", { name: "Expand parameters" })).toBeInTheDocument();
    });

    it("clicking expand reveals ParamEditor components", () => {
      render(
        <BlockCard
          block={makeBlock({ params: [makeParam({ label: "Speed" })] })}
          onToggle={vi.fn()}
          onParamChange={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Expand parameters" }));
      expect(screen.getByRole("slider", { name: "Speed" })).toBeInTheDocument();
    });

    it("clicking expand changes button label to Collapse parameters", () => {
      render(
        <BlockCard
          block={makeBlock({ params: [makeParam()] })}
          onToggle={vi.fn()}
          onParamChange={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Expand parameters" }));
      expect(screen.getByRole("button", { name: "Collapse parameters" })).toBeInTheDocument();
    });

    it("params panel is hidden before expanding", () => {
      render(
        <BlockCard
          block={makeBlock({ params: [makeParam({ label: "Speed" })] })}
          onToggle={vi.fn()}
          onParamChange={vi.fn()}
        />
      );
      expect(screen.queryByRole("slider", { name: "Speed" })).not.toBeInTheDocument();
    });
  });

  describe("drag handle", () => {
    it("has correct aria-label for drag handle button", () => {
      render(
        <BlockCard
          block={makeBlock({ label: "My Block" })}
          onToggle={vi.fn()}
          onParamChange={vi.fn()}
        />
      );
      expect(
        screen.getByRole("button", { name: "Drag to reorder My Block" })
      ).toBeInTheDocument();
    });
  });

  describe("param change propagation", () => {
    it("calls onParamChange with blockId, paramKey, and value when ParamEditor fires onChange", () => {
      const onParamChange = vi.fn();
      render(
        <BlockCard
          block={makeBlock({
            id: "block-42",
            params: [makeParam({ key: "speed", type: "number", value: 50 })],
          })}
          onToggle={vi.fn()}
          onParamChange={onParamChange}
        />
      );
      // Expand to reveal param editor
      fireEvent.click(screen.getByRole("button", { name: "Expand parameters" }));
      fireEvent.change(screen.getByRole("slider"), { target: { value: "80" } });
      expect(onParamChange).toHaveBeenCalledWith("block-42", "speed", 80);
    });
  });
});
