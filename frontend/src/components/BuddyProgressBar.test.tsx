import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BuddyProgressBar } from "./BuddyProgressBar";
import { translations } from "../i18n/translations";

const t = translations["en-US"];

describe("BuddyProgressBar", () => {
  it("shows next avatar name and remaining builds for 0 builds", () => {
    render(<BuddyProgressBar builds={0} t={t} />);
    expect(screen.getByText(/Whiskers/)).toBeInTheDocument();
    expect(screen.getByText(/3 more builds to go!/)).toBeInTheDocument();
  });

  it("shows dragon as next unlock after 3 builds", () => {
    render(<BuddyProgressBar builds={3} t={t} />);
    expect(screen.getByText(/Sparky/)).toBeInTheDocument();
    expect(screen.getByText(/2 more builds to go!/)).toBeInTheDocument();
  });

  it("shows robot as next unlock after 5 builds", () => {
    render(<BuddyProgressBar builds={5} t={t} />);
    expect(screen.getByText(/Bolt/)).toBeInTheDocument();
    expect(screen.getByText(/5 more builds to go!/)).toBeInTheDocument();
  });

  it("shows unicorn as next unlock after 10 builds", () => {
    render(<BuddyProgressBar builds={10} t={t} />);
    expect(screen.getByText(/Star/)).toBeInTheDocument();
    expect(screen.getByText(/10 more builds to go!/)).toBeInTheDocument();
  });

  it("shows all unlocked when builds >= 20", () => {
    render(<BuddyProgressBar builds={25} t={t} />);
    expect(screen.getByText(/All buddies unlocked!/)).toBeInTheDocument();
  });

  it("has a progressbar role with aria attributes", () => {
    render(<BuddyProgressBar builds={2} t={t} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar.getAttribute("aria-valuenow")).toBe("67");
  });

  it("works in Traditional Chinese", () => {
    const tZhTW = translations["zh-TW"];
    render(<BuddyProgressBar builds={0} t={tZhTW} />);
    expect(screen.getByTestId("buddy-progress-bar")).toBeInTheDocument();
  });
});
