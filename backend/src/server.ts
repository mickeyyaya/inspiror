import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { llmService } from "./llmService";

export const app = express();

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
const VALID_ROLES = new Set(["user", "assistant"]);
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 5000;

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

app.use("/api/generate", generateLimiter);

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: "messages array is required" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: "Too many messages (max 50)" };
  }

  for (const msg of messages as ChatMessage[]) {
    if (!VALID_ROLES.has(msg.role)) {
      return { valid: false, error: `Invalid role "${msg.role}". Allowed: user, assistant` };
    }
    if (typeof msg.content !== "string" || msg.content.length === 0) {
      return { valid: false, error: "Message content is required and must be a string" };
    }
    if (msg.content.length > MAX_CONTENT_LENGTH) {
      return { valid: false, error: `Message content exceeds ${MAX_CONTENT_LENGTH} characters` };
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

  console.log(`[API] Generation request received | Messages: ${req.body.messages.length} | Code length: ${req.body.currentCode?.length || 0}`);

  try {
    const result = await llmService.generateStream(
      req.body.messages,
      req.body.currentCode,
    );
    result.pipeTextStreamToResponse(res);
  } catch (error) {
    console.error("[API] Route Error during stream setup:", error);
    res.status(500).json({ error: "Internal server error during generation" });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}
