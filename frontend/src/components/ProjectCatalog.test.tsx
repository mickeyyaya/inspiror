import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ProjectCatalog } from "./ProjectCatalog";
import type { Project } from "../types/project";
import { STARTER_TEMPLATES } from "../constants/starterTemplates";

// Mock ConfirmDialog to simplify testing
vi.mock("./ConfirmDialog", () => ({
  ConfirmDialog: ({
    isOpen,
    message,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <p>{message}</p>
        <button data-testid="confirm-dialog-confirm" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="confirm-dialog-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    title: "Test Project",
    messages: [],
    currentCode: "<html></html>",
    blocks: [],
    createdAt: Date.now() - 3600_000,
    updatedAt: Date.now() - 60_000,
    ...overrides,
  };
}

function renderCatalog(
  overrides: Partial<React.ComponentProps<typeof ProjectCatalog>> = {},
) {
  const props = {
    projects: [makeProject()],
    onOpen: vi.fn(),
    onDelete: vi.fn(),
    onCreate: vi.fn(),
    onCreateFromTemplate: vi.fn(),
    onRename: vi.fn(),
    language: "en-US" as const,
    onToggleLanguage: vi.fn(),
    streakDays: undefined,
    ...overrides,
  };
  return { ...render(<ProjectCatalog {...props} />), props };
}

describe("ProjectCatalog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-13T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Basic rendering ---

  it("renders the catalog title", () => {
    renderCatalog();
    expect(screen.getByText("My Creations")).toBeInTheDocument();
  });

  it("renders project cards", () => {
    renderCatalog({
      projects: [makeProject(), makeProject({ id: "p2", title: "Second" })],
    });
    expect(screen.getAllByTestId("project-card")).toHaveLength(2);
  });

  it("renders empty state when no projects", () => {
    renderCatalog({ projects: [] });
    expect(screen.queryByTestId("project-card")).not.toBeInTheDocument();
    // Shows tell_buddy text for zero projects
    expect(screen.getByText(/Tell your builder buddy/)).toBeInTheDocument();
  });

  // --- Project count text ---

  it("shows singular project count", () => {
    renderCatalog({ projects: [makeProject()] });
    expect(screen.getByText(/1 project /)).toBeInTheDocument();
  });

  it("shows plural project count", () => {
    renderCatalog({
      projects: [makeProject(), makeProject({ id: "p2", title: "Two" })],
    });
    expect(screen.getByText(/2 projects /)).toBeInTheDocument();
  });

  // --- timeAgo ---

  it("shows 'just now' for recent timestamps", () => {
    renderCatalog({
      projects: [makeProject({ updatedAt: Date.now() - 10_000 })],
    });
    expect(screen.getByText("Just now")).toBeInTheDocument();
  });

  it("shows minutes ago", () => {
    renderCatalog({
      projects: [makeProject({ updatedAt: Date.now() - 5 * 60_000 })],
    });
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it("shows hours ago", () => {
    renderCatalog({
      projects: [makeProject({ updatedAt: Date.now() - 3 * 3600_000 })],
    });
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("shows days ago", () => {
    renderCatalog({
      projects: [makeProject({ updatedAt: Date.now() - 5 * 86400_000 })],
    });
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it("shows last edited for 30+ days", () => {
    renderCatalog({
      projects: [makeProject({ updatedAt: Date.now() - 35 * 86400_000 })],
    });
    expect(screen.getByText("Last edited")).toBeInTheDocument();
  });

  // --- CRUD actions ---

  it("calls onCreate when create button clicked", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByTestId("new-project-btn"));
    expect(props.onCreate).toHaveBeenCalledOnce();
  });

  it("calls onOpen when open button clicked", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByTestId("open-project-btn"));
    expect(props.onOpen).toHaveBeenCalledWith("p1");
  });

  // --- Delete flow ---

  it("shows confirm dialog when delete button clicked", () => {
    renderCatalog();
    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("delete-project-btn"));
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
  });

  it("calls onDelete when confirm is clicked", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByTestId("delete-project-btn"));
    fireEvent.click(screen.getByTestId("confirm-dialog-confirm"));
    expect(props.onDelete).toHaveBeenCalledWith("p1");
  });

  it("does not call onDelete when cancel is clicked", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByTestId("delete-project-btn"));
    fireEvent.click(screen.getByTestId("confirm-dialog-cancel"));
    expect(props.onDelete).not.toHaveBeenCalled();
    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
  });

  // --- Inline rename ---

  it("starts rename on pencil button click", () => {
    renderCatalog();
    fireEvent.click(screen.getByTestId("rename-btn"));
    expect(screen.getByTestId("rename-input")).toBeInTheDocument();
    expect(screen.getByTestId("rename-input")).toHaveValue("Test Project");
  });

  it("starts rename on double-click of title", () => {
    renderCatalog();
    fireEvent.doubleClick(screen.getByText("Test Project"));
    expect(screen.getByTestId("rename-input")).toBeInTheDocument();
  });

  it("commits rename on Enter", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByTestId("rename-btn"));
    const input = screen.getByTestId("rename-input");
    fireEvent.change(input, { target: { value: "New Name" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(props.onRename).toHaveBeenCalledWith("p1", "New Name");
    expect(screen.queryByTestId("rename-input")).not.toBeInTheDocument();
  });

  it("commits rename on blur", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByTestId("rename-btn"));
    const input = screen.getByTestId("rename-input");
    fireEvent.change(input, { target: { value: "Blurred Name" } });
    fireEvent.blur(input);
    expect(props.onRename).toHaveBeenCalledWith("p1", "Blurred Name");
  });

  it("cancels rename on Escape", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByTestId("rename-btn"));
    const input = screen.getByTestId("rename-input");
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(props.onRename).not.toHaveBeenCalled();
    expect(screen.queryByTestId("rename-input")).not.toBeInTheDocument();
  });

  it("does not commit rename when title is empty/whitespace", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByTestId("rename-btn"));
    const input = screen.getByTestId("rename-input");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(props.onRename).not.toHaveBeenCalled();
  });

  it("does not render rename button when onRename is undefined", () => {
    renderCatalog({ onRename: undefined });
    expect(screen.queryByTestId("rename-btn")).not.toBeInTheDocument();
  });

  // --- Streak badge ---

  it("shows streak badge when streakDays >= 2", () => {
    renderCatalog({ streakDays: 5 });
    expect(screen.getByTestId("streak-badge")).toBeInTheDocument();
    expect(screen.getByTestId("streak-badge").textContent).toContain("5");
  });

  it("does not show streak badge when streakDays < 2", () => {
    renderCatalog({ streakDays: 1 });
    expect(screen.queryByTestId("streak-badge")).not.toBeInTheDocument();
  });

  it("does not show streak badge when streakDays is undefined", () => {
    renderCatalog({ streakDays: undefined });
    expect(screen.queryByTestId("streak-badge")).not.toBeInTheDocument();
  });

  // --- Language toggle ---

  it("calls onToggleLanguage when language button clicked", () => {
    const { props } = renderCatalog();
    fireEvent.click(screen.getByText("EN"));
    expect(props.onToggleLanguage).toHaveBeenCalledOnce();
  });

  it("shows TW for zh-TW language", () => {
    renderCatalog({ language: "zh-TW" });
    expect(screen.getByText("TW")).toBeInTheDocument();
  });

  it("shows CN for zh-CN language", () => {
    renderCatalog({ language: "zh-CN" });
    expect(screen.getByText("CN")).toBeInTheDocument();
  });

  it("highlights language button for non-English", () => {
    renderCatalog({ language: "zh-TW" });
    const langBtn = screen.getByText("TW").closest("button");
    expect(langBtn?.className).toContain("candy-green");
  });

  it("shows white background for English language button", () => {
    renderCatalog({ language: "en-US" });
    const langBtn = screen.getByText("EN").closest("button");
    expect(langBtn?.className).toContain("bg-white");
  });

  // --- Template gallery ---

  it("renders template cards", () => {
    renderCatalog();
    const gallery = screen.getByTestId("template-gallery");
    const cards = within(gallery).getAllByTestId("template-card");
    expect(cards).toHaveLength(STARTER_TEMPLATES.length);
  });

  it("calls onCreateFromTemplate when template card clicked", () => {
    const { props } = renderCatalog();
    const gallery = screen.getByTestId("template-gallery");
    const cards = within(gallery).getAllByTestId("template-card");
    fireEvent.click(cards[0]);
    expect(props.onCreateFromTemplate).toHaveBeenCalledWith(
      STARTER_TEMPLATES[0],
    );
  });

  // --- Sorting ---

  it("sorts projects by updatedAt descending", () => {
    const older = makeProject({
      id: "old",
      title: "Older",
      updatedAt: Date.now() - 86400_000,
    });
    const newer = makeProject({
      id: "new",
      title: "Newer",
      updatedAt: Date.now() - 1000,
    });
    renderCatalog({ projects: [older, newer] });
    const cards = screen.getAllByTestId("project-card");
    expect(within(cards[0]).getByText("Newer")).toBeInTheDocument();
    expect(within(cards[1]).getByText("Older")).toBeInTheDocument();
  });

  // --- Empty state create button ---

  it("calls onCreate from empty state button", () => {
    const { props } = renderCatalog({ projects: [] });
    const buttons = screen.getAllByText("Create New Project");
    fireEvent.click(buttons[1]); // empty state button
    expect(props.onCreate).toHaveBeenCalled();
  });
});
