import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calculator,
  Check,
  Clock,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BUDGET_BILLING_LABELS,
  budgetCategories,
  formatBudgetUsd,
  monthlyEquivalent,
  PROJECT_BUDGET_CATALOG,
  PROJECT_DEV_SUMMARY,
  type BudgetCatalogItem,
} from "@/lib/project-budget-data";
import {
  approveBudgetLine,
  approveDevLabor,
  devLaborTotal,
  loadProjectBudget,
  resetProjectBudget,
  saveProjectBudget,
  type BudgetLineRecord,
  type DevLaborRecord,
  type ProjectBudgetSnapshot,
} from "@/lib/project-budget-storage";
import { cn } from "@/lib/utils";

type DraftLines = Record<string, { amount: string; notes: string }>;
type DevDraft = { hours: string; hourlyRate: string; notes: string };

function lineIsDirty(
  item: BudgetCatalogItem,
  saved: BudgetLineRecord,
  draft: DraftLines[string] | undefined,
): boolean {
  if (!draft) return false;
  const amount = parseAmount(draft.amount);
  if (amount === null) return true;
  return amount !== saved.amount || draft.notes !== saved.notes;
}

function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function StatusBadge({ approved, dirty }: { approved: boolean; dirty: boolean }) {
  if (dirty) {
    return (
      <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200">
        Updated — approve
      </Badge>
    );
  }
  if (approved) {
    return (
      <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200">
        Approved
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-sky-500/50 bg-sky-500/10 text-sky-800 dark:text-sky-200">
      Estimate
    </Badge>
  );
}

function BudgetLineRow({
  item,
  saved,
  draft,
  onDraftChange,
  onApprove,
}: {
  item: BudgetCatalogItem;
  saved: BudgetLineRecord;
  draft: DraftLines[string];
  onDraftChange: (patch: Partial<DraftLines[string]>) => void;
  onApprove: () => void;
}) {
  const dirty = lineIsDirty(item, saved, draft);
  const parsed = parseAmount(draft.amount);
  const canApprove = dirty && parsed !== null;

  return (
    <tr className="border-b border-border/60 last:border-0 align-top">
      <td className="py-3 pr-3 min-w-[10rem]">
        <div className="font-medium text-sm leading-snug">{item.name}</div>
        <div className="text-[11px] text-muted-foreground">{item.vendor}</div>
        {item.optional ? (
          <Badge variant="secondary" className="mt-1 text-[10px]">
            Optional
          </Badge>
        ) : null}
      </td>
      <td className="py-3 pr-3 text-xs text-muted-foreground leading-snug max-w-md hidden md:table-cell">
        {item.description}
        {item.link ? (
          <>
            {" "}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Pricing
            </a>
          </>
        ) : null}
      </td>
      <td className="py-3 pr-3 whitespace-nowrap text-xs text-muted-foreground">
        {BUDGET_BILLING_LABELS[item.billingPeriod]}
      </td>
      <td className="py-3 pr-3 w-[8.5rem]">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
            $
          </span>
          <Input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={draft.amount}
            onChange={(e) => onDraftChange({ amount: e.target.value })}
            className="pl-6 h-9 text-sm tabular-nums"
            aria-label={`${item.name} amount`}
          />
        </div>
      </td>
      <td className="py-3 pr-3 w-[6.5rem]">
        <StatusBadge approved={saved.approved} dirty={dirty} />
      </td>
      <td className="py-3 w-[6.5rem]">
        <Button
          type="button"
          size="sm"
          variant={canApprove ? "default" : "outline"}
          className={cn("w-full", canApprove && "grad-indigo")}
          disabled={!canApprove}
          onClick={onApprove}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Approve
        </Button>
      </td>
    </tr>
  );
}

function snapshotToDrafts(snapshot: ProjectBudgetSnapshot): {
  lines: DraftLines;
  dev: DevDraft;
} {
  const lines: DraftLines = {};
  for (const item of PROJECT_BUDGET_CATALOG) {
    const saved = snapshot.lines[item.id]!;
    lines[item.id] = {
      amount: String(saved.amount),
      notes: saved.notes,
    };
  }
  return {
    lines,
    dev: {
      hours: String(snapshot.devLabor.hours),
      hourlyRate: String(snapshot.devLabor.hourlyRate),
      notes: snapshot.devLabor.notes,
    },
  };
}

export function ProjectBudgetPage() {
  const [snapshot, setSnapshot] = useState<ProjectBudgetSnapshot>(() => createLoadedSnapshot());
  const [drafts, setDrafts] = useState(() => snapshotToDrafts(createLoadedSnapshot()));

  function createLoadedSnapshot() {
    return typeof window === "undefined" ? loadProjectBudget() : loadProjectBudget();
  }

  useEffect(() => {
    const loaded = loadProjectBudget();
    setSnapshot(loaded);
    setDrafts(snapshotToDrafts(loaded));
  }, []);

  const categories = useMemo(() => budgetCategories(PROJECT_BUDGET_CATALOG), []);

  const totals = useMemo(() => {
    let monthlyRecurring = 0;
    let annualOneTime = 0;
    let approvedMonthly = 0;
    let unapprovedCount = 0;

    for (const item of PROJECT_BUDGET_CATALOG) {
      const saved = snapshot.lines[item.id]!;
      const monthly = monthlyEquivalent(saved.amount, item.billingPeriod);
      if (item.billingPeriod === "one_time") {
        annualOneTime += saved.amount;
      } else {
        monthlyRecurring += monthly;
      }
      if (saved.approved) approvedMonthly += monthly;
      else unapprovedCount += 1;
    }

    const labor = devLaborTotal(snapshot.devLabor);
    if (!snapshot.devLabor.approved) unapprovedCount += 1;

    return {
      monthlyRecurring,
      annualOneTime,
      approvedMonthly,
      labor,
      grandOneTime: annualOneTime + labor,
      unapprovedCount,
    };
  }, [snapshot]);

  const persist = (next: ProjectBudgetSnapshot) => {
    setSnapshot(next);
    saveProjectBudget(next);
  };

  const handleApproveLine = (item: BudgetCatalogItem) => {
    const draft = drafts.lines[item.id]!;
    const amount = parseAmount(draft.amount);
    if (amount === null) {
      toast.error("Enter a valid amount before approving.");
      return;
    }
    const next = approveBudgetLine(snapshot, item.id, amount, draft.notes);
    persist(next);
    toast.success(`${item.name} approved at ${formatBudgetUsd(amount)}`);
  };

  const devDirty =
    parseAmount(drafts.dev.hours) !== snapshot.devLabor.hours ||
    parseAmount(drafts.dev.hourlyRate) !== snapshot.devLabor.hourlyRate ||
    drafts.dev.notes !== snapshot.devLabor.notes;

  const devHours = parseAmount(drafts.dev.hours);
  const devRate = parseAmount(drafts.dev.hourlyRate);
  const canApproveDev = devDirty && devHours !== null && devRate !== null;

  const handleApproveDev = () => {
    if (devHours === null || devRate === null) {
      toast.error("Enter valid hours and hourly rate.");
      return;
    }
    const next = approveDevLabor(snapshot, devHours, devRate, drafts.dev.notes);
    persist(next);
    toast.success(`Development labor approved at ${formatBudgetUsd(devHours * devRate)}`);
  };

  const handleReset = () => {
    if (!window.confirm("Reset all budget amounts to default estimates? Approved values will be cleared.")) {
      return;
    }
    const next = resetProjectBudget();
    setSnapshot(next);
    setDrafts(snapshotToDrafts(next));
    toast.message("Budget reset to default estimates.");
  };

  return (
    <AdminAccessGate>
      <AppShell
        title="Project budget"
        subtitle="Part B Optimizer — tools, services, and development costs"
      >
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Admin
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset estimates
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Monthly run rate
              </p>
              <p className="font-display text-2xl font-bold mt-1 tabular-nums">
                {formatBudgetUsd(totals.monthlyRecurring)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Recurring + usage (excludes labor)</p>
            </Card>
            <Card className="glass p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Approved monthly
              </p>
              <p className="font-display text-2xl font-bold mt-1 tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatBudgetUsd(totals.approvedMonthly)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Services you have signed off</p>
            </Card>
            <Card className="glass p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Development (one-time)
              </p>
              <p className="font-display text-2xl font-bold mt-1 tabular-nums">
                {formatBudgetUsd(totals.labor)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {snapshot.devLabor.hours}h × {formatBudgetUsd(snapshot.devLabor.hourlyRate)}/hr
              </p>
            </Card>
            <Card className="glass p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Pending approval
              </p>
              <p className="font-display text-2xl font-bold mt-1 tabular-nums">
                {totals.unapprovedCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Line items still marked estimate</p>
            </Card>
          </div>

          {categories.map((category) => {
            const items = PROJECT_BUDGET_CATALOG.filter((item) => item.category === category);
            return (
              <Card key={category} className="glass overflow-hidden">
                <div className="border-b border-border/60 px-4 py-3 sm:px-5">
                  <h2 className="font-display text-base font-bold">{category}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left px-4 sm:px-5">
                    <thead>
                      <tr className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/60">
                        <th className="py-2 pr-3">Service</th>
                        <th className="py-2 pr-3 hidden md:table-cell">Notes</th>
                        <th className="py-2 pr-3">Billing</th>
                        <th className="py-2 pr-3">Amount (USD)</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <BudgetLineRow
                          key={item.id}
                          item={item}
                          saved={snapshot.lines[item.id]!}
                          draft={drafts.lines[item.id]!}
                          onDraftChange={(patch) =>
                            setDrafts((prev) => ({
                              ...prev,
                              lines: {
                                ...prev.lines,
                                [item.id]: { ...prev.lines[item.id]!, ...patch },
                              },
                            }))
                          }
                          onApprove={() => handleApproveLine(item)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}

          <Card className="glass p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 space-y-1">
                <h2 className="font-display text-lg font-bold">Development time</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {PROJECT_DEV_SUMMARY.summary}
                </p>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Project period</dt>
                <dd className="font-semibold mt-0.5">
                  {PROJECT_DEV_SUMMARY.periodStart} → {PROJECT_DEV_SUMMARY.periodEnd}
                </dd>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Calendar span</dt>
                <dd className="font-semibold mt-0.5">~{PROJECT_DEV_SUMMARY.calendarWeeks} weeks</dd>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Git commits</dt>
                <dd className="font-semibold mt-0.5">{PROJECT_DEV_SUMMARY.gitCommits} on main branch</dd>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Your commits</dt>
                <dd className="font-semibold mt-0.5">{PROJECT_DEV_SUMMARY.contributorCommits} (CityGirlEv)</dd>
              </div>
            </dl>

            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="dev-hours">Estimated hours</Label>
                <Input
                  id="dev-hours"
                  type="number"
                  min={0}
                  step="0.5"
                  value={drafts.dev.hours}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, dev: { ...prev.dev, hours: e.target.value } }))}
                  className="tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dev-rate">Hourly rate (USD)</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    $
                  </span>
                  <Input
                    id="dev-rate"
                    type="number"
                    min={0}
                    step="1"
                    value={drafts.dev.hourlyRate}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, dev: { ...prev.dev, hourlyRate: e.target.value } }))
                    }
                    className="pl-6 tabular-nums"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground">Labor total</p>
                <p className="font-display text-xl font-bold tabular-nums">
                  {devHours !== null && devRate !== null
                    ? formatBudgetUsd(devHours * devRate)
                    : "—"}
                </p>
              </div>
              <div className="space-y-2">
                <StatusBadge approved={snapshot.devLabor.approved} dirty={devDirty} />
                <Button
                  type="button"
                  size="sm"
                  className={cn("w-full sm:w-auto", canApproveDev && "grad-indigo")}
                  variant={canApproveDev ? "default" : "outline"}
                  disabled={!canApproveDev}
                  onClick={handleApproveDev}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Approve labor
                </Button>
              </div>
            </div>
          </Card>

          <Card className="glass p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-bold">Budget summary</h2>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Monthly services (all line items)</dt>
                <dd className="font-semibold tabular-nums">{formatBudgetUsd(totals.monthlyRecurring)}/mo</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Annual / one-time tools</dt>
                <dd className="font-semibold tabular-nums">{formatBudgetUsd(totals.annualOneTime)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Development labor (one-time)</dt>
                <dd className="font-semibold tabular-nums">{formatBudgetUsd(totals.labor)}</dd>
              </div>
              <div className="flex justify-between gap-4 pt-1">
                <dt className="font-medium">First-year estimate (12× monthly + one-time + labor)</dt>
                <dd className="font-display text-lg font-bold tabular-nums">
                  {formatBudgetUsd(totals.monthlyRecurring * 12 + totals.grandOneTime)}
                </dd>
              </div>
            </dl>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" />
              Amounts save in this browser when you approve a line. Edit any field, then click Approve to lock it in.
            </p>
          </Card>
        </div>
      </AppShell>
    </AdminAccessGate>
  );
}
