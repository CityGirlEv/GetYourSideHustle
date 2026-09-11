import { phase1DateRange } from './sprintCalendar';
import { buildWebsiteScopeDocumentHtml } from './websiteScope';

export function sprintScheduleLabel(item: { dates?: string; duration?: string }): string {
  const dates = (item.dates ?? '').trim();
  const duration = (item.duration ?? '').trim();
  if (dates && duration && dates !== duration) return `${dates} · ${duration}`;
  return dates || duration || 'Date TBD';
}

export function sprintShortLabel(id: string, fallbackName = ''): string {
  if (id.startsWith('sprint')) return id.replace('sprint', 'Sprint ');
  return fallbackName || 'Phase item';
}

export function documentAnchorId(id: string): string {
  return `doc-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export function buildDeliverableListHtml(escapedLabels: string[]): string {
  if (!escapedLabels.length) return '';
  return `<ul class="deliverable-list">${escapedLabels
    .map((label) => `<li><span class="check">✓</span> ${label}</li>`)
    .join('')}</ul>`;
}

export function hasDuplicatedDeliverableNumbers(html: string): boolean {
  return /<(ol|ul)[\s\S]*?<strong>\d+\.<\/strong>/.test(html);
}

export function hasInternalFooterNote(html: string): boolean {
  return /CONFIDENTIALITY|same boxed layout as the IP Roadmap/i.test(html);
}

export function hasProjectOverview(html: string): boolean {
  return html.includes('id="doc-overview"') && /Overall Description of the Project/i.test(html);
}

export function confidentialityNoticeText(includeBudget: boolean): string {
  const kind = includeBudget
    ? 'budget proposal, pricing schedule, and brand architecture document'
    : 'implementation plan and brand architecture document';
  return `CONFIDENTIALITY & PROPRIETARY NOTICE: This ${kind} contains confidential information and proprietary intellectual property of MY PLAN, NOT MY MOOD ™ and Munties AI Agents. Unauthorized distribution, copying, or public disclosure is strictly prohibited.`;
}

export function buildConfidentialityNoticeHtml(includeBudget: boolean): string {
  return `<div class="confidential-box" id="doc-confidential">
    <div class="confidential-kicker">Confidential &amp; Proprietary</div>
    <p>${confidentialityNoticeText(includeBudget)}</p>
  </div>`;
}

export function hasMuntieEvCredentials(html: string): boolean {
  return html.includes('id="doc-muntie-ev"') && /Background, Experience/i.test(html);
}

export function hasAngelaNieceOrigin(html: string): boolean {
  return html.includes('id="doc-origin"') && /niece/i.test(html);
}

export function buildProjectOverviewHtml(params: {
  overviewText: string;
  execSummaryHtml: string;
  originStory: string;
  partnerBio: string;
}): string {
  return `<div class="overview-box" id="doc-overview">
    <div class="kicker">Project Overview</div>
    <h2 class="plain">Overall Description of the Project</h2>
    <p class="lede">${params.overviewText}</p>
    <h3 class="subphase-head">Executive Summary &amp; Philosophy</h3>
    <div class="overview-body">${params.execSummaryHtml}</div>
    <h3 class="subphase-head" id="doc-origin">Where the Idea Came From</h3>
    <p class="lede">${params.originStory}</p>
    <h3 class="subphase-head" id="doc-muntie-ev">Muntie Ev — Background, Experience &amp; Credentials</h3>
    <p class="lede">${params.partnerBio}</p>
  </div>
  ${buildWebsiteScopeDocumentHtml()}`;
}

export function tocHasPhaseButton(html: string): boolean {
  return /class="phase-badge"/.test(html);
}

export function hasIpRoadmapByPhaseToc(html: string): boolean {
  return html.includes('IP Roadmap by Phase') && html.includes('toc-box');
}

export interface DocumentSprintCard {
  id: string;
  shortLabel: string;
  name: string;
  dates: string;
  duration: string;
  summary: string;
  description: string;
  deliverableHtml: string;
  priceLabel?: string;
  phase: 'phase1_build' | 'phase2_addons' | 'phase3_future';
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

function cardSubphase(card: DocumentSprintCard): 'core' | 'included' | 'addons' | 'retainers' | 'future' {
  if (card.phase === 'phase3_future') return 'future';
  if (card.phase === 'phase2_addons') {
    return card.id.startsWith('maint') ? 'retainers' : 'addons';
  }
  return card.id.startsWith('sprint') ? 'core' : 'included';
}

function renderCard(card: DocumentSprintCard): string {
  const chips = [
    card.duration ? `<span class="chip">${card.duration}</span>` : '',
    card.dates ? `<span class="chip">${card.dates}</span>` : '',
  ].join('');
  const price = card.priceLabel ? `<div class="card-price">${card.priceLabel}</div>` : '';
  return `<td class="sprint-card" valign="top" width="50%" id="${documentAnchorId(card.id)}">
    <div class="sprint-kicker">${card.shortLabel}${card.dates ? ` · ${card.dates}` : ''}</div>
    <div class="sprint-title">${card.name}</div>
    <div class="chip-row">${chips}</div>
    ${card.summary ? `<p class="card-summary">${card.summary}</p>` : ''}
    ${card.description ? `<p class="card-desc">${card.description}</p>` : ''}
    ${card.deliverableHtml}
    ${price}
  </td>`;
}

function renderCardRows(cards: DocumentSprintCard[]): string {
  if (!cards.length) return '';
  return chunk(cards, 2)
    .map((row) => {
      const cells = row.map(renderCard);
      if (row.length === 1) cells.push('<td width="50%"></td>');
      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');
}

function tocLink(href: string, label: string, extraClass = ''): string {
  return `<a class="toc-link ${extraClass}" href="#${href}">${label}</a>`;
}

export function buildClickableTocHtml(cards: DocumentSprintCard[]): string {
  const phase1 = cards.filter((c) => c.phase === 'phase1_build');
  const phase2 = cards.filter((c) => c.phase === 'phase2_addons');
  const phase3 = cards.filter((c) => c.phase === 'phase3_future');
  const core = phase1.filter((c) => cardSubphase(c) === 'core');
  const included = phase1.filter((c) => cardSubphase(c) === 'included');
  const addons = phase2.filter((c) => cardSubphase(c) === 'addons');
  const retainers = phase2.filter((c) => cardSubphase(c) === 'retainers');

  const sprintChips = (items: DocumentSprintCard[]) =>
    items.map((c) => tocLink(documentAnchorId(c.id), c.shortLabel, 'toc-chip')).join('');

  return `
    <div class="toc-banner" id="doc-toc">
      <div class="kicker">Table of Contents</div>
      <h2 class="plain">IP Roadmap by Phase</h2>
      <p class="lede">Jump to a phase, then open the sprint and item breakdown.</p>
      <table class="toc-grid" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td class="toc-box" width="50%" valign="top">
            ${tocLink('doc-phase-1', 'Phase 1', 'toc-label')}
            <div class="toc-sub">${tocLink('doc-sub-core', 'Gear launch &amp; T-shirt design')}</div>
            <div class="toc-chips">${sprintChips(core)}</div>
            ${included.length ? `<div class="toc-sub" style="margin-top:10px;">${tocLink('doc-sub-included', 'Included Architecture &amp; Design')}</div><div class="toc-chips">${sprintChips(included)}</div>` : ''}
            <div class="toc-sub" style="margin-top:10px;">${tocLink('doc-website-pages', 'Phase 1 Website Pages')}</div>
            <div class="toc-sub">${tocLink('doc-email-templates', 'Orders')}</div>
          </td>
          <td class="toc-box" width="50%" valign="top">
            ${tocLink('doc-phase-2', 'Phase 2', 'toc-label')}
            <div class="toc-sub">${tocLink('doc-sub-addons', 'Memberships — Coming Soon')}</div>
            <div class="toc-chips">${sprintChips(addons)}${sprintChips(retainers)}</div>
            ${tocLink('doc-phase-3', 'Phase 3', 'toc-label')}
            <div class="toc-sub">${tocLink('doc-sub-future', 'Open for future discussion')}</div>
            <div class="toc-chips">${sprintChips(phase3)}</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function buildRoadmapDocumentSection(cards: DocumentSprintCard[]): string {
  const phase1 = cards.filter((c) => c.phase === 'phase1_build');
  const phase2 = cards.filter((c) => c.phase === 'phase2_addons');
  const phase3 = cards.filter((c) => c.phase === 'phase3_future');
  const core = phase1.filter((c) => cardSubphase(c) === 'core');
  const included = phase1.filter((c) => cardSubphase(c) === 'included');
  const addons = phase2.filter((c) => cardSubphase(c) === 'addons');
  const retainers = phase2.filter((c) => cardSubphase(c) === 'retainers');
  const future = phase3.filter((c) => cardSubphase(c) === 'future');
  const timeline = ['Sprint 0', 'Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4']
    .map((label, i) => {
      const card = core.find((c) => c.shortLabel === label);
      const href = card ? documentAnchorId(card.id) : 'doc-phase-1';
      const connector = i < 4 ? '<td class="timeline-line">&nbsp;</td>' : '';
      const dateLine = card?.dates ? `<div class="timeline-date">${card.dates}</div>` : '';
      return `<td class="timeline-node">${tocLink(href, label)}${dateLine}</td>${connector}`;
    })
    .join('');

  return `
    <div class="schedule-banner">
      <div class="kicker light">IP Sprint &amp; Schedule</div>
      <h2 class="plain light">Agile Sprint Roadmap &amp; Delivery Schedule</h2>
    </div>

    <h3 class="phase-head" id="doc-phase-1">Phase 1 — Gear Launch &amp; T-Shirt Design (Sprint 0 → Sprint 4) · ${phase1DateRange()}</h3>
    <h4 class="subphase-head" id="doc-sub-core">Sub-Phase: Core Sprints</h4>
    <table class="timeline" width="100%" cellspacing="0" cellpadding="0"><tr>${timeline}</tr></table>
    <table class="card-grid" width="100%" cellspacing="10" cellpadding="0">${renderCardRows(core)}</table>
    ${included.length ? `<h4 class="subphase-head" id="doc-sub-included">Sub-Phase: Included Architecture &amp; Design</h4><table class="card-grid" width="100%" cellspacing="10" cellpadding="0">${renderCardRows(included)}</table>` : ''}

    <h3 class="phase-head phase2" id="doc-phase-2">Phase 2 — Memberships (Coming Soon in Phase 1)</h3>
    ${addons.length ? `<h4 class="subphase-head" id="doc-sub-addons">Sub-Phase: Memberships &amp; Discussion</h4><table class="card-grid" width="100%" cellspacing="10" cellpadding="0">${renderCardRows(addons)}</table>` : ''}
    ${retainers.length ? `<h4 class="subphase-head" id="doc-sub-retainers">Sub-Phase: Retainers</h4><table class="card-grid" width="100%" cellspacing="10" cellpadding="0">${renderCardRows(retainers)}</table>` : ''}

    <h3 class="phase-head" id="doc-phase-3">Phase 3 — Open for Future Discussion</h3>
    ${future.length ? `<h4 class="subphase-head" id="doc-sub-future">Not scoped in the $10K gear launch</h4><table class="card-grid" width="100%" cellspacing="10" cellpadding="0">${renderCardRows(future)}</table>` : '<p class="lede">Mood tools, planners, socials, Content Factory, and retainers stay open.</p>'}
  `;
}
