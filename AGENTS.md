<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->
- Lab tools live in src/components/lab/, one file per tool; pure logic (utm, hooks, src/lib/abtest) kept in plain .ts files so it can be unit-tested.
- Keep all workflow tools mounted within accessible hidden tab panels; validate and autosave shared campaign state after hydration, and remount tools on an explicit new-campaign reset so local edits cannot leak between campaigns.
- Keep shot presets and production-sheet serialization in plain TypeScript; retain separate in-session checklists per format and nullable custom technical notes so switching formats updates defaults without overwriting edits.
- Define channel formats, compatibility fallback, and shot tracking mappings in the pure UTM module; hold platform and format as one workspace selection so channel switches and production handoffs cannot generate mismatched URLs.
- Keep A/B comparison defaults, handoffs, and verdict/guardrail logic in plain TypeScript; hold both selected formats in the workspace so tab changes preserve edits and handoffs retain exact UTM content.
- Keep framing wireframes and decorative field marks in focused presentational modules; keep prompt scenarios in the pure hooks module so the five-item cycle can be tested without the UI.
- Hook generation uses the AI Gateway inside a public server function with bounded input and validated JSON; static samples render without calls, and only explicit actions trigger inference with session history and a local fallback.
- Keep the Field Manual in a focused presentation module using the shared accessible sheet primitive so opening guidance never unmounts tools or changes workspace state.
- Pulse stores only aggregate totals and increments through a narrowly granted atomic RPC; browser-local flags discourage repeat votes without storing visitor identifiers, and totals refresh on focus and periodically.
- Keep active copy, tone, format, grade, custom creative note, destination, and platform selection in validated workspace state; derive the tracked URL there so autosaved drafts, exports, proof, and sharing stay synchronized without extra AI calls.
- Keep platform character counting in pure TypeScript: twitter-text for X, grapheme counting for Bluesky, and explicit link-card exclusion; this keeps counters aligned with rendered attachments.
- Keep Working Copy and Editorial Proof in focused presentation modules; pure aspect mappings and full-post serialization live in draft.ts so handoffs and clipboard output are testable.
- Return topic illustrations in the existing hook inference response only; rebuild bounded XML through a strict primitive/attribute allowlist and render as isolated SVG images, with keyword-matched curated fallbacks for instant initial rendering and rejected art.
- Keep copy checks and conservative mechanics fixes in pure TypeScript; no inference or storage is needed for real-time proofreading.
- Keep selected color grade in workspace state, palette values in a pure module, and preview roles in CSS tokens; recolor only validated SVG and serialize the grade into production exports.
- Keep field-log snapshots, goal mappings, proportion validation, and sample guardrails in plain TypeScript; persist the selected metric with each log, default legacy logs to traffic, and isolate sample numbers from live results so previews never overwrite drafts.
- Keep anonymous suggestions insert-only with database validation, duplicate/global rate guards and a browser cooldown; collect no visitor identifiers so private CSV review stays inbox-free.
- Use the shared production format as the authoritative proof-media input with case-insensitive detection; preserve it on platform switches and update it on explicit tracking-format edits to prevent sticky frames. Hold poll options in workspace state; render polls in a focused preview module so options survive tab and platform switches without AI.
