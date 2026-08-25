import { describe, expect, it } from "vitest";
import {
  applyFilterChipClick,
  boardSourceAllowedByStatusFacets,
  toggleFilterValue,
} from "../gysh-filter-chips";

describe("toggleFilterValue", () => {
  it("adds a missing value and removes a present one", () => {
    const added = toggleFilterValue(new Set(["a"]), "b");
    expect([...added].sort()).toEqual(["a", "b"]);
    const removed = toggleFilterValue(added, "a");
    expect([...removed]).toEqual(["b"]);
  });
});

describe("applyFilterChipClick", () => {
  const order = ["tina", "evelyn", "candace"] as const;

  it("plain-clicks an idle bubble to filter to only that value", () => {
    const { next } = applyFilterChipClick(new Set(["sprint-3"]), "sprint-2");
    expect([...next]).toEqual(["sprint-2"]);
  });

  it("plain-clicks the only selected bubble to clear the filter", () => {
    const { next } = applyFilterChipClick(new Set(["tina"]), "tina");
    expect(next.size).toBe(0);
  });

  it("plain-clicks a selected bubble among many to filter to only that value", () => {
    const { next } = applyFilterChipClick(new Set(["tina", "evelyn"]), "evelyn");
    expect([...next]).toEqual(["evelyn"]);
  });

  it("Ctrl/Cmd-click toggles a value into the set", () => {
    const added = applyFilterChipClick(new Set(["tina"]), "evelyn", { ctrlKey: true });
    expect([...added.next].sort()).toEqual(["evelyn", "tina"]);
    const removed = applyFilterChipClick(added.next, "tina", { metaKey: true });
    expect([...removed.next]).toEqual(["evelyn"]);
  });

  it("Shift-click adds the range from the last index", () => {
    const { next, lastIndex } = applyFilterChipClick(new Set(["tina"]), "candace", {
      shiftKey: true,
      ordered: order,
      lastIndex: 0,
    });
    expect([...next]).toEqual(["tina", "evelyn", "candace"]);
    expect(lastIndex).toBe(2);
  });
});

describe("boardSourceAllowedByStatusFacets", () => {
  it("hides tasks when only a test-status bubble is selected", () => {
    expect(boardSourceAllowedByStatusFacets("task", 1, 0)).toBe(false);
    expect(boardSourceAllowedByStatusFacets("test", 1, 0)).toBe(true);
  });

  it("hides tests when only a task-status bubble is selected", () => {
    expect(boardSourceAllowedByStatusFacets("test", 0, 1)).toBe(false);
    expect(boardSourceAllowedByStatusFacets("task", 0, 1)).toBe(true);
  });

  it("keeps both sources when both facets are active or neither is", () => {
    expect(boardSourceAllowedByStatusFacets("test", 0, 0)).toBe(true);
    expect(boardSourceAllowedByStatusFacets("task", 2, 1)).toBe(true);
  });
});
