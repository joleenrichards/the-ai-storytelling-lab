import { BookOpen, Compass, Aperture, Signpost, FlaskConical, ArrowDown, Dices } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LabButton } from "./ui";
import { useEffect, useState } from "react";

export const MANUAL_SEEN_KEY = "storytelling-lab:field-manual-seen";

const RELAY = [
  { no: "01", title: "Hook & Angle", icon: Compass, text: "Find your opening. Try a Prompt shuffles a fresh topic and audience; Generate Angles explores three ways in.", handoff: "Send Hook to Shot List →" },
  { no: "02", title: "Shot List", icon: Aperture, text: "Turn the chosen hook into a visual plan. Choose a format, refine your checklist, and carry the format forward.", handoff: "Move to UTM Builder →" },
  { no: "03", title: "UTM Builder", icon: Signpost, text: "Give the campaign a clean tracking link. Your selected content format becomes Variant A in the next test.", handoff: "Track in A/B Lab →" },
  { no: "04", title: "A/B Lab", icon: FlaskConical, text: "Compare two formats, enter results, and read the lift and confidence alongside the editorial verdict.", handoff: null },
];

const PRINCIPLES = [
  { title: "AI explores angles; humans choose taste.", text: "Hook & Angle cuts the LinkedIn clichés, not your judgment. Let AI propose the openings; you decide what deserves your audience’s attention." },
  { title: "Structure protects creative work.", text: "Shot List sets format-specific safe zones; UTM Builder keeps formats and tracking labels aligned with each platform. The constraints protect the story from awkward crops and messy attribution." },
  { title: "Measure apples to apples.", text: "A poll tap is easier than a meaningful engagement with a single image. A/B Lab flags that format bias: switch to Link Clicks for a cleaner conversion comparison, and keep audience and exposure comparable." },
];

export function FieldManual() {
  const [beacon, setBeacon] = useState(false);
  useEffect(() => {
    try { setBeacon(localStorage.getItem(MANUAL_SEEN_KEY) !== "1"); } catch { setBeacon(true); }
    const sync = (event: StorageEvent) => { if (event.key === MANUAL_SEEN_KEY && event.newValue === "1") setBeacon(false); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return (
    <Sheet onOpenChange={(open) => { if (open) { setBeacon(false); try { localStorage.setItem(MANUAL_SEEN_KEY, "1"); } catch { /* Keep it dismissed for this visit. */ } } }}>
      <SheetTrigger asChild>
        <LabButton className="relative rounded-full border-terracotta! bg-manual-tint! px-3 py-1.5 text-[11px] normal-case text-foreground transition-all hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"><BookOpen size={14} strokeWidth={1.5} aria-hidden="true" />Field Manual{beacon && <span data-manual-beacon aria-hidden="true" className="pointer-events-none absolute -right-0.5 -top-0.5 h-2 w-2"><span className="absolute inset-0 rounded-full bg-terracotta/25 motion-safe:animate-ping motion-safe:[animation-duration:3s]" /><span className="absolute inset-0 rounded-full bg-terracotta" /></span>}</LabButton>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto px-5 py-8 text-left motion-reduce:animate-none motion-reduce:transition-none sm:max-w-xl sm:px-8">
        <header className="border-b-2 border-foreground pb-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase text-terracotta"><BookOpen size={15} aria-hidden="true" />The AI Storytelling Lab</div>
          <SheetTitle className="font-serif text-4xl font-medium">Field Manual</SheetTitle>
          <SheetDescription className="mt-2 font-serif text-lg leading-relaxed">One idea, four stages. A little structure; plenty of room for judgment.</SheetDescription>
        </header>
        <section className="py-6" aria-labelledby="manual-connects">
          <p className="font-mono text-[10px] uppercase text-terracotta">Section 01 · The relay</p>
          <h2 id="manual-connects" className="mt-2 text-2xl font-medium">How the Sandbox Connects</h2>
          <p className="mt-2 text-lg leading-snug text-muted-foreground">Follow one campaign through the handoff buttons, or use any tool standalone. Your edits stay with you as you switch tabs during this visit.</p>
          <ul className="mt-5 space-y-3">
            {RELAY.map((step) => (
              <li key={step.no} className="border border-border bg-card p-4">
                <div className="flex items-center gap-2"><step.icon size={17} strokeWidth={1.5} className="shrink-0 text-primary" aria-hidden="true" /><span className="font-mono text-[11px] text-terracotta">{step.no} ·</span><h3 className="text-xl font-medium">{step.title}</h3></div>
                <p className="mt-2 text-lg leading-snug text-muted-foreground">{step.text}</p>
                {step.no === "01" && <span className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] text-primary"><Dices size={14} aria-hidden="true" />Try a Prompt · a fresh starting point</span>}
                {step.handoff && <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 font-mono text-[10px] text-primary"><ArrowDown size={14} className="shrink-0" aria-hidden="true" /><span>{step.handoff}</span></div>}
              </li>
            ))}
          </ul>
        </section>
        <section className="border-t border-border py-6" aria-labelledby="manual-rulebook">
          <p className="font-mono text-[10px] uppercase text-terracotta">Section 02 · AI + Human Judgment</p>
          <h2 id="manual-rulebook" className="mt-2 text-2xl font-medium">The Editorial Rulebook</h2>
          <ol className="mt-5 space-y-5 border-l-2 border-primary pl-4">
            {PRINCIPLES.map((principle, i) => <li key={principle.title}><span className="font-mono text-[10px] uppercase text-primary">Principle 0{i + 1}</span><h3 className="mt-1 text-xl font-medium">{principle.title}</h3><p className="mt-2 text-lg leading-snug text-muted-foreground">{principle.text}</p></li>)}
          </ol>
        </section>
      </SheetContent>
    </Sheet>
  );
}