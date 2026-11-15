import { createServerFn } from "@tanstack/react-start";
import { ANGLE_TYPES } from "@/components/lab/hooks";
import { EDITORIAL_SYSTEM_PROMPT, hookInputSchema, hookOutputSchema } from "./hook-generation";

// Deliberately public: this sandbox accepts no private data and needs no account.
export const generateHookAngles = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => hookInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateChatCompletion, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const response = await generateChatCompletion({
        model: "google/gemini-3.1-flash-lite",
        messages: [
          { role: "system", content: EDITORIAL_SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({ ...data, creativeDirection: crypto.randomUUID() }) },
        ],
        temperature: 1,
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message.content;
      if (!content || typeof content !== "string") return { angles: null };
      const parsed = hookOutputSchema.parse(JSON.parse(content));
      if (parsed.angles.some((angle) => data.previousHooks.includes(angle.hook))) return { angles: null };
      return { angles: ANGLE_TYPES.flatMap((type) => {
        const angle = parsed.angles.find((a) => a.type === type);
        return angle ? [{ type, text: angle.hook, note: angle.note }] : [];
      }) };
    } catch (error) {
      if (error instanceof GatewayError) {
        console.warn("Hook generation unavailable", { code: error.code, ids: error.ids, outcome: error.outcome });
      } else {
        console.warn("Hook generation returned unusable output");
      }
      return { angles: null };
    }
  });