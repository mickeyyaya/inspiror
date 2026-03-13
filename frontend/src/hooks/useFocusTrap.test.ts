import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFocusTrap } from "./useFocusTrap";

function createContainer(...tagNames: string[]): HTMLDivElement {
  const container = document.createElement("div");
  tagNames.forEach((tag) => {
    const el = document.createElement(tag);
    container.appendChild(el);
  });
  document.body.appendChild(container);
  return container;
}

describe("useFocusTrap", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when ref is null", () => {
    const ref = { current: null };
    renderHook(() => useFocusTrap(ref, true));
    // Should not throw
  });

  it("does nothing when active is false", () => {
    const container = createContainer("button", "button");
    const ref = { current: container };
    renderHook(() => useFocusTrap(ref, false));
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
    });
    const spy = vi.spyOn(event, "preventDefault");
    container.dispatchEvent(event);
    expect(spy).not.toHaveBeenCalled();
  });

  it("wraps Tab from last focusable to first", () => {
    const container = createContainer("button", "input", "button");
    const ref = { current: container };
    const buttons = container.querySelectorAll("button, input");
    const lastBtn = buttons[2] as HTMLElement;
    const firstBtn = buttons[0] as HTMLElement;

    renderHook(() => useFocusTrap(ref, true));

    lastBtn.focus();
    expect(document.activeElement).toBe(lastBtn);

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
    });
    vi.spyOn(event, "preventDefault");
    container.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(firstBtn);
  });

  it("wraps Shift+Tab from first focusable to last", () => {
    const container = createContainer("button", "input", "button");
    const ref = { current: container };
    const buttons = container.querySelectorAll("button, input");
    const firstBtn = buttons[0] as HTMLElement;
    const lastBtn = buttons[2] as HTMLElement;

    renderHook(() => useFocusTrap(ref, true));

    firstBtn.focus();
    expect(document.activeElement).toBe(firstBtn);

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
    });
    vi.spyOn(event, "preventDefault");
    container.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(lastBtn);
  });

  it("does not intercept non-Tab keys", () => {
    const container = createContainer("button");
    const ref = { current: container };

    renderHook(() => useFocusTrap(ref, true));

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
    });
    vi.spyOn(event, "preventDefault");
    container.dispatchEvent(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const container = createContainer("button", "button");
    const ref = { current: container };
    const spy = vi.spyOn(container, "removeEventListener");

    const { unmount } = renderHook(() => useFocusTrap(ref, true));
    unmount();

    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});
