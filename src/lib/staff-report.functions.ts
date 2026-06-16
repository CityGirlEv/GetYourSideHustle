import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TEST_CASES, getTestAssignee, type TestStatus } from "@/lib/test-plan";
import { AUTOMATED_TEST_CASES } from "@/lib/automated-tests";
import {
  expandAllWithPlatforms,
  parsePlatformVariantId,
  TEST_PLATFORMS,
} from "@/lib/platform-variants";
import { buildDeviceFilterOptions, normalizeDeviceLabel } from "@/lib/qa-device-match";
import { compareStaffByDisplayName } from "@/lib/staff-name-sort";

async function verifyAdmin(userId: string) {
  const { data: callerRoles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (!(callerRoles ?? []).some((r) => r.role === "admin")) {
    throw new Error("Admin access required");
  }
}

function assigneeFirstName(value: string): string {
  return (value.trim().split(/\s+/)[0] || "").trim();
}

function assigneeMatches(label: string | null | undefined, firstName: string): boolean {
  if (!label?.trim() || !firstName.trim()) return false;
  const a = (label.trim().split(/\s+/)[0] || label).trim().toLowerCase();
  return a === firstName.trim().toLowerCase();
}

function testTitle(testId: string): string {
  const { sourceId, platformSuffix } = parsePlatformVariantId(testId);
  const base =
    TEST_CASES.find((t) => t.id === sourceId) ??
    AUTOMATED_TEST_CASES.find((t) => t.id === sourceId);
  if (!base) return testId;
  if (platformSuffix) {
    const p = TEST_PLATFORMS.find((x) => x.suffix === platformSuffix);
    return `${base.title} — ${p?.label ?? platformSuffix}`;
  }
  return base.title;
}

function platformMeta(testId: string): { platform: string | null; platformLabel: string | null } {
  const { platformSuffix } = parsePlatformVariantId(testId);
  if (!platformSuffix) return { platform: null, platformLabel: null };
  const p = TEST_PLATFORMS.find((x) => x.suffix === platformSuffix);
  return { platform: platformSuffix, platformLabel: p?.label ?? platformSuffix };
}

function countStatuses(tests: StaffReportTestRow[]) {
  return {
    total: tests.length,
    pass: tests.filter((t) => t.status === "pass").length,
    fail: tests.filter((t) => t.status === "fail" || t.status === "failed_retest").length,
    in_progress: tests.filter((t) => t.status === "in_progress").length,
    not_run: tests.filter((t) => t.status === "not_run").length,
  };
}

export type StaffReportTestRow = {
  testId: string;
  title: string;
  status: TestStatus;
  /** COMP | PHONE | IPAD when this is a platform variant; null for single-platform tests. */
  platform: string | null;
  platformLabel: string | null;
};

export type StaffReportTester = {
  userId: string;
  firstName: string;
  fullName: string;
  email: string;
  roles: string[];
  qa_devices: string[];
  assignedTests: StaffReportTestRow[];
  counts: {
    total: number;
    pass: number;
    fail: number;
    in_progress: number;
    not_run: number;
  };
};

export type StaffReportDeviceGroup = {
  device: string;
  testers: StaffReportTester[];
};

export type StaffReportPlatformOption = {
  value: string;
  label: string;
};

export type StaffDeviceReport = {
  deviceGroups: StaffReportDeviceGroup[];
  unassignedDeviceTesters: StaffReportTester[];
  allDevices: string[];
  allTesters: StaffReportTester[];
  platformOptions: StaffReportPlatformOption[];
};

export const getStaffDeviceReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffDeviceReport> => {
    await verifyAdmin(context.userId);

    const [{ data: profiles }, authList, { data: testRows }, { data: roleRows }] =
      await Promise.all([
        supabaseAdmin.from("profiles").select("id, full_name, qa_devices"),
        supabaseAdmin.auth.admin.listUsers(),
        supabaseAdmin.from("test_results").select("test_id, status, assignee"),
        supabaseAdmin.from("user_roles").select("user_id, role"),
      ]);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [
        p.id,
        { full_name: p.full_name ?? "", qa_devices: (p.qa_devices ?? []) as string[] },
      ]),
    );

    const rolesMap = new Map<string, string[]>();
    for (const r of roleRows ?? []) {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    }

    const statusMap = new Map<string, TestStatus>();
    const assigneeMap = new Map<string, string>();
    for (const row of testRows ?? []) {
      if (row.status) statusMap.set(row.test_id, row.status as TestStatus);
      if (row.assignee?.trim()) assigneeMap.set(row.test_id, row.assignee.trim());
    }

    const catalogCases = [...expandAllWithPlatforms(TEST_CASES), ...AUTOMATED_TEST_CASES];

    const testers: StaffReportTester[] = [];
    for (const u of authList.data?.users ?? []) {
      const bannedUntil = (u as { banned_until?: string | null }).banned_until;
      if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) continue;

      const profile = profileMap.get(u.id);
      const full = (
        profile?.full_name ||
        (u.user_metadata?.full_name as string) ||
        u.email ||
        ""
      ).trim();
      const firstName = assigneeFirstName(full);
      if (!firstName) continue;

      const assignedTests: StaffReportTestRow[] = [];
      const seen = new Set<string>();

      for (const t of catalogCases) {
        const assignee = assigneeMap.get(t.id) ?? String(getTestAssignee(t, statusMap.get(t.id)));
        if (!assigneeMatches(assignee, firstName)) continue;
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        const { platform, platformLabel } = platformMeta(t.id);
        assignedTests.push({
          testId: t.id,
          title: testTitle(t.id),
          status: statusMap.get(t.id) ?? "not_run",
          platform,
          platformLabel,
        });
      }

      assignedTests.sort((a, b) => a.testId.localeCompare(b.testId));

      testers.push({
        userId: u.id,
        firstName,
        fullName: full,
        email: u.email ?? "",
        roles: rolesMap.get(u.id) ?? [],
        qa_devices: profile?.qa_devices ?? [],
        assignedTests,
        counts: countStatuses(assignedTests),
      });
    }

    testers.sort((a, b) => compareStaffByDisplayName(a.fullName, b.fullName));

    const allDevices = buildDeviceFilterOptions(testers.flatMap((t) => t.qa_devices));
    const deviceGroups: StaffReportDeviceGroup[] = allDevices.map((device) => ({
      device,
      testers: testers.filter((t) =>
        t.qa_devices.some((d) => normalizeDeviceLabel(d) === normalizeDeviceLabel(device)),
      ),
    }));

    const unassignedDeviceTesters = testers.filter((t) => t.qa_devices.length === 0);

    const platformOptions: StaffReportPlatformOption[] = [
      ...TEST_PLATFORMS.map((p) => ({ value: p.suffix, label: p.label })),
      { value: "__general__", label: "General (non-platform)" },
    ];

    return {
      deviceGroups,
      unassignedDeviceTesters,
      allDevices,
      allTesters: testers,
      platformOptions,
    };
  });
