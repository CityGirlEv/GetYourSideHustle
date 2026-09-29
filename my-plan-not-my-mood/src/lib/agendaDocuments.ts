import type { AgendaItem, SprintMeeting } from './sprintAgenda';
import { agendaProgress, totalAgendaMinutes } from './sprintAgenda';
import {
  EMAIL_FOOTER_COPY,
  EMAIL_POWERED_BY,
  EMAIL_SITE_LABEL,
  EMAIL_SITE_URL,
  EMAIL_TAGLINE,
} from './email/emailChrome';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function multilineHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '<span style="color:#3F3832;">—</span>';
  return escapeHtml(trimmed).replace(/\n/g, '<br/>');
}

export interface AgendaDocumentModel {
  meeting: SprintMeeting;
  items: AgendaItem[];
}

export interface AgendaDocumentChrome {
  logoUrl?: string;
  siteUrl?: string;
}

export function agendaDocumentLogoUrl(origin = EMAIL_SITE_URL): string {
  return `${origin.replace(/\/$/, '')}/images/official_logo_seal.png`;
}

function resolveChrome(chrome?: AgendaDocumentChrome): { logoUrl: string; siteUrl: string } {
  const siteUrl = (chrome?.siteUrl || EMAIL_SITE_URL).replace(/\/$/, '');
  return {
    siteUrl,
    logoUrl: chrome?.logoUrl || agendaDocumentLogoUrl(siteUrl),
  };
}

function agendaHeaderHtml(logoUrl: string, siteUrl: string): string {
  return `
    <table data-agenda-chrome="header" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border:3px solid #1F1917;border-radius:16px;margin-bottom:20px;border-collapse:separate;">
      <tr>
        <td style="width:118px;padding:16px 10px 16px 18px;vertical-align:middle;">
          <img src="${escapeHtml(logoUrl)}" alt="MY PLAN, NOT MY MOOD Logo Seal" height="96" style="height:96px;width:auto;display:block;border:0;" />
        </td>
        <td style="padding:16px 20px 16px 6px;vertical-align:middle;">
          <div style="font-size:22px;font-weight:900;letter-spacing:-0.4px;text-transform:uppercase;color:#1F1917;">
            MY PLAN, <span style="color:#C2410C;font-style:italic;">NOT MY MOOD</span>
          </div>
          <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#3F3832;margin-top:4px;">Focus · Discipline · Freedom</div>
          <div style="display:inline-block;margin-top:8px;background:#FFEDD5;color:#C2410C;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;padding:4px 10px;border-radius:999px;">Interactive Agenda</div>
          <div style="margin-top:8px;">
            <a href="${escapeHtml(siteUrl)}" style="color:#C2410C;font-weight:800;font-size:12px;text-decoration:none;">${EMAIL_SITE_LABEL}</a>
          </div>
        </td>
      </tr>
    </table>`;
}

function agendaFooterHtml(siteUrl: string): string {
  return `
    <table data-agenda-chrome="footer" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;border-top:2px solid #1F1917;border-collapse:collapse;">
      <tr>
        <td style="padding:16px 8px 0;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#C2410C;">${EMAIL_TAGLINE}</p>
          <p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:#3F3832;">${EMAIL_FOOTER_COPY}</p>
          <p style="margin:0 0 6px;font-size:12px;">
            <a href="${escapeHtml(siteUrl)}" style="color:#C2410C;font-weight:800;text-decoration:none;">${EMAIL_SITE_LABEL}</a>
          </p>
          <p style="margin:0;font-size:11px;color:#3F3832;">${EMAIL_POWERED_BY}</p>
        </td>
      </tr>
    </table>`;
}

function agendaSummaryHtml(meeting: SprintMeeting, items: AgendaItem[]): string {
  const progress = agendaProgress(items);
  const minutes = totalAgendaMinutes(items);
  return `
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#fff;border:2px solid #1F1917;border-radius:16px;margin-bottom:18px;border-collapse:separate;">
      <tr>
        <td style="padding:16px 20px;">
          <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#C2410C;">Meeting Packet</div>
          <h1 style="margin:6px 0 8px;font-size:24px;color:#1F1917;">${escapeHtml(meeting.title)}</h1>
          <p style="margin:0;font-size:13px;font-weight:700;color:#1F1917;">${escapeHtml(meeting.cadenceLabel)} · ${escapeHtml(meeting.whenLabel)}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#3F3832;">${progress.done}/${progress.total} topics done · ${minutes} minutes total</p>
        </td>
      </tr>
    </table>`;
}

export function agendaDocumentTitle(meeting: SprintMeeting): string {
  return `${meeting.title} — ${meeting.whenLabel}`;
}

export function buildAgendaDocumentHtml(model: AgendaDocumentModel, chrome?: AgendaDocumentChrome): string {
  const { meeting, items } = model;
  const { logoUrl, siteUrl } = resolveChrome(chrome);
  const rows = items
    .map(
      (item, index) => `
      <tr style="background:${index % 2 === 0 ? '#ffffff' : '#FAF8F5'};">
        <td style="border:1px solid #E5DFD3;padding:10px;width:28px;font-weight:900;text-align:center;">${index + 1}</td>
        <td style="border:1px solid #E5DFD3;padding:10px;">
          <div style="font-weight:900;text-transform:uppercase;">${escapeHtml(item.label)}</div>
          <div style="font-size:11px;color:${item.done ? '#3F5A3A' : '#C2410C'};margin-top:4px;font-weight:800;">${item.done ? 'Done' : 'Open'} · ${item.minutes} min</div>
        </td>
        <td style="border:1px solid #E5DFD3;padding:10px;width:70px;text-align:center;font-weight:900;">${item.minutes}</td>
        <td style="border:1px solid #E5DFD3;padding:10px;vertical-align:top;">${multilineHtml(item.notes)}</td>
        <td style="border:1px solid #E5DFD3;padding:10px;vertical-align:top;">${multilineHtml(item.actionItems)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(agendaDocumentTitle(meeting))}</title>
    <style>
      @page { margin: 0.6in; }
      body { font-family:'Segoe UI',Arial,sans-serif;color:#1F1917;background:#FAF8F5;padding:24px;margin:0;line-height:1.45; }
      .agenda-table { width:100%;border-collapse:collapse;background:#fff; }
      .agenda-table th { padding:10px;text-align:left;background:#1F1917;color:#fff;font-size:11px;letter-spacing:0.06em;text-transform:uppercase; }
      @media print {
        body { background:#fff;padding:0; }
      }
    </style>
  </head>
  <body>
    ${agendaHeaderHtml(logoUrl, siteUrl)}
    ${agendaSummaryHtml(meeting, items)}
    <table class="agenda-table">
      <thead>
        <tr>
          <th style="padding:10px;text-align:left;">#</th>
          <th style="padding:10px;text-align:left;">Topic</th>
          <th style="padding:10px;text-align:center;">Min</th>
          <th style="padding:10px;text-align:left;">Meeting Notes</th>
          <th style="padding:10px;text-align:left;">Action Items</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${agendaFooterHtml(siteUrl)}
  </body>
</html>`;
}

export function buildAgendaExcelHtml(model: AgendaDocumentModel, chrome?: AgendaDocumentChrome): string {
  const { meeting, items } = model;
  const { logoUrl, siteUrl } = resolveChrome(chrome);
  const progress = agendaProgress(items);
  const minutes = totalAgendaMinutes(items);
  const rows = items
    .map(
      (item, index) => `<tr style="background:${index % 2 === 0 ? '#ffffff' : '#FAF8F5'};">
        <td style="border:1px solid #E5DFD3;padding:8px 10px;font-weight:900;text-align:center;">${index + 1}</td>
        <td style="border:1px solid #E5DFD3;padding:8px 10px;font-weight:800;">${escapeHtml(item.label)}</td>
        <td style="border:1px solid #E5DFD3;padding:8px 10px;text-align:center;font-weight:900;">${item.minutes}</td>
        <td style="border:1px solid #E5DFD3;padding:8px 10px;color:${item.done ? '#3F5A3A' : '#C2410C'};font-weight:800;">${item.done ? 'Done' : 'Open'}</td>
        <td style="border:1px solid #E5DFD3;padding:8px 10px;">${escapeHtml(item.notes || '—')}</td>
        <td style="border:1px solid #E5DFD3;padding:8px 10px;">${escapeHtml(item.actionItems || '—')}</td>
      </tr>`,
    )
    .join('');

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(agendaDocumentTitle(meeting))}</title>
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Agenda</x:Name>
            <x:WorksheetOptions>
              <x:FitToPage/>
              <x:Print>
                <x:ValidPrinterInfo/>
                <x:FitWidth>1</x:FitWidth>
              </x:Print>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family:'Segoe UI',Arial,sans-serif;color:#1F1917;background:#FAF8F5;padding:18px;margin:0; }
      table.agenda { border-collapse:collapse;width:100%;background:#fff; }
    </style>
  </head>
  <body>
    ${agendaHeaderHtml(logoUrl, siteUrl)}
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#fff;border:2px solid #1F1917;border-radius:16px;margin-bottom:16px;border-collapse:separate;">
      <tr>
        <td style="padding:14px 18px;">
          <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#C2410C;">Excel Agenda</div>
          <h2 style="margin:6px 0 6px;font-size:22px;">${escapeHtml(meeting.title)}</h2>
          <p style="margin:0;font-size:13px;font-weight:700;">${escapeHtml(meeting.cadenceLabel)} · ${escapeHtml(meeting.whenLabel)}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#3F3832;">${progress.done}/${progress.total} topics done · ${minutes} minutes total</p>
        </td>
      </tr>
    </table>
    <table class="agenda" border="1">
      <tr>
        <th style="background:#1F1917;color:#ffffff;padding:10px;text-align:left;">#</th>
        <th style="background:#1F1917;color:#ffffff;padding:10px;text-align:left;">Topic</th>
        <th style="background:#1F1917;color:#ffffff;padding:10px;text-align:center;">Minutes</th>
        <th style="background:#1F1917;color:#ffffff;padding:10px;text-align:left;">Status</th>
        <th style="background:#1F1917;color:#ffffff;padding:10px;text-align:left;">Meeting Notes</th>
        <th style="background:#1F1917;color:#ffffff;padding:10px;text-align:left;">Action Items</th>
      </tr>
      ${rows}
    </table>
    ${agendaFooterHtml(siteUrl)}
  </body>
</html>`;
}

export function buildAgendaCsv(model: AgendaDocumentModel): string {
  const header = ['#', 'Topic', 'Minutes', 'Status', 'Meeting Notes', 'Action Items'];
  const lines = [
    header.join(','),
    ...model.items.map((item, index) =>
      [index + 1, item.label, item.minutes, item.done ? 'Done' : 'Open', item.notes, item.actionItems]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ];
  return lines.join('\n');
}

export function agendaFileSlug(meeting: SprintMeeting): string {
  return meeting.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
}

export function hasAgendaDocumentColumns(html: string): boolean {
  return /Meeting Notes/i.test(html) && /Action Items/i.test(html) && /Minutes|Min/i.test(html);
}

export function hasAgendaDocumentChrome(html: string): boolean {
  return (
    /official_logo_seal\.png/i.test(html) &&
    /data-agenda-chrome=["']header["']/.test(html) &&
    /data-agenda-chrome=["']footer["']/.test(html) &&
    /MY PLAN/i.test(html) &&
    /NOT MY MOOD/i.test(html) &&
    /Focus · Discipline · Freedom/.test(html) &&
    html.includes(EMAIL_TAGLINE) &&
    html.includes(EMAIL_FOOTER_COPY) &&
    html.includes(EMAIL_SITE_LABEL) &&
    html.includes(EMAIL_POWERED_BY)
  );
}
