import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "inspiror-muted";
const POOL_SIZE = 4;

const SOUND_PATHS = {
  pop: "/sounds/send-pop.mp3",
  chipClick: "/sounds/chip-click.mp3",
  chime: "/sounds/success-chime.mp3",
  buzzer: "/sounds/error-buzzer.mp3",
} as const;

interface AudioPool {
  elements: HTMLAudioElement[];
  index: number;
}

function createPool(src: string): AudioPool {
  const elements = Array.from({ length: POOL_SIZE }, () => {
    const el = new Audio(src);
    el.load();
    return el;
  });
  return { elements, index: 0 };
}

function playFromPool(pool: AudioPool): void {
  try {
    const el = pool.elements[pool.index];
    el.currentTime = 0;
    el.play().catch(() => {});
    pool.index = (pool.index + 1) % POOL_SIZE;
  } catch {
    // Browser autoplay policy — silently ignore
  }
}

function destroyPool(pool: AudioPool): void {
  for (const el of pool.elements) {
    el.pause();
    el.removeAttribute("src");
    el.load();
  }
  pool.elements.length = 0;
}

export function useAudio() {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const poolsRef = useRef<Record<string, AudioPool> | null>(null);

  useEffect(() => {
    const pools: Record<string, AudioPool> = {};
    for (const [key, src] of Object.entries(SOUND_PATHS)) {
      pools[key] = createPool(src);
    }
    poolsRef.current = pools;

    return () => {
      for (const pool of Object.values(pools)) {
        destroyPool(pool);
      }
      poolsRef.current = null;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isMuted));
    } catch {
      // localStorage unavailable
    }
  }, [isMuted]);

  const play = useCallback(
    (sound: keyof typeof SOUND_PATHS) => {
      if (isMuted) return;
      const pool = poolsRef.current?.[sound];
      if (pool) playFromPool(pool);
    },
    [isMuted],
  );

  const playPop = useCallback(() => play("pop"), [play]);
  const playChipClick = useCallback(() => play("chipClick"), [play]);
  const playChime = useCallback(() => play("chime"), [play]);
  const playBuzzer = useCallback(() => play("buzzer"), [play]);
  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  return { playPop, playChipClick, playChime, playBuzzer, isMuted, toggleMute };
}
