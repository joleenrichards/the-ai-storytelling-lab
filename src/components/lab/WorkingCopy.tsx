import { useId, useState } from "react";
import { ChevronDown, Pencil, Check, Plus } from "lucide-react";
import { Field, LabButton, input, label } from "./ui";

export function WorkingCopy({ copy, onChange, onNewCampaign }: { copy: string; onChange: (value: string) => void; onNewCampaign?: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const id = useId();
  return <section className="mb-5 border-y border-border bg-sage px-4 py-3">
    <div className="flex flex-wrap items-center gap-3">
      <LabButton className="min-w-0 flex-1 justify-start border-0 bg-transparent p-0 normal-case" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        <span className={`${label} shrink-0`}>Working Copy</span>
        {!open && <span className="truncate font-serif text-base text-foreground">{copy || "—"}</span>}
      </LabButton>
      <LabButton title={editing ? "Finish editing" : "Edit working copy"} aria-label={editing ? "Finish editing working copy" : "Edit working copy"} className="shrink-0 border-0 bg-transparent p-1" onClick={() => { setOpen(true); setEditing(!editing); }}>{editing ? <Check size={16} /> : <Pencil size={16} />}</LabButton>
      {onNewCampaign && <LabButton className="shrink-0 bg-transparent px-2 py-1 normal-case" onClick={onNewCampaign}><Plus size={14} />New Campaign</LabButton>}
    </div>
    {open && <div id={id} className="mt-3">{editing ? <Field name="Active hook"><textarea autoFocus rows={3} className={`${input} mt-0`} value={copy} onChange={(e) => onChange(e.target.value)} /></Field> : <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">{copy || "—"}</p>}</div>}
  </section>;
}