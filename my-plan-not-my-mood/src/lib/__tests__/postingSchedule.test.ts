import { describe, expect, it } from 'vitest';
import { overlayContentFactoryStatuses, PHASE_1_CONTENT_FACTORY } from '../contentFactory';
import {
  POSTING_SCHEDULE_PATH,
  POSTING_SCHEDULE_TITLE,
  buildPostingSchedule,
  buildPostingScheduleDocumentHtml,
  dayPostCountLabel,
  postingScheduleSummary,
  toPostingScheduleRow,
} from '../postingSchedule';

describe('postingSchedule', () => {
  it('lays out every Content Factory row by date, platform, time, and what to post', () => {
    const days = buildPostingSchedule(PHASE_1_CONTENT_FACTORY);
    const summary = postingScheduleSummary(days);
    expect(POSTING_SCHEDULE_PATH).toBe('/admin/calendar');
    expect(POSTING_SCHEDULE_TITLE).toMatch(/Posting Schedule/i);
    expect(days.length).toBeGreaterThan(5);
    expect(summary.postCount).toBe(PHASE_1_CONTENT_FACTORY.filter((item) => item.kind === 'post').length);
    expect(summary.itemCount).toBe(PHASE_1_CONTENT_FACTORY.length);
    expect(summary.maxPostsInADay).toBeGreaterThanOrEqual(1);
    expect(days.every((day) => day.dateIso <= days[days.length - 1]!.dateIso)).toBe(true);
    const first = days[0]!;
    expect(first.dateLabel).toMatch(/Sep/);
    expect(first.rows[0]?.platform).toBeTruthy();
    expect(first.rows[0]?.postTime).toBeTruthy();
    expect(first.rows[0]?.whatToPost.length).toBeGreaterThan(0);
    expect(dayPostCountLabel(first)).toMatch(/post/i);
  });

  it('builds one printable document with time, platform, and caption columns', () => {
    const days = buildPostingSchedule(PHASE_1_CONTENT_FACTORY);
    const html = buildPostingScheduleDocumentHtml(days);
    expect(html).toContain(POSTING_SCHEDULE_TITLE);
    expect(html).toContain('Time');
    expect(html).toContain('Platform');
    expect(html).toContain('Caption / notes');
    expect(html).toContain('nonnegotiation.com/gear');
    expect(html).toMatch(/Facebook|TikTok|YouTube/);
    const welcome = PHASE_1_CONTENT_FACTORY.find((item) => item.id === 'cf-s0-welcome-facebook')!;
    const row = toPostingScheduleRow(welcome);
    expect(row.platform).toBe('Facebook');
    expect(row.status).toBe('not_started');
    expect(row.statusLabel).toBe('Not Started');
    expect(row.format).toMatch(/image|Video/i);
    expect(html).toContain(welcome.title);
    expect(html).toContain('Status');
    expect(html).toContain('Not Started');
  });

  it('carries Content Factory status onto the posting schedule', () => {
    const overlay = overlayContentFactoryStatuses(PHASE_1_CONTENT_FACTORY, {
      'cf-s0-welcome-facebook': 'done',
      'cf-s0-welcome-tiktok': 'in_progress',
    });
    const days = buildPostingSchedule(overlay);
    const facebook = days.flatMap((day) => day.rows).find((row) => row.id === 'cf-s0-welcome-facebook');
    const tiktok = days.flatMap((day) => day.rows).find((row) => row.id === 'cf-s0-welcome-tiktok');
    expect(facebook).toMatchObject({ status: 'done', statusLabel: 'Done' });
    expect(tiktok).toMatchObject({ status: 'in_progress', statusLabel: 'In Progress' });
  });
});
