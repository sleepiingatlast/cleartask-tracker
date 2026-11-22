import { describe, expect, it } from "vitest";

import { STORAGE_KEY, loadTasks, parseStoredTasks, saveTasks, type StorageLike } from "./storage";
import type { Task } from "./types";

const sample: Task[] = [
  { id: "a", title: "First", completed: false, createdAt: 1, priority: "high", tag: "work" },
  { id: "b", title: "Second", completed: true, createdAt: 2 },
];

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
};

describe("saveTasks + loadTasks", () => {
  it("round-trips tasks", () => {
    const storage = memoryStorage();
    expect(saveTasks(storage, sample)).toBe(true);
    expect(loadTasks(storage)).toEqual({ tasks: sample, status: "ok" });
  });

  it("stores a versioned envelope under the storage key", () => {
    const storage = memoryStorage();
    saveTasks(storage, sample);
    expect(JSON.parse(storage.data[STORAGE_KEY] ?? "")).toEqual({ version: 1, tasks: sample });
  });
});

describe("loadTasks fallbacks", () => {
  it("reports empty when nothing is saved", () => {
    expect(loadTasks(memoryStorage())).toEqual({ tasks: [], status: "empty" });
  });

  it("reports unavailable when there is no storage", () => {
    expect(loadTasks(null)).toEqual({ tasks: [], status: "unavailable" });
  });

  it("reports unavailable instead of throwing when reading fails", () => {
    expect(loadTasks(throwingStorage)).toEqual({ tasks: [], status: "unavailable" });
  });
});

describe("saveTasks fallbacks", () => {
  it("returns false when there is no storage", () => {
    expect(saveTasks(null, sample)).toBe(false);
  });

  it("returns false instead of throwing when writing fails", () => {
    expect(saveTasks(throwingStorage, sample)).toBe(false);
  });
});

describe("parseStoredTasks", () => {
  it.each([
    ["invalid JSON", "{not json"],
    ["a JSON primitive", "42"],
    ["JSON null", "null"],
    ["a bare array", JSON.stringify(sample)],
    ["a wrong version", JSON.stringify({ version: 99, tasks: sample })],
    ["tasks that aren't an array", JSON.stringify({ version: 1, tasks: {} })],
  ])("treats %s as corrupted with no tasks", (_label, raw) => {
    expect(parseStoredTasks(raw)).toEqual({ tasks: [], status: "corrupted" });
  });

  it("keeps valid tasks and flags corruption when some entries are bad", () => {
    const raw = JSON.stringify({ version: 1, tasks: [sample[0], { id: 5 }, "junk"] });
    expect(parseStoredTasks(raw)).toEqual({ tasks: [sample[0]], status: "corrupted" });
  });

  it("treats an empty string as empty", () => {
    expect(parseStoredTasks("")).toEqual({ tasks: [], status: "empty" });
  });
});
