import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/lib/qa-assignees.functions", () => ({
  listQaAssignees: vi.fn(),
}));

import { listQaAssignees } from "@/lib/qa-assignees.functions";

async function freshHook() {
  vi.resetModules();

  const mod = await import("@/lib/use-qa-owner-options");

  return mod.useQaOwnerOptions;
}

describe("useQaOwnerOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists Unassigned plus every QA user without TEST_OWNERS", async () => {
    const useQaOwnerOptions = await freshHook();

    (listQaAssignees as any).mockResolvedValue([
      { name: "Alex", active: true },

      { name: "Jamie", active: false },
    ]);

    const { result } = renderHook(() => useQaOwnerOptions());

    expect(result.current.map((o) => o.name)).toEqual(["Unassigned"]);

    await waitFor(() => {
      expect(result.current.map((o) => o.name)).toEqual(["Unassigned", "Alex", "Jamie"]);
    });

    expect(result.current.find((o) => o.name === "Catria")).toBeUndefined();

    expect(result.current.find((o) => o.name === "Alex")?.selectable).toBe(true);

    expect(result.current.find((o) => o.name === "Jamie")?.selectable).toBe(true);
  });
});
