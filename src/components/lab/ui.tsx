import { useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { BarChart2, Image, LayoutGrid, Clapperboard, Layers, Mail, Link, Type } from "lucide-react";

function PillIcon({ value }: { value: string }) {
  if (value === "x") return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true" className="shrink-0"><path d="M6 5.5c4 3 8 9 12 13M18.5 5c-3 4-9 8-13 13M12 3.5l-.5 17M3.5 12.5l17-1" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></svg>;
  if (value === "bluesky") return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0"><path d="M12 10C8 3 2 3 3 8c.5 3 4 5 8 5-5-1-7 2-5 5 2 3 5 0 6-4 1 4 4 7 6 4 2-3 0-6-5-5 4 0 7.5-2 8-5 1-5-5-5-9 2ZM12 10v8M11 9 9 6M13 9l2-3" /></svg>;
  const Icon = /poll|linkedin|facebook|Engagements|Poll Votes/.test(value) ? BarChart2
    : /photo-series|Series/.test(value) ? LayoutGrid
    : /carousel|Carousel/.test(value) ? Layers
    : /reel|video|Reel|tiktok/.test(value) ? Clapperboard
    : /single-image|story|instagram/.test(value) ? Image
    : /newsletter|header-cta|digest-card|footer-link/.test(value) ? Mail
    : /link|Link Clicks/.test(value) ? Link : /text-post/.test(value) ? Type : null;
  return Icon ? <Icon size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0" /> : null;
}

export function LabButton({ primary, className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return <button type={type} className={`${primary ? btnPrimary : btnGhost} inline-flex items-center justify-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
}

export const label = "font-mono text-[11px] uppercase text-muted-foreground";
export const input = "mt-1.5 w-full border border-border bg-card px-3 py-2 text-lg outline-none focus:border-primary";
export const btnPrimary = "bg-primary px-4 py-2 font-mono text-xs uppercase text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
export const btnGhost = "border border-border bg-card px-4 py-2 font-mono text-xs uppercase transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function Badge({ children }: { children: ReactNode }) {
  return <span className="border border-terracotta px-1.5 py-0.5 font-mono text-[10px] uppercase text-terracotta">{children}</span>;
}
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border border-border bg-card p-6 ${className}`}>{children}</section>;
}
export function Field({ name, children }: { name: string; children: ReactNode }) {
  return <label className="block"><span className={label}>{name}</span>{children}</label>;
}
export function Seg<T extends string>({ options, value, onChange, labels }: { options: readonly T[]; value: T; onChange: (v: T) => void; labels?: Partial<Record<T, string>> }) {
  return (
    <div className="inline-flex flex-wrap border border-border bg-card">
      {options.map((o) => (
        <LabButton key={o} onClick={() => onChange(o)} aria-pressed={value === o}
          className={`border-0 px-3 py-1.5 normal-case ${value === o ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}><PillIcon value={o} />{labels?.[o] ?? o}</LabButton>
      ))}
    </div>
  );
}
export function CopyBtn({ text, children, primary }: { text: string; children: ReactNode; primary?: boolean }) {
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  return (
    <LabButton primary={primary ?? false} disabled={!text} aria-live="polite" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setStatus("done"); } catch { setStatus("error"); }
      setTimeout(() => setStatus("idle"), 1800);
    }}>{status === "done" ? "Copied ✓" : status === "error" ? "Copy failed — retry" : children}</LabButton>
  );
}
export function ToolHead({ no, title, desc, stage }: { no: string; title: string; desc: string; stage: string }) {
  return (
    <div className="mb-6 text-left">
      <div className="flex items-center gap-3"><span className="font-mono text-xs text-terracotta">{no}</span><Badge>{stage}</Badge></div>
      <h2 className="mt-2 text-4xl font-medium">{title}</h2>
      <p className="mt-1 max-w-2xl text-lg italic text-muted-foreground">{desc}</p>
    </div>
  );
}
