import { BookOpen, Camera, Coffee, Compass, Croissant, Layers, Leaf, PawPrint, Utensils, type LucideIcon } from "lucide-react";
import { DEFAULT_COLOR_GRADE, type ColorGrade } from "./color-grade";
import type { AspectRatio } from "./draft";
import { visualTopic, type VisualTopic } from "./visual-topic";

const ICONS: Record<VisualTopic, LucideIcon> = {
  bakery: Croissant, food: Utensils, coffee: Coffee, pets: PawPrint,
  books: BookOpen, nature: Leaf, strategy: Compass, product: Layers, default: Camera,
};

export function EditorialVisualFrame({ topic, copy, aspectRatio, selectedColorGrade = DEFAULT_COLOR_GRADE }: {
  topic: string; copy: string; aspectRatio: AspectRatio; selectedColorGrade?: ColorGrade | undefined;
}) {
  const Icon = ICONS[visualTopic(topic, copy)];
  return <div data-color-grade={selectedColorGrade} className="grade-paper grade-ink absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-current/25">
      <Icon aria-hidden="true" strokeWidth={1.5} className="h-10 w-10" />
    </div>
    <div className="w-full min-w-0">
      <p className="font-mono text-[10px] uppercase leading-relaxed">Visual Frame • {aspectRatio}</p>
      <p className="mt-2 text-sm leading-relaxed opacity-75">Styled for editorial feed preview</p>
    </div>
  </div>;
}