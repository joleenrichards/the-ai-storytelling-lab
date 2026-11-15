import { expect, it } from "vitest";
import { buildUtm, compatibleFormat, shotTracking, PLATFORM_FORMATS, PLATFORMS } from "./utm";
it("offers social platforms without Newsletter", () => {
  expect(PLATFORMS).toEqual(["linkedin", "facebook", "instagram", "tiktok", "x", "bluesky"]);
});
it.each(["x", "bluesky"] as const)("maps %s to its exact source and social medium", (platform) => {
  const params = new URL(buildUtm("https://example.com", platform, "launch", "text-post")).searchParams;
  expect(params.get("utm_source")).toBe(platform);
  expect(params.get("utm_medium")).toBe("organic-social");
});
it("allows X polls but falls back to discussion text on Bluesky", () => {
  expect(compatibleFormat("x", "poll")).toBe("poll");
  expect(compatibleFormat("bluesky", "poll")).toBe("text-post");
});
it("builds lowercase utm url", () => {
  expect(buildUtm("Example.com/Shop", "instagram", "Spring Launch 26", "reel")).toBe("https://example.com/shop?utm_source=instagram&utm_medium=organic-social&utm_campaign=spring-launch-26&utm_content=reel");
});
it("newsletter uses email medium and appends to existing query", () => {
  expect(buildUtm("https://a.co/?x=1", "newsletter", "x", "inline-link")).toContain("?x=1&utm_source=newsletter&utm_medium=email");
});
it.each(["linkedin", "facebook", "instagram", "tiktok"] as const)("%s uses organic-social", (platform) => {
  expect(new URL(buildUtm("https://example.com", platform, "launch", PLATFORM_FORMATS[platform][0])).searchParams.get("utm_medium")).toBe("organic-social");
});
it.each([
  ["linkedin", ["document-carousel", "photo-series", "single-image", "video", "poll", "text-post"]],
  ["facebook", ["reel", "photo-series", "single-image", "carousel", "story", "link-post"]],
  ["instagram", ["reel", "carousel", "single-image", "story"]],
  ["tiktok", ["video", "photo-carousel", "story"]],
  ["newsletter", ["header-cta", "inline-link", "digest-card", "footer-link"]],
] as const)("%s supports its channel formats and first-format fallback", (platform, formats) => {
  expect(PLATFORM_FORMATS[platform]).toEqual(formats);
  expect(compatibleFormat(platform, "poll")).toBe(platform === "linkedin" ? "poll" : formats[0]);
  for (const format of PLATFORM_FORMATS[platform]) expect(compatibleFormat(platform, format)).toBe(format);
});
it.each([
  ["reel", "instagram"], ["carousel", "instagram"], ["photo-series", "linkedin"],
] as const)("hands off %s with compatible %s platform", (format, platform) => {
  expect(shotTracking(format)).toEqual({ platform, format });
});
