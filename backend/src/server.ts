import express from "express";
import cors from "cors";
import { llmService } from "./llmService";

export const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  if (!req.body.messages || !Array.isArray(req.body.messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const result = await llmService.generate(
      req.body.messages,
      req.body.currentCode,
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).json({ error: "Internal server error during generation" });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}
