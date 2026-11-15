import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HookTool } from "@/components/lab/HookTool";
import { ABTool } from "@/components/lab/ABTool";
import { UTMTool } from "@/components/lab/UTMTool";
import { ShotTool } from "@/components/lab/ShotTool";
import { Badge } from "@/components/lab/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Field Notes // AI Marketing Lab" },
      { name: "description", content: "Lightweight tools for testing hooks, statistical lift, campaign tracking, and visual pre-production." },
      { property: "og:title", content: "Field Notes // AI Marketing Lab" },
      { property: "og:description", content: "Lightweight tools for testing hooks, statistical lift, campaign tracking, and visual pre-production." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "hooks", n: "01", name: "Hook Synthesizer", C: HookTool },
  { id: "ab", n: "02", name: "A/B Significance", C: ABTool },
  { id: "utm", n: "03", name: "UTM Builder", C: UTMTool },
  { id: "shots", n: "04", name: "Shot-List Planner", C: ShotTool },
];

function Index() {
  const [tab, setTab] = useState("hooks");
  const Active = TABS.find((t) => t.id === tab)!.C;
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="border-b-2 border-foreground pb-6 text-left">
        <Badge>Experimental Sandbox • v1.0</Badge>
        <h1 className="mt-4 text-5xl font-medium md:text-6xl">Field Notes: <span className="italic">AI Marketing Lab</span></h1>
        <p className="mt-2 text-xl italic text-muted-foreground">Lightweight tools for testing hooks, statistical lift, campaign tracking, and visual pre-production.</p>
      </header>
      <nav className="grid grid-cols-2 border-b border-border md:grid-cols-4" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`border-b-2 px-3 py-4 text-left transition-colors ${tab === t.id ? "border-terracotta" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <span className={`mr-2 font-mono text-xs ${tab === t.id ? "text-terracotta" : ""}`}>{t.n}</span><span className="text-lg">{t.name}</span>
          </button>
        ))}
      </nav>
      <div className="pt-10"><Active /></div>
      <footer className="mt-16 border-t border-border pt-4 font-mono text-xs text-muted-foreground">Field Notes // independent lab. All tools run in your browser.</footer>
    </main>
  );
}
