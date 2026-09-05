import { describe, expect, it } from 'vitest';
import {
  agendaDocumentLogoUrl,
  agendaDocumentTitle,
  agendaFileSlug,
  buildAgendaCsv,
  buildAgendaDocumentHtml,
  buildAgendaExcelHtml,
  hasAgendaDocumentChrome,
  hasAgendaDocumentColumns,
} from '../agendaDocuments';
import { EMAIL_FOOTER_COPY, EMAIL_TAGLINE } from '../email/emailChrome';
import { defaultAgendaItems, workingAgendaMeeting } from '../sprintAgenda';

describe('agendaDocuments', () => {
  const meeting = workingAgendaMeeting(new Date(2026, 7, 26));
  const items = defaultAgendaItems('working').map((item, index) =>
    index === 0 ? { ...item, notes: 'Kickoff note', actionItems: 'Send recap', minutes: 12 } : item,
  );
  const model = { meeting, items };

  it('builds Word/PDF HTML with notes, actions, and time', () => {
    const html = buildAgendaDocumentHtml(model);
    expect(hasAgendaDocumentColumns(html)).toBe(true);
    expect(html).toContain('Kickoff note');
    expect(html).toContain('Send recap');
    expect(html).toContain('12');
    expect(agendaDocumentTitle(meeting)).toContain('Working Agenda');
    expect(agendaFileSlug(meeting)).toMatch(/Working-Agenda/i);
  });

  it('puts logo header and footer chrome on PDF and Excel documents', () => {
    const pdf = buildAgendaDocumentHtml(model);
    const excel = buildAgendaExcelHtml(model);
    expect(hasAgendaDocumentChrome(pdf)).toBe(true);
    expect(hasAgendaDocumentChrome(excel)).toBe(true);
    expect(pdf).toContain(agendaDocumentLogoUrl());
    expect(excel).toContain(agendaDocumentLogoUrl());
    expect(pdf).toContain(EMAIL_TAGLINE);
    expect(excel).toContain(EMAIL_FOOTER_COPY);
  });

  it('builds Excel HTML and CSV rows for each topic', () => {
    const excel = buildAgendaExcelHtml(model);
    const csv = buildAgendaCsv(model);
    expect(hasAgendaDocumentColumns(excel)).toBe(true);
    expect(csv.split('\n')).toHaveLength(items.length + 1);
    expect(csv).toContain('Kickoff note');
    expect(csv).toContain('Send recap');
  });
});
