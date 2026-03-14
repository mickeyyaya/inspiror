import { describe, it, expect } from "vitest";
import { STARTER_TEMPLATES } from "./starterTemplates";
import { compileBlocks } from "../compiler/compileBlocks";
import { translations } from "../i18n/translations";

describe("STARTER_TEMPLATES data", () => {
  it("exports exactly 6 templates", () => {
    expect(STARTER_TEMPLATES).toHaveLength(6);
  });

  it("each template has required fields", () => {
    for (const template of STARTER_TEMPLATES) {
      expect(typeof template.id).toBe("string");
      expect(template.id.length).toBeGreaterThan(0);
      expect(typeof template.titleKey).toBe("string");
      expect(typeof template.descriptionKey).toBe("string");
      expect(typeof template.emoji).toBe("string");
      expect(Array.isArray(template.blocks)).toBe(true);
    }
  });

  it("all template ids are unique", () => {
    const ids = STARTER_TEMPLATES.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(STARTER_TEMPLATES.length);
  });

  it("each template has at least one block", () => {
    for (const template of STARTER_TEMPLATES) {
      expect(template.blocks.length).toBeGreaterThan(0);
    }
  });

  it("each block has required Block fields", () => {
    for (const template of STARTER_TEMPLATES) {
      for (const block of template.blocks) {
        expect(typeof block.id).toBe("string");
        expect(typeof block.type).toBe("string");
        expect(typeof block.label).toBe("string");
        expect(typeof block.emoji).toBe("string");
        expect(typeof block.enabled).toBe("boolean");
        expect(Array.isArray(block.params)).toBe(true);
        expect(typeof block.code).toBe("string");
        expect(typeof block.order).toBe("number");
      }
    }
  });

  it("all template block ids are unique within each template", () => {
    for (const template of STARTER_TEMPLATES) {
      const blockIds = template.blocks.map((b) => b.id);
      const unique = new Set(blockIds);
      expect(unique.size).toBe(template.blocks.length);
    }
  });

  it("all templates have at least one enabled block", () => {
    for (const template of STARTER_TEMPLATES) {
      const enabledCount = template.blocks.filter((b) => b.enabled).length;
      expect(enabledCount).toBeGreaterThan(0);
    }
  });

  it("each template compiles to non-empty HTML", () => {
    for (const template of STARTER_TEMPLATES) {
      const html = compileBlocks(template.blocks);
      expect(typeof html).toBe("string");
      expect(html.length).toBeGreaterThan(100);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<script>");
    }
  });

  it("titleKey exists in all 3 locales", () => {
    const locales = ["en-US", "zh-TW", "zh-CN"] as const;
    for (const template of STARTER_TEMPLATES) {
      for (const locale of locales) {
        const t = translations[locale];
        const key = template.titleKey as keyof typeof t;
        expect(t[key]).toBeTruthy();
      }
    }
  });

  it("descriptionKey exists in all 3 locales", () => {
    const locales = ["en-US", "zh-TW", "zh-CN"] as const;
    for (const template of STARTER_TEMPLATES) {
      for (const locale of locales) {
        const t = translations[locale];
        const key = template.descriptionKey as keyof typeof t;
        expect(t[key]).toBeTruthy();
      }
    }
  });

  it("block code only uses documented game.* API methods", () => {
    // Extract all game.* method calls from template code
    const VALID_GAME_METHODS = new Set([
      "addEntity",
      "getEntity",
      "removeEntity",
      "allEntities",
      "onUpdate",
      "on",
      "off",
      "onCollision",
      "set",
      "get",
      "setBackground",
      "setBackgroundGradient",
      "addText",
      "updateText",
      "width",
      "height",
      "burst",
      "trail",
      "shake",
      "tween",
      "deltaTime",
      "frameCount",
      "time",
      "lerp",
      "clamp",
      "distance",
      "randomRange",
      "randomInt",
      "pointerX",
      "pointerY",
      "pointerDown",
      "onTap",
      "onTapAnywhere",
      "onDrag",
      "after",
      "every",
      "bounceOffWalls",
      "moveToward",
      "addBar",
      "onOverlap",
      "followEntity",
      "wander",
      "patrol",
      "loadImage",
      "playTone",
      "playNote",
      "playSound",
    ]);

    for (const template of STARTER_TEMPLATES) {
      for (const block of template.blocks) {
        const calls = block.code.matchAll(/game\.(\w+)\s*\(/g);
        for (const match of calls) {
          expect(
            VALID_GAME_METHODS.has(match[1]),
            `Template "${template.id}" block "${block.id}" uses undocumented API: game.${match[1]}()`,
          ).toBe(true);
        }
      }
    }
  });

  it("catch-the-star template checks entity identity on tap", () => {
    const catchStar = STARTER_TEMPLATES.find((t) => t.id === "catch-the-star")!;
    const starBlock = catchStar.blocks.find(
      (b) => b.id === "catch-star-entity",
    )!;
    // The tap handler should check that the tapped entity is the star
    expect(starBlock.code).toContain("_id");
    // Should use block's own ID as the blockId for onTap
    expect(starBlock.code).toContain('game.onTap("catch-star-entity"');
  });

  it("color-mixer template checks entity identity on tap", () => {
    const colorMixer = STARTER_TEMPLATES.find((t) => t.id === "color-mixer")!;
    const buttonsBlock = colorMixer.blocks.find(
      (b) => b.id === "color-mixer-buttons",
    )!;
    // Should use a single onTap with entity identity checking
    expect(buttonsBlock.code).toContain("entity._id");
  });

  it("onTapAnywhere calls include blockId as first argument", () => {
    for (const template of STARTER_TEMPLATES) {
      for (const block of template.blocks) {
        const calls = [...block.code.matchAll(/game\.onTapAnywhere\(/g)];
        for (const _match of calls) {
          // Ensure onTapAnywhere is called with blockId, not just a bare function
          expect(block.code).toMatch(/game\.onTapAnywhere\("[^"]+"/);
        }
      }
    }
  });

  it("templates_header key exists in all 3 locales", () => {
    expect(translations["en-US"].templates_header).toBe(
      "Start from a Template",
    );
    expect(translations["zh-TW"].templates_header).toBe("從範本開始");
    expect(translations["zh-CN"].templates_header).toBe("从模板开始");
  });
});
