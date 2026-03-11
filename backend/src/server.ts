import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { llmService } from "./llmService";

export const app = express();

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
const VALID_ROLES = new Set(["user", "assistant"]);
const VALID_LANGUAGES = new Set(["en-US", "zh-TW", "zh-CN"]);
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 5000;
const MAX_CODE_LENGTH = 50000;

app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: "512kb" }));

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

app.use(["/api/generate", "/api/convert-to-blocks"], generateLimiter);

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): {
  valid: boolean;
  error?: string;
} {
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
    const { role, content } = msg as ChatMessage;
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

app.post("/api/generate", async (req, res) => {
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
    const result = await llmService.generateStream(
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
app.post("/api/convert-to-blocks", async (req, res) => {
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

  console.log(`[API] Convert-to-blocks request | Code length: ${code.length}`);

  try {
    const result = await llmService.convertToBlocks(code, language);
    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("[API] Route Error during conversion:", error);
    res.status(500).json({ error: "Internal server error during conversion" });
  }
});

// Global error handler — catches unhandled errors in route handlers
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[API] Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}
