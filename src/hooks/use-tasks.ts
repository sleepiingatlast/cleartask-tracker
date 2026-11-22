import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  createTask,
  getBrowserStorage,
  initialTasksState,
  loadTasks,
  saveTasks,
  tasksReducer,
  type LoadStatus,
  type NewTaskInput,
  type StorageLike,
} from "@/lib/tasks";

/** Load statuses plus "save-failed" when a later write is rejected (e.g. quota full). */
export type StorageStatus = LoadStatus | "save-failed";

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Connects the pure task logic to React and localStorage.
 * Storage is read in an effect so server and first client render match.
 */
export function useTasks() {
  const [state, dispatch] = useReducer(tasksReducer, initialTasksState);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("ok");
  const storageRef = useRef<StorageLike | null>(null);

  useEffect(() => {
    const storage = getBrowserStorage();
    storageRef.current = storage;
    const result = loadTasks(storage);
    setStorageStatus(result.status);
    dispatch({ type: "hydrated", tasks: result.tasks });
  }, []);

  useEffect(() => {
    if (!state.hydrated || !storageRef.current) return;
    if (!saveTasks(storageRef.current, state.tasks)) setStorageStatus("save-failed");
  }, [state.hydrated, state.tasks]);

  /** Returns an error message, or null when the task was added. */
  const addTask = useCallback((input: NewTaskInput): string | null => {
    const result = createTask(input, { id: makeId(), now: Date.now() });
    if (!result.ok) return result.error;
    dispatch({ type: "added", task: result.task });
    return null;
  }, []);

  const toggleTask = useCallback((id: string) => dispatch({ type: "toggled", id }), []);
  const deleteTask = useCallback((id: string) => dispatch({ type: "deleted", id }), []);

  return {
    tasks: state.tasks,
    hydrated: state.hydrated,
    storageStatus,
    addTask,
    toggleTask,
    deleteTask,
  };
}
