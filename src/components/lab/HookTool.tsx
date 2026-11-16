import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dices, Sparkles, Pencil, Check } from "lucide-react";
import { generateHookAngles } from "@/lib/hooks.functions";
import { TONES, SAMPLE_HOOKS, synthesize, buildPrompt, nextPromptScenario, type Tone } from "./hooks";
import { Card, CopyBtn, Field, LabButton, Seg, ToolHead, input, label } from "./ui";

export function HookTool({ topic, onTopicChange, onSendHook, onActiveHookChange, activeCopy, onIllustrationChange, selectedTone, onToneChange, audience, onAudienceChange }: { selectedTone?: Tone; onToneChange?: (tone: Tone) => void; audience?: string; onAudienceChange?: (audience: string) => void; topic: string; onTopicChange: (topic: string) => void; onSendHook: (hook: string) => void; onActiveHookChange?: (hook: string) => void; activeCopy?: string; onIllustrationChange?: (svg: string | null, topic: string) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>(SAMPLE_HOOKS[0]?.type ?? "Curiosity Gap");
  const [localAud, setLocalAud] = useState("independent coffee roasters");
  const [localTone, setLocalTone] = useState<Tone>("Editorial & Warm");
  const aud = audience ?? localAud;
  const tone = selectedTone ?? localTone;
  const setAud = (value: string) => { setLocalAud(value); onAudienceChange?.(value); };
  const setTone = (value: Tone) => { setLocalTone(value); onToneChange?.(value); };
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [open, setOpen] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(-1);
  const [hooks, setHooks] = useState(SAMPLE_HOOKS);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const generation = useRef(0);
  const history = useRef<string[]>([]);
  const generateAngles = useServerFn(generateHookAngles);
  async function generate(nextTopic = topic, nextAudience = aud) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    const variation = generation.current++;
    onIllustrationChange?.(null, nextTopic);
    let nextHooks;
    try {
      const result = await generateAngles({ data: { topic: nextTopic, audience: nextAudience, voice: tone, previousHooks: history.current } });
      if (!mounted.current) return;
      onIllustrationChange?.(result.illustration ?? null, nextTopic);
      nextHooks = result.angles ?? synthesize(nextTopic, nextAudience, tone, variation);
    } catch {
      nextHooks = synthesize(nextTopic, nextAudience, tone, variation);
    } finally {
      busy.current = false;
      if (mounted.current) setLoading(false);
    }
    if (!mounted.current) return;
    setHooks(nextHooks);
    setEditing(null);
    setActiveType(nextHooks[0]?.type ?? "Curiosity Gap");
    onActiveHookChange?.(nextHooks[0]?.text ?? "");
    history.current = [...history.current, ...nextHooks.map((h) => h.text)].slice(-9);
  }
  const prompt = buildPrompt(topic, aud, tone);
  return (
    <div>
      <ToolHead no="01" stage="Planning" title="Hook & Angle" desc="One topic. Three ways into the story." />
      <Card className="grid gap-5 md:grid-cols-2">
        <div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className={label}>Narrative seed</span><LabButton disabled={loading} className="px-2 py-1 normal-case" onClick={() => { const next = nextPromptScenario(scenarioIndex); setScenarioIndex(next.index); onTopicChange(next.scenario.topic); setAud(next.scenario.audience); void generate(next.scenario.topic, next.scenario.audience); }}><Dices size={16} strokeWidth={1.5} aria-hidden="true" />Try a Prompt</LabButton></div><Field name="Core topic / stat"><textarea rows={2} className={input} value={topic} onChange={(e) => onTopicChange(e.target.value)} /></Field></div>
        <Field name="Audience"><input className={input} value={aud} onChange={(e) => setAud(e.target.value)} /></Field>
        <div className="md:col-span-2"><div className={`${label} mb-2`}>Strategic tone</div><Seg options={TONES} value={tone} onChange={setTone} /></div>
      </Card>
      <div className="mt-4 flex min-h-10 flex-wrap items-center gap-4">
        <LabButton primary disabled={loading} onClick={() => void generate()}><Sparkles size={15} strokeWidth={1.5} aria-hidden="true" />Generate Angles</LabButton>
        <span role="status" className="flex items-center gap-2 text-base italic text-primary">{loading && <><span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse" />Synthesizing angles...</>}</span>
      </div>
      <div aria-busy={loading} className="mt-6 grid gap-4 md:grid-cols-3">
        {hooks.map((angle) => {
          const h = { ...angle, text: angle.type === activeType && activeCopy !== undefined ? activeCopy : angle.text };
          const editCopy = (text: string) => { setActiveType(h.type); setHooks((current) => current.map((item) => item.type === h.type ? { ...item, text } : item)); onActiveHookChange?.(text); };
          return (
          <Card key={h.type} className="flex flex-col text-left">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className={label}>{h.type}</span><div className="flex items-center gap-1"><LabButton disabled={loading} aria-label={`${editing === h.type ? "Finish editing" : "Edit"} ${h.type}`} title={`${editing === h.type ? "Finish editing" : "Edit"} ${h.type}`} className="border-0 p-2" onClick={() => { if (editing === h.type) setEditing(null); else { editCopy(h.text); setEditing(h.type); } }}>{editing === h.type ? <Check size={15} /> : <Pencil size={15} />}</LabButton><CopyBtn text={h.text}>Copy</CopyBtn></div></div>
            {editing === h.type ? <textarea autoFocus aria-label={`${h.type} hook copy`} rows={6} className={`${input} mt-3 flex-1 text-xl leading-snug`} value={h.text} onChange={(e) => editCopy(e.target.value)} /> : <p className="mt-3 flex-1 cursor-text whitespace-pre-wrap break-words text-xl leading-snug" onClick={() => { if (!loading) { editCopy(h.text); setEditing(h.type); } }}>{h.text}</p>}
            <p className="mt-4 border-t border-border pt-3 text-base italic text-muted-foreground">{h.note}</p>
            <LabButton disabled={loading} className="mt-4" onClick={() => { editCopy(h.text); setEditing(null); onSendHook(h.text); }}>Send Hook to Shot List →</LabButton>
          </Card>
        ); })}
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
