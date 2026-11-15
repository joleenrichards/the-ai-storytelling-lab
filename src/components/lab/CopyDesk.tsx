import { useState } from "react";
import { Check, ChevronDown, WandSparkles } from "lucide-react";
import { checkCopy, autoFixMechanics } from "./copy-check";
import { LabButton } from "./ui";

export function CopyDesk({ copy, onChange }: { copy: string; onChange: (copy: string) => void }) {
  const [open, setOpen] = useState(false);
  const notes = checkCopy(copy);
  return <div aria-label="Editorial Copy Check" className="mx-auto mt-4 max-w-lg border-y border-border py-3 text-left">
    <div aria-live="polite">
      {notes.length === 0 ? <p className="flex items-center gap-2 font-mono text-[11px] text-primary"><Check size={15} aria-hidden="true" />COPY DESK: CLEAN · READY TO PUBLISH</p> :
        <LabButton aria-expanded={open} aria-controls="copy-desk-notes" onClick={() => setOpen(!open)} className="rounded-full border-terracotta bg-manual-tint px-3 py-1.5 text-terracotta"><span>{notes.length} EDITORIAL {notes.length === 1 ? "NOTE" : "NOTES"}</span><ChevronDown size={14} className={open ? "rotate-180" : ""} /></LabButton>}
    </div>
    {notes.length > 0 && open && <div id="copy-desk-notes" className="mt-3">
      <ul className="space-y-2 font-mono text-xs leading-relaxed text-muted-foreground">{notes.map((note) => <li key={note.rule} className="border-l-2 border-terracotta/40 pl-3">{note.message}</li>)}</ul>
      <LabButton disabled={!notes.some((note) => note.fixable)} className="mt-3 px-3 py-2" onClick={() => onChange(autoFixMechanics(copy))}><WandSparkles size={14} />Auto-Fix Mechanics</LabButton>
    </div>}
  </div>;
}