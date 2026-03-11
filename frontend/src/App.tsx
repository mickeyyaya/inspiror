import { useState } from "react";
import { useProjects } from "./hooks/useProjects";
import type { VoiceLanguage } from "./hooks/useVoice";
import { ProjectCatalog } from "./components/ProjectCatalog";
import { EditorView } from "./components/EditorView";
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
    DEFAULT_CODE,
  } = useProjects(language);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      if (prev === "en-US") return "zh-TW";
      if (prev === "zh-TW") return "zh-CN";
      return "en-US";
    });
  };

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

export default App;
