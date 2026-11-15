import { expect, it } from "vitest";
import { classifyVisual, nextVisualCategory, VISUAL_CATEGORIES, VISUAL_DRAWINGS } from "./visuals";
import { sanitizeIllustration } from "./illustration";
import { restoreCampaign, starterCampaign } from "./campaign";
it("provides twelve distinct safe drawings and cycles back to the first", () => {
  expect(VISUAL_CATEGORIES).toEqual(["bakery", "coffee", "pets", "wellness", "tech", "books", "travel", "home", "fashion", "nature", "finance", "editorial"]);
  expect(new Set(Object.values(VISUAL_DRAWINGS)).size).toBe(12);
  for (const category of VISUAL_CATEGORIES) expect(sanitizeIllustration(VISUAL_DRAWINGS[category])).not.toBeNull();
  expect(nextVisualCategory("editorial")).toBe("bakery");
  expect(nextVisualCategory("coffee")).toBe("pets");
});
it.each([["Pet portrait campaign", "pets"], ["Dog and kitten adoption launch", "pets"], ["Artisan bakery sourdough", "bakery"], ["Coffee roasting", "coffee"], ["Yoga wellness", "wellness"], ["Software tools", "tech"], ["Book launch", "books"], ["Travel hotel guide", "travel"], ["Home goods ceramics", "home"], ["Fashion jewelry", "fashion"], ["Botanical garden", "nature"], ["Investment budget", "finance"], ["An unfamiliar niche", "editorial"]] as const)("classifies %s locally", (topic, category) => expect(classifyVisual(topic)).toBe(category));
it("preserves a swapped visual on refresh and clears it for a new campaign", () => {
  const saved = { ...starterCampaign(), visual: { topic: "Pets", category: "pets", label: "Pet portrait", svg: VISUAL_DRAWINGS.pets } };
  expect(restoreCampaign(JSON.stringify(saved)).visual).toEqual(saved.visual);
  expect(starterCampaign().visual).toBeNull();
});
