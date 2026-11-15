import { useState } from "react";
import { buildUtm } from "./utm";
import { Card, CopyBtn, Field, Seg, ToolHead, btnGhost, input, label } from "./ui";

const PLATFORMS = ["instagram", "linkedin", "tiktok", "newsletter"] as const;
const FORMATS = ["reel", "carousel", "poll", "story"] as const;

export function UTMTool() {
  const [url, setUrl] = useState("https://fieldnotes.studio/spring-blend");
  const [plat, setPlat] = useState<(typeof PLATFORMS)[number]>("instagram");
  const [camp, setCamp] = useState("Spring Blend Launch 26");
  const [fmt, setFmt] = useState<(typeof FORMATS)[number]>("reel");
  const [log, setLog] = useState<{ t: string; u: string }[]>([]);
  const out = buildUtm(url, plat, camp, fmt);
  return (
    <div>
      <ToolHead no="03" title="UTM & Attribution Builder" desc="Clean, lowercase tracking links — logged for the session." />
      <Card className="grid gap-5 md:grid-cols-2">
        <Field name="Destination URL"><input className={`${input} font-mono text-sm`} value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        <Field name="Campaign slug"><input className={input} value={camp} onChange={(e) => setCamp(e.target.value)} /></Field>
        <div><div className={`${label} mb-2`}>Platform</div><Seg options={PLATFORMS} value={plat} onChange={setPlat} /></div>
        <div><div className={`${label} mb-2`}>Content format</div><Seg options={FORMATS} value={fmt} onChange={setFmt} /></div>
      </Card>
      <Card className="mt-4 border-l-4 border-l-terracotta">
        <div className={label}>Generated URL</div>
        <p className="mt-2 break-all text-left font-mono text-sm">{out || "—"}</p>
        <div className="mt-4 flex gap-2">
          <CopyBtn primary text={out}>Copy URL</CopyBtn>
          <button className={btnGhost} disabled={!out} onClick={() => setLog([{ t: new Date().toLocaleTimeString(), u: out }, ...log])}>Add to log</button>
        </div>
      </Card>
      <Card className="mt-4">
        <div className="flex justify-between"><div className={label}>Session log ({log.length})</div>{log.length > 0 && <button className="font-mono text-xs text-terracotta" onClick={() => setLog([])}>clear</button>}</div>
        {log.length === 0 ? <p className="mt-2 italic text-muted-foreground">No links logged yet.</p> : (
          <ul className="mt-2 divide-y divide-border">{log.map((l, i) => <li key={i} className="flex gap-3 py-2 font-mono text-xs"><span className="text-muted-foreground">{l.t}</span><span className="break-all">{l.u}</span></li>)}</ul>
        )}
      </Card>
    </div>
  );
}
