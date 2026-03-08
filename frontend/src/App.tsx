import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, RotateCcw } from "lucide-react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import "./index.css";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content: "Hi! I'm your builder buddy. What do you want to create today?",
  },
];

const DEFAULT_CODE = `<!DOCTYPE html>
<html>
<head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: sans-serif;
    overflow: hidden;
  }
  .welcome { text-align: center; z-index: 2; position: relative; }
  .welcome h1 {
    font-size: 2.5rem;
    background: linear-gradient(90deg, #00f0ff, #39ff14, #ff007f);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: glow-text 3s ease-in-out infinite alternate;
  }
  .welcome p { color: #888; margin-top: 12px; font-size: 1.1rem; }
  @keyframes glow-text {
    from { filter: brightness(1); }
    to { filter: brightness(1.3); }
  }
  .particle {
    position: absolute;
    width: 4px; height: 4px;
    background: #00f0ff;
    border-radius: 50%;
    opacity: 0.6;
    animation: drift 6s ease-in-out infinite;
  }
  @keyframes drift {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
    50% { transform: translateY(-40px) translateX(20px); opacity: 0.8; }
  }
</style></head>
<body>
  <div class="welcome">
    <h1>What will YOU create today?</h1>
    <p>Tell your builder buddy your idea</p>
  </div>
  <script>
    for(let i=0;i<15;i++){
      const p=document.createElement('div');
      p.className='particle';
      p.style.left=Math.random()*100+'%';
      p.style.top=Math.random()*100+'%';
      p.style.animationDelay=Math.random()*6+'s';
      p.style.animationDuration=(4+Math.random()*4)+'s';
      p.style.background=['#00f0ff','#39ff14','#ff007f','#a855f7','#ffd700'][Math.floor(Math.random()*5)];
      document.body.appendChild(p);
    }
  </script>
</body>
</html>`;

const SUGGESTION_CHIPS = [
  { emoji: "🏀", label: "Make a bouncing ball game" },
  { emoji: "🎨", label: "Create a neon paint app" },
  { emoji: "⏰", label: "Build a glowing clock" },
  { emoji: "🚀", label: "Design a space adventure" },
];

const STORAGE_KEYS = {
  messages: "inspiror-messages",
  currentCode: "inspiror-currentCode",
} as const;

const generationSchema = z.object({
  reply: z.string(),
  code: z.string(),
});

const ERROR_CATCHER_SCRIPT = `<script>window.onerror=function(msg,src,line,col,err){window.parent.postMessage({type:"iframe-error",message:msg+" (line "+line+")"},"*");return true;};</script>`;

const CONFETTI_COUNT = 20;

function injectErrorCatcher(code: string): string {
  const headClose = code.indexOf("</head>");
  if (headClose !== -1) {
    return code.slice(0, headClose) + ERROR_CATCHER_SCRIPT + code.slice(headClose);
  }
  const bodyOpen = code.indexOf("<body");
  if (bodyOpen !== -1) {
    return code.slice(0, bodyOpen) + ERROR_CATCHER_SCRIPT + code.slice(bodyOpen);
  }
  const htmlOpen = code.toLowerCase().indexOf("<html");
  if (htmlOpen !== -1) {
    const htmlEnd = code.indexOf(">", htmlOpen) + 1;
    return code.slice(0, htmlEnd) + ERROR_CATCHER_SCRIPT + code.slice(htmlEnd);
  }
  const doctypeEnd = code.toLowerCase().indexOf("<!doctype html>");
  if (doctypeEnd !== -1) {
    return code.slice(0, doctypeEnd + 15) + ERROR_CATCHER_SCRIPT + code.slice(doctypeEnd + 15);
  }
  return ERROR_CATCHER_SCRIPT + code;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage(STORAGE_KEYS.messages, DEFAULT_MESSAGES),
  );
  const [inputValue, setInputValue] = useState("");
  const [currentCode, setCurrentCode] = useState(
    () => localStorage.getItem(STORAGE_KEYS.currentCode) || DEFAULT_CODE,
  );
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevIsLoadingRef = useRef(false);
  const autoFixCountRef = useRef(0); // Tracks consecutive auto-fixes to prevent infinite loops

  const { object, submit, isLoading } = useObject({
    api: "http://localhost:3001/api/generate",
    schema: generationSchema,
    onFinish({ object: finalObj }) {
      // Reset the auto-fix counter ONLY when a user manually sends a message, 
      // but we don't have direct access to that here. We handle it in handleSend.
      if (finalObj?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: finalObj.reply as string },
        ]);
      }
      if (finalObj?.code) {
        setCurrentCode(finalObj.code as string);
      }
    },
    onError(err) {
      console.error("[UI] Stream error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops, my connection broke! Can we try again?",
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    autoFixCountRef.current = 0; // Reset auto-fix protection on manual user input
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: inputValue },
    ];
    setMessages(newMessages);
    setInputValue("");
    submit({ messages: newMessages, currentCode });
  };

  const handleChipClick = (label: string) => {
    if (isLoading) return;
    autoFixCountRef.current = 0; // Reset auto-fix protection on manual user input
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: label },
    ];
    setMessages(newMessages);
    submit({ messages: newMessages, currentCode });
  };

  const handleReset = () => {
    setMessages(DEFAULT_MESSAGES);
    setCurrentCode(DEFAULT_CODE);
    setInputValue("");
    autoFixCountRef.current = 0;
  };

  const showSuggestions =
    messages.length === 1 && messages[0]?.role === "assistant" && !isLoading;

  // Confetti trigger on generation complete
  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    const handleIframeError = (event: MessageEvent) => {
      if (event.data?.type === "iframe-error") {
        const errorMsg = event.data.message || "Unknown error";
        console.error(`[Sandbox Error] ${errorMsg}`);
        
        if (isLoading) return;

        if (autoFixCountRef.current >= 2) {
          console.warn("[App] Auto-fix limit reached. Stopping infinite loop.");
          const warningMessage: ChatMessage = {
            role: "assistant",
            content: "Hmm, this bug is really tricky! It keeps breaking. What should we try instead?",
          };
          setMessages((prev) => [...prev, warningMessage]);
          return; // Abort automatic submit
        }

        autoFixCountRef.current += 1;
        console.log(`[App] Triggering Auto-Fix (${autoFixCountRef.current}/2)`);

        const oopsMessage: ChatMessage = {
          role: "assistant",
          content: "Oops, I made a little mistake! Let me fix that real quick...",
        };
        const errorContext: ChatMessage = {
          role: "user",
          content: `The code you generated caused this error: ${errorMsg}. Please fix it.`,
        };
        const updatedMessages = [...messages, oopsMessage, errorContext];
        setMessages(updatedMessages);
        submit({ messages: updatedMessages, currentCode });
      }
    };

    window.addEventListener("message", handleIframeError);
    return () => window.removeEventListener("message", handleIframeError);
  }, [messages, currentCode, isLoading, submit]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.currentCode, currentCode);
  }, [currentCode]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, object?.reply, isLoading]);

  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden font-sans">
      {/* FULL SCREEN PREVIEW SANDBOX */}
      <div className="absolute inset-0 z-0 bg-[#000]">
        <iframe
          title="Preview Sandbox"
          srcDoc={injectErrorCatcher(currentCode)}
          className={`w-full h-full border-none bg-white transition-opacity duration-500 ${
            isLoading ? "opacity-20 blur-sm scale-105" : "opacity-100 scale-100"
          }`}
          sandbox="allow-scripts"
        />
      </div>

      {/* VIVID HACKER MODE OVERLAY */}
      {isLoading && (
        <div
          data-testid="hacker-mode-overlay"
          className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center overflow-hidden pointer-events-none"
        >
          <div className="absolute inset-0 w-full h-full p-8 overflow-hidden pointer-events-none opacity-80 mix-blend-screen">
            <pre className="text-[#39ff14] text-[10px] sm:text-sm font-mono whitespace-pre-wrap leading-tight tracking-wider shadow-[#39ff14] drop-shadow-lg">
              {object?.code || "INITIALIZING MATRIX..."}
            </pre>
          </div>

          {/* Pulsing Core */}
          <div className="absolute flex flex-col items-center justify-center z-20 mix-blend-screen">
            <div className="relative flex items-center justify-center">
               <div className="absolute w-48 h-48 bg-[#00f0ff] rounded-full blur-[60px] animate-pulse opacity-60"></div>
               <div className="absolute w-32 h-32 bg-[#ff007f] rounded-full blur-[40px] animate-ping opacity-60"></div>
               <Sparkles
                  className="text-[#ffffff] animate-spin relative z-10 drop-shadow-[0_0_15px_#fff]"
                  size={64}
                />
            </div>
            <p className="mt-8 text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#39ff14] text-4xl font-extrabold tracking-[0.3em] animate-pulse drop-shadow-[0_0_10px_#00f0ff]">
              BUILDING
            </p>
          </div>
        </div>
      )}

      {/* Confetti Burst */}
      {showConfetti && (
        <div data-testid="confetti-burst">
          {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
            <div key={i} className="confetti-piece" />
          ))}
        </div>
      )}

      {/* FLOATING CHAT TOGGLE BUTTON */}
      {!isChatVisible && (
        <button
          onClick={() => setIsChatVisible(true)}
          className="absolute bottom-6 right-6 z-50 bg-gradient-to-r from-[#ff007f] to-[#ff003c] text-white p-5 rounded-full shadow-[0_0_25px_#ff007f] hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Show Chat"
        >
          <MessageCircle size={36} className="drop-shadow-[0_0_5px_#fff]" />
        </button>
      )}

      {/* FLOATING CHAT WINDOW */}
      {isChatVisible && (
        <div className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-[#0d0d1a]/90 backdrop-blur-xl border-2 border-[#00f0ff] rounded-3xl flex flex-col shadow-[0_0_40px_rgba(0,240,255,0.4)] z-50 overflow-hidden transition-all duration-300">
          {/* HEADER with Animated Buddy Avatar */}
          <div className="bg-gradient-to-r from-[#00f0ff] to-[#0099ff] text-black p-4 flex justify-between items-center font-bold shadow-md">
            <div className="flex items-center gap-3">
              <span
                className={`text-3xl filter drop-shadow-md ${isLoading ? "buddy-avatar-thinking" : "buddy-avatar"}`}
              >
                🐶
              </span>
              <span className="text-xl tracking-tight font-extrabold text-black/90">Builder Buddy</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Reset"
              >
                <RotateCcw size={20} className="text-black" />
              </button>
              <button
                onClick={() => setIsChatVisible(false)}
                className="bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Hide Chat"
              >
                <X size={24} className="text-black" />
              </button>
            </div>
          </div>

          {/* MESSAGE LIST with Slide-In Animations */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-gradient-to-b from-transparent to-[#0a0a1a]/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-4 rounded-3xl text-[15px] leading-relaxed shadow-lg ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#ff007f] to-[#cc0066] text-white self-end rounded-tr-sm shadow-[0_0_15px_rgba(255,0,127,0.4)] msg-user"
                    : "bg-gradient-to-br from-[#1a1a3a] to-[#2a2a4a] text-[#39ff14] self-start border-2 border-[#39ff14]/50 rounded-tl-sm shadow-[0_0_15px_rgba(57,255,20,0.1)] font-medium msg-buddy"
                }`}
              >
                {msg.role === "assistant" && msg.content.includes("Hi!") && (
                  <span className="text-2xl mr-2 align-middle">👋</span>
                )}
                {msg.content}
              </div>
            ))}

            {/* REAL-TIME STREAMING REPLY */}
            {isLoading && object?.reply && (
              <div className="max-w-[85%] p-4 rounded-3xl text-[15px] leading-relaxed shadow-lg bg-gradient-to-br from-[#1a1a3a] to-[#2a2a4a] text-[#00f0ff] self-start border-2 border-[#00f0ff] rounded-tl-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] font-medium animate-pulse msg-buddy">
                {object.reply}
                <span className="inline-block w-2 h-4 ml-1 bg-[#00f0ff] animate-ping"></span>
              </div>
            )}

            {/* SUGGESTION CHIPS with Staggered Entrance */}
            {showSuggestions && (
              <div className="flex flex-col gap-3 mt-4">
                <p className="text-[#00f0ff]/70 text-sm font-bold ml-2 uppercase tracking-wider">Try a Magic Button!</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTION_CHIPS.map((chip, index) => (
                    <button
                      key={chip.label}
                      onClick={() => handleChipClick(chip.label)}
                      className="chip-enter bg-gradient-to-r from-[#1a1a3a] to-[#2a2a4a] text-[#00f0ff] border-2 border-[#00f0ff]/50 px-4 py-3 rounded-2xl hover:bg-[#00f0ff] hover:text-black hover:border-[#00f0ff] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_0_rgba(0,240,255,0.3)] active:shadow-none active:translate-y-[4px] text-sm font-bold flex items-center"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-xl mr-2">{chip.emoji}</span>
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA with Glow Effect */}
          <div className="p-4 bg-[#0a0a1a] border-t-2 border-[#00f0ff]/20 flex gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] relative z-10">
            <input
              type="text"
              placeholder="Type your grand idea..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className={`flex-1 bg-[#111122] text-white px-5 py-3 rounded-full border-2 border-[#ff007f]/50 focus:outline-none focus:border-[#ff007f] focus:shadow-[0_0_15px_rgba(255,0,127,0.5)] placeholder-gray-500 text-[15px] font-medium transition-all input-glow ${
                inputValue.trim() ? "input-glow-active" : ""
              }`}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-to-br from-[#39ff14] to-[#2ab810] text-black p-3 rounded-full hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 shadow-[0_4px_0_rgba(42,184,16,0.5)] hover:shadow-[0_4px_15px_rgba(57,255,20,0.6)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center cursor-pointer"
              aria-label="Send"
            >
              <Send size={24} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
