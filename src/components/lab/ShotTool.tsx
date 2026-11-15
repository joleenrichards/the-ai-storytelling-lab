import { useState } from "react";
import { Card, CopyBtn, Field, LabButton, Seg, ToolHead, input, label } from "./ui";
import { FORMATS, SHOT_PRESETS, productionSheet, type Shot, type ShotFormat } from "./shots";
import type { UtmFormat } from "./utm";
import { FramePreview } from "./FramePreview";
const DEFAULT_PAL = [{ n: "Shadows", h: "#1F2B26" }, { n: "Mids", h: "#7A5A43" }, { n: "Highlights", h: "#F2E6D3" }, { n: "Accent", h: "#C85A32" }];

export function ShotTool({ hook, onHookChange, onNext }: { hook: string; onHookChange: (hook: string) => void; onNext: (format: UtmFormat) => void }) {
  const [fmt, setFmt] = useState<ShotFormat>("9:16 Reel");
  const [shotsByFormat, setShotsByFormat] = useState<Record<ShotFormat, Shot[]>>(() => ({
    "9:16 Reel": SHOT_PRESETS["9:16 Reel"].shots.map((shot) => ({ ...shot })),
    "4:5 Carousel": SHOT_PRESETS["4:5 Carousel"].shots.map((shot) => ({ ...shot })),
    "1:1 Feed / Series": SHOT_PRESETS["1:1 Feed / Series"].shots.map((shot) => ({ ...shot })),
  }));
  const shots = shotsByFormat[fmt];
  const setShots = (next: Shot[]) => setShotsByFormat((current) => ({ ...current, [fmt]: next }));
  const [newShot, setNewShot] = useState("");
  const [customLight, setLight] = useState<string | null>(null);
  const [customLens, setLens] = useState<string | null>(null);
  const preset = SHOT_PRESETS[fmt];
  const light = customLight ?? preset.light;
  const lens = customLens ?? preset.lens;
  const [pal, setPal] = useState(DEFAULT_PAL);

  const sheet = productionSheet(fmt, hook, shots, light, lens, pal);
  const ai = `Create a ${shots.length}-frame storyboard for a ${fmt} social video/photo set. Aspect ratio ${fmt.split(" ")[0]}.\nFraming specs: ${preset.spec}\nNarrative hook: ${hook}\n${shots.map((s, i) => `Frame ${i + 1} (${s.name}): ${s.note}.`).join("\n")}\nLighting: ${light}\nLens: ${lens}\nColor grade palette: ${pal.map((p) => `${p.n.toLowerCase()} ${p.h}`).join(", ")}. Cinematic, natural texture, editorial mood.`;

  return (
    <div>
      <ToolHead no="02" stage="Production" title="Shot List" desc="Give the story a frame, a rhythm, and a little texture." />
      <div className="mb-5 border-l-4 border-primary bg-sage p-4"><Field name="Active hook"><textarea rows={3} className={`${input} bg-transparent`} value={hook} onChange={(e) => onHookChange(e.target.value)} /></Field></div>
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
          <FramePreview format={fmt} />
          <Card>
            <Field name="Lighting notes"><textarea rows={3} className={`${input} text-base`} value={light} onChange={(e) => setLight(e.target.value)} /></Field>
            <div className="mt-3"><Field name="Lens notes"><textarea rows={2} className={`${input} text-base`} value={lens} onChange={(e) => setLens(e.target.value)} /></Field></div>
          </Card>
        </div>
      </div>
      <Card className="mt-4">
        <div className={label}>Color grading palette</div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {pal.map((p, i) => (
            <div key={p.n} className="border border-border">
              <label className="block h-20 cursor-pointer" style={{ background: p.h }}>
                <input type="color" aria-label={`${p.n} color`} className="sr-only" value={/^#[0-9a-f]{6}$/i.test(p.h) ? p.h : "#000000"} onChange={(e) => setPal(pal.map((x, j) => j === i ? { ...x, h: e.target.value.toUpperCase() } : x))} />
              </label>
              <div className="p-2"><div className="text-sm">{p.n}</div>
                <input aria-label={`${p.n} hex code`} className="w-full bg-transparent font-mono text-xs outline-none" value={p.h} onChange={(e) => setPal(pal.map((x, j) => j === i ? { ...x, h: e.target.value } : x))} /></div>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyBtn primary text={sheet}>Copy Production Sheet</CopyBtn>
        <CopyBtn text={ai}>Copy as AI storyboard prompt</CopyBtn>
        <LabButton primary onClick={() => onNext(preset.content)}>Move to UTM Builder →</LabButton>
      </div>
    </div>
  );
}
