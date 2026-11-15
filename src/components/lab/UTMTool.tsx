import { useState } from "react";
import { WorkingCopy } from "./WorkingCopy";
import { PostProof } from "./PostProof";
import type { AspectRatio } from "./draft";
import { PLATFORMS, PLATFORM_FORMATS, compatibleFormat, type TrackingSelection, type UtmFormat } from "./utm";
import { Card, CopyBtn, Field, LabButton, Seg, ToolHead, input, label } from "./ui";

export function UTMTool({ campaign, onCampaignChange, tracking, onTrackingChange, onNext, activeCopy, onCopyChange, aspectRatio, shotNote, destinationUrl: url, onDestinationChange: setUrl, generatedUtmUrl: out, topic, illustration = null }: { campaign: string; onCampaignChange: (campaign: string) => void; tracking: TrackingSelection; onTrackingChange: (tracking: TrackingSelection) => void; onNext: (format: UtmFormat) => void; activeCopy: string; onCopyChange: (copy: string) => void; aspectRatio: AspectRatio; shotNote: string; destinationUrl: string; onDestinationChange: (url: string) => void; generatedUtmUrl: string; topic: string; illustration?: string | null }) {
  const { platform: plat } = tracking;
  const format = compatibleFormat(plat, tracking.format);
  const formats = PLATFORM_FORMATS[plat];
  const [log, setLog] = useState<{ t: string; u: string }[]>([]);
  return (
    <div>
      <ToolHead no="03" stage="Execution" title="UTM Builder" desc="A clean trail from your story to its impact." />
      <WorkingCopy copy={activeCopy} onChange={onCopyChange} />
      <Card className="grid gap-5 md:grid-cols-2">
        <Field name="Destination URL"><input className={`${input} font-mono text-sm`} value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        <Field name="Campaign slug"><input className={input} value={campaign} onChange={(e) => onCampaignChange(e.target.value)} /></Field>
        <div><div className={`${label} mb-2`}>Platform</div><Seg options={PLATFORMS} value={plat} onChange={(platform) => onTrackingChange({ platform, format: compatibleFormat(platform, format) })} /></div>
        <div><div className={`${label} mb-2`}>Content format</div><Seg options={formats} value={format} onChange={(nextFormat) => onTrackingChange({ platform: plat, format: nextFormat })} /></div>
      </Card>
      <Card className="mt-4 border-l-4 border-l-terracotta">
        <div className={label}>Generated URL</div>
        <p className="mt-2 break-all text-left font-mono text-sm">{out || "—"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyBtn primary text={out}>Copy URL</CopyBtn>
          <LabButton disabled={!out} onClick={() => setLog([{ t: new Date().toLocaleTimeString(), u: out }, ...log])}>Add to log</LabButton>
        </div>
      </Card>
      <PostProof copy={activeCopy} url={out} platform={plat} aspectRatio={aspectRatio} shotNote={shotNote} topic={topic} illustration={illustration} />
      <section className="mt-4 border-y border-border py-4">
        <div className="flex justify-between"><div className={label}>Session log ({log.length})</div>{log.length > 0 && <LabButton className="border-0 py-0 text-terracotta" onClick={() => setLog([])}>clear</LabButton>}</div>
        {log.length === 0 ? <p className="mt-2 italic text-muted-foreground">No links logged yet.</p> : (
          <ul className="mt-2 divide-y divide-border">{log.map((l, i) => <li key={i} className="flex gap-3 py-2 font-mono text-xs"><span className="shrink-0 text-muted-foreground">{l.t}</span><span className="min-w-0 break-all">{l.u}</span></li>)}</ul>
        )}
      </section>
      <LabButton primary className="mt-5" disabled={!out} onClick={() => onNext(format)}>Track in A/B Lab →</LabButton>
    </div>
  );
}
