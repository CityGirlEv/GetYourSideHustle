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
      { name: "Alex", active: true },
      { name: "Jamie", active: false },
    ]);

    const { result } = renderHook(() => useAssigneeOptions());

    expect(result.current.map((o) => o.name)).toEqual(["Unassigned", ...TEST_OWNERS]);

    await waitFor(() => {
      expect(result.current.map((o) => o.name)).toEqual(
        expect.arrayContaining([...TEST_OWNERS, "Alex", "Jamie"]),
      );
    });

    const alex = result.current.find((o) => o.name === "Alex");
    const jamie = result.current.find((o) => o.name === "Jamie");
    expect(alex?.selectable).toBe(true);
    expect(jamie?.selectable).toBe(true);
  });

  it("de-dupes QA names that collide with TEST_OWNERS", async () => {
    const useAssigneeOptions = await freshHook();
    const { listQaAssignees: mockList } = await import("@/lib/qa-assignees.functions");
    (mockList as any).mockResolvedValue([
      { name: TEST_OWNERS[0], active: true },
      { name: "Alex", active: true },
    ]);

    const { result } = renderHook(() => useAssigneeOptions());
    await waitFor(() => expect(result.current.some((o) => o.name === "Alex")).toBe(true));
    expect(result.current.filter((o) => o.name === TEST_OWNERS[0]).length).toBe(1);
  });

  it("falls back to TEST_OWNERS when the server fn rejects", async () => {
    const useAssigneeOptions = await freshHook();
    const { listQaAssignees: mockList } = await import("@/lib/qa-assignees.functions");
    (mockList as any).mockRejectedValue(new Error("nope"));

    const { result } = renderHook(() => useAssigneeOptions());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(result.current.map((o) => o.name)).toEqual(["Unassigned", ...TEST_OWNERS]);
  });

  it("only calls the server fn once across multiple hook consumers", async () => {
    const useAssigneeOptions = await freshHook();
    const { listQaAssignees: mockList } = await import("@/lib/qa-assignees.functions");
    (mockList as any).mockResolvedValue([{ name: "Alex", active: true }]);

    renderHook(() => useAssigneeOptions());
    renderHook(() => useAssigneeOptions());
    renderHook(() => useAssigneeOptions());

    await waitFor(() => expect((mockList as any).mock.calls.length).toBeGreaterThan(0));
    expect((mockList as any).mock.calls.length).toBe(1);
  });
});
