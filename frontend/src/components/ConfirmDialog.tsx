import { useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  cancelLabel: string;
}

export function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(dialogRef, isOpen);

  // Auto-focus cancel button (safe default for destructive actions)
  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key dismisses
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmation"
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onCancel}
        data-testid="confirm-dialog-scrim"
      />

      {/* Dialog card */}
      <div
        ref={dialogRef}
        className="relative bg-white border-4 border-[#222] rounded-2xl p-6 shadow-[6px_6px_0_#222] max-w-[340px] w-[90%] z-10"
      >
        <p className="text-[#222] font-bold text-base mb-5 text-center">
          {message}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            className="px-5 py-2 rounded-full font-extrabold text-sm text-[#222] bg-gray-200 border-2 border-[#222] shadow-[3px_3px_0_#222] active:translate-y-[3px] active:shadow-none transition-all"
            data-testid="confirm-dialog-cancel"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-full font-extrabold text-sm text-white bg-[var(--color-candy-pink)] border-2 border-[#222] shadow-[3px_3px_0_#222] active:translate-y-[3px] active:shadow-none transition-all"
            data-testid="confirm-dialog-confirm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
