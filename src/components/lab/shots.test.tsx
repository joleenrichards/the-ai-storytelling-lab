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

  it("exports the Feed / Series framing, four shots, and camera defaults", () => {
    const preset = SHOT_PRESETS["1:1 Feed / Series"];
    const output = productionSheet("1:1 Feed / Series", "Fresh perspective", preset.shots, preset.light, preset.lens, []);
    expect(preset.shots).toHaveLength(4);
    expect(output).toContain("PRODUCTION SHEET — 1:1 Feed / Series");
    expect(output).toContain("1200 × 1200px (1:1) or 4:5 Lead • Cohesive contact-sheet grid");
    expect(output).toContain("Hero Anchor Frame — Wide/environmental shot with clean subject separation");
    expect(output).toContain("Process / Candid Action Shot — Human context for Tile 2");
    expect(output).toContain("Tactile Detail or Data Proof Frame — Tight macro or clean graphic for Tile 3");
    expect(output).toContain("Crop & Thumbnail Check — Verify framing holds up in 1:1 desktop & mobile grids");
    expect(output).toContain("Match white balance and color grade across all frames so the multi-photo collage reads like a unified magazine contact sheet; keep text minimal.");
  });

  it("preserves Feed / Series checklist edits and custom camera notes across modes", () => {
    renderShots();
    fireEvent.click(screen.getByRole("button", { name: "1:1 Feed / Series" }));
    expect(screen.getByRole("textbox", { name: "Lighting notes" })).toHaveValue(SHOT_PRESETS["1:1 Feed / Series"].light);
    fireEvent.change(screen.getByRole("textbox", { name: "Hero Anchor Frame framing notes" }), { target: { value: "Office environmental portrait" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Lighting notes" }), { target: { value: "Window key and bounce" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Complete Hero Anchor Frame" }));
    fireEvent.click(screen.getByRole("button", { name: "9:16 Reel" }));
    expect(screen.getByRole("textbox", { name: "Lighting notes" })).toHaveValue("Window key and bounce");
    fireEvent.click(screen.getByRole("button", { name: "1:1 Feed / Series" }));
    expect(screen.getByRole("textbox", { name: "Hero Anchor Frame framing notes" })).toHaveValue("Office environmental portrait");
    expect(screen.getByRole("checkbox", { name: "Complete Hero Anchor Frame" })).toBeChecked();
  });
});