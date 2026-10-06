import {
  CF_CHANNEL_LABELS,
  CF_KIND_LABELS,
  cfPostIsImageOnly,
  type ContentFactoryItem,
} from './contentFactory';
import { ASSIGNEE_LABELS, formatWorkDueDate, TASK_STATUS_LABELS, type TaskStatus } from './workBoard';

export const POSTING_SCHEDULE_PATH = '/admin/calendar';
export const POSTING_SCHEDULE_TITLE = 'Angela’s Posting Schedule';
export const POSTING_SCHEDULE_FILE = 'angela-posting-schedule.doc';

export interface PostingScheduleRow {
  id: string;
  dateIso: string;
  weekday: string;
  postTime: string;
  channel: ContentFactoryItem['channel'];
  platform: string;
  kind: ContentFactoryItem['kind'];
  kindLabel: string;
  title: string;
  whatToPost: string;
  format: string;
  status: TaskStatus;
  statusLabel: string;
  assignee: string;
  sprint: string;
}

export interface PostingScheduleDay {
  dateIso: string;
  weekday: string;
  dateLabel: string;
  sprint: string;
  postCount: number;
  prepCount: number;
  rows: PostingScheduleRow[];
}

export interface PostingScheduleSummary {
  dayCount: number;
  postCount: number;
  itemCount: number;
  maxPostsInADay: number;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function firstLine(value: string, max = 180): string {
  const line = value.replace(/\s+/g, ' ').trim();
  if (line.length <= max) return line;
  return `${line.slice(0, max - 1).trimEnd()}…`;
}

export function postingScheduleFormat(item: ContentFactoryItem): string {
  if (item.kind !== 'post') return CF_KIND_LABELS[item.kind];
  return cfPostIsImageOnly(item) ? 'Image only' : 'Video + image';
}

export function postingScheduleWhatToPost(item: ContentFactoryItem): string {
  if (item.kind === 'post') return firstLine(item.copy || item.title);
  return firstLine([item.title, item.assetHint].filter(Boolean).join(' — '));
}

export function toPostingScheduleRow(item: ContentFactoryItem): PostingScheduleRow {
  return {
    id: item.id,
    dateIso: item.dateIso,
    weekday: item.weekday,
    postTime: item.postTime,
    channel: item.channel,
    platform: CF_CHANNEL_LABELS[item.channel],
    kind: item.kind,
    kindLabel: CF_KIND_LABELS[item.kind],
    title: item.title,
    whatToPost: postingScheduleWhatToPost(item),
    format: postingScheduleFormat(item),
    status: item.status,
    statusLabel: TASK_STATUS_LABELS[item.status],
    assignee: ASSIGNEE_LABELS[item.assignee] ?? item.assignee,
    sprint: item.sprint,
  };
}

export function buildPostingSchedule(items: ContentFactoryItem[]): PostingScheduleDay[] {
  const byDate = new Map<string, ContentFactoryItem[]>();
  for (const item of items) {
    const list = byDate.get(item.dateIso) ?? [];
    list.push(item);
    byDate.set(item.dateIso, list);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateIso, dayItems]) => {
      const rows = [...dayItems]
        .sort(
          (a, b) =>
            a.postTime.localeCompare(b.postTime) ||
            a.channel.localeCompare(b.channel) ||
            a.title.localeCompare(b.title),
        )
        .map(toPostingScheduleRow);
      const first = rows[0]!;
      return {
        dateIso,
        weekday: first.weekday,
        dateLabel: `${first.weekday}, ${formatWorkDueDate(dateIso)}`,
        sprint: first.sprint,
        postCount: dayItems.filter((item) => item.kind === 'post').length,
        prepCount: dayItems.filter((item) => item.kind !== 'post').length,
        rows,
      };
    });
}

export function postingScheduleSummary(
  days: PostingScheduleDay[],
): PostingScheduleSummary {
  const postCount = days.reduce((sum, day) => sum + day.postCount, 0);
  const itemCount = days.reduce((sum, day) => sum + day.rows.length, 0);
  return {
    dayCount: days.length,
    postCount,
    itemCount,
    maxPostsInADay: days.reduce((max, day) => Math.max(max, day.postCount), 0),
  };
}

export function dayPostCountLabel(day: PostingScheduleDay): string {
  const posts = day.postCount === 1 ? '1 post' : `${day.postCount} posts`;
  if (day.prepCount === 0) return posts;
  const prep = day.prepCount === 1 ? '1 prep' : `${day.prepCount} prep`;
  return `${posts} · ${prep}`;
}

export function buildPostingScheduleDocumentHtml(
  days: PostingScheduleDay[] = buildPostingSchedule([]),
): string {
  const summary = postingScheduleSummary(days);
  const body = days
    .map((day) => {
      const rows = day.rows
        .map(
          (row) => `<tr>
            <td>${escapeHtml(row.postTime)}</td>
            <td>${escapeHtml(row.platform)}</td>
            <td>${escapeHtml(row.kindLabel)}</td>
            <td>${escapeHtml(row.title)}</td>
            <td>${escapeHtml(row.whatToPost)}</td>
            <td>${escapeHtml(row.statusLabel)}</td>
            <td>${escapeHtml(row.format)}</td>
            <td>${escapeHtml(row.assignee)}</td>
          </tr>`,
        )
        .join('');
      return `<section>
        <h2>${escapeHtml(day.dateLabel)} — ${escapeHtml(day.sprint)}</h2>
        <p class="count">${escapeHtml(dayPostCountLabel(day))}</p>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Platform</th>
              <th>Kind</th>
              <th>What</th>
              <th>Caption / notes</th>
              <th>Status</th>
              <th>Format</th>
              <th>Who</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(POSTING_SCHEDULE_TITLE)}</title>
  <style>
    body { font-family: Georgia, serif; color: #1F1917; margin: 24px; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    .lede { color: #3F3832; margin: 0 0 20px; }
    h2 { font-size: 18px; margin: 28px 0 4px; }
    .count { margin: 0 0 10px; font-size: 13px; color: #9A3412; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #E8DFD2; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #FFF7ED; text-transform: uppercase; font-size: 10px; letter-spacing: 0.04em; }
    @media print { body { margin: 12px; } section { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(POSTING_SCHEDULE_TITLE)}</h1>
  <p class="lede">One document for Phase 1. ${summary.dayCount} days, ${summary.postCount} posts, ${summary.itemCount} rows. Status is the same Not Started / In Progress / Done / Blocked list as the Task List and Content Factory. Most posts go up at 7:00 PM CT. Shop link in every public post: https://nonnegotiation.com/gear.</p>
  ${body}
</body>
</html>`;
}
