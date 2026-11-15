import { useState } from "react";
import { Card, CopyBtn, Field, LabButton, Seg, ToolHead, input, label } from "./ui";
import { FORMATS, SHOT_PRESETS, productionSheet, type Shot, type ShotFormat } from "./shots";
import type { UtmFormat } from "./utm";
import { FramePreview } from "./FramePreview";
import { COLOR_GRADES, DEFAULT_COLOR_GRADE, colorGradeBrief, type ColorGrade } from "./color-grade";
import { ColorGradePicker } from "./ColorGradePicker";

export function ShotTool({ hook, onHookChange, onNext, format, onFormatChange, shotNote, onShotNoteChange, topic = "Storytelling", illustration = null, selectedColorGrade, onColorGradeChange }: { hook: string; onHookChange: (hook: string) => void; onNext: (format: UtmFormat) => void; format?: ShotFormat; onFormatChange?: (format: ShotFormat) => void; shotNote?: string; onShotNoteChange?: (note: string) => void; topic?: string; illustration?: string | null; selectedColorGrade?: ColorGrade; onColorGradeChange?: (grade: ColorGrade) => void }) {
  const [localFormat, setLocalFormat] = useState<ShotFormat>("9:16 Reel");
  const fmt = format ?? localFormat;
  const setFmt = (next: ShotFormat) => { setLocalFormat(next); onFormatChange?.(next); };
  const [shotsByFormat, setShotsByFormat] = useState<Record<ShotFormat, Shot[]>>(() => ({
    "9:16 Reel": SHOT_PRESETS["9:16 Reel"].shots.map((shot) => ({ ...shot })),
    "4:5 Carousel": SHOT_PRESETS["4:5 Carousel"].shots.map((shot) => ({ ...shot })),
    "1:1 Feed / Series": SHOT_PRESETS["1:1 Feed / Series"].shots.map((shot) => ({ ...shot })),
    "Poll": SHOT_PRESETS.Poll.shots.map((shot) => ({ ...shot })),
  }));
  const shots = shotsByFormat[fmt];
  const setShots = (next: Shot[]) => setShotsByFormat((current) => ({ ...current, [fmt]: next }));
  const [newShot, setNewShot] = useState("");
  const [customLight, setLight] = useState<string | null>(null);
  const [customLens, setLens] = useState<string | null>(null);
  const preset = SHOT_PRESETS[fmt];
  const light = shotNote ?? customLight ?? preset.light;
  const lens = customLens ?? preset.lens;
  const [localGrade, setLocalGrade] = useState<ColorGrade>(DEFAULT_COLOR_GRADE);
  const grade = selectedColorGrade ?? localGrade;
  const palette = COLOR_GRADES[grade];
  const pal = [{ n: "Paper", h: palette.paper }, { n: "Primary Stroke", h: palette.primary }, { n: "Secondary", h: palette.secondary }];

  const sheet = productionSheet(fmt, hook, shots, light, lens, pal, grade);
  const ai = `Create a ${shots.length}-frame storyboard for a ${fmt} social video/photo set. Aspect ratio ${fmt.split(" ")[0]}.\nFraming specs: ${preset.spec}\nNarrative hook: ${hook}\n${shots.map((s, i) => `Frame ${i + 1} (${s.name}): ${s.note}.`).join("\n")}\nLighting: ${light}\nLens: ${lens}\n${colorGradeBrief(grade)}. Color grade palette: ${pal.map((p) => `${p.n.toLowerCase()} ${p.h}`).join(", ")}. Cinematic, natural texture, editorial mood.`;

  return (
    <div>
      <ToolHead no="02" stage="Production" title="Shot List" desc="Give the story a frame, a rhythm, and a little texture." />
      <div className="mb-4"><Seg options={FORMATS} value={fmt} onChange={setFmt} /></div>
      <div className="mb-4 border border-terracotta bg-card px-3 py-2 text-left font-mono text-xs leading-relaxed text-terracotta">{preset.spec}</div>
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className={label}>Shot checklist</div>
          <ul className="mt-3 space-y-3">
            {shots.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-left">
                <input type="checkbox" aria-label={`Complete ${s.name}`} className="mt-2 accent-primary" checked={s.done} onChange={() => setShots(shots.map((x, j) => j === i ? { ...x, done: !x.done } : x))} />
                <div className="min-w-0 flex-1">
                  <div className={`text-xl ${s.done ? "text-muted-foreground line-through" : ""}`}>{s.name}</div>
                  <textarea rows={2} aria-label={`${s.name} framing notes`} className="w-full resize-y bg-transparent font-mono text-xs text-muted-foreground outline-none focus:text-foreground" value={s.note} onChange={(e) => setShots(shots.map((x, j) => j === i ? { ...x, note: e.target.value } : x))} />
                </div>
                <LabButton aria-label={`Remove ${s.name}`} title={`Remove ${s.name}`} className="border-0 px-2 text-muted-foreground" onClick={() => setShots(shots.filter((_, j) => j !== i))}>✕</LabButton>
              </li>
            ))}
          </ul>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (newShot.trim()) { setShots([...shots, { name: newShot.trim(), note: "Add note", done: false }]); setNewShot(""); } }}>
            <input aria-label="New shot" className={`${input} mt-0 min-w-0`} placeholder="Add a shot…" value={newShot} onChange={(e) => setNewShot(e.target.value)} />
            <LabButton type="submit">Add</LabButton>
          </form>
        </Card>
        <div className="space-y-4">
          <FramePreview selectedColorGrade={grade} format={fmt} topic={topic} illustration={illustration} />
          <Card>
            <Field name="Lighting notes"><textarea rows={3} className={`${input} text-base`} value={light} onChange={(e) => { setLight(e.target.value); onShotNoteChange?.(e.target.value); }} /></Field>
            <div className="mt-3"><Field name="Lens notes"><textarea rows={2} className={`${input} text-base`} value={lens} onChange={(e) => setLens(e.target.value)} /></Field></div>
          </Card>
        </div>
      </div>
      <ColorGradePicker value={grade} onChange={(next) => { setLocalGrade(next); onColorGradeChange?.(next); }} />
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyBtn primary text={sheet}>Copy Production Sheet</CopyBtn>
        <CopyBtn text={ai}>Copy as AI storyboard prompt</CopyBtn>
        <LabButton primary onClick={() => onNext(preset.content)}>Move to UTM Builder →</LabButton>
      </div>
    </div>
  );
}
