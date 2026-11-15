import twitterText from "twitter-text";
import type { UtmPlatform } from "./utm";

export function postCount(copy: string, url: string, platform: UtmPlatform, linkCard = false) {
  const text = platform === "instagram" || (platform === "bluesky" && linkCard) ? copy : [copy, url].filter(Boolean).join("\n\n");
  const count = platform === "x" ? twitterText.parseTweet(text).weightedLength : platform === "bluesky" ? Array.from(new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)).length : Array.from(text).length;
  const limit = platform === "x" ? 280 : platform === "bluesky" ? 300 : platform === "instagram" ? 2200 : platform === "linkedin" ? 3000 : null;
  return { count, limit, exceeded: limit !== null && count > limit };
}