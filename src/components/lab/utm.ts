export const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function buildUtm(url: string, source: string, campaign: string, content: string) {
  let base = url.trim().toLowerCase();
  if (!base) return "";
  if (!/^https?:\/\//.test(base)) base = "https://" + base;
  const medium = source === "newsletter" ? "email" : "social";
  const q = `utm_source=${slug(source)}&utm_medium=${medium}&utm_campaign=${slug(campaign)}&utm_content=${slug(content)}`;
  return base + (base.includes("?") ? "&" : "?") + q;
}
