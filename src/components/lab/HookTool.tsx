import { useState } from "react";
import { TONES, synthesize, buildPrompt, type Tone } from "./hooks";
import { Card, CopyBtn, Field, LabButton, Seg, ToolHead, input, label } from "./ui";

export function HookTool({ topic, onTopicChange, onSendHook }: { topic: string; onTopicChange: (topic: string) => void; onSendHook: (hook: string) => void }) {
  const [aud, setAud] = useState("independent coffee roasters");
  const [tone, setTone] = useState<Tone>("Editorial & Warm");
  const [open, setOpen] = useState(false);
  const hooks = synthesize(topic, aud, tone);
  const prompt = buildPrompt(topic, aud, tone);
  return (
    <div>
      <ToolHead no="01" stage="Planning" title="Hook & Angle" desc="Test different psychological entry points for a topic before committing to a script or caption—and generate a structured prompt to explore further in your favorite LLM." />
      <Card className="grid gap-5 md:grid-cols-2">
        <Field name="Core topic / stat"><textarea rows={2} className={input} value={topic} onChange={(e) => onTopicChange(e.target.value)} /></Field>
        <Field name="Audience"><input className={input} value={aud} onChange={(e) => setAud(e.target.value)} /></Field>
        <div className="md:col-span-2"><div className={`${label} mb-2`}>Strategic tone</div><Seg options={TONES} value={tone} onChange={setTone} /></div>
      </Card>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {hooks.map((h) => (
          <Card key={h.type} className="flex flex-col text-left">
            <div className="flex items-center justify-between"><span className={label}>{h.type}</span><CopyBtn text={h.text}>Copy</CopyBtn></div>
            <p className="mt-3 flex-1 text-xl leading-snug">{h.text}</p>
            <p className="mt-4 border-t border-border pt-3 text-base italic text-muted-foreground">{h.note}</p>
            <LabButton className="mt-4" onClick={() => onSendHook(h.text)}>Send Hook to Shot List →</LabButton>
          </Card>
        ))}
      </div>
      <section className="mt-6 border-y border-border py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LabButton onClick={() => setOpen(!open)} className="border-0 bg-transparent px-0 text-base normal-case" aria-expanded={open} aria-controls="engineered-prompt">{open ? "▾" : "▸"} Copy Engineered LLM Prompt</LabButton>
          <CopyBtn primary text={prompt}>Copy prompt</CopyBtn>
        </div>
        {open && <pre id="engineered-prompt" className="mt-4 overflow-x-auto whitespace-pre-wrap border border-border bg-background p-4 text-left font-mono text-xs leading-relaxed">{prompt}</pre>}
      </section>
    </div>
  );
}
