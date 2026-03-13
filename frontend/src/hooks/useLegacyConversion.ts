import { useState, useEffect, useRef } from "react";
import type { Block } from "../types/block";
import type { Project } from "../types/project";
import type { VoiceLanguage } from "./useVoice";

export interface UseLegacyConversionParams {
  project: Pick<Project, "id" | "messages" | "currentCode" | "blocks">;
  language: VoiceLanguage;
  onBlocksConverted: (blocks: Block[]) => void;
  onConversionEnd?: () => void;
}

export interface UseLegacyConversionReturn {
  isConverting: boolean;
}

const VALID_BLOCK_CATEGORIES = new Set([
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
]);

const VALID_PARAM_TYPES = new Set([
  "number",
  "color",
  "string",
  "boolean",
  "enum",
]);

function isValidParam(p: unknown): boolean {
  if (p === null || typeof p !== "object") return false;
  const param = p as Record<string, unknown>;
  return (
    typeof param.key === "string" &&
    typeof param.label === "string" &&
    typeof param.type === "string" &&
    VALID_PARAM_TYPES.has(param.type) &&
    param.value !== undefined
  );
}

export function isValidBlock(b: unknown): b is Block {
  if (b === null || typeof b !== "object") return false;
  const block = b as Record<string, unknown>;
  return (
    typeof block.id === "string" &&
    typeof block.type === "string" &&
    VALID_BLOCK_CATEGORIES.has(block.type) &&
    typeof block.label === "string" &&
    typeof block.emoji === "string" &&
    typeof block.enabled === "boolean" &&
    typeof block.code === "string" &&
    typeof block.order === "number" &&
    Array.isArray(block.params) &&
    block.params.every(isValidParam) &&
    (block.css === undefined || typeof block.css === "string")
  );
}

export function useLegacyConversion({
  project,
  language,
  onBlocksConverted,
  onConversionEnd = () => {},
}: UseLegacyConversionParams): UseLegacyConversionReturn {
  const [isConverting, setIsConverting] = useState(false);
  const hasAttemptedConversion = useRef(false);

  useEffect(() => {
    if (hasAttemptedConversion.current) return;
    if (project.blocks !== undefined) return;
    const code = project.currentCode;
    if (!code || code.length < 100) return;

    hasAttemptedConversion.current = true;
    setIsConverting(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    const base = import.meta.env.VITE_API_URL
      ? new URL(import.meta.env.VITE_API_URL).origin
      : "http://localhost:3001";
    const apiUrl = `${base}/api/convert-to-blocks`;

    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed = await res.json();
        if (
          parsed?.blocks &&
          Array.isArray(parsed.blocks) &&
          parsed.blocks.length > 0 &&
          parsed.blocks.every(isValidBlock)
        ) {
          const blocks = parsed.blocks as Block[];
          onBlocksConverted(blocks);
        }
      })
      .catch((err) => {
        console.error("[EditorView] Legacy conversion failed:", err);
        // Keep DEFAULT_BLOCKS — already initialized in state
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setIsConverting(false);
        onConversionEnd();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isConverting };
}
