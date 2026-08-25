/**
 * Beautifully formatted Profit & Loss download (PDF / Word) for Schedule Suite.
 */
import { jsPDF } from "jspdf";
import { ROOT_DOMAIN, SITE_NAME } from "./site-config";
import { openPdfInBrowser } from "./open-pdf";
import type { HustleSchedulePlan } from "./hustle-schedule";
import {
  blueprintWindowStats,
  pnlExpenseCategoryLabel,
  summarizePnLLines,
  weeklyOutcomesForBlueprint,
} from "./hustle-schedule-pnl";
import {
  PDF_CONTENT_BOTTOM,
  PDF_CONTENT_TOP,
  PDF_MARGIN as MARGIN,
  PDF_PAGE_W,
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

function moneyText(n: number): string {
  const abs = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `($${abs})` : `$${abs}`;
}

function fileStem(plan: HustleSchedulePlan): string {
  const raw = `${plan.ownerLabel}-${plan.hustleLabel}-profit-and-loss`
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return raw || "gysh-profit-and-loss";
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

export function buildProfitAndLossHtml(plan: HustleSchedulePlan): string {
  const lines = plan.pnl?.lines ?? [];
  const totals = summarizePnLLines(lines);
  const win = blueprintWindowStats(plan.weekStart, plan.dueDate);
  const weeks = weeklyOutcomesForBlueprint(lines, plan.weekStart, plan.dueDate);
  const target = plan.blueprintGoals?.targetSalesUsd ?? 0;
  const profitClass = totals.profitUsd >= 0 ? "profit" : "loss";

  const weekRows = weeks
    .map(
      (w) => `<tr>
      <td>${escapeHtml(w.label)}</td>
      <td class="num">${escapeHtml(moneyText(w.salesUsd))}</td>
      <td class="num">${escapeHtml(moneyText(w.expensesUsd))}</td>
      <td class="num ${w.profitUsd >= 0 ? "profit" : "loss"}">${escapeHtml(moneyText(w.profitUsd))}</td>
    </tr>`,
    )
    .join("");

  const lineRows =
    lines.length === 0
      ? `<tr><td colspan="5" class="empty">No line items yet.</td></tr>`
      : lines
          .map(
            (l) => `<tr>
      <td>${escapeHtml(l.date)}</td>
      <td><span class="pill ${l.kind}">${l.kind === "sale" ? "Sale" : "Expense"}</span></td>
      <td>${escapeHtml(l.label)}</td>
      <td>${l.kind === "expense" ? escapeHtml(pnlExpenseCategoryLabel(l.category)) : "—"}</td>
      <td class="num">${escapeHtml(moneyText(l.amountUsd))}</td>
    </tr>`,
          )
          .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${escapeHtml(SITE_NAME)} Profit &amp; Loss</title>
<style>
  body { font-family: Georgia, "Palatino Linotype", serif; color: #2c241b; margin: 32px; background: #fffdf8; }
  .banner { border-bottom: 3px solid #9B2F28; padding-bottom: 14px; margin-bottom: 18px; }
  h1 { font-size: 24px; color: #9B2F28; margin: 0 0 4px; letter-spacing: 0.02em; }
  .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #947d64; margin: 0 0 6px; font-family: Helvetica, Arial, sans-serif; }
  .meta { font-size: 13px; color: #6b635a; margin: 0; }
  h2 { font-size: 15px; color: #1f4d38; margin: 22px 0 10px; font-family: Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.06em; }
  .cards { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; margin: 0 0 8px -10px; }
  .card { display: table-cell; width: 33%; vertical-align: top; background: #fff; border: 1px solid #e2d5bc; border-radius: 10px; padding: 12px 14px; }
  .card span { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #947d64; font-family: Helvetica, Arial, sans-serif; margin-bottom: 4px; }
  .card strong { font-size: 20px; }
  .card.profit strong { color: #1f4d38; }
  .card.loss strong { color: #9B2F28; }
  .window { font-size: 12px; color: #6b635a; margin: 0 0 16px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; margin-bottom: 8px; }
  th, td { border: 1px solid #e2d5bc; padding: 8px 10px; text-align: left; }
  th { background: #f0e6d4; text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; font-family: Helvetica, Arial, sans-serif; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.profit { color: #1f4d38; font-weight: 700; }
  td.loss { color: #9B2F28; font-weight: 700; }
  td.empty { color: #6b635a; font-style: italic; text-align: center; }
  .pill { display: inline-block; font-size: 10px; font-family: Helvetica, Arial, sans-serif; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; }
  .pill.sale { background: #dcefe4; color: #1f4d38; }
  .pill.expense { background: #f5ddd9; color: #9B2F28; }
  .footer { margin-top: 22px; font-size: 11px; color: #947d64; border-top: 1px solid #e2d5bc; padding-top: 10px; }
</style></head><body>
  <div class="banner">
    <p class="eyebrow">Schedule Suite · Blueprint P&amp;L</p>
    <h1>${escapeHtml(SITE_NAME)} — Profit &amp; Loss</h1>
    <p class="meta">${escapeHtml(plan.ownerLabel)} · ${escapeHtml(plan.hustleLabel)} · Week of ${escapeHtml(
      plan.weekStart,
    )} · Due ${escapeHtml(plan.dueDate)}</p>
  </div>
  <p class="window">Blueprint window: ${win.days} day${win.days === 1 ? "" : "s"} · ${win.weeks} week${
    win.weeks === 1 ? "" : "s"
  } (${escapeHtml(win.start)} → ${escapeHtml(win.end)}) · Target sales ${escapeHtml(moneyText(target))}</p>
  <div class="cards">
    <div class="card"><span>Total sales</span><strong>${escapeHtml(moneyText(totals.salesUsd))}</strong></div>
    <div class="card"><span>Total expenses</span><strong>${escapeHtml(moneyText(totals.expensesUsd))}</strong></div>
    <div class="card ${profitClass}"><span>Net profit</span><strong>${escapeHtml(moneyText(totals.profitUsd))}</strong></div>
  </div>
  <h2>Weekly outcomes</h2>
  <table>
    <thead><tr><th>Week</th><th>Sales</th><th>Expenses</th><th>Net</th></tr></thead>
    <tbody>${weekRows}</tbody>
  </table>
  <h2>Line items</h2>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
    <tbody>${lineRows}</tbody>
  </table>
  <p class="footer">${escapeHtml(SITE_NAME)} · ${escapeHtml(SITE_HOST)} · Generated for your hustle blueprint</p>
</body></html>`;
}

export async function downloadProfitAndLossPdf(plan: HustleSchedulePlan): Promise<void> {
  const lines = plan.pnl?.lines ?? [];
  const totals = summarizePnLLines(lines);
  const win = blueprintWindowStats(plan.weekStart, plan.dueDate);
  const weeks = weeklyOutcomesForBlueprint(lines, plan.weekStart, plan.dueDate);
  const logoDataUrl = await loadPdfLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const pageW = PDF_PAGE_W;
  let y = PDF_CONTENT_TOP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(148, 125, 100);
  doc.text("SCHEDULE SUITE  ·  BLUEPRINT P&L", MARGIN, y);
  y += 18;
  doc.setFontSize(18);
  doc.setTextColor(155, 47, 40);
  doc.text(`${SITE_NAME} — Profit & Loss`, MARGIN, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 50, 40);
  doc.text(
    `${plan.ownerLabel} · ${plan.hustleLabel} · Week of ${plan.weekStart} · Due ${plan.dueDate}`,
    MARGIN,
    y,
  );
  y += 16;
  doc.setFontSize(10);
  doc.setTextColor(107, 99, 90);
  doc.text(
    `Blueprint window: ${win.days} days · ${win.weeks} week(s) (${win.start} → ${win.end})`,
    MARGIN,
    y,
  );
  y += 22;

  const cardW = (pageW - MARGIN * 2 - 16) / 3;
  const cards: { label: string; value: string; color: [number, number, number] }[] = [
    { label: "TOTAL SALES", value: moneyText(totals.salesUsd), color: [31, 77, 56] },
    { label: "TOTAL EXPENSES", value: moneyText(totals.expensesUsd), color: [60, 50, 40] },
    {
      label: "NET PROFIT",
      value: moneyText(totals.profitUsd),
      color: totals.profitUsd >= 0 ? [31, 77, 56] : [155, 47, 40],
    },
  ];
  cards.forEach((c, i) => {
    const x = MARGIN + i * (cardW + 8);
    doc.setDrawColor(226, 213, 188);
    doc.setFillColor(255, 253, 248);
    doc.roundedRect(x, y, cardW, 48, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(148, 125, 100);
    doc.text(c.label, x + 10, y + 16);
    doc.setFontSize(14);
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.value, x + 10, y + 36);
  });
  y += 68;

  const ensureSpace = (need: number) => {
    if (y + need > PDF_CONTENT_BOTTOM) {
      doc.addPage();
      drawPdfPageChrome(doc);
      y = PDF_CONTENT_TOP;
    }
  };

  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 77, 56);
  doc.text("WEEKLY OUTCOMES", MARGIN, y);
  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(60, 50, 40);
  const wCols = [MARGIN, MARGIN + 200, MARGIN + 320, MARGIN + 430];
  ["Week", "Sales", "Expenses", "Net"].forEach((h, i) => doc.text(h, wCols[i]!, y));
  y += 12;
  doc.setFont("helvetica", "normal");
  for (const w of weeks) {
    ensureSpace(16);
    doc.text(w.label, wCols[0]!, y);
    doc.text(moneyText(w.salesUsd), wCols[1]!, y);
    doc.text(moneyText(w.expensesUsd), wCols[2]!, y);
    if (w.profitUsd >= 0) doc.setTextColor(31, 77, 56);
    else doc.setTextColor(155, 47, 40);
    doc.text(moneyText(w.profitUsd), wCols[3]!, y);
    doc.setTextColor(60, 50, 40);
    y += 14;
  }

  y += 12;
  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 77, 56);
  doc.text("LINE ITEMS", MARGIN, y);
  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(60, 50, 40);
  const lCols = [MARGIN, MARGIN + 70, MARGIN + 130, MARGIN + 320, MARGIN + 430];
  ["Date", "Type", "Description", "Category", "Amount"].forEach((h, i) =>
    doc.text(h, lCols[i]!, y),
  );
  y += 12;
  doc.setFont("helvetica", "normal");
  if (lines.length === 0) {
    ensureSpace(16);
    doc.setTextColor(107, 99, 90);
    doc.text("No line items yet.", MARGIN, y);
  } else {
    for (const line of lines) {
      ensureSpace(16);
      const desc =
        line.label.length > 28 ? `${line.label.slice(0, 26)}…` : line.label || "—";
      doc.setTextColor(60, 50, 40);
      doc.text(line.date, lCols[0]!, y);
      doc.text(line.kind === "sale" ? "Sale" : "Expense", lCols[1]!, y);
      doc.text(desc, lCols[2]!, y);
      doc.text(
        line.kind === "expense" ? pnlExpenseCategoryLabel(line.category) : "—",
        lCols[3]!,
        y,
      );
      doc.text(moneyText(line.amountUsd), lCols[4]!, y);
      y += 14;
    }
  }

  applyPdfPageBranding(doc, "Profit & Loss", logoDataUrl);
  openPdfInBrowser(doc, `${fileStem(plan)}.pdf`);
}

export function downloadProfitAndLossWord(plan: HustleSchedulePlan): void {
  const html = buildProfitAndLossHtml(plan);
  downloadBlob(
    new Blob(["\ufeff", html], { type: "application/msword" }),
    `${fileStem(plan)}.doc`,
  );
}
