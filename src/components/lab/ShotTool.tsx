import { useState } from "react";
import { Card, CopyBtn, Field, Seg, ToolHead, btnGhost, input, label } from "./ui";

const FORMATS = ["9:16 Reel", "4:5 Carousel"] as const;
const DEFAULT_SHOTS = [
  { name: "Hook Frame", note: "0–2s, macro pour, motion toward lens", done: true },
  { name: "Detail B-Roll", note: "Beans, steam, hands on grinder", done: false },
  { name: "Talking Head", note: "Roaster on why spring blend", done: false },
  { name: "Closing CTA", note: "Bag on counter, text overlay", done: false },
];
const DEFAULT_PAL = [{ n: "Shadows", h: "#1F2B26" }, { n: "Mids", h: "#7A5A43" }, { n: "Highlights", h: "#F2E6D3" }, { n: "Accent", h: "#C85A32" }];

export function ShotTool() {
  const [fmt, setFmt] = useState<(typeof FORMATS)[number]>("9:16 Reel");
  const [shots, setShots] = useState(DEFAULT_SHOTS);
  const [newShot, setNewShot] = useState("");
  const [light, setLight] = useState("Soft window key from camera left, bounce fill, 5600K. Avoid overheads.");
  const [lens, setLens] = useState("35mm f/1.8 for talking head, 100mm macro for details, 1/50s at 24fps.");
  const [pal, setPal] = useState(DEFAULT_PAL);

  const sheet = `PRODUCTION SHEET — ${fmt}\n\nSHOT LIST\n${shots.map((s, i) => `${s.done ? "[x]" : "[ ]"} ${i + 1}. ${s.name} — ${s.note}`).join("\n")}\n\nLIGHTING\n${light}\n\nLENS\n${lens}\n\nGRADE PALETTE\n${pal.map((p) => `${p.n}: ${p.h}`).join("\n")}`;
  const ai = `Create a ${shots.length}-frame storyboard for a ${fmt} social video/photo set. Aspect ratio ${fmt.split(" ")[0]}.\n${shots.map((s, i) => `Frame ${i + 1} (${s.name}): ${s.note}.`).join("\n")}\nLighting: ${light}\nLens: ${lens}\nColor grade palette: ${pal.map((p) => `${p.n.toLowerCase()} ${p.h}`).join(", ")}. Cinematic, natural texture, editorial mood.`;

  return (
    <div>
      <ToolHead no="04" title="AI Shot-List & Grading Planner" desc="Pre-production for short-form video and photo shoots." />
      <div className="mb-4"><Seg options={FORMATS} value={fmt} onChange={setFmt} /></div>
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className={label}>Shot checklist</div>
          <ul className="mt-3 space-y-3">
            {shots.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-left">
                <input type="checkbox" className="mt-2 accent-primary" checked={s.done} onChange={() => setShots(shots.map((x, j) => j === i ? { ...x, done: !x.done } : x))} />
                <div className="flex-1">
                  <div className={`text-xl ${s.done ? "text-muted-foreground line-through" : ""}`}>{s.name}</div>
                  <input className="w-full bg-transparent font-mono text-xs text-muted-foreground outline-none focus:text-foreground" value={s.note} onChange={(e) => setShots(shots.map((x, j) => j === i ? { ...x, note: e.target.value } : x))} />
                </div>
                <button aria-label={`Remove ${s.name}`} className="font-mono text-xs text-muted-foreground hover:text-terracotta" onClick={() => setShots(shots.filter((_, j) => j !== i))}>✕</button>
              </li>
            ))}
          </ul>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (newShot.trim()) { setShots([...shots, { name: newShot.trim(), note: "Add note", done: false }]); setNewShot(""); } }}>
            <input className={`${input} mt-0`} placeholder="Add a shot…" value={newShot} onChange={(e) => setNewShot(e.target.value)} />
            <button className={btnGhost}>Add</button>
          </form>
        </Card>
        <div className="space-y-4">
          <div className="mx-auto flex items-center justify-center border border-dashed border-terracotta bg-card font-mono text-xs text-terracotta" style={{ aspectRatio: fmt.startsWith("9") ? "9/16" : "4/5", maxHeight: 220 }}>{fmt.split(" ")[0]}</div>
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
                <input type="color" className="sr-only" value={p.h} onChange={(e) => setPal(pal.map((x, j) => j === i ? { ...x, h: e.target.value.toUpperCase() } : x))} />
              </label>
              <div className="p-2"><div className="text-sm">{p.n}</div>
                <input className="w-full bg-transparent font-mono text-xs outline-none" value={p.h} onChange={(e) => setPal(pal.map((x, j) => j === i ? { ...x, h: e.target.value } : x))} /></div>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyBtn primary text={sheet}>Copy Production Sheet</CopyBtn>
        <CopyBtn text={ai}>Copy as AI storyboard prompt</CopyBtn>
      </div>
    </div>
  );
}
