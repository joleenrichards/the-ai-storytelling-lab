import { XMLParser, XMLValidator, XMLBuilder } from "fast-xml-parser";

const start = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="none" stroke="#1F5E4D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
export const FALLBACK_DRAWINGS = {
  coffee: start + '<path d="M60 100h100v45c0 38-100 38-100 0zM160 110h12c32 0 32 40 0 40h-12M45 182h140M85 80c-20-20 20-25 0-45M120 80c-20-20 20-25 0-45"/><path stroke="#C85A32" d="M64 197h100M145 65c-12-15 12-20 0-35"/></svg>',
  compass: start + '<circle cx="120" cy="120" r="75"/><circle cx="120" cy="120" r="62"/><path d="M120 32v20M120 188v20M32 120h20M188 120h20M90 150l20-40 40-20-20 40z"/><path stroke="#C85A32" d="M110 110l20 20M120 65v10M165 120h10"/></svg>',
  notebook: start + '<path d="M120 72c-24-22-57-22-85-12v113c28-10 61-10 85 12 24-22 57-22 85-12V60c-28-10-61-10-85 12v113M50 83c19-4 37 0 54 7M50 105c19-4 37 0 54 7M50 127c19-4 37 0 54 7M136 90c17-7 35-11 54-7M136 112c17-7 35-11 54-7"/><path stroke="#C85A32" d="M156 58v67l12-9 12 6V54"/></svg>',
  leaf: start + '<path d="M68 198C98 167 132 109 169 42M97 156C44 151 43 107 43 107c48-1 65 20 54 49zM126 116c-42-12-42-51-42-51 39 2 55 22 42 51zM129 114c50 14 70-27 70-27-40-19-59-3-70 27zM151 77c-29-28-11-55-11-55 31 17 37 37 11 55z"/><path stroke="#C85A32" d="M154 160c21-13 39-11 46-1-18 17-34 13-46 1M53 200h58"/></svg>',
  lamp: start + '<path d="M58 197h122M119 197v-38l39-68-49-40M91 39l24-16 39 54-48 32zM158 91l-25 51M61 163h38v34H61zM99 170h9c13 0 13 17 0 17h-9"/><circle cx="158" cy="91" r="6"/><path stroke="#C85A32" d="M96 115l-18 28M120 119l-4 26M74 101l-23 12"/></svg>',
} as const;
export function fallbackDrawing(topic: string) {
  if (/coffee|roast|cafe|café|bakery|bread|sourdough|hotel|restaurant|hospitality|food|blend/i.test(topic)) return FALLBACK_DRAWINGS.coffee;
  if (/growth|save|stat|data|campaign|launch|conversion|metric|strategy|compass/i.test(topic)) return FALLBACK_DRAWINGS.compass;
  if (/story|writ|book|copy|note|editor|newsletter/i.test(topic)) return FALLBACK_DRAWINGS.notebook;
  if (/craft|handmade|leaf|plant|botanical|garden|sustain|ceramic/i.test(topic)) return FALLBACK_DRAWINGS.leaf;
  return FALLBACK_DRAWINGS.lamp;
}

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