/** Domain types for the task tracker. No runtime code lives here. */

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const FILTERS = ["all", "active", "completed"] as const;
export type TaskFilter = (typeof FILTERS)[number];

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  /** Unix epoch milliseconds. */
  createdAt: number;
  priority?: Priority;
  tag?: string;
}

/** What the user submits from the form, before validation. */
export interface NewTaskInput {
  title: string;
  priority?: Priority | undefined;
  tag?: string | undefined;
}

export interface TaskCounts {
  all: number;
  active: number;
  completed: number;
}
