import { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  FolderOpen,
  Clock,
  Languages,
  Pencil,
  Palette,
} from "lucide-react";
import type { Project } from "../types/project";
import { translations } from "../i18n/translations";
import type { VoiceLanguage } from "../hooks/useVoice";
import { useTheme } from "../hooks/useTheme";
import {
  STARTER_TEMPLATES,
  type StarterTemplate,
} from "../constants/starterTemplates";
import { LESSON_PLANS, type LessonPlan } from "../constants/lessonPlans";
import { ConfirmDialog } from "./ConfirmDialog";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { BUDDY_AVATARS } from "../types/achievements";
import { ThemeSelector } from "./ThemeSelector";
import {
  getTodayChallenge,
  isChallengeCompleted,
} from "../constants/dailyChallenges";

interface ProjectCatalogProps {
  projects: Project[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onCreateFromTemplate: (template: StarterTemplate) => void;
  onCreateFromLessonPlan?: (plan: LessonPlan) => void;
  onRename?: (id: string, title: string) => void;
  onAcceptChallenge?: (prompt: string) => void;
  language: VoiceLanguage;
  onToggleLanguage: () => void;
  streakDays?: number;
}

export function ProjectCatalog({
  projects,
  onOpen,
  onDelete,
  onCreate,
  onCreateFromTemplate,
  onCreateFromLessonPlan,
  onRename,
  onAcceptChallenge,
  language,
  onToggleLanguage,
  streakDays,
}: ProjectCatalogProps) {
  const t = translations[language];
  const { themeId, setThemeId } = useTheme();
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  const skillStats = useMemo(() => {
    try {
      const stored = localStorage.getItem("inspiror-achievements");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.stats ?? null;
      }
    } catch {
      // ignore
    }
    return null;
  }, []);
  const todayChallenge = useMemo(() => getTodayChallenge(), []);
  const challengeCompleted = useMemo(
    () => isChallengeCompleted(todayChallenge.id),
    [todayChallenge.id],
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) renameInputRef.current?.focus();
  }, [editingId]);

  const startRename = (project: Project) => {
    setEditingId(project.id);
    setEditingTitle(project.title);
  };

  const commitRename = () => {
    if (editingId && editingTitle.trim()) {
      onRename?.(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return t.time_just_now;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return `${minutes} ${minutes === 1 ? t.time_min_ago : t.time_mins_ago}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
      return `${hours} ${hours === 1 ? t.time_hour_ago : t.time_hours_ago}`;
    const days = Math.floor(hours / 24);
    if (days < 30)
      return `${days} ${days === 1 ? t.time_day_ago : t.time_days_ago}`;
    return t.last_edited;
  };

  const templateCardColors = [
    "bg-[var(--color-candy-pink)]",
    "bg-[var(--color-candy-blue)]",
    "bg-[var(--color-candy-yellow)]",
    "bg-[var(--color-candy-green)]",
    "bg-[var(--color-candy-purple)]",
    "bg-[var(--color-candy-orange)]",
  ];

  return (
    <div className="w-screen h-dvh bg-transparent flex flex-col overflow-hidden relative">
      {/* Playful Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[var(--color-candy-yellow)] rounded-full opacity-20 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[var(--color-candy-pink)] rounded-full opacity-20 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 border-b-4 border-[var(--color-candy-yellow)] bg-white/50 backdrop-blur-md z-10 shadow-sm rounded-b-3xl flex-wrap sm:flex-nowrap">
        {/* Logo + Title */}
        <img
          src="/assets/app-icon.png"
          alt="Inspiror Buddy"
          className="w-10 h-10 sm:w-12 sm:h-12 buddy-avatar rounded-xl border-2 border-[#222] shadow-[2px_2px_0_#222] flex-shrink-0"
        />
        <div className="flex-shrink-0">
          <h1
            className="text-xl sm:text-2xl font-extrabold text-[#333] tracking-wide leading-tight"
            style={{ textShadow: "1px 1px 0px var(--color-candy-yellow)" }}
          >
            {t.catalog_title}
          </h1>
          <p className="text-gray-600 font-bold text-xs sm:text-sm">
            {projects.length === 0
              ? t.tell_buddy
              : `${projects.length} ${projects.length === 1 ? t.project_count_one : t.project_count_many}`}
          </p>
        </div>

        {/* Inline badges row */}
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {streakDays !== undefined && streakDays >= 2 && (
            <span
              className="px-2 py-0.5 bg-[var(--color-candy-yellow)] border-2 border-[#222] rounded-full font-extrabold text-xs shadow-[2px_2px_0_#222] whitespace-nowrap flex-shrink-0"
              data-testid="streak-badge"
            >
              🔥 {streakDays} {t.streak_days}
            </span>
          )}
          {skillStats &&
            (skillStats.builds > 0 || skillStats.describes > 0) && (
              <div
                className="flex items-center gap-2 bg-white/80 border-2 border-[#222] rounded-full px-3 py-1 shadow-[2px_2px_0_#222] text-xs font-bold flex-shrink-0"
                data-testid="skill-card"
              >
                <span>🏗️ {skillStats.builds}</span>
                <span>📝 {skillStats.describes ?? 0}</span>
                <span>🔄 {skillStats.iterates ?? 0}</span>
                <span>💡 {skillStats.tips ?? 0}</span>
              </div>
            )}
          {skillStats &&
            (() => {
              const nextAvatar = BUDDY_AVATARS.find(
                (a) => a.requiredBuilds > (skillStats.builds ?? 0),
              );
              if (!nextAvatar) {
                return (
                  <span
                    className="px-2 py-0.5 bg-[var(--color-candy-green)] border-2 border-[#222] rounded-full font-extrabold text-xs shadow-[2px_2px_0_#222] whitespace-nowrap flex-shrink-0"
                    data-testid="buddy-progress-bar"
                  >
                    ✅ {t.progress_all_unlocked}
                  </span>
                );
              }
              const remaining =
                nextAvatar.requiredBuilds - (skillStats.builds ?? 0);
              return (
                <span
                  className="px-2 py-0.5 bg-[var(--color-candy-purple)] border-2 border-[#222] rounded-full font-extrabold text-xs shadow-[2px_2px_0_#222] whitespace-nowrap flex-shrink-0"
                  data-testid="buddy-progress-bar"
                >
                  {nextAvatar.emoji} {remaining} {t.progress_builds_to_go}
                </span>
              );
            })()}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            onClick={() => setIsThemeSelectorOpen(true)}
            className="bg-[var(--color-candy-blue)] border-2 border-[#222] p-2 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center justify-center"
            title="Change Theme"
          >
            <Palette size={20} strokeWidth={2.5} className="text-[#222]" />
          </button>
          <button
            onClick={onToggleLanguage}
            className={`border-2 border-[#222] px-3 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[2px_2px_0_#222] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center gap-1 font-bold text-sm ${
              language !== "en-US"
                ? "bg-[var(--color-candy-green)]"
                : "bg-white"
            }`}
          >
            <Languages size={16} strokeWidth={2.5} />
            {language === "zh-TW" ? "TW" : language === "zh-CN" ? "CN" : "EN"}
          </button>
          <button
            onClick={onCreate}
            className="btn-squish bg-[var(--color-candy-green)] border-2 border-[#222] text-[#222] px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1 shadow-[2px_2px_0px_#222] hover-wiggle"
            data-testid="new-project-btn"
          >
            <Plus size={18} strokeWidth={3} />
            {t.create_new}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 z-10">
        {/* Daily Challenge */}
        {onAcceptChallenge && (
          <DailyChallengeCard
            challenge={todayChallenge}
            isCompleted={challengeCompleted}
            language={language}
            onAccept={onAcceptChallenge}
            t={t}
          />
        )}

        {/* Template Gallery Section */}
        <div className="mb-8">
          <h2
            className="text-2xl font-extrabold text-[#333] mb-4"
            style={{ textShadow: "1px 1px 0px var(--color-candy-pink)" }}
          >
            {t.templates_header}
          </h2>
          <div
            className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2"
            style={{ scrollbarWidth: "thin" }}
            data-testid="template-gallery"
          >
            {STARTER_TEMPLATES.map((template, i) => {
              const cardBg = templateCardColors[i % templateCardColors.length];
              return (
                <button
                  key={template.id}
                  onClick={() => onCreateFromTemplate(template)}
                  className={`${cardBg} rounded-[2rem] border-4 border-[#222] shadow-[6px_6px_0px_#222] hover:shadow-[10px_10px_0px_#222] hover:-translate-y-2 transition-all duration-200 btn-squish flex-shrink-0 w-44 sm:w-52 flex flex-col items-center p-5 text-left`}
                  data-testid="template-card"
                  aria-label={t[template.titleKey as keyof typeof t]}
                >
                  <span className="text-5xl mb-3 block">{template.emoji}</span>
                  <span className="font-extrabold text-[#222] text-base leading-tight mb-1 text-center">
                    {t[template.titleKey as keyof typeof t]}
                  </span>
                  <span className="text-[#333]/70 text-xs font-bold text-center leading-snug">
                    {t[template.descriptionKey as keyof typeof t]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lesson Plans */}
        {onCreateFromLessonPlan && (
          <div className="mb-8">
            <h2
              className="text-2xl font-extrabold text-[#333] mb-4"
              style={{ textShadow: "1px 1px 0px var(--color-candy-blue)" }}
            >
              {t.lesson_plans_header}
            </h2>
            <div
              className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2"
              style={{ scrollbarWidth: "thin" }}
              data-testid="lesson-plan-gallery"
            >
              {LESSON_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => onCreateFromLessonPlan(plan)}
                  className="bg-white rounded-[2rem] border-4 border-[#222] shadow-[6px_6px_0px_#222] hover:shadow-[10px_10px_0px_#222] hover:-translate-y-2 transition-all duration-200 btn-squish flex-shrink-0 w-44 sm:w-52 flex flex-col items-center p-5 text-left"
                  data-testid="lesson-plan-card"
                  aria-label={t[plan.titleKey as keyof typeof t]}
                >
                  <span className="text-5xl mb-3 block">{plan.emoji}</span>
                  <span className="font-extrabold text-[#222] text-base leading-tight mb-1 text-center">
                    {t[plan.titleKey as keyof typeof t]}
                  </span>
                  <span className="text-[#333]/70 text-xs font-bold text-center leading-snug">
                    {t[plan.descKey as keyof typeof t]}
                  </span>
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-candy-blue)]/20 border border-[var(--color-candy-blue)] text-[#222]">
                    Ages {plan.ageRange}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Project Grid */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-7xl mb-6 buddy-avatar">🚀</div>
            <h2 className="text-3xl font-extrabold text-[#333] mb-4">
              {t.empty_catalog}
            </h2>
            <button
              onClick={onCreate}
              className="btn-squish bg-[var(--color-candy-pink)] border-4 border-[#222] text-[#222] px-8 py-4 rounded-[2rem] font-extrabold text-xl shadow-[6px_6px_0px_#222] flex items-center gap-3 hover-wiggle"
            >
              <Plus size={28} strokeWidth={3} />
              {t.create_new}
            </button>
          </div>
        ) : (
          <>
            <h2
              className="text-2xl font-extrabold text-[#333] mb-4"
              style={{ textShadow: "1px 1px 0px var(--color-candy-blue)" }}
            >
              {t.aria_my_projects}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sorted.map((project, i) => {
                const bgColors = [
                  "bg-[var(--color-candy-blue)]",
                  "bg-[var(--color-candy-yellow)]",
                  "bg-[var(--color-candy-pink)]",
                  "bg-[var(--color-candy-green)]",
                  "bg-[var(--color-candy-purple)]",
                  "bg-[var(--color-candy-orange)]",
                ];
                const cardBg = bgColors[i % bgColors.length];

                return (
                  <div
                    key={project.id}
                    className={`${cardBg} rounded-[2rem] border-4 border-[#222] shadow-[6px_6px_0px_#222] hover:shadow-[10px_10px_0px_#222] hover:-translate-y-2 transition-all duration-300 group btn-squish flex flex-col`}
                    data-testid="project-card"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      {editingId === project.id ? (
                        <input
                          ref={renameInputRef}
                          data-testid="rename-input"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingTitle("");
                            }
                          }}
                          className="text-[#222] font-extrabold text-2xl mb-3 bg-white/50 border-2 border-[#222] rounded-xl px-2 py-1 outline-none focus:ring-2 focus:ring-[var(--color-candy-blue)]"
                          maxLength={60}
                        />
                      ) : (
                        <h3
                          className="text-[#222] font-extrabold text-2xl truncate mb-3 cursor-pointer group/title flex items-center gap-2"
                          title={project.title}
                          onDoubleClick={() => startRename(project)}
                        >
                          <span className="truncate">{project.title}</span>
                          {onRename && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename(project);
                              }}
                              className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1"
                              aria-label={t.aria_rename_project}
                              data-testid="rename-btn"
                            >
                              <Pencil size={14} strokeWidth={2.5} />
                            </button>
                          )}
                        </h3>
                      )}
                      <div className="flex items-center gap-2 text-[#222]/70 font-bold text-sm mb-3 bg-white/30 w-fit px-3 py-1 rounded-full border-2 border-[#222]/20">
                        <Clock size={16} strokeWidth={2.5} />
                        <span>{timeAgo(project.updatedAt)}</span>
                      </div>
                      {project.sessionStats && (
                        <div
                          className="flex flex-wrap gap-1.5 mb-4"
                          data-testid="session-stats"
                        >
                          {project.sessionStats.totalBuilds > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 border border-[#222]/20 text-[#222]">
                              🔨 {project.sessionStats.totalBuilds} builds
                            </span>
                          )}
                          {project.sessionStats.totalMessages > 2 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 border border-[#222]/20 text-[#222]">
                              💬 {project.sessionStats.totalMessages} msgs
                            </span>
                          )}
                          {project.sessionStats.blockCategories.length > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 border border-[#222]/20 text-[#222]">
                              🧩 {project.sessionStats.blockCategories.length}{" "}
                              skills
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-auto flex items-center gap-3">
                        <button
                          onClick={() => onOpen(project.id)}
                          className="flex-1 bg-white border-4 border-[#222] text-[#222] px-4 py-3 rounded-[1.5rem] font-extrabold text-lg shadow-[6px_6px_0_#222] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all flex items-center justify-center gap-2 hover-wiggle"
                          data-testid="open-project-btn"
                        >
                          <FolderOpen size={20} strokeWidth={2.5} />
                          {t.open_project}
                        </button>
                        <button
                          onClick={() => setPendingDeleteId(project.id)}
                          className="bg-white border-4 border-[#222] text-[#222] p-3 rounded-[1.5rem] shadow-[6px_6px_0_#222] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all hover:bg-red-400 hover:text-white"
                          aria-label={`${t.delete_project} ${project.title}`}
                          data-testid="delete-project-btn"
                        >
                          <Trash2 size={20} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        message={t.confirm_delete}
        onConfirm={() => {
          if (pendingDeleteId) onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
        confirmLabel={t.confirm_ok}
        cancelLabel={t.confirm_cancel}
      />

      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
        currentThemeId={themeId}
        onSelectTheme={setThemeId}
        t={t}
      />
    </div>
  );
}
