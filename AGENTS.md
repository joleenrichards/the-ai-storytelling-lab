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
- Keep all workflow tools mounted within accessible hidden tab panels and hold handoff values in the index workspace; this preserves session edits without browser storage or a server.
- Keep shot presets and production-sheet serialization in plain TypeScript; retain separate in-session checklists per format and nullable custom technical notes so switching formats updates defaults without overwriting edits.
- Define channel formats, compatibility fallback, and shot tracking mappings in the pure UTM module; hold platform and format as one workspace selection so channel switches and production handoffs cannot generate mismatched URLs.
- Keep A/B comparison defaults, handoffs, and verdict/guardrail logic in plain TypeScript; hold both selected formats in the workspace so tab changes preserve edits and handoffs retain exact UTM content.
- Keep framing wireframes and decorative field marks in focused presentational modules; keep prompt scenarios in the pure hooks module so the five-item cycle can be tested without the UI.
- Hook generation uses the AI Gateway inside a public server function with bounded input and validated JSON; static samples render without calls, and only explicit actions trigger inference with session history and a local fallback.
- Keep the Field Manual in a focused presentation module using the shared accessible sheet primitive so opening guidance never unmounts tools or changes workspace state.
- Pulse stores only aggregate totals and increments through a narrowly granted atomic RPC; browser-local flags discourage repeat votes without storing visitor identifiers, and totals refresh on focus and periodically.
- Keep the shareable hook in workspace state, updating it to the first fresh angle or the explicitly handed-off angle so footer sharing never copies stale initial samples.
