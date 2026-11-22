import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { StorageNotice } from "@/components/tasks/StorageNotice";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { useTasks } from "@/hooks/use-tasks";
import { countTasks, filterTasks, isTaskFilter, type TaskFilter } from "@/lib/tasks";

/** The filter lives in the URL (?filter=active) so it survives refreshes; "all" is the default. */
interface IndexSearch {
  filter?: TaskFilter;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    const filter = search["filter"];
    return isTaskFilter(filter) && filter !== "all" ? { filter } : {};
  },
  head: () => ({
    meta: [
      { title: "Tasks — a lightweight task tracker" },
      { name: "description", content: "Add, complete and filter tasks. Everything stays in your browser." },
      { property: "og:title", content: "Tasks — a lightweight task tracker" },
      { property: "og:description", content: "Add, complete and filter tasks. Everything stays in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { tasks, hydrated, storageStatus, addTask, toggleTask, deleteTask } = useTasks();
  const { filter = "all" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setFilter = (next: TaskFilter) =>
    navigate({ search: next === "all" ? {} : { filter: next }, replace: true });

  const counts = useMemo(() => countTasks(tasks), [tasks]);
  const visibleTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
      <header className="mb-8 flex items-end justify-between gap-4">
        <h1 className="font-display text-6xl leading-none tracking-tight text-foreground sm:text-7xl">
          Tasks<span className="text-primary">.</span>
        </h1>
        <p className="pb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground" aria-live="polite">
          {hydrated ? `${counts.active} left · ${counts.completed} done` : "\u00a0"}
        </p>
      </header>

      <div className="space-y-6">
        <StorageNotice status={storageStatus} />
        <TaskForm onAdd={addTask} disabled={!hydrated} />
        <section aria-label="Task list">
          <TaskFilters value={filter} counts={counts} onChange={setFilter} />
          <TaskList
            tasks={visibleTasks}
            filter={filter}
            loading={!hydrated}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        </section>
      </div>

      <footer className="mt-16 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        Saved in this browser only
      </footer>
    </main>
  );
}
