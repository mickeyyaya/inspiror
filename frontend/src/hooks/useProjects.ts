import { useState, useCallback, useEffect, useRef } from "react";
import type { Project, ChatMessage } from "../types/project";

const STORAGE_KEYS = {
  projects: "inspiror_projects",
  currentProjectId: "inspiror_current_project_id",
  legacyMessages: "inspiror-messages",
  legacyCode: "inspiror-currentCode",
} as const;

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

function makeDefaultMessages(): ChatMessage[] {
  return [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hi! I'm your builder buddy. What do you want to create today?",
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

function migrateLegacyData(): Project | null {
  const legacyMessages = localStorage.getItem(STORAGE_KEYS.legacyMessages);
  const legacyCode = localStorage.getItem(STORAGE_KEYS.legacyCode);

  if (!legacyMessages && !legacyCode) return null;

  const messages: ChatMessage[] = legacyMessages
    ? migrateRawMessages(JSON.parse(legacyMessages))
    : makeDefaultMessages();

  const project: Project = {
    id: crypto.randomUUID(),
    title: "Legacy Project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages,
    currentCode: legacyCode || DEFAULT_CODE,
  };

  // Clean up old keys
  localStorage.removeItem(STORAGE_KEYS.legacyMessages);
  localStorage.removeItem(STORAGE_KEYS.legacyCode);

  return project;
}

const VALID_ROLES = new Set<string>(["user", "assistant", "system"]);

function migrateRawMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return makeDefaultMessages();
  const valid = raw.filter(
    (msg) =>
      msg !== null &&
      typeof msg === "object" &&
      typeof msg.content === "string" &&
      VALID_ROLES.has(msg.role),
  );
  if (valid.length === 0) return makeDefaultMessages();
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
  // Truncate to first ~40 chars at a word boundary
  if (text.length <= 40) return text;
  return text.slice(0, 40).replace(/\s+\S*$/, "") + "...";
}

function loadInitialState(): { projects: Project[]; currentId: string | null } {
  const existing = loadJson<Project[]>(STORAGE_KEYS.projects, []);

  if (existing.length > 0) {
    const currentId = localStorage.getItem(STORAGE_KEYS.currentProjectId);
    return { projects: existing, currentId };
  }

  // Try legacy migration
  const legacy = migrateLegacyData();
  if (legacy) {
    return { projects: [legacy], currentId: legacy.id };
  }

  return { projects: [], currentId: null };
}

export function useProjects() {
  const [state, setState] = useState(loadInitialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const { projects, currentId } = state;
  const currentProject = currentId
    ? (projects.find((p) => p.id === currentId) ?? null)
    : null;

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    if (currentId) {
      localStorage.setItem(STORAGE_KEYS.currentProjectId, currentId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentProjectId);
    }
  }, [projects, currentId]);

  const createProject = useCallback((): Project => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: "Untitled Project",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: makeDefaultMessages(),
      currentCode: DEFAULT_CODE,
    };
    setState((prev) => ({
      projects: [newProject, ...prev.projects],
      currentId: newProject.id,
    }));
    return newProject;
  }, []);

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
      updates: Partial<Pick<Project, "messages" | "currentCode">>,
    ) => {
      setState((prev) => {
        const updatedProjects = prev.projects.map((p) => {
          if (p.id !== projectId) return p;
          const updated = { ...p, ...updates, updatedAt: Date.now() };
          // Auto-generate title from first user message if still untitled
          if (updated.title === "Untitled Project" && updates.messages) {
            updated.title = extractTitle(updates.messages);
          }
          return updated;
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
      messages: makeDefaultMessages(),
      currentCode: DEFAULT_CODE,
    });
  }, [updateCurrentProject]);

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
