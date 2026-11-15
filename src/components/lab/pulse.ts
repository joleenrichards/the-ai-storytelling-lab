export const REACTIONS = ["useful-workflow", "sparked-hook"] as const;
export type Reaction = typeof REACTIONS[number];
export type PulseCounts = Record<Reaction, number>;
export const EMPTY_COUNTS: PulseCounts = { "useful-workflow": 0, "sparked-hook": 0 };
export const voteKey = (reaction: Reaction) => `storytelling-lab:pulse:${reaction}`;
export const shareHook = (hook: string) => hook.trim() ? `${hook.trim()}\n\n— drafted in The Storytelling Lab` : "";

export async function readPulse(): Promise<PulseCounts> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase.from("field_pulse_counts").select("reaction, total");
  if (error) throw error;
  const counts = { ...EMPTY_COUNTS };
  for (const row of data ?? []) {
    if (row.reaction === "useful-workflow" || row.reaction === "sparked-hook") counts[row.reaction] = Number(row.total);
  }
  return counts;
}

export async function addPulse(reaction: Reaction): Promise<number> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase.rpc("add_field_pulse", { reaction_key: reaction });
  if (error) throw error;
  return Number(data);
}