import { describe, it, expect, beforeEach, vi } from "vitest";
import { RUNTIME_ENGINE } from "./engine";

describe("RUNTIME_ENGINE", () => {
  it("exports a non-empty string", () => {
    expect(typeof RUNTIME_ENGINE).toBe("string");
    expect(RUNTIME_ENGINE.length).toBeGreaterThan(100);
  });

  it("contains the game API", () => {
    expect(RUNTIME_ENGINE).toContain("window.game");
    expect(RUNTIME_ENGINE).toContain("addEntity");
    expect(RUNTIME_ENGINE).toContain("getEntity");
    expect(RUNTIME_ENGINE).toContain("removeEntity");
    expect(RUNTIME_ENGINE).toContain("onUpdate");
    expect(RUNTIME_ENGINE).toContain("onCollision");
    expect(RUNTIME_ENGINE).toContain("setBackground");
    expect(RUNTIME_ENGINE).toContain("addText");
    expect(RUNTIME_ENGINE).toContain("playSound");
  });

  it("wraps in an IIFE for isolation", () => {
    expect(RUNTIME_ENGINE).toContain("(function()");
    expect(RUNTIME_ENGINE).toContain("})();");
  });

  it("includes error reporting with blockId", () => {
    expect(RUNTIME_ENGINE).toContain("blockId");
    expect(RUNTIME_ENGINE).toContain("iframe-error");
    expect(RUNTIME_ENGINE).toContain("reportError");
  });

  it("includes AABB collision detection", () => {
    expect(RUNTIME_ENGINE).toContain("aabb");
  });

  it("includes canvas creation", () => {
    expect(RUNTIME_ENGINE).toContain('createElement("canvas")');
    expect(RUNTIME_ENGINE).toContain("game-canvas");
  });

  it("includes requestAnimationFrame game loop", () => {
    expect(RUNTIME_ENGINE).toContain("requestAnimationFrame");
    expect(RUNTIME_ENGINE).toContain("gameLoop");
  });

  it("includes shared state store (get/set)", () => {
    // The API is defined as `set: function(key, val)` and `get: function(key)`
    expect(RUNTIME_ENGINE).toContain("set: function(key, val)");
    expect(RUNTIME_ENGINE).toContain("get: function(key)");
    expect(RUNTIME_ENGINE).toContain("store[key]");
  });

  it("disables blocks on error instead of crashing", () => {
    expect(RUNTIME_ENGINE).toContain("disabledBlocks");
    expect(RUNTIME_ENGINE).toContain("disabledBlocks[blockId] = true");
  });

  it("cleans up collision callbacks in game.off()", () => {
    // game.off() must filter collisionCallbacks to prevent accumulation
    expect(RUNTIME_ENGINE).toContain(
      "collisionCallbacks = collisionCallbacks.filter",
    );
  });
});
