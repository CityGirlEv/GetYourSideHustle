// ============================================================================
// PLATFORM VARIANTS
// ----------------------------------------------------------------------------
// Every test scenario is fanned out into one test per supported platform so QA
// covers iPhone, Android, iPad, macOS and Windows. Variants are derived from
// the source TestCase at read time — adding a new TEST_CASE (or custom test)
// automatically generates the 5 platform sub-tests while preserving the source
// test's owner in the current sprint.
// ============================================================================
import type { TestCase } from "@/lib/test-plan";
import { ACTIVE_SPRINT_ID, getTestAssignee } from "@/lib/test-plan";

export type PlatformCategory = "Mobile" | "Tablet" | "Desktop";

export interface TestPlatform {
  /** id suffix appended to the source test id, e.g. "IOS" → "AUTH-001-IOS" */
  suffix: string;
  /** Human label shown after the title, e.g. "iPhone (iOS)" */
  label: string;
  category: PlatformCategory;
}

export const TEST_PLATFORMS: TestPlatform[] = [
  { suffix: "IOS",   label: "iPhone (iOS)",          category: "Mobile" },
  { suffix: "AND",   label: "Android Phone",         category: "Mobile" },
  { suffix: "IPAD",  label: "iPad",                  category: "Tablet" },
  { suffix: "MAC",   label: "Desktop · macOS",       category: "Desktop" },
  { suffix: "WIN",   label: "Desktop · Windows",     category: "Desktop" },
];

/** Legacy fallback owner when a source test has no owner and cannot be derived. */
export const PLATFORM_VARIANT_OWNER = "Catria";

/**
 * For Scenario-area tests on non-Desktop platforms (Phone + iPad) the owner
 * is forced to alternate between Catria and Unassigned, regardless of who
 * owns the source (Desktop) test. Desktop variants keep the source owner.
 * Split is deterministic from the source id + platform suffix so the same
 * test always lands on the same owner across renders.
 */
function scenarioNonDesktopOwner(sourceId: string, suffix: string): "Catria" | "Unassigned" {
  const n = parseInt((sourceId.match(/(\d+)/)?.[1] ?? "0"), 10);
  const platformIdx = ["IOS", "AND", "IPAD"].indexOf(suffix);
  return (n + platformIdx) % 2 === 0 ? "Catria" : "Unassigned";
}

/**
 * Fan out a single TestCase into one variant per supported platform. Each
 * variant gets a deterministic id (`<sourceId>-<suffix>`), the platform name
 * appended to the title and area, and keeps the source test's owner. The
 * original (un-suffixed) test is NOT returned — callers should always use the
 * fanned-out list.
 */
export function expandTestWithPlatforms(t: TestCase): TestCase[] {
  const isScenario = t.area === "Scenario" || t.area.startsWith("Scenario");
  return TEST_PLATFORMS.map((p) => {
    const baseAssignee = t.assignee || getTestAssignee(t);
    const assignee =
      isScenario && p.category !== "Desktop"
        ? scenarioNonDesktopOwner(t.id, p.suffix)
        : baseAssignee;
    return {
      ...t,
      id: `${t.id}-${p.suffix}`,
      title: `${t.title} — ${p.label}`,
      area: `${t.area} · ${p.category}`,
      assignee,
      sprintId: t.sprintId || ACTIVE_SPRINT_ID,
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