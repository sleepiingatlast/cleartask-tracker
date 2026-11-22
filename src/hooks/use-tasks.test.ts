import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { STORAGE_KEY } from "@/lib/tasks";

import { useTasks } from "./use-tasks";

describe("useTasks", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists added tasks to localStorage", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.hydrated).toBe(true);

    let error: string | null = "unset";
    act(() => {
      error = result.current.addTask({ title: "Write tests", priority: "low" });
    });

    expect(error).toBeNull();
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.tasks).toHaveLength(1);
    expect(saved.tasks[0]).toMatchObject({ title: "Write tests", priority: "low", completed: false });
  });

  it("returns an error and adds nothing for an empty title", () => {
    const { result } = renderHook(() => useTasks());
    let error: string | null = null;
    act(() => {
      error = result.current.addTask({ title: "   " });
    });
    expect(error).toBe("Title can't be empty.");
    expect(result.current.tasks).toEqual([]);
  });

  it("restores saved tasks on mount", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, tasks: [{ id: "x", title: "Saved", completed: true, createdAt: 1 }] }),
    );
    const { result } = renderHook(() => useTasks());
    expect(result.current.storageStatus).toBe("ok");
    expect(result.current.tasks.map((t) => t.title)).toEqual(["Saved"]);
  });

  it("falls back to an empty list when saved data is corrupted", () => {
    window.localStorage.setItem(STORAGE_KEY, "{broken");
    const { result } = renderHook(() => useTasks());
    expect(result.current.storageStatus).toBe("corrupted");
    expect(result.current.tasks).toEqual([]);
  });
});
