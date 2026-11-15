import { useEffect, useState } from "react";
import { Bookmark, Save } from "lucide-react";
import { toast } from "sonner";
import { SUCCESS_METRICS, METRIC_DETAILS, lowSample, FIELD_LOG_KEY, EXAMPLE_LOG, EMPTY_RESULTS, SAMPLE_RESULTS, parseFieldLogs, bookmarkCampaign, validResults, fieldNoteVerdict, fieldLogStats, type SuccessMetric, type DraftSnapshot, type FieldLog, type FieldResults } from "./field-log";
import { COMPARISON_FORMATS, type ComparisonFormats } from "./comparison";
import type { UtmFormat } from "./utm";
import { Card, Field, LabButton, Seg, ToolHead, input, label } from "./ui";

const f = (n: number, d = 2) => n.toFixed(d);
const MODES = ["Current Campaign (Return Later)", "Compare Previous Campaign"] as const;

export function ABTool({ campaign, formats: currentFormats, onFormatsChange, draft }: { campaign: string; formats: ComparisonFormats; onFormatsChange: (formats: ComparisonFormats) => void; draft: DraftSnapshot }) {
  const [mode, setMode] = useState<typeof MODES[number]>(MODES[0]);
  const current = mode === MODES[0];
  const [logs, setLogs] = useState<FieldLog[]>([EXAMPLE_LOG]);
  const [ready, setReady] = useState(false);
  const [savedId, setSavedId] = useState(EXAMPLE_LOG.id);
  const [previous, setPrevious] = useState<FieldLog>(EXAMPLE_LOG);
  const [liveResults, setLiveResults] = useState<FieldResults>({ ...EMPTY_RESULTS });
  const [currentMetric, setCurrentMetric] = useState<SuccessMetric>(SUCCESS_METRICS[0]);
  const [preview, setPreview] = useState(false);
  const [sampleResults, setSampleResults] = useState<FieldResults>({ ...SAMPLE_RESULTS });
  const [bookmarked, setBookmarked] = useState<FieldLog | null>(null);
  useEffect(() => {
    try { const stored = localStorage.getItem(FIELD_LOG_KEY); const next = parseFieldLogs(stored); setLogs(next); const first = next[0]; if (first) { setSavedId(first.id); setPrevious(first); } if (!stored) localStorage.setItem(FIELD_LOG_KEY, JSON.stringify(next)); }
    catch { /* Saving remains an explicit action and reports blocked storage. */ }
    setReady(true);
  }, []);
  const persist = (entry: FieldLog) => {
    const next = [entry, ...logs.filter((item) => item.id !== entry.id)].slice(0, 50);
    try { localStorage.setItem(FIELD_LOG_KEY, JSON.stringify(next)); setLogs(next); return true; }
    catch { toast.error("This browser couldn’t save the field log. Your entries remain here for this visit."); return false; }
  };
  const formats = current ? currentFormats : previous.formats;
  const changeFormats = (next: ComparisonFormats) => current ? onFormatsChange(next) : setPrevious({ ...previous, formats: next });
  const v = current ? preview ? sampleResults : liveResults : previous.results;
  const setV = (next: FieldResults) => { if (!current) setPrevious({ ...previous, results: next }); else if (preview) setSampleResults(next); else setLiveResults(next); };
  const { ra, rb, lift, confidence } = fieldLogStats(v);
  const ok = validResults(v);
  const w = rb > ra ? "B" : ra > rb ? "A" : null;
  const metric = current ? currentMetric : previous.metric;
  const detail = METRIC_DETAILS[metric];
  const verdict = fieldNoteVerdict(v, formats, metric);
  // Preserve exact UTM content even for channel formats outside the core comparison list.
  const formatOptions: readonly UtmFormat[] = Array.from(new Set<UtmFormat>([...COMPARISON_FORMATS, formats.a, formats.b]));

  const Col = (id: "A" | "B", ki: "ia" | "ib", ke: "ea" | "eb", r: number) => (
    <Card>
      <div className="flex items-baseline justify-between"><h3 className="text-3xl italic">Variant {id}</h3>{ok && w === id && <span className="font-mono text-xs uppercase text-primary">Leading</span>}</div>
      {id === "A" && <p className="mt-3 whitespace-pre-wrap break-words text-lg leading-relaxed text-muted-foreground">{current ? draft.copy : previous.copy}</p>}
      <div className="mt-4 space-y-4">
        <Field name={`Variant ${id} format`}><select className={`${input} font-mono text-sm`} value={formats[id === "A" ? "a" : "b"]} onChange={(e) => {
          const next = formatOptions.find((format) => format === e.target.value);
          if (next) changeFormats({ ...formats, [id === "A" ? "a" : "b"]: next });
        }}>{formatOptions.map((format) => <option key={format} value={format}>{format}</option>)}</select></Field>
        <Field name="Impressions"><input type="number" min={0} step={1} className={`${input} font-mono`} value={v[ki]} onChange={(e) => setV({ ...v, [ki]: e.target.value })} /></Field>
        <Field name={detail.input}><input type="number" min={0} step={1} className={`${input} font-mono`} value={v[ke]} onChange={(e) => setV({ ...v, [ke]: e.target.value })} /></Field>
      </div>
      <div className="mt-5 border-t border-border pt-3"><div className={label}>{detail.rate}</div><div className={`font-mono text-4xl ${ok && w === id ? "text-primary" : ""}`}>{f(r)}%</div></div>
    </Card>
  );
  return (
    <div>
      <ToolHead no="04" stage="Measurement" title="Post-Publish Field Log" desc="A record of what happened after the story went live." />
      <div className="mb-5"><Seg options={MODES} value={mode} onChange={setMode} /></div>
      {current ? <section className="mb-5 border-l-4 border-terracotta pl-4">
        <div className={label}>Active campaign</div><p className="mt-1 break-words font-mono text-sm">{campaign || "Untitled campaign"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3"><LabButton disabled={!ready} onClick={() => { const entry = bookmarkCampaign(campaign, draft, currentFormats, liveResults, Date.now(), currentMetric); if (persist(entry)) { setBookmarked(entry); toast.success("Bookmarked — your 48h check-in is in the field log."); } }}><Bookmark size={14} />Bookmark Campaign for 48h Check-In</LabButton>
        {bookmarked && <span className="font-mono text-[10px] text-terracotta">AWAITING LIVE RESULTS · {new Date(bookmarked.checkInAt).toLocaleString()}</span>}</div>
        <label className="mt-4 flex items-center gap-2 font-mono text-[11px] text-muted-foreground"><input type="checkbox" className="accent-primary" checked={preview} onChange={(e) => setPreview(e.target.checked)} />Preview with Sample Numbers</label>
        {preview && <p className="mt-2 font-mono text-[10px] text-terracotta">SAMPLE PREVIEW · NOT LIVE RESULTS</p>}
      </section> : <section className="mb-5 grid gap-4 border-y border-border py-4 md:grid-cols-2">
        <Field name="Saved field logs"><select disabled={!ready} className={`${input} font-mono text-sm`} value={savedId} onChange={(e) => { const selected = logs.find((entry) => entry.id === e.target.value); if (selected) { setSavedId(selected.id); setPrevious(selected); } }}><option value="">New comparison</option>{logs.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} · {entry.status === "awaiting" ? "AWAITING LIVE RESULTS" : "COMPLETED"}</option>)}</select></Field>
        <Field name="Previous campaign name"><input className={`${input} font-mono text-sm`} value={previous.name} onChange={(e) => setPrevious({ ...previous, name: e.target.value })} /></Field>
        <div className="flex flex-wrap gap-2 md:col-span-2"><LabButton onClick={() => { setSavedId(""); setPrevious({ ...EXAMPLE_LOG, id: "", name: "", copy: "", results: { ...EMPTY_RESULTS } }); }}>New comparison</LabButton><LabButton disabled={!ready || !previous.name.trim() || !ok} onClick={() => { const entry = { ...previous, id: previous.id || `comparison-${Date.now()}`, status: "completed" as const }; if (persist(entry)) { setPrevious(entry); setSavedId(entry.id); toast.success("Results saved in the field log."); } }}><Save size={14} />Save Results to Field Log</LabButton></div>
      </section>}
      <section aria-label="Primary Success Metric" className="mb-4"><h3 className={`${label} mb-2`}>Primary Success Metric</h3><Seg options={SUCCESS_METRICS} value={metric} onChange={(next) => current ? setCurrentMetric(next) : setPrevious({ ...previous, metric: next })} /></section>
      <div className="mb-4 flex justify-end"><LabButton onClick={() => setV({ ...EMPTY_RESULTS })}>Reset / Clear</LabButton></div>
      <div className="grid gap-4 md:grid-cols-2">{Col("A", "ia", "ea", ra)}{Col("B", "ib", "eb", rb)}</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card><div className={label}>Relative lift (B vs A)</div><div className={`font-mono text-4xl ${lift > 0 ? "text-primary" : lift < 0 ? "text-terracotta" : ""}`}>{ok && ra === 0 ? "—" : `${lift > 0 ? "+" : ""}${f(lift, 1)}%`}</div></Card>
        <Card><div className={label}>Confidence score</div><div className={`font-mono text-4xl ${confidence >= 95 ? "text-primary" : ""}`}>{f(confidence, 1)}%</div></Card>
      </div>
      <section aria-label="Visual test results" className="mt-5 grid gap-8 border-y border-border py-6 md:grid-cols-2">
        <div><h3 className={label}>{detail.rate} comparison</h3><div className="mt-4 grid grid-cols-2 gap-5">
          {([{ id: "A", rate: ra, format: formats.a }, { id: "B", rate: rb, format: formats.b }]).map((variant) => <div key={variant.id} className="min-w-0"><div className="flex h-24 items-end border-b border-border"><div className={`rate-bar w-full ${variant.id === w ? "bg-primary" : "bg-terracotta/60"}`} style={{ height: `${Math.max(0, Math.min(100, variant.rate / Math.max(ra, rb, 0.001) * 100))}%` }} /></div><div className="mt-2 font-mono text-xs">{variant.id} · {f(variant.rate)}%</div><div className="mt-1 break-words font-mono text-[10px] text-muted-foreground">{variant.format}</div></div>)}
        </div></div>
        <div><h3 className={label}>Confidence gauge</h3><div className="mt-4 font-mono text-2xl text-primary">{f(confidence, 1)}%</div><div role="meter" aria-label="Test confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, confidence))} className="mt-3 grid grid-cols-20 gap-1">{Array.from({ length: 20 }, (_, i) => <span key={i} className={`h-4 ${confidence >= (i + 1) * 5 ? "bg-primary" : "bg-border"}`} />)}</div><div className="mt-3 grid grid-cols-[1fr_1fr_1.4fr] gap-2 font-mono text-[9px] leading-relaxed"><span className={confidence < 80 ? "text-primary" : "text-muted-foreground"}>Low<br />&lt;80%</span><span className={confidence >= 80 && confidence < 95 ? "text-primary" : "text-muted-foreground"}>Trending<br />80–95%</span><span className={confidence >= 95 ? "text-primary" : "text-muted-foreground"}>Model estimate<br />≥95%</span></div></div>
      </section>
      <aside className="mt-4 border-l-4 border-primary bg-background p-6 text-left">
        {lowSample(v) && <p role="status" className="mb-4 inline-block rounded-sm border border-terracotta bg-manual-tint px-3 py-2 font-mono text-[10px] leading-relaxed text-terracotta">DIRECTIONAL SIGNAL ONLY (&lt;1,000 IMPRESSIONS) — VALIDATE ACROSS MORE RUNS.</p>}
        <div className={`${label} text-primary`}>Field Note Verdict</div>
        <p className="mt-2 text-2xl leading-relaxed">{verdict}</p>

      </aside>
      <section aria-labelledby="testing-nuance" className="mt-4 border-l-4 border-primary bg-background px-6 py-5 text-left"><h3 id="testing-nuance" className={`${label} text-primary`}>On Testing Nuance</h3><p className="mt-2 text-lg leading-relaxed text-muted-foreground">A single A/B run is a grounded starting point, not an absolute truth. Timing, audience overlap, and feed distribution all influence outcomes—use these numbers to form a sharper hypothesis for your next 3–5 posts rather than treating one test as final proof.</p><p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">Confidence assumes independent, binary outcomes. Repeat actions, overlapping audiences, and multiple actions per person can weaken that estimate; aggregate action totals are not unique people.</p></section>
    </div>
  );
}
