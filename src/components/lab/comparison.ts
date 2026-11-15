import { analyze } from "@/lib/abtest";
import type { UtmFormat } from "./utm";

export const COMPARISON_FORMATS = ["poll", "single-image", "photo-series", "document-carousel", "reel", "video", "text-post", "link-post"] as const satisfies readonly UtmFormat[];
export const METRICS = ["Engagements", "Poll Votes", "Link Clicks"] as const;
export type ComparisonMetric = (typeof METRICS)[number];
export type ComparisonFormats = { a: UtmFormat; b: UtmFormat };
export const SAMPLE_FORMATS: ComparisonFormats = { a: "poll", b: "single-image" };

export function comparisonHandoff(format: UtmFormat): ComparisonFormats {
  return { a: format, b: format === "single-image" ? "poll" : "single-image" };
}

export function hasFormatBias(formats: ComparisonFormats, metric: ComparisonMetric) {
  return formats.a !== formats.b && metric !== "Link Clicks";
}

export function comparisonVerdict(ia: number, ea: number, ib: number, eb: number, formats: ComparisonFormats, metric: ComparisonMetric) {
  const { ra, rb, confidence } = analyze(ia, ea, ib, eb);
  const names = `Variant A (${formats.a}) and Variant B (${formats.b})`;
  if (ia <= 0 || ib <= 0) return `Enter impressions for ${names} to get a verdict.`;
  if (ra === rb) return `${names} are dead even. Keep the test running or try a bolder variation.`;
  const aWins = ra > rb;
  const winner = aWins ? `Variant A (${formats.a})` : `Variant B (${formats.b})`;
  const loser = aWins ? `Variant B (${formats.b})` : `Variant A (${formats.a})`;
  const lower = Math.min(ra, rb);
  const difference = lower > 0 ? ` by +${(((Math.max(ra, rb) - lower) / lower) * 100).toFixed(1)}%` : " (the other variant has a zero rate, so relative lift is undefined)";
  const result = `${winner} outperformed ${loser}${difference} in observed ${metric.toLowerCase()} rate, with ${confidence.toFixed(1)}% confidence.`;
  return result + (confidence >= 95
    ? " The rate difference clears the 95% bar; format alone does not establish the cause."
    : confidence >= 80 ? ` Promising, not proven—gather more ${metric.toLowerCase()} before committing.`
    : " Keep testing—the observed edge could easily be noise.");
}