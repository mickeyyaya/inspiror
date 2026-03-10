import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  Mic,
  MicOff,
  Languages,
  MessageSquareQuote,
} from "lucide-react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { useAudio } from "./hooks/useAudio";
import { useProjects } from "./hooks/useProjects";
import { useVoice, type VoiceLanguage } from "./hooks/useVoice";
import { ProjectCatalog } from "./components/ProjectCatalog";
import { translations } from "./i18n/translations";
import type { ChatMessage } from "./types/project";
import "./index.css";

function withId(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content };
}

const ALL_SUGGESTIONS = [
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

const CHIPS_PER_SET = 4;

function pickRandomChips() {
  const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, CHIPS_PER_SET);
}

const generationSchema = z.object({
  reply: z.string(),
  code: z.string(),
});

const ERROR_CATCHER_SCRIPT = `<script>window.onerror=function(msg,src,line,col,err){window.parent.postMessage({type:"iframe-error",message:msg+" (line "+line+")"},"*");return true;};</script>`;

const CONFETTI_COUNT = 80;

function injectErrorCatcher(code: string): string {
  const headClose = code.indexOf("</head>");
  if (headClose !== -1) {
    return (
      code.slice(0, headClose) + ERROR_CATCHER_SCRIPT + code.slice(headClose)
    );
  }
  const bodyOpen = code.indexOf("<body");
  if (bodyOpen !== -1) {
    return (
      code.slice(0, bodyOpen) + ERROR_CATCHER_SCRIPT + code.slice(bodyOpen)
    );
  }
  const htmlOpen = code.toLowerCase().indexOf("<html");
  if (htmlOpen !== -1) {
    const htmlEnd = code.indexOf(">", htmlOpen) + 1;
    return code.slice(0, htmlEnd) + ERROR_CATCHER_SCRIPT + code.slice(htmlEnd);
  }
  const doctypeEnd = code.toLowerCase().indexOf("<!doctype html>");
  if (doctypeEnd !== -1) {
    return (
      code.slice(0, doctypeEnd + 15) +
      ERROR_CATCHER_SCRIPT +
      code.slice(doctypeEnd + 15)
    );
  }
  return ERROR_CATCHER_SCRIPT + code;
}

function App() {
  const [language, setLanguage] = useState<VoiceLanguage>("en-US");

  const {
    projects,
    currentProject,
    createProject,
    openProject,
    deleteProject,
    goToCatalog,
    updateProject,
    resetCurrentProject,
    DEFAULT_CODE,
  } = useProjects(language);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      if (prev === "en-US") return "zh-TW";
      if (prev === "zh-TW") return "zh-CN";
      return "en-US";
    });
  };

  // If no project is selected, show catalog
  if (!currentProject) {
    return (
      <ProjectCatalog
        projects={projects}
        onOpen={openProject}
        onDelete={deleteProject}
        onCreate={createProject}
        language={language}
        onToggleLanguage={toggleLanguage}
      />
    );
  }

  return (
    <EditorView
      key={currentProject.id}
      project={currentProject}
      defaultCode={DEFAULT_CODE}
      onUpdate={updateProject}
      onReset={resetCurrentProject}
      onBack={goToCatalog}
      language={language}
      onToggleLanguage={toggleLanguage}
    />
  );
}

interface EditorViewProps {
  project: { id: string; messages: ChatMessage[]; currentCode: string };
  defaultCode: string;
  onUpdate: (
    projectId: string,
    updates: Partial<
      Pick<
        { messages: ChatMessage[]; currentCode: string },
        "messages" | "currentCode"
      >
    >,
  ) => void;
  onReset: () => void;
  onBack: () => void;
  language: VoiceLanguage;
  onToggleLanguage: () => void;
}

function EditorView({
  project,
  defaultCode,
  onUpdate,
  onReset,
  onBack,
  language,
  onToggleLanguage,
}: EditorViewProps) {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (
      project.messages.length === 1 &&
      project.messages[0].role === "assistant" &&
      project.messages[0].content.includes("Hi! I'm your builder buddy")
    ) {
      return [withId("assistant", t.greeting)];
    }
    return project.messages;
  });
  const [inputValue, setInputValue] = useState("");
  const [currentCode, setCurrentCode] = useState(project.currentCode);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [suggestionChips, setSuggestionChips] = useState(pickRandomChips);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoFixCountRef = useRef(0);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playPop, playChipClick, playChime, playBuzzer, isMuted, toggleMute } =
    useAudio();
  const {
    isListening,
    transcript,
    isAutoSpeakEnabled,
    startListening,
    stopListening,
    speak,
    toggleAutoSpeak,
  } = useVoice(language);
  const playChimeRef = useRef(playChime);
  const speakRef = useRef(speak);

  useEffect(() => {
    playChimeRef.current = playChime;
  }, [playChime]);

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // Sync transcript to input while listening
  useEffect(() => {
    if (isListening && transcript) {
      setInputValue(transcript);
    }
  }, [isListening, transcript]);

  const { object, submit, isLoading } = useObject({
    api: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/generate",
    schema: generationSchema,
    onFinish({ object: finalObj }) {
      if (finalObj?.reply) {
        setMessages((prev) => [
          ...prev,
          withId("assistant", finalObj.reply as string),
        ]);
        // Speak the final reply
        speakRef.current(finalObj.reply as string);
      }
      if (finalObj?.code) {
        setCurrentCode(finalObj.code as string);
      }
      playChimeRef.current();

      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
      setShowConfetti(true);
      confettiTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        confettiTimerRef.current = null;
      }, 2500);
    },
    onError(err) {
      console.error("[UI] Stream error:", err);
      setMessages((prev) => [...prev, withId("assistant", t.error_connection)]);
    },
  });

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    stopListening();
    autoFixCountRef.current = 0;
    playPop();
    const newMessages: ChatMessage[] = [
      ...messages,
      withId("user", inputValue),
    ];
    setMessages(newMessages);
    setInputValue("");
    submit({ messages: newMessages, currentCode, language });
  };

  const handleChipClick = (label: string) => {
    if (isLoading) return;
    stopListening();
    autoFixCountRef.current = 0;
    playChipClick();
    const newMessages: ChatMessage[] = [...messages, withId("user", label)];
    setMessages(newMessages);
    submit({ messages: newMessages, currentCode, language });
  };

  const handleReset = () => {
    onReset();
    setMessages([withId("assistant", t.greeting)]);
    setCurrentCode(defaultCode);
    setInputValue("");
    setSuggestionChips(pickRandomChips());
    autoFixCountRef.current = 0;
  };

  const showSuggestions =
    messages.length === 1 && messages[0]?.role === "assistant" && !isLoading;

  // Sync messages and code to project storage using the project's own ID
  // This ensures updates land on the correct project even if the user navigates away
  const projectId = project.id;

  useEffect(() => {
    onUpdate(projectId, { messages });
  }, [messages, onUpdate, projectId]);

  useEffect(() => {
    onUpdate(projectId, { currentCode });
  }, [currentCode, onUpdate, projectId]);

  useEffect(() => {
    const handleIframeError = (event: MessageEvent) => {
      if (event.data?.type === "iframe-error") {
        const errorMsg = event.data.message || "Unknown error";
        console.error(`[Sandbox Error] ${errorMsg}`);

        if (isLoading) return;

        if (autoFixCountRef.current >= 2) {
          console.warn("[App] Auto-fix limit reached. Stopping infinite loop.");
          const warningMessage = withId("assistant", t.error_autofix_limit);
          setMessages((prev) => [...prev, warningMessage]);
          return;
        }

        autoFixCountRef.current += 1;
        console.log(`[App] Triggering Auto-Fix (${autoFixCountRef.current}/2)`);

        playBuzzer();
        const oopsMessage = withId("assistant", t.error_oops);
        const errorContext = withId(
          "user",
          `The code you generated caused this error: ${errorMsg}. Please fix it.`,
        );
        const updatedMessages = [...messages, oopsMessage, errorContext];
        setMessages(updatedMessages);
        submit({ messages: updatedMessages, currentCode, language });
      }
    };

    window.addEventListener("message", handleIframeError);
    return () => window.removeEventListener("message", handleIframeError);
  }, [messages, currentCode, isLoading, submit, playBuzzer]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, object?.reply, isLoading]);

  return (
    <div className="w-screen h-screen bg-[#fdfbf7] flex font-sans overflow-hidden">
      {/* Confetti Burst */}
      {showConfetti && (
        <div
          data-testid="confetti-burst"
          className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
        >
          {Array.from({ length: CONFETTI_COUNT }, (_, i) => {
            const colors = [
              "var(--color-candy-pink)",
              "var(--color-candy-blue)",
              "var(--color-candy-yellow)",
              "var(--color-candy-green)",
              "var(--color-candy-purple)",
              "var(--color-candy-orange)",
            ];

            // Randomize properties for an energetic explosion
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Explode outwards and slightly upwards
            const angle = Math.random() * Math.PI * 2;
            const velocity = 20 + Math.random() * 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 30; // Upward bias

            const rot = Math.random() * 360;
            const delay = Math.random() * 0.15; // Quick burst
            const duration = 1.5 + Math.random(); // 1.5 - 2.5s

            // Random shapes and sizes
            const isCircle = Math.random() > 0.5;
            const width = 10 + Math.random() * 15;
            const height = isCircle ? width : 10 + Math.random() * 20;

            return (
              <div
                key={i}
                className="confetti-piece border-2 border-[#222] shadow-[2px_2px_0_#222]"
                style={
                  {
                    background: color,
                    borderRadius: isCircle ? "50%" : "4px",
                    width: `${width}px`,
                    height: `${height}px`,
                    "--tx": `${tx}vw`,
                    "--ty": `${ty}vh`,
                    "--rot": `${rot}deg`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      )}

      {/* LEFT PANEL: CHAT (collapsible) */}
      {isChatVisible && (
        <div
          className="h-full w-full sm:w-[26rem] lg:w-[30rem] flex-shrink-0 bg-[#fdfbf7] border-r-4 border-[#222] flex flex-col z-20 relative shadow-[8px_0px_0px_rgba(0,0,0,0.1)]"
          aria-hidden="false"
          onMouseEnter={() => inputRef.current?.focus()}
        >
          {/* Decorative shapes behind chat */}
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[20%] bg-[var(--color-candy-purple)] rounded-full opacity-30 blur-[60px] pointer-events-none"></div>

          {/* HEADER */}
          <div className="bg-[var(--color-candy-blue)] text-[#222] p-4 flex justify-between items-center border-b-4 border-[#222] z-10 shadow-[0_4px_0_#222]">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="bg-white border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                aria-label={t.aria_my_projects}
                data-testid="back-to-catalog"
              >
                <ArrowLeft size={22} className="text-[#222]" strokeWidth={3} />
              </button>
              <span
                className={`text-4xl ${isLoading ? "buddy-avatar-thinking" : "buddy-avatar"}`}
              >
                🐶
              </span>
              <span
                className="text-2xl tracking-wide font-extrabold text-[#222]"
                style={{ textShadow: "2px 2px 0px white" }}
              >
                Builder Buddy
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleLanguage}
                className={`border-2 border-[#222] px-3 py-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center gap-2 font-bold text-sm ${
                  language !== "en-US"
                    ? "bg-[var(--color-candy-green)]"
                    : "bg-white"
                }`}
                title={t.switch_language}
              >
                <Languages size={18} strokeWidth={2.5} />
                {language === "zh-TW"
                  ? "TW"
                  : language === "zh-CN"
                    ? "CN"
                    : "EN"}
              </button>
              <button
                onClick={toggleAutoSpeak}
                className={`border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none ${
                  isAutoSpeakEnabled
                    ? "bg-[var(--color-candy-purple)] text-white"
                    : "bg-white text-[#222]"
                }`}
                aria-label={
                  isAutoSpeakEnabled
                    ? t.aria_disable_voice
                    : t.aria_enable_voice
                }
              >
                <MessageSquareQuote size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={toggleMute}
                className="bg-white border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                aria-label={isMuted ? t.aria_unmute : t.aria_mute}
                data-testid="mute-toggle"
              >
                {isMuted ? (
                  <VolumeX
                    size={20}
                    className="text-[#222]"
                    strokeWidth={2.5}
                  />
                ) : (
                  <Volume2
                    size={20}
                    className="text-[#222]"
                    strokeWidth={2.5}
                  />
                )}
              </button>
              <button
                onClick={handleReset}
                className="bg-[var(--color-candy-orange)] border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none hover-wiggle"
                aria-label={t.aria_reset}
              >
                <RotateCcw
                  size={20}
                  className="text-[#222]"
                  strokeWidth={2.5}
                />
              </button>
              <button
                onClick={() => setIsChatVisible(false)}
                className="bg-[var(--color-candy-pink)] border-2 border-[#222] p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                aria-label={t.aria_hide_chat}
              >
                <X size={20} className="text-[#222]" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* MESSAGE LIST */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM4ODgiIG9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] z-10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] p-4 rounded-[1.5rem] text-[17px] leading-relaxed font-bold shadow-[4px_4px_0_#222] border-4 border-[#222] relative ${
                  msg.role === "user"
                    ? "bg-[var(--color-candy-pink)] text-[#222] self-end rounded-tr-sm msg-user"
                    : "bg-white text-[#222] self-start rounded-tl-sm msg-buddy"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="absolute top-[-15px] left-[-15px] text-2xl rotate-[-15deg] drop-shadow-sm">
                    ✨
                  </div>
                )}
                {msg.content}
              </div>
            ))}

            {/* REAL-TIME STREAMING REPLY */}
            {isLoading && object?.reply && (
              <div className="max-w-[85%] p-4 rounded-[1.5rem] text-[17px] leading-relaxed font-bold shadow-[4px_4px_0_#222] border-4 border-[#222] bg-white text-[#222] self-start rounded-tl-sm msg-buddy relative">
                <div className="absolute top-[-15px] left-[-15px] text-2xl rotate-[-15deg] drop-shadow-sm animate-pulse">
                  ✨
                </div>
                {object.reply}
                <span className="inline-block w-2 h-4 ml-1 bg-[#222] animate-ping rounded-full"></span>
              </div>
            )}
            {/* Thinking indicator if no reply yet */}
            {isLoading && !object?.reply && (
              <div className="max-w-[85%] p-4 rounded-[1.5rem] text-[17px] leading-relaxed font-bold shadow-[4px_4px_0_#222] border-4 border-[#222] bg-white text-[#222] self-start rounded-tl-sm msg-buddy flex items-center gap-2">
                <span
                  className="animate-bounce inline-block"
                  style={{ animationDelay: "0ms" }}
                >
                  .
                </span>
                <span
                  className="animate-bounce inline-block"
                  style={{ animationDelay: "150ms" }}
                >
                  .
                </span>
                <span
                  className="animate-bounce inline-block"
                  style={{ animationDelay: "300ms" }}
                >
                  .
                </span>
                <span className="ml-2 text-gray-500">{t.thinking}</span>
              </div>
            )}

            {/* SUGGESTION CHIPS */}
            {showSuggestions && (
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-2 ml-2">
                  <p className="text-[#222] text-sm font-extrabold ml-2 uppercase tracking-wider bg-white/50 w-fit px-3 py-1 rounded-full border-2 border-[#222]/20">
                    {t.magic_button_prompt}
                  </p>

                  <button
                    onClick={() => setSuggestionChips(pickRandomChips())}
                    className="bg-white border-2 border-[#222] px-3 py-1 rounded-full text-sm font-bold text-[#222] hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                    aria-label="Shuffle suggestions"
                    data-testid="shuffle-chips"
                  >
                    🔀 More ideas
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {suggestionChips.map((chip, index) => {
                    const bgColors = [
                      "bg-[var(--color-candy-blue)]",
                      "bg-[var(--color-candy-yellow)]",
                      "bg-[var(--color-candy-orange)]",
                      "bg-[var(--color-candy-green)]",
                    ];
                    return (
                      <button
                        key={chip.label}
                        onClick={() => handleChipClick(chip.label)}
                        className={`chip-enter ${bgColors[index % bgColors.length]} text-[#222] border-4 border-[#222] px-4 py-3 rounded-[1.5rem] shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none hover:shadow-[6px_6px_0_#222] transition-all text-[15px] font-bold flex items-center btn-squish`}
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <span className="text-2xl mr-2 drop-shadow-sm">
                          {chip.emoji}
                        </span>
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 bg-[var(--color-candy-yellow)] border-t-4 border-[#222] flex gap-3 shadow-[0_-4px_0_#222] z-20">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`border-4 border-[#222] p-3 rounded-full shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center cursor-pointer btn-squish ${
                isListening
                  ? "bg-[var(--color-candy-pink)] animate-pulse"
                  : "bg-white"
              }`}
              aria-label={
                isListening ? t.aria_disable_voice : t.aria_enable_voice
              }
            >
              {isListening ? (
                <MicOff size={28} strokeWidth={2.5} className="text-[#222]" />
              ) : (
                <Mic size={28} strokeWidth={2.5} className="text-[#222]" />
              )}
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder={t.input_placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className={`flex-1 bg-white text-[#222] px-5 py-3 rounded-[2rem] border-4 border-[#222] focus:outline-none placeholder-gray-500 text-[17px] font-bold transition-all input-glow ${
                inputValue.trim() ? "input-glow-active" : ""
              }`}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="bg-[var(--color-candy-green)] text-[#222] border-4 border-[#222] p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center cursor-pointer btn-squish"
              aria-label={t.aria_send}
            >
              <Send size={28} className="ml-1" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* RIGHT PANEL: PREVIEW + CONTROLS */}
      <div
        className="flex-1 relative bg-[#fdfbf7] overflow-hidden flex flex-col p-4 sm:p-8"
        onMouseEnter={() => iframeRef.current?.focus()}
      >
        {/* Decorative Grid Background in Preview when empty or loading */}
        <div className="absolute inset-0 bg-[radial-gradient(#ff6b6b_1px,transparent_1px),radial-gradient(#4ecdc4_1px,transparent_1px)] bg-[size:40px_40px] bg-[position:0_0,20px_20px] opacity-[0.15] pointer-events-none z-0"></div>

        {/* SHOW CHAT BUTTON (visible when chat is hidden) */}
        {!isChatVisible && (
          <div className="absolute top-8 left-8 z-30">
            <button
              onClick={() => setIsChatVisible(true)}
              className="bg-[var(--color-candy-pink)] border-4 border-[#222] text-[#222] p-3 rounded-full shadow-[4px_4px_0_#222] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center btn-squish hover-wiggle"
              aria-label={t.aria_show_chat}
            >
              <MessageCircle size={28} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* PREVIEW SANDBOX */}
        <div className="flex-1 w-full h-full relative z-10 bg-white border-4 border-[#222] rounded-[2rem] overflow-hidden shadow-[8px_8px_0_#222]">
          <iframe
            ref={iframeRef}
            title="Preview Sandbox"
            srcDoc={injectErrorCatcher(currentCode)}
            className={`w-full h-full border-none transition-all duration-300 ${
              isLoading
                ? "opacity-30 blur-[2px] scale-105"
                : "opacity-100 scale-100"
            }`}
            sandbox="allow-scripts"
          />
        </div>

        {/* FUN BUILDING MODE OVERLAY */}
        {isLoading && (
          <div
            data-testid="hacker-mode-overlay"
            className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center overflow-hidden pointer-events-none"
          >
            <div className="absolute flex flex-col items-center justify-center z-20">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-64 h-64 bg-[var(--color-candy-yellow)] rounded-full blur-[40px] animate-pulse opacity-80"></div>
                <div
                  className="absolute w-48 h-48 bg-[var(--color-candy-pink)] rounded-full blur-[30px] animate-ping opacity-60"
                  style={{ animationDuration: "2s" }}
                ></div>
                <div className="relative z-10 bg-white border-4 border-[#222] p-6 rounded-full shadow-[8px_8px_0_#222] flex items-center justify-center animate-bounce">
                  <Sparkles
                    className="text-[var(--color-candy-blue)]"
                    size={72}
                    strokeWidth={2}
                    fill="var(--color-candy-blue)"
                  />
                </div>
              </div>
              <p
                className="mt-10 text-[#222] text-5xl font-extrabold tracking-widest animate-pulse"
                style={{ textShadow: "4px 4px 0px var(--color-candy-blue)" }}
              >
                {t.overlay_building}
              </p>

              {/* Floating code fragments */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                <pre
                  className="text-[var(--color-candy-purple)] text-2xl font-bold font-mono opacity-50 absolute left-[10%] top-[20%] animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                >
                  &lt;div&gt;
                </pre>
                <pre
                  className="text-[var(--color-candy-green)] text-3xl font-bold font-mono opacity-50 absolute right-[20%] top-[30%] animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >{`{}`}</pre>
                <pre
                  className="text-[var(--color-candy-orange)] text-2xl font-bold font-mono opacity-50 absolute left-[30%] bottom-[20%] animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                >
                  function()
                </pre>
                <pre
                  className="text-[var(--color-candy-pink)] text-4xl font-bold font-mono opacity-50 absolute right-[10%] bottom-[30%] animate-bounce"
                  style={{ animationDelay: "0.7s" }}
                >
                  const
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
