import { useState } from "react";
import { TONES, synthesize, buildPrompt, type Tone } from "./hooks";
import { Card, CopyBtn, Field, Seg, ToolHead, input, label } from "./ui";

export function HookTool() {
  const [topic, setTopic] = useState("Carousel posts get 3.1x more saves than single images");
  const [aud, setAud] = useState("independent coffee roasters");
  const [tone, setTone] = useState<Tone>("Editorial & Warm");
  const [open, setOpen] = useState(false);
  const hooks = synthesize(topic, aud, tone);
  const prompt = buildPrompt(topic, aud, tone);
  return (
    <div>
      <ToolHead no="01" title="Hook & Angle Synthesizer" desc="Turn a dry stat into three distinct openers, each with its psychological framing." />
      <Card className="grid gap-5 md:grid-cols-2">
        <Field name="Core topic / stat"><textarea rows={2} className={input} value={topic} onChange={(e) => setTopic(e.target.value)} /></Field>
        <Field name="Audience"><input className={input} value={aud} onChange={(e) => setAud(e.target.value)} /></Field>
        <div className="md:col-span-2"><div className={`${label} mb-2`}>Strategic tone</div><Seg options={TONES} value={tone} onChange={setTone} /></div>
      </Card>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {hooks.map((h) => (
          <Card key={h.type} className="flex flex-col text-left">
            <div className="flex items-center justify-between"><span className={label}>{h.type}</span><CopyBtn text={h.text}>Copy</CopyBtn></div>
            <p className="mt-3 flex-1 text-xl leading-snug">{h.text}</p>
            <p className="mt-4 border-t border-border pt-3 text-base italic text-muted-foreground">{h.note}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setOpen(!open)} className="text-xl" aria-expanded={open}>{open ? "▾" : "▸"} Copy Engineered LLM Prompt</button>
          <CopyBtn primary text={prompt}>Copy prompt</CopyBtn>
        </div>
        {open && <pre className="mt-4 overflow-x-auto whitespace-pre-wrap border border-border bg-background p-4 text-left font-mono text-xs leading-relaxed">{prompt}</pre>}
      </Card>
    </div>
  );
}
