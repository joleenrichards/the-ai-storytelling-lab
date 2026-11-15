import { expect, it } from "vitest";
import { restoreCampaign, starterCampaign } from "./campaign";
it("preserves draft content when retiring the Newsletter selection", () => {
  const saved = { ...starterCampaign(), activeCopy: "My newsletter draft.", utmParams: { destination: "https://example.com", platform: "newsletter", format: "header-cta" } };
  const restored = restoreCampaign(JSON.stringify(saved));
  expect(restored.activeCopy).toBe("My newsletter draft.");
  expect(restored.utmParams).toEqual({ destination: "https://example.com", platform: "linkedin", format: "text-post" });
});
it("starts every tool with field-guide-launch and a usable draft", () => {
  const draft = starterCampaign();
  expect(draft.campaignName).toBe("field-guide-launch");
  expect(draft.activeCopy.length).toBeGreaterThan(5);
  expect(draft.utmParams.destination).toBe("https://fieldnotes.studio/field-guide");
});
it("restores campaign copy, tone, format, grade and tracking", () => {
  const draft = { ...starterCampaign(), campaignName: "my-launch", activeCopy: "My saved story.", selectedTone: "Contrarian", selectedFormat: "Poll", selectedColorGrade: "warm", utmParams: { destination: "https://example.org", platform: "linkedin", format: "poll" } };
  expect(restoreCampaign(JSON.stringify(draft))).toEqual(draft);
});
it.each([null, "bad json", '{"version":99}', JSON.stringify({ ...starterCampaign(), selectedFormat: "broken" })])("recovers invalid storage safely", (raw) => {
  expect(restoreCampaign(raw)).toEqual(starterCampaign());
});