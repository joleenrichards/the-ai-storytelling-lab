import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const SUGGESTION_CATEGORIES = ["Hook & Angle", "Shot List", "UTM Builder", "A/B Lab", "General"] as const;
export const SUGGESTION_COOLDOWN_MS = 15_000;
export const suggestionSchema = z.object({
  category: z.enum(SUGGESTION_CATEGORIES),
  active_tab: z.enum(["hooks", "shots", "utm", "ab"]),
  suggestion: z.string().trim().min(5, "Leave at least 5 characters.").max(500, "Keep your note within 500 characters."),
});
export async function logSuggestion(value: unknown) {
  const note = suggestionSchema.parse(value);
  const { error } = await supabase.from("feature_suggestions").insert(note);
  if (error) throw new Error(error.code === "P0001" ? error.message : "The field log is resting — please try again.");
}