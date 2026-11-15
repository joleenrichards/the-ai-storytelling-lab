import { XMLParser, XMLValidator, XMLBuilder } from "fast-xml-parser";

import { classifyVisual, VISUAL_DRAWINGS } from "./visuals";
export { VISUAL_CATEGORIES, VISUAL_DRAWINGS, classifyVisual, nextVisualCategory, visualLabel, type VisualCategory } from "./visuals";
// Legacy keys remain readable for existing consumers.
export const FALLBACK_DRAWINGS = { coffee: VISUAL_DRAWINGS.coffee, compass: VISUAL_DRAWINGS.finance, notebook: VISUAL_DRAWINGS.books, leaf: VISUAL_DRAWINGS.nature, lamp: VISUAL_DRAWINGS.editorial } as const;
export function fallbackDrawing(topic: string) { return VISUAL_DRAWINGS[classifyVisual(topic)]; }

// Parse bounded XML, reject everything outside drawing primitives, and rebuild it.
// No source markup is injected into the page; the rebuilt SVG is an isolated image.
export function sanitizeIllustration(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 12000 || /<!|<\?|&/.test(value) || XMLValidator.validate(value) !== true) return null;
  try {
    const tree = new XMLParser({ ignoreAttributes: false, parseTagValue: false, parseAttributeValue: false }).parse(value);
    if (Object.keys(tree).length !== 1 || !tree.svg || tree.svg["@_viewBox"] !== "0 0 240 240") return null;
    const shapes = new Set(["svg", "g", "path", "circle", "ellipse", "line", "polyline", "polygon", "rect"]);
    const numeric = new Set(["x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height"]);
    let count = 0;
    const check = (node: unknown, tag: string, depth: number): boolean => {
      if (++count > 80 || depth > 8 || !shapes.has(tag) || (tag === "svg" && depth !== 0)) return false;
      if (node === "") return true;
      if (!node || typeof node !== "object" || Array.isArray(node)) return false;
      return Object.entries(node).every(([key, val]) => {
        if (!key.startsWith("@_")) return (Array.isArray(val) ? val : [val]).every((child) => check(child, key, depth + 1));
        if (typeof val !== "string") return false;
        const attr = key.slice(2);
        if (attr === "xmlns") return depth === 0 && val === "http://www.w3.org/2000/svg";
        if (attr === "viewBox") return depth === 0 && val === "0 0 240 240";
        if (attr === "stroke") return /^(#1f5e4d|#c85a32)$/i.test(val);
        if (attr === "fill") return val === "none";
        if (attr === "stroke-width" || attr === "strokeWidth") return val === "1.5";
        if (attr === "stroke-linecap") return /^(round|butt|square)$/.test(val);
        if (attr === "stroke-linejoin") return /^(round|miter|bevel)$/.test(val);
        if (attr === "d") return tag === "path" && val.length <= 4000 && /^[MmZzLlHhVvCcSsQqTtAaEe0-9.,+\s-]+$/.test(val);
        if (attr === "points") return /^[0-9.,+\s-]+$/.test(val);
        return numeric.has(attr) && /^-?\d+(\.\d+)?$/.test(val) && Math.abs(Number(val)) <= 500;
      });
    };
    if (!check(tree.svg, "svg", 0) || count < 2) return null;
    tree.svg["@_xmlns"] = "http://www.w3.org/2000/svg";
    tree.svg["@_fill"] = "none";
    tree.svg["@_stroke"] = "#1F5E4D";
    tree.svg["@_stroke-width"] = "1.5";
    return new XMLBuilder({ ignoreAttributes: false }).build(tree);
  } catch { return null; }
}