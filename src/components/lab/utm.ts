export const PLATFORMS = ["linkedin", "facebook", "instagram", "tiktok", "newsletter", "x"] as const;
export type UtmPlatform = (typeof PLATFORMS)[number];
export const PLATFORM_FORMATS = {
  linkedin: ["document-carousel", "photo-series", "single-image", "video", "poll", "text-post"],
  facebook: ["reel", "photo-series", "single-image", "carousel", "story", "link-post"],
  instagram: ["reel", "carousel", "single-image", "story"],
  tiktok: ["video", "photo-carousel", "story"],
  newsletter: ["header-cta", "inline-link", "digest-card", "footer-link"],
  x: ["text-post", "single-image", "video", "poll", "link-post"],
} as const;
export type UtmFormat = (typeof PLATFORM_FORMATS)[UtmPlatform][number];
export type TrackingSelection = { platform: UtmPlatform; format: UtmFormat };

export function compatibleFormat(platform: UtmPlatform, format: UtmFormat): UtmFormat {
  const formats: readonly UtmFormat[] = PLATFORM_FORMATS[platform];
  return formats.includes(format) ? format : formats[0] ?? "reel";
}

export function shotTracking(format: UtmFormat): TrackingSelection {
  const platform = format === "photo-series" || format === "poll" ? "linkedin" : "instagram";
  return { platform, format: compatibleFormat(platform, format) };
}

export const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function buildUtm(url: string, source: string, campaign: string, content: string) {
  let base = url.trim().toLowerCase();
  if (!base) return "";
  if (!/^https?:\/\//.test(base)) base = "https://" + base;
  const medium = source === "newsletter" ? "email" : "organic-social";
  const q = `utm_source=${slug(source)}&utm_medium=${medium}&utm_campaign=${slug(campaign)}&utm_content=${slug(content)}`;
  return base + (base.includes("?") ? "&" : "?") + q;
}
