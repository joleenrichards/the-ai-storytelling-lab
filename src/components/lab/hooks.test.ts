import { describe, expect, it } from "vitest";
import { nextPromptScenario, PROMPT_SCENARIOS, synthesize } from "./hooks";

describe("curiosity shuffle", () => {
  it("cycles through five scenarios and returns to the first", () => {
    let index = -1;
    const topics = [];
    for (let i = 0; i < 5; i++) {
      const next = nextPromptScenario(index);
      index = next.index;
      topics.push(next.scenario.topic);
    }
    expect(topics).toHaveLength(5);
    expect(new Set(topics).size).toBe(5);
    expect(nextPromptScenario(index).scenario.topic).toBe("A neighborhood bakery launching a sourdough subscription");
  });
  it.each(PROMPT_SCENARIOS)("updates all hooks for $topic", ({ topic, audience }) => {
    const hooks = synthesize(topic, audience, "Editorial & Warm");
    expect(hooks).toHaveLength(3);
    for (const hook of hooks) expect(hook.text).toContain(topic);
  });
});