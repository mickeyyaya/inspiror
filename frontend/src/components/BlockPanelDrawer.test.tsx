import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlockPanelDrawer } from "./BlockPanelDrawer";
import type { TranslationKeys } from "../i18n/translations";
import type { Block } from "../types/block";

vi.mock("./blocks/BlockEditor", () => ({
  BlockEditor: ({ blocks }: { blocks: Block[] }) => (
    <div data-testid="block-editor">
      {blocks.length} blocks
    </div>
  ),
}));

const defaultT = {
  block_panel_close: "Close",
} as TranslationKeys;

function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: "test",
    type: "setup",
    label: "Test",
    emoji: "🧪",
    enabled: true,
    params: [],
    code: "",
    order: 0,
    ...overrides,
  };
}

describe("BlockPanelDrawer", () => {
  it("renders block editor and close button", () => {
    render(
      <BlockPanelDrawer
        isOpen={true}
        onClose={vi.fn()}
        blocks={[makeBlock()]}
        onBlocksChange={vi.fn()}
        isLoading={false}
        t={defaultT}
      />,
    );
    expect(screen.getByTestId("block-editor")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("sets inert when closed", () => {
    render(
      <BlockPanelDrawer
        isOpen={false}
        onClose={vi.fn()}
        blocks={[]}
        onBlocksChange={vi.fn()}
        isLoading={false}
        t={defaultT}
      />,
    );
    const panel = screen.getByTestId("block-panel");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel).toHaveAttribute("inert", "");
  });

  it("does not set inert when open", () => {
    render(
      <BlockPanelDrawer
        isOpen={true}
        onClose={vi.fn()}
        blocks={[]}
        onBlocksChange={vi.fn()}
        isLoading={false}
        t={defaultT}
      />,
    );
    const panel = screen.getByTestId("block-panel");
    expect(panel).toHaveAttribute("aria-hidden", "false");
    expect(panel).not.toHaveAttribute("inert");
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <BlockPanelDrawer
        isOpen={true}
        onClose={onClose}
        blocks={[]}
        onBlocksChange={vi.fn()}
        isLoading={false}
        t={defaultT}
      />,
    );
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape key pressed while open", () => {
    const onClose = vi.fn();
    render(
      <BlockPanelDrawer
        isOpen={true}
        onClose={onClose}
        blocks={[]}
        onBlocksChange={vi.fn()}
        isLoading={false}
        t={defaultT}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose on Escape when closed", () => {
    const onClose = vi.fn();
    render(
      <BlockPanelDrawer
        isOpen={false}
        onClose={onClose}
        blocks={[]}
        onBlocksChange={vi.fn()}
        isLoading={false}
        t={defaultT}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
