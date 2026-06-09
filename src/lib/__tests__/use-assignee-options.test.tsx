import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mock the server fn BEFORE importing the hook so the module-level
// cache inside use-assignee-options sees the mocked function.
vi.mock("@/lib/qa-assignees.functions", () => ({
  listQaAssignees: vi.fn(),
}));

import { listQaAssignees } from "@/lib/qa-assignees.functions";
import { TEST_OWNERS } from "@/lib/test-plan";

async function freshHook() {
  // Re-import to reset the module-level cache between tests.
  vi.resetModules();
  const mod = await import("@/lib/use-assignee-options");
  return mod.useAssigneeOptions;
}

describe("useAssigneeOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns TEST_OWNERS immediately, then merges in QA names", async () => {
    const useAssigneeOptions = await freshHook();
    const { listQaAssignees: mockList } = await import("@/lib/qa-assignees.functions");
    (mockList as any).mockResolvedValue([
      "Alex",
      "Jamie",
    ]);

    const { result } = renderHook(() => useAssigneeOptions());

    // First synchronous render: Unassigned plus the built-in owners.
    expect(result.current).toEqual(["Unassigned", ...TEST_OWNERS]);

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.arrayContaining([...TEST_OWNERS, "Alex", "Jamie"]),
      );
    });
    // De-duped: no duplicate entries
    expect(new Set(result.current).size).toBe(result.current.length);
  });

  it("de-dupes QA names that collide with TEST_OWNERS", async () => {
    const useAssigneeOptions = await freshHook();
    const { listQaAssignees: mockList } = await import("@/lib/qa-assignees.functions");
    (mockList as any).mockResolvedValue([
      TEST_OWNERS[0], // duplicate
      "Alex",
    ]);

    const { result } = renderHook(() => useAssigneeOptions());
    await waitFor(() => expect(result.current).toContain("Alex"));
    expect(
      result.current.filter((n) => n === TEST_OWNERS[0]).length,
    ).toBe(1);
  });

  it("falls back to TEST_OWNERS when the server fn rejects", async () => {
    const useAssigneeOptions = await freshHook();
    const { listQaAssignees: mockList } = await import("@/lib/qa-assignees.functions");
    (mockList as any).mockRejectedValue(
      new Error("nope"),
    );

    const { result } = renderHook(() => useAssigneeOptions());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(result.current).toEqual(["Unassigned", ...TEST_OWNERS]);
  });

  it("only calls the server fn once across multiple hook consumers", async () => {
    const useAssigneeOptions = await freshHook();
    const { listQaAssignees: mockList } = await import("@/lib/qa-assignees.functions");
    (mockList as any).mockResolvedValue([
      "Alex",
    ]);

    renderHook(() => useAssigneeOptions());
    renderHook(() => useAssigneeOptions());
    renderHook(() => useAssigneeOptions());

    await waitFor(() =>
      expect(
        (mockList as any).mock.calls.length,
      ).toBeGreaterThan(0),
    );
    expect(
      (mockList as any).mock.calls.length,
    ).toBe(1);
  });
});