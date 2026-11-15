import { expect, it } from "vitest";
import { postCount } from "./post-limits";
it("uses Bluesky's exact 300-grapheme boundary", () => {
  expect(postCount("a".repeat(300), "", "bluesky").exceeded).toBe(false);
  expect(postCount("a".repeat(301), "", "bluesky").exceeded).toBe(true);
  expect(postCount("👩‍🌾".repeat(300), "", "bluesky").count).toBe(300);
});
it("counts Bluesky's full URL unless attached as a card", () => {
  const url = "https://example.com/field-notes";
  expect(postCount("Story", url, "bluesky").count).toBe(5 + 2 + url.length);
  expect(postCount("a".repeat(300), url, "bluesky", true)).toEqual({ count: 300, limit: 300, exceeded: false });
});
it("counts X links as 23 characters", () => {
  expect(postCount("", "https://example.com/a-very-long-tracked-link?utm_campaign=launch", "x").count).toBe(23);
});
it("uses an exact 280-character X boundary", () => {
  expect(postCount("a".repeat(280), "", "x").exceeded).toBe(false);
  expect(postCount("a".repeat(281), "", "x").exceeded).toBe(true);
});
it("excludes the bio URL from Instagram's 2200-character caption limit", () => {
  expect(postCount("a".repeat(2200), "https://example.com", "instagram")).toEqual({ count: 2200, limit: 2200, exceeded: false });
  expect(postCount("a".repeat(2201), "", "instagram").exceeded).toBe(true);
});
it("uses LinkedIn's 3000-character limit including the link", () => {
  expect(postCount("a".repeat(3000), "", "linkedin").exceeded).toBe(false);
  expect(postCount("a".repeat(3000), "https://example.com", "linkedin").exceeded).toBe(true);
});