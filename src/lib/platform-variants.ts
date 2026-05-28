// ============================================================================
// PLATFORM VARIANTS
// ----------------------------------------------------------------------------
// Every test scenario is fanned out into one test per supported platform so QA
// covers iPhone, Android, iPad, macOS and Windows. Variants are derived from
// the source TestCase at read time — adding a new TEST_CASE (or custom test)
// automatically generates the 5 platform sub-tests, all assigned to Catria in
// the current sprint.
// ============================================================================
import type { TestCase } from "@/lib/test-plan";
import { ACTIVE_SPRINT_ID } from "@/lib/test-plan";

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

/** Default owner for every auto-generated platform variant. */
export const PLATFORM_VARIANT_OWNER = "Catria";

/**
 * Fan out a single TestCase into one variant per supported platform. Each
 * variant gets a deterministic id (`<sourceId>-<suffix>`), the platform name
 * appended to the title and area, and is assigned to Catria in the active
 * sprint. The original (un-suffixed) test is NOT returned — callers should
 * always use the fanned-out list.
 */
export function expandTestWithPlatforms(t: TestCase): TestCase[] {
  return TEST_PLATFORMS.map((p) => ({
    ...t,
    id: `${t.id}-${p.suffix}`,
    title: `${t.title} — ${p.label}`,
    area: `${t.area} · ${p.category}`,
    assignee: PLATFORM_VARIANT_OWNER,
    sprintId: t.sprintId || ACTIVE_SPRINT_ID,
    notes: t.notes
      ? `${t.notes}\n\nPlatform: ${p.label} (from ${t.id})`
      : `Platform: ${p.label} (from ${t.id})`,
  }));
}

/** Convenience: expand a whole list of tests. */
export function expandAllWithPlatforms(tests: TestCase[]): TestCase[] {
  const out: TestCase[] = [];
  for (const t of tests) out.push(...expandTestWithPlatforms(t));
  return out;
}