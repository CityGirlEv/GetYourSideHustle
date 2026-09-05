import { describe, it, expect, afterEach } from 'vitest';
import {
  buildIpToc,
  ipItemDomId,
  scrollToIpSection,
  IP_PHASE_1_ID,
  IP_PHASE_2_ID,
  IP_BRAND_ASSETS_ID,
  IP_TECH_STACK_ID,
  IP_PLAN_DOCS_ID,
  ANGELA_PLAN_DOC_ACTIONS,
  planDownloadAudienceTabs,
} from '../ipToc';

const items = [
  { id: 'sprint0', name: 'Sprint 0', phase: 'phase1_build' as const },
  { id: 'sprint1', name: 'Sprint 1', phase: 'phase1_build' as const },
  { id: 'socials-ad-infra', name: 'Socials', phase: 'phase2_addons' as const },
  { id: 'hidden', name: 'Hidden', phase: 'phase1_build' as const, visible: false },
];

describe('ipToc', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('groups visible items by phase and keeps Phase 1 / Phase 2 / Phase 3 first', () => {
    const toc = buildIpToc(items);
    expect(toc).toHaveLength(3);
    expect(toc[0]).toMatchObject({
      id: IP_PHASE_1_ID,
      label: 'Phase 1',
      itemIds: ['sprint0', 'sprint1'],
    });
    expect(toc[1]).toMatchObject({
      id: IP_PHASE_2_ID,
      label: 'Phase 2',
      itemIds: ['socials-ad-infra'],
    });
    expect(toc[2].label).toBe('Phase 3');
    expect(buildIpToc(items, { includeSprintRoi: true }).some((section) => section.id === 'ip-sprint-roi')).toBe(true);
    expect(buildIpToc(items, { includeSprintRoi: true }).some((section) => section.id === 'ip-sprint-scorecard')).toBe(true);
    expect(toc[0].itemIds).not.toContain('hidden');
  });

  it('appends Technologies and Brand Assets as clickable TOC sections when requested', () => {
    const toc = buildIpToc(items, { includeBrandAssets: true, includeTechStack: true });
    expect(toc).toHaveLength(5);
    expect(toc[3]).toMatchObject({
      id: IP_TECH_STACK_ID,
      label: 'Technologies',
      itemIds: [],
    });
    expect(toc[4]).toMatchObject({
      id: IP_BRAND_ASSETS_ID,
      label: 'Brand Assets',
      itemIds: [],
    });
  });

  it('keeps View/Download as tabs instead of a TOC bubble and lists Angela first', () => {
    const toc = buildIpToc(items, { includePlanDocuments: false });
    expect(toc[0].id).toBe(IP_PHASE_1_ID);
    expect(toc.some((section) => section.id === IP_PLAN_DOCS_ID)).toBe(false);
    expect(planDownloadAudienceTabs(false)).toEqual([{ id: 'angela', label: "Angela's Plan" }]);
    expect(planDownloadAudienceTabs(true).map((tab) => tab.id)).toEqual(['angela', 'internal']);
    expect(ANGELA_PLAN_DOC_ACTIONS.map((action) => action.label)).toEqual([
      'View PDF',
      'Download PDF',
      'View Word',
      'Download Word',
    ]);
  });

  it('builds stable DOM ids for sprint jump targets', () => {
    expect(ipItemDomId('sprint0')).toBe('ip-item-sprint0');
  });

  it('scrolls to an existing section and reports miss when the id is absent', () => {
    const target = document.createElement('div');
    target.id = IP_PHASE_1_ID;
    target.scrollIntoView = () => undefined;
    document.body.appendChild(target);

    expect(scrollToIpSection(IP_PHASE_1_ID)).toBe(true);
    expect(scrollToIpSection('missing-section')).toBe(false);
  });
});
