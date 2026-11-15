export const FORMATS = ["9:16 Reel", "4:5 Carousel"] as const;
export type ShotFormat = (typeof FORMATS)[number];
export type Shot = { name: string; note: string; done: boolean };

export const SHOT_PRESETS = {
  "9:16 Reel": {
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
} satisfies Record<ShotFormat, { spec: string; shots: Shot[]; light: string; lens: string }>;

export function productionSheet(format: ShotFormat, hook: string, shots: Shot[], light: string, lens: string, palette: { n: string; h: string }[]) {
  return `PRODUCTION SHEET — ${format}\n\nFRAMING SPECS\n${SHOT_PRESETS[format].spec}\n\nACTIVE HOOK\n${hook}\n\nSHOT LIST\n${shots.map((s, i) => `${s.done ? "[x]" : "[ ]"} ${i + 1}. ${s.name}${s.note ? ` — ${s.note}` : ""}`).join("\n")}\n\nLIGHTING & CAMERA\n${light}\n\nLENS\n${lens}\n\nGRADE PALETTE\n${palette.map((p) => `${p.n}: ${p.h}`).join("\n")}`;
}