export type IpPhaseKey = 'phase1_build' | 'phase2_addons' | 'phase3_future' | 'brand' | 'tech' | 'docs' | 'pages' | 'emails' | 'roi';

export interface IpTocItem {
  id: string;
  name: string;
  phase: 'phase1_build' | 'phase2_addons' | 'phase3_future';
  visible?: boolean;
}

export interface IpTocSection {
  id: string;
  phase: IpPhaseKey;
  label: string;
  subtitle: string;
  itemIds: string[];
}

export const IP_PHASE_1_ID = 'ip-phase-1';
export const IP_PHASE_2_ID = 'ip-phase-2';
export const IP_PHASE_3_ID = 'ip-phase-3';
export const IP_SAVED_MEETING_ID = 'ip-saved-kickoff';
export const IP_BRAND_ASSETS_ID = 'ip-brand-assets';
export const IP_TECH_STACK_ID = 'ip-tech-stack';
export const IP_PLAN_DOCS_ID = 'ip-plan-docs';
export const IP_WEBSITE_PAGES_ID = 'ip-website-pages';
export const IP_EMAIL_TEMPLATES_ID = 'ip-email-templates';
export const IP_SPRINT_ROI_ID = 'ip-sprint-roi';
export const IP_SPRINT_SCORECARD_ID = 'ip-sprint-scorecard';
export const IP_PAYMENT_SCHEDULE_ID = 'ip-payment-schedule';

export const ANGELA_PLAN_DOC_ACTIONS = [
  { id: 'view-pdf', label: 'View PDF' },
  { id: 'save-pdf', label: 'Download PDF' },
  { id: 'view-word', label: 'View Word' },
  { id: 'save-word', label: 'Download Word' },
] as const;

export type PlanDocAudience = 'angela' | 'internal';

export const PLAN_DOC_AUDIENCE_TABS: { id: PlanDocAudience; label: string }[] = [
  { id: 'angela', label: "Angela's Plan" },
  { id: 'internal', label: 'Internal' },
];

/** View/Download is a tab strip, not TOC bubbles. */
export function planDownloadAudienceTabs(canViewBudget: boolean): { id: PlanDocAudience; label: string }[] {
  return canViewBudget ? PLAN_DOC_AUDIENCE_TABS : PLAN_DOC_AUDIENCE_TABS.filter((tab) => tab.id === 'angela');
}

export function ipItemDomId(itemId: string): string {
  return `ip-item-${itemId}`;
}

const TOC_CHIP_SHORT_LABELS: Record<string, string> = {
  sprint0: 'Sprint 0',
  sprint1: 'Sprint 1',
  sprint2: 'Sprint 2',
  sprint3: 'Sprint 3',
  sprint4: 'Sprint 4',
  'memberships-phase2': 'Memberships',
  'roi-phase2': 'ROI',
  'future-phase3': 'Future',
};

const TOC_CHIP_MAX_CHARS = 18;

/** Short chip text so roadmap bubbles do not overflow. */
export function tocChipLabel(item: { id: string; name?: string }): string {
  const mapped = TOC_CHIP_SHORT_LABELS[item.id];
  if (mapped) return mapped;
  const sprint = item.id.match(/^sprint(\d+)$/i);
  if (sprint) return `Sprint ${sprint[1]}`;
  const raw = (item.name ?? item.id).split(/[—:]/)[0]?.trim() || item.id;
  if (raw.length <= TOC_CHIP_MAX_CHARS) return raw;
  return `${raw.slice(0, TOC_CHIP_MAX_CHARS - 1).trimEnd()}…`;
}

export function tocChipFitsBubble(label: string, maxChars = TOC_CHIP_MAX_CHARS): boolean {
  return label.length <= maxChars;
}

export function buildIpToc(
  items: IpTocItem[],
  options: {
    includeBrandAssets?: boolean;
    includeTechStack?: boolean;
    includePlanDocuments?: boolean;
    includeWebsitePages?: boolean;
    includeEmailTemplates?: boolean;
    includeSprintRoi?: boolean;
    includePaymentSchedule?: boolean;
  } = {},
): IpTocSection[] {
  const visible = items.filter((item) => item.visible !== false);
  const sections: IpTocSection[] = [];

  if (options.includeWebsitePages) {
    sections.push({
      id: IP_WEBSITE_PAGES_ID,
      phase: 'pages',
      label: 'Website Pages',
      subtitle: 'Phase 1 launch pages',
      itemIds: [],
    });
  }

  if (options.includeEmailTemplates) {
    sections.push({
      id: IP_EMAIL_TEMPLATES_ID,
      phase: 'emails',
      label: 'Orders',
      subtitle: 'SnatchVault hosting, menu, and 70/30 split',
      itemIds: [],
    });
  }

  if (options.includePaymentSchedule) {
    sections.push({
      id: IP_PAYMENT_SCHEDULE_ID,
      phase: 'docs',
      label: 'Payments',
      subtitle: 'Three payments · $3,500 received',
      itemIds: [],
    });
  }

  if (options.includeSprintRoi) {
    sections.push({
      id: IP_SPRINT_ROI_ID,
      phase: 'roi',
      label: 'Sprint ROI',
      subtitle: 'Tee sales, organic Facebook, no paid ads',
      itemIds: [],
    });
    sections.push({
      id: IP_SPRINT_SCORECARD_ID,
      phase: 'roi',
      label: 'Scorecard',
      subtitle: 'Weekly followers, engagement, sales bars',
      itemIds: [],
    });
  }

  if (options.includePlanDocuments) {
    sections.push({
      id: IP_PLAN_DOCS_ID,
      phase: 'docs',
      label: 'View / Download',
      subtitle: "Angela's Plan",
      itemIds: [],
    });
  }

  sections.push(
    {
      id: IP_PHASE_1_ID,
      phase: 'phase1_build',
      label: 'Phase 1',
      subtitle: 'Gear launch & T-shirt design',
      itemIds: visible.filter((item) => item.phase === 'phase1_build').map((item) => item.id),
    },
    {
      id: IP_PHASE_2_ID,
      phase: 'phase2_addons',
      label: 'Phase 2',
      subtitle: 'Memberships — Coming Soon',
      itemIds: visible.filter((item) => item.phase === 'phase2_addons').map((item) => item.id),
    },
    {
      id: IP_PHASE_3_ID,
      phase: 'phase3_future',
      label: 'Phase 3',
      subtitle: 'Open for future discussion',
      itemIds: visible.filter((item) => item.phase === 'phase3_future').map((item) => item.id),
    },
  );

  if (options.includeTechStack) {
    sections.push({
      id: IP_TECH_STACK_ID,
      phase: 'tech',
      label: 'Technologies',
      subtitle: 'Platform & stack',
      itemIds: [],
    });
  }

  if (options.includeBrandAssets) {
    sections.push({
      id: IP_BRAND_ASSETS_ID,
      phase: 'brand',
      label: 'Brand Assets',
      subtitle: 'Logo, palette & marks',
      itemIds: [],
    });
  }

  return sections;
}

export function scrollToIpSection(sectionId: string): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(sectionId);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}
