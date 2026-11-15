import { useState } from "react";
import { analyze } from "@/lib/abtest";
import { COMPARISON_FORMATS, METRICS, SAMPLE_FORMATS, comparisonVerdict, hasFormatBias, type ComparisonFormats, type ComparisonMetric } from "./comparison";
import type { UtmFormat } from "./utm";
import { Card, Field, LabButton, Seg, ToolHead, input, label } from "./ui";

const SAMPLE = { ia: "12400", ea: "496", ib: "11850", eb: "593" };
const num = (v: string) => Math.max(0, Number(v) || 0);
const f = (n: number, d = 2) => n.toFixed(d);

export function ABTool({ campaign, formats, onFormatsChange }: { campaign: string; formats: ComparisonFormats; onFormatsChange: (formats: ComparisonFormats) => void }) {
  const [v, setV] = useState(SAMPLE);
  const [metric, setMetric] = useState<ComparisonMetric>("Engagements");
  const ia = num(v.ia), ea = num(v.ea), ib = num(v.ib), eb = num(v.eb);
  const { ra, rb, lift, confidence } = analyze(ia, ea, ib, eb);
  const ok = ia > 0 && ib > 0;
  const w = rb > ra ? "B" : ra > rb ? "A" : null;
  const verdict = comparisonVerdict(ia, ea, ib, eb, formats, metric);
  // Preserve exact UTM content even for channel formats outside the core comparison list.
  const formatOptions: readonly UtmFormat[] = Array.from(new Set<UtmFormat>([...COMPARISON_FORMATS, formats.a, formats.b]));

  const Col = (id: "A" | "B", ki: "ia" | "ib", ke: "ea" | "eb", r: number) => (
    <Card>
      <div className="flex items-baseline justify-between"><h3 className="text-3xl italic">Variant {id}</h3>{ok && w === id && <span className="font-mono text-xs uppercase text-primary">Leading</span>}</div>
      <div className="mt-4 space-y-4">
        <Field name={`Variant ${id} format`}><select className={`${input} font-mono text-sm`} value={formats[id === "A" ? "a" : "b"]} onChange={(e) => {
          const next = formatOptions.find((format) => format === e.target.value);
          if (next) onFormatsChange({ ...formats, [id === "A" ? "a" : "b"]: next });
        }}>{formatOptions.map((format) => <option key={format} value={format}>{format}</option>)}</select></Field>
        <Field name="Impressions"><input type="number" min={0} className={`${input} font-mono`} value={v[ki]} onChange={(e) => setV({ ...v, [ki]: e.target.value })} /></Field>
        <Field name={metric}><input type="number" min={0} className={`${input} font-mono`} value={v[ke]} onChange={(e) => setV({ ...v, [ke]: e.target.value })} /></Field>
      </div>
      <div className="mt-5 border-t border-border pt-3"><div className={label}>Rate</div><div className={`font-mono text-4xl ${ok && w === id ? "text-primary" : ""}`}>{f(r)}%</div></div>
    </Card>
  );
  return (
    <div>
      <ToolHead no="04" stage="Measurement" title="A/B Lab" desc="Follow the signal. Question the noise." />
      <div className="mb-5 border-l-4 border-terracotta pl-4"><div className={label}>Active campaign</div><p className="mt-1 break-words font-mono text-sm">{campaign || "Untitled campaign"}</p></div>
      <div className="mb-4 flex flex-wrap justify-between gap-3">
        <Seg options={METRICS} value={metric} onChange={setMetric} />
        <div className="flex gap-2"><LabButton onClick={() => { setV(SAMPLE); setMetric("Engagements"); onFormatsChange(SAMPLE_FORMATS); }}>Sample</LabButton><LabButton onClick={() => setV({ ia: "", ea: "", ib: "", eb: "" })}>Reset / Clear</LabButton></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{Col("A", "ia", "ea", ra)}{Col("B", "ib", "eb", rb)}</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card><div className={label}>Relative lift (B vs A)</div><div className={`font-mono text-4xl ${lift > 0 ? "text-primary" : lift < 0 ? "text-terracotta" : ""}`}>{lift > 0 ? "+" : ""}{f(lift, 1)}%</div></Card>
        <Card><div className={label}>Confidence score</div><div className={`font-mono text-4xl ${confidence >= 95 ? "text-primary" : ""}`}>{f(confidence, 1)}%</div></Card>
      </div>
      <section aria-label="Visual test results" className="mt-5 grid gap-8 border-y border-border py-6 md:grid-cols-2">
        <div><h3 className={label}>{metric} rate comparison</h3><div className="mt-4 grid grid-cols-2 gap-5">
          {([{ id: "A", rate: ra, format: formats.a }, { id: "B", rate: rb, format: formats.b }]).map((variant) => <div key={variant.id} className="min-w-0"><div className="flex h-24 items-end border-b border-border"><div className={`rate-bar w-full ${variant.id === w ? "bg-primary" : "bg-terracotta/60"}`} style={{ height: `${Math.max(0, Math.min(100, variant.rate / Math.max(ra, rb, 0.001) * 100))}%` }} /></div><div className="mt-2 font-mono text-xs">{variant.id} · {f(variant.rate)}%</div><div className="mt-1 break-words font-mono text-[10px] text-muted-foreground">{variant.format}</div></div>)}
        </div></div>
        <div><h3 className={label}>Confidence gauge</h3><div className="mt-4 font-mono text-2xl text-primary">{f(confidence, 1)}%</div><div role="meter" aria-label="Test confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, confidence))} className="mt-3 grid grid-cols-20 gap-1">{Array.from({ length: 20 }, (_, i) => <span key={i} className={`h-4 ${confidence >= (i + 1) * 5 ? "bg-primary" : "bg-border"}`} />)}</div><div className="mt-3 grid grid-cols-[1fr_1fr_1.4fr] gap-2 font-mono text-[9px] leading-relaxed"><span className={confidence < 80 ? "text-primary" : "text-muted-foreground"}>Low<br />&lt;80%</span><span className={confidence >= 80 && confidence < 95 ? "text-primary" : "text-muted-foreground"}>Trending<br />80–95%</span><span className={confidence >= 95 ? "text-primary" : "text-muted-foreground"}>Statistically Confident<br />≥95%</span></div></div>
      </section>
      <aside className="mt-4 border-l-4 border-primary bg-sage p-6 text-left">
        <div className={`${label} text-primary`}>Editorial verdict</div>
        <p className="mt-2 text-2xl leading-relaxed">{verdict}</p>
        {hasFormatBias(formats, metric) && <p className="mt-4 border-t border-primary/20 pt-4 text-lg leading-relaxed"><span className="font-medium">Strategist note:</span> Low-friction formats like polls can naturally inflate top-of-funnel taps. Switch to Link Clicks for a more apples-to-apples conversion comparison; keep audience, exposure, and destination consistent.</p>}
      </aside>
    </div>
  );
}
