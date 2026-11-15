import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShotTool } from "./ShotTool";
import { productionSheet, SHOT_PRESETS } from "./shots";

function renderShots() {
  render(<ShotTool hook="A fresh perspective" onHookChange={() => {}} onNext={() => {}} />);
}

describe("shot format switching", () => {
  it("switches untouched checklists and technical defaults between Reel and Carousel", () => {
    renderShots();
    expect(screen.getByRole("checkbox", { name: "Complete 0–3s Visual Hook" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Lighting notes" })).toHaveValue("24fps primary / 60fps B-roll; soft diffused key light at 45°; leave headroom for burned-in captions.");
    fireEvent.click(screen.getByRole("button", { name: "4:5 Carousel" }));
    expect(screen.getByRole("checkbox", { name: "Complete Slide 1 Cover Shot" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Complete 0–3s Visual Hook" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Lighting notes" })).toHaveValue("High-res vertical stills; lock white balance and exposure across shots so swipe transitions feel cohesive.");
    expect(screen.getByRole("textbox", { name: "Lens notes" })).toHaveValue(SHOT_PRESETS["4:5 Carousel"].lens);
    fireEvent.click(screen.getByRole("button", { name: "9:16 Reel" }));
    expect(screen.getByRole("textbox", { name: "Lighting notes" })).toHaveValue(SHOT_PRESETS["9:16 Reel"].light);
  });

  it("preserves typed technical notes and each format's edited checklist", () => {
    renderShots();
    fireEvent.change(screen.getByRole("textbox", { name: "Lighting notes" }), { target: { value: "Window light at sunset" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Lens notes" }), { target: { value: "50mm" } });
    fireEvent.change(screen.getByRole("textbox", { name: "0–3s Visual Hook framing notes" }), { target: { value: "Pour toward the lens" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Complete 0–3s Visual Hook" }));
    fireEvent.click(screen.getByRole("button", { name: "4:5 Carousel" }));
    expect(screen.getByRole("textbox", { name: "Lighting notes" })).toHaveValue("Window light at sunset");
    expect(screen.getByRole("textbox", { name: "Lens notes" })).toHaveValue("50mm");
    fireEvent.change(screen.getByRole("textbox", { name: "Lighting notes" }), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "9:16 Reel" }));
    expect(screen.getByRole("textbox", { name: "Lighting notes" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "0–3s Visual Hook framing notes" })).toHaveValue("Pour toward the lens");
    expect(screen.getByRole("checkbox", { name: "Complete 0–3s Visual Hook" })).toBeChecked();
  });

  it.each(["9:16 Reel", "4:5 Carousel"] as const)("exports the active %s specs and checklist", (format) => {
    const preset = SHOT_PRESETS[format];
    const output = productionSheet(format, "Fresh perspective", preset.shots, preset.light, preset.lens, []);
    expect(output).toContain(`PRODUCTION SHEET — ${format}`);
    expect(output).toContain(format === "9:16 Reel" ? "1080 × 1920px • Center 4:5 safe zone (clear of UI overlays)" : "1080 × 1350px • Leave 15% negative space for editorial headlines");
    preset.shots.forEach((shot) => expect(output).toContain(shot.name));
    expect(output).toContain(preset.light);
  });

  it("copies the selected mode with current edited notes and completion states", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderShots();
    fireEvent.click(screen.getByRole("button", { name: "4:5 Carousel" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Lighting notes" }), { target: { value: "Custom softbox" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Complete Slide 1 Cover Shot" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy Production Sheet" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const output = writeText.mock.calls[0]?.[0];
    expect(output).toContain("PRODUCTION SHEET — 4:5 Carousel");
    expect(output).toContain("1080 × 1350px");
    expect(output).toContain("[x] 1. Slide 1 Cover Shot");
    expect(output).toContain("Custom softbox");
    expect(output).not.toContain("Eye-Level Talking Head");
  });
});