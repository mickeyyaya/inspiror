import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BuildingOverlay } from "./BuildingOverlay";

const FACTS = ["Fact one", "Fact two", "Fact three"];

describe("BuildingOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when not loading", () => {
    const { container } = render(
      <BuildingOverlay isLoading={false} buildingText="BUILDING!" facts={FACTS} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders overlay with building text and first fact when loading", () => {
    render(
      <BuildingOverlay isLoading={true} buildingText="BUILDING!" facts={FACTS} />,
    );
    expect(screen.getByTestId("hacker-mode-overlay")).toBeInTheDocument();
    expect(screen.getByText("BUILDING!")).toBeInTheDocument();
    expect(screen.getByTestId("coding-fact")).toBeInTheDocument();
    expect(screen.getByText("Fact one")).toBeInTheDocument();
  });

  it("cycles to next fact after 4 seconds", () => {
    render(
      <BuildingOverlay isLoading={true} buildingText="BUILDING!" facts={FACTS} />,
    );
    expect(screen.getByText("Fact one")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByText("Fact two")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByText("Fact three")).toBeInTheDocument();
  });

  it("wraps around to first fact after reaching the end", () => {
    render(
      <BuildingOverlay isLoading={true} buildingText="BUILDING!" facts={FACTS} />,
    );

    act(() => vi.advanceTimersByTime(4000 * 3));
    expect(screen.getByText("Fact one")).toBeInTheDocument();
  });

  it("clears interval when unmounted", () => {
    const { unmount } = render(
      <BuildingOverlay isLoading={true} buildingText="BUILDING!" facts={FACTS} />,
    );
    const clearSpy = vi.spyOn(global, "clearInterval");
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("handles empty facts array gracefully", () => {
    render(
      <BuildingOverlay isLoading={true} buildingText="BUILDING!" facts={[]} />,
    );
    expect(screen.getByTestId("hacker-mode-overlay")).toBeInTheDocument();
    expect(screen.queryByTestId("coding-fact")).not.toBeInTheDocument();
  });
});
