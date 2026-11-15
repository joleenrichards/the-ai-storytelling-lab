import { fallbackDrawing, sanitizeIllustration } from "./illustration";
import { useMemo } from "react";
import { DEFAULT_COLOR_GRADE, tintIllustration, type ColorGrade } from "./color-grade";

export function TopicIllustration({ topic, illustration = null, selectedColorGrade = DEFAULT_COLOR_GRADE, visualLabel }: { visualLabel?: string | undefined; topic: string; illustration?: string | null; selectedColorGrade?: ColorGrade | undefined }) {
  const svg = useMemo(() => tintIllustration(sanitizeIllustration(illustration) ?? fallbackDrawing(topic), selectedColorGrade), [topic, illustration, selectedColorGrade]);
  return <div data-color-grade={selectedColorGrade} className="grade-paper relative flex h-full w-full items-center justify-center p-6">
    <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={visualLabel ?? `Editorial line drawing for ${topic}`} width={240} height={240} className="h-full w-full object-contain" />
    {["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "left-3 bottom-3 border-l border-b", "right-3 bottom-3 border-r border-b"].map((corner) => <span key={corner} aria-hidden="true" className={`pointer-events-none absolute h-3 w-3 grade-crop ${corner}`} />)}
  </div>;
}