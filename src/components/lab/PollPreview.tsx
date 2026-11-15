import { BarChart2 } from "lucide-react";
import { DEFAULT_COLOR_GRADE, type ColorGrade } from "./color-grade";

export const DEFAULT_POLL_OPTIONS = ["A sharper opening", "A clearer visual story", "A cleaner path to action"];
const BAR_WIDTHS = ["w-[45%]", "w-[35%]", "w-[20%]", "w-[10%]"];
const PERCENTAGES = [45, 35, 20, 10];
export function PollPreview({ options, onChange, selectedColorGrade = DEFAULT_COLOR_GRADE }: { options: string[]; onChange: (options: string[]) => void; selectedColorGrade?: ColorGrade }) {
  return <section aria-label="Social poll preview" data-color-grade={selectedColorGrade} className="grade-paper grade-ink p-5 sm:p-6">
    <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase"><BarChart2 size={15} />Community poll<span className="ml-auto">Preview</span></div>
    <div className="space-y-3">{options.map((option, i) => <div key={i} className="poll-option relative isolate overflow-hidden rounded-sm border">
      <span aria-hidden="true" className={`grade-primary pointer-events-none absolute inset-y-0 left-0 -z-10 opacity-10 ${BAR_WIDTHS[i] ?? "w-[10%]"}`} />
      <div className="flex min-h-12 items-center gap-3 px-3"><input aria-label={`Poll option ${i + 1}`} maxLength={80} value={option} onChange={(event) => onChange(options.map((value, j) => j === i ? event.target.value : value))} className="min-w-0 flex-1 bg-transparent py-2 text-lg outline-none focus-visible:underline" /><span className="shrink-0 font-mono text-xs">{PERCENTAGES[i]}%</span></div>
    </div>)}</div>
    <p className="mt-5 font-mono text-[10px] leading-relaxed">Poll duration: 3 days • Vote to see results</p>
  </section>;
}