import type { Block } from "./block";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "tip";
}

export interface ProjectSessionStats {
  totalBuilds: number;
  totalMessages: number;
  blockCategories: string[];
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  currentCode: string;
  blocks?: Block[];
  version?: number;
  sessionStats?: ProjectSessionStats;
}
