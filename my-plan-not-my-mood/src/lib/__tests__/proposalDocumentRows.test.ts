import { describe, expect, it } from 'vitest';
import {
  buildClickableTocHtml,
  buildDeliverableListHtml,
  buildRoadmapDocumentSection,
  buildConfidentialityNoticeHtml,
  buildProjectOverviewHtml,
  confidentialityNoticeText,
  hasAngelaNieceOrigin,
  hasDuplicatedDeliverableNumbers,
  hasInternalFooterNote,
  hasMuntieEvCredentials,
  hasProjectOverview,
  sprintScheduleLabel,
  sprintShortLabel,
  hasIpRoadmapByPhaseToc,
  tocHasPhaseButton,
} from '../proposalDocumentRows';

describe('proposalDocumentRows', () => {
  it('prints sprint dates with duration and never invents a second number prefix', () => {
    expect(sprintScheduleLabel({ dates: 'Date TBD (1-Week Cadence)', duration: '1 Week' })).toBe(
      'Date TBD (1-Week Cadence) · 1 Week',
    );
    expect(sprintShortLabel('sprint0')).toBe('Sprint 0');
    expect(sprintScheduleLabel({})).toBe('Date TBD');
  });

  it('builds a single checklist without duplicated numbers', () => {
    const html = buildDeliverableListHtml(['Kick-off', 'Demo']);
    expect(html).toContain('<li>');
    expect(hasDuplicatedDeliverableNumbers(html)).toBe(false);
    expect(hasDuplicatedDeliverableNumbers('<ul><li><strong>1.</strong> Kick-off</li></ul>')).toBe(true);
  });

  it('formats Word/PDF like the IP Roadmap phase boxes and delivery cards', () => {
    const html = buildRoadmapDocumentSection([
      {
        id: 'sprint0',
        shortLabel: 'Sprint 0',
        name: 'Infrastructure',
        dates: 'Date TBD (1-Week Cadence)',
        duration: '1 Week',
        summary: 'Foundation',
        description: 'Domain and auth',
        deliverableHtml: buildDeliverableListHtml(['Kick-off']),
        phase: 'phase1_build',
      },
      {
        id: 'socials-ad-infra',
        shortLabel: 'Phase item',
        name: 'Socials',
        dates: 'Post-Core Launch',
        duration: 'Phase 2 Add-On',
        summary: '',
        description: 'Channels',
        deliverableHtml: '',
        phase: 'phase2_addons',
      },
    ]);
    expect(html).toContain('Agile Sprint Roadmap');
    expect(html).toContain('id="doc-sprint0"');
    expect(html).toContain('id="doc-phase-1"');
    expect(html).toContain('Phase 1 — Gear Launch');
    expect(html).toContain('Phase 2 — Memberships');
    expect(html).toContain('Phase 3 — Open for Future Discussion');
    expect(html).toContain('sprint-card');
    expect(html).toContain('Date TBD (1-Week Cadence)');
    expect(hasDuplicatedDeliverableNumbers(html)).toBe(false);
  });

  it('builds a clickable TOC that jumps to phase, sub-phase, sprint, and technologies', () => {
    const html = buildClickableTocHtml([
      {
        id: 'sprint0',
        shortLabel: 'Sprint 0',
        name: 'Infrastructure',
        dates: 'Date TBD',
        duration: '1 Week',
        summary: '',
        description: '',
        deliverableHtml: '',
        phase: 'phase1_build',
      },
    ]);
    expect(html).toContain('href="#doc-phase-1"');
    expect(html).toContain('href="#doc-sub-core"');
    expect(html).toContain('href="#doc-sprint0"');
    expect(hasIpRoadmapByPhaseToc(html)).toBe(true);
    expect(tocHasPhaseButton(html)).toBe(false);
    expect(hasInternalFooterNote(html)).toBe(false);
  });

  it('puts a confidentiality notice and project overview on PDF/Word documents', () => {
    const notice = buildConfidentialityNoticeHtml(false);
    expect(hasInternalFooterNote(notice)).toBe(true);
    expect(notice).toContain('id="doc-confidential"');
    expect(confidentialityNoticeText(true)).toContain('budget proposal');
    expect(confidentialityNoticeText(false)).toContain('implementation plan');

    const overview = buildProjectOverviewHtml({
      overviewText: 'Phase 1 storefront and Phase 2 socials rollout.',
      execSummaryHtml: 'Feel it. Follow the Plan anyway.',
      originStory: 'Angela got the idea from her niece.',
      partnerBio: 'Muntie Ev background, experience, and credentials.',
    });
    expect(hasProjectOverview(overview)).toBe(true);
    expect(hasAngelaNieceOrigin(overview)).toBe(true);
    expect(hasMuntieEvCredentials(overview)).toBe(true);
    expect(overview).toContain('Phase 1 storefront');
    expect(overview).toContain('Follow the Plan anyway');
  });
});
