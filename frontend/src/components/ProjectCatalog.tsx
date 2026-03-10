import { Plus, Trash2, FolderOpen, Clock } from "lucide-react";
import type { Project } from "../types/project";

interface ProjectCatalogProps {
  projects: Project[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function ProjectCatalog({
  projects,
  onOpen,
  onDelete,
  onCreate,
}: ProjectCatalogProps) {
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="w-screen h-screen bg-[#fdfbf7] flex flex-col overflow-hidden relative">
      {/* Playful Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[var(--color-candy-yellow)] rounded-full opacity-20 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[var(--color-candy-pink)] rounded-full opacity-20 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="p-6 sm:p-8 flex items-center justify-between border-b-4 border-[var(--color-candy-yellow)] bg-white/50 backdrop-blur-md z-10 shadow-sm rounded-b-3xl">
        <div className="flex items-center gap-3">
          <span className="text-5xl buddy-avatar">🐶</span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#333] tracking-wide" style={{ textShadow: "2px 2px 0px var(--color-candy-yellow)" }}>
              My Projects
            </h1>
            <p className="text-gray-600 font-bold mt-1 text-lg">
              {projects.length === 0
                ? "Let's create something fun!"
                : `${projects.length} project${projects.length !== 1 ? "s" : ""} waiting for you!`}
            </p>
          </div>
        </div>
        <button
          onClick={onCreate}
          className="btn-squish bg-[var(--color-candy-green)] border-4 border-[#222] text-[#222] px-6 py-4 rounded-[2rem] font-bold text-lg flex items-center gap-2 shadow-[4px_4px_0px_#222] hover-wiggle"
          data-testid="new-project-btn"
        >
          <Plus size={24} strokeWidth={3} />
          New Magic!
        </button>
      </div>

      {/* Project Grid */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 z-10">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-7xl mb-6 buddy-avatar">🚀</div>
            <h2 className="text-3xl font-extrabold text-[#333] mb-4">
              Wow, so empty!
            </h2>
            <p className="text-gray-600 text-xl mb-8 max-w-md font-bold">
              Click the "New Magic!" button to start building something amazing!
            </p>
            <button
              onClick={onCreate}
              className="btn-squish bg-[var(--color-candy-pink)] border-4 border-[#222] text-[#222] px-8 py-4 rounded-[2rem] font-extrabold text-xl shadow-[6px_6px_0px_#222] flex items-center gap-3 hover-wiggle"
            >
              <Plus size={28} strokeWidth={3} />
              Create First Project!
            </button>
          </div>
        ) : (
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
                    <h3 className="text-[#222] font-extrabold text-2xl truncate mb-3" title={project.title}>
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[#222]/70 font-bold text-sm mb-6 bg-white/30 w-fit px-3 py-1 rounded-full border-2 border-[#222]/20">
                      <Clock size={16} strokeWidth={2.5} />
                      <span>{timeAgo(project.updatedAt)}</span>
                    </div>
                    <div className="mt-auto flex items-center gap-3">
                      <button
                        onClick={() => onOpen(project.id)}
                        className="flex-1 bg-white border-4 border-[#222] text-[#222] px-4 py-3 rounded-2xl font-extrabold text-lg shadow-[3px_3px_0px_#222] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 hover-wiggle"
                        data-testid="open-project-btn"
                      >
                        <FolderOpen size={20} strokeWidth={2.5} />
                        Play!
                      </button>
                      <button
                        onClick={() => onDelete(project.id)}
                        className="bg-white border-4 border-[#222] text-[#222] p-3 rounded-2xl shadow-[3px_3px_0px_#222] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all hover:bg-red-400 hover:text-white"
                        aria-label={`Delete ${project.title}`}
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
        )}
      </div>
    </div>
  );
}
