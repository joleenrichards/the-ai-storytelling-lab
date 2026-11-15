import { z } from "zod";
import { PLATFORM_FORMATS, type UtmFormat } from "./utm";
import { analyze } from "@/lib/abtest";
import { comparisonVerdict } from "./comparison";

export const FIELD_LOG_KEY = "storytelling-lab:field-logs:v1";
export const CHECK_IN_MS = 48 * 60 * 60 * 1000;
export const EMPTY_RESULTS = { ia: "", ea: "", ib: "", eb: "" };
export const SAMPLE_RESULTS = { ia: "12400", ea: "248", ib: "11850", eb: "356" };
const allowedFormats = new Set<string>(Object.values(PLATFORM_FORMATS).flat());
const format = z.custom<UtmFormat>((value) => typeof value === "string" && allowedFormats.has(value));
const result = z.string().max(16).regex(/^\d*$/);
const resultsSchema = z.object({ ia: result, ea: result, ib: result, eb: result });
const logSchema = z.object({
  id: z.string().min(1).max(100), name: z.string().max(200), copy: z.string().max(12000),
  formats: z.object({ a: format, b: format }), results: resultsSchema,
  savedAt: z.number().finite().nonnegative(), checkInAt: z.number().finite().nonnegative(),
  status: z.enum(["awaiting", "completed"]),
  url: z.string().max(4000), platform: z.string().max(30), aspectRatio: z.enum(["9:16", "4:5", "1:1"]),
  shotNote: z.string().max(12000), colorGrade: z.enum(["warm", "botanical", "archival"]),
});
export type FieldLog = z.infer<typeof logSchema>;
export type FieldResults = z.infer<typeof resultsSchema>;
export type DraftSnapshot = Pick<FieldLog, "copy" | "url" | "platform" | "aspectRatio" | "shotNote" | "colorGrade">;
export const EXAMPLE_LOG: FieldLog = {
  id: "sample-spring", name: "spring-field-notes-launch", copy: "A spring story, told in small details. Meet the makers behind this season’s field notes.",
  formats: { a: "document-carousel", b: "single-image" }, results: SAMPLE_RESULTS,
  savedAt: 1794484800000, checkInAt: 1794657600000, status: "completed", url: "", platform: "linkedin", aspectRatio: "4:5", shotNote: "Soft daylight; consistent framing.", colorGrade: "botanical",
};
export function parseFieldLogs(raw: string | null): FieldLog[] {
  if (!raw) return [EXAMPLE_LOG];
  try {
    const parsed = z.array(logSchema).max(50).safeParse(JSON.parse(raw));
    if (!parsed.success) return [EXAMPLE_LOG];
    return parsed.data.length ? parsed.data : [EXAMPLE_LOG];
  } catch { return [EXAMPLE_LOG]; }
}
export function bookmarkCampaign(name: string, draft: DraftSnapshot, formats: FieldLog["formats"], results: FieldResults, now: number): FieldLog {
  return { ...draft, name: name || "Untitled campaign", id: `campaign-${now}`, formats: { ...formats }, results: { ...results }, savedAt: now, checkInAt: now + CHECK_IN_MS, status: "awaiting" };
}
export function validResults(results: FieldResults) {
  return Object.values(results).every((value) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)))
    && Number(results.ia) > 0 && Number(results.ib) > 0 && Number(results.ea) <= Number(results.ia) && Number(results.eb) <= Number(results.ib);
}
export function fieldNoteVerdict(results: FieldResults, formats: FieldLog["formats"]) {
  if (!validResults(results)) return "Enter impressions and link clicks for both variants. Clicks must not exceed impressions.";
  return comparisonVerdict(Number(results.ia), Number(results.ea), Number(results.ib), Number(results.eb), formats, "Link Clicks");
}
export function fieldLogStats(results: FieldResults) {
  if (!validResults(results)) return { ra: 0, rb: 0, lift: 0, confidence: 0 };
  return analyze(Number(results.ia), Number(results.ea), Number(results.ib), Number(results.eb));
}