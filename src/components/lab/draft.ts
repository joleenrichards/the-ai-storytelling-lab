import type { ShotFormat } from "./shots";
import type { UtmFormat } from "./utm";

export type AspectRatio = "9:16" | "4:5" | "1:1";
export const ASPECT_FORMATS: Record<AspectRatio, ShotFormat> = {
  "9:16": "9:16 Reel",
  "4:5": "4:5 Carousel",
  "1:1": "1:1 Feed / Series",
};
export function aspectForFormat(format: ShotFormat): AspectRatio {
  if (format === "4:5 Carousel") return "4:5";
  if (format === "1:1 Feed / Series" || format === "Poll") return "1:1";
  return "9:16";
}
export function fullPost(copy: string, url: string) {
  return [copy.trim(), url.trim()].filter(Boolean).join("\n\n");
}

export function proofMedia(format: string): { poll: boolean; aspectRatio: AspectRatio } {
  const normalized = format.toLowerCase();
  return { poll: normalized.includes("poll"), aspectRatio: /9:16|story|vertical/.test(normalized) ? "9:16" : /4:5|carousel|portrait/.test(normalized) ? "4:5" : "1:1" };
}

export function productionFormatForTracking(format: UtmFormat): ShotFormat {
  if (format.includes("poll")) return "Poll";
  if (/reel|video|story/.test(format)) return "9:16 Reel";
  if (format.includes("carousel")) return "4:5 Carousel";
  return "1:1 Feed / Series";
}