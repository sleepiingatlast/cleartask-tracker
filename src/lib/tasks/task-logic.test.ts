import { describe, expect, it } from "vitest";

import {
  MAX_TAG_LENGTH,
  MAX_TITLE_LENGTH,
  addTask,
  countTasks,
  createTask,
  deleteTask,
  filterTasks,
  isTaskFilter,
  normalizeTag,
  parseTask,
  toggleTask,
} from "./task-logic";
import type { Task } from "./types";

const meta = { id: "t1", now: 1_700_000_000_000 };

function task(id: string, completed = false): Task {
  return { id, title: `Task ${id}`, completed, createdAt: 0 };
}

describe("createTask", () => {
  it("creates an active task with a trimmed title", () => {
    const result = createTask({ title: "  Buy milk  " }, meta);
    expect(result).toEqual({
      ok: true,
      task: { id: "t1", title: "Buy milk", completed: false, createdAt: meta.now },
    });
  });

  it("rejects an empty or whitespace-only title", () => {
    expect(createTask({ title: "" }, meta)).toEqual({ ok: false, error: "Title can't be empty." });
    expect(createTask({ title: "   " }, meta).ok).toBe(false);
  });

  it("rejects a title over the length limit", () => {
    expect(createTask({ title: "a".repeat(MAX_TITLE_LENGTH + 1) }, meta).ok).toBe(false);
    expect(createTask({ title: "a".repeat(MAX_TITLE_LENGTH) }, meta).ok).toBe(true);
  });

  it("keeps an optional priority and a normalized tag", () => {
    const result = createTask({ title: "Ship", priority: "high", tag: " #Work Stuff " }, meta);
    expect(result.ok && result.task).toMatchObject({ priority: "high", tag: "work-stuff" });
  });

  it("omits priority and tag when not given", () => {
    const result = createTask({ title: "Plain", priority: undefined, tag: "  " }, meta);
    expect(result.ok && Object.keys(result.task).sort()).toEqual(["completed", "createdAt", "id", "title"]);
  });

  it("rejects an unknown priority", () => {
    // Simulates bad input arriving from outside the type system.
    const input = { title: "x", priority: "urgent" } as unknown as Parameters<typeof createTask>[0];
    expect(createTask(input, meta).ok).toBe(false);
  });

  it("rejects a tag over the length limit", () => {
    expect(createTask({ title: "x", tag: "a".repeat(MAX_TAG_LENGTH + 1) }, meta).ok).toBe(false);
  });
});

describe("normalizeTag", () => {
  it("returns undefined for blank input", () => {
    expect(normalizeTag(undefined)).toBeUndefined();
    expect(normalizeTag("  ")).toBeUndefined();
    expect(normalizeTag("#")).toBeUndefined();
  });
});

describe("list operations", () => {
  it("addTask puts the new task first without mutating the input", () => {
    const list = [task("a")];
    const next = addTask(list, task("b"));
    expect(next.map((t) => t.id)).toEqual(["b", "a"]);
    expect(list).toHaveLength(1);
  });

  it("toggleTask flips only the matching task", () => {
    const list = [task("a"), task("b")];
    const once = toggleTask(list, "a");
    expect(once.map((t) => t.completed)).toEqual([true, false]);
    expect(toggleTask(once, "a")[0]?.completed).toBe(false);
    expect(list[0]?.completed).toBe(false);
  });

  it("toggleTask and deleteTask ignore unknown ids", () => {
    const list = [task("a")];
    expect(toggleTask(list, "nope")).toEqual(list);
    expect(deleteTask(list, "nope")).toEqual(list);
  });

  it("deleteTask removes the matching task", () => {
    expect(deleteTask([task("a"), task("b")], "a").map((t) => t.id)).toEqual(["b"]);
  });
});

describe("filterTasks and countTasks", () => {
  const list = [task("a"), task("b", true), task("c")];

  it("filters all / active / completed", () => {
    expect(filterTasks(list, "all").map((t) => t.id)).toEqual(["a", "b", "c"]);
    expect(filterTasks(list, "active").map((t) => t.id)).toEqual(["a", "c"]);
    expect(filterTasks(list, "completed").map((t) => t.id)).toEqual(["b"]);
  });

  it("counts tasks per filter", () => {
    expect(countTasks(list)).toEqual({ all: 3, active: 2, completed: 1 });
    expect(countTasks([])).toEqual({ all: 0, active: 0, completed: 0 });
  });
});

describe("parseTask", () => {
  const valid = { id: "a", title: "Hi", completed: false, createdAt: 1 };

  it("accepts a valid task and drops unknown fields", () => {
    expect(parseTask({ ...valid, priority: "low", tag: "x", extra: true })).toEqual({
      ...valid,
      priority: "low",
      tag: "x",
    });
  });

  it.each([
    ["null", null],
    ["a string", "task"],
    ["an array", []],
    ["missing id", { ...valid, id: undefined }],
    ["blank title", { ...valid, title: "  " }],
    ["non-boolean completed", { ...valid, completed: "yes" }],
    ["non-finite createdAt", { ...valid, createdAt: Number.NaN }],
    ["bad priority", { ...valid, priority: "urgent" }],
    ["empty tag", { ...valid, tag: "" }],
  ])("rejects %s", (_label, value) => {
    expect(parseTask(value)).toBeNull();
  });
});

describe("isTaskFilter", () => {
  it("accepts only known filters", () => {
    expect(["all", "active", "completed"].every(isTaskFilter)).toBe(true);
    expect(isTaskFilter("done")).toBe(false);
    expect(isTaskFilter(undefined)).toBe(false);
  });
});
