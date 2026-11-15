export const TONES = ["Editorial & Warm", "Data-Driven", "Contrarian"] as const;
export type Tone = (typeof TONES)[number];
export const ANGLE_TYPES = ["Curiosity Gap", "Contrarian Take", "Story-Led Hook"] as const;
export type HookAngle = { type: (typeof ANGLE_TYPES)[number]; text: string; note: string };
export const SAMPLE_HOOKS: HookAngle[] = [
  { type: "Curiosity Gap", text: "A single image catches the eye. A carousel earns a place in someone's saved folder—3.1 times as often. What makes that second swipe worth keeping?", note: "For independent coffee roasters, the gap between a glance and a save invites a closer look at what customers find useful." },
  { type: "Contrarian Take", text: "Your prettiest coffee photo may not be your most useful post. A brewing sequence gives people something to return to.", note: "Challenging the beauty-first instinct gives independent coffee roasters a practical reason to rethink the format." },
  { type: "Story-Led Hook", text: "Picture a customer with a new bag of beans and a saved brewing carousel open beside the kettle. Your story has made it into their morning.", note: "A familiar brewing moment helps independent coffee roasters imagine the value of a post beyond the feed." },
];
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

export function synthesize(topic: string, audience: string, tone: Tone, variation = 0): HookAngle[] {
  const t = topic.trim() || "your topic";
  const a = audience.trim() || "your audience";
  const openings = {
    "Editorial & Warm": [
      [`${t}. The interesting part is what ${a} might notice next.`, `For ${a}, ${t} deserves a closer look—not necessarily a louder announcement.`, `Picture a conversation among ${a}: someone brings up ${t}. What makes the room lean in?`],
      [`A small question for ${a}: what does ${t} leave unsaid?`, `More attention isn't always more meaning. ${t} gives ${a} a chance to consider the difference.`, `The feed pauses; a conversation begins. Imagine ${a} comparing notes on ${t}.`],
      [`Look past the headline: ${t}. There's a more personal question in it for ${a}.`, `The polished version of ${t} isn't the only story ${a} might want to hear.`, `A quiet moment, a second look. Picture one of ${a} finding a reason to revisit ${t}.`],
    ],
    "Data-Driven": [
      [`${t}. Which part would change a decision for ${a}?`, `A compelling headline isn't a complete result. ${a} can ask what ${t} actually measures.`, `Imagine ${a} reviewing ${t} in a planning meeting. The useful story begins with the next question.`],
      [`What sits outside the headline on ${t}? ${a} have a reason to inspect the denominator.`, `A bigger number can hide a smaller insight. For ${a}, ${t} is a starting point, not a verdict.`, `The spreadsheet closes; the discussion stays open. Picture ${a} deciding what to test about ${t}.`],
      [`${a}: what would you need to know before acting on ${t}?`, `${t} may attract attention. Whether it earns a decision from ${a} is another question.`, `Picture a team of ${a} marking one question beside ${t}: what changes in practice?`],
    ],
    Contrarian: [
      [`${t}. What if the most useful question for ${a} is the one nobody is asking?`, `Consensus can be comfortable without being useful. ${a} can put ${t} under a different lens.`, `Imagine ${a} in a meeting about ${t}. One person asks whether the premise holds.`],
      [`The neat version of ${t} leaves a rough edge. Would ${a} follow it?`, `Not every conversation about ${t} needs agreement. ${a} might learn more from the exception.`, `Picture a pause after ${t} comes up. Someone among ${a} asks for a counterexample.`],
      [`Which assumption about ${t} would ${a} question first?`, `The familiar framing of ${t} may be the least revealing one for ${a}.`, `A draft lands on the table: ${t}. Imagine ${a} crossing out the obvious opening and choosing a harder question.`],
    ],
  }[tone];
  const selected = openings[Math.abs(variation) % openings.length] ?? openings[0];
  const notes = [
    `An unresolved, topic-specific question gives ${a} a reason to seek the missing context.`,
    `Reframing a familiar assumption invites ${a} to weigh an alternative rather than accept a slogan.`,
    `An explicitly imagined moment lets ${a} picture their own stakes without presenting a fictional result as fact.`,
  ];
  return ANGLE_TYPES.map((type, i) => ({ type, text: selected?.[i] ?? t, note: notes[i] ?? a }));
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
