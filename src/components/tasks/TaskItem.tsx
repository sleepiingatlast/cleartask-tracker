import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Priority, Task } from "@/lib/tasks";

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={`Mark "${task.title}" as ${task.completed ? "active" : "completed"}`}
        onClick={() => onToggle(task.id)}
        className={cn(
          "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          task.completed ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary",
        )}
      >
        {task.completed && <Check className="size-3" strokeWidth={3} />}
      </button>

      <div className="min-w-0">
        <p
          className={cn(
            "break-words leading-snug",
            task.completed ? "text-muted-foreground line-through decoration-1" : "text-foreground",
          )}
        >
          {task.title}
        </p>
        {(task.priority || task.tag) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            {task.priority && (
              <span className="inline-flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full", PRIORITY_DOT[task.priority])} aria-hidden />
                {task.priority}
                <span className="sr-only"> priority</span>
              </span>
            )}
            {task.tag && <span className="normal-case">#{task.tag}</span>}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label={`Delete "${task.title}"`}
        onClick={() => onDelete(task.id)}
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}
