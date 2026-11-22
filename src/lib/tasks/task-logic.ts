/**
 * Pure task logic: no React, no browser APIs, no side effects.
 * Every function returns a new value and never mutates its input.
 */
import { FILTERS, PRIORITIES, type NewTaskInput, type Priority, type Task, type TaskCounts, type TaskFilter } from "./types";

export const MAX_TITLE_LENGTH = 200;
export const MAX_TAG_LENGTH = 24;

export type CreateTaskResult = { ok: true; task: Task } | { ok: false; error: string };

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITIES as readonly string[]).includes(value);
}

export function isTaskFilter(value: unknown): value is TaskFilter {
  return typeof value === "string" && (FILTERS as readonly string[]).includes(value);
}

/** "  #Work Stuff " -> "work-stuff"; blank -> undefined. */
export function normalizeTag(raw: string | undefined): string | undefined {
  const tag = (raw ?? "").trim().replace(/^#+/, "").trim().replace(/\s+/g, "-").toLowerCase();
  return tag === "" ? undefined : tag;
}

/**
 * Validates user input and builds a task. `id` and `now` are passed in so the
 * function stays deterministic and easy to test.
 */
export function createTask(input: NewTaskInput, meta: { id: string; now: number }): CreateTaskResult {
  const title = input.title.trim();
  if (title === "") return { ok: false, error: "Title can't be empty." };
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
  }

  if (input.priority !== undefined && !isPriority(input.priority)) {
    return { ok: false, error: "Unknown priority." };
  }

  const tag = normalizeTag(input.tag);
  if (tag !== undefined && tag.length > MAX_TAG_LENGTH) {
    return { ok: false, error: `Tag must be ${MAX_TAG_LENGTH} characters or fewer.` };
  }

  const task: Task = { id: meta.id, title, completed: false, createdAt: meta.now };
  if (input.priority !== undefined) task.priority = input.priority;
  if (tag !== undefined) task.tag = tag;
  return { ok: true, task };
}

/** Newest tasks go first. */
export function addTask(tasks: readonly Task[], task: Task): Task[] {
  return [task, ...tasks];
}

export function toggleTask(tasks: readonly Task[], id: string): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
}

export function deleteTask(tasks: readonly Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function filterTasks(tasks: readonly Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case "active":
      return tasks.filter((task) => !task.completed);
    case "completed":
      return tasks.filter((task) => task.completed);
    case "all":
      return [...tasks];
  }
}

export function countTasks(tasks: readonly Task[]): TaskCounts {
  const completed = tasks.filter((task) => task.completed).length;
  return { all: tasks.length, active: tasks.length - completed, completed };
}

/**
 * Turns untrusted data (e.g. from localStorage) into a clean Task, or null if
 * it doesn't have the right shape. Unknown extra fields are dropped.
 */
export function parseTask(value: unknown): Task | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  const id = record["id"];
  const title = record["title"];
  const completed = record["completed"];
  const createdAt = record["createdAt"];
  const priority = record["priority"];
  const tag = record["tag"];

  if (typeof id !== "string" || id === "") return null;
  if (typeof title !== "string" || title.trim() === "") return null;
  if (typeof completed !== "boolean") return null;
  if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) return null;
  if (priority !== undefined && !isPriority(priority)) return null;
  if (tag !== undefined && (typeof tag !== "string" || tag === "")) return null;

  const task: Task = { id, title, completed, createdAt };
  if (priority !== undefined) task.priority = priority;
  if (tag !== undefined) task.tag = tag;
  return task;
}
