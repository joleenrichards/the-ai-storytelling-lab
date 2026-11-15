export const TONES = ["Editorial & Warm", "Data-Driven", "Contrarian"] as const;
export type Tone = (typeof TONES)[number];
export const PROMPT_SCENARIOS = [
  { topic: "A neighborhood bakery launching a sourdough subscription", audience: "local bread lovers" },
  { topic: "Summarizing a 30-page sustainability report for LinkedIn", audience: "sustainability-minded business leaders" },
  { topic: "Behind-the-scenes of a solo rainy-day photo shoot", audience: "independent photographers" },
  { topic: "A community bookshop turning staff picks into a weekly series", audience: "curious neighborhood readers" },
  { topic: "A refill shop introducing a zero-waste starter kit", audience: "first-time low-waste shoppers" },
] as const;
export function nextPromptScenario(index: number) {
  const next = (index + 1) % PROMPT_SCENARIOS.length;
  return { index: next, scenario: PROMPT_SCENARIOS[next] ?? PROMPT_SCENARIOS[0] };
}

export function synthesize(topic: string, audience: string, tone: Tone) {
  const t = topic.trim() || "your topic";
  const a = audience.trim() || "your audience";
  const lead = { "Editorial & Warm": "Here's a quiet truth", "Data-Driven": "The numbers say something odd", Contrarian: "Unpopular opinion" }[tone];
  return [
    { type: "Curiosity Gap", text: `${lead}: most ${a} get ${t} backwards — and the fix takes about 30 seconds. Here's what we found ↓`,
      note: "Opens an information gap (Loewenstein). The reader feels a missing piece and scrolls to close it." },
    { type: "Contrarian Take", text: tone === "Contrarian" ? `Stop obsessing over ${t}. For ${a}, it's the least important lever you have.` : `Everyone tells ${a} to double down on ${t}. We tried the opposite.`,
      note: "Pattern interrupt. Challenging the consensus triggers mild cognitive dissonance and invites a reply." },
    { type: "Story-Led Hook", text: tone === "Data-Driven" ? `Six weeks ago we tracked ${t} across 40 accounts. Week three changed everything.` : `Last spring, one of our ${a} almost gave up on ${t}. Then a single change happened.`,
      note: "Narrative transport. A specific moment and stakes make the brain simulate the story, lifting dwell time." },
  ];
}

export function buildPrompt(topic: string, audience: string, tone: Tone) {
  return `ROLE: You are a senior social copywriter specialising in scroll-stopping openers.

CONTEXT
- Topic / stat: ${topic}
- Audience: ${audience}
- Tone: ${tone}

TASK
Write 3 social media opening lines (max 220 characters each), one per framework:
1. Curiosity Gap — withhold the key insight; promise a payoff.
2. Contrarian Take — challenge a belief the audience holds.
3. Story-Led Hook — open in a specific moment with stakes.

EXAMPLES (few-shot)
Input: "Email open rates fell 12%" / B2B marketers / Data-Driven
Curiosity Gap: "Open rates dropped 12% — but the accounts that grew all did one thing differently."
Contrarian Take: "Open rate is a vanity metric. Here's the number we track instead."
Story-Led Hook: "In March our newsletter lost 900 readers in a week. The cause was a single word."

CONSTRAINTS
- No hashtags, no emojis in the first 8 words, no clichés ("game-changer", "unlock").
- Match the ${tone} tone.

OUTPUT FORMAT
Return JSON: [{"framework": "...", "hook": "...", "why_it_works": "..."}]`;
}
