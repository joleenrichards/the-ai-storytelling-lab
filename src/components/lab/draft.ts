import type { ShotFormat } from "./shots";

export type AspectRatio = "9:16" | "4:5" | "1:1";
export const ASPECT_FORMATS: Record<AspectRatio, ShotFormat> = {
  "9:16": "9:16 Reel",
  "4:5": "4:5 Carousel",
  "1:1": "1:1 Feed / Series",
};
export function aspectForFormat(format: ShotFormat): AspectRatio {
  if (format === "4:5 Carousel") return "4:5";
  if (format === "1:1 Feed / Series") return "1:1";
  return "9:16";
}
export function fullPost(copy: string, url: string) {
  return [copy.trim(), url.trim()].filter(Boolean).join("\n\n");
}