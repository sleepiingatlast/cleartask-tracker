import type { Task, TaskFilter } from "@/lib/tasks";

import { TaskItem } from "./TaskItem";

const EMPTY_TEXT: Record<TaskFilter, string> = {
  all: "No tasks yet. Add your first one above.",
  active: "Nothing active. Nice work.",
  completed: "No completed tasks yet.",
};

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  loading: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, filter, loading, onToggle, onDelete }: TaskListProps) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading tasks…</p>;
  }
  if (tasks.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{EMPTY_TEXT[filter]}</p>;
  }
  return (
    <ul className="divide-y" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
