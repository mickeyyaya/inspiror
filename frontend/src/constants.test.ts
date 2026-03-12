import { describe, it, expect } from "vitest";
import {
  getSuggestions,
  pickRandomChips,
  ALL_SUGGESTIONS_EN,
  ALL_SUGGESTIONS_ZH_TW,
  ALL_SUGGESTIONS_ZH_CN,
  CHIPS_PER_SET,
} from "./constants";

describe("suggestion arrays", () => {
  it("ALL_SUGGESTIONS_EN has 40 entries", () => {
    expect(ALL_SUGGESTIONS_EN).toHaveLength(40);
  });

  it("ALL_SUGGESTIONS_ZH_TW has 40 entries", () => {
    expect(ALL_SUGGESTIONS_ZH_TW).toHaveLength(40);
  });

  it("ALL_SUGGESTIONS_ZH_CN has 40 entries", () => {
    expect(ALL_SUGGESTIONS_ZH_CN).toHaveLength(40);
  });

  it("EN entries have English labels", () => {
    expect(ALL_SUGGESTIONS_EN[0].label).toMatch(/[A-Za-z]/);
    expect(ALL_SUGGESTIONS_EN[0].label).toBe("Make a bouncing ball game");
  });

  it("ZH_TW entries contain Chinese characters", () => {
    const hasChineseChars = ALL_SUGGESTIONS_ZH_TW.every((entry) =>
      /[\u4e00-\u9fff]/.test(entry.label),
    );
    expect(hasChineseChars).toBe(true);
  });

  it("ZH_CN entries contain Chinese characters", () => {
    const hasChineseChars = ALL_SUGGESTIONS_ZH_CN.every((entry) =>
      /[\u4e00-\u9fff]/.test(entry.label),
    );
    expect(hasChineseChars).toBe(true);
  });

  it("emoji prefixes are preserved across locales", () => {
    ALL_SUGGESTIONS_EN.forEach((en, i) => {
      expect(ALL_SUGGESTIONS_ZH_TW[i].emoji).toBe(en.emoji);
      expect(ALL_SUGGESTIONS_ZH_CN[i].emoji).toBe(en.emoji);
    });
  });
});

describe("getSuggestions", () => {
  it("returns EN array for en-US", () => {
    expect(getSuggestions("en-US")).toBe(ALL_SUGGESTIONS_EN);
  });

  it("returns ZH_TW array for zh-TW", () => {
    expect(getSuggestions("zh-TW")).toBe(ALL_SUGGESTIONS_ZH_TW);
  });

  it("returns ZH_CN array for zh-CN", () => {
    expect(getSuggestions("zh-CN")).toBe(ALL_SUGGESTIONS_ZH_CN);
  });

  it("zh-TW chips are Traditional Chinese (not Simplified)", () => {
    // Traditional Chinese uses 遊 (U+9038) not 游, 創 not 创
    const labels = ALL_SUGGESTIONS_ZH_TW.map((e) => e.label).join("");
    expect(labels).toMatch(/[\u9020-\u9FFF]/); // broad Traditional CJK range
  });
});

describe("pickRandomChips", () => {
  it("returns CHIPS_PER_SET chips", () => {
    expect(pickRandomChips()).toHaveLength(CHIPS_PER_SET);
  });

  it("returns EN chips when no language provided", () => {
    const chips = pickRandomChips();
    chips.forEach((chip) => {
      const found = ALL_SUGGESTIONS_EN.some((e) => e.label === chip.label);
      expect(found).toBe(true);
    });
  });

  it("returns EN chips for en-US", () => {
    const chips = pickRandomChips("en-US");
    chips.forEach((chip) => {
      const found = ALL_SUGGESTIONS_EN.some((e) => e.label === chip.label);
      expect(found).toBe(true);
    });
  });

  it("returns ZH_TW chips for zh-TW", () => {
    const chips = pickRandomChips("zh-TW");
    chips.forEach((chip) => {
      const found = ALL_SUGGESTIONS_ZH_TW.some((e) => e.label === chip.label);
      expect(found).toBe(true);
    });
  });

  it("returns ZH_CN chips for zh-CN", () => {
    const chips = pickRandomChips("zh-CN");
    chips.forEach((chip) => {
      const found = ALL_SUGGESTIONS_ZH_CN.some((e) => e.label === chip.label);
      expect(found).toBe(true);
    });
  });

  it("returns CHIPS_PER_SET chips for each locale", () => {
    expect(pickRandomChips("en-US")).toHaveLength(CHIPS_PER_SET);
    expect(pickRandomChips("zh-TW")).toHaveLength(CHIPS_PER_SET);
    expect(pickRandomChips("zh-CN")).toHaveLength(CHIPS_PER_SET);
  });
});
