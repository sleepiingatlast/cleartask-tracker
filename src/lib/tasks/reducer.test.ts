import { describe, expect, it } from "vitest";

import { initialTasksState, tasksReducer } from "./reducer";
import type { Task } from "./types";

const a: Task = { id: "a", title: "A", completed: false, createdAt: 1 };
const b: Task = { id: "b", title: "B", completed: false, createdAt: 2 };

describe("tasksReducer", () => {
  it("starts empty and not hydrated", () => {
    expect(initialTasksState).toEqual({ tasks: [], hydrated: false });
  });

  it("hydrated replaces tasks and marks the state hydrated", () => {
    expect(tasksReducer(initialTasksState, { type: "hydrated", tasks: [a] })).toEqual({
      tasks: [a],
      hydrated: true,
    });
  });

  it("handles add, toggle and delete in sequence", () => {
    let state = tasksReducer(initialTasksState, { type: "hydrated", tasks: [a] });
    state = tasksReducer(state, { type: "added", task: b });
    expect(state.tasks.map((t) => t.id)).toEqual(["b", "a"]);

    state = tasksReducer(state, { type: "toggled", id: "a" });
    expect(state.tasks.find((t) => t.id === "a")?.completed).toBe(true);

    state = tasksReducer(state, { type: "deleted", id: "b" });
    expect(state).toEqual({ tasks: [{ ...a, completed: true }], hydrated: true });
  });
});
