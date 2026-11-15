import twitterText from "twitter-text";
import type { UtmPlatform } from "./utm";

export function postCount(copy: string, url: string, platform: UtmPlatform) {
  const text = platform === "instagram" ? copy : [copy, url].filter(Boolean).join("\n\n");
  const count = platform === "x" ? twitterText.parseTweet(text).weightedLength : Array.from(text).length;
  const limit = platform === "x" ? 280 : platform === "instagram" ? 2200 : platform === "linkedin" ? 3000 : null;
  return { count, limit, exceeded: limit !== null && count > limit };
}