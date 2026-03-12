import { z } from "zod";

export const ALL_SUGGESTIONS = [
  { emoji: "\u{1F3C0}", label: "Make a bouncing ball game" },
  { emoji: "\u{1F3A8}", label: "Create a neon paint app" },
  { emoji: "\u23F0", label: "Build a glowing clock" },
  { emoji: "\u{1F680}", label: "Design a space adventure" },
  { emoji: "\u{1F40D}", label: "Build a snake game" },
  { emoji: "\u{1F3B9}", label: "Make a piano keyboard" },
  { emoji: "\u{1F308}", label: "Create a rainbow drawing tool" },
  { emoji: "\u{1F47E}", label: "Build a space invaders game" },
  { emoji: "\u{1F3B2}", label: "Make a dice roller app" },
  { emoji: "\u{1F9EE}", label: "Build a fun calculator" },
  { emoji: "\u{1F996}", label: "Make a dinosaur runner game" },
  { emoji: "\u{1F3AF}", label: "Create a target shooting game" },
  { emoji: "\u{1F30D}", label: "Build an interactive globe" },
  { emoji: "\u{1F431}", label: "Make a virtual pet simulator" },
  { emoji: "\u{1F3D3}", label: "Build a pong game" },
  { emoji: "\u{1F4A1}", label: "Create a quiz trivia app" },
  { emoji: "\u{1F3B5}", label: "Make a music beat maker" },
  { emoji: "\u{1F9E9}", label: "Build a jigsaw puzzle" },
  { emoji: "\u{1F3F0}", label: "Design a castle defense game" },
  { emoji: "\u{1F30A}", label: "Make an ocean wave simulator" },
  { emoji: "\u{1F52E}", label: "Build a magic 8 ball" },
  { emoji: "\u{1F3AA}", label: "Create a whack-a-mole game" },
  { emoji: "\u{1F4DD}", label: "Make a to-do list app" },
  { emoji: "\u{1F338}", label: "Build a flower garden grower" },
  { emoji: "\u{1F697}", label: "Make a racing car game" },
  { emoji: "\u26A1", label: "Create a reaction speed tester" },
  { emoji: "\u{1F383}", label: "Build a spooky haunted house" },
  { emoji: "\u{1F9F2}", label: "Make a magnet physics toy" },
  { emoji: "\u{1F438}", label: "Build a frogger road crossing game" },
  { emoji: "\u{1F5FA}\uFE0F", label: "Create a treasure map adventure" },
  { emoji: "\u{1F9B8}", label: "Design a superhero creator" },
  { emoji: "\u{1F355}", label: "Make a pizza ordering app" },
  { emoji: "\u{1F3B0}", label: "Build a slot machine game" },
  { emoji: "\u{1F52C}", label: "Create a molecule builder" },
  { emoji: "\u2601\uFE0F", label: "Make a weather dashboard" },
  { emoji: "\u{1F3D7}\uFE0F", label: "Build a tower stacker game" },
  { emoji: "\u{1F3B8}", label: "Create a guitar string simulator" },
  { emoji: "\u{1F9EA}", label: "Make a color mixing lab" },
  { emoji: "\u{1F41D}", label: "Build a bee pollination game" },
  { emoji: "\u{1F30B}", label: "Create a volcano eruption simulator" },
];

export const CHIPS_PER_SET = 4;
export const CONFETTI_COUNT = 80;

const blockParamSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["number", "color", "string", "boolean", "enum"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z.array(z.string()).optional(),
});

const blockSchema = z.object({
  id: z.string(),
  type: z.enum([
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
  ]),
  label: z.string(),
  emoji: z.string(),
  enabled: z.boolean(),
  params: z.array(blockParamSchema),
  code: z.string(),
  css: z.string().optional(),
  order: z.number(),
});

export const generationSchema = z.object({
  reply: z.string(),
  blocks: z.array(blockSchema),
  checks: z.array(z.string()).optional(),
});

export function pickRandomChips() {
  const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, CHIPS_PER_SET);
}

export function withId(
  role: "user" | "assistant" | "system",
  content: string,
): { id: string; role: "user" | "assistant" | "system"; content: string } {
  return { id: crypto.randomUUID(), role, content };
}
