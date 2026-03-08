import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, RotateCcw } from "lucide-react";
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

const DEFAULT_CODE =
  '<!DOCTYPE html><html><body style="background:#111; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; font-family:sans-serif;"><h1>Your creation will appear here!</h1></body></html>';

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

const ERROR_CATCHER_SCRIPT = `<script>window.onerror=function(msg,src,line,col,err){window.parent.postMessage({type:"iframe-error",message:msg+" (line "+line+")"},"*");return true;};</script>`;

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);

  const messagesRef = useRef(messages);
  const currentCodeRef = useRef(currentCode);
  messagesRef.current = messages;
  currentCodeRef.current = currentCode;

  const sendToApi = useCallback(
    async (apiMessages: ChatMessage[], code: string) => {
      setIsGenerating(true);
      try {
        const response = await fetch("http://localhost:3001/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, currentCode: code }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessages([
            ...apiMessages,
            { role: "assistant", content: data.reply },
          ]);
          if (data.code) {
            setCurrentCode(data.code);
          }
        } else {
          setMessages([
            ...apiMessages,
            {
              role: "assistant",
              content:
                "Oops, I made a little mistake! Let me fix that real quick...",
            },
          ]);
        }
      } catch (error) {
        console.error(error);
        setMessages([
          ...apiMessages,
          {
            role: "assistant",
            content: "Uh oh, my connection broke! Can we try again?",
          },
        ]);
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: inputValue },
    ];
    setMessages(newMessages);
    setInputValue("");
    await sendToApi(newMessages, currentCode);
  };

  const handleChipClick = async (label: string) => {
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: label },
    ];
    setMessages(newMessages);
    await sendToApi(newMessages, currentCode);
  };

  const handleReset = () => {
    setMessages(DEFAULT_MESSAGES);
    setCurrentCode(DEFAULT_CODE);
    setInputValue("");
  };

  const showSuggestions =
    messages.length === 1 && messages[0]?.role === "assistant" && !isGenerating;

  useEffect(() => {
    const handleIframeError = (event: MessageEvent) => {
      if (event.data?.type === "iframe-error") {
        const errorMsg = event.data.message || "Unknown error";
        const oopsMessage: ChatMessage = {
          role: "assistant",
          content:
            "Oops, I made a little mistake! Let me fix that real quick...",
        };
        const errorContext: ChatMessage = {
          role: "user",
          content: `The code you generated caused this error: ${errorMsg}. Please fix it.`,
        };
        const updatedMessages = [
          ...messagesRef.current,
          oopsMessage,
          errorContext,
        ];
        setMessages(updatedMessages);
        sendToApi(updatedMessages, currentCodeRef.current);
      }
    };

    window.addEventListener("message", handleIframeError);
    return () => window.removeEventListener("message", handleIframeError);
  }, [sendToApi]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.currentCode, currentCode);
  }, [currentCode]);

  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden font-sans">
      {/* FULL SCREEN PREVIEW SANDBOX */}
      <div className="absolute inset-0 z-0">
        <iframe
          title="Preview Sandbox"
          srcDoc={injectErrorCatcher(currentCode)}
          className="w-full h-full border-none bg-white"
          sandbox="allow-scripts"
        />
      </div>

      {/* FLOATING CHAT TOGGLE BUTTON */}
      {!isChatVisible && (
        <button
          onClick={() => setIsChatVisible(true)}
          className="absolute bottom-6 right-6 z-50 bg-[#ff007f] text-white p-4 rounded-full shadow-[0_0_15px_#ff007f] hover:bg-pink-600 transition-all flex items-center justify-center"
          aria-label="Show Chat"
        >
          <MessageCircle size={32} />
        </button>
      )}

      {/* FLOATING CHAT WINDOW */}
      {isChatVisible && (
        <div className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-[#1a1a2e]/90 backdrop-blur-md border-2 border-[#00f0ff] rounded-2xl flex flex-col shadow-[0_0_30px_rgba(0,240,255,0.3)] z-50 overflow-hidden transition-all duration-300">
          {/* HEADER */}
          <div className="bg-[#00f0ff] text-black p-3 flex justify-between items-center font-bold">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐶</span>
              <span>Builder Buddy</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="text-black hover:bg-black/20 p-1 rounded transition-colors"
                aria-label="Reset"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={() => setIsChatVisible(false)}
                className="text-black hover:bg-black/20 p-1 rounded transition-colors"
                aria-label="Hide Chat"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* MESSAGE LIST */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[#ff007f] text-white self-end rounded-tr-sm shadow-[0_0_10px_#ff007f]"
                    : "bg-[#2a2a4a] text-[#39ff14] self-start border border-[#39ff14] rounded-tl-sm shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                }`}
              >
                {msg.role === "assistant" && msg.content.includes("Hi!") && (
                  <span className="text-xl mr-2">👋</span>
                )}
                {msg.content}
              </div>
            ))}

            {/* SUGGESTION CHIPS */}
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleChipClick(chip.label)}
                    className="bg-[#2a2a4a] text-[#00f0ff] border border-[#00f0ff] px-4 py-2 rounded-full hover:bg-[#00f0ff] hover:text-black transition-all shadow-[0_0_8px_rgba(0,240,255,0.3)] text-sm font-medium"
                  >
                    <span className="mr-1">{chip.emoji}</span>
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* LOADING STATE */}
            {isGenerating && (
              <div className="bg-[#2a2a4a] text-[#00f0ff] self-start border border-[#00f0ff] p-3 rounded-2xl rounded-tl-sm shadow-[0_0_15px_#00f0ff] flex items-center gap-3 animate-pulse">
                <Sparkles className="animate-spin" size={20} />
                <span className="font-bold tracking-wider">Building...</span>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-3 bg-[#111122] border-t border-[#00f0ff]/30 flex gap-2">
            <input
              type="text"
              placeholder="Type your idea here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent text-white px-4 py-2 rounded-full border border-[#00f0ff] focus:outline-none focus:shadow-[0_0_10px_#00f0ff] placeholder-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={isGenerating || !inputValue.trim()}
              className="bg-[#39ff14] text-black p-3 rounded-full hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_#39ff14] transition-all flex items-center justify-center"
              aria-label="Send"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
