// ============================================================================
// PLATFORM VARIANTS
// ----------------------------------------------------------------------------
// Tests that an anonymous / QA / Auditor user would exercise on multiple
// devices are fanned out into platform sub-tests. We support 3 platforms:
// Computer (desktop/laptop), Phone, and iPad. The Computer variant keeps the
// source test's owner; Phone + iPad variants are split deterministically
// across Catria, Unassigned, and Evelyn so the work can be reassigned as
// needed. Areas that are admin- or back-office-only (Admin Notifications,
// Testing portal, Alpha planning, etc.) pass through unchanged.
// ============================================================================
import type { TestCase } from "@/lib/test-plan";
import { ACTIVE_SPRINT_ID, getTestAssignee, TEST_CASES } from "@/lib/test-plan";
import {
  buildAgentRegistrationSteps,
  buildQaRegistrationSteps,
  type RegistrationPlatform,
} from "@/lib/registration-test-steps";

export type PlatformCategory = "Mobile" | "Tablet" | "Desktop";

export interface TestPlatform {
  /** id suffix appended to the source test id, e.g. "PHONE" → "SCEN-001-PHONE" */
  suffix: string;
  /** Human label shown after the title, e.g. "Phone" */
  label: string;
  category: PlatformCategory;
}

export const TEST_PLATFORMS: TestPlatform[] = [
  { suffix: "COMP", label: "Computer", category: "Desktop" },
  { suffix: "PHONE", label: "Phone", category: "Mobile" },
  { suffix: "IPAD", label: "iPad", category: "Tablet" },
];

/** Legacy fallback owner when a source test has no owner and cannot be derived. */
export const PLATFORM_VARIANT_OWNER = "Catria";

/**
 * Area prefixes that get fanned out across Computer / Phone / iPad. These
 * are the surfaces an anonymous, QA, or Auditor user would actually touch
 * on mobile and tablet (sign-in, build a scenario via manual or voice
 * intake, read CMS-compliant marketing pages, etc.).
 */
const MULTI_PLATFORM_AREA_PREFIXES = [
  "Scenario",
  "Voice", // Voice · Inputs, Voice · Wizard
  "Intake", // Intake · Manual, Intake · Meds
  "Auth", // login / signup / reset
  "Registration", // Registration · Email
  "Landing",
  "Expert opt-in",
  "Exports",
  "CMS Compliance",
];

function isMultiPlatformArea(area: string): boolean {
  return MULTI_PLATFORM_AREA_PREFIXES.some(
    (p) => area === p || area.startsWith(`${p} `) || area.startsWith(`${p}·`),
  );
}

const NON_DESKTOP_OWNERS = ["Catria", "Unassigned", "Evelyn"] as const;
type NonDesktopOwner = (typeof NON_DESKTOP_OWNERS)[number];

/**
 * For multi-platform tests on non-Desktop platforms (Phone + iPad) the owner
 * is forced to rotate across Catria, Unassigned, and Evelyn, regardless of
 * who owns the source (Computer) test. Computer variants keep the source
 * owner. Split is deterministic from the source id + platform suffix so the
 * same test always lands on the same owner across renders.
 */
function nonDesktopOwner(sourceId: string, suffix: string): NonDesktopOwner {
  const n = parseInt(sourceId.match(/(\d+)/)?.[1] ?? "0", 10);
  const platformIdx = ["PHONE", "IPAD"].indexOf(suffix);
  // Hash the source id alpha portion in too so different areas don't all
  // land on the same owner for the same numeric suffix.
  const alphaSeed = (sourceId.match(/[A-Z]/g) ?? []).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return NON_DESKTOP_OWNERS[(n + platformIdx + alphaSeed) % NON_DESKTOP_OWNERS.length];
}

function registrationStepsForPlatform(sourceId: string, platformLabel: string): string[] | null {
  const platform = platformLabel as RegistrationPlatform;
  if (sourceId === "AUTH-001") return buildQaRegistrationSteps(platform);
  if (sourceId === "AUTH-005") return buildAgentRegistrationSteps(platform);
  return null;
}

/**
 * Fan out a multi-platform TestCase into one variant per supported platform.
 * Tests for admin / back-office areas are returned as-is. Each variant gets
 * a deterministic id (`<sourceId>-<suffix>`), the platform name appended to
 * the title and area, and a per-platform owner (Computer keeps the source
 * owner; Phone/iPad rotate Catria / Unassigned / Evelyn).
 */
export function expandTestWithPlatforms(t: TestCase): TestCase[] {
  if (!isMultiPlatformArea(t.area)) return [t];
  return TEST_PLATFORMS.map((p) => {
    const baseAssignee = t.assignee || getTestAssignee(t);
    const assignee = p.category !== "Desktop" ? nonDesktopOwner(t.id, p.suffix) : baseAssignee;
    // Unassigned variants must fall into the Backlog (handled by
    // getTestSprintId when sprintId is undefined). Only pin a sprint when
    // the source already had one or the variant has a real owner.
    const sprintId = t.sprintId
      ? t.sprintId
      : assignee === "Unassigned"
        ? undefined
        : ACTIVE_SPRINT_ID;
    const platformSteps = registrationStepsForPlatform(t.id, p.label);
    return {
      ...t,
      id: `${t.id}-${p.suffix}`,
      title: `${t.title} — ${p.label}`,
      area: `${t.area} · ${p.category}`,
      steps: platformSteps ?? t.steps,
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

/** Split a platform variant id (e.g. AUTH-001-PHONE) into source + suffix. */
export function parsePlatformVariantId(id: string): {
  sourceId: string;
  platformSuffix: string | null;
} {
  for (const p of TEST_PLATFORMS) {
    const tail = `-${p.suffix}`;
    if (id.endsWith(tail) && id.length > tail.length) {
      return { sourceId: id.slice(0, -tail.length), platformSuffix: p.suffix };
    }
  }
  return { sourceId: id, platformSuffix: null };
}

/** Base test id for shared content (steps, expected, …) — strips platform suffixes. */
export function resolveTestContentId(testId: string): string {
  return parsePlatformVariantId(testId).sourceId;
}

/** User-created tests stored in custom_tests (not test_results overrides). */
export function isCustomTestContentId(testId: string): boolean {
  return /^CUS-\d+$/.test(resolveTestContentId(testId));
}

/**
 * localStorage keys that should receive a test_results row on hydrate.
 * Base ids for multi-platform tests fan out to COMP/PHONE/IPAD variants.
 */
export function localStorageKeysForTestResultId(testId: string): string[] {
  const { sourceId, platformSuffix } = parsePlatformVariantId(testId);
  if (platformSuffix) return [testId];

  const baseCase = TEST_CASES.find((t) => t.id === sourceId);
  if (baseCase && isMultiPlatformArea(baseCase.area)) {
    return TEST_PLATFORMS.map((p) => `${sourceId}-${p.suffix}`);
  }
  return [testId];
}
