import { useState, useEffect } from "react";
import { X, Play, RotateCcw } from "lucide-react";

interface CodePanelProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
  onRunCode: (code: string) => void;
}

export function CodePanel({
  code,
  isOpen,
  onClose,
  onRunCode,
}: CodePanelProps) {
  const [editableCode, setEditableCode] = useState(code);

  // When AI generates new code, update the editable code
  useEffect(() => {
    setEditableCode(code);
  }, [code]);

  const handleRun = () => {
    onRunCode(editableCode);
  };

  const handleReset = () => {
    setEditableCode(code);
  };

  return (
    <div
      data-testid="code-panel"
      className={`fixed top-0 right-0 h-full z-40 flex flex-col
        w-full sm:w-[480px]
        bg-[#0d0d1a]/95 backdrop-blur-xl
        border-l-2 border-[#a855f7]
        shadow-[-10px_0_40px_rgba(168,85,247,0.3)]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white p-4 flex justify-between items-center font-bold shadow-md flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{"</>"}</span>
          <span className="text-lg font-extrabold tracking-tight">
            Look Inside
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Panel"
          className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        data-testid="code-panel-textarea"
        className="flex-1 w-full bg-[#0a0a1a] text-[#39ff14] font-mono text-xs leading-relaxed
          p-4 resize-none focus:outline-none
          border-b-2 border-[#a855f7]/30
          placeholder-gray-600"
        value={editableCode}
        onChange={(e) => setEditableCode(e.target.value)}
        spellCheck={false}
        aria-label="Editable code"
      />

      {/* Footer Buttons */}
      <div className="p-4 bg-[#0a0a1a] border-t-2 border-[#a855f7]/20 flex gap-3 flex-shrink-0">
        <button
          onClick={handleReset}
          aria-label="Reset to AI Version"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl
            bg-[#1a1a3a] text-[#a855f7]
            border-2 border-[#a855f7]/50
            hover:bg-[#a855f7]/20 hover:border-[#a855f7]
            active:scale-95 transition-all font-bold text-sm
            shadow-[0_4px_0_rgba(168,85,247,0.3)] active:shadow-none active:translate-y-[4px]"
        >
          <RotateCcw size={16} />
          Reset to AI Version
        </button>
        <button
          onClick={handleRun}
          aria-label="Run My Code"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-2xl
            bg-gradient-to-r from-[#39ff14] to-[#2ab810] text-black
            border-2 border-[#39ff14]
            hover:scale-105 active:scale-95 transition-all font-extrabold text-sm
            shadow-[0_4px_0_rgba(57,255,20,0.4)] active:shadow-none active:translate-y-[4px]"
        >
          <Play size={16} />
          Run My Code
        </button>
      </div>
    </div>
  );
}
