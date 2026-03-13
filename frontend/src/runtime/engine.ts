/**
 * Runtime engine injected into every compiled block-based app.
 * Provides canvas rendering, entity registry, game loop, event bus,
 * collision detection (AABB), shared state, per-block error isolation,
 * particle effects, tweening, and rich visual properties (rotation, opacity, scale, glow).
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
  var bgColor = "transparent";
  var bgGradient = null;

  // --- Particle system ---
  var particles = [];

  // --- Tween system ---
  var tweens = [];

  // --- Frame timing ---
  var lastTime = 0;
  var deltaTime = 0;
  var frameCount = 0;

  // --- Screen shake ---
  var shakeAmount = 0;
  var shakeDuration = 0;
  var shakeTimer = 0;

  // --- Pointer state (unified mouse + touch) ---
  var pointerState = { x: 0, y: 0, down: false };
  var tapCallbacks = [];
  var dragCallbacks = [];
  var dragState = { dragging: false, entityId: null, offsetX: 0, offsetY: 0 };

  function getPointerPos(e) {
    var rect = canvas.getBoundingClientRect();
    var clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function hitTestEntity(px, py) {
    var sortedIds = Object.keys(entities).sort(function(a, b) {
      return (entities[b].zIndex || 0) - (entities[a].zIndex || 0);
    });
    for (var i = 0; i < sortedIds.length; i++) {
      var e = entities[sortedIds[i]];
      if (e.visible === false) continue;
      var ex = e.x || 0, ey = e.y || 0, ew = e.width || 0, eh = e.height || 0;
      if (px >= ex && px <= ex + ew && py >= ey && py <= ey + eh) return e;
    }
    return null;
  }

  function handlePointerDown(e) {
    var pos = getPointerPos(e);
    pointerState.x = pos.x;
    pointerState.y = pos.y;
    pointerState.down = true;
    var hit = hitTestEntity(pos.x, pos.y);
    for (var i = 0; i < dragCallbacks.length; i++) {
      var dc = dragCallbacks[i];
      if (hit && hit._id === dc.entityId) {
        dragState.dragging = true;
        dragState.entityId = dc.entityId;
        dragState.offsetX = pos.x - (hit.x || 0);
        dragState.offsetY = pos.y - (hit.y || 0);
        if (dc.onStart) { try { dc.onStart(hit, pos.x, pos.y); } catch(err) { reportError(dc.blockId, err); } }
        break;
      }
    }
  }

  function handlePointerMove(e) {
    var pos = getPointerPos(e);
    pointerState.x = pos.x;
    pointerState.y = pos.y;
    if (dragState.dragging && dragState.entityId) {
      var ent = entities[dragState.entityId];
      if (ent) {
        ent.x = pos.x - dragState.offsetX;
        ent.y = pos.y - dragState.offsetY;
        for (var i = 0; i < dragCallbacks.length; i++) {
          var dc = dragCallbacks[i];
          if (dc.entityId === dragState.entityId && dc.onMove) {
            try { dc.onMove(ent, pos.x, pos.y); } catch(err) { reportError(dc.blockId, err); }
          }
        }
      }
    }
  }

  function handlePointerUp(e) {
    var pos = getPointerPos(e);
    pointerState.x = pos.x;
    pointerState.y = pos.y;
    pointerState.down = false;
    if (dragState.dragging && dragState.entityId) {
      var ent = entities[dragState.entityId];
      for (var i = 0; i < dragCallbacks.length; i++) {
        var dc = dragCallbacks[i];
        if (dc.entityId === dragState.entityId && dc.onEnd) {
          try { dc.onEnd(ent, pos.x, pos.y); } catch(err) { reportError(dc.blockId, err); }
        }
      }
      dragState.dragging = false;
      dragState.entityId = null;
    }
    for (var j = 0; j < tapCallbacks.length; j++) {
      var tc = tapCallbacks[j];
      if (disabledBlocks[tc.blockId]) continue;
      try { tc.fn(pos.x, pos.y, hitTestEntity(pos.x, pos.y)); } catch(err) { reportError(tc.blockId, err); }
    }
  }

  canvas.addEventListener("mousedown", handlePointerDown);
  canvas.addEventListener("mousemove", handlePointerMove);
  canvas.addEventListener("mouseup", handlePointerUp);
  canvas.addEventListener("touchstart", function(e) { e.preventDefault(); handlePointerDown(e); }, { passive: false });
  canvas.addEventListener("touchmove", function(e) { e.preventDefault(); handlePointerMove(e); }, { passive: false });
  canvas.addEventListener("touchend", function(e) { e.preventDefault(); handlePointerUp(e); }, { passive: false });

  // --- Block-scoped timers ---
  var blockTimers = {};

  // --- Overlap callbacks (circle collision) ---
  var overlapCallbacks = [];

  // --- Audio context for sound synthesis ---
  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return audioCtx;
  }

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
      }, window.location.origin);
    } catch(e) {}
  }

  // --- AABB collision check ---
  function aabb(a, b) {
    if (!a || !b) return false;
    var ax = a.x || 0, ay = a.y || 0, aw = a.width || 0, ah = a.height || 0;
    var bx = b.x || 0, by = b.y || 0, bw = b.width || 0, bh = b.height || 0;
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // --- Easing functions ---
  var easings = {
    linear: function(t) { return t; },
    easeIn: function(t) { return t * t; },
    easeOut: function(t) { return t * (2 - t); },
    easeInOut: function(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    bounce: function(t) {
      if (t < 1/2.75) return 7.5625 * t * t;
      if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
      if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
    },
    elastic: function(t) {
      if (t === 0 || t === 1) return t;
      return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    }
  };

  // --- Particle class ---
  function Particle(x, y, opts) {
    var o = opts || {};
    this.x = x;
    this.y = y;
    this.vx = o.vx || (Math.random() - 0.5) * 6;
    this.vy = o.vy || (Math.random() - 0.5) * 6;
    this.life = o.life || 60;
    this.maxLife = this.life;
    this.size = o.size || (4 + Math.random() * 8);
    this.color = o.color || randomBrightColor();
    this.shape = o.shape || "circle";
    this.text = o.text || null;
    this.gravity = o.gravity || 0.1;
    this.friction = o.friction || 0.98;
    this.fadeOut = o.fadeOut !== false;
    this.shrink = o.shrink !== false;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.2;
  }

  function randomBrightColor() {
    var colors = ["#FF6B9D", "#C084FC", "#67E8F9", "#FDE047", "#4ADE80", "#FB923C", "#F472B6", "#A78BFA", "#38BDF8", "#FBBF24"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.angle += p.spin;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var progress = 1 - p.life / p.maxLife;
      var alpha = p.fadeOut ? (1 - progress) : 1;
      var size = p.shrink ? p.size * (1 - progress * 0.7) : p.size;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      if (p.text) {
        ctx.font = Math.round(size) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0);
      } else if (p.shape === "star") {
        drawStar(ctx, 0, 0, 5, size, size / 2, p.color);
      } else if (p.shape === "square") {
        ctx.fillStyle = p.color;
        ctx.fillRect(-size / 2, -size / 2, size, size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- Star drawing helper ---
  function drawStar(c, cx, cy, spikes, outerR, innerR, color) {
    var rot = Math.PI / 2 * 3;
    var step = Math.PI / spikes;
    c.beginPath();
    c.moveTo(cx, cy - outerR);
    for (var i = 0; i < spikes; i++) {
      c.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      c.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    c.lineTo(cx, cy - outerR);
    c.closePath();
    c.fillStyle = color;
    c.fill();
  }

  // --- Tween update ---
  function updateTweens() {
    var now = performance.now();
    for (var i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i];
      var elapsed = now - tw.startTime;
      var t = Math.min(elapsed / tw.duration, 1);
      var eased = (easings[tw.easing] || easings.easeOut)(t);

      for (var key in tw.from) {
        if (tw.from.hasOwnProperty(key)) {
          tw.target[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * eased;
        }
      }

      if (t >= 1) {
        tweens.splice(i, 1);
        if (tw.onComplete) {
          try { tw.onComplete(); } catch(e) {}
        }
      }
    }
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
      overlapCallbacks = overlapCallbacks.filter(function(oc) { return oc.blockId !== blockId; });
      tapCallbacks = tapCallbacks.filter(function(tc) { return tc.blockId !== blockId; });
      dragCallbacks = dragCallbacks.filter(function(dc) { return dc.blockId !== blockId; });
      // Clear block timers
      var timers = blockTimers[blockId];
      if (timers) {
        for (var t = 0; t < timers.length; t++) {
          clearTimeout(timers[t].id);
          if (timers[t].type === "interval") clearInterval(timers[t].id);
        }
        delete blockTimers[blockId];
      }
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
      bgColor = color || "transparent";
      bgGradient = null;
    },

    setBackgroundGradient: function(type, colors, angle) {
      bgGradient = { type: type || "linear", colors: colors || ["#1a1a2e", "#16213e"], angle: angle || 0 };
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
        opacity: o.opacity != null ? o.opacity : 1,
        angle: o.angle || 0,
        shadow: o.shadow || null,
        shadowColor: o.shadowColor || "rgba(0,0,0,0.5)",
        shadowBlur: o.shadowBlur || 0,
        width: 0,
        height: 0
      };
      return entities[id];
    },

    // --- Particle effects ---
    burst: function(x, y, opts) {
      var o = opts || {};
      var count = o.count || 20;
      var spread = o.spread || 6;
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
        var speed = (Math.random() * 0.5 + 0.5) * spread;
        particles.push(new Particle(x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: o.life || (30 + Math.random() * 30),
          size: o.size || (4 + Math.random() * 8),
          color: o.colors ? o.colors[Math.floor(Math.random() * o.colors.length)] : (o.color || null),
          shape: o.shape || "circle",
          text: o.text || null,
          gravity: o.gravity != null ? o.gravity : 0.1,
          friction: o.friction != null ? o.friction : 0.98,
          fadeOut: o.fadeOut !== false,
          shrink: o.shrink !== false
        }));
      }
    },

    trail: function(x, y, opts) {
      var o = opts || {};
      var count = o.count || 5;
      for (var i = 0; i < count; i++) {
        particles.push(new Particle(x, y, {
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: o.life || 20,
          size: o.size || (3 + Math.random() * 4),
          color: o.color || null,
          gravity: o.gravity || 0,
          friction: 0.95
        }));
      }
    },

    // --- Tweening / animation ---
    tween: function(entityOrId, props, duration, opts) {
      var o = opts || {};
      var target;
      if (typeof entityOrId === "string") {
        target = entities[entityOrId];
        if (!target) return;
      } else {
        target = entityOrId;
      }
      var from = {};
      var to = {};
      for (var key in props) {
        if (props.hasOwnProperty(key)) {
          from[key] = target[key] != null ? target[key] : 0;
          to[key] = props[key];
        }
      }
      tweens.push({
        target: target,
        from: from,
        to: to,
        duration: duration || 500,
        easing: o.easing || "easeOut",
        startTime: performance.now(),
        onComplete: o.onComplete || null
      });
    },

    // --- Screen shake ---
    shake: function(amount, duration) {
      shakeAmount = amount || 5;
      shakeDuration = duration || 300;
      shakeTimer = performance.now();
    },

    // --- Timing ---
    deltaTime: function() { return deltaTime; },
    frameCount: function() { return frameCount; },
    time: function() { return performance.now(); },

    // --- Math helpers ---
    lerp: function(a, b, t) { return a + (b - a) * t; },
    clamp: function(val, min, max) { return Math.max(min, Math.min(max, val)); },
    distance: function(x1, y1, x2, y2) { return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)); },
    randomRange: function(min, max) { return min + Math.random() * (max - min); },
    randomInt: function(min, max) { return Math.floor(min + Math.random() * (max - min + 1)); },

    // --- Pointer / Touch ---
    pointerX: function() { return pointerState.x; },
    pointerY: function() { return pointerState.y; },
    pointerDown: function() { return pointerState.down; },

    onTap: function(blockId, fn) {
      tapCallbacks.push({ blockId: blockId, fn: fn });
    },

    onDrag: function(entityId, blockId, opts) {
      var o = opts || {};
      dragCallbacks.push({ entityId: entityId, blockId: blockId, onStart: o.onStart || null, onMove: o.onMove || null, onEnd: o.onEnd || null });
    },

    // --- Timer helpers ---
    after: function(blockId, ms, fn) {
      if (!blockTimers[blockId]) blockTimers[blockId] = [];
      var tid = setTimeout(function() {
        if (disabledBlocks[blockId]) return;
        try { fn(); } catch(err) { reportError(blockId, err); }
      }, ms);
      blockTimers[blockId].push({ id: tid, type: "timeout" });
      return tid;
    },

    every: function(blockId, ms, fn) {
      if (!blockTimers[blockId]) blockTimers[blockId] = [];
      var iid = setInterval(function() {
        if (disabledBlocks[blockId]) return;
        try { fn(); } catch(err) { reportError(blockId, err); }
      }, ms);
      blockTimers[blockId].push({ id: iid, type: "interval" });
      return iid;
    },

    // --- Physics helpers ---
    bounceOffWalls: function(id) {
      var e = entities[id];
      if (!e) return;
      var w = e.width || 0, h = e.height || 0;
      if ((e.x || 0) <= 0) { e.x = 0; e.vx = Math.abs(e.vx || 0) * (e.bounce != null ? e.bounce : 0.8); }
      if ((e.x || 0) + w >= canvas.width) { e.x = canvas.width - w; e.vx = -Math.abs(e.vx || 0) * (e.bounce != null ? e.bounce : 0.8); }
      if ((e.y || 0) <= 0) { e.y = 0; e.vy = Math.abs(e.vy || 0) * (e.bounce != null ? e.bounce : 0.8); }
      if ((e.y || 0) + h >= canvas.height) { e.y = canvas.height - h; e.vy = -Math.abs(e.vy || 0) * (e.bounce != null ? e.bounce : 0.8); }
    },

    moveToward: function(id, tx, ty, speed) {
      var e = entities[id];
      if (!e) return;
      var dx = tx - (e.x || 0), dy = ty - (e.y || 0);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < speed) { e.x = tx; e.y = ty; return; }
      e.x = (e.x || 0) + (dx / dist) * speed;
      e.y = (e.y || 0) + (dy / dist) * speed;
    },

    // --- Health / Progress bars ---
    addBar: function(id, opts) {
      var o = opts || {};
      entities[id] = {
        _id: id,
        _type: "bar",
        x: o.x || 0,
        y: o.y || 0,
        width: o.width || 100,
        height: o.height || 12,
        value: o.value != null ? o.value : 100,
        max: o.max || 100,
        color: o.color || "#4ADE80",
        bgColor: o.bgColor || "#333333",
        radius: o.radius || 4,
        zIndex: o.zIndex || 10,
        opacity: o.opacity != null ? o.opacity : 1,
        visible: o.visible !== false,
        angle: 0
      };
      return entities[id];
    },

    // --- Circle / Overlap collision ---
    onOverlap: function(entityA, entityB, blockId, fn) {
      overlapCallbacks.push({ a: entityA, b: entityB, blockId: blockId, fn: fn });
    },

    // --- AI movement helpers ---
    followEntity: function(chaserId, targetId, speed) {
      var c = entities[chaserId], t = entities[targetId];
      if (!c || !t) return;
      var dx = (t.x || 0) - (c.x || 0), dy = (t.y || 0) - (c.y || 0);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < speed) return;
      c.x = (c.x || 0) + (dx / dist) * speed;
      c.y = (c.y || 0) + (dy / dist) * speed;
    },

    wander: function(id, speed) {
      var e = entities[id];
      if (!e) return;
      if (e._wanderAngle == null) e._wanderAngle = Math.random() * Math.PI * 2;
      e._wanderAngle += (Math.random() - 0.5) * 0.5;
      e.x = (e.x || 0) + Math.cos(e._wanderAngle) * (speed || 1);
      e.y = (e.y || 0) + Math.sin(e._wanderAngle) * (speed || 1);
      e.x = game.clamp(e.x, 0, canvas.width - (e.width || 0));
      e.y = game.clamp(e.y, 0, canvas.height - (e.height || 0));
    },

    patrol: function(id, points, speed) {
      var e = entities[id];
      if (!e || !points || points.length === 0) return;
      if (e._patrolIdx == null) e._patrolIdx = 0;
      var target = points[e._patrolIdx];
      var dx = target[0] - (e.x || 0), dy = target[1] - (e.y || 0);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (speed || 2)) {
        e._patrolIdx = (e._patrolIdx + 1) % points.length;
      } else {
        e.x = (e.x || 0) + (dx / dist) * (speed || 2);
        e.y = (e.y || 0) + (dy / dist) * (speed || 2);
      }
    },

    // --- Image loading ---
    loadImage: function(id, url, opts) {
      var o = opts || {};
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      var ent = entities[id] || {};
      entities[id] = Object.assign(ent, {
        _id: id,
        sprite: url,
        _img: img,
        x: o.x || ent.x || 0,
        y: o.y || ent.y || 0,
        width: o.width || ent.width || 64,
        height: o.height || ent.height || 64,
        opacity: o.opacity != null ? o.opacity : 1,
        zIndex: o.zIndex || 0,
        visible: o.visible !== false,
        angle: o.angle || 0
      });
      return entities[id];
    },

    // --- Sound synthesis ---
    playTone: function(freq, duration, opts) {
      var ac = getAudioCtx();
      if (!ac) return;
      var o = opts || {};
      try {
        var osc = ac.createOscillator();
        var gain = ac.createGain();
        osc.type = o.type || "sine";
        osc.frequency.value = freq || 440;
        gain.gain.value = o.volume != null ? o.volume : 0.3;
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (duration || 200) / 1000);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + (duration || 200) / 1000);
      } catch(e) {}
    },

    playNote: function(note, duration, opts) {
      var noteMap = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 };
      var base = noteMap[(note || "A").charAt(0).toUpperCase()];
      if (!base) base = 440;
      var octave = parseInt((note || "A4").replace(/[^0-9]/g, "")) || 4;
      var freq = base * Math.pow(2, octave - 4);
      game.playTone(freq, duration, opts);
    },

    playSound: function(name) {
      try {
        if (window._sounds && window._sounds[name]) {
          window._sounds[name].play();
        }
      } catch(e) {}
    }
  };

  // --- Render helpers ---
  function renderGradientBg() {
    if (!bgGradient) return false;
    var g;
    if (bgGradient.type === "radial") {
      g = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2);
    } else {
      var a = (bgGradient.angle || 0) * Math.PI / 180;
      var cx = canvas.width / 2, cy = canvas.height / 2;
      var len = Math.max(canvas.width, canvas.height);
      g = ctx.createLinearGradient(cx - Math.cos(a)*len/2, cy - Math.sin(a)*len/2, cx + Math.cos(a)*len/2, cy + Math.sin(a)*len/2);
    }
    var colors = bgGradient.colors;
    for (var i = 0; i < colors.length; i++) {
      g.addColorStop(i / (colors.length - 1), colors[i]);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return true;
  }

  function applyEntityTransform(e) {
    var cx = (e.x || 0) + (e.width || 0) / 2;
    var cy = (e.y || 0) + (e.height || 0) / 2;
    if (e.opacity != null && e.opacity !== 1) ctx.globalAlpha = e.opacity;
    if (e.angle) {
      ctx.translate(cx, cy);
      ctx.rotate(e.angle);
      ctx.translate(-cx, -cy);
    }
    if (e.scaleX != null || e.scaleY != null) {
      ctx.translate(cx, cy);
      ctx.scale(e.scaleX != null ? e.scaleX : 1, e.scaleY != null ? e.scaleY : 1);
      ctx.translate(-cx, -cy);
    }
    if (e.shadowBlur) {
      ctx.shadowColor = e.shadowColor || "rgba(0,0,0,0.5)";
      ctx.shadowBlur = e.shadowBlur;
      ctx.shadowOffsetX = e.shadowOffsetX || 0;
      ctx.shadowOffsetY = e.shadowOffsetY || 0;
    }
  }

  function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // --- Render loop ---
  function draw() {
    ctx.save();

    // Screen shake offset
    if (shakeTimer > 0 && performance.now() - shakeTimer < shakeDuration) {
      var shakeProgress = 1 - (performance.now() - shakeTimer) / shakeDuration;
      var ox = (Math.random() - 0.5) * shakeAmount * 2 * shakeProgress;
      var oy = (Math.random() - 0.5) * shakeAmount * 2 * shakeProgress;
      ctx.translate(ox, oy);
    }

    if (bgGradient) {
      renderGradientBg();
    } else if (bgColor === "transparent" || bgColor === "") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Sort entities by zIndex for layering
    var sortedIds = Object.keys(entities).sort(function(a, b) {
      return (entities[a].zIndex || 0) - (entities[b].zIndex || 0);
    });

    for (var si = 0; si < sortedIds.length; si++) {
      var id = sortedIds[si];
      var e = entities[id];
      if (e.visible === false) continue;
      try {
        ctx.save();
        applyEntityTransform(e);

        if (e._type === "text") {
          ctx.font = e.font;
          ctx.fillStyle = e.color;
          ctx.textAlign = e.align || "left";
          ctx.fillText(e.text || "", e.x || 0, e.y || 0);
        } else if (e.shape === "circle") {
          ctx.beginPath();
          ctx.arc((e.x || 0) + (e.width || 20) / 2, (e.y || 0) + (e.height || 20) / 2, (e.width || 20) / 2, 0, Math.PI * 2);
          ctx.fillStyle = e.color || "#ffffff";
          ctx.fill();
          if (e.strokeColor) {
            ctx.strokeStyle = e.strokeColor;
            ctx.lineWidth = e.strokeWidth || 2;
            ctx.stroke();
          }
        } else if (e.shape === "star") {
          drawStar(ctx, (e.x || 0) + (e.width || 20) / 2, (e.y || 0) + (e.height || 20) / 2, e.points || 5, (e.width || 20) / 2, (e.width || 20) / 4, e.color || "#FFD700");
        } else if (e._type === "bar") {
          var barW = e.width || 100, barH = e.height || 12;
          var pct = Math.max(0, Math.min(1, (e.value || 0) / (e.max || 100)));
          // Background
          drawRoundedRect(e.x || 0, e.y || 0, barW, barH, e.radius || 4);
          ctx.fillStyle = e.bgColor || "#333333";
          ctx.fill();
          // Foreground
          if (pct > 0) {
            drawRoundedRect(e.x || 0, e.y || 0, barW * pct, barH, e.radius || 4);
            ctx.fillStyle = e.color || "#4ADE80";
            ctx.fill();
          }
        } else if (e.sprite && e._img) {
          ctx.drawImage(e._img, e.x || 0, e.y || 0, e.width || 32, e.height || 32);
        } else if (e.text && e._type !== "text") {
          ctx.font = (e.fontSize || 32) + "px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(e.text, (e.x || 0) + (e.width || 32) / 2, (e.y || 0) + (e.height || 32) / 2);
        } else {
          if (e.radius) {
            drawRoundedRect(e.x || 0, e.y || 0, e.width || 20, e.height || 20, e.radius);
            ctx.fillStyle = e.color || "#ffffff";
            ctx.fill();
          } else {
            ctx.fillStyle = e.color || "#ffffff";
            ctx.fillRect(e.x || 0, e.y || 0, e.width || 20, e.height || 20);
          }
          if (e.strokeColor) {
            ctx.strokeStyle = e.strokeColor;
            ctx.lineWidth = e.strokeWidth || 2;
            if (e.radius) { ctx.stroke(); }
            else { ctx.strokeRect(e.x || 0, e.y || 0, e.width || 20, e.height || 20); }
          }
        }

        ctx.restore();
      } catch(drawErr) {
        ctx.restore();
      }
    }

    // Draw particles on top
    drawParticles();

    ctx.restore();
  }

  function gameLoop(timestamp) {
    deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    frameCount++;

    // Update tweens
    updateTweens();

    // Physics auto-step for entities with vx/vy
    for (var pid in entities) {
      if (!entities.hasOwnProperty(pid)) continue;
      var pe = entities[pid];
      if (pe.vx != null || pe.vy != null) {
        if (pe.gravity) pe.vy = (pe.vy || 0) + pe.gravity;
        if (pe.friction != null) {
          pe.vx = (pe.vx || 0) * pe.friction;
          pe.vy = (pe.vy || 0) * pe.friction;
        }
        pe.x = (pe.x || 0) + (pe.vx || 0);
        pe.y = (pe.y || 0) + (pe.vy || 0);
      }
    }

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

    // Check overlap (circle collision)
    for (var oi = 0; oi < overlapCallbacks.length; oi++) {
      var oc = overlapCallbacks[oi];
      if (disabledBlocks[oc.blockId]) continue;
      var oa = entities[oc.a];
      var ob = entities[oc.b];
      if (oa && ob) {
        var acx = (oa.x || 0) + (oa.width || 0) / 2;
        var acy = (oa.y || 0) + (oa.height || 0) / 2;
        var bcx = (ob.x || 0) + (ob.width || 0) / 2;
        var bcy = (ob.y || 0) + (ob.height || 0) / 2;
        var ar = Math.max(oa.width || 0, oa.height || 0) / 2;
        var br = Math.max(ob.width || 0, ob.height || 0) / 2;
        var dx = acx - bcx, dy = acy - bcy;
        if (Math.sqrt(dx * dx + dy * dy) < ar + br) {
          try { oc.fn(oa, ob); } catch(err) { reportError(oc.blockId, err); }
        }
      }
    }

    // Update particles
    updateParticles();

    draw();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
})();
`;
