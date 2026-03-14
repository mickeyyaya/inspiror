import { describe, it, expect } from "vitest";
import {
  getGreetingTier,
  getPersonalizedGreeting,
} from "./greetingTiers";
import type { BuddyAvatar } from "../types/achievements";

describe("getGreetingTier", () => {
  it("returns new_user when totalBuilds is 0", () => {
    expect(getGreetingTier(0, 0)).toBe("new_user");
    expect(getGreetingTier(0, 10)).toBe("new_user");
  });

  it("returns returning for 1-4 builds", () => {
    expect(getGreetingTier(1, 0)).toBe("returning");
    expect(getGreetingTier(4, 1)).toBe("returning");
  });

  it("returns active for 5-19 builds without long streak", () => {
    expect(getGreetingTier(5, 0)).toBe("active");
    expect(getGreetingTier(15, 2)).toBe("active");
  });

  it("returns streak_champion for 5+ day streak with 10+ builds", () => {
    expect(getGreetingTier(10, 5)).toBe("streak_champion");
    expect(getGreetingTier(15, 7)).toBe("streak_champion");
  });

  it("returns veteran for 20+ builds", () => {
    expect(getGreetingTier(20, 0)).toBe("veteran");
    expect(getGreetingTier(50, 1)).toBe("veteran");
  });

  it("prioritizes streak_champion over active when both qualify", () => {
    expect(getGreetingTier(12, 6)).toBe("streak_champion");
  });

  it("prioritizes streak_champion over veteran when streak is high", () => {
    // streak_champion check runs before veteran check
    expect(getGreetingTier(25, 5)).toBe("streak_champion");
  });
});

describe("getPersonalizedGreeting", () => {
  const dogAvatar: BuddyAvatar = {
    id: "dog",
    emoji: "🐶",
    name: "Buddy",
    requiredBuilds: 0,
  };
  const dragonAvatar: BuddyAvatar = {
    id: "dragon",
    emoji: "🐉",
    name: "Sparky",
    requiredBuilds: 5,
  };
  const robotAvatar: BuddyAvatar = {
    id: "robot",
    emoji: "🤖",
    name: "Bolt",
    requiredBuilds: 10,
  };

  it("generates new_user greeting with buddy name and catchphrase", () => {
    const greeting = getPersonalizedGreeting(0, 0, dogAvatar, "en-US");
    expect(greeting).toContain("Buddy");
    expect(greeting).toContain("pawsome");
    expect(greeting).toContain("What do you want to create today?");
  });

  it("generates returning greeting with build count", () => {
    const greeting = getPersonalizedGreeting(3, 1, dogAvatar, "en-US");
    expect(greeting).toContain("3");
    expect(greeting).toContain("Woof");
  });

  it("generates active greeting with build count", () => {
    const greeting = getPersonalizedGreeting(8, 2, dogAvatar, "en-US");
    expect(greeting).toContain("8 builds");
    expect(greeting).toContain("getting really good");
  });

  it("generates streak_champion greeting with streak and celebration", () => {
    const greeting = getPersonalizedGreeting(15, 7, dragonAvatar, "en-US");
    expect(greeting).toContain("7-day streak");
    expect(greeting).toContain("FIRE");
    expect(greeting).toContain("15 builds");
  });

  it("generates veteran greeting with build count", () => {
    const greeting = getPersonalizedGreeting(30, 2, robotAvatar, "en-US");
    expect(greeting).toContain("30 builds");
    expect(greeting).toContain("legend");
    expect(greeting).toContain("USER DETECTED");
  });

  it("uses dragon personality for dragon avatar", () => {
    const greeting = getPersonalizedGreeting(0, 0, dragonAvatar, "en-US");
    expect(greeting).toContain("Sparky");
    expect(greeting).toContain("LEGENDARY");
  });

  it("uses robot personality for robot avatar", () => {
    const greeting = getPersonalizedGreeting(0, 0, robotAvatar, "en-US");
    expect(greeting).toContain("Bolt");
    expect(greeting).toContain("SYSTEMS ONLINE");
  });

  it("works in Traditional Chinese", () => {
    const greeting = getPersonalizedGreeting(0, 0, dogAvatar, "zh-TW");
    expect(greeting).toContain("Buddy");
    expect(greeting).toContain("今天你想創造什麼呢");
  });

  it("works in Simplified Chinese", () => {
    const greeting = getPersonalizedGreeting(0, 0, dogAvatar, "zh-CN");
    expect(greeting).toContain("Buddy");
    expect(greeting).toContain("今天你想创造什么呢");
  });

  it("falls back to dog personality for unknown avatar", () => {
    const unknownAvatar: BuddyAvatar = {
      id: "alien",
      emoji: "👽",
      name: "Zorg",
      requiredBuilds: 100,
    };
    const greeting = getPersonalizedGreeting(0, 0, unknownAvatar, "en-US");
    expect(greeting).toContain("Zorg");
    // Falls back to dog personality catchphrase
    expect(greeting).toContain("pawsome");
  });
});
