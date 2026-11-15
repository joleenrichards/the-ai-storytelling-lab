import { useRef, useState } from "react";
import { ChevronDown, NotebookPen, Check } from "lucide-react";
import { LabButton, Seg, input, label } from "./ui";
import { logSuggestion, suggestionSchema, SUGGESTION_CATEGORIES, SUGGESTION_COOLDOWN_MS } from "./suggestions";

export function FeatureSuggestions({ activeTab }: { activeTab: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<(typeof SUGGESTION_CATEGORIES)[number]>("General");
  const [suggestion, setSuggestion] = useState("");
  const [pending, setPending] = useState(false);
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const lastSent = useRef(0);
  async function submit() {
    if (busy.current) return;
    const result = suggestionSchema.safeParse({ category, active_tab: activeTab, suggestion });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Please check your note."); return; }
    let previous = lastSent.current;
    try { previous = Math.max(previous, Number(localStorage.getItem("storytelling-lab:last-suggestion")) || 0); } catch { /* Session guard remains. */ }
    if (Date.now() - previous < SUGGESTION_COOLDOWN_MS) { setError("Give the field notes a minute before adding another."); return; }
    busy.current = true; setPending(true); setError("");
    try {
      await logSuggestion(result.data);
      lastSent.current = Date.now();
      try { localStorage.setItem("storytelling-lab:last-suggestion", String(lastSent.current)); } catch { /* No identifiers or note text stored. */ }
      setLogged(true); setSuggestion("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { busy.current = false; setPending(false); }
  }
  return <section className="mb-7 rounded-sm border border-primary bg-background p-4 text-left" aria-label="Field Requests">
    <LabButton className="w-full justify-start border-0 bg-transparent p-0 normal-case text-primary hover:text-primary" aria-expanded={open} aria-controls="field-request-form" onClick={() => setOpen(!open)}>
      <NotebookPen size={19} aria-hidden="true" /><span className="font-serif text-2xl">Field Requests</span><ChevronDown size={16} className={`ml-auto transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
    </LabButton>
    <p className="mt-2 text-lg text-muted-foreground">Missing a tool or workflow step? Leave a note for the workbench.</p>
    <div id="field-request-form" hidden={!open} className="mt-4">
      {logged ? <div role="status" className="flex flex-wrap items-center gap-3 text-primary"><Check size={18} /><p className="text-xl">Logged in the field notes — thank you.</p><LabButton className="normal-case" onClick={() => setLogged(false)}>Another note</LabButton></div> : <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <div className={`${label} mb-2`}>Category</div><Seg options={SUGGESTION_CATEGORIES} value={category} onChange={setCategory} />
        <label className="mt-4 block"><span className={label}>Your suggestion</span><textarea className={`${input} resize-y text-base`} rows={3} maxLength={500} value={suggestion} onChange={(event) => setSuggestion(event.target.value)} placeholder="A small idea for the next field experiment…" /></label>
        <div className="mt-2 flex items-center justify-between gap-3"><span className={label}>{suggestion.length} / 500</span><LabButton primary type="submit" disabled={pending || !suggestion.trim()}>{pending ? "Logging…" : "Log Suggestion"}</LabButton></div>
        {error && <p role="alert" className="mt-3 text-terracotta">{error}</p>}
      </form>}
    </div>
  </section>;
}