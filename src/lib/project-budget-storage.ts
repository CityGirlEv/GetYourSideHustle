import {
  DEV_LABOR_LINE_ID,
  PROJECT_BUDGET_CATALOG,
  PROJECT_DEV_SUMMARY,
  type BudgetCatalogItem,
} from "@/lib/project-budget-data";

const STORAGE_KEY = "pbo-project-budget-v1";

export type BudgetLineRecord = {
  amount: number;
  approved: boolean;
  approvedAt: string | null;
  notes: string;
};

export type DevLaborRecord = {
  hours: number;
  hourlyRate: number;
  approved: boolean;
  approvedAt: string | null;
  notes: string;
};

export type ProjectBudgetSnapshot = {
  lines: Record<string, BudgetLineRecord>;
  devLabor: DevLaborRecord;
  updatedAt: string;
};

function defaultLineRecord(item: BudgetCatalogItem): BudgetLineRecord {
  return {
    amount: item.defaultAmount,
    approved: false,
    approvedAt: null,
    notes: "",
  };
}

export function createDefaultBudgetSnapshot(): ProjectBudgetSnapshot {
  const lines: Record<string, BudgetLineRecord> = {};
  for (const item of PROJECT_BUDGET_CATALOG) {
    lines[item.id] = defaultLineRecord(item);
  }
  return {
    lines,
    devLabor: {
      hours: PROJECT_DEV_SUMMARY.defaultHours,
      hourlyRate: PROJECT_DEV_SUMMARY.defaultHourlyRate,
      approved: false,
      approvedAt: null,
      notes: "",
    },
    updatedAt: new Date().toISOString(),
  };
}

function mergeSnapshot(parsed: Partial<ProjectBudgetSnapshot>): ProjectBudgetSnapshot {
  const defaults = createDefaultBudgetSnapshot();
  const lines = { ...defaults.lines };
  if (parsed.lines) {
    for (const item of PROJECT_BUDGET_CATALOG) {
      const saved = parsed.lines[item.id];
      if (saved) {
        lines[item.id] = {
          ...defaults.lines[item.id]!,
          ...saved,
          amount: Number.isFinite(saved.amount) ? saved.amount : item.defaultAmount,
        };
      }
    }
  }
  const devLabor = {
    ...defaults.devLabor,
    ...parsed.devLabor,
    hours: Number.isFinite(parsed.devLabor?.hours)
      ? parsed.devLabor!.hours
      : defaults.devLabor.hours,
    hourlyRate: Number.isFinite(parsed.devLabor?.hourlyRate)
      ? parsed.devLabor!.hourlyRate
      : defaults.devLabor.hourlyRate,
  };
  return {
    lines,
    devLabor,
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
}

export function loadProjectBudget(): ProjectBudgetSnapshot {
  if (typeof window === "undefined") return createDefaultBudgetSnapshot();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultBudgetSnapshot();
    return mergeSnapshot(JSON.parse(raw) as Partial<ProjectBudgetSnapshot>);
  } catch {
    return createDefaultBudgetSnapshot();
  }
}

export function saveProjectBudget(snapshot: ProjectBudgetSnapshot): void {
  if (typeof window === "undefined") return;
  const next: ProjectBudgetSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function approveBudgetLine(
  snapshot: ProjectBudgetSnapshot,
  lineId: string,
  amount: number,
  notes?: string,
): ProjectBudgetSnapshot {
  const existing = snapshot.lines[lineId] ?? {
    amount,
    approved: false,
    approvedAt: null,
    notes: "",
  };
  return {
    ...snapshot,
    lines: {
      ...snapshot.lines,
      [lineId]: {
        ...existing,
        amount,
        approved: true,
        approvedAt: new Date().toISOString(),
        notes: notes ?? existing.notes,
      },
    },
  };
}

export function approveDevLabor(
  snapshot: ProjectBudgetSnapshot,
  hours: number,
  hourlyRate: number,
  notes?: string,
): ProjectBudgetSnapshot {
  return {
    ...snapshot,
    devLabor: {
      ...snapshot.devLabor,
      hours,
      hourlyRate,
      approved: true,
      approvedAt: new Date().toISOString(),
      notes: notes ?? snapshot.devLabor.notes,
    },
  };
}

export function resetProjectBudget(): ProjectBudgetSnapshot {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return createDefaultBudgetSnapshot();
}

export function devLaborTotal(labor: DevLaborRecord): number {
  return labor.hours * labor.hourlyRate;
}

export function isDevLaborLine(lineId: string): boolean {
  return lineId === DEV_LABOR_LINE_ID;
}
