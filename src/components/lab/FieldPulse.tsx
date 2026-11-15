import { useEffect, useRef, useState } from "react";
import { Copy, Sprout, Sparkles, ArrowUpRight } from "lucide-react";
import { LabButton } from "./ui";
import { addPulse, readPulse, EMPTY_COUNTS, REACTIONS, shareHook, voteKey, type Reaction } from "./pulse";

export function FieldPulse({ hook }: { hook: string }) {
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [loaded, setLoaded] = useState(false);
  const [voted, setVoted] = useState<Partial<Record<Reaction, boolean>>>({});
  const [pending, setPending] = useState<Reaction | null>(null);
  const [status, setStatus] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const busy = useRef(false);
  useEffect(() => {
    let live = true;
    const remembered: Partial<Record<Reaction, boolean>> = {};
    for (const reaction of REACTIONS) {
      try { remembered[reaction] = localStorage.getItem(voteKey(reaction)) === "1"; } catch { /* Session-only prevention when storage is unavailable. */ }
    }
    setVoted(remembered);
    const refresh = async () => {
      try { const next = await readPulse(); if (live && !busy.current) { setCounts(next); setLoaded(true); } }
      catch { if (live) setLoaded(false); }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    window.addEventListener("focus", refresh);
    const sync = () => { for (const reaction of REACTIONS) { try { if (localStorage.getItem(voteKey(reaction)) === "1") setVoted((v) => ({ ...v, [reaction]: true })); } catch { /* Storage may be blocked. */ } } };
    window.addEventListener("storage", sync);
    return () => { live = false; clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("storage", sync); };
  }, []);

  async function vote(reaction: Reaction) {
    if (busy.current || voted[reaction]) return;
    try { if (localStorage.getItem(voteKey(reaction)) === "1") { setVoted((v) => ({ ...v, [reaction]: true })); return; } } catch { /* Continue without storage. */ }
    busy.current = true;
    setPending(reaction);
    try {
      const total = await addPulse(reaction);
      setCounts((previous) => ({ ...previous, [reaction]: total }));
      setLoaded(true);
      setVoted((previous) => ({ ...previous, [reaction]: true }));
      try { localStorage.setItem(voteKey(reaction), "1"); } catch { /* The in-session flag still prevents repeated clicks. */ }
      setStatus("Noted in the field log — thank you.");
    } catch { setStatus("The field log is resting — please try again."); }
    finally { busy.current = false; setPending(null); }
  }

  return (
    <section aria-labelledby="pulse-heading" className="mt-12 border-t border-border py-6 text-left">
      <p className="font-mono text-[10px] uppercase text-terracotta">Field Notes Pulse & Conversation</p>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 id="pulse-heading" className="text-2xl font-medium">Did this sandbox save you a tab or spark an angle?</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {REACTIONS.map((reaction) => {
              const Icon = reaction === "useful-workflow" ? Sprout : Sparkles;
              const name = reaction === "useful-workflow" ? "Useful workflow" : "Sparked a hook";
              return <LabButton key={reaction} aria-label={name} aria-pressed={Boolean(voted[reaction])} disabled={pending !== null || voted[reaction]} onClick={() => void vote(reaction)} className={`rounded-full px-3 py-2 normal-case disabled:opacity-100 ${voted[reaction] ? "border-primary! bg-sage! text-primary!" : "bg-background! hover:border-primary hover:text-primary"}`}><Icon size={16} strokeWidth={1.5} aria-hidden="true" /><span>{name}</span><span aria-live="polite" className="min-w-5 border-l border-border pl-2 font-mono text-xs tabular-nums">{pending === reaction ? "…" : loaded ? counts[reaction] : "—"}</span></LabButton>;
            })}
          </div>
          <p role="status" className="mt-3 min-h-6 text-base italic text-primary">{status}</p>
        </div>
        <div className="lg:border-l lg:border-border lg:pl-6">
          <h3 className="text-2xl font-medium">Want to swap notes?</h3>
          <a href="https://www.linkedin.com/in/joleen-richards" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 border-b border-primary pb-1 font-mono text-xs text-primary focus-visible:outline-2 focus-visible:outline-primary">Message on LinkedIn →<ArrowUpRight size={14} aria-hidden="true" /></a>
          <div className="mt-3"><LabButton disabled={!hook.trim()} className="max-w-full justify-start bg-background px-3 py-2 normal-case" onClick={async () => { try { await navigator.clipboard.writeText(shareHook(hook)); setCopyStatus("Copied — ready to share."); } catch { setCopyStatus("Couldn’t copy — please try again."); } }}><Copy size={15} className="shrink-0" aria-hidden="true" />Copy Current Hook to Share</LabButton></div>
          <p role="status" className="mt-3 min-h-6 text-base italic text-primary">{copyStatus}</p>
        </div>
      </div>
    </section>
  );
}