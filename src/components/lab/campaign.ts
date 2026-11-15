import { z } from "zod";
import { TONES, SAMPLE_HOOKS } from "./hooks";
import { FORMATS } from "./shots";
import { PLATFORMS, PLATFORM_FORMATS, compatibleFormat, type UtmFormat } from "./utm";

export const CAMPAIGN_KEY = "storytelling-lab:active-campaign:v1";
const formats = new Set<string>(Object.values(PLATFORM_FORMATS).flat());
const utmFormat = z.custom<UtmFormat>((v) => typeof v === "string" && formats.has(v));
export const campaignSchema = z.object({
  version: z.literal(1), campaignName: z.string().max(200), topic: z.string().max(12000),
  activeCopy: z.string().max(12000), selectedTone: z.enum(TONES), audience: z.string().max(2000),
  selectedFormat: z.enum(FORMATS), selectedAspectRatio: z.enum(["9:16", "4:5", "1:1"]),
  selectedColorGrade: z.enum(["warm", "botanical", "archival"]), shotNote: z.string().max(12000).nullable(),
  pollOptions: z.array(z.string().max(1000)).min(3).max(4),
  utmParams: z.object({ destination: z.string().max(4000), platform: z.enum(PLATFORMS), format: utmFormat }),
  comparisonFormats: z.object({ a: utmFormat, b: utmFormat }),
});
export type Campaign = z.infer<typeof campaignSchema>;
export function starterCampaign(): Campaign {
  return { version: 1, campaignName: "field-guide-launch", topic: "A coffee roaster launching a practical brewing field guide", activeCopy: SAMPLE_HOOKS[0]?.text ?? "A brewing field guide worth saving.", selectedTone: "Editorial & Warm", audience: "independent coffee roasters", selectedFormat: "9:16 Reel", selectedAspectRatio: "9:16", selectedColorGrade: "botanical", shotNote: null, pollOptions: ["Option A", "Option B", "Option C"], utmParams: { destination: "https://fieldnotes.studio/field-guide", platform: "instagram", format: "reel" }, comparisonFormats: { a: "poll", b: "single-image" } };
}
export function restoreCampaign(raw: string | null): Campaign {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved?.utmParams?.platform === "newsletter") saved.utmParams = { ...saved.utmParams, platform: "linkedin", format: "text-post" };
    const parsed = campaignSchema.safeParse(saved);
    if (!parsed.success) return starterCampaign();
    return { ...parsed.data, utmParams: { ...parsed.data.utmParams, format: compatibleFormat(parsed.data.utmParams.platform, parsed.data.utmParams.format) } };
  } catch { return starterCampaign(); }
}