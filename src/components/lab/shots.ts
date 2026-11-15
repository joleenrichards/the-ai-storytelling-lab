import type { UtmFormat } from "./utm";
import { colorGradeBrief, type ColorGrade } from "./color-grade";

export const FORMATS = ["9:16 Reel", "4:5 Carousel", "1:1 Feed / Series", "Poll"] as const;
export type ShotFormat = (typeof FORMATS)[number];
export type Shot = { name: string; note: string; done: boolean };

export const SHOT_PRESETS = {
  "Poll": {
    content: "poll",
    spec: "Native social poll • 3 options • 3-day duration",
    shots: [
      { name: "Question / Hook", note: "One clear question, one decision", done: false },
      { name: "Option Balance", note: "Keep answers distinct and comparable", done: false },
      { name: "Feed Preview Check", note: "Check the question and options before publishing", done: false },
    ],
    light: "Native text poll; no image or lighting setup required.",
    lens: "No camera required; prioritize concise, balanced options.",
  },
  "9:16 Reel": {
    content: "reel",
    spec: "1080 × 1920px • Center 4:5 safe zone (clear of UI overlays)",
    shots: [
      { name: "0–3s Visual Hook", note: "Pattern interrupt or movement in frame", done: false },
      { name: "Tight Texture / Action B-Roll", note: "Shoot at 60fps for smooth slow-mo", done: false },
      { name: "Eye-Level Talking Head", note: "Mid-chest framing, clean audio", done: false },
      { name: "Seamless Loop / Closing CTA Frame", note: "", done: false },
    ],
    light: "24fps primary / 60fps B-roll; soft diffused key light at 45°; leave headroom for burned-in captions.",
    lens: "35mm f/1.8 for talking head, 100mm macro for details, 1/50s at 24fps.",
  },
  "4:5 Carousel": {
    content: "carousel",
    spec: "1080 × 1350px • Leave 15% negative space for editorial headlines",
    shots: [
      { name: "Slide 1 Cover Shot", note: "Clean negative space for bold Garamond title", done: false },
      { name: "Slides 2–3 Process & Detail Stills", note: "Consistent angle & exposure", done: false },
      { name: "Slide 4 Visual Proof / Annotated Detail Frame", note: "", done: false },
      { name: "Final Slide Portrait or Save-Worthy Summary Frame", note: "", done: false },
    ],
    light: "High-res vertical stills; lock white balance and exposure across shots so swipe transitions feel cohesive.",
    lens: "Vertical 4:5 framing; consistent angle & exposure across stills.",
  },
  "1:1 Feed / Series": {
    content: "photo-series",
    spec: "1200 × 1200px (1:1) or 4:5 Lead • Cohesive contact-sheet grid",
    shots: [
      { name: "Hero Anchor Frame", note: "Wide/environmental shot with clean subject separation", done: false },
      { name: "Process / Candid Action Shot", note: "Human context for Tile 2", done: false },
      { name: "Tactile Detail or Data Proof Frame", note: "Tight macro or clean graphic for Tile 3", done: false },
      { name: "Crop & Thumbnail Check", note: "Verify framing holds up in 1:1 desktop & mobile grids", done: false },
    ],
    light: "Match white balance and color grade across all frames so the multi-photo collage reads like a unified magazine contact sheet; keep text minimal.",
    lens: "Wide/environmental hero; tight macro details; check 1:1 crops and a 4:5 lead.",
  },
} satisfies Record<ShotFormat, { content: UtmFormat; spec: string; shots: Shot[]; light: string; lens: string }>;

export function productionSheet(format: ShotFormat, hook: string, shots: Shot[], light: string, lens: string, palette: { n: string; h: string }[], grade?: ColorGrade) {
  return `PRODUCTION SHEET — ${format}\n\nFRAMING SPECS\n${SHOT_PRESETS[format].spec}\n\nACTIVE HOOK\n${hook}\n\nSHOT LIST\n${shots.map((s, i) => `${s.done ? "[x]" : "[ ]"} ${i + 1}. ${s.name}${s.note ? ` — ${s.note}` : ""}`).join("\n")}\n\nLIGHTING & CAMERA\n${light}\n\nLENS\n${lens}\n\nGRADE PALETTE\n${palette.map((p) => `${p.n}: ${p.h}`).join("\n")}${grade ? `\n\n${colorGradeBrief(grade)}` : ""}`;
}