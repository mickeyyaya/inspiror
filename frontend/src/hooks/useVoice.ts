import { useState, useCallback, useRef, useEffect } from "react";

// Add global type definitions for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type VoiceLanguage = "en-US" | "zh-CN";

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState<VoiceLanguage>("en-US");
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    // Initialize SpeechSynthesis
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

  // Update recognition language when it changes
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

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;

      // Try to find a good voice for the language
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith(language.split("-")[0]) && v.name.includes("Google")
      ) || voices.find((v) => v.lang.startsWith(language.split("-")[0]));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Adjust pitch and rate for a kid-friendly feel
      utterance.pitch = 1.2;
      utterance.rate = 1.0;

      synthRef.current.speak(utterance);
    },
    [language, isAutoSpeakEnabled]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "en-US" ? "zh-CN" : "en-US"));
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    setIsAutoSpeakEnabled((prev) => !prev);
    if (isAutoSpeakEnabled && synthRef.current) {
      synthRef.current.cancel();
    }
  }, [isAutoSpeakEnabled]);

  return {
    isListening,
    transcript,
    language,
    isAutoSpeakEnabled,
    startListening,
    stopListening,
    speak,
    toggleLanguage,
    toggleAutoSpeak,
    setTranscript,
  };
}
