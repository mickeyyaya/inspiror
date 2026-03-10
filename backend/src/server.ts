import express from "express";
import cors from "cors";
import { llmService } from "./llmService";

export const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  if (!req.body.messages || !Array.isArray(req.body.messages)) {
    console.warn("[API] Rejected request: Missing messages array.");
    return res.status(400).json({ error: "messages array is required" });
  }

  console.log(`[API] Generation request received | Messages: ${req.body.messages.length} | Code length: ${req.body.currentCode?.length || 0}`);

  try {
    const result = await llmService.generateStream(
      req.body.messages,
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
