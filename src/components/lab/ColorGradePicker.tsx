import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { COLOR_GRADES, type ColorGrade } from "./color-grade";
import { LabButton, label } from "./ui";

export function ColorGradePicker({ value, onChange }: { value: ColorGrade; onChange: (grade: ColorGrade) => void }) {
  return <section className="mt-6 border-y border-border py-5" aria-label="Color grading palette">
    <h3 className={label}>Color grading palette</h3>
    <div className="mt-3 grid gap-3 md:grid-cols-3">
      {(Object.entries(COLOR_GRADES) as [ColorGrade, typeof COLOR_GRADES[ColorGrade]][]).map(([id, grade]) => <div key={id} data-color-grade={id} className={`overflow-hidden rounded-sm border bg-card ${value === id ? "border-primary ring-1 ring-primary" : "border-border"}`}>
        <LabButton aria-pressed={value === id} onClick={() => onChange(id)} className="block! w-full border-0 p-0 normal-case!">
          <span className="grid h-16 grid-cols-3" aria-hidden="true"><span className="grade-paper" /><span className="grade-primary" /><span className="grade-secondary" /></span>
          <span className="flex items-center justify-between gap-2 px-3 pt-3"><span className="font-serif text-xl">{grade.name}</span>{value === id && <Check size={16} className="shrink-0 text-primary" />}</span>
          <span className="block px-3 pb-3 pt-1 font-mono text-[10px] text-muted-foreground">{grade.mood}</span>
        </LabButton>
        {value === id && <div className="flex flex-wrap gap-1 border-t border-border px-3 py-3">{[grade.paper, grade.primary, grade.secondary].map((hex) => <LabButton key={hex} aria-label={`Copy ${hex}`} title={`Copy ${hex}`} className="rounded-full px-2 py-1 text-[10px]" onClick={async () => { try { await navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); } catch { toast.error("Couldn’t copy — please try again."); } }}><Copy size={10} />{hex}</LabButton>)}</div>}
      </div>)}
    </div>
  </section>;
}