import { useEffect, useRef } from "react";
import type {
  ChatMessage,
  Project,
  ProjectSessionStats,
} from "../types/project";
import type { Block } from "../types/block";

const SAVE_DEBOUNCE_MS = 300;

interface UsePersistProjectOptions {
  projectId: string;
  messages: ChatMessage[];
  currentCode: string;
  blocks: Block[];
  onUpdate: (
    projectId: string,
    updates: Partial<
      Pick<Project, "messages" | "currentCode" | "blocks" | "sessionStats">
    >,
  ) => void;
  sessionStats?: ProjectSessionStats;
}

export function usePersistProject({
  projectId,
  messages,
  currentCode,
  blocks,
  onUpdate,
  sessionStats,
}: UsePersistProjectOptions): void {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Save messages immediately
  useEffect(() => {
    onUpdate(projectId, { messages });
  }, [messages, onUpdate, projectId]);

  // Save code + blocks with debounce
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onUpdate(projectId, { currentCode, blocks, sessionStats });
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentCode, blocks, onUpdate, projectId]);
}
