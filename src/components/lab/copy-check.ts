export type EditorialNote = { rule: string; message: string; fixable: boolean };
// Ignore URLs and decimal points when checking sentence mechanics.
function prose(text: string) {
  return text.replace(/https?:\/\/\S+/g, "LINK").replace(/(\d)\.(?=\d)/g, "$1·");
}
function missingSpace(text: string) {
  return /[,;:!?](?=[\p{L}\p{N}])|\.(?=\p{L})/u.test(prose(text));
}
function lowerStart(text: string) {
  return /(?:^|[.!?]\s+|\n)\s*["'“‘(]*\p{Ll}/u.test(prose(text));
}
function unclosed(text: string) {
  const stack: string[] = [];
  const pairs: Record<string, string> = { "(": ")", "“": "”", "‘": "’" };
  for (let i = 0; i < text.length; i++) {
    const char = text[i] ?? "";
    if ((char === "'" || char === "’") && /[\p{L}\p{N}]/u.test(text[i - 1] ?? "") && /[\p{L}\p{N}]/u.test(text[i + 1] ?? "")) continue;
    if (char === '"' || char === "'") {
      if (stack.at(-1) === char) stack.pop(); else stack.push(char);
    } else if (pairs[char]) stack.push(pairs[char]);
    else if ([")", "”", "’"].includes(char)) { if (stack.pop() !== char) return true; }
  }
  return stack.length > 0;
}
export function checkCopy(copy: string): EditorialNote[] {
  if (!copy.trim()) return [{ rule: "empty", message: "Add your copy before publishing.", fixable: false }];
  const notes: EditorialNote[] = [];
  const add = (rule: string, message: string, fixable = false) => notes.push({ rule, message, fixable });
  if (/\b([\p{L}]+)(?:[ \t]+\1\b)+/iu.test(copy)) add("duplicate", "Remove repeated consecutive words.", true);
  if (/[ \t]{2,}/.test(copy)) add("spacing", "Tidy up extra spaces.", true);
  if (missingSpace(copy)) add("punctuation-space", "Add a space after punctuation.", true);
  if (/(?<![\p{L}\p{N}_])i(?![\p{L}\p{N}_])/u.test(prose(copy))) add("pronoun", "Capitalize standalone “i”.", true);
  if (unclosed(copy)) add("unclosed", "Check for unclosed quotes or parentheses.");
  if (lowerStart(copy)) add("capitalization", "Capitalize the beginning of each sentence.", true);
  if (copy.split(/\n+/).some((paragraph) => paragraph.trim() && !/[.!?…]["'”’)]*$/.test(paragraph.trim()))) add("ending", "Check paragraph endings for missing punctuation.");
  copy.split(/\n+/).forEach((paragraph, index) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean).length;
    if (words > 45) add(`mobile-${index}`, `Paragraph ${index + 1} has ${words} words — add a line break for mobile scannability.`);
  });
  const clichés = [/\bdelve\b/i, /\bgame[- ]changer\b/i, /\btapestry\b/i, /\btestament\b/i, /\bin today['’]s fast[- ]paced\b/i];
  clichés.forEach((pattern) => { const match = copy.match(pattern); if (match) add(`cliche-${match[0].toLowerCase()}`, `“${match[0]}” feels familiar — swap it for a concrete detail.`); });
  return notes;
}
export function autoFixMechanics(copy: string) {
  // Protect links from all spacing and capitalization edits.
  return copy.split(/(https?:\/\/\S+)/g).map((part) => {
    if (/^https?:\/\//.test(part)) return part;
    return part.replace(/[ \t]{2,}/g, " ")
      .replace(/\b([\p{L}]+)(?:[ \t]+\1\b)+/giu, "$1")
      .replace(/([,;:!?])(?=[\p{L}\p{N}])|\.(?=\p{L})/gu, (punctuation) => `${punctuation} `)
      .replace(/(?<![\p{L}\p{N}_])i(?![\p{L}\p{N}_])/gu, "I")
      .replace(/(^|[.!?]\s+|\n)(\s*["'“‘(]*)(\p{Ll})/gu, (_, prefix, quote, letter: string) => prefix + quote + letter.toUpperCase());
  }).join("");
}