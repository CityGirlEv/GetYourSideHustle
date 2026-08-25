/**
 * Download Weekly Plan from Schedule Suite as PDF or Word (.doc HTML).
 */
import { jsPDF } from "jspdf";
import { ROOT_DOMAIN, SITE_NAME } from "./site-config";
import { openPdfInBrowser } from "./open-pdf";
import {
  scheduleBlockStatusLabel,
  type HustleSchedulePlan,
} from "./hustle-schedule";
import {
  PDF_CONTENT_BOTTOM,
  PDF_CONTENT_TOP,
  PDF_MARGIN as MARGIN,
  applyPdfPageBranding,
  drawPdfPageChrome,
  loadPdfLogoDataUrl,
} from "./pdf-branding";

const SITE_HOST = ROOT_DOMAIN;

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fileStem(plan: HustleSchedulePlan): string {
  const raw = `${plan.ownerLabel}-${plan.hustleLabel}-weekly-plan`
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return raw || "gysh-weekly-plan";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function buildWeeklyPlanHtml(plan: HustleSchedulePlan): string {
  const rows = plan.blocks
    .map(
      (b) => `<tr>
      <td>${escapeHtml(b.dayLabel)}</td>
      <td>${escapeHtml(b.focus)}</td>
      <td>${escapeHtml(b.dueDate)}</td>
      <td>${escapeHtml(scheduleBlockStatusLabel(b.status))}</td>
      <td>${b.hoursLogged > 0 ? escapeHtml(String(b.hoursLogged)) : "—"}</td>
    </tr>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${escapeHtml(SITE_NAME)} Weekly Plan</title>
<style>
  body { font-family: Georgia, serif; color: #2c241b; margin: 28px; }
  h1 { font-size: 22px; color: #9B2F28; margin: 0 0 6px; }
  .meta { font-size: 13px; color: #6b635a; margin: 0 0 18px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid #e2d5bc; padding: 8px 10px; text-align: left; }
  th { background: #f0e6d4; text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; }
</style></head><body>
  <h1>${escapeHtml(SITE_NAME)} — Weekly Plan</h1>
  <p class="meta">${escapeHtml(plan.ownerLabel)} · ${escapeHtml(plan.hustleLabel)} · Week of ${escapeHtml(
    plan.weekStart,
  )} · Due ${escapeHtml(plan.dueDate)} · ${escapeHtml(SITE_HOST)}</p>
  <table>
    <thead><tr><th>Day</th><th>Focus</th><th>Due</th><th>Status</th><th>Hours</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>`;
}

export async function downloadWeeklyPlanPdf(plan: HustleSchedulePlan): Promise<void> {
  const logoDataUrl = await loadPdfLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);

  let y = PDF_CONTENT_TOP;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(155, 47, 40);
  doc.text(`${SITE_NAME} — Weekly Plan`, MARGIN, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 50, 40);
  doc.text(
    `${plan.ownerLabel} · ${plan.hustleLabel} · Week of ${plan.weekStart} · Due ${plan.dueDate}`,
    MARGIN,
    y,
  );
  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const headers = ["Day", "Focus", "Due", "Status", "Hrs"];
  const colX = [MARGIN, MARGIN + 50, MARGIN + 280, MARGIN + 360, MARGIN + 440];
  headers.forEach((h, i) => doc.text(h, colX[i]!, y));
  y += 14;
  doc.setFont("helvetica", "normal");
  for (const b of plan.blocks) {
    if (y > PDF_CONTENT_BOTTOM - 16) {
      doc.addPage();
      drawPdfPageChrome(doc);
      y = PDF_CONTENT_TOP;
    }
    const focus = b.focus.length > 42 ? `${b.focus.slice(0, 40)}…` : b.focus;
    doc.text(b.dayLabel, colX[0]!, y);
    doc.text(focus, colX[1]!, y);
    doc.text(b.dueDate, colX[2]!, y);
    doc.text(scheduleBlockStatusLabel(b.status), colX[3]!, y);
    doc.text(b.hoursLogged > 0 ? String(b.hoursLogged) : "—", colX[4]!, y);
    y += 16;
  }

  applyPdfPageBranding(doc, "Weekly Plan", logoDataUrl);
  openPdfInBrowser(doc, `${fileStem(plan)}.pdf`);
}

export function downloadWeeklyPlanWord(plan: HustleSchedulePlan): void {
  const html = buildWeeklyPlanHtml(plan);
  downloadBlob(
    new Blob(["\ufeff", html], { type: "application/msword" }),
    `${fileStem(plan)}.doc`,
  );
}
