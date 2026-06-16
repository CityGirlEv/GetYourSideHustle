import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { StaffSubNav } from "@/components/StaffSubNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  getStaffDeviceReport,
  type StaffReportDeviceGroup,
  type StaffReportTester,
  type StaffReportTestRow,
} from "@/lib/staff-report.functions";
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Monitor,
  Search,
  Smartphone,
  Tablet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sortStaffByName } from "@/lib/staff-name-sort";

function filterTestsByPlatform(
  tests: StaffReportTestRow[],
  platformFilter: string[],
): StaffReportTestRow[] {
  if (platformFilter.length === 0) return tests;
  return tests.filter((t) => {
    if (platformFilter.includes("__general__") && !t.platform) return true;
    if (t.platform && platformFilter.includes(t.platform)) return true;
    return false;
  });
}

function withPlatformFilter(
  tester: StaffReportTester,
  platformFilter: string[],
): StaffReportTester {
  if (platformFilter.length === 0) return tester;
  const assignedTests = filterTestsByPlatform(tester.assignedTests, platformFilter);
  return {
    ...tester,
    assignedTests,
    counts: {
      total: assignedTests.length,
      pass: assignedTests.filter((t) => t.status === "pass").length,
      fail: assignedTests.filter((t) => t.status === "fail" || t.status === "failed_retest").length,
      in_progress: assignedTests.filter((t) => t.status === "in_progress").length,
      not_run: assignedTests.filter((t) => t.status === "not_run").length,
    },
  };
}

function matchesQuery(tester: StaffReportTester, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    tester.fullName.toLowerCase().includes(q) ||
    tester.email.toLowerCase().includes(q) ||
    tester.firstName.toLowerCase().includes(q)
  );
}

function TesterCard({
  tester,
  device,
  platformFilter,
}: {
  tester: StaffReportTester;
  device?: string;
  platformFilter: string[];
}) {
  const view = withPlatformFilter(tester, platformFilter);
  const testingLink = {
    to: "/testing" as const,
    search: {
      owner: tester.firstName,
      ...(device ? { device } : {}),
    },
  };

  return (
    <Card className="p-3 space-y-2 bg-background/80">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{view.fullName}</div>
          <div className="text-xs text-muted-foreground">{view.email}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {view.roles.map((r) => (
              <Badge key={r} variant="outline" className="text-[10px] capitalize">
                {r}
              </Badge>
            ))}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {view.qa_devices.length === 0 ? (
              <Badge variant="outline" className="text-[10px]">
                No devices listed
              </Badge>
            ) : (
              view.qa_devices.map((d) => (
                <Badge key={d} variant="secondary" className="text-[10px] font-normal">
                  {d}
                </Badge>
              ))
            )}
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="h-8 text-xs shrink-0">
          <Link {...testingLink}>
            View tests <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px]">
        <Badge variant="outline">{view.counts.total} assigned</Badge>
        <Badge variant="outline" className="text-emerald-700 border-emerald-500/40">
          {view.counts.pass} pass
        </Badge>
        <Badge variant="outline" className="text-amber-700 border-amber-500/40">
          {view.counts.in_progress} in progress
        </Badge>
        <Badge variant="outline" className="text-destructive border-destructive/40">
          {view.counts.fail} fail
        </Badge>
        <Badge variant="outline">{view.counts.not_run} not run</Badge>
      </div>
      {view.assignedTests.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-0.5 max-h-28 overflow-y-auto border-t border-border/50 pt-2">
          {view.assignedTests.slice(0, 8).map((t) => (
            <li key={t.testId} className="flex items-center gap-2">
              <span className="font-mono text-[10px] shrink-0">{t.testId}</span>
              {t.platformLabel && (
                <Badge variant="outline" className="text-[9px] shrink-0 px-1 py-0">
                  {t.platformLabel}
                </Badge>
              )}
              <span className="truncate">{t.title}</span>
              <Badge variant="secondary" className="text-[9px] ml-auto shrink-0 capitalize">
                {t.status.replace(/_/g, " ")}
              </Badge>
            </li>
          ))}
          {view.assignedTests.length > 8 && (
            <li className="text-[10px] italic">
              +{view.assignedTests.length - 8} more via Testing Portal
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}

function DeviceSection({
  group,
  defaultOpen,
  platformFilter,
}: {
  group: StaffReportDeviceGroup;
  defaultOpen?: boolean;
  platformFilter: string[];
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  if (group.testers.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Smartphone className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold truncate">{group.device}</span>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {group.testers.length} staff
              </Badge>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 grid gap-3 md:grid-cols-2">
            {group.testers.map((t) => (
              <TesterCard
                key={t.userId}
                tester={t}
                device={group.device}
                platformFilter={platformFilter}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function AllStaffSection({
  testers,
  platformFilter,
  defaultOpen,
}: {
  testers: StaffReportTester[];
  platformFilter: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  if (testers.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold">All staff</span>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {testers.length} user{testers.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {testers.map((t) => (
              <TesterCard key={t.userId} tester={t} platformFilter={platformFilter} />
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function StaffReport() {
  const fetchReport = useServerFn(getStaffDeviceReport);
  const [loading, setLoading] = useState(true);
  const [deviceGroups, setDeviceGroups] = useState<StaffReportDeviceGroup[]>([]);
  const [unassigned, setUnassigned] = useState<StaffReportTester[]>([]);
  const [allTesters, setAllTesters] = useState<StaffReportTester[]>([]);
  const [allDevices, setAllDevices] = useState<string[]>([]);
  const [platformOptions, setPlatformOptions] = useState<{ value: string; label: string }[]>([]);
  const [deviceFilter, setDeviceFilter] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const report = await fetchReport();
        if (cancelled) return;
        setDeviceGroups(report.deviceGroups);
        setUnassigned(report.unassignedDeviceTesters);
        setAllTesters(report.allTesters);
        setAllDevices(report.allDevices);
        setPlatformOptions(report.platformOptions);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchReport]);

  const userOptions = useMemo(
    () =>
      sortStaffByName(allTesters, (t) => t.fullName.trim() || t.email || t.userId).map((t) => ({
        value: t.userId,
        label: t.fullName.trim() ? `${t.fullName} (${t.firstName})` : t.email || t.userId,
      })),
    [allTesters],
  );

  const scopedTesters = useMemo(() => {
    let list = allTesters;
    if (userFilter.length > 0) {
      const allowed = new Set(userFilter);
      list = list.filter((t) => allowed.has(t.userId));
    }
    if (query.trim()) {
      list = list.filter((t) => matchesQuery(t, query));
    }
    return list;
  }, [allTesters, userFilter, query]);

  const visibleGroups = useMemo(() => {
    let groups = deviceGroups
      .map((g) => ({
        ...g,
        testers: g.testers.filter((t) => scopedTesters.some((s) => s.userId === t.userId)),
      }))
      .filter((g) => g.testers.length > 0);

    if (deviceFilter.length > 0) {
      const allowed = new Set(deviceFilter.map((d) => d.toLowerCase()));
      groups = groups.filter((g) => allowed.has(g.device.toLowerCase()));
    }
    return groups;
  }, [deviceGroups, scopedTesters, deviceFilter]);

  const filteredUnassigned = useMemo(() => {
    if (deviceFilter.length > 0) return [];
    return unassigned.filter((t) => scopedTesters.some((s) => s.userId === t.userId));
  }, [unassigned, scopedTesters, deviceFilter]);

  const selectedUsers = useMemo(() => {
    if (userFilter.length === 0) return [];
    return scopedTesters;
  }, [userFilter.length, scopedTesters]);

  const showAllStaffFlat = userFilter.length === 0 && deviceFilter.length === 0;

  const hasContent =
    selectedUsers.length > 0 ||
    visibleGroups.length > 0 ||
    filteredUnassigned.length > 0 ||
    (showAllStaffFlat && scopedTesters.length > 0);

  return (
    <AppShell
      title="Staff device report"
      subtitle="All staff, grouped by registered hardware — filter by user, test platform (Computer / Phone / iPad), or device"
    >
      <StaffSubNav active="report" className="mb-4" />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 h-9"
            placeholder="Search staff…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <MultiSelect
          placeholder="Staff"
          triggerClassName="w-[220px]"
          options={userOptions}
          value={userFilter}
          onChange={setUserFilter}
          allLabel="All staff"
          searchable
          searchPlaceholder="Search users…"
        />
        <MultiSelect
          placeholder="Test platform"
          triggerClassName="w-[200px]"
          options={platformOptions}
          value={platformFilter}
          onChange={setPlatformFilter}
          allLabel="All platforms"
        />
        <MultiSelect
          placeholder="Hardware device"
          triggerClassName="w-[200px]"
          options={allDevices.map((d) => ({ value: d, label: d }))}
          value={deviceFilter}
          onChange={setDeviceFilter}
          allLabel="All devices"
          searchable
          searchPlaceholder="Search devices…"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {platformFilter.length > 0 && (
        <p className="text-xs text-muted-foreground mb-3 flex flex-wrap items-center gap-2">
          <span>Test counts filtered by platform:</span>
          {platformFilter.map((p) => {
            const label = platformOptions.find((o) => o.value === p)?.label ?? p;
            const Icon =
              p === "COMP" ? Monitor : p === "IPAD" ? Tablet : p === "PHONE" ? Smartphone : null;
            return (
              <Badge key={p} variant="secondary" className="text-[10px] font-normal gap-1">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
              </Badge>
            );
          })}
        </p>
      )}

      {loading ? (
        <Card className="glass p-8 text-center text-muted-foreground text-sm">
          Loading device report…
        </Card>
      ) : (
        <div className="space-y-3">
          {selectedUsers.length > 0 && (
            <Card className="p-4 space-y-3 border-primary/30 bg-primary/5">
              <h3 className="font-semibold text-sm">Selected staff ({selectedUsers.length})</h3>
              <p className="text-xs text-muted-foreground">
                Includes users with or without registered devices.
              </p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {selectedUsers.map((t) => (
                  <TesterCard key={t.userId} tester={t} platformFilter={platformFilter} />
                ))}
              </div>
            </Card>
          )}

          {showAllStaffFlat && (
            <AllStaffSection
              testers={scopedTesters}
              platformFilter={platformFilter}
              defaultOpen={false}
            />
          )}

          {visibleGroups.map((g, i) => (
            <DeviceSection
              key={g.device}
              group={g}
              defaultOpen={userFilter.length > 0 ? true : i === 0}
              platformFilter={platformFilter}
            />
          ))}

          {filteredUnassigned.length > 0 && userFilter.length === 0 && (
            <Card className="p-4 space-y-3 border-amber-500/30 bg-amber-500/5">
              <h3 className="font-semibold text-sm">Staff without registered devices</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredUnassigned.map((t) => (
                  <TesterCard key={t.userId} tester={t} platformFilter={platformFilter} />
                ))}
              </div>
            </Card>
          )}

          {!hasContent && (
            <Card className="glass p-8 text-center text-muted-foreground text-sm">
              No staff match the current filters.
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
