# Tasks — a lightweight task tracker

A small task tracker built with TypeScript and React. Add tasks with an optional
priority and tag, mark them done, filter them, and delete them. Everything is
saved in your browser's `localStorage`. There is no sign-in, no server database,
no API keys and no personal data.

## Features

- Add a task with a required title (trimmed, max 200 characters), an optional
  priority (`low` / `medium` / `high`) and an optional tag (normalized to
  lowercase, e.g. `#Work Stuff` becomes `work-stuff`)
- Mark tasks complete or active
- Filter by **All / Active / Completed**. The filter is kept in the URL
  (`?filter=active`), so it survives a refresh
- Delete a task
- Persistence in `localStorage` with safe fallbacks:
  - storage blocked or missing (private mode, disabled): the app works in
    memory and shows a notice
  - saved data unreadable or the wrong shape: valid tasks are kept, bad entries
    are dropped, and a notice is shown
  - a write fails (e.g. quota full): a notice is shown and the app keeps running

## Getting started

Requires [Bun](https://bun.sh) (recommended) or Node.js 20+ with npm.

```sh
bun install        # or: npm install
bun run dev        # start the dev server and open the printed URL
bun run test       # run the unit tests once (Vitest)
bun run test:watch # re-run tests on change
bun run build      # production build
bun run preview    # serve the production build locally
bun run lint       # ESLint
```

With npm, use `npm run <script>` for the same commands.

## Project structure

```text
src/
├── lib/tasks/                 Pure logic: no React, no browser globals
│   ├── types.ts               Task, Priority, TaskFilter, NewTaskInput
│   ├── task-logic.ts          createTask (validation), add/toggle/delete,
│   │                          filterTasks, countTasks, parseTask
│   ├── storage.ts             localStorage load/save with safe fallbacks
│   ├── reducer.ts             State transitions (hydrated/added/toggled/deleted)
│   ├── index.ts               Public exports
│   └── *.test.ts              Unit tests
├── hooks/
│   ├── use-tasks.ts           Connects the logic to React and localStorage
│   └── use-tasks.test.ts      Integration test against jsdom localStorage
├── components/tasks/          Presentational UI
│   ├── TaskForm.tsx
│   ├── TaskFilters.tsx
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   └── StorageNotice.tsx
└── routes/index.tsx           The page: composes the hook and components
```

### How the layers fit

```text
components (UI)  ──calls──▶  useTasks hook  ──uses──▶  lib/tasks (pure)
                                   │
                                   └──▶ storage.ts ──▶ window.localStorage
```

- **`lib/tasks`** is plain TypeScript. Functions take values and return new
  values; they never mutate input. `createTask` receives its `id` and timestamp
  as arguments so tests stay deterministic.
- **`storage.ts`** never throws. It accepts any `StorageLike`
  (`getItem` / `setItem`), so tests use an in-memory fake or a throwing one.
- **`useTasks`** reads storage inside `useEffect` (the app is server-rendered,
  so the first render must not touch `window`), then saves after every change.
- **Components** receive data and callbacks through props and hold only form
  input state.

## Storage format

One key, `task-tracker/v1`, holding a versioned envelope:

```json
{
  "version": 1,
  "tasks": [
    { "id": "…", "title": "Write README", "completed": false, "createdAt": 1700000000000, "priority": "high", "tag": "docs" }
  ]
}
```

Each stored task is checked by `parseTask` on load. If the format changes later,
bump the version and add a migration in `parseStoredTasks`.

## Tests

`bun run test` runs Vitest with jsdom. Coverage:

- `task-logic.test.ts`: validation (empty, too long, bad priority, tag
  normalization), add/toggle/delete immutability, filters, counts, parsing of
  untrusted data
- `storage.test.ts`: round-trip, empty, unavailable and throwing storage,
  invalid JSON, wrong version, partially corrupted lists
- `reducer.test.ts`: state transitions
- `use-tasks.test.ts`: the hook persists to and restores from real (jsdom)
  `localStorage`, including the corrupted-data fallback

## Tech stack

TypeScript (strict), React 19, TanStack Start / Router, Tailwind CSS v4,
Vitest + Testing Library, lucide-react icons.
