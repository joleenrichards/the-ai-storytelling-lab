export type VisualTopic = "bakery" | "food" | "coffee" | "pets" | "books" | "nature" | "strategy" | "product" | "default";

const TOPICS: readonly [VisualTopic, RegExp][] = [
  ["bakery", /\b(bakery|bakeries|baking|baked|bread|sourdough|croissant|pastry|pastries)\b/i],
  ["coffee", /(?<!\p{L})(coffee|caf[eé]|cafes|cafés|espresso|roaster|roasting|barista)(?!\p{L})/iu],
  ["food", /\b(food|restaurant|cooking|cuisine|meal|recipe|utensils)\b/i],
  ["pets", /\b(pets?|animals?|dogs?|cats?|pupp(?:y|ies)|kittens?|veterinary|wildlife)\b/i],
  ["books", /\b(books?|writing|writer|editorial|editor|storytelling|stories|notebook|newsletter|poetry|author|feather)\b/i],
  ["nature", /\b(nature|wellness|botanical|plants?|garden|gardening|leaf|leaves|sprout|sustainability|sustainable)\b/i],
  ["strategy", /\b(strategy|strategic|compass|growth|metrics?|campaign|data)\b/i],
  ["product", /\b(tech|technology|products?|software|app|layers|digital)\b/i],
];

export function visualTopic(topic: string, copy: string): VisualTopic {
  // A specific campaign topic takes precedence over incidental words in the caption.
  for (const text of [topic, copy]) {
    const match = TOPICS.find(([, keywords]) => keywords.test(text));
    if (match) return match[0];
  }
  return "default";
}