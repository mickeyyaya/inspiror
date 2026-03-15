import { useState, useCallback } from "react";
import { useProjects } from "./hooks/useProjects";
import { useStreak } from "./hooks/useStreak";
import { useTheme } from "./hooks/useTheme";
import { useClassroomMode } from "./hooks/useClassroomMode";
import type { VoiceLanguage } from "./hooks/useVoice";
import { translations, type TranslationKeys } from "./i18n/translations";
import { ProjectCatalog } from "./components/ProjectCatalog";
import { EditorView } from "./components/EditorView";
import { compileBlocks } from "./compiler/compileBlocks";
import type { StarterTemplate } from "./constants/starterTemplates";
import {
  markChallengeCompleted,
  getTodayChallenge,
} from "./constants/dailyChallenges";
import "./index.css";

function App() {
  useTheme();
  const [language, setLanguage] = useState<VoiceLanguage>("en-US");
  const classroom = useClassroomMode();

  const {
    projects,
    currentProject,
    createProject,
    openProject,
    deleteProject,
    goToCatalog,
    updateProject,
    resetCurrentProject,
    saveError,
  } = useProjects(language);
  const { streakDays, recordActivity } = useStreak();

  const toggleLanguage = () => {
    setLanguage((prev) => {
      if (prev === "en-US") return "zh-TW";
      if (prev === "zh-TW") return "zh-CN";
      return "en-US";
    });
  };

  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();

  const handleAcceptChallenge = useCallback(
    (prompt: string) => {
      const challenge = getTodayChallenge();
      markChallengeCompleted(challenge.id);
      createProject();
      setInitialPrompt(prompt);
    },
    [createProject],
  );

  const handleCreateFromTemplate = useCallback(
    (template: StarterTemplate) => {
      const newProject = createProject();
      const blocks = template.blocks.map((b) => ({
        ...b,
        origin: "template" as const,
      }));
      const compiledCode = compileBlocks(blocks);
      updateProject(newProject.id, {
        blocks,
        currentCode: compiledCode,
        title:
          translations[language][template.titleKey as keyof TranslationKeys] ||
          template.id,
      });
    },
    [createProject, updateProject, language],
  );

  // In classroom mode, auto-create a project and skip catalog
  if (classroom.isClassroom && !currentProject) {
    createProject();
  }

  if (!currentProject) {
    return (
      <ProjectCatalog
        projects={projects}
        onOpen={openProject}
        onDelete={deleteProject}
        onCreate={createProject}
        onCreateFromTemplate={handleCreateFromTemplate}
        onRename={(id, title) => updateProject(id, { title })}
        onAcceptChallenge={handleAcceptChallenge}
        language={language}
        onToggleLanguage={toggleLanguage}
        streakDays={streakDays}
      />
    );
  }

  const t = translations[language];

  return (
    <>
      {saveError && (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 z-50 bg-[#ff6b6b] text-white text-center py-2 px-4 font-bold text-sm border-b-4 border-[#222]"
        >
          {t.save_error}
        </div>
      )}
      <EditorView
        key={currentProject.id}
        project={currentProject}
        onUpdate={updateProject}
        onReset={resetCurrentProject}
        onBack={() => {
          setInitialPrompt(undefined);
          goToCatalog();
        }}
        language={language}
        onToggleLanguage={toggleLanguage}
        onBuild={recordActivity}
        initialPrompt={initialPrompt}
        isClassroom={classroom.isClassroom}
        lessonTopic={classroom.lessonTopic}
        classroomUrl={classroom.classroomUrl}
      />
    </>
  );
}

export default App;
