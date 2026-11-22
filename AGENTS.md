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

## Project rules

- No auth, no backend database, no external API keys, no personal data: the user's explicit constraint for this app.
- Task business logic lives in `src/lib/tasks/` as pure TypeScript (no React, no browser globals, no mutation); why: keeps it unit-testable and easy to inspect.
- `createTask` takes `id` and `now` as arguments rather than generating them; why: deterministic tests.
- All persistence goes through `src/lib/tasks/storage.ts`, which never throws and validates stored data with `parseTask`; why: blocked or corrupted localStorage must degrade to an in-memory list.
- Storage uses a versioned envelope under one key; bump the version and migrate in `parseStoredTasks` on format changes; why: old saved data must keep loading.
- `useTasks` reads localStorage only inside `useEffect`; why: the page is server-rendered and the first client render must match.
- Components under `src/components/tasks/` are presentational and receive data and callbacks via props; why: separates UI from state logic.
- The task filter lives in the URL search param `filter` (omitted for "all"); why: survives refresh and is shareable.
- Any change to task logic or storage gets a test in the matching `*.test.ts` next to it.
