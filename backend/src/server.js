"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const llmService_1 = require("./llmService");
exports.app = (0, express_1.default)();
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
const VALID_ROLES = new Set(["user", "assistant"]);
const VALID_LANGUAGES = new Set(["en-US", "zh-TW", "zh-CN"]);
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 5000;
const MAX_CODE_LENGTH = 50000;
exports.app.use(
  (0, helmet_1.default)({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  }),
);
exports.app.use((0, cors_1.default)({ origin: ALLOWED_ORIGIN }));
exports.app.use(express_1.default.json({ limit: "512kb" }));
const generateLimiter = (0, express_rate_limit_1.default)({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});
exports.app.use(["/api/generate", "/api/convert-to-blocks"], generateLimiter);
function validateMessages(messages) {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: "messages array is required" };
  }
  if (messages.length === 0) {
    return { valid: false, error: "At least one message is required" };
  }
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: "Too many messages (max 50)" };
  }
  for (const msg of messages) {
    if (msg === null || typeof msg !== "object") {
      return { valid: false, error: "Each message must be an object" };
    }
    const { role, content } = msg;
    if (!VALID_ROLES.has(role)) {
      return {
        valid: false,
        error: `Invalid role "${role}". Allowed: user, assistant`,
      };
    }
    if (typeof content !== "string" || content.trim().length === 0) {
      return {
        valid: false,
        error: "Message content is required and must be a string",
      };
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return {
        valid: false,
        error: `Message content exceeds ${MAX_CONTENT_LENGTH} characters`,
      };
    }
  }
  return { valid: true };
}
exports.app.post("/api/generate", async (req, res) => {
  const validation = validateMessages(req.body.messages);
  if (!validation.valid) {
    console.warn(`[API] Rejected request: ${validation.error}`);
    return res.status(400).json({ error: validation.error });
  }
  // Validate currentBlocks (JSON string of blocks array)
  if (
    req.body.currentBlocks !== undefined &&
    (typeof req.body.currentBlocks !== "string" ||
      req.body.currentBlocks.length > MAX_CODE_LENGTH)
  ) {
    console.warn("[API] Rejected request: currentBlocks exceeds size limit");
    return res
      .status(400)
      .json({ error: `currentBlocks exceeds ${MAX_CODE_LENGTH} characters` });
  }
  console.log(
    `[API] Generation request received | Messages: ${req.body.messages.length} | Blocks length: ${req.body.currentBlocks?.length || 0}`,
  );
  try {
    const language = VALID_LANGUAGES.has(req.body.language)
      ? req.body.language
      : "en-US";
    const result = await llmService_1.llmService.generateStream(
      req.body.messages,
      req.body.currentBlocks,
      language,
    );
    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("[API] Route Error during stream setup:", error);
    res.status(500).json({ error: "Internal server error during generation" });
  }
});
// --- Legacy code to blocks conversion endpoint ---
exports.app.post("/api/convert-to-blocks", async (req, res) => {
  const { code, language: reqLanguage } = req.body;
  if (!code || typeof code !== "string") {
    return res
      .status(400)
      .json({ error: "code field is required and must be a string" });
  }
  if (code.length > MAX_CODE_LENGTH) {
    return res
      .status(400)
      .json({ error: `code exceeds ${MAX_CODE_LENGTH} characters` });
  }
  const language = VALID_LANGUAGES.has(reqLanguage) ? reqLanguage : "en-US";
  if (!VALID_LANGUAGES.has(reqLanguage)) {
    console.warn(
      `[API] Invalid language "${reqLanguage}", defaulting to en-US`,
    );
  }
  console.log(`[API] Convert-to-blocks request | Code length: ${code.length}`);
  try {
    const result = await llmService_1.llmService.convertToBlocks(
      code,
      language,
    );
    const finalObject = await result.object;
    res.json(finalObject);
  } catch (error) {
    console.error("[API] Route Error during conversion:", error);
    res.status(500).json({ error: "Internal server error during conversion" });
  }
});
// Global error handler — catches unhandled errors in route handlers
exports.app.use((err, _req, res, _next) => {
  console.error("[API] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});
if (require.main === module) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("[FATAL] GOOGLE_GENERATIVE_AI_API_KEY is not set. Exiting.");
    process.exit(1);
  }
  const PORT = process.env.PORT || 3001;
  exports.app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}
//# sourceMappingURL=server.js.map
