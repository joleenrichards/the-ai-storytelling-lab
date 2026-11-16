import { describe, expect, it } from "vitest";
import { visualTopic } from "./visual-topic";

describe("editorial visual topic selection", () => {
  it.each([
    ["A sourdough bakery", "bakery"], ["Food and recipes", "food"],
    ["An independent café", "coffee"], ["Coffee roaster", "coffee"],
    ["Pets and animals", "pets"], ["Books and writing", "books"],
    ["Editorial storytelling", "books"], ["Nature and wellness", "nature"],
    ["Botanical garden", "nature"], ["Product technology", "product"],
    ["Campaign strategy", "strategy"], ["An unexpected moment", "default"],
  ] as const)("maps %s to %s", (topic, expected) => {
    expect(visualTopic(topic, "")).toBe(expected);
  });
  it("uses edited copy when the topic has no match", () => {
    expect(visualTopic("Summer launch", "Meet our rescue pets.")).toBe("pets");
  });
  it("prioritizes a specific topic over incidental caption keywords", () => {
    expect(visualTopic("Coffee café", "A campaign worth writing about.")).toBe("coffee");
  });
  it("does not match keywords inside unrelated words", () => {
    expect(visualTopic("A catalog of appetizers", "A dogmatic approach.")).toBe("default");
  });
});