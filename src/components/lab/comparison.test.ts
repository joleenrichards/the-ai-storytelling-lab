import { describe, expect, it } from "vitest";
import { COMPARISON_FORMATS, SAMPLE_FORMATS, comparisonHandoff, comparisonVerdict, hasFormatBias } from "./comparison";
import { PLATFORM_FORMATS } from "./utm";

describe("format comparisons", () => {
  it("defaults to poll versus single-image", () => {
    expect(SAMPLE_FORMATS).toEqual({ a: "poll", b: "single-image" });
  });
  it("supports the eight requested formats", () => {
    expect(COMPARISON_FORMATS).toEqual(["poll", "single-image", "photo-series", "document-carousel", "reel", "video", "text-post", "link-post"]);
  });
  it.each(Object.values(PLATFORM_FORMATS).flat())("retains exact %s content and selects a contrasting format", (format) => {
    const pair = comparisonHandoff(format);
    expect(pair.a).toBe(format);
    expect(pair.b).toBe(format === "single-image" ? "poll" : "single-image");
  });
  it.each(["Engagements", "Poll Votes"] as const)("flags different formats for %s", (metric) => {
    expect(hasFormatBias(SAMPLE_FORMATS, metric)).toBe(true);
  });
  it("does not flag Link Clicks", () => {
    expect(hasFormatBias(SAMPLE_FORMATS, "Link Clicks")).toBe(false);
  });
  it("does not flag same-format testing", () => {
    expect(hasFormatBias({ a: "poll", b: "poll" }, "Engagements")).toBe(false);
  });
  it("computes winner-relative lift for an A win", () => {
    expect(comparisonVerdict(10000, 640, 10000, 500, SAMPLE_FORMATS, "Link Clicks")).toContain("Variant A (poll) outperformed Variant B (single-image) by +28.0%");
  });
  it("computes winner-relative lift for a B win", () => {
    expect(comparisonVerdict(10000, 500, 10000, 640, SAMPLE_FORMATS, "Engagements")).toContain("Variant B (single-image) outperformed Variant A (poll) by +28.0%");
  });
});