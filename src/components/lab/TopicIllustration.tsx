import { fallbackDrawing, sanitizeIllustration } from "./illustration";
import { useMemo } from "react";

export function TopicIllustration({ topic, illustration = null }: { topic: string; illustration?: string | null }) {
  const svg = useMemo(() => sanitizeIllustration(illustration) ?? fallbackDrawing(topic), [topic, illustration]);
  return <div className="relative flex h-full w-full items-center justify-center bg-background p-[12%]">
    <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={`Editorial line drawing for ${topic}`} width={240} height={240} className="max-h-full w-full max-w-[240px] object-contain" />
    {["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "left-3 bottom-3 border-l border-b", "right-3 bottom-3 border-r border-b"].map((corner) => <span key={corner} aria-hidden="true" className={`pointer-events-none absolute h-3 w-3 border-terracotta/60 ${corner}`} />)}
  </div>;
}