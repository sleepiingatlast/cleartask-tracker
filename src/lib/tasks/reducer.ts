/** State transitions for the task list, built on the pure helpers in task-logic. */
import { addTask, deleteTask, toggleTask } from "./task-logic";
import type { Task } from "./types";

export interface TasksState {
  tasks: Task[];
  /** False until saved tasks have been read from storage on the client. */
  hydrated: boolean;
}

export type TasksAction =
  | { type: "hydrated"; tasks: Task[] }
  | { type: "added"; task: Task }
  | { type: "toggled"; id: string }
  | { type: "deleted"; id: string };

export const initialTasksState: TasksState = { tasks: [], hydrated: false };

export function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case "hydrated":
      return { tasks: action.tasks, hydrated: true };
    case "added":
      return { ...state, tasks: addTask(state.tasks, action.task) };
    case "toggled":
      return { ...state, tasks: toggleTask(state.tasks, action.id) };
    case "deleted":
      return { ...state, tasks: deleteTask(state.tasks, action.id) };
  }
}
