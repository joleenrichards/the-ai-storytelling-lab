import { describe, it, expect } from "vitest";
import { checkCopy, autoFixMechanics } from "./copy-check";

const rules = (copy: string) => checkCopy(copy).map((note) => note.rule);
describe("instant copy checks", () => {
  it("flags consecutive repeated words", () => expect(rules("The the story." )).toContain("duplicate"));
  it("flags double spaces", () => expect(rules("The  story.")).toContain("spacing"));
  it("flags missing punctuation spacing", () => expect(rules("Hello,reader.")).toContain("punctuation-space"));
  it("flags standalone lowercase i", () => expect(rules("Today i write.")).toContain("pronoun"));
  it.each(['The “story.', 'The (story.', 'The "story.', "The ‘story."])("flags unclosed quotes or parentheses: %s", (text) => expect(rules(text)).toContain("unclosed"));
  it("flags lowercase sentence starts", () => expect(rules("A story. another story.")).toContain("capitalization"));
  it("flags missing ending punctuation", () => expect(rules("A story")).toContain("ending"));
  it("accepts exactly 45 words but flags 46", () => {
    expect(rules(Array(45).fill("Word").join(" ") + ".")).not.toContain("mobile-0");
    expect(rules(Array(46).fill("Word").join(" ") + ".")).toContain("mobile-0");
  });
  it("treats line breaks as mobile paragraph boundaries", () => expect(rules(Array(30).fill("Word").join(" ") + ".\n" + Array(30).fill("Word").join(" ") + ".")).not.toContain("mobile-0"));
  it.each(["delve", "game-changer", "tapestry", "testament", "in today's fast-paced"])("flags cliché %s", (word) => expect(checkCopy(`We use ${word}.`).some((note) => note.rule.startsWith("cliche-"))).toBe(true));
  it("fixes requested mechanics while preserving line breaks", () => expect(autoFixMechanics("the the  story,i write. another angle.\nnew note.")).toBe("The story, I write. Another angle.\nNew note."));
  it("does not auto-edit subjective notes, quotes or endings", () => expect(autoFixMechanics('A (game-changer')).toBe('A (game-changer'));
  it("preserves URLs, decimals and contractions", () => {
    const copy = "I'm writing about today's 3.1 result. Visit https://example.com/story?q=i.";
    expect(autoFixMechanics(copy)).toBe(copy);
    expect(checkCopy(copy)).toEqual([]);
  });
  it("recognizes balanced quotations and parentheses", () => expect(checkCopy('A “quiet story” (with detail).')).toEqual([]));
});