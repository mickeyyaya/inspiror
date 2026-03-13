import { useState, useCallback } from "react";
import { useProjects } from "./hooks/useProjects";
import { useStreak } from "./hooks/useStreak";
import type { VoiceLanguage } from "./hooks/useVoice";
import { translations } from "./i18n/translations";
import { ProjectCatalog } from "./components/ProjectCatalog";
import { EditorView } from "./components/EditorView";
import { compileBlocks } from "./compiler/compileBlocks";
import type { StarterTemplate } from "./constants/starterTemplates";
import "./index.css";

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

  const handleCreateFromTemplate = useCallback(
    (template: StarterTemplate) => {
      const newProject = createProject();
      const blocks = template.blocks.map((b) => ({ ...b }));
      const compiledCode = compileBlocks(blocks);
      updateProject(newProject.id, {
        blocks,
        currentCode: compiledCode,
        title: template.id,
      });
    },
    [createProject, updateProject],
  );

  if (!currentProject) {
    return (
      <ProjectCatalog
        projects={projects}
        onOpen={openProject}
        onDelete={deleteProject}
        onCreate={createProject}
        onCreateFromTemplate={handleCreateFromTemplate}
        onRename={(id, title) => updateProject(id, { title })}
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
        onBack={goToCatalog}
        language={language}
        onToggleLanguage={toggleLanguage}
        onBuild={recordActivity}
      />
    </>
  );
}

export default App;
