import React, { useEffect, useMemo, useState } from 'react';
import { Download, Eye, Printer } from 'lucide-react';
import type { AdminStudioTab } from '../lib/adminStudio';
import {
  CONTENT_FACTORY_EDITS_KEY,
  CONTENT_FACTORY_STATUS_KEY,
  PHASE_1_CONTENT_FACTORY,
  overlayContentFactoryEdits,
  overlayContentFactoryStatuses,
  parseContentFactoryEdits,
  parseContentFactoryStatuses,
  setContentFactoryStatus,
  type ContentFactoryItemEdit,
} from '../lib/contentFactory';
import {
  POSTING_SCHEDULE_FILE,
  POSTING_SCHEDULE_TITLE,
  buildPostingSchedule,
  buildPostingScheduleDocumentHtml,
  dayPostCountLabel,
  postingScheduleSummary,
} from '../lib/postingSchedule';
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_STATUS_TONES, type TaskStatus } from '../lib/workBoard';
import { ContentFactoryShell } from './ContentFactoryShell';

function loadStatuses(): Record<string, TaskStatus> {
  try {
    const raw = localStorage.getItem(CONTENT_FACTORY_STATUS_KEY);
    return raw ? parseContentFactoryStatuses(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function loadEdits(): Record<string, ContentFactoryItemEdit> {
  try {
    const raw = localStorage.getItem(CONTENT_FACTORY_EDITS_KEY);
    return raw ? parseContentFactoryEdits(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function downloadDocument(html: string) {
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = POSTING_SCHEDULE_FILE;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openDocument(html: string, print: boolean) {
  const win = window.open('', '_blank', 'width=1280,height=920');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  if (print) win.setTimeout(() => win.print(), 400);
}

export const PostingSchedulePage: React.FC<{
  onOpenTab: (tab: AdminStudioTab) => void;
}> = ({ onOpenTab }) => {
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>(() => loadStatuses());
  const [edits, setEdits] = useState<Record<string, ContentFactoryItemEdit>>(() => loadEdits());

  useEffect(() => {
    setStatuses(loadStatuses());
    setEdits(loadEdits());
  }, []);

  useEffect(() => {
    localStorage.setItem(CONTENT_FACTORY_STATUS_KEY, JSON.stringify(statuses));
  }, [statuses]);

  const items = useMemo(
    () =>
      overlayContentFactoryEdits(
        overlayContentFactoryStatuses(PHASE_1_CONTENT_FACTORY, statuses),
        edits,
      ),
    [statuses, edits],
  );
  const days = useMemo(() => buildPostingSchedule(items), [items]);
  const summary = useMemo(() => postingScheduleSummary(days), [days]);
  const documentHtml = useMemo(() => buildPostingScheduleDocumentHtml(days), [days]);

  return (
    <ContentFactoryShell active="calendar" onOpenTab={onOpenTab}>
      <div
        className="bg-[#FFFCF7] border-2 border-[#FDBA74] rounded-2xl p-4 sm:p-6 space-y-4 shadow-[0_8px_24px_rgba(251,146,60,0.12)]"
        data-testid="posting-schedule-page"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-serif font-semibold text-[#9A3412]">{POSTING_SCHEDULE_TITLE}</h3>
            <p className="text-sm text-[#9A3412] font-medium mt-1 max-w-3xl">
              Same Content Factory calendar: date, platform, time, copy, and status. Change status here or on a Factory card — it is the same Not Started / In Progress / Done / Blocked list as the Task List.
              {` ${summary.dayCount} days · ${summary.postCount} posts · up to ${summary.maxPostsInADay} posts in a day.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openDocument(documentHtml, false)}
              className="min-h-[44px] px-3.5 rounded-xl border-2 border-[#FDBA74] bg-white text-[#9A3412] text-[11px] font-black uppercase tracking-wide cursor-pointer inline-flex items-center gap-1.5"
              data-testid="posting-schedule-view"
            >
              <Eye className="w-3.5 h-3.5" /> View document
            </button>
            <button
              type="button"
              onClick={() => openDocument(documentHtml, true)}
              className="min-h-[44px] px-3.5 rounded-xl border-2 border-[#FDBA74] bg-white text-[#9A3412] text-[11px] font-black uppercase tracking-wide cursor-pointer inline-flex items-center gap-1.5"
              data-testid="posting-schedule-print"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={() => downloadDocument(documentHtml)}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-[11px] font-black uppercase tracking-wide cursor-pointer inline-flex items-center gap-1.5 border-2 border-[#FDBA74]"
              data-testid="posting-schedule-download"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>

        <div className="overflow-x-auto space-y-5" data-testid="posting-schedule-document">
          {days.map((day) => (
            <section
              key={day.dateIso}
              className="rounded-2xl border border-[#FED7AA] bg-white overflow-hidden"
              data-testid={`posting-schedule-day-${day.dateIso}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-[#FFEDD5] border-b border-[#FDBA74]">
                <h4 className="text-sm font-black uppercase text-[#9A3412]">
                  {day.dateLabel}
                  <span className="ml-2 font-mono font-bold normal-case tracking-normal">{day.sprint}</span>
                </h4>
                <span className="text-[10px] font-black uppercase text-[#C2410C]">{dayPostCountLabel(day)}</span>
              </div>
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-wider text-[#C2410C] bg-[#FFF7ED]">
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Platform</th>
                    <th className="px-3 py-2">Kind</th>
                    <th className="px-3 py-2">What to post</th>
                    <th className="px-3 py-2">Caption / notes</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Format</th>
                    <th className="px-3 py-2">Who</th>
                  </tr>
                </thead>
                <tbody>
                  {day.rows.map((row) => (
                    <tr key={row.id} className="border-t border-[#FED7AA] align-top" data-testid={`posting-schedule-row-${row.id}`}>
                      <td className="px-3 py-2 font-mono font-bold text-[#1F1917] whitespace-nowrap">{row.postTime}</td>
                      <td className="px-3 py-2 font-semibold text-[#1F1917]">{row.platform}</td>
                      <td className="px-3 py-2 text-[#3F3832]">{row.kindLabel}</td>
                      <td className="px-3 py-2 font-semibold text-[#1F1917]">{row.title}</td>
                      <td className="px-3 py-2 text-[#3F3832]">{row.whatToPost}</td>
                      <td className="px-3 py-2">
                        <select
                          value={row.status}
                          aria-label={`${row.title} status`}
                          data-testid={`posting-schedule-status-${row.id}`}
                          onChange={(event) =>
                            setStatuses((prev) =>
                              setContentFactoryStatus(prev, row.id, event.target.value as TaskStatus),
                            )
                          }
                          className={`min-h-[44px] rounded-xl border-2 px-2 text-[10px] font-black uppercase cursor-pointer ${TASK_STATUS_TONES[row.status]}`}
                        >
                          {TASK_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {TASK_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-[#3F3832] whitespace-nowrap">{row.format}</td>
                      <td className="px-3 py-2 text-[#3F3832]">{row.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </ContentFactoryShell>
  );
};
