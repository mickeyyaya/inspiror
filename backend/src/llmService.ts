import { z } from "zod";
import { streamObject, Message } from "ai";
import { google } from "@ai-sdk/google";

// Define the exact schema we want the LLM to return
export const generationSchema = z.object({
  reply: z
    .string()
    .describe("A fun, encouraging message from the AI Buddy to the child."),
  code: z
    .string()
    .describe(
      "A single HTML file string containing inline CSS and JS. Must be a complete valid HTML document. Do NOT wrap in markdown code blocks.",
    ),
});

// Define the shape of our return type based on the schema
export type GenerationResult = z.infer<typeof generationSchema>;

export class LLMService {
  constructor() {
    // If no model is configured, it will default to Gemini via the @ai-sdk/google provider.
    // The google() provider automatically picks up GOOGLE_GENERATIVE_AI_API_KEY
  }

  async generate(
    messages: Message[],
    currentCode?: string,
  ): Promise<GenerationResult> {
    try {
      const basePrompt = `You are the "Builder Buddy", an encouraging, patient mentor for kids (ages 8-14) building visual apps.
You are represented visually as a Cute Animal.
Your goal is to help them build interactive UIs, simple 2D games, and animations using ONLY self-contained HTML, CSS, and JS.
Keep your language simple, avoid heavy jargon, and praise their creativity.
If their request is vague, ask scaffolding questions.

CRITICAL:
1. Return your response EXACTLY matching the JSON schema provided.
2. The 'code' field MUST contain a complete, single HTML file with inline <style> and <script> tags.
3. DO NOT include markdown formatting (like \`\`\`html) inside the 'code' field. It must be raw HTML.`;

      const systemContent = currentCode
        ? `${basePrompt}\n\nThe user's current app code is:\n${currentCode}\n\nModify this existing code based on the user's request. Keep all existing functionality unless told otherwise.`
        : basePrompt;

      const result = streamObject({
        model: google("gemini-2.5-pro"),
        schema: generationSchema,
        messages: [
          {
            role: "system",
            content: systemContent,
          },
          ...messages,
        ],
      });

      return await result.object;
    } catch (error) {
      console.error("LLM Generation Error:", error);
      throw new Error("Failed to generate response from LLM.");
    }
  }
}

export const llmService = new LLMService();
