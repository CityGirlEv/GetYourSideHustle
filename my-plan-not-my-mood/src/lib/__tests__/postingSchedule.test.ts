import { describe, expect, it } from 'vitest';
import { PHASE_1_CONTENT_FACTORY } from '../contentFactory';
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
    expect(row.format).toMatch(/image|Video/i);
    expect(html).toContain(welcome.title);
  });
});
