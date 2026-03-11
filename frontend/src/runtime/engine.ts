/**
 * Runtime engine injected into every compiled block-based app.
 * Provides canvas rendering, entity registry, game loop, event bus,
 * collision detection (AABB), shared state, and per-block error isolation.
 *
 * Exported as a JS string constant to be embedded in the compiled HTML.
 */

export const RUNTIME_ENGINE = `
(function() {
  "use strict";

  var canvas = document.createElement("canvas");
  canvas.id = "game-canvas";
  canvas.style.cssText = "display:block;width:100%;height:100%;";
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // --- Entity Registry ---
  var entities = {};

  // --- Shared State Store ---
  var store = {};

  // --- Per-block update callbacks ---
  var updateCallbacks = {};

  // --- Event listeners (keyed by blockId for cleanup) ---
  var blockListeners = {};

  // --- Collision callbacks ---
  var collisionCallbacks = [];

  // --- Background ---
  var bgColor = "#000000";

  // --- Error tracking ---
  var disabledBlocks = {};

  function reportError(blockId, err) {
    disabledBlocks[blockId] = true;
    console.error("[Block " + blockId + "] Error:", err);
    try {
      window.parent.postMessage({
        type: "iframe-error",
        message: "Block " + blockId + " error: " + String(err && err.message ? err.message : err),
        blockId: blockId
      }, "*");
    } catch(e) {}
  }

  // --- AABB collision check ---
  function aabb(a, b) {
    if (!a || !b) return false;
    var ax = a.x || 0, ay = a.y || 0, aw = a.width || 0, ah = a.height || 0;
    var bx = b.x || 0, by = b.y || 0, bw = b.width || 0, bh = b.height || 0;
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // --- The game.* API ---
  window.game = {
    canvas: canvas,
    ctx: ctx,
    width: function() { return canvas.width; },
    height: function() { return canvas.height; },

    addEntity: function(id, props) {
      entities[id] = Object.assign(entities[id] || {}, props, { _id: id });
      return entities[id];
    },

    getEntity: function(id) {
      return entities[id] || null;
    },

    removeEntity: function(id) {
      delete entities[id];
    },

    allEntities: function() {
      var result = [];
      for (var k in entities) {
        if (entities.hasOwnProperty(k)) result.push(entities[k]);
      }
      return result;
    },

    onUpdate: function(blockId, fn) {
      updateCallbacks[blockId] = fn;
    },

    on: function(event, blockId, fn) {
      if (!blockListeners[blockId]) blockListeners[blockId] = [];
      var handler = function(e) {
        if (disabledBlocks[blockId]) return;
        try { fn(e); } catch(err) { reportError(blockId, err); }
      };
      window.addEventListener(event, handler);
      blockListeners[blockId].push({ event: event, handler: handler });
    },

    off: function(blockId) {
      var listeners = blockListeners[blockId];
      if (listeners) {
        for (var i = 0; i < listeners.length; i++) {
          window.removeEventListener(listeners[i].event, listeners[i].handler);
        }
        delete blockListeners[blockId];
      }
      delete updateCallbacks[blockId];
      collisionCallbacks = collisionCallbacks.filter(function(cc) { return cc.blockId !== blockId; });
    },

    onCollision: function(entityA, entityB, blockId, fn) {
      collisionCallbacks.push({ a: entityA, b: entityB, blockId: blockId, fn: fn });
    },

    set: function(key, val) {
      store[key] = val;
    },

    get: function(key) {
      return store[key];
    },

    setBackground: function(color) {
      bgColor = color || "#000000";
    },

    addText: function(id, text, x, y, opts) {
      var o = opts || {};
      entities[id] = {
        _id: id,
        _type: "text",
        text: text,
        x: x || 0,
        y: y || 0,
        font: o.font || "bold 24px sans-serif",
        color: o.color || "#ffffff",
        align: o.align || "left",
        width: 0,
        height: 0
      };
      return entities[id];
    },

    playSound: function(name) {
      // Stub — no-op if unavailable
      try {
        if (window._sounds && window._sounds[name]) {
          window._sounds[name].play();
        }
      } catch(e) {}
    }
  };

  // --- Render loop ---
  function draw() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var id in entities) {
      if (!entities.hasOwnProperty(id)) continue;
      var e = entities[id];
      try {
        if (e._type === "text") {
          ctx.font = e.font;
          ctx.fillStyle = e.color;
          ctx.textAlign = e.align || "left";
          ctx.fillText(e.text || "", e.x || 0, e.y || 0);
        } else if (e.shape === "circle") {
          ctx.beginPath();
          ctx.arc(e.x || 0, e.y || 0, (e.width || 20) / 2, 0, Math.PI * 2);
          ctx.fillStyle = e.color || "#ffffff";
          ctx.fill();
        } else if (e.sprite && e._img) {
          ctx.drawImage(e._img, e.x || 0, e.y || 0, e.width || 32, e.height || 32);
        } else if (e.text && e._type !== "text") {
          // Emoji or text-based entity
          ctx.font = (e.fontSize || 32) + "px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(e.text, (e.x || 0) + (e.width || 32) / 2, (e.y || 0) + (e.height || 32) / 2);
        } else {
          ctx.fillStyle = e.color || "#ffffff";
          ctx.fillRect(e.x || 0, e.y || 0, e.width || 20, e.height || 20);
        }
      } catch(drawErr) {}
    }
  }

  function gameLoop() {
    // Run update callbacks
    for (var blockId in updateCallbacks) {
      if (!updateCallbacks.hasOwnProperty(blockId)) continue;
      if (disabledBlocks[blockId]) continue;
      try {
        updateCallbacks[blockId]();
      } catch(err) {
        reportError(blockId, err);
      }
    }

    // Check collisions
    for (var i = 0; i < collisionCallbacks.length; i++) {
      var cc = collisionCallbacks[i];
      if (disabledBlocks[cc.blockId]) continue;
      var ea = entities[cc.a];
      var eb = entities[cc.b];
      if (ea && eb && aabb(ea, eb)) {
        try { cc.fn(ea, eb); } catch(err) { reportError(cc.blockId, err); }
      }
    }

    draw();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
})();
`;
