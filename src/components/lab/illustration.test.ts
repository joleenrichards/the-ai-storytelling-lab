import { describe, expect, it } from "vitest";
import { fallbackDrawing, FALLBACK_DRAWINGS, sanitizeIllustration } from "./illustration";

describe("safe editorial illustrations", () => {
  it.each([["Coffee roasters", "coffee"], ["Campaign growth", "compass"], ["Storytelling notebook", "notebook"], ["Handmade ceramics", "leaf"], ["Studio ideas", "lamp"]] as const)("matches %s without an AI request", (topic, drawing) => {
    expect(fallbackDrawing(topic)).toBe(FALLBACK_DRAWINGS[drawing]);
    expect(sanitizeIllustration(FALLBACK_DRAWINGS[drawing])).not.toBeNull();
  });
  it.each(['<script>alert(1)</script>', '<image href="https://evil.example"/>', '<path onload="alert(1)"/>', '<foreignObject/>', '<style>svg{display:none}</style>', '<use href="#x"/>', '<svg/>', '<path stroke="url(https://evil.example)"/>'])("rejects unsafe markup %s", (child) => {
    expect(sanitizeIllustration(`<svg viewBox="0 0 240 240">${child}</svg>`)).toBeNull();
  });
  it("rejects entities, malformed XML, wrong viewboxes, and oversized payloads", () => {
    expect(sanitizeIllustration('<!DOCTYPE svg><svg viewBox="0 0 240 240"><path d="M0 0"/></svg>')).toBeNull();
    expect(sanitizeIllustration('<svg><path></svg>')).toBeNull();
    expect(sanitizeIllustration(FALLBACK_DRAWINGS.coffee.replace('0 0 240 240', '0 0 100 100'))).toBeNull();
    expect(sanitizeIllustration('x'.repeat(12001))).toBeNull();
  });
});