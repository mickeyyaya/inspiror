import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useProjects } from "./useProjects";
import { safeSave } from "../utils/safeSave";

// Mock safeSave to track calls
vi.mock("../utils/safeSave", () => ({
  safeSave: vi.fn(() => true),
}));

// Mock compileBlocks to avoid engine dependency
vi.mock("../compiler/compileBlocks", () => ({
  compileBlocks: vi.fn(() => "<html>compiled</html>"),
}));

const mockSafeSave = vi.mocked(safeSave);

describe("useProjects", () => {
  const store: Record<string, string> = {};

  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          for (const key of Object.keys(store)) delete store[key];
        },
      },
      writable: true,
    });

    mockSafeSave.mockReturnValue(true);
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts with empty projects when no localStorage data", () => {
      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.projects).toEqual([]);
      expect(result.current.currentProject).toBeNull();
    });

    it("loads existing projects from localStorage", () => {
      const project = {
        id: "p1",
        title: "Test",
        createdAt: 1000,
        updatedAt: 1000,
        messages: [{ id: "m1", role: "assistant", content: "Hi" }],
        currentCode: "<html></html>",
      };
      store["inspiror_projects"] = JSON.stringify([project]);
      store["inspiror_current_project_id"] = "p1";

      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].id).toBe("p1");
      expect(result.current.currentProject?.id).toBe("p1");
    });

    it("returns null currentProject when no currentProjectId", () => {
      const project = {
        id: "p1",
        title: "Test",
        createdAt: 1000,
        updatedAt: 1000,
        messages: [],
        currentCode: "",
      };
      store["inspiror_projects"] = JSON.stringify([project]);

      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.projects).toHaveLength(1);
      expect(result.current.currentProject).toBeNull();
    });

    it("handles corrupted localStorage JSON gracefully", () => {
      store["inspiror_projects"] = "NOT_VALID_JSON";

      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.projects).toEqual([]);
    });
  });

  describe("legacy migration", () => {
    it("migrates legacy messages and code into a project", () => {
      const legacyMsgs = [
        { id: "m1", role: "user", content: "Hello" },
        { id: "m2", role: "assistant", content: "Hi!" },
      ];
      store["inspiror-messages"] = JSON.stringify(legacyMsgs);
      store["inspiror-currentCode"] = "<html>legacy</html>";

      const { result } = renderHook(() => useProjects("en-US"));

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe("Legacy Project");
      expect(result.current.projects[0].currentCode).toBe(
        "<html>legacy</html>",
      );
      expect(result.current.projects[0].messages).toHaveLength(2);
      expect(result.current.currentProject).not.toBeNull();

      // Legacy keys should be cleaned up
      expect(store["inspiror-messages"]).toBeUndefined();
      expect(store["inspiror-currentCode"]).toBeUndefined();
    });

    it("handles corrupted legacy messages gracefully", () => {
      store["inspiror-messages"] = "CORRUPT";
      store["inspiror-currentCode"] = "<html>ok</html>";

      const { result } = renderHook(() => useProjects("en-US"));

      expect(result.current.projects).toHaveLength(1);
      // Should fall back to default greeting message
      expect(result.current.projects[0].messages).toHaveLength(1);
      expect(result.current.projects[0].messages[0].role).toBe("assistant");
    });

    it("migrates legacy with only code (no messages)", () => {
      store["inspiror-currentCode"] = "<html>only code</html>";

      const { result } = renderHook(() => useProjects("en-US"));

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].currentCode).toBe(
        "<html>only code</html>",
      );
      expect(result.current.projects[0].messages[0].role).toBe("assistant");
    });

    it("filters invalid messages during migration", () => {
      const legacyMsgs = [
        { id: "m1", role: "user", content: "valid" },
        { role: "invalid_role", content: "bad role" },
        { role: "assistant" }, // missing content
        null,
        42,
      ];
      store["inspiror-messages"] = JSON.stringify(legacyMsgs);

      const { result } = renderHook(() => useProjects("en-US"));

      // Only the valid message should survive
      expect(result.current.projects[0].messages).toHaveLength(1);
      expect(result.current.projects[0].messages[0].content).toBe("valid");
    });

    it("assigns UUID to messages without IDs during migration", () => {
      const legacyMsgs = [
        { role: "user", content: "no id" },
        { id: "", role: "assistant", content: "empty id" },
      ];
      store["inspiror-messages"] = JSON.stringify(legacyMsgs);

      const { result } = renderHook(() => useProjects("en-US"));

      const msgs = result.current.projects[0].messages;
      expect(msgs).toHaveLength(2);
      expect(msgs[0].id).toBeTruthy();
      expect(msgs[0].id.length).toBeGreaterThan(0);
      expect(msgs[1].id).toBeTruthy();
      expect(msgs[1].id.length).toBeGreaterThan(0);
    });
  });

  describe("createProject", () => {
    it("creates a new project and sets it as current", () => {
      const { result } = renderHook(() => useProjects("en-US"));

      let newProject: ReturnType<typeof result.current.createProject>;
      act(() => {
        newProject = result.current.createProject();
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.currentProject?.id).toBe(newProject!.id);
      expect(newProject!.title).toBe("Untitled Project");
      expect(newProject!.version).toBe(2);
      expect(newProject!.blocks).toBeDefined();
    });

    it("prepends new project to existing projects", () => {
      const existing = {
        id: "old",
        title: "Old",
        createdAt: 1000,
        updatedAt: 1000,
        messages: [],
        currentCode: "",
      };
      store["inspiror_projects"] = JSON.stringify([existing]);

      const { result } = renderHook(() => useProjects("en-US"));

      act(() => {
        result.current.createProject();
      });

      expect(result.current.projects).toHaveLength(2);
      expect(result.current.projects[0].title).toBe("Untitled Project");
      expect(result.current.projects[1].id).toBe("old");
    });
  });

  describe("openProject", () => {
    it("sets the current project by ID", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1,
          updatedAt: 1,
          messages: [],
          currentCode: "",
        },
        {
          id: "p2",
          title: "Two",
          createdAt: 2,
          updatedAt: 2,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);
      store["inspiror_current_project_id"] = "p1";

      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.currentProject?.id).toBe("p1");

      act(() => {
        result.current.openProject("p2");
      });

      expect(result.current.currentProject?.id).toBe("p2");
    });
  });

  describe("deleteProject", () => {
    it("removes the project from the list", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1,
          updatedAt: 1,
          messages: [],
          currentCode: "",
        },
        {
          id: "p2",
          title: "Two",
          createdAt: 2,
          updatedAt: 2,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("en-US"));

      act(() => {
        result.current.deleteProject("p1");
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].id).toBe("p2");
    });

    it("clears currentProject when deleting the active project", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1,
          updatedAt: 1,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);
      store["inspiror_current_project_id"] = "p1";

      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.currentProject?.id).toBe("p1");

      act(() => {
        result.current.deleteProject("p1");
      });

      expect(result.current.currentProject).toBeNull();
    });

    it("keeps currentProject when deleting a different project", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1,
          updatedAt: 1,
          messages: [],
          currentCode: "",
        },
        {
          id: "p2",
          title: "Two",
          createdAt: 2,
          updatedAt: 2,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);
      store["inspiror_current_project_id"] = "p1";

      const { result } = renderHook(() => useProjects("en-US"));

      act(() => {
        result.current.deleteProject("p2");
      });

      expect(result.current.currentProject?.id).toBe("p1");
    });
  });

  describe("goToCatalog", () => {
    it("sets currentProject to null", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1,
          updatedAt: 1,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);
      store["inspiror_current_project_id"] = "p1";

      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.currentProject).not.toBeNull();

      act(() => {
        result.current.goToCatalog();
      });

      expect(result.current.currentProject).toBeNull();
    });
  });

  describe("updateProject", () => {
    it("updates project fields and bumps updatedAt", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [{ id: "m1", role: "assistant" as const, content: "Hi" }],
          currentCode: "<html>old</html>",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("en-US"));

      act(() => {
        result.current.updateProject("p1", {
          currentCode: "<html>new</html>",
        });
      });

      expect(result.current.projects[0].currentCode).toBe("<html>new</html>");
      expect(result.current.projects[0].updatedAt).toBeGreaterThan(1000);
    });

    it("auto-renames Untitled Project from first user message", () => {
      const projects = [
        {
          id: "p1",
          title: "Untitled Project",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [{ id: "m1", role: "assistant" as const, content: "Hi" }],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("en-US"));

      const newMessages = [
        { id: "m1", role: "assistant" as const, content: "Hi" },
        { id: "m2", role: "user" as const, content: "Make a snake game" },
      ];

      act(() => {
        result.current.updateProject("p1", { messages: newMessages });
      });

      expect(result.current.projects[0].title).toBe("Make a snake game");
    });

    it("auto-renames zh-TW untitled project", () => {
      const projects = [
        {
          id: "p1",
          title: "未命名項目",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [{ id: "m1", role: "assistant" as const, content: "嗨" }],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("zh-TW"));

      const newMessages = [
        { id: "m1", role: "assistant" as const, content: "嗨" },
        { id: "m2", role: "user" as const, content: "做一個貪食蛇遊戲" },
      ];

      act(() => {
        result.current.updateProject("p1", { messages: newMessages });
      });

      expect(result.current.projects[0].title).toBe("做一個貪食蛇遊戲");
    });

    it("auto-renames zh-CN untitled project", () => {
      const projects = [
        {
          id: "p1",
          title: "未命名项目",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [{ id: "m1", role: "assistant" as const, content: "嗨" }],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("zh-CN"));

      const newMessages = [
        { id: "m1", role: "assistant" as const, content: "嗨" },
        { id: "m2", role: "user" as const, content: "做一个贪食蛇游戏" },
      ];

      act(() => {
        result.current.updateProject("p1", { messages: newMessages });
      });

      expect(result.current.projects[0].title).toBe("做一个贪食蛇游戏");
    });

    it("truncates long titles with ellipsis", () => {
      const projects = [
        {
          id: "p1",
          title: "Untitled Project",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("en-US"));

      const longText =
        "Make a really amazing super duper long game that does everything";
      const newMessages = [
        { id: "m1", role: "user" as const, content: longText },
      ];

      act(() => {
        result.current.updateProject("p1", { messages: newMessages });
      });

      expect(result.current.projects[0].title.length).toBeLessThanOrEqual(44);
      expect(result.current.projects[0].title).toContain("...");
    });

    it("does not rename already-named projects", () => {
      const projects = [
        {
          id: "p1",
          title: "My Named Project",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("en-US"));

      const newMessages = [
        { id: "m1", role: "user" as const, content: "New message" },
      ];

      act(() => {
        result.current.updateProject("p1", { messages: newMessages });
      });

      expect(result.current.projects[0].title).toBe("My Named Project");
    });
  });

  describe("updateCurrentProject", () => {
    it("updates the active project via updateCurrentProject", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [{ id: "m1", role: "assistant" as const, content: "Hi" }],
          currentCode: "<html>old</html>",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);
      store["inspiror_current_project_id"] = "p1";

      const { result } = renderHook(() => useProjects("en-US"));

      act(() => {
        result.current.updateCurrentProject({
          currentCode: "<html>updated</html>",
        });
      });

      expect(result.current.projects[0].currentCode).toBe(
        "<html>updated</html>",
      );
      expect(result.current.projects[0].updatedAt).toBeGreaterThan(1000);
    });

    it("is a no-op when no current project is selected", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [],
          currentCode: "<html>original</html>",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);
      // No current project id set

      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.currentProject).toBeNull();

      act(() => {
        result.current.updateCurrentProject({
          currentCode: "<html>should not change</html>",
        });
      });

      expect(result.current.projects[0].currentCode).toBe(
        "<html>original</html>",
      );
      expect(result.current.projects[0].updatedAt).toBe(1000);
    });
  });

  describe("openProject edge cases", () => {
    it("returns null currentProject for non-existent ID", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1,
          updatedAt: 1,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("en-US"));

      act(() => {
        result.current.openProject("non-existent-id");
      });

      expect(result.current.currentProject).toBeNull();
    });
  });

  describe("extractTitle edge cases", () => {
    it("returns Untitled Project when no user message exists", () => {
      const projects = [
        {
          id: "p1",
          title: "Untitled Project",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("en-US"));

      // Update with only assistant messages - should not rename
      const newMessages = [
        { id: "m1", role: "assistant" as const, content: "Hello there!" },
      ];

      act(() => {
        result.current.updateProject("p1", { messages: newMessages });
      });

      expect(result.current.projects[0].title).toBe("Untitled Project");
    });

    it("keeps exact 40-char title without truncation", () => {
      const projects = [
        {
          id: "p1",
          title: "Untitled Project",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [],
          currentCode: "",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);

      const { result } = renderHook(() => useProjects("en-US"));

      const exact40 = "A".repeat(40);
      const newMessages = [
        { id: "m1", role: "user" as const, content: exact40 },
      ];

      act(() => {
        result.current.updateProject("p1", { messages: newMessages });
      });

      expect(result.current.projects[0].title).toBe(exact40);
      expect(result.current.projects[0].title).not.toContain("...");
    });
  });

  describe("migrateRawMessages edge cases", () => {
    it("falls back to defaults when legacy messages is a non-array value", () => {
      store["inspiror-messages"] = JSON.stringify({ notAnArray: true });

      const { result } = renderHook(() => useProjects("en-US"));

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].messages).toHaveLength(1);
      expect(result.current.projects[0].messages[0].role).toBe("assistant");
    });
  });

  describe("resetCurrentProject", () => {
    it("resets to default messages and blocks", () => {
      const projects = [
        {
          id: "p1",
          title: "One",
          createdAt: 1000,
          updatedAt: 1000,
          messages: [
            { id: "m1", role: "user" as const, content: "Hello" },
            { id: "m2", role: "assistant" as const, content: "Hi!" },
          ],
          currentCode: "<html>modified</html>",
        },
      ];
      store["inspiror_projects"] = JSON.stringify(projects);
      store["inspiror_current_project_id"] = "p1";

      const { result } = renderHook(() => useProjects("en-US"));

      act(() => {
        result.current.resetCurrentProject();
      });

      const updated = result.current.projects[0];
      expect(updated.messages).toHaveLength(1);
      expect(updated.messages[0].role).toBe("assistant");
      expect(updated.blocks).toBeDefined();
    });
  });

  describe("saveError", () => {
    it("is null when saves succeed", () => {
      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.saveError).toBeNull();
    });

    it("is set when safeSave fails", () => {
      mockSafeSave.mockReturnValue(false);

      const { result } = renderHook(() => useProjects("en-US"));

      act(() => {
        result.current.createProject();
      });

      expect(result.current.saveError).toBe("storage_full");
    });

    it("reports error when projects save fails with no currentId", () => {
      mockSafeSave.mockReturnValue(false);

      const { result } = renderHook(() => useProjects("en-US"));
      // No currentId, but safeSave fails for projects array
      expect(result.current.saveError).toBe("storage_full");
    });
  });

  describe("DEFAULT_CODE", () => {
    it("returns welcome HTML for en-US", () => {
      const { result } = renderHook(() => useProjects("en-US"));
      expect(result.current.DEFAULT_CODE).toContain("What will YOU create");
    });

    it("returns welcome HTML for zh-TW", () => {
      const { result } = renderHook(() => useProjects("zh-TW"));
      expect(result.current.DEFAULT_CODE).toContain("創造什麼呢");
    });
  });
});
