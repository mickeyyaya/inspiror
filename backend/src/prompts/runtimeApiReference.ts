export const RUNTIME_API_REFERENCE = `
## game.* Runtime API Reference

The app runs on a fullscreen <canvas>. All drawing is handled by the runtime engine.
You generate blocks — each block is self-contained JS using ONLY these APIs:

### Entity Management
- game.addEntity(id, props) → Register/update a drawable entity.
  Props: { x, y, width, height, color, shape, text, fontSize, opacity, angle, scaleX, scaleY, zIndex, visible, radius, shadowBlur, shadowColor, strokeColor, strokeWidth, points }
  - shape: "circle" renders a circle, "star" renders a star (set points for spikes), otherwise renders a rectangle
  - text: renders as emoji/text centered in the entity's bounds
  - opacity: 0-1 transparency (default 1)
  - angle: rotation in radians
  - scaleX/scaleY: scale transform
  - zIndex: draw order (higher = on top)
  - visible: false to hide without removing
  - radius: rounded corners for rectangles
  - shadowBlur + shadowColor: glow/shadow effect (great for neon looks!)
  - strokeColor + strokeWidth: outline/border
- game.getEntity(id) → Get entity by ID. Returns null if missing (NEVER throws).
- game.removeEntity(id) → Remove entity
- game.allEntities() → Get array of all entities

### Game Loop
- game.onUpdate(blockId, fn) → Register a per-frame callback for this block. The blockId MUST match the block's id.
- game.on(event, blockId, fn) → Register a DOM event listener (keydown, keyup, click, mousemove, etc.)
- game.off(blockId) → Remove all listeners for a block

### Collision
- game.onCollision(entityA_id, entityB_id, blockId, fn) → Check AABB overlap each frame. fn(entityA, entityB) called on collision.
  - No-op if either entity is missing.

### State
- game.set(key, val) → Store a value in the shared state
- game.get(key) → Retrieve a value (returns undefined if missing)

### Rendering
- game.setBackground(color) → Set canvas background color
- game.setBackgroundGradient(type, colors, angle) → Set gradient background. type: "linear"|"radial", colors: array of CSS colors, angle: degrees for linear
- game.addText(id, text, x, y, opts) → Add text entity. opts: { font, color, align, opacity, angle, shadow, shadowColor, shadowBlur }
- game.width() → Canvas width
- game.height() → Canvas height

### Particles & Effects
- game.burst(x, y, opts) → Spawn a burst of particles! opts: { count, spread, life, size, color, colors (array), shape ("circle"|"star"|"square"), text (emoji), gravity, friction, fadeOut, shrink }
  - Great for celebrations, explosions, sparkles, confetti!
- game.trail(x, y, opts) → Spawn a small trail of particles. opts: { count, life, size, color, gravity }
  - Great for movement trails, fairy dust, fire effects!
- game.shake(amount, duration) → Screen shake effect! amount: pixels, duration: ms
  - Great for impacts, explosions, collisions!

### Animation & Tweening
- game.tween(entityOrId, props, duration, opts) → Smoothly animate entity properties over time.
  - props: object of target values, e.g. { x: 100, opacity: 0, scaleX: 2 }
  - duration: milliseconds
  - opts: { easing: "linear"|"easeIn"|"easeOut"|"easeInOut"|"bounce"|"elastic", onComplete: fn }
  - Great for smooth movement, pop-in effects, fading, pulsing!

### Timing & Math Helpers
- game.deltaTime() → Milliseconds since last frame
- game.frameCount() → Number of frames since start
- game.time() → Current time in ms (performance.now)
- game.lerp(a, b, t) → Linear interpolation
- game.clamp(val, min, max) → Clamp value to range
- game.distance(x1, y1, x2, y2) → Distance between two points
- game.randomRange(min, max) → Random float in range
- game.randomInt(min, max) → Random integer in range (inclusive)

### Touch & Pointer (works on tablets!)
- game.pointerX() → Current pointer X position
- game.pointerY() → Current pointer Y position
- game.pointerDown() → Whether pointer is currently pressed
- game.onTap(blockId, fn) → fn(x, y, entity) called on tap/click. entity is the tapped entity or null.
- game.onDrag(entityId, blockId, opts) → Built-in drag-and-drop for an entity.
  - opts: { onStart: fn(entity, x, y), onMove: fn(entity, x, y), onEnd: fn(entity, x, y) }
  - The entity automatically follows the pointer during drag.
  - PREFER game.onDrag() over manual mousemove/touchmove listeners for drag-and-drop!

### Timer Helpers
- game.after(blockId, ms, fn) → Run fn once after ms milliseconds. Auto-cleaned on game.off(blockId).
- game.every(blockId, ms, fn) → Run fn repeatedly every ms milliseconds. Auto-cleaned on game.off(blockId).
  - PREFER game.every() over setInterval — it auto-cleans and has error handling!

### Physics
- Entity physics props: vx, vy (velocity), gravity, bounce, friction
  - Entities with vx/vy are automatically moved each frame by the engine.
  - gravity adds to vy each frame (e.g. 0.5 for falling)
  - friction multiplies vx/vy each frame (e.g. 0.99 for air resistance)
  - bounce is used by bounceOffWalls (0-1, default 0.8)
- game.bounceOffWalls(id) → Bounce entity off canvas edges using its bounce coefficient.
- game.moveToward(id, x, y, speed) → Move entity toward point at given speed.

### UI Elements
- game.addBar(id, opts) → Create a health/progress bar.
  - opts: { x, y, width, height, value, max, color, bgColor, radius, zIndex, opacity }
  - Update value: game.getEntity(id).value = 50;

### Circle Collision
- game.onOverlap(entityA_id, entityB_id, blockId, fn) → Circle-based overlap check each frame.
  - Uses center-to-center distance vs combined radii. Better for circular entities (balls, coins).

### AI Movement Helpers
- game.followEntity(chaserId, targetId, speed) → Move chaser toward target each frame.
- game.wander(id, speed) → Random wandering movement (call in onUpdate).
- game.patrol(id, points, speed) → Move entity along waypoints. points: [[x1,y1], [x2,y2], ...]

### Image Loading
- game.loadImage(id, url, opts) → Load an image as an entity.
  - opts: { x, y, width, height, opacity, zIndex }
  - Uses existing sprite render path.

### Sound Synthesis
- game.playTone(freq, duration, opts) → Play a synthesized tone.
  - freq: Hz (e.g. 440 for A4), duration: ms, opts: { type: "sine"|"square"|"sawtooth"|"triangle", volume: 0-1 }
- game.playNote(note, duration, opts) → Play a musical note by name.
  - note: e.g. "C4", "A5", "G3". duration: ms, opts same as playTone.
- game.playSound(name) → Play a sound (no-op if unavailable)

## CRITICAL RULES:
1. Use ONLY game.* API — no document.createElement, no DOM manipulation, no raw canvas access.
2. Always null-check game.getEntity() before using the result.
3. Each block MUST be self-contained — NEVER reference variables from other blocks.
4. The blockId in game.onUpdate/game.on/game.onCollision MUST match the block's own id field.
5. Use {{key}} placeholders for editable parameters. The runtime substitutes them with values.
6. For numbers, use {{key}} directly (no quotes). For strings/colors, use {{key}} (will be JSON-quoted automatically).
`;
