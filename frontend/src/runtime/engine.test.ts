import { describe, it, expect } from "vitest";
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

  it("contains pointer/touch API", () => {
    expect(RUNTIME_ENGINE).toContain("pointerX");
    expect(RUNTIME_ENGINE).toContain("pointerY");
    expect(RUNTIME_ENGINE).toContain("pointerDown");
    expect(RUNTIME_ENGINE).toContain("onTap");
    expect(RUNTIME_ENGINE).toContain("onDrag");
  });

  it("contains timer helpers", () => {
    expect(RUNTIME_ENGINE).toContain("after: function(blockId, ms, fn)");
    expect(RUNTIME_ENGINE).toContain("every: function(blockId, ms, fn)");
    expect(RUNTIME_ENGINE).toContain("blockTimers");
  });

  it("contains physics helpers", () => {
    expect(RUNTIME_ENGINE).toContain("bounceOffWalls");
    expect(RUNTIME_ENGINE).toContain("moveToward");
    expect(RUNTIME_ENGINE).toContain("pe.gravity");
    expect(RUNTIME_ENGINE).toContain("pe.friction");
  });

  it("contains health/progress bar rendering", () => {
    expect(RUNTIME_ENGINE).toContain("addBar");
    expect(RUNTIME_ENGINE).toContain('"bar"');
  });

  it("contains circle overlap collision", () => {
    expect(RUNTIME_ENGINE).toContain("onOverlap");
    expect(RUNTIME_ENGINE).toContain("overlapCallbacks");
  });

  it("contains AI movement helpers", () => {
    expect(RUNTIME_ENGINE).toContain("followEntity");
    expect(RUNTIME_ENGINE).toContain("wander");
    expect(RUNTIME_ENGINE).toContain("patrol");
  });

  it("contains image loading", () => {
    expect(RUNTIME_ENGINE).toContain("loadImage");
  });

  it("contains sound synthesis", () => {
    expect(RUNTIME_ENGINE).toContain("playTone");
    expect(RUNTIME_ENGINE).toContain("playNote");
    expect(RUNTIME_ENGINE).toContain("AudioContext");
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

  it("cleans up timers, taps, drags, and overlaps in game.off()", () => {
    expect(RUNTIME_ENGINE).toContain(
      "overlapCallbacks = overlapCallbacks.filter",
    );
    expect(RUNTIME_ENGINE).toContain("tapCallbacks = tapCallbacks.filter");
    expect(RUNTIME_ENGINE).toContain("dragCallbacks = dragCallbacks.filter");
    expect(RUNTIME_ENGINE).toContain("clearTimeout");
    expect(RUNTIME_ENGINE).toContain("clearInterval");
  });
});
