/** Client helpers for Daily Progress Report export audit log (D1 snapshots). */

import { api } from "./api";
import type { DailyProgressReport } from "./daily-progress-report";
import type { ProgressExportFormat } from "./daily-progress-export";

export type DailyProgressAuditEntry = {
  id: string;
  createdAt: string;
  createdByEmail: string;
  createdByName: string;
  format: ProgressExportFormat | "email";
  periodFrom: string;
  periodTo: string;
  periodLabel: string;
  usersFilter: string;
  reportUrl: string;
};

export async function fetchDailyProgressAudit(): Promise<DailyProgressAuditEntry[]> {
  const data = await api<{ reports: DailyProgressAuditEntry[] }>("daily-progress-reports");
  return data.reports ?? [];
}

export async function logDailyProgressExport(input: {
  format: ProgressExportFormat | "email";
  report: DailyProgressReport;
  usersFilter: string;
  snapshotHtml: string;
}): Promise<DailyProgressAuditEntry> {
  const data = await api<{ report: DailyProgressAuditEntry }>("daily-progress-reports", {
    method: "POST",
    body: {
      format: input.format,
      periodFrom: input.report.from,
      periodTo: input.report.to,
      periodLabel: input.report.label,
      usersFilter: input.usersFilter,
      snapshotJson: input.report,
      snapshotHtml: input.snapshotHtml,
    },
  });
  return data.report;
}
