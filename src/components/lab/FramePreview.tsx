import { Aperture } from "lucide-react";
import type { ShotFormat } from "./shots";
import { label } from "./ui";
import { TopicIllustration } from "./TopicIllustration";

export function FramePreview({ format, topic = "Storytelling", illustration = null }: { format: ShotFormat; topic?: string; illustration?: string | null }) {
  const reel = format === "9:16 Reel";
  const series = format === "1:1 Feed / Series";
  return <figure aria-label={`${format} framing preview`} className="border border-border bg-card p-5">
    <figcaption className={`${label} flex items-center gap-2`}><Aperture size={15} strokeWidth={1.5} aria-hidden="true" />Framing study <span className="ml-auto text-terracotta">{format.split(" ")[0]}</span></figcaption>
    <div className="flex h-[250px] items-center justify-center py-4">
      {series ? <div className="grid aspect-square w-[218px] grid-cols-2 grid-rows-2 gap-1.5" aria-label="Three-tile contact sheet">
        <div className="relative row-span-2 flex items-center justify-center border border-primary/40 bg-sage"><TopicIllustration topic={topic} illustration={illustration} /><span className="absolute bottom-2 left-2 bg-background font-mono text-[9px] text-muted-foreground">4:5 → 1:1</span></div>
        {["02 / PROCESS", "03 / DETAIL"].map((tile) => <div key={tile} className="relative flex items-center justify-center border border-border bg-background"><TopicIllustration topic={topic} illustration={illustration} /><span className="absolute bottom-1 bg-background font-mono text-[8px] text-muted-foreground">{tile}</span></div>)}
      </div> : <div className={`frame-study relative border border-primary/40 bg-background ${reel ? "aspect-[9/16] h-full rounded-lg" : "aspect-[4/5] h-full"}`}>
        <TopicIllustration topic={topic} illustration={illustration} />
        {reel ? <><div className="absolute inset-x-0 top-[14.84%] bottom-[14.84%] border-y border-dashed border-terracotta" /><span className="absolute inset-x-0 top-3 text-center font-mono text-[8px] text-terracotta">UI OVERLAY ZONE</span><span className="absolute inset-x-0 bottom-3 text-center font-mono text-[8px] text-terracotta">UI OVERLAY ZONE</span><span className="absolute inset-x-0 bottom-[16%] text-center font-mono text-[8px] text-primary">4:5 SAFE ZONE</span></> : <><div className="absolute inset-x-0 top-[15%] border-t border-dashed border-terracotta" /><span className="absolute inset-x-0 top-2 text-center font-mono text-[8px] text-terracotta">15% HEADLINE MARGIN</span><div className="absolute inset-y-0 left-1/3 border-l border-primary/15" /><div className="absolute inset-y-0 right-1/3 border-l border-primary/15" /><div className="absolute inset-x-0 top-1/3 border-t border-primary/15" /><div className="absolute inset-x-0 bottom-1/3 border-t border-primary/15" /></>}
        <span aria-hidden="true" className="absolute bottom-[20%] right-3 font-mono text-xs text-terracotta">+</span>
      </div>}
    </div>
  </figure>;
}