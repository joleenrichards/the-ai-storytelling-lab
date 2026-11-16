import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Aperture, Signpost, FlaskConical } from "lucide-react";
import { BotanicalMark, ColophonMark } from "@/components/lab/FieldMarks";
import { HookTool } from "@/components/lab/HookTool";
import { ABTool } from "@/components/lab/ABTool";
import { UTMTool } from "@/components/lab/UTMTool";
import { ShotTool } from "@/components/lab/ShotTool";
import { Badge, LabButton } from "@/components/lab/ui";
import { slug, shotTracking, buildUtm, type TrackingSelection } from "@/components/lab/utm";
import { aspectForFormat, productionFormatForTracking } from "@/components/lab/draft";
import { SHOT_PRESETS } from "@/components/lab/shots";
import { FeatureSuggestions } from "@/components/lab/FeatureSuggestions";
import { comparisonHandoff, type ComparisonFormats } from "@/components/lab/comparison";
import { FieldManual } from "@/components/lab/FieldManual";
import { FieldPulse } from "@/components/lab/FieldPulse";
import { CAMPAIGN_KEY, restoreCampaign, starterCampaign, type Campaign } from "@/components/lab/campaign";
import { WorkingCopy } from "@/components/lab/WorkingCopy";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Storytelling Lab — Planning to Measurement" },
      { name: "description", content: "Joleen's independent creative sandbox: connect narrative hooks, visual shot planning, campaign attribution, and A/B measurement." },
      { property: "og:title", content: "The Storytelling Lab — Planning to Measurement" },
      { property: "og:description", content: "Move from narrative framing and visual production to clean attribution and post-launch testing in Joleen's Storytelling Lab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "hooks", n: "01", name: "Hook & Angle", stage: "Planning", icon: Compass },
  { id: "shots", n: "02", name: "Shot List", stage: "Production", icon: Aperture },
  { id: "utm", n: "03", name: "UTM Builder", stage: "Execution", icon: Signpost },
  { id: "ab", n: "04", name: "Field Log", stage: "Measurement", icon: FlaskConical },
];

function Index() {
  const [tab, setTab] = useState("hooks");
  const [workspace, setWorkspace] = useState(starterCampaign);
  const [ready, setReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [topicArt, setTopicArt] = useState<{ topic: string; svg: string | null }>({ topic: "", svg: null });
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    try { setWorkspace(restoreCampaign(localStorage.getItem(CAMPAIGN_KEY))); }
    catch { setSaveFailed(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(workspace)); setSaveFailed(false); }
    catch { setSaveFailed(true); }
  }, [workspace, ready]);
  function update<K extends keyof Campaign>(key: K, value: Campaign[K]) { setWorkspace((current) => ({ ...current, [key]: value })); }
  const { topic, activeCopy, selectedAspectRatio, selectedFormat: selectedShotFormat, pollOptions, selectedColorGrade, shotNote: customShotNote, campaignName: campaign } = workspace;
  const destinationUrl = workspace.utmParams.destination;
  const tracking: TrackingSelection = { platform: workspace.utmParams.platform, format: workspace.utmParams.format };
  const comparisonFormats = workspace.comparisonFormats;
  const setTopic = (value: string) => update("topic", value);
  const setActiveCopy = (value: string) => update("activeCopy", value);
  const setCampaign = (value: string) => update("campaignName", value);
  const setTracking = (value: TrackingSelection) => setWorkspace((current) => {
    const format = value.platform === current.utmParams.platform ? productionFormatForTracking(value.format) : current.selectedFormat;
    return { ...current, selectedFormat: format, selectedAspectRatio: aspectForFormat(format), utmParams: { ...current.utmParams, ...value } };
  });
  const setDestinationUrl = (destination: string) => setWorkspace((current) => ({ ...current, utmParams: { ...current.utmParams, destination } }));
  const setComparisonFormats = (value: ComparisonFormats) => update("comparisonFormats", value);
  const setPollOptions = (value: string[]) => update("pollOptions", value);
  const setSelectedColorGrade = (value: Campaign["selectedColorGrade"]) => update("selectedColorGrade", value);
  const setCustomShotNote = (value: string) => update("shotNote", value);
  function newCampaign() {
    setWorkspace(starterCampaign()); setTopicArt({ topic: "", svg: null });
    setResetKey((value) => value + 1); setTab("hooks");
    toast.success("New campaign — a fresh field guide is ready.");
  }
  const illustration = topicArt.topic === topic ? topicArt.svg : null;
  const shotFormat = selectedShotFormat;
  const shotNote = customShotNote ?? SHOT_PRESETS[shotFormat].light;
  const generatedUtmUrl = buildUtm(destinationUrl, tracking.platform, campaign, tracking.format);
  const panel = (id: string) => ({ id: `panel-${id}`, role: "tabpanel", "aria-labelledby": `tab-${id}`, hidden: tab !== id, tabIndex: 0 });
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:py-10">
      <header className="border-b-2 border-foreground pb-6 text-left">
        <div className="flex flex-wrap items-center gap-3"><Badge>PLANNING • PRODUCTION • EXECUTION</Badge><BotanicalMark /><div className="flex items-center gap-3 sm:ml-auto"><FieldManual /><Badge>Built with AI</Badge></div></div>
        <h1 className="mt-4 text-5xl font-medium md:text-6xl">The AI Storytelling Lab</h1>
        <p className="mt-3 max-w-3xl text-left text-xl leading-relaxed text-muted-foreground">An experimental AI toolkit built around how good campaigns actually get made—moving from early narrative framing and visual shot planning to clean attribution and post-launch testing.</p>
      </header>
      <nav className="grid grid-cols-2 border-b border-border md:grid-cols-4" role="tablist" aria-label="Creative campaign workflow">
        {TABS.map((t, i) => (
          <LabButton key={t.id} id={`tab-${t.id}`} role="tab" aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1} aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              const next = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i + TABS.length - 1) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
              if (next === null) return;
              e.preventDefault();
              const target = TABS[next];
              if (target) { setTab(target.id); document.getElementById(`tab-${target.id}`)?.focus(); }
            }}
            className={`min-w-0 justify-between border-0 border-b-2 bg-transparent px-3 py-4 normal-case ${tab === t.id ? "border-terracotta bg-sage" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <span className="min-w-0 text-left"><span className="mb-1 block font-mono text-[10px] uppercase">{t.stage}</span><span className="mr-2 font-mono text-xs text-terracotta">{t.n}</span><span className="font-serif text-lg">{t.name}</span></span>
            <t.icon aria-hidden="true" size={21} strokeWidth={1.5} className="shrink-0 text-terracotta" />
          </LabButton>
        ))}
      </nav>
      <div className="pt-8 md:pt-10" key={resetKey}>
        <WorkingCopy copy={activeCopy} onChange={setActiveCopy} onNewCampaign={newCampaign} />
        {saveFailed && <p role="status" className="mb-4 font-mono text-xs text-terracotta">This browser cannot save your draft. Keep this tab open to preserve your work.</p>}
        <div {...panel("hooks")}><HookTool selectedTone={workspace.selectedTone} onToneChange={(value) => update("selectedTone", value)} audience={workspace.audience} onAudienceChange={(value) => update("audience", value)} activeCopy={activeCopy} topic={topic} onIllustrationChange={(svg, forTopic) => setTopicArt({ topic: forTopic, svg })} onTopicChange={setTopic} onActiveHookChange={setActiveCopy} onSendHook={(text) => { setActiveCopy(text); setTab("shots"); }} /></div>
        <div {...panel("shots")}><ShotTool selectedColorGrade={selectedColorGrade} onColorGradeChange={setSelectedColorGrade} topic={topic} illustration={illustration} hook={activeCopy} onHookChange={setActiveCopy} format={shotFormat} onFormatChange={(format) => { setWorkspace((current) => ({ ...current, selectedFormat: format, selectedAspectRatio: aspectForFormat(format) })); }} shotNote={shotNote} onShotNoteChange={setCustomShotNote} onNext={(nextFormat) => { setCampaign(slug(topic) || "untitled-campaign"); setTracking(shotTracking(nextFormat)); setTab("utm"); }} /></div>
        <div {...panel("utm")}><UTMTool selectedFormat={shotFormat} pollOptions={pollOptions} onPollOptionsChange={setPollOptions} selectedColorGrade={selectedColorGrade} topic={topic} illustration={illustration} activeCopy={activeCopy} onCopyChange={setActiveCopy} aspectRatio={selectedAspectRatio} shotNote={shotNote} destinationUrl={destinationUrl} onDestinationChange={setDestinationUrl} generatedUtmUrl={generatedUtmUrl} campaign={campaign} onCampaignChange={setCampaign} tracking={tracking} onTrackingChange={setTracking} onNext={(format) => { setComparisonFormats(comparisonHandoff(format)); setTab("ab"); }} /></div>
        <div {...panel("ab")}><ABTool draft={{ copy: activeCopy, url: generatedUtmUrl, platform: tracking.platform, aspectRatio: selectedAspectRatio, shotNote, colorGrade: selectedColorGrade }} campaign={campaign} formats={comparisonFormats} onFormatsChange={setComparisonFormats} /></div>
      </div>
      <FieldPulse hook={activeCopy} />
      <FeatureSuggestions activeTab={tab} />
      <footer className="border-t border-border pt-6 text-left">
        <div className="flex items-center gap-3"><ColophonMark /><h2 className="text-2xl">About This Lab</h2></div>
        <p className="mt-2 max-w-3xl text-lg leading-relaxed text-muted-foreground">Designed and prompted by Joleen Richards, social media strategist and visual storyteller. An independent experiment in sharper campaigns—with a human editorial voice.</p>
        <span aria-disabled="true" title="Portfolio address not yet provided" className="mt-3 inline-block font-mono text-xs text-muted-foreground">View Portfolio →</span>
      </footer>
    </main>
  );
}
