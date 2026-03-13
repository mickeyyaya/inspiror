import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectCatalog } from "./ProjectCatalog";
import {
  STARTER_TEMPLATES,
  type StarterTemplate,
} from "../constants/starterTemplates";
import type { Project } from "../types/project";

const mockOnOpen = vi.fn();
const mockOnDelete = vi.fn();
const mockOnCreate = vi.fn();
const mockOnCreateFromTemplate = vi.fn();
const mockOnToggleLanguage = vi.fn();

const sampleProject: Project = {
  id: "proj-1",
  title: "My Cool Game",
  createdAt: Date.now() - 10000,
  updatedAt: Date.now() - 5000,
  messages: [],
  currentCode: "<html></html>",
};

function renderCatalog(
  overrides: Partial<Parameters<typeof ProjectCatalog>[0]> = {},
) {
  return render(
    <ProjectCatalog
      projects={[]}
      onOpen={mockOnOpen}
      onDelete={mockOnDelete}
      onCreate={mockOnCreate}
      onCreateFromTemplate={mockOnCreateFromTemplate}
      language="en-US"
      onToggleLanguage={mockOnToggleLanguage}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProjectCatalog — template gallery", () => {
  it("renders the template section header", () => {
    renderCatalog();
    expect(screen.getByText("Start from a Template")).toBeInTheDocument();
  });

  it("renders all 6 template cards", () => {
    renderCatalog();
    const cards = screen.getAllByTestId("template-card");
    expect(cards).toHaveLength(6);
  });

  it("renders template emojis and names", () => {
    renderCatalog();
    expect(screen.getByText("Catch the Star")).toBeInTheDocument();
    expect(screen.getByText("Bouncing Emoji")).toBeInTheDocument();
    expect(screen.getByText("Color Mixer")).toBeInTheDocument();
    expect(screen.getByText("Counting Game")).toBeInTheDocument();
    expect(screen.getByText("Magic Wand")).toBeInTheDocument();
    expect(screen.getByText("Emoji Rain")).toBeInTheDocument();
  });

  it("renders template descriptions", () => {
    renderCatalog();
    expect(screen.getByText("Tap a star to score points!")).toBeInTheDocument();
    expect(
      screen.getByText("Watch an emoji bounce around!"),
    ).toBeInTheDocument();
  });

  it("calls onCreateFromTemplate with the correct template when a card is clicked", () => {
    renderCatalog();
    const cards = screen.getAllByTestId("template-card");
    fireEvent.click(cards[0]);
    expect(mockOnCreateFromTemplate).toHaveBeenCalledTimes(1);
    expect(mockOnCreateFromTemplate).toHaveBeenCalledWith(STARTER_TEMPLATES[0]);
  });

  it("calls onCreateFromTemplate with the correct template for each card", () => {
    renderCatalog();
    const cards = screen.getAllByTestId("template-card");
    STARTER_TEMPLATES.forEach((template, i) => {
      fireEvent.click(cards[i]);
      expect(mockOnCreateFromTemplate).toHaveBeenCalledWith(template);
    });
    expect(mockOnCreateFromTemplate).toHaveBeenCalledTimes(STARTER_TEMPLATES.length);
  });

  it("renders the template gallery container", () => {
    renderCatalog();
    expect(screen.getByTestId("template-gallery")).toBeInTheDocument();
  });

  it("renders template section header in zh-TW", () => {
    renderCatalog({ language: "zh-TW" });
    expect(screen.getByText("從範本開始")).toBeInTheDocument();
  });

  it("renders template section header in zh-CN", () => {
    renderCatalog({ language: "zh-CN" });
    expect(screen.getByText("从模板开始")).toBeInTheDocument();
  });

  it("renders template names in zh-TW", () => {
    renderCatalog({ language: "zh-TW" });
    expect(screen.getByText("接住星星")).toBeInTheDocument();
    expect(screen.getByText("彈跳表情")).toBeInTheDocument();
  });

  it("renders template names in zh-CN", () => {
    renderCatalog({ language: "zh-CN" });
    expect(screen.getByText("弹跳表情")).toBeInTheDocument();
    expect(screen.getByText("数数游戏")).toBeInTheDocument();
  });
});

describe("ProjectCatalog — project grid still works", () => {
  it("shows empty state message when no projects", () => {
    renderCatalog();
    expect(
      screen.getByText(
        "You haven't built anything yet! Let's create your first app! ✨",
      ),
    ).toBeInTheDocument();
  });

  it("shows project cards when projects exist", () => {
    renderCatalog({ projects: [sampleProject] });
    expect(screen.getByTestId("project-card")).toBeInTheDocument();
    expect(screen.getByText("My Cool Game")).toBeInTheDocument();
  });

  it("calls onOpen when open project button is clicked", () => {
    renderCatalog({ projects: [sampleProject] });
    fireEvent.click(screen.getByTestId("open-project-btn"));
    expect(mockOnOpen).toHaveBeenCalledWith("proj-1");
  });

  it("calls onCreate when new project button is clicked", () => {
    renderCatalog();
    fireEvent.click(screen.getByTestId("new-project-btn"));
    expect(mockOnCreate).toHaveBeenCalledTimes(1);
  });

  it("template gallery still shows when projects exist", () => {
    renderCatalog({ projects: [sampleProject] });
    expect(screen.getByText("Start from a Template")).toBeInTheDocument();
    const cards = screen.getAllByTestId("template-card");
    expect(cards).toHaveLength(6);
  });
});
