import { useEffect, useRef } from "react";
import type { Block } from "../types/block";
import { compileBlocks } from "../compiler/compileBlocks";

const COMPILE_DEBOUNCE_MS = 150;

interface UseCompileBlocksOptions {
  blocks: Block[];
  checksRef: React.RefObject<string[]>;
  isLegacyProject: boolean;
  setCurrentCode: (code: string) => void;
}

export function useCompileBlocks({
  blocks,
  checksRef,
  isLegacyProject,
  setCurrentCode,
}: UseCompileBlocksOptions): void {
  const compileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(isLegacyProject);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    compileTimerRef.current = setTimeout(() => {
      setCurrentCode(compileBlocks(blocks, checksRef.current));
      compileTimerRef.current = null;
    }, COMPILE_DEBOUNCE_MS);
    return () => {
      if (compileTimerRef.current) clearTimeout(compileTimerRef.current);
    };
  }, [blocks, checksRef, setCurrentCode]);
}
