import { useState, type ReactNode } from "react";

export const label = "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground";
export const input = "mt-1.5 w-full border border-border bg-card px-3 py-2 text-lg outline-none focus:border-primary";
export const btnPrimary = "bg-primary px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-90";
export const btnGhost = "border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:border-terracotta hover:text-terracotta";

export function Badge({ children }: { children: ReactNode }) {
  return <span className="border border-terracotta px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta">{children}</span>;
}
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border border-border bg-card p-6 ${className}`}>{children}</section>;
}
export function Field({ name, children }: { name: string; children: ReactNode }) {
  return <label className="block"><span className={label}>{name}</span>{children}</label>;
}
export function Seg<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex flex-wrap border border-border bg-card">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} aria-pressed={value === o}
          className={`px-3 py-1.5 font-mono text-xs transition-colors ${value === o ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{o}</button>
      ))}
    </div>
  );
}
export function CopyBtn({ text, children, primary }: { text: string; children: ReactNode; primary?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button className={primary ? btnPrimary : btnGhost} onClick={async () => {
      try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
      setDone(true); setTimeout(() => setDone(false), 1400);
    }}>{done ? "Copied ✓" : children}</button>
  );
}
export function ToolHead({ no, title, desc }: { no: string; title: string; desc: string }) {
  return (
    <div className="mb-6 text-left">
      <div className="flex items-center gap-3"><span className="font-mono text-xs text-terracotta">{no}</span><Badge>Lab</Badge></div>
      <h2 className="mt-2 text-4xl font-medium">{title}</h2>
      <p className="mt-1 max-w-2xl text-lg italic text-muted-foreground">{desc}</p>
    </div>
  );
}
