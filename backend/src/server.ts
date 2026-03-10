import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { llmService } from "./llmService";

export const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176").split(",");
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60_000, max: 30 });

const messageSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(10_000),
  }),
);

app.post("/api/generate", limiter, async (req, res) => {
  const parsed = messageSchema.safeParse(req.body.messages);
  if (!parsed.success) {
    console.warn("[API] Rejected request: Invalid messages.", parsed.error.message);
    return res.status(400).json({ error: "messages array is required with valid role and content" });
  }

  console.log(`[API] Generation request received | Messages: ${parsed.data.length} | Code length: ${req.body.currentCode?.length || 0}`);

  try {
    const result = await llmService.generateStream(
      parsed.data,
      req.body.currentCode,
      req.body.language,
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
