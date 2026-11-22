import { cn } from "@/lib/utils";
import { FILTERS, type TaskCounts, type TaskFilter } from "@/lib/tasks";

const LABELS: Record<TaskFilter, string> = { all: "All", active: "Active", completed: "Completed" };

interface TaskFiltersProps {
  value: TaskFilter;
  counts: TaskCounts;
  onChange: (filter: TaskFilter) => void;
}

export function TaskFilters({ value, counts, onChange }: TaskFiltersProps) {
  return (
    <div role="group" aria-label="Filter tasks" className="flex gap-1 border-b">
      {FILTERS.map((filter) => {
        const selected = filter === value;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(filter)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors outline-hidden focus-visible:text-foreground",
              selected
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {LABELS[filter]}
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{counts[filter]}</span>
          </button>
        );
      })}
    </div>
  );
}
