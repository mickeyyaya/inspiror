import { describe, it, expect } from "vitest";
import { compileBlocks, isSafeCheckExpression } from "./compileBlocks";
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
      code: "game.setBackground({{bgColor}});",
      params: [
        {
          key: "bgColor",
          label: "Background",
          type: "color",
          value: "#00ff00",
        },
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

  it("uses window.location.origin instead of wildcard for postMessage", () => {
    const block = makeBlock();
    const html = compileBlocks([block]);
    expect(html).not.toContain('"*"');
    expect(html).toContain("window.location.origin");
  });

  it("sanitizes </script> sequences in block code", () => {
    const block = makeBlock({
      code: 'var x = "</script><script>alert(1)</script>";',
    });
    const html = compileBlocks([block]);
    expect(html).not.toContain("</script><script>");
    expect(html).toContain("<\\/script");
  });

  it("only includes safe check expressions (filters unsafe)", () => {
    const safeCheck = 'game.getEntity("player") !== null';
    const unsafeCheck = "while(1){}";
    const html = compileBlocks([], [safeCheck, unsafeCheck]);
    expect(html).toContain("Self-verification checks");
    expect(html).toContain("game.getEntity");
    expect(html).not.toContain("while(1)");
  });

  it("skips check runner entirely when all checks are unsafe", () => {
    const html = compileBlocks([], ['eval("malicious")', "while(1){}"]);
    expect(html).not.toContain("Self-verification checks");
  });

  it("emits function calls instead of eval for safe checks", () => {
    const html = compileBlocks([], ['game.getEntity("player") !== null']);
    expect(html).not.toContain("eval(");
    expect(html).toContain("fns[i]()");
  });

  it("sanitizes </script> in check expression entity names", () => {
    // The check runner script itself should not contain raw </script> sequences
    // that could break out of the <script> tag enclosing it.
    // Extract just the check runner portion between the two <script> tags.
    const html = compileBlocks([], ['game.getEntity("player") !== null']);
    const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
    // The second <script> block contains block code + check runner
    const checkRunnerScript = scripts[1] || "";
    // The script content (between <script> and </script>) must not have </script>
    const inner = checkRunnerScript
      .replace(/^<script>/, "")
      .replace(/<\/script>$/, "");
    expect(inner).not.toContain("</script>");
  });
});

describe("isSafeCheckExpression", () => {
  it("allows game.getEntity checks", () => {
    expect(isSafeCheckExpression('game.getEntity("player") !== null')).toBe(
      true,
    );
    expect(isSafeCheckExpression("game.getEntity('enemy') !== undefined")).toBe(
      true,
    );
  });

  it("allows game.get numeric comparisons", () => {
    expect(isSafeCheckExpression('game.get("score") > 0')).toBe(true);
    expect(isSafeCheckExpression('game.get("lives") >= 3')).toBe(true);
  });

  it("allows game.allEntities().length checks", () => {
    expect(isSafeCheckExpression("game.allEntities().length > 0")).toBe(true);
    expect(isSafeCheckExpression("game.allEntities().length === 5")).toBe(true);
  });

  it("allows typeof game.getEntity checks", () => {
    expect(
      isSafeCheckExpression('typeof game.getEntity("bg") === "object"'),
    ).toBe(true);
  });

  it("allows typeof game.get checks", () => {
    expect(isSafeCheckExpression('typeof game.get("score") === "number"')).toBe(
      true,
    );
    expect(
      isSafeCheckExpression("typeof game.get('lives') === \"number\""),
    ).toBe(true);
  });

  it("allows game.getEntity property comparisons", () => {
    expect(isSafeCheckExpression('game.getEntity("ball").width > 0')).toBe(
      true,
    );
    expect(isSafeCheckExpression("game.getEntity('player').x >= 50")).toBe(
      true,
    );
    expect(isSafeCheckExpression('game.getEntity("bar").value === 100')).toBe(
      true,
    );
  });

  it("allows game.get !== null checks", () => {
    expect(isSafeCheckExpression('game.get("score") !== null')).toBe(true);
    expect(isSafeCheckExpression("game.get('level') !== undefined")).toBe(true);
  });

  it("allows game.width()/game.height() checks", () => {
    expect(isSafeCheckExpression("game.width() > 0")).toBe(true);
    expect(isSafeCheckExpression("game.height() >= 400")).toBe(true);
  });

  it("rejects arbitrary code", () => {
    expect(isSafeCheckExpression("while(1){}")).toBe(false);
    expect(isSafeCheckExpression('eval("malicious")')).toBe(false);
    expect(isSafeCheckExpression("alert(1)")).toBe(false);
    expect(isSafeCheckExpression('fetch("http://evil.com")')).toBe(false);
    expect(isSafeCheckExpression("document.cookie")).toBe(false);
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
