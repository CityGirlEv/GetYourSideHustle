// ============================================================================
// PLATFORM VARIANTS
// ----------------------------------------------------------------------------
// ONLY Scenario-area tests are fanned out into platform sub-tests. We support
// 3 platforms: Computer (desktop/laptop), Phone, and iPad. The Computer
// variant keeps the source test's owner; Phone + iPad variants are split
// deterministically between Catria and Unassigned so Catria can reassign as
// needed. Non-Scenario tests pass through unchanged.
// ============================================================================
import type { TestCase } from "@/lib/test-plan";
import { ACTIVE_SPRINT_ID, getTestAssignee } from "@/lib/test-plan";

export type PlatformCategory = "Mobile" | "Tablet" | "Desktop";

export interface TestPlatform {
  /** id suffix appended to the source test id, e.g. "PHONE" → "SCEN-001-PHONE" */
  suffix: string;
  /** Human label shown after the title, e.g. "Phone" */
  label: string;
  category: PlatformCategory;
}

export const TEST_PLATFORMS: TestPlatform[] = [
  { suffix: "COMP",  label: "Computer",  category: "Desktop" },
  { suffix: "PHONE", label: "Phone",     category: "Mobile" },
  { suffix: "IPAD",  label: "iPad",      category: "Tablet" },
];

/** Legacy fallback owner when a source test has no owner and cannot be derived. */
export const PLATFORM_VARIANT_OWNER = "Catria";

/**
 * For Scenario-area tests on non-Desktop platforms (Phone + iPad) the owner
 * is forced to alternate between Catria and Unassigned, regardless of who
 * owns the source (Computer) test. Computer variants keep the source owner.
 * Split is deterministic from the source id + platform suffix so the same
 * test always lands on the same owner across renders.
 */
function scenarioNonDesktopOwner(sourceId: string, suffix: string): "Catria" | "Unassigned" {
  const n = parseInt((sourceId.match(/(\d+)/)?.[1] ?? "0"), 10);
  const platformIdx = ["PHONE", "IPAD"].indexOf(suffix);
  return (n + platformIdx) % 2 === 0 ? "Catria" : "Unassigned";
}

/**
 * Fan out a Scenario-area TestCase into one variant per supported platform.
 * Non-Scenario tests are returned as-is (no platform sub-tests). Each
 * Scenario variant gets a deterministic id (`<sourceId>-<suffix>`), the
 * platform name appended to the title and area, and a per-platform owner
 * (Computer keeps the source owner; Phone/iPad alternate Catria/Unassigned).
 */
export function expandTestWithPlatforms(t: TestCase): TestCase[] {
  const isScenario = t.area === "Scenario" || t.area.startsWith("Scenario");
  if (!isScenario) return [t];
  return TEST_PLATFORMS.map((p) => {
    const baseAssignee = t.assignee || getTestAssignee(t);
    const assignee =
      p.category !== "Desktop"
        ? scenarioNonDesktopOwner(t.id, p.suffix)
        : baseAssignee;
    // Unassigned variants must fall into the Backlog (handled by
    // getTestSprintId when sprintId is undefined). Only pin a sprint when
    // the source already had one or the variant has a real owner.
    const sprintId = t.sprintId
      ? t.sprintId
      : assignee === "Unassigned"
        ? undefined
        : ACTIVE_SPRINT_ID;
    return {
      ...t,
      id: `${t.id}-${p.suffix}`,
      title: `${t.title} — ${p.label}`,
      area: `${t.area} · ${p.category}`,
      assignee,
      sprintId,
      notes: t.notes
        ? `${t.notes}\n\nPlatform: ${p.label} (from ${t.id})`
        : `Platform: ${p.label} (from ${t.id})`,
    };
  });
}

/** Convenience: expand a whole list of tests. */
export function expandAllWithPlatforms(tests: TestCase[]): TestCase[] {
  const out: TestCase[] = [];
  for (const t of tests) out.push(...expandTestWithPlatforms(t));
  return out;
}