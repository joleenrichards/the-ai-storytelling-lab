import { expect, it } from "vitest";
import { restoreCampaign, starterCampaign } from "./campaign";
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