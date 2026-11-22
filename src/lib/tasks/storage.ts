/**
 * localStorage persistence with safe fallbacks. Nothing in this module throws:
 * missing, blocked or corrupted storage degrades to an in-memory empty list.
 */
import { parseTask } from "./task-logic";
import type { Task } from "./types";

export const STORAGE_KEY = "task-tracker/v1";
const STORAGE_VERSION = 1;

/** The subset of the Web Storage API we use, so tests can pass a fake. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * - ok: tasks loaded
 * - empty: nothing saved yet
 * - unavailable: storage is blocked or missing (private mode, SSR, disabled)
 * - corrupted: saved data was unreadable; any valid tasks were kept
 */
export type LoadStatus = "ok" | "empty" | "unavailable" | "corrupted";

export interface LoadResult {
  tasks: Task[];
  status: LoadStatus;
}

/** Returns window.localStorage if it exists and accepts writes, otherwise null. */
export function getBrowserStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const probe = "__task-tracker-probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeJsonParse(raw: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

/** Parses the raw stored string. Pure: exported for tests. */
export function parseStoredTasks(raw: string | null): LoadResult {
  if (raw === null || raw === "") return { tasks: [], status: "empty" };

  const parsed = safeJsonParse(raw);
  if (!parsed.ok) {
    return { tasks: [], status: "corrupted" };
  }
  const data = parsed.value;
  }

  if (typeof data !== "object" || data === null) return { tasks: [], status: "corrupted" };
  const record = data as Record<string, unknown>;
  const items = record["tasks"];
  if (record["version"] !== STORAGE_VERSION || !Array.isArray(items)) {
    return { tasks: [], status: "corrupted" };
  }

  const tasks = items.map(parseTask).filter((task): task is Task => task !== null);
  return { tasks, status: tasks.length === items.length ? "ok" : "corrupted" };
}

export function loadTasks(storage: StorageLike | null): LoadResult {
  if (!storage) return { tasks: [], status: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { tasks: [], status: "unavailable" };
  }
  return parseStoredTasks(raw);
}

/** Returns false instead of throwing when storage is missing or full. */
export function saveTasks(storage: StorageLike | null, tasks: readonly Task[]): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return true;
  } catch {
    return false;
  }
}
