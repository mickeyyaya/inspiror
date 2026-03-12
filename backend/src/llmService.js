"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmService = exports.LLMService = exports.generationSchema = void 0;
const zod_1 = require("zod");
const ai_1 = require("ai");
const google_1 = require("@ai-sdk/google");
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";
// --- Block schema for structured block generation ---
const blockParamSchema = zod_1.z.object({
    key: zod_1.z.string().describe("Parameter key used in {{key}} placeholders"),
    label: zod_1.z.string().describe("Human-readable label for the parameter"),
    type: zod_1.z.enum(["number", "color", "string", "boolean", "enum"]),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]),
    min: zod_1.z.number().optional(),
    max: zod_1.z.number().optional(),
    step: zod_1.z.number().optional(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
});
const blockSchema = zod_1.z.object({
    id: zod_1.z.string().describe("Unique block ID, e.g. 'bg-setup' or 'player-move'"),
    type: zod_1.z
        .enum([
        "setup",
        "character",
        "movement",
        "collision",
        "event",
        "score",
        "timer",
        "visual",
        "sound",
        "custom",
    ])
        .describe("Block category"),
    label: zod_1.z
        .string()
        .describe("Short human-readable label, e.g. 'Bouncing Ball'"),
    emoji: zod_1.z.string().describe("Single emoji representing this block"),
    enabled: zod_1.z.boolean().describe("Whether this block is active"),
    params: zod_1.z
        .array(blockParamSchema)
        .describe("Editable parameters with {{key}} placeholders in code"),
    code: zod_1.z
        .string()
        .describe("JavaScript code using ONLY the game.* runtime API. Use {{key}} placeholders for params. Must be self-contained — never reference other blocks."),
    css: zod_1.z.string().optional().describe("Optional CSS for this block"),
    order: zod_1.z.number().describe("Execution order (lower = first)"),
});
// --- Generation schemas ---
exports.generationSchema = zod_1.z.object({
    reply: zod_1.z
        .string()
        .describe("A fun, encouraging message from the AI Buddy to the child."),
    blocks: zod_1.z
        .array(blockSchema)
        .describe("Array of self-contained logic blocks using the game.* runtime API. Each block must be independent and use {{key}} param placeholders."),
});
const conversionSchema = zod_1.z.object({
    blocks: zod_1.z
        .array(blockSchema)
        .describe("Array of self-contained logic blocks converted from the provided HTML/JS code. Each block must use the game.* runtime API."),
});
// --- Runtime API reference for the system prompt ---
const RUNTIME_API_REFERENCE = `
## game.* Runtime API Reference

The app runs on a fullscreen <canvas>. All drawing is handled by the runtime engine.
You generate blocks — each block is self-contained JS using ONLY these APIs:

### Entity Management
- game.addEntity(id, props) → Register/update a drawable entity. Props: { x, y, width, height, color, shape, text, fontSize }
  - shape: "circle" renders a circle, otherwise renders a rectangle
  - text: renders as emoji/text centered in the entity's bounds
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
- game.addText(id, text, x, y, opts) → Add text entity. opts: { font, color, align }
- game.width() → Canvas width
- game.height() → Canvas height

### Sound
- game.playSound(name) → Play a sound (no-op if unavailable)

## CRITICAL RULES:
1. Use ONLY game.* API — no document.createElement, no DOM manipulation, no raw canvas access.
2. Always null-check game.getEntity() before using the result.
3. Each block MUST be self-contained — NEVER reference variables from other blocks.
4. The blockId in game.onUpdate/game.on/game.onCollision MUST match the block's own id field.
5. Use {{key}} placeholders for editable parameters. The runtime substitutes them with values.
6. For numbers, use {{key}} directly (no quotes). For strings/colors, use {{key}} (will be JSON-quoted automatically).
`;
// --- Worked examples for the AI ---
const BLOCK_EXAMPLES = `
## Block Examples

### Setup Block (background)
{
  "id": "bg-setup",
  "type": "setup",
  "label": "Sky Background",
  "emoji": "🌅",
  "enabled": true,
  "params": [{ "key": "bgColor", "label": "Sky Color", "type": "color", "value": "#87CEEB" }],
  "code": "game.setBackground({{bgColor}});",
  "order": 0
}

### Character Block (player)
{
  "id": "player",
  "type": "character",
  "label": "Player Character",
  "emoji": "🐱",
  "enabled": true,
  "params": [
    { "key": "emoji", "label": "Character", "type": "string", "value": "🐱" },
    { "key": "size", "label": "Size", "type": "number", "value": 48, "min": 16, "max": 128, "step": 8 }
  ],
  "code": "game.addEntity('player', { text: {{emoji}}, x: game.width() / 2, y: game.height() - 80, width: {{size}}, height: {{size}}, fontSize: {{size}} });",
  "order": 1
}

### Movement Block (keyboard controls)
{
  "id": "player-move",
  "type": "movement",
  "label": "Keyboard Controls",
  "emoji": "⌨️",
  "enabled": true,
  "params": [{ "key": "speed", "label": "Speed", "type": "number", "value": 5, "min": 1, "max": 20, "step": 1 }],
  "code": "var keys = {};\\ngame.on('keydown', 'player-move', function(e) { keys[e.key] = true; });\\ngame.on('keyup', 'player-move', function(e) { keys[e.key] = false; });\\ngame.onUpdate('player-move', function() {\\n  var p = game.getEntity('player');\\n  if (!p) return;\\n  if (keys['ArrowLeft']) p.x -= {{speed}};\\n  if (keys['ArrowRight']) p.x += {{speed}};\\n  if (keys['ArrowUp']) p.y -= {{speed}};\\n  if (keys['ArrowDown']) p.y += {{speed}};\\n});",
  "order": 2
}

### Score Block
{
  "id": "score-display",
  "type": "score",
  "label": "Score Counter",
  "emoji": "⭐",
  "enabled": true,
  "params": [{ "key": "color", "label": "Text Color", "type": "color", "value": "#FFD700" }],
  "code": "game.set('score', 0);\\ngame.addText('score-text', 'Score: 0', 20, 40, { font: 'bold 24px sans-serif', color: {{color}} });\\ngame.onUpdate('score-display', function() {\\n  var t = game.getEntity('score-text');\\n  if (t) t.text = 'Score: ' + (game.get('score') || 0);\\n});",
  "order": 10
}

### Collision Block
{
  "id": "player-coin-collision",
  "type": "collision",
  "label": "Coin Pickup",
  "emoji": "💰",
  "enabled": true,
  "params": [],
  "code": "game.onCollision('player', 'coin', 'player-coin-collision', function(p, c) {\\n  game.set('score', (game.get('score') || 0) + 1);\\n  c.x = Math.random() * (game.width() - 30);\\n  c.y = Math.random() * (game.height() - 30);\\n});",
  "order": 5
}

### Timer Block (spawning)
{
  "id": "enemy-spawner",
  "type": "timer",
  "label": "Enemy Spawner",
  "emoji": "👾",
  "enabled": true,
  "params": [{ "key": "interval", "label": "Spawn Interval (ms)", "type": "number", "value": 2000, "min": 500, "max": 10000, "step": 500 }],
  "code": "var enemyCount = 0;\\nsetInterval(function() {\\n  enemyCount++;\\n  game.addEntity('enemy-' + enemyCount, {\\n    text: '👾',\\n    x: Math.random() * game.width(),\\n    y: 0,\\n    width: 32,\\n    height: 32,\\n    fontSize: 28\\n  });\\n}, {{interval}});",
  "order": 3
}
`;
class LLMService {
    constructor() {
        // The google() provider automatically picks up GOOGLE_GENERATIVE_AI_API_KEY
    }
    async generateStream(messages, currentBlocks, language = "en-US") {
        try {
            const languageHint = language === "zh-TW"
                ? "The user prefers Traditional Chinese (繁體中文). Please reply in Traditional Chinese."
                : language === "zh-CN"
                    ? "The user prefers Simplified Chinese (简体中文). Please reply in Simplified Chinese."
                    : "The user prefers English. Please reply in English.";
            const basePrompt = `You are the "Builder Buddy", an encouraging, patient mentor for kids (ages 8-14) building visual canvas games and animations.
You are represented visually as a Cute Animal.
${languageHint}
Your goal is to help them build interactive 2D games, animations, and visual apps using a block-based system.
Keep your language simple, avoid heavy jargon, and praise their creativity.
If their request is vague, ask scaffolding questions.

CRITICAL - FUN DESIGN ELEMENTS:
When designing the layout and visual elements of the app, ALWAYS use fun, organic, kid-friendly design elements.
Prefer vibrant candy colors (like bright pinks, cyans, yellows, and purples), organic shapes (like bubbles, blobs),
and gentle, engaging animations (like floating, wobbling) rather than rigid geometric grids or boring default styles.
Make the canvas look magical, alive, and super fun for kids to interact with!

CRITICAL - YOU GENERATE BLOCKS, NOT RAW HTML:
You generate an array of "blocks" — self-contained logic units that use the game.* runtime API.
Each block runs independently inside a canvas-based game engine. The blocks are compiled into an app automatically.

${RUNTIME_API_REFERENCE}

${BLOCK_EXAMPLES}

CRITICAL - ITERATIVE VISUAL SCAFFOLDING:
Never build a complex game all at once. Break large goals into small visual steps.
1. For a complex request, generate 2-3 foundational blocks first (background + main character).
2. Explain what you built in simple terms.
3. Ask a guiding question to lead them to the next step.
4. Each turn should add 1-2 new blocks. The child sees the project grow step by step.

CRITICAL - WHEN MODIFYING EXISTING BLOCKS:
When the user has existing blocks and asks for changes:
1. Keep ALL existing blocks that still make sense (include them in your response).
2. Modify only the blocks that need changing.
3. Add new blocks for new features.
4. The blocks array in your response replaces the entire current set, so always include all blocks.`;
            const systemContent = currentBlocks
                ? `${basePrompt}\n\nThe user's current blocks are:\n${currentBlocks}\n\nModify/extend these blocks based on the user's request. Keep all existing functionality unless told otherwise. Include ALL blocks (existing + new) in your response.`
                : basePrompt;
            const result = await (0, ai_1.streamObject)({
                model: (0, google_1.google)(GEMINI_MODEL),
                providerOptions: {
                    google: {
                        structuredOutputs: true,
                        thinkingConfig: {
                            thinkingLevel: "medium",
                        },
                    },
                },
                schema: exports.generationSchema,
                messages: [
                    {
                        role: "system",
                        content: systemContent,
                    },
                    ...messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                ],
            });
            return result;
        }
        catch (error) {
            console.error("[LLM Service] Generation Error:", error);
            throw new Error("Failed to generate response from LLM.");
        }
    }
    async convertToBlocks(code, language = "en-US") {
        try {
            const prompt = `You are converting a legacy HTML/CSS/JS app into the block-based format.
Analyze the code and create equivalent blocks using the game.* runtime API.

${RUNTIME_API_REFERENCE}

${BLOCK_EXAMPLES}

Convert the following HTML app into blocks. Recreate the visual appearance and behavior as closely as possible using canvas-based game.* API calls. If exact recreation is impossible, create the closest approximation.

The HTML code to convert:
${code}`;
            const result = await (0, ai_1.streamObject)({
                model: (0, google_1.google)(GEMINI_MODEL),
                providerOptions: {
                    google: {
                        structuredOutputs: true,
                        thinkingConfig: {
                            thinkingLevel: "medium",
                        },
                    },
                },
                schema: conversionSchema,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });
            return result;
        }
        catch (error) {
            console.error("[LLM Service] Conversion Error:", error);
            throw new Error("Failed to convert code to blocks.");
        }
    }
}
exports.LLMService = LLMService;
exports.llmService = new LLMService();
//# sourceMappingURL=llmService.js.map