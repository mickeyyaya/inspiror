import type { TranslationKeys } from "../i18n/translations";

interface SessionRecapProps {
  isOpen: boolean;
  onDismiss: () => void;
  blocksUsed: number;
  messagesExchanged: number;
  buildsThisSession: number;
  tipsEarned: number;
  blockOrigins: { ai: number; template: number; remix: number };
  buddyEmoji: string;
  buddyName: string;
  t: TranslationKeys;
}

export function SessionRecap({
  isOpen,
  onDismiss,
  blocksUsed,
  messagesExchanged,
  buildsThisSession,
  tipsEarned,
  blockOrigins,
  buddyEmoji,
  buddyName,
  t,
}: SessionRecapProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      data-testid="session-recap"
      onClick={onDismiss}
    >
      <div
        className="bg-white border-4 border-[#222] rounded-[2rem] shadow-[8px_8px_0_#222] p-6 max-w-sm w-full mx-4 transform animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <span className="text-6xl block mb-2">{buddyEmoji}</span>
          <h2 className="text-2xl font-extrabold text-[#222]">
            {t.recap_title}
          </h2>
          <p className="text-sm text-gray-500 font-bold mt-1">
            {buddyName} {t.recap_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard
            emoji="🏗️"
            value={buildsThisSession}
            label={t.recap_builds}
          />
          <StatCard
            emoji="💬"
            value={messagesExchanged}
            label={t.recap_messages}
          />
          <StatCard emoji="🧩" value={blocksUsed} label={t.recap_blocks} />
          <StatCard emoji="💡" value={tipsEarned} label={t.recap_tips} />
        </div>

        {(blockOrigins.ai > 0 ||
          blockOrigins.template > 0 ||
          blockOrigins.remix > 0) && (
          <div className="bg-[var(--color-candy-purple)]/10 border-2 border-[#222] rounded-xl p-3 mb-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#7c3aed] mb-2">
              {t.recap_origins}
            </p>
            <div className="flex gap-3 text-sm font-bold">
              {blockOrigins.ai > 0 && (
                <span className="bg-[var(--color-candy-blue)] border-2 border-[#222] px-2 py-1 rounded-full text-xs">
                  🤖 {blockOrigins.ai} AI
                </span>
              )}
              {blockOrigins.template > 0 && (
                <span className="bg-[var(--color-candy-yellow)] border-2 border-[#222] px-2 py-1 rounded-full text-xs">
                  📋 {blockOrigins.template} {t.recap_template}
                </span>
              )}
              {blockOrigins.remix > 0 && (
                <span className="bg-[var(--color-candy-green)] border-2 border-[#222] px-2 py-1 rounded-full text-xs">
                  🎨 {blockOrigins.remix} {t.recap_remix}
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="w-full bg-[var(--color-candy-green)] border-4 border-[#222] text-[#222] py-3 rounded-2xl font-extrabold text-lg shadow-[3px_3px_0_#222] active:translate-y-[3px] active:shadow-none transition-all hover-wiggle"
          data-testid="recap-dismiss"
        >
          {t.recap_awesome}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-gray-50 border-2 border-[#222] rounded-xl p-3 text-center">
      <span className="text-2xl block">{emoji}</span>
      <span className="text-2xl font-extrabold text-[#222] block">{value}</span>
      <span className="text-xs font-bold text-gray-500">{label}</span>
    </div>
  );
}
