import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { analyze } from "@/lib/abtest";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The A/B Ledger — Social Media A/B Test Calculator" },
      { name: "description", content: "Compare two posts' engagement rates, lift and statistical confidence with an editorial verdict." },
      { property: "og:title", content: "The A/B Ledger — Social Media A/B Test Calculator" },
      { property: "og:description", content: "Compare two posts' engagement rates, lift and statistical confidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const METRICS = ["Engagements", "Poll Votes", "Link Clicks"] as const;
const SAMPLE = { ia: "12400", ea: "496", ib: "11850", eb: "593" };
const num = (v: string) => Math.max(0, Number(v) || 0);
const fmt = (n: number, d = 2) => n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <input
        type="number" min={0} inputMode="numeric" value={value} placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-input bg-transparent py-2 text-2xl outline-none focus:border-primary"
      />
    </label>
  );
}

function Index() {
  const [v, setV] = useState(SAMPLE);
  const [metric, setMetric] = useState<(typeof METRICS)[number]>("Engagements");
  const set = (k: keyof typeof SAMPLE) => (x: string) => setV({ ...v, [k]: x });
  const ia = num(v.ia), ea = num(v.ea), ib = num(v.ib), eb = num(v.eb);
  const { ra, rb, lift, confidence } = analyze(ia, ea, ib, eb);
  const hasData = ia > 0 && ib > 0;
  const winner = rb > ra ? "B" : ra > rb ? "A" : null;
  const m = metric.toLowerCase();

  let verdict: string;
  if (!hasData) verdict = "Enter impressions for both posts and the ledger will render its judgement.";
  else if (!winner) verdict = `The two posts are dead even. There is no story here yet — keep the test running or try a bolder variation.`;
  else if (confidence >= 95) verdict = `Declare a winner. Post ${winner} outperforms with ${fmt(Math.abs(lift), 1)}% relative lift and ${fmt(confidence, 1)}% confidence. The difference is very unlikely to be chance — roll Post ${winner}'s approach forward.`;
  else if (confidence >= 80) verdict = `Promising, but not proven. Post ${winner} leads at ${fmt(confidence, 1)}% confidence — suggestive, short of the 95% bar. Keep testing to gather more ${m} before you commit.`;
  else verdict = `Keep testing. At ${fmt(confidence, 1)}% confidence, Post ${winner}'s edge could easily be noise. Let both posts accumulate more impressions before drawing conclusions.`;

  const Card = ({ id, imp, eng, r, ki, ke }: { id: "A" | "B"; imp: string; eng: string; r: number; ki: "ia" | "ib"; ke: "ea" | "eb" }) => (
    <section className="border border-border bg-card p-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-3xl italic">Post {id}</h2>
        {hasData && winner === id && <span className="text-sm uppercase tracking-[0.15em] text-primary">Leading</span>}
      </div>
      <div className="mt-6 space-y-6">
        <Field label="Impressions / Reach" value={imp} onChange={set(ki)} />
        <Field label={`Total ${metric}`} value={eng} onChange={set(ke)} />
      </div>
      <div className="mt-8 border-t border-border pt-4">
        <div className="text-sm uppercase tracking-[0.15em] text-muted-foreground">{metric.replace(/s$/, "")} Rate</div>
        <div className={`text-5xl ${hasData && winner === id ? "text-primary" : ""}`}>{fmt(r)}%</div>
      </div>
    </section>
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <header className="border-b-2 border-foreground pb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-terracotta">Vol. I — The Numbers Desk</p>
        <h1 className="mt-2 text-5xl font-medium md:text-6xl">The A/B Ledger</h1>
        <p className="mt-3 max-w-2xl text-xl italic text-muted-foreground">A considered calculator for comparing two social posts, with a verdict you can act on.</p>
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex border border-border bg-card" role="group" aria-label="Metric">
          {METRICS.map((x) => (
            <button key={x} onClick={() => setMetric(x)} aria-pressed={metric === x}
              className={`px-4 py-2 text-lg transition-colors ${metric === x ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{x}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setV(SAMPLE)} className="px-4 py-2 text-lg text-terracotta underline-offset-4 hover:underline">Sample data</button>
          <button onClick={() => setV({ ia: "", ea: "", ib: "", eb: "" })} className="border border-terracotta px-5 py-2 text-lg text-terracotta transition-colors hover:bg-terracotta hover:text-accent-foreground">Reset / Clear</button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {Card({ id: "A", imp: v.ia, eng: v.ea, r: ra, ki: "ia", ke: "ea" })}
        {Card({ id: "B", imp: v.ib, eng: v.eb, r: rb, ki: "ib", ke: "eb" })}
      </div>

      <div className="mt-6 grid border border-border bg-card md:grid-cols-2">
        <div className="p-8 md:border-r border-border">
          <div className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Relative Lift (B vs A)</div>
          <div className={`text-5xl ${lift > 0 ? "text-primary" : lift < 0 ? "text-terracotta" : ""}`}>{lift > 0 ? "+" : ""}{fmt(lift, 1)}%</div>
        </div>
        <div className="border-t border-border p-8 md:border-t-0">
          <div className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Confidence (two-proportion z-test)</div>
          <div className={`text-5xl ${confidence >= 95 ? "text-primary" : ""}`}>{fmt(confidence, 1)}%</div>
        </div>
      </div>

      <aside className="mt-6 border-l-4 border-primary bg-sage p-8 text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Editorial Verdict</p>
        <p className="mt-3 text-2xl leading-relaxed">{verdict}</p>
      </aside>

      <footer className="mt-12 text-center italic text-muted-foreground">Confidence is two-sided; 95% is the customary threshold for declaring a winner.</footer>
    </main>
  );
}
