// Curated, browser-safe line art; classification never triggers inference.
export const VISUAL_CATEGORIES = ["bakery", "coffee", "pets", "wellness", "tech", "books", "travel", "home", "fashion", "nature", "finance", "editorial"] as const;
export type VisualCategory = typeof VISUAL_CATEGORIES[number];
const start = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="none" stroke="#1F5E4D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
const drawing = (body: string) => start + body + '</svg>';
export const VISUAL_DRAWINGS: Record<VisualCategory, string> = {
  bakery: drawing('<path d="M35 133c0-65 104-65 104 0v26H35zM55 119l18-21M80 118l18-22M105 120l16-19M32 169h110M145 148c-9-15-8-32 3-42l16 13 11-24 14 23 16-11c13 14 13 30 4 44l-17-8-14 16-15-16zM148 106l16 37M175 95l3 64M205 107l-13 36"/><path stroke="#C85A32" d="M44 185h151M59 78c-8-10 8-14 0-24M88 76c-8-10 8-14 0-24"/>'),
  coffee: drawing('<path d="M60 100h100v45c0 38-100 38-100 0zM160 110h12c32 0 32 40 0 40h-12M45 182h140M85 80c-20-20 20-25 0-45M120 80c-20-20 20-25 0-45"/><path stroke="#C85A32" d="M64 197h100M145 65c-12-15 12-20 0-35"/>'),
  pets: drawing('<path d="M45 104c-18 22-15 54-2 57l14-30M102 104c18 22 15 54 2 57l-14-30M49 112c-1-29 50-29 50 0v36c0 35-50 35-50 0zM66 141l8 6 8-6zM74 147v9m-11 0c5 7 17 7 22 0M136 117l-3-34 24 20c10-4 20-4 30 0l24-20-3 34c14 39-1 61-36 61s-50-22-36-61zM165 143l7 5 7-5M172 148v9m-10 0q10 9 20 0M139 145l-18-5m18 14-19 3m84-12 18-5m-18 14 19 3"/><circle cx="62" cy="130" r="2"/><circle cx="87" cy="130" r="2"/><path d="M150 132q5-5 10 0m24 0q5-5 10 0"/><path stroke="#C85A32" d="M78 207q28-23 57-22M101 193q-19-2-18-16 18 0 18 16M118 187q-1-17 16-18 0 16-16 18"/>'),
  wellness: drawing('<path d="M73 105h94v57H73zM79 105l-6-19h94l-6 19M96 125h47M104 145h31M59 190h122M90 184c-34-22-33-48-33-48 30 5 45 24 33 48zM150 184c34-22 33-48 33-48-30 5-45 24-33 48zM120 180v-16"/><path stroke="#C85A32" d="M104 67c-14-18 14-20 0-38M134 67c-14-18 14-20 0-38"/>'),
  tech: drawing('<rect x="42" y="57" width="156" height="105" rx="6"/><path d="M42 143h156M98 162v25m44-25v25M80 188h80M89 88l-18 16 18 16m62-32 18 16-18 16M129 82l-18 44"/><path stroke="#C85A32" d="M49 42h25M189 176v20m-10-10h20"/>'),
  books: drawing('<path d="M120 72c-24-22-57-22-85-12v113c28-10 61-10 85 12 24-22 57-22 85-12V60c-28-10-61-10-85 12v113M50 83c19-4 37 0 54 7M50 105c19-4 37 0 54 7M50 127c19-4 37 0 54 7M136 90c17-7 35-11 54-7M136 112c17-7 35-11 54-7"/><path stroke="#C85A32" d="M156 58v67l12-9 12 6V54"/>'),
  travel: drawing('<rect x="50" y="80" width="97" height="108" rx="9"/><path d="M79 80V62h39v18M68 81v107m62-107v107M68 195v7m61-7v7M164 167V87M164 107c-20 0-23-24-23-24 21 0 23 24 23 24zM164 123c22 0 28-27 28-27-25 1-28 27-28 27zM159 181h39"/><path stroke="#C85A32" d="M159 58l42-13-17 35-7-16zM177 64l24-19M31 211h172"/>'),
  home: drawing('<path d="M49 176v-42c0-12 19-12 19 0v21h104v-21c0-12 19-12 19 0v42H49zM68 144v-36c0-14 104-14 104 0v36M61 176v15m118-15v15M89 117h25v27H89zM144 117h19v27h-19M32 203h177M186 106V67m-16 0h32l-7-25h-18z"/><path stroke="#C85A32" d="M44 90V54m0 20c-17-5-17-20-17-20 16 1 17 20 17 20m0-6c17-5 17-20 17-20-16 1-17 20-17 20"/>'),
  fashion: drawing('<path d="M111 65c-7-17 17-26 23-12 4 10-11 12-11 22M123 75l-78 47h151zM82 142h75l12 61H70zM96 142v-14c0-24 47-24 47 0v14M87 167h63"/><path stroke="#C85A32" d="M178 161v24m-12-12h24M45 199h12"/>'),
  nature: drawing('<path d="M68 198C98 167 132 109 169 42M97 156C44 151 43 107 43 107c48-1 65 20 54 49zM126 116c-42-12-42-51-42-51 39 2 55 22 42 51zM129 114c50 14 70-27 70-27-40-19-59-3-70 27zM151 77c-29-28-11-55-11-55 31 17 37 37 11 55z"/><path stroke="#C85A32" d="M154 160c21-13 39-11 46-1-18 17-34 13-46 1M53 200h58"/>'),
  finance: drawing('<path d="M47 189V63m0 126h145M66 174v-35h25v35m18 0V112h25v62m18 0V83h25v91M65 119l43-34 27 9 39-46m-19 1 19-1-1 19"/><circle cx="187" cy="167" r="27"/><path stroke="#C85A32" d="M195 153c-18-9-25 12-9 14 16 3 9 20-8 11M187 147v38"/>'),
  editorial: drawing('<path d="M58 197h122M119 197v-38l39-68-49-40M91 39l24-16 39 54-48 32zM158 91l-25 51M61 163h38v34H61zM99 170h9c13 0 13 17 0 17h-9"/><circle cx="158" cy="91" r="6"/><path stroke="#C85A32" d="M96 115l-18 28M120 119l-4 26M74 101l-23 12"/>'),
};
const KEYWORDS: Partial<Record<VisualCategory, RegExp>> = {
  pets: /\b(pets?|dogs?|cats?|pupp(?:y|ies)|kittens?|canine|feline|veterinar\w*|animal\w*)\b/i,
  bakery: /\b(baker\w*|bread|sourdough|croissant\w*|pastr\w*|cakes?|cookies?)\b/i,
  coffee: /\b(coffee|roast\w*|cafe|café|espresso|barista\w*|brewing)\b/i,
  wellness: /\b(wellness|yoga|health\w*|fitness|meditat\w*|spa|skincare|self-care)\b/i,
  tech: /\b(tech\w*|software|apps?|ai|coding|digital|robot\w*|comput\w*)\b/i,
  books: /\b(books?|reading|writ\w*|story\w*|notebook\w*|publish\w*|librar\w*)\b/i,
  travel: /\b(travel\w*|holiday\w*|vacation\w*|hotel\w*|tour\w*|flight\w*|destination\w*|luggage)\b/i,
  home: /\b(home\w*|interior\w*|furniture|ceramic\w*|pottery|decor\w*|candles?|kitchen\w*)\b/i,
  fashion: /\b(fashion|cloth\w*|apparel|jewel\w*|outfit\w*|shoes?|bags?|textile\w*)\b/i,
  nature: /\b(nature|botanical|plants?|garden\w*|leaf|leaves|craft\w*|handmade|sustain\w*)\b/i,
  finance: /\b(financ\w*|money|invest\w*|bank\w*|budget\w*|savings|stocks?|growth|metrics?|conversion\w*|campaign|launch|data|strategy)\b/i,
};
export function classifyVisual(topic: string): VisualCategory {
  // Specific subjects win over generic campaign language.
  for (const category of VISUAL_CATEGORIES) if (KEYWORDS[category]?.test(topic)) return category;
  return "editorial";
}
export function nextVisualCategory(category: VisualCategory): VisualCategory {
  return VISUAL_CATEGORIES[(VISUAL_CATEGORIES.indexOf(category) + 1) % VISUAL_CATEGORIES.length] ?? "editorial";
}
const SUBJECT_LABELS: Record<VisualCategory, string> = { bakery: "Artisan Loaf & Croissant", coffee: "Coffee Ritual", pets: "Botanical Pet Portrait", wellness: "Quiet Wellness Ritual", tech: "Digital Workbench", books: "Open Notebook", travel: "Travel Field Kit", home: "Considered Home", fashion: "Wardrobe Study", nature: "Botanical Sprig", finance: "Growth & Savings", editorial: "Studio Ideas" };
export function visualLabel(category: VisualCategory) { return `Editorial Sketch: ${SUBJECT_LABELS[category]}`; }
