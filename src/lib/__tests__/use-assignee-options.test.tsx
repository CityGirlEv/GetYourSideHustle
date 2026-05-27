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
    (listQaAssignees as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      "Alex",
      "Jamie",
    ]);
    const useAssigneeOptions = await freshHook();

    const { result } = renderHook(() => useAssigneeOptions());

    // First synchronous render: just the built-in owners.
    expect(result.current).toEqual([...TEST_OWNERS]);

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.arrayContaining([...TEST_OWNERS, "Alex", "Jamie"]),
      );
    });
    // De-duped: no duplicate entries
    expect(new Set(result.current).size).toBe(result.current.length);
  });

  it("de-dupes QA names that collide with TEST_OWNERS", async () => {
    (listQaAssignees as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      TEST_OWNERS[0], // duplicate
      "Alex",
    ]);
    const useAssigneeOptions = await freshHook();

    const { result } = renderHook(() => useAssigneeOptions());
    await waitFor(() => expect(result.current).toContain("Alex"));
    expect(
      result.current.filter((n) => n === TEST_OWNERS[0]).length,
    ).toBe(1);
  });

  it("falls back to TEST_OWNERS when the server fn rejects", async () => {
    (listQaAssignees as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("nope"),
    );
    const useAssigneeOptions = await freshHook();

    const { result } = renderHook(() => useAssigneeOptions());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(result.current).toEqual([...TEST_OWNERS]);
  });

  it("only calls the server fn once across multiple hook consumers", async () => {
    (listQaAssignees as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      "Alex",
    ]);
    const useAssigneeOptions = await freshHook();

    renderHook(() => useAssigneeOptions());
    renderHook(() => useAssigneeOptions());
    renderHook(() => useAssigneeOptions());

    await waitFor(() =>
      expect(
        (listQaAssignees as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
      ).toBeGreaterThan(0),
    );
    expect(
      (listQaAssignees as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(1);
  });
});