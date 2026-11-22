import { ChevronDown, Plus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { MAX_TAG_LENGTH, MAX_TITLE_LENGTH, PRIORITIES, isPriority, type NewTaskInput } from "@/lib/tasks";

interface TaskFormProps {
  /** Returns an error message, or null on success. */
  onAdd: (input: NewTaskInput) => string | null;
  disabled?: boolean;
}

export function TaskForm({ onAdd, disabled = false }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onAdd({ title, priority: isPriority(priority) ? priority : undefined, tag });
    if (result) {
      setError(result);
    } else {
      setTitle("");
      setTag("");
      setPriority("");
      setError(null);
    }
    titleRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border bg-card p-3 shadow-paper sm:p-4">
      <label htmlFor="task-title" className="sr-only">
        Task title
      </label>
      <input
        id="task-title"
        ref={titleRef}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError(null);
        }}
        maxLength={MAX_TITLE_LENGTH}
        placeholder="What needs doing?"
        autoComplete="off"
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "task-error" : undefined}
        className="w-full bg-transparent px-1 py-2 text-lg text-card-foreground placeholder:text-muted-foreground outline-hidden"
      />

      <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 sm:flex sm:items-center">
        <div className="relative">
          <label htmlFor="task-priority" className="sr-only">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={disabled}
            className="h-9 w-full appearance-none rounded-md border bg-background pl-3 pr-8 font-mono text-xs uppercase tracking-wide text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-hidden sm:w-36"
          >
            <option value="">No priority</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="relative sm:w-40">
          <label htmlFor="task-tag" className="sr-only">
            Tag
          </label>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
            #
          </span>
          <input
            id="task-tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            maxLength={MAX_TAG_LENGTH + 1}
            placeholder="tag"
            autoComplete="off"
            disabled={disabled}
            className="h-9 w-full rounded-md border bg-background pl-6 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring outline-hidden"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="col-span-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-hidden disabled:opacity-50 sm:ml-auto"
        >
          <Plus className="size-4" />
          Add task
        </button>
      </div>

      {error && (
        <p id="task-error" role="alert" className="mt-2 px-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
