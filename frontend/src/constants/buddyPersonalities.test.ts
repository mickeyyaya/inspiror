import { describe, it, expect } from "vitest";
import {
  BUDDY_PERSONALITIES,
  getPersonality,
} from "./buddyPersonalities";

describe("BUDDY_PERSONALITIES", () => {
  it("has a personality for each avatar", () => {
    expect(BUDDY_PERSONALITIES.dog).toBeDefined();
    expect(BUDDY_PERSONALITIES.cat).toBeDefined();
    expect(BUDDY_PERSONALITIES.dragon).toBeDefined();
    expect(BUDDY_PERSONALITIES.robot).toBeDefined();
    expect(BUDDY_PERSONALITIES.unicorn).toBeDefined();
  });

  it("each personality has all required translations", () => {
    const languages = ["en-US", "zh-TW", "zh-CN"] as const;
    for (const [id, personality] of Object.entries(BUDDY_PERSONALITIES)) {
      for (const lang of languages) {
        expect(personality.catchphrase[lang]).toBeTruthy();
        expect(personality.greetingFlavor[lang]).toBeTruthy();
        expect(personality.streakCelebration[lang]).toBeTruthy();
        expect(personality.tipPrefix[lang]).toBeTruthy();
      }
      expect(personality.id).toBe(id);
      expect(personality.speechStyle).toBeTruthy();
    }
  });
});

describe("getPersonality", () => {
  it("returns the correct personality for a known avatar", () => {
    expect(getPersonality("dragon").id).toBe("dragon");
    expect(getPersonality("robot").id).toBe("robot");
  });

  it("falls back to dog personality for unknown avatar", () => {
    expect(getPersonality("unknown").id).toBe("dog");
    expect(getPersonality("").id).toBe("dog");
  });
});
