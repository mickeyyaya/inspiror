import { z } from "zod";
import { streamObject } from "ai";
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

  async generateStream(
    messages: Array<{ role: string; content: string }>,
    currentCode?: string,
    language: string = "en-US",
  ) {
    try {
      const languageHint =
        language === "zh-TW"
          ? "The user prefers Traditional Chinese (繁體中文). Please reply in Traditional Chinese."
          : language === "zh-CN"
            ? "The user prefers Simplified Chinese (简体中文). Please reply in Simplified Chinese."
            : "The user prefers English. Please reply in English.";

      const basePrompt = `You are the "Builder Buddy", an encouraging, patient mentor for kids (ages 8-14) building visual apps.
You are represented visually as a Cute Animal.
${languageHint}
Your goal is to help them build interactive UIs, simple 2D games, and animations using ONLY self-contained HTML, CSS, and JS.
Keep your language simple, avoid heavy jargon, and praise their creativity.
If their request is vague, ask scaffolding questions.

CRITICAL - ITERATIVE VISUAL SCAFFOLDING:
Never build a complex game or app all at once. You must break large goals into small, easily understandable visual steps. 
1. When a user asks for a complex project (e.g., "make a platformer game"), generate ONLY the first foundational visual layer (e.g., just the background and a static main character).
2. In your reply, explain what you just built in simple terms.
3. Ask a guiding question to lead them to the next step (e.g., "Here is our hero on the grass! Should we make them jump with the spacebar or run left and right first?").
4. Wait for their response, then implement the next step. Each conversation turn should add one distinct, visible feature so the child can see the project grow step by step.

CRITICAL - FORMATTING:
1. Return your response EXACTLY matching the JSON schema provided.
2. The 'code' field MUST contain a complete, single HTML file with inline <style> and <script> tags.
3. DO NOT include markdown formatting (like \`\`\`html) inside the 'code' field. It must be raw HTML.`;

      const systemContent = currentCode
        ? `${basePrompt}\n\nThe user's current app code is:\n${currentCode}\n\nModify this existing code based on the user's request. Keep all existing functionality unless told otherwise.`
        : basePrompt;

      const result = await streamObject({
        model: google("gemini-3.1-flash-lite-preview"),
        providerOptions: {
          google: {
            thinkingConfig: { thinkingLevel: "medium" },
          },
        },
        schema: generationSchema,
        messages: [
          {
            role: "system" as const,
            content: systemContent,
          },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
      });

      return result; // Return the stream directly for pipeTextStreamToResponse
    } catch (error) {
      console.error("[LLM Service] Generation Error:", error);
      throw new Error("Failed to generate response from LLM.");
    }
  }
}

export const llmService = new LLMService();
