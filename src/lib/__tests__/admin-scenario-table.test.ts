import { describe, expect, it } from "vitest";
import {
  adminScenarioFilterOptions,
  ADMIN_SCENARIO_COLUMNS,
  emptyAdminScenarioTableFilters,
  filterAdminScenarioRows,
  sortAdminScenarioRows,
  type AdminScenarioRow,
  type AdminScenarioTableContext,
} from "@/lib/admin-scenario-table";

function sampleScenario(overrides: Partial<AdminScenarioRow> = {}): AdminScenarioRow {
  return {
    id: "1",
    scenario_code: "ABC123",
    birth_year: 1960,
    zip3: "902",
    gender: "female",
    tobacco: false,
    income_band: "$50k–$75k",
    cost_preference: "predictability",
    medications: [{ name: "A" }],
    conditions: [],
    claimed_by: null,
    claimed_at: null,
    created_at: "2026-01-15T12:00:00.000Z",
    expires_at: "2026-02-15T12:00:00.000Z",
    assigned_agent_id: null,
    agent_notes: null,
    ...overrides,
  };
}

const emptyCtx: AdminScenarioTableContext = {
  contactsByCode: new Map(),
  agentLabelById: new Map([["agent-1", "Jane Agent"]]),
};

describe("admin scenario table filter + sort", () => {
  const rows = [
    sampleScenario({
      id: "1",
      scenario_code: "AAA111",
      zip3: "902",
      birth_year: 1960,
      tobacco: false,
      cost_preference: "predictability",
    }),
    sampleScenario({
      id: "2",
      scenario_code: "BBB222",
      zip3: "100",
      birth_year: 1955,
      tobacco: true,
      cost_preference: "min_monthly",
      medications: [],
      conditions: [{ name: "Diabetes" }],
      assigned_agent_id: "agent-1",
      assigned_at: "2026-02-01T08:00:00.000Z",
    }),
  ];

  it("filters by multi-select tobacco", () => {
    const filters = emptyAdminScenarioTableFilters();
    filters.tobacco = ["Yes"];
    const filtered = filterAdminScenarioRows(rows, filters, emptyCtx);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.scenario_code).toBe("BBB222");
  });

  it("sorts by birth year ascending", () => {
    const sorted = sortAdminScenarioRows(rows, "birthYear", "asc", emptyCtx);
    expect(sorted.map((row) => row.scenario_code)).toEqual(["BBB222", "AAA111"]);
  });

  it("builds zip3 filter options", () => {
    const options = adminScenarioFilterOptions(rows, "zip3", emptyCtx);
    expect(options).toHaveLength(2);
    expect(options.map((option) => option.value).sort()).toEqual(["100xx", "902xx"]);
  });

  it("filters assigned agent by label", () => {
    const filters = emptyAdminScenarioTableFilters();
    filters.assignedAgent = ["Jane Agent"];
    const filtered = filterAdminScenarioRows(rows, filters, emptyCtx);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.scenario_code).toBe("BBB222");
  });

  it("places assigned agent columns after created", () => {
    const keys = ADMIN_SCENARIO_COLUMNS.map((column) => column.key);
    expect(keys.indexOf("created")).toBe(0);
    expect(keys.indexOf("assignedAgent")).toBe(1);
    expect(keys.indexOf("assignedAt")).toBe(2);
    expect(keys.indexOf("scenarioId")).toBe(3);
  });

  it("sorts by date assigned descending", () => {
    const sorted = sortAdminScenarioRows(rows, "assignedAt", "desc", emptyCtx);
    expect(sorted.map((row) => row.scenario_code)).toEqual(["BBB222", "AAA111"]);
  });
});
