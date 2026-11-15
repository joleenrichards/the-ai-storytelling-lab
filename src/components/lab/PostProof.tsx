import { Copy, Globe, Heart, MessageCircle, MoreHorizontal, ThumbsUp, Bookmark, Send } from "lucide-react";
import { toast } from "sonner";
import { TopicIllustration } from "./TopicIllustration";
import { fullPost, type AspectRatio } from "./draft";
import type { UtmPlatform } from "./utm";
import { LabButton, label } from "./ui";
import { CopyDesk } from "./CopyDesk";
import type { ColorGrade } from "./color-grade";
import { useState } from "react";
import { DEFAULT_POLL_OPTIONS, PollPreview } from "./PollPreview";

const PLATFORM_NAMES: Record<UtmPlatform, string> = { linkedin: "LinkedIn", facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", newsletter: "Newsletter" };
const RATIOS: Record<AspectRatio, string> = { "9:16": "aspect-[9/16]", "4:5": "aspect-[4/5]", "1:1": "aspect-square" };

export function PostProof({ copy, url, platform, aspectRatio, shotNote, topic, illustration = null, onCopyChange, selectedColorGrade, pollSelected = false, pollOptions, onPollOptionsChange }: { copy: string; url: string; platform: UtmPlatform; aspectRatio: AspectRatio; shotNote: string; topic: string; illustration?: string | null; onCopyChange: (copy: string) => void; selectedColorGrade?: ColorGrade | undefined; pollSelected?: boolean; pollOptions?: string[]; onPollOptionsChange?: (options: string[]) => void }) {
  const [localOptions, setLocalOptions] = useState(DEFAULT_POLL_OPTIONS);
  const captionFirst = platform === "linkedin" || platform === "facebook" || platform === "newsletter";
  const link = <p className="mt-3 break-all font-mono text-xs leading-relaxed text-primary">{url || "—"}</p>;
  const caption = <div className="px-5 py-4"><p className="whitespace-pre-wrap break-words text-lg leading-relaxed">{!captionFirst && <strong className="mr-2 text-base">fieldnotes.studio</strong>}{copy || "—"}</p>{captionFirst ? link : <div className="mt-3 border-l-2 border-terracotta pl-3"><span className={label}>{platform === "instagram" ? "Tracked link · bio / story" : "Tracked link · profile"}</span>{link}</div>}</div>;
  return <section aria-labelledby="proof-heading" className="mt-8 border-y border-border py-6">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2"><h3 id="proof-heading" className="text-3xl font-medium">Editorial Proof</h3><span className={label}>{PLATFORM_NAMES[platform]} · Draft</span></div>
    <article aria-label={`${PLATFORM_NAMES[platform]} post proof`} className="mx-auto max-w-lg overflow-hidden rounded-sm border border-border bg-card text-left">
      <header className="flex items-center gap-3 border-b border-border p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage font-serif text-xl text-primary">fn</span><div className="min-w-0 flex-1"><p className="text-base font-semibold">{captionFirst ? "Field Notes Studio" : "fieldnotes.studio"}</p><p className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">{platform === "newsletter" ? "From the studio · Newsletter" : captionFirst ? "Just now ·" : "Original story"}{captionFirst && platform !== "newsletter" && <Globe size={10} />}</p></div><MoreHorizontal size={18} className="text-muted-foreground" aria-hidden="true" /></header>
      {captionFirst && caption}
      {pollSelected ? <PollPreview options={pollOptions ?? localOptions} onChange={onPollOptionsChange ?? setLocalOptions} {...(selectedColorGrade ? { selectedColorGrade } : {})} /> : <figure aria-label={`Creative frame ${aspectRatio}`} className={`relative isolate mx-auto flex items-center justify-center overflow-hidden ${RATIOS[aspectRatio]} ${aspectRatio === "9:16" ? "h-[420px] max-h-[420px] max-w-full" : "w-full"} ${!captionFirst ? "rounded-sm" : ""}`}>
        <div className="absolute inset-0"><TopicIllustration selectedColorGrade={selectedColorGrade} topic={topic} illustration={illustration} /></div>
        <span className="absolute bottom-6 left-6 font-mono text-[10px] uppercase text-terracotta">Creative frame · {aspectRatio}</span>
      </figure>}
      <div className="border-y border-border bg-background px-5 py-3"><span className={label}>Creative direction</span><p className="mt-1 whitespace-pre-wrap break-words text-base italic text-muted-foreground">{shotNote || "—"}</p></div>
      {!captionFirst && <div className="flex items-center gap-4 px-5 pt-4 text-foreground"><Heart size={20} /><MessageCircle size={20} /><Send size={19} /><Bookmark size={19} className="ml-auto" /></div>}
      {!captionFirst && caption}
      {captionFirst && platform !== "newsletter" && <div className="flex gap-5 border-t border-border px-5 py-3 font-mono text-[10px] text-muted-foreground"><span className="flex items-center gap-2"><ThumbsUp size={15} />Like</span><span className="flex items-center gap-2"><MessageCircle size={15} />Comment</span><span className="flex items-center gap-2"><Send size={15} />Share</span></div>}
    </article>
    <CopyDesk copy={copy} onChange={onCopyChange} />
    <div className="mt-5 flex justify-center"><LabButton primary disabled={!copy.trim() || !url} onClick={async () => { try { await navigator.clipboard.writeText(fullPost(copy, url)); toast.success("Copied — your story is ready to share."); } catch { toast.error("Couldn’t copy — please try again."); } }}><Copy size={15} />Copy Full Post + Link</LabButton></div>
  </section>;
}