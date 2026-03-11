import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ParamEditor } from "./ParamEditor";
import type { BlockParam } from "../../types/block";

function makeParam(overrides: Partial<BlockParam> = {}): BlockParam {
  return {
    key: "test-key",
    label: "Test Label",
    type: "number",
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    ...overrides,
  };
}

describe("ParamEditor", () => {
  describe("number type", () => {
    it("renders as range slider", () => {
      render(
        <ParamEditor
          param={makeParam({ type: "number" })}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("range slider has correct min, max, step attributes", () => {
      render(
        <ParamEditor
          param={makeParam({
            type: "number",
            min: 10,
            max: 200,
            step: 5,
            value: 50,
          })}
          onChange={vi.fn()}
        />,
      );
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("min", "10");
      expect(slider).toHaveAttribute("max", "200");
      expect(slider).toHaveAttribute("step", "5");
    });

    it("range slider uses defaults when min/max/step are absent", () => {
      const param = makeParam({ type: "number", value: 50 });
      delete param.min;
      delete param.max;
      delete param.step;
      render(<ParamEditor param={param} onChange={vi.fn()} />);
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("min", "0");
      expect(slider).toHaveAttribute("max", "100");
      expect(slider).toHaveAttribute("step", "1");
    });

    it("shows current value as label text", () => {
      render(
        <ParamEditor
          param={makeParam({ type: "number", value: 42 })}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("calls onChange with number value on slider change", () => {
      const onChange = vi.fn();
      render(
        <ParamEditor
          param={makeParam({ type: "number", value: 50 })}
          onChange={onChange}
        />,
      );
      fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });
      expect(onChange).toHaveBeenCalledWith("test-key", 75);
    });

    it("passes a Number (not string) to onChange", () => {
      const onChange = vi.fn();
      render(
        <ParamEditor
          param={makeParam({ type: "number", value: 0 })}
          onChange={onChange}
        />,
      );
      fireEvent.change(screen.getByRole("slider"), { target: { value: "33" } });
      expect(typeof onChange.mock.calls[0][1]).toBe("number");
    });

    it("has aria-label matching param label", () => {
      render(
        <ParamEditor
          param={makeParam({ type: "number", label: "Speed" })}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("slider", { name: "Speed" })).toBeInTheDocument();
    });
  });

  describe("color type", () => {
    it("renders a color picker input", () => {
      const { container } = render(
        <ParamEditor
          param={makeParam({ type: "color", value: "#ff0000" })}
          onChange={vi.fn()}
        />,
      );
      expect(
        container.querySelector('input[type="color"]'),
      ).toBeInTheDocument();
    });

    it("calls onChange with new color string on change", () => {
      const onChange = vi.fn();
      render(
        <ParamEditor
          param={makeParam({ type: "color", value: "#ff0000" })}
          onChange={onChange}
        />,
      );
      const input = document.querySelector(
        'input[type="color"]',
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "#00ff00" } });
      expect(onChange).toHaveBeenCalledWith("test-key", "#00ff00");
    });

    it("has aria-label matching param label", () => {
      const { container } = render(
        <ParamEditor
          param={makeParam({
            type: "color",
            label: "Background Color",
            value: "#fff",
          })}
          onChange={vi.fn()}
        />,
      );
      const input = container.querySelector('input[type="color"]');
      expect(input).toHaveAttribute("aria-label", "Background Color");
    });
  });

  describe("string type", () => {
    it("renders a text input", () => {
      render(
        <ParamEditor
          param={makeParam({ type: "string", value: "hello" })}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("calls onChange with string value on input change", () => {
      const onChange = vi.fn();
      render(
        <ParamEditor
          param={makeParam({ type: "string", value: "old" })}
          onChange={onChange}
        />,
      );
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "new value" },
      });
      expect(onChange).toHaveBeenCalledWith("test-key", "new value");
    });

    it("has aria-label matching param label", () => {
      render(
        <ParamEditor
          param={makeParam({ type: "string", label: "Player Name", value: "" })}
          onChange={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("textbox", { name: "Player Name" }),
      ).toBeInTheDocument();
    });
  });

  describe("boolean type", () => {
    it("renders a toggle switch button", () => {
      render(
        <ParamEditor
          param={makeParam({ type: "boolean", value: true })}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("calls onChange with toggled boolean (true -> false)", () => {
      const onChange = vi.fn();
      render(
        <ParamEditor
          param={makeParam({ type: "boolean", value: true })}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledWith("test-key", false);
    });

    it("calls onChange with toggled boolean (false -> true)", () => {
      const onChange = vi.fn();
      render(
        <ParamEditor
          param={makeParam({ type: "boolean", value: false })}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledWith("test-key", true);
    });

    it("has aria-label indicating current state when on", () => {
      render(
        <ParamEditor
          param={makeParam({ type: "boolean", label: "Gravity", value: true })}
          onChange={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("switch", { name: "Gravity: on" }),
      ).toBeInTheDocument();
    });

    it("has aria-label indicating current state when off", () => {
      render(
        <ParamEditor
          param={makeParam({ type: "boolean", label: "Gravity", value: false })}
          onChange={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("switch", { name: "Gravity: off" }),
      ).toBeInTheDocument();
    });
  });

  describe("enum type", () => {
    it("renders a dropdown select", () => {
      render(
        <ParamEditor
          param={makeParam({
            type: "enum",
            value: "easy",
            options: ["easy", "medium", "hard"],
          })}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders all options in the dropdown", () => {
      render(
        <ParamEditor
          param={makeParam({
            type: "enum",
            value: "easy",
            options: ["easy", "medium", "hard"],
          })}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("option", { name: "easy" })).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "medium" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "hard" })).toBeInTheDocument();
    });

    it("calls onChange with selected value on change", () => {
      const onChange = vi.fn();
      render(
        <ParamEditor
          param={makeParam({
            type: "enum",
            value: "easy",
            options: ["easy", "medium", "hard"],
          })}
          onChange={onChange}
        />,
      );
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "hard" },
      });
      expect(onChange).toHaveBeenCalledWith("test-key", "hard");
    });

    it("renders empty dropdown when options is undefined", () => {
      const param = makeParam({ type: "enum", value: "" });
      delete param.options;
      render(<ParamEditor param={param} onChange={vi.fn()} />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.queryAllByRole("option")).toHaveLength(0);
    });

    it("has aria-label matching param label", () => {
      render(
        <ParamEditor
          param={makeParam({
            type: "enum",
            label: "Difficulty",
            value: "easy",
            options: ["easy"],
          })}
          onChange={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("combobox", { name: "Difficulty" }),
      ).toBeInTheDocument();
    });
  });

  describe("unknown type", () => {
    it("returns null for unrecognized param type", () => {
      const param = makeParam({ type: "unknown" as never });
      const { container } = render(
        <ParamEditor param={param} onChange={vi.fn()} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });
});
