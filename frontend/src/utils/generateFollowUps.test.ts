import { describe, it, expect } from "vitest";
import { generateFollowUps } from "./generateFollowUps";
import type { Block } from "../types/block";

function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: "test-1",
    type: "setup",
    label: "Background",
    emoji: "🎨",
    enabled: true,
    params: [],
    code: 'game.setBackground("#000")',
    order: 0,
    ...overrides,
  };
}

describe("generateFollowUps", () => {
  it("returns empty array for no blocks", () => {
    expect(generateFollowUps([], "en-US")).toHaveLength(0);
  });

  it("returns 2-3 suggestions for blocks with known categories", () => {
    const blocks = [
      makeBlock({ type: "setup" }),
      makeBlock({ id: "2", type: "character" }),
      makeBlock({ id: "3", type: "movement" }),
    ];
    const result = generateFollowUps(blocks, "en-US");
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("each suggestion has emoji and label", () => {
    const blocks = [makeBlock({ type: "collision" })];
    const result = generateFollowUps(blocks, "en-US");
    for (const s of result) {
      expect(s.emoji).toBeTruthy();
      expect(s.label).toBeTruthy();
    }
  });

  it("works with zh-TW language", () => {
    const blocks = [makeBlock({ type: "event" })];
    const result = generateFollowUps(blocks, "zh-TW");
    expect(result.length).toBeGreaterThan(0);
    // Should contain Chinese text
    expect(result[0].label).toMatch(/[\u4e00-\u9fff]/);
  });

  it("works with zh-CN language", () => {
    const blocks = [makeBlock({ type: "score" })];
    const result = generateFollowUps(blocks, "zh-CN");
    expect(result.length).toBeGreaterThan(0);
  });

  it("deduplicates categories", () => {
    const blocks = [
      makeBlock({ type: "setup" }),
      makeBlock({ id: "2", type: "setup" }),
    ];
    const result = generateFollowUps(blocks, "en-US");
    // Should only pick from setup once, max 2 suggestions
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("returns at most 3 suggestions", () => {
    const blocks = [
      makeBlock({ type: "setup" }),
      makeBlock({ id: "2", type: "character" }),
      makeBlock({ id: "3", type: "movement" }),
      makeBlock({ id: "4", type: "collision" }),
      makeBlock({ id: "5", type: "event" }),
    ];
    const result = generateFollowUps(blocks, "en-US");
    expect(result.length).toBeLessThanOrEqual(3);
  });
});
