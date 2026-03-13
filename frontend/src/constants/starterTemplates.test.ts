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

  it("templates_header key exists in all 3 locales", () => {
    expect(translations["en-US"].templates_header).toBe(
      "Start from a Template",
    );
    expect(translations["zh-TW"].templates_header).toBe("從範本開始");
    expect(translations["zh-CN"].templates_header).toBe("从模板开始");
  });
});
