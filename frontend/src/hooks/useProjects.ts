import { useState, useCallback, useEffect, useRef } from "react";
import type { Project, ChatMessage } from "../types/project";
import { translations } from "../i18n/translations";
import type { VoiceLanguage } from "./useVoice";

const STORAGE_KEYS = {
  projects: "inspiror_projects",
  currentProjectId: "inspiror_current_project_id",
  legacyMessages: "inspiror-messages",
  legacyCode: "inspiror-currentCode",
} as const;

const getWelcomeCode = (language: VoiceLanguage) => {
  const t = translations[language];
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #fdfbf7;
      color: #222;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: 'Comic Neue', 'Comic Sans MS', sans-serif;
      overflow: hidden;
    }
    .welcome {
      text-align: center;
      z-index: 2;
      position: relative;
      background: white;
      border: 4px solid #222;
      padding: 3rem;
      border-radius: 2rem;
      box-shadow: 8px 8px 0 #222;
    }
    .welcome h1 {
      font-size: 3rem;
      color: #222;
      margin-bottom: 1rem;
      line-height: 1.1;
    }
    .welcome p {
      color: #555;
      font-size: 1.5rem;
      font-weight: bold;
    }
    .sparkle {
      position: absolute;
      font-size: 2rem;
      animation: pop 2s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes pop {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
      50% { transform: scale(1.5) rotate(15deg); opacity: 1; }
    }
    .bubble {
      position: absolute;
      border-radius: 50%;
      border: 3px solid #222;
      opacity: 0.4;
      z-index: 1;
      animation: float 8s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(-30px) translateX(20px); }
    }
  </style>
</head>
<body>
  <div class="welcome">
    <h1>${t.what_will_you_create}</h1>
    <p>${t.tell_buddy}</p>
  </div>
  <script>
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#c3aed6', '#ffb86c'];
    for(let i=0; i<15; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = 20 + Math.random() * 60;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.top = Math.random() * 100 + '%';
      b.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      b.style.animationDelay = Math.random() * 5 + 's';
      b.style.animationDuration = (6 + Math.random() * 6) + 's';
      document.body.appendChild(b);
    }
    for(let i=0; i<8; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.innerText = '✨';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(s);
    }
  </script>
</body>
</html>`;
};

function makeDefaultMessages(language: VoiceLanguage): ChatMessage[] {
  return [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: translations[language].greeting,
    },
  ];
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function migrateLegacyData(language: VoiceLanguage): Project | null {
  const legacyMessages = localStorage.getItem(STORAGE_KEYS.legacyMessages);
  const legacyCode = localStorage.getItem(STORAGE_KEYS.legacyCode);

  if (!legacyMessages && !legacyCode) return null;

  let parsedLegacy: unknown = null;
  try {
    parsedLegacy = legacyMessages ? JSON.parse(legacyMessages) : null;
  } catch {
    // Corrupted legacy data
  }
  const messages: ChatMessage[] = parsedLegacy
    ? migrateRawMessages(parsedLegacy, language)
    : makeDefaultMessages(language);

  const project: Project = {
    id: crypto.randomUUID(),
    title: "Legacy Project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages,
    currentCode: legacyCode || getWelcomeCode(language),
  };

  // Clean up old keys
  localStorage.removeItem(STORAGE_KEYS.legacyMessages);
  localStorage.removeItem(STORAGE_KEYS.legacyCode);

  return project;
}

const VALID_ROLES = new Set<string>(["user", "assistant", "system"]);

function migrateRawMessages(raw: unknown, language: VoiceLanguage): ChatMessage[] {
  if (!Array.isArray(raw)) return makeDefaultMessages(language);
  const valid = raw.filter(
    (msg) =>
      msg !== null &&
      typeof msg === "object" &&
      typeof msg.content === "string" &&
      VALID_ROLES.has(msg.role),
  );
  if (valid.length === 0) return makeDefaultMessages(language);
  return valid.map((msg) => ({
    id: typeof msg.id === "string" && msg.id ? msg.id : crypto.randomUUID(),
    role: msg.role as ChatMessage["role"],
    content: msg.content as string,
  }));
}

function extractTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === "user");
  if (!firstUserMsg) return "Untitled Project";
  const text = firstUserMsg.content;
  if (text.length <= 40) return text;
  return text.slice(0, 40).replace(/\s+\S*$/, "") + "...";
}

function loadInitialState(language: VoiceLanguage): { projects: Project[]; currentId: string | null } {
  const existing = loadJson<Project[]>(STORAGE_KEYS.projects, []);

  if (existing.length > 0) {
    const currentId = localStorage.getItem(STORAGE_KEYS.currentProjectId);
    return { projects: existing, currentId };
  }

  const legacy = migrateLegacyData(language);
  if (legacy) {
    return { projects: [legacy], currentId: legacy.id };
  }

  return { projects: [], currentId: null };
}

export function useProjects(language: VoiceLanguage) {
  const [state, setState] = useState(() => loadInitialState(language));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const { projects, currentId } = state;
  const currentProject = currentId
    ? (projects.find((p) => p.id === currentId) ?? null)
    : null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    if (currentId) {
      localStorage.setItem(STORAGE_KEYS.currentProjectId, currentId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentProjectId);
    }
  }, [projects, currentId]);

  const DEFAULT_CODE = getWelcomeCode(language);

  const createProject = useCallback((): Project => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: "Untitled Project",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: makeDefaultMessages(language),
      currentCode: DEFAULT_CODE,
    };
    setState((prev) => ({
      projects: [newProject, ...prev.projects],
      currentId: newProject.id,
    }));
    return newProject;
  }, [language, DEFAULT_CODE]);

  const openProject = useCallback((id: string) => {
    setState((prev) => ({ ...prev, currentId: id }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((prev) => {
      const filtered = prev.projects.filter((p) => p.id !== id);
      const newCurrentId = prev.currentId === id ? null : prev.currentId;
      return { projects: filtered, currentId: newCurrentId };
    });
  }, []);

  const goToCatalog = useCallback(() => {
    setState((prev) => ({ ...prev, currentId: null }));
  }, []);

  const updateProject = useCallback(
    (
      projectId: string,
      updates: Partial<Pick<Project, "messages" | "currentCode" | "title">>,
    ) => {
      setState((prev) => {
        const updatedProjects = prev.projects.map((p) => {
          if (p.id !== projectId) return p;
          const baseUpdated = { ...p, ...updates, updatedAt: Date.now() };
          const shouldRename =
            (baseUpdated.title === "Untitled Project" || baseUpdated.title === "未命名項目") && updates.messages;
          return shouldRename
            ? { ...baseUpdated, title: extractTitle(updates.messages!) }
            : baseUpdated;
        });
        return { ...prev, projects: updatedProjects };
      });
    },
    [],
  );

  const updateCurrentProject = useCallback(
    (updates: Partial<Pick<Project, "messages" | "currentCode">>) => {
      const id = stateRef.current.currentId;
      if (!id) return;
      updateProject(id, updates);
    },
    [updateProject],
  );

  const resetCurrentProject = useCallback(() => {
    updateCurrentProject({
      messages: makeDefaultMessages(language),
      currentCode: DEFAULT_CODE,
    });
  }, [updateCurrentProject, language, DEFAULT_CODE]);

  return {
    projects,
    currentProject,
    createProject,
    openProject,
    deleteProject,
    goToCatalog,
    updateProject,
    updateCurrentProject,
    resetCurrentProject,
    DEFAULT_CODE,
  };
}
