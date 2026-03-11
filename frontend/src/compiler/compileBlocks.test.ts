import { describe, it, expect } from "vitest";
import { compileBlocks } from "./compileBlocks";
import { substituteParams } from "./substituteParams";
import type { Block, BlockParam } from "../types/block";

function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: "test-1",
    type: "setup",
    label: "Test Block",
    emoji: "🧪",
    enabled: true,
    params: [],
    code: 'game.setBackground("#112233");',
    order: 0,
    ...overrides,
  };
}

describe("compileBlocks", () => {
  it("produces valid HTML with runtime engine", () => {
    const html = compileBlocks([]);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("window.game");
    expect(html).toContain("</html>");
  });

  it("includes enabled block code in IIFEs", () => {
    const block = makeBlock({ code: 'game.setBackground("#ff0000");' });
    const html = compileBlocks([block]);
    expect(html).toContain('game.setBackground("#ff0000")');
    expect(html).toContain("(function()");
    expect(html).toContain(`Block: Test Block (test-1)`);
  });

  it("excludes disabled blocks", () => {
    const block = makeBlock({ enabled: false, code: "SHOULD_NOT_APPEAR" });
    const html = compileBlocks([block]);
    expect(html).not.toContain("SHOULD_NOT_APPEAR");
  });

  it("orders blocks by order field", () => {
    const b1 = makeBlock({ id: "b1", order: 2, code: "// BLOCK_B1" });
    const b2 = makeBlock({ id: "b2", order: 0, code: "// BLOCK_B2" });
    const b3 = makeBlock({ id: "b3", order: 1, code: "// BLOCK_B3" });
    const html = compileBlocks([b1, b2, b3]);
    const posB1 = html.indexOf("BLOCK_B1");
    const posB2 = html.indexOf("BLOCK_B2");
    const posB3 = html.indexOf("BLOCK_B3");
    expect(posB2).toBeLessThan(posB3);
    expect(posB3).toBeLessThan(posB1);
  });

  it("collects CSS from blocks", () => {
    const block = makeBlock({ css: ".player { fill: red; }" });
    const html = compileBlocks([block]);
    expect(html).toContain(".player { fill: red; }");
  });

  it("substitutes params in block code", () => {
    const block = makeBlock({
      code: 'game.setBackground({{bgColor}});',
      params: [
        { key: "bgColor", label: "Background", type: "color", value: "#00ff00" },
      ],
    });
    const html = compileBlocks([block]);
    expect(html).toContain('game.setBackground("#00ff00")');
    expect(html).not.toContain("{{bgColor}}");
  });

  it("wraps each block in try/catch for error isolation", () => {
    const block = makeBlock();
    const html = compileBlocks([block]);
    expect(html).toContain("try {");
    expect(html).toContain("} catch(err) {");
  });
});

describe("substituteParams", () => {
  it("replaces number params", () => {
    const params: BlockParam[] = [
      { key: "speed", label: "Speed", type: "number", value: 5 },
    ];
    expect(substituteParams("var s = {{speed}};", params)).toBe("var s = 5;");
  });

  it("replaces boolean params", () => {
    const params: BlockParam[] = [
      { key: "visible", label: "Visible", type: "boolean", value: true },
    ];
    expect(substituteParams("var v = {{visible}};", params)).toBe(
      "var v = true;",
    );
  });

  it("JSON-escapes string params to prevent injection", () => {
    const params: BlockParam[] = [
      {
        key: "name",
        label: "Name",
        type: "string",
        value: 'alert("xss")',
      },
    ];
    const result = substituteParams("var n = {{name}};", params);
    // Should be JSON-escaped with quotes
    expect(result).toContain('"alert(\\"xss\\")"');
  });

  it("handles missing placeholders gracefully", () => {
    const params: BlockParam[] = [
      { key: "unused", label: "Unused", type: "number", value: 42 },
    ];
    expect(substituteParams("no placeholders here", params)).toBe(
      "no placeholders here",
    );
  });

  it("replaces multiple occurrences", () => {
    const params: BlockParam[] = [
      { key: "x", label: "X", type: "number", value: 10 },
    ];
    expect(substituteParams("{{x}} + {{x}}", params)).toBe("10 + 10");
  });

  it("handles NaN/Infinity as 0", () => {
    const params: BlockParam[] = [
      { key: "val", label: "Val", type: "number", value: NaN },
    ];
    expect(substituteParams("{{val}}", params)).toBe("0");
  });

  it("replaces color params as JSON strings", () => {
    const params: BlockParam[] = [
      { key: "color", label: "Color", type: "color", value: "#ff6b6b" },
    ];
    expect(substituteParams("game.setBackground({{color}});", params)).toBe(
      'game.setBackground("#ff6b6b");',
    );
  });
});
