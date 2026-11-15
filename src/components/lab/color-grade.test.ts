import { describe, it, expect } from "vitest";
import { COLOR_GRADES, colorGradeBrief, tintIllustration } from "./color-grade";
import { FALLBACK_DRAWINGS, sanitizeIllustration } from "./illustration";
import { productionSheet, SHOT_PRESETS } from "./shots";

describe("shared color grades", () => {
  it.each([
    ["warm", "Warm Editorial", "#F5EBE1", "#C85A32", "#2C241E"],
    ["botanical", "Botanical Daylight", "#EDF3F0", "#1F5E4D", "#C85A32"],
    ["archival", "Archival Studio", "#F2EFE9", "#1C1B19", "#1F5E4D"],
  ] as const)("preserves the requested %s colors and exports the grade", (id, name, paper, primary, secondary) => {
    expect(COLOR_GRADES[id]).toMatchObject({ name, paper, primary, secondary });
    const preset = SHOT_PRESETS["4:5 Carousel"];
    expect(productionSheet("4:5 Carousel", "Copy.", preset.shots, preset.light, preset.lens, [], id)).toContain(`Color Grade: ${name} (${paper} / ${primary} / ${secondary})`);
    expect(colorGradeBrief(id)).toBe(`Color Grade: ${name} (${paper} / ${primary} / ${secondary})`);
  });
  it("recolors validated art without color-replacement collisions", () => {
    const safe = sanitizeIllustration(FALLBACK_DRAWINGS.coffee);
    if (!safe) throw new Error("Missing safe illustration");
    const tinted = tintIllustration(safe, "warm");
    expect(tinted).toContain('stroke="#C85A32"');
    expect(tinted).toContain('stroke="#2C241E"');
    expect(tinted).not.toContain("#1F5E4D");
  });
});