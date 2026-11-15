import { expect, it } from "vitest";
import { hookOutputSchema } from "./hook-generation";
import { VISUAL_CATEGORIES } from "@/components/lab/visuals";
const angles = ["Curiosity Gap", "Contrarian Take", "Story-Led Hook"].map((type, i) => ({ type, hook: `Distinct opening ${i}`, note: "A useful angle." }));
it("accepts all twelve classification categories in the existing hook response", () => {
  for (const visualCategory of VISUAL_CATEGORIES) expect(hookOutputSchema.parse({ angles, visualCategory, visualLabel: "Editorial Sketch: Botanical Pet Portrait" }).visualCategory).toBe(visualCategory);
});
it("keeps usable hooks when visual metadata is missing or unusable", () => {
  expect(hookOutputSchema.parse({ angles, visualCategory: "unknown", visualLabel: "x".repeat(101) }).visualCategory).toBeUndefined();
  expect(hookOutputSchema.parse({ angles }).angles).toHaveLength(3);
});
