import { useState } from "react";
import { analyze } from "@/lib/abtest";
import { Card, Field, LabButton, Seg, ToolHead, input, label } from "./ui";

const METRICS = ["Engagements", "Poll Votes", "Link Clicks"] as const;
const SAMPLE = { ia: "12400", ea: "496", ib: "11850", eb: "593" };
const num = (v: string) => Math.max(0, Number(v) || 0);
const f = (n: number, d = 2) => n.toFixed(d);

export function ABTool({ campaign }: { campaign: string }) {
  const [v, setV] = useState(SAMPLE);
  const [metric, setMetric] = useState<(typeof METRICS)[number]>("Engagements");
  const ia = num(v.ia), ea = num(v.ea), ib = num(v.ib), eb = num(v.eb);
  const { ra, rb, lift, confidence } = analyze(ia, ea, ib, eb);
  const ok = ia > 0 && ib > 0;
  const w = rb > ra ? "B" : ra > rb ? "A" : null;
  const m = metric.toLowerCase();
  const verdict = !ok ? "Enter impressions for both variants to get a verdict."
    : !w ? "Dead even. Nothing to declare — keep the test running or try a bolder variation."
    : confidence >= 95 ? `Scale the winning angle. Variant ${w} leads with a ${f(Math.abs(lift), 1)}% relative difference at ${f(confidence, 1)}% confidence. That's very unlikely to be chance — roll its approach forward.`
    : confidence >= 80 ? `Promising, not proven. Variant ${w} leads at ${f(confidence, 1)}% confidence — short of the 95% bar. Gather more ${m} before committing.`
    : `Keep testing. At ${f(confidence, 1)}% confidence, Variant ${w}'s edge could easily be noise.`;

  const Col = (id: "A" | "B", ki: "ia" | "ib", ke: "ea" | "eb", r: number) => (
    <Card>
      <div className="flex items-baseline justify-between"><h3 className="text-3xl italic">Variant {id}</h3>{ok && w === id && <span className="font-mono text-xs uppercase text-primary">Leading</span>}</div>
      <div className="mt-4 space-y-4">
        <Field name="Impressions"><input type="number" min={0} className={`${input} font-mono`} value={v[ki]} onChange={(e) => setV({ ...v, [ki]: e.target.value })} /></Field>
        <Field name={metric}><input type="number" min={0} className={`${input} font-mono`} value={v[ke]} onChange={(e) => setV({ ...v, [ke]: e.target.value })} /></Field>
      </div>
      <div className="mt-5 border-t border-border pt-3"><div className={label}>Rate</div><div className={`font-mono text-4xl ${ok && w === id ? "text-primary" : ""}`}>{f(r)}%</div></div>
    </Card>
  );
  return (
    <div>
      <ToolHead no="04" stage="Measurement" title="A/B Lab" desc="Separate real audience lift from algorithm noise—check whether a creative variation earned a statistically confident win before scaling the format." />
      <div className="mb-5 border-l-4 border-terracotta pl-4"><div className={label}>Active campaign</div><p className="mt-1 break-words font-mono text-sm">{campaign || "Untitled campaign"}</p></div>
      <div className="mb-4 flex flex-wrap justify-between gap-3">
        <Seg options={METRICS} value={metric} onChange={setMetric} />
        <div className="flex gap-2"><LabButton onClick={() => setV(SAMPLE)}>Sample</LabButton><LabButton onClick={() => setV({ ia: "", ea: "", ib: "", eb: "" })}>Reset / Clear</LabButton></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{Col("A", "ia", "ea", ra)}{Col("B", "ib", "eb", rb)}</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card><div className={label}>Relative lift (B vs A)</div><div className={`font-mono text-4xl ${lift > 0 ? "text-primary" : lift < 0 ? "text-terracotta" : ""}`}>{lift > 0 ? "+" : ""}{f(lift, 1)}%</div></Card>
        <Card><div className={label}>Confidence score</div><div className={`font-mono text-4xl ${confidence >= 95 ? "text-primary" : ""}`}>{f(confidence, 1)}%</div></Card>
      </div>
      <aside className="mt-4 border-l-4 border-primary bg-sage p-6 text-left">
        <div className={`${label} text-primary`}>Editorial verdict</div>
        <p className="mt-2 text-2xl leading-relaxed">{verdict}</p>
      </aside>
    </div>
  );
}
