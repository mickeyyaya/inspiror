import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "inspiror-muted";

const SOUND_PATHS = {
  pop: "/sounds/send-pop.mp3",
  chipClick: "/sounds/chip-click.mp3",
  chime: "/sounds/success-chime.mp3",
  buzzer: "/sounds/error-buzzer.mp3",
} as const;

function createPlayer(src: string): () => void {
  const audio = new Audio(src);
  audio.load();

  return () => {
    try {
      const clone = audio.cloneNode(true) as HTMLAudioElement;
      clone.play().catch(() => {});
    } catch {
      // Browser autoplay policy — silently ignore
    }
  };
}

export function useAudio() {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const playersRef = useRef<Record<string, () => void> | null>(null);

  useEffect(() => {
    playersRef.current = {
      pop: createPlayer(SOUND_PATHS.pop),
      chipClick: createPlayer(SOUND_PATHS.chipClick),
      chime: createPlayer(SOUND_PATHS.chime),
      buzzer: createPlayer(SOUND_PATHS.buzzer),
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
      playersRef.current?.[sound]?.();
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
