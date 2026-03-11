import type { BlockCategory } from "../types/block";

export interface CategoryMeta {
  color: string;
  emoji: string;
  label: string;
}

export const BLOCK_CATEGORIES: Record<BlockCategory, CategoryMeta> = {
  setup: { color: "#3b82f6", emoji: "⚙️", label: "Setup" },
  character: { color: "#ec4899", emoji: "🧑", label: "Character" },
  movement: { color: "#f97316", emoji: "🏃", label: "Movement" },
  collision: { color: "#ef4444", emoji: "💥", label: "Collision" },
  event: { color: "#22c55e", emoji: "🎯", label: "Event" },
  score: { color: "#eab308", emoji: "⭐", label: "Score" },
  timer: { color: "#06b6d4", emoji: "⏱️", label: "Timer" },
  visual: { color: "#a855f7", emoji: "✨", label: "Visual" },
  sound: { color: "#84cc16", emoji: "🔊", label: "Sound" },
  custom: { color: "#6b7280", emoji: "🧩", label: "Custom" },
};
