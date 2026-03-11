import { useState, useCallback, useRef, useEffect } from "react";

// SpeechRecognition types (Web Speech API)
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type VoiceLanguage = "en-US" | "zh-CN" | "zh-TW";

export function useVoice(language: VoiceLanguage) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0])
          .map((alt: SpeechRecognitionAlternative) => alt.transcript)
          .join("");
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start recognition", error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current || !isAutoSpeakEnabled) return;

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;

      const voices = synthRef.current.getVoices();
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith(language.split("-")[0]) &&
            v.name.includes("Google"),
        ) || voices.find((v) => v.lang.startsWith(language.split("-")[0]));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.pitch = 1.2;
      utterance.rate = 1.0;

      synthRef.current.speak(utterance);
    },
    [language, isAutoSpeakEnabled],
  );

  const toggleAutoSpeak = useCallback(() => {
    setIsAutoSpeakEnabled((prev) => !prev);
    if (isAutoSpeakEnabled && synthRef.current) {
      synthRef.current.cancel();
    }
  }, [isAutoSpeakEnabled]);

  return {
    isListening,
    transcript,
    isAutoSpeakEnabled,
    startListening,
    stopListening,
    speak,
    toggleAutoSpeak,
  };
}
