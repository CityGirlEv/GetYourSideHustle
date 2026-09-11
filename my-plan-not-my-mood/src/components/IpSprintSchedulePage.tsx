import React from 'react';
import { Calendar, Clock, CheckCircle2, Download, Eye, Layers, List, Plus, Trash2 } from 'lucide-react';
import type { IpItemPhase } from '../lib/ipLineItems';
import type { TaskItem } from '../lib/workBoard';
import { taskIsDone } from '../lib/workBoard';
import {
  buildIpToc,
  ipItemDomId,
  scrollToIpSection,
  ANGELA_PLAN_DOC_ACTIONS,
  IP_EMAIL_TEMPLATES_ID,
  IP_SPRINT_ROI_ID,
  IP_SPRINT_SCORECARD_ID,
  IP_PHASE_1_ID,
  IP_PHASE_2_ID,
  IP_PHASE_3_ID,
  IP_SAVED_MEETING_ID,
  IP_PAYMENT_SCHEDULE_ID,
  IP_WEBSITE_PAGES_ID,
  planDownloadAudienceTabs,
  type IpTocSection,
  type PlanDocAudience,
} from '../lib/ipToc';
import { savedKickoffPlanLink } from '../lib/savedMeetings';
import { MEMBERSHIPS_COMING_SOON_NOTE, PHASE_1_LABEL, PHASE_2_LABEL, PHASE_3_LABEL } from '../lib/gearSalesPlan';
import { phase1DateRange, sprintIdWithDates, sprintLabelWithDates, sprintWindowById } from '../lib/sprintCalendar';
import { planRoadmapIntro } from '../lib/planIntro';
import {
  ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE,
  ADDITIONAL_PAGES_ADDON_NOTE,
  EMAIL_TEMPLATES_TITLE,
  INCLUDED_EMAIL_TEMPLATES,
  INCLUDED_WEBSITE_PAGES,
  ORDER_STORE_URL,
  WEBSITE_PAGES_TITLE,
} from '../lib/websiteScope';
import {
  ORGANIC_FACEBOOK_FOLLOWERS_LABEL,
  ORGANIC_ONLY_NOTE,
  ROI_IMPROVEMENT_SUGGESTIONS,
  ROI_LEVER_LABELS,
  SPRINT_ROI_FUNNEL_TITLE,
  SPRINT_ROI_GLOSSARY,
  SPRINT_ROI_GLOSSARY_TITLE,
  SPRINT_ROI_HEADING,
  HOODIE_PRICE,
  formatShirtCount,
  formatUsd,
  organicFunnelSteps,
  formatRoiPercent,
  phase1OrganicRoi,
  sprintRoiById,
  sprintRoiPlainLines,
  sprintRoiRows,
} from '../lib/sprintRoi';
import {
  SCORECARD_ASSUMPTIONS,
  buildWeekScorecards,
  formatScorecardNumber,
  rollupSprintScorecards,
} from '../lib/sprintScorecard';
import { Logo } from './Logo';
import { PaymentScheduleCard } from './PaymentScheduleCard';

export interface SprintScheduleItem {
  id: string;
  name: string;
  phase: 'phase1_build' | 'phase2_addons' | 'phase3_future';
  duration?: string;
  dates?: string;
  summary?: string;
  deliverables?: string[];
  description: string;
  hours: number;
  rate: number;
  baseAmount: number;
  visible?: boolean;
}

export interface IpTocExtraSection {
  id: string;
  label: string;
  subtitle: string;
}

const SPRINT_ID_TO_LABEL: Record<string, string> = {
  sprint0: 'Sprint 0',
  sprint1: 'Sprint 1',
  sprint2: 'Sprint 2',
  sprint3: 'Sprint 3',
  sprint4: 'Sprint 4',
};

function taskCountsForSprint(tasks: TaskItem[], sprintLabel: string) {
  const matched = tasks.filter((t) => t.sprint === sprintLabel);
  return { total: matched.length, done: matched.filter(taskIsDone).length };
}

function itemLabel(item: SprintScheduleItem): string {
  const sprint = SPRINT_ID_TO_LABEL[item.id];
  if (sprint) return sprintLabelWithDates(sprint);
  const dates = item.dates?.trim();
  return dates ? `${item.name} · ${dates}` : item.name;
}

export interface AngelaPlanDocActions {
  onViewPdf: () => void;
  onSavePdf: () => void;
  onViewWord: () => void;
  onSaveWord: () => void;
  canViewBudget?: boolean;
  audience?: PlanDocAudience;
  onAudienceChange?: (audience: PlanDocAudience) => void;
  extraLinks?: { id: string; label: string; targetId: string }[];
  onOpenBudget?: () => void;
}

export type IpScheduleItemPatch = Partial<
  Pick<SprintScheduleItem, 'name' | 'summary' | 'description' | 'dates' | 'duration' | 'deliverables'>
>;

export const IpSprintSchedulePage: React.FC<{
  lineItems: SprintScheduleItem[];
  tasks?: TaskItem[];
  extraTocItems?: IpTocExtraSection[];
  angelaPlanDocs?: AngelaPlanDocActions;
  introSummary?: string;
  canEdit?: boolean;
  onAddItem?: (phase: IpItemPhase) => void;
  onRemoveItem?: (id: string) => void;
  onUpdateItem?: (id: string, patch: IpScheduleItemPatch) => void;
}> = ({
  lineItems,
  tasks = [],
  extraTocItems = [],
  angelaPlanDocs,
  introSummary,
  canEdit = false,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  const intro = planRoadmapIntro(introSummary);
  const visibleItems = lineItems.filter((i) => i.visible !== false);
  const phase1 = visibleItems.filter((i) => i.phase === 'phase1_build');
  const phase2 = visibleItems.filter((i) => i.phase === 'phase2_addons');
  const phase3 = visibleItems.filter((i) => i.phase === 'phase3_future');
  const savedMeeting = savedKickoffPlanLink();
  const toc = buildIpToc(visibleItems, {
    includeBrandAssets: extraTocItems.some((s) => s.id === 'ip-brand-assets'),
    includePlanDocuments: false,
    includeWebsitePages: true,
    includeEmailTemplates: true,
    includeSprintRoi: true,
    includePaymentSchedule: true,
  });
  const tocSections: IpTocSection[] = extraTocItems.some((s) => s.id === 'ip-brand-assets')
    ? toc
    : [
        ...toc,
        ...extraTocItems.map((extra) => ({
          id: extra.id,
          phase: 'brand' as const,
          label: extra.label,
          subtitle: extra.subtitle,
          itemIds: [],
        })),
      ];

  const itemsById = new Map(visibleItems.map((item) => [item.id, item]));
  const roiRows = sprintRoiRows();
  const phaseRoi = phase1OrganicRoi();
  const scorecardWeeks = buildWeekScorecards();
  const scorecardRollups = rollupSprintScorecards(scorecardWeeks);

  const updateDeliverable = (item: SprintScheduleItem, index: number, label: string) => {
    const next = [...(item.deliverables ?? [])];
    next[index] = label;
    onUpdateItem?.(item.id, { deliverables: next });
  };

  const removeDeliverable = (item: SprintScheduleItem, index: number) => {
    onUpdateItem?.(item.id, {
      deliverables: (item.deliverables ?? []).filter((_, idx) => idx !== index),
    });
  };

  const addDeliverable = (item: SprintScheduleItem) => {
    onUpdateItem?.(item.id, {
      deliverables: [...(item.deliverables ?? []), 'New checklist item'],
    });
  };

  const handleRemoveCard = (item: SprintScheduleItem) => {
    if (!onRemoveItem) return;
    if (window.confirm(`Remove “${item.name}” from the Implementation Plan?`)) {
      onRemoveItem(item.id);
    }
  };

  const renderSprintCard = (item: SprintScheduleItem, index: number) => {
    const sprintLabel = SPRINT_ID_TO_LABEL[item.id];
    const counts = sprintLabel ? taskCountsForSprint(tasks, sprintLabel) : { total: 0, done: 0 };
    const sprintRoi = sprintRoiById(item.id);

    return (
      <article
        key={item.id}
        id={ipItemDomId(item.id)}
        className="bg-[#FFFCF7] border border-[#E8DFD2] rounded-[1.5rem] p-6 shadow-[0_10px_36px_rgba(31,25,23,0.06)] space-y-3 relative scroll-mt-28"
        data-testid={`sprint-schedule-${item.id}`}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-[#C2410C] pt-1">
              {sprintLabel ? sprintLabelWithDates(sprintLabel) : `Phase item ${index + 1}`}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {sprintLabel && counts.total > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-[#FFEDD5] border border-[#C2410C]/40 text-[9px] font-mono font-black text-[#C2410C] tabular-nums">
                  Tasks {counts.done}/{counts.total}
                </span>
              )}
              {sprintRoi && (
                <span className="px-2.5 py-1 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-[9px] font-mono font-black text-[#1F1917] tabular-nums">
                  ROI {formatRoiPercent(sprintRoi.roiPercent)}
                </span>
              )}
              {canEdit && onRemoveItem && (
                <button
                  type="button"
                  onClick={() => handleRemoveCard(item)}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#3F3832] hover:text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-200 cursor-pointer"
                  aria-label={`Remove ${item.name}`}
                  data-testid={`ip-remove-item-${item.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {canEdit && onUpdateItem ? (
            <textarea
              value={item.name}
              onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
              rows={3}
              className="w-full min-h-[44px] text-sm font-black text-[#1F1917] leading-snug bg-[#FAF8F5] border-2 border-[#E5DFD3] rounded-xl px-3 py-2 focus:border-[#C2410C] focus:outline-none resize-y break-words whitespace-pre-wrap"
              aria-label="Item name"
            />
          ) : (
            <h4 className="text-base font-serif font-semibold text-[#1F1917] leading-snug break-words">
              {item.name}
            </h4>
          )}
        </div>

        <div className="flex flex-col gap-2 text-[10px] font-mono font-bold text-[#3F3832]">
          {canEdit && onUpdateItem ? (
            <>
              <label className="inline-flex items-center gap-1 min-h-[44px] px-2 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] w-full">
                <Clock className="w-3 h-3 shrink-0" />
                <input
                  type="text"
                  value={item.duration ?? ''}
                  onChange={(e) => onUpdateItem(item.id, { duration: e.target.value })}
                  className="bg-transparent focus:outline-none min-w-0 flex-1"
                  aria-label="Duration"
                />
              </label>
              <label className="inline-flex items-start gap-1 min-h-[44px] px-2 py-2 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] w-full">
                <Calendar className="w-3 h-3 shrink-0 mt-0.5" />
                <textarea
                  value={item.dates ?? ''}
                  onChange={(e) => onUpdateItem(item.id, { dates: e.target.value })}
                  rows={2}
                  className="bg-transparent focus:outline-none w-full min-w-0 resize-y break-words whitespace-pre-wrap leading-snug"
                  aria-label="Dates"
                />
              </label>
            </>
          ) : (
            <>
              {item.duration && (
                <span className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] w-full break-words">
                  <Clock className="w-3 h-3 shrink-0" /> {item.duration}
                </span>
              )}
              {item.dates && (
                <span className="inline-flex items-start gap-1 px-2 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD3] w-full break-words whitespace-normal">
                  <Calendar className="w-3 h-3 shrink-0 mt-0.5" /> {item.dates}
                </span>
              )}
            </>
          )}
        </div>

        {canEdit && onUpdateItem ? (
          <>
            <textarea
              value={item.summary ?? ''}
              onChange={(e) => onUpdateItem(item.id, { summary: e.target.value })}
              className="w-full min-h-[72px] text-xs text-[#1F1917] font-semibold leading-relaxed bg-[#FAF8F5] border-2 border-[#E5DFD3] rounded-xl px-3 py-2 focus:border-[#C2410C] focus:outline-none"
              aria-label="Summary"
            />
            <textarea
              value={item.description}
              onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
              className="w-full min-h-[72px] text-[11px] text-[#3F3832] leading-relaxed bg-[#FAF8F5] border-2 border-[#E5DFD3] rounded-xl px-3 py-2 focus:border-[#C2410C] focus:outline-none"
              aria-label="Description"
            />
          </>
        ) : (
          <>
            {item.summary && (
              <p className="text-xs text-[#1F1917] font-semibold leading-relaxed">{item.summary}</p>
            )}
            <p className="text-[11px] text-[#3F3832] leading-relaxed">{item.description}</p>
          </>
        )}

        {(item.deliverables && item.deliverables.length > 0) || (canEdit && onUpdateItem) ? (
          <ul className="space-y-1.5 pt-2 border-t border-[#E5DFD3]">
            {(item.deliverables ?? []).map((d, idx) => (
              <li key={`${item.id}-d-${idx}`} className="flex items-start gap-1.5 text-[11px] text-[#3F3832]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-2" />
                {canEdit && onUpdateItem ? (
                  <>
                    <input
                      type="text"
                      value={d}
                      onChange={(e) => updateDeliverable(item, idx, e.target.value)}
                      className="flex-1 min-h-[44px] bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl px-2 focus:border-[#C2410C] focus:outline-none"
                      aria-label={`Deliverable ${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeDeliverable(item, idx)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-gray-400 hover:text-red-600 cursor-pointer"
                      aria-label={`Remove deliverable ${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="mt-1.5">{d}</span>
                )}
              </li>
            ))}
            {canEdit && onUpdateItem && (
              <li>
                <button
                  type="button"
                  onClick={() => addDeliverable(item)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-wider text-[#C2410C] hover:bg-[#FFEDD5] rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add checklist item
                </button>
              </li>
            )}
          </ul>
        ) : null}
      </article>
    );
  };

  const renderAddItemButton = (phase: IpItemPhase, label: string) => {
    if (!canEdit || !onAddItem) return null;
    return (
      <button
        type="button"
        onClick={() => onAddItem(phase)}
        className="min-h-[44px] inline-flex items-center gap-1.5 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-[11px] font-black uppercase tracking-wide cursor-pointer border-2 border-[#1F1917]"
        data-testid={`ip-add-item-${phase}`}
      >
        <Plus className="w-4 h-4" /> {label}
      </button>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn" data-testid="ip-sprint-schedule-page">
      <section
        className="bg-[#FFFCF7] text-[#1F1917] border border-[#E8DFD2] rounded-[2rem] p-6 sm:p-10 shadow-[0_16px_48px_rgba(31,25,23,0.07)] space-y-6"
        data-testid="plan-roadmap-intro"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Logo variant="seal-only" size="md" className="shrink-0 bg-white rounded-2xl p-1 border border-[#E5DFD3] shadow-sm" />
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-4xl font-serif font-semibold tracking-tight text-[#1F1917]">
              My Plan, <span className="text-[#9A6B3D] italic font-normal">Not My Mood</span>
            </h2>
            <p className="inline-flex mt-2 px-2.5 py-1 rounded-lg bg-[#FFEDD5] border border-[#C2410C]/30 text-[11px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
              {intro.livingDocument}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-[#3F3832]">
          <div><span className="font-black text-[#1F1917]">Prepared For:</span> {intro.preparedFor}</div>
          <div className="sm:text-right"><span className="font-black text-[#1F1917]">{intro.clientRole}:</span> {intro.clientName}</div>
          <div>
            <span className="font-black text-[#1F1917]">Email:</span>{' '}
            <a href={`mailto:${intro.clientEmail}`} className="text-[#C2410C] underline decoration-[#C2410C]/40">{intro.clientEmail}</a>
          </div>
          <div className="sm:text-right"><span className="font-black text-[#1F1917]">Technical Execution Partner:</span> {intro.techPartner}</div>
        </div>
        <div className="border-t border-[#E5DFD3] pt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider font-serif text-[#C2410C]">{intro.execTitle}</h3>
            <p className="text-sm text-[#1F1917] font-medium leading-relaxed whitespace-pre-line">{intro.execSummary}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider font-serif text-[#C2410C]">{intro.originTitle}</h3>
            <p className="text-sm text-[#1F1917] font-medium leading-relaxed">{intro.originStory}</p>
          </div>
          <div className="space-y-2" data-testid="plan-how-we-got-here">
            <h3 className="text-sm font-black uppercase tracking-wider font-serif text-[#C2410C]">{intro.amountTitle}</h3>
            <p className="text-sm text-[#1F1917] font-medium leading-relaxed">{intro.amountStory}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider font-serif text-[#C2410C]">{intro.partnerTitle}</h3>
            <p className="text-sm text-[#1F1917] font-medium leading-relaxed">{intro.partnerBio}</p>
          </div>
        </div>
      </section>

      <a
        id={IP_SAVED_MEETING_ID}
        href={savedMeeting.href}
        data-testid="saved-kickoff-meeting-link"
        className="block bg-[#1F1917] text-[#FFFCF7] border border-[#1F1917] rounded-[1.75rem] px-6 py-5 sm:px-8 shadow-[0_12px_36px_rgba(31,25,23,0.18)] hover:bg-[#2A2320] transition-colors"
      >
        <div className="text-[10px] tracking-[0.22em] uppercase font-serif text-[#E8C9A0]">Saved meeting</div>
        <div className="mt-1 text-lg sm:text-xl font-serif font-semibold">August 27 kickoff — gear sales decisions</div>
        <p className="mt-1 text-sm text-[#E8DFD2] font-medium">{savedMeeting.label} →</p>
      </a>

      <div className="bg-[#FFFCF7] border border-[#E8DFD2] rounded-[2rem] p-6 sm:p-8 shadow-[0_12px_40px_rgba(31,25,23,0.06)] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider mb-2">
              <List className="w-3.5 h-3.5" /> Table of Contents
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-serif text-[#1F1917]">
              Roadmap by phase
            </h3>
            <p className="text-xs text-[#3F3832] font-medium mt-1 max-w-2xl">
              Use the View / Download tabs, then jump to a phase and open the sprint or add-on you want.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#FFEDD5] text-[#C2410C] border border-[#C2410C]/30 text-[10px] font-mono font-black uppercase">
            {tasks.filter(taskIsDone).length}/{tasks.length} tasks done
          </div>
        </div>

        {angelaPlanDocs && (
          <div className="border-2 border-[#1F1917] rounded-2xl overflow-hidden bg-[#FAF8F5]" data-testid="plan-download-tabs">
            <div className="px-4 pt-3 pb-1 text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
              View / Download
            </div>
            {angelaPlanDocs.canViewBudget && (
              <div role="tablist" aria-label="Plan audience" className="flex flex-wrap border-b border-[#E5DFD3] px-2">
                {planDownloadAudienceTabs(true).map((tab) => {
                  const selected = (angelaPlanDocs.audience ?? 'angela') === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => angelaPlanDocs.onAudienceChange?.(tab.id)}
                      className={`min-h-[44px] px-4 text-[11px] font-black uppercase tracking-wide cursor-pointer border-b-4 -mb-px ${
                        selected
                          ? 'border-[#C2410C] text-[#C2410C] bg-white'
                          : 'border-transparent text-[#3F3832] hover:text-[#1F1917]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
            <div role="tablist" aria-label="View and download plan" className="flex flex-wrap">
              {ANGELA_PLAN_DOC_ACTIONS.map((action) => {
                const isDownload = action.id.startsWith('save');
                const Icon = isDownload ? Download : Eye;
                const actionHandlers: Record<(typeof ANGELA_PLAN_DOC_ACTIONS)[number]['id'], () => void> = {
                  'view-pdf': angelaPlanDocs.onViewPdf,
                  'save-pdf': angelaPlanDocs.onSavePdf,
                  'view-word': angelaPlanDocs.onViewWord,
                  'save-word': angelaPlanDocs.onSaveWord,
                };
                return (
                  <button
                    key={action.id}
                    type="button"
                    role="tab"
                    onClick={actionHandlers[action.id]}
                    className="min-h-[48px] px-4 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[#1F1917] hover:bg-[#FFEDD5] hover:text-[#C2410C] cursor-pointer border-r border-[#E5DFD3]"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                );
              })}
              {angelaPlanDocs.onOpenBudget && (
                <button
                  type="button"
                  data-testid="open-interactive-budget"
                  onClick={angelaPlanDocs.onOpenBudget}
                  className="min-h-[48px] px-4 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-white bg-[#C2410C] hover:bg-[#9A3412] cursor-pointer border-r border-[#E5DFD3]"
                >
                  Open Interactive Budget
                </button>
              )}
              {(angelaPlanDocs.extraLinks ?? []).map((link) => (
                <button
                  key={link.id}
                  type="button"
                  data-testid={`internal-link-${link.id}`}
                  onClick={() => scrollToIpSection(link.targetId)}
                  className="min-h-[48px] px-4 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[#C2410C] hover:bg-[#FFEDD5] cursor-pointer border-r border-[#E5DFD3] last:border-r-0"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" data-testid="ip-toc-phases">
          {tocSections.map((section) => {
            return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToIpSection(section.id)}
              className="text-left rounded-[1.25rem] border border-[#E8DFD2] bg-white hover:bg-[#FFF7ED] hover:border-[#C4A574] transition-all p-4 cursor-pointer shadow-[0_6px_20px_rgba(31,25,23,0.04)]"
              data-testid={`ip-toc-phase-${section.phase}`}
            >
              <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
                {section.label}
              </div>
              <div className="text-sm font-black text-[#1F1917] uppercase mt-1 leading-snug">
                {section.subtitle}
              </div>
              {section.itemIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {section.itemIds.map((itemId) => {
                    const item = itemsById.get(itemId);
                    return (
                      <span
                        key={itemId}
                        role="link"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          scrollToIpSection(ipItemDomId(itemId));
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.stopPropagation();
                            scrollToIpSection(ipItemDomId(itemId));
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-[#E5DFD3] text-[9px] font-mono font-black text-[#1F1917] hover:border-[#C2410C] hover:text-[#C2410C] cursor-pointer whitespace-normal leading-snug max-w-[14rem]"
                      >
                        {item ? itemLabel(item) : itemId}
                      </span>
                    );
                  })}
                </div>
              )}
            </button>
            );
          })}
        </div>
      </div>

      <PaymentScheduleCard id={IP_PAYMENT_SCHEDULE_ID} />

      <div
        id={IP_WEBSITE_PAGES_ID}
        className="bg-[#FFFCF7] border border-[#E8DFD2] rounded-[2rem] p-6 sm:p-8 shadow-[0_12px_40px_rgba(31,25,23,0.06)] space-y-3 scroll-mt-28"
        data-testid="plan-website-pages"
      >
        <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">{WEBSITE_PAGES_TITLE}</h3>
        <p className="text-sm text-[#3F3832] font-medium">{ADDITIONAL_PAGES_ADDON_NOTE}</p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium text-[#1F1917] list-decimal pl-5">
          {INCLUDED_WEBSITE_PAGES.map((page) => (
            <li key={page.id}>{page.name}</li>
          ))}
        </ol>
      </div>

      <div
        id={IP_EMAIL_TEMPLATES_ID}
        className="bg-[#FFFCF7] border border-[#E8DFD2] rounded-[2rem] p-6 sm:p-8 shadow-[0_12px_40px_rgba(31,25,23,0.06)] space-y-3 scroll-mt-28"
        data-testid="plan-email-templates"
      >
        <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">{EMAIL_TEMPLATES_TITLE}</h3>
        <p className="text-sm text-[#3F3832] font-medium">{ADDITIONAL_EMAIL_TEMPLATES_ADDON_NOTE}</p>
        <p className="text-sm font-semibold">
          <a
            href={ORDER_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[#C2410C] underline decoration-[#C2410C]/40 break-all"
          >
            {ORDER_STORE_URL}
          </a>
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium text-[#1F1917] list-decimal pl-5">
          {INCLUDED_EMAIL_TEMPLATES.map((template) => (
            <li key={template.id}>{template.name}</li>
          ))}
        </ol>
      </div>

      <div
        id={IP_SPRINT_ROI_ID}
        className="bg-[#FFFCF7] border border-[#E8DFD2] rounded-[2rem] p-6 sm:p-8 shadow-[0_12px_40px_rgba(31,25,23,0.06)] space-y-4 scroll-mt-28"
        data-testid="plan-sprint-roi"
      >
        <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">{SPRINT_ROI_HEADING}</h3>
        <p className="text-sm text-[#3F3832] font-medium">{ORGANIC_ONLY_NOTE}</p>
        <p className="text-sm text-[#3F3832] font-medium">
          Shop Gear is live now. Hoodies at about ${HOODIE_PRICE} are what is selling. Shirts and hats are in the mix,
          but they are the smaller share. Soft-sell Angela’s {ORGANIC_FACEBOOK_FOLLOWERS_LABEL} Facebook immediately. The
          $10,000 is the build fee — Facebook hoodie sales will not pay that back during Phase 1.
        </p>
        <div className="rounded-xl border border-[#E8DFD2] bg-white px-3 py-3 space-y-2" data-testid="sprint-roi-funnel">
          <h4 className="text-sm font-black uppercase font-serif text-[#9A3412]">{SPRINT_ROI_FUNNEL_TITLE}</h4>
          <ol className="space-y-1.5 list-decimal pl-5 text-sm text-[#3F3832]">
            {organicFunnelSteps().map((step) => (
              <li key={step.label}>
                <span className="font-semibold text-[#1F1917]">{step.label}: </span>
                {step.detail}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-[#E8DFD2] bg-white px-3 py-3 space-y-2" data-testid="sprint-roi-glossary">
          <h4 className="text-sm font-black uppercase font-serif text-[#9A3412]">{SPRINT_ROI_GLOSSARY_TITLE}</h4>
          <dl className="space-y-2">
            {SPRINT_ROI_GLOSSARY.map((row) => (
              <div key={row.term}>
                <dt className="text-sm font-semibold text-[#1F1917]">{row.term}</dt>
                <dd className="text-sm text-[#3F3832]">{row.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ol className="space-y-2" data-testid="sprint-roi-list">
          {roiRows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[#E8DFD2] bg-white px-3 py-3 min-h-[44px]"
              data-testid={`sprint-roi-${row.id}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-black uppercase text-[#1F1917]">
                  {sprintIdWithDates(row.id, row.label)}
                </span>
                <span className="text-sm font-mono font-black text-[#C2410C] tabular-nums">
                  ROI {formatRoiPercent(row.roiPercent)}
                </span>
              </div>
              <dl className="mt-2 space-y-1.5">
                {sprintRoiPlainLines(row).map((line) => (
                  <div key={line.label} className="text-sm">
                    <dt className="font-semibold text-[#1F1917]">{line.label}</dt>
                    <dd className="text-[#3F3832]">{line.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-[#6B5344] mt-2">{row.note}</p>
            </li>
          ))}
        </ol>
        <div className="rounded-xl border-2 border-[#FDBA74] bg-[#FFF7ED] px-3 py-3" data-testid="sprint-roi-phase1-total">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-black uppercase text-[#1F1917]">Phase 1 total</span>
            <span className="text-sm font-mono font-black text-[#C2410C] tabular-nums">
              ROI {formatRoiPercent(phaseRoi.roiPercent)}
            </span>
          </div>
          <p className="text-sm font-medium text-[#3F3832] mt-2">
            {formatUsd(phaseRoi.investment)} is the full Phase 1 build fee. Across the five sprints we expect{' '}
            {formatShirtCount(phaseRoi.expectedHoodieUnits)} ({formatUsd(phaseRoi.expectedHoodieRevenue)} at about $
            {HOODIE_PRICE} each) and {formatShirtCount(phaseRoi.expectedUnits, 'item')} overall (
            {formatUsd(phaseRoi.expectedRevenue)} in product sales).
          </p>
          <p className="text-sm text-[#6B5344] mt-2">
            If the same Facebook posting continues for 90 days after launch, the model is still only about{' '}
            {formatShirtCount(phaseRoi.trailing90DayHoodieUnits)} (
            {formatUsd(phaseRoi.trailing90DayHoodieRevenue)} from hoodies) — not a $10,000 payback unless more people
            buy, someone orders a second color, or paid ads are added later.
          </p>
        </div>
        <div data-testid="sprint-roi-suggestions" className="space-y-2">
          <h4 className="text-sm font-black uppercase font-serif text-[#9A3412]">Suggestions to sell more hoodies</h4>
          <p className="text-sm text-[#6B5344] font-medium">
            None of these add paid ads. They either get more of the same 6,200 Facebook people to the shop, or they
            add TikTok and YouTube viewers this forecast does not count yet.
          </p>
          <ol className="space-y-2">
            {ROI_IMPROVEMENT_SUGGESTIONS.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-[#FED7AA] bg-white px-3 py-3"
                data-testid={`sprint-roi-suggestion-${row.id}`}
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-[#EA580C]">
                  {ROI_LEVER_LABELS[row.lever]}
                </p>
                <p className="text-sm font-semibold text-[#9A3412]">{row.title}</p>
                <p className="text-sm text-[#6B5344] mt-0.5">{row.suggestion}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div
        id={IP_SPRINT_SCORECARD_ID}
        className="bg-[#FFFCF7] border border-[#E8DFD2] rounded-[2rem] p-6 sm:p-8 shadow-[0_12px_40px_rgba(31,25,23,0.06)] space-y-4 scroll-mt-28"
        data-testid="plan-sprint-scorecard"
      >
        <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">
          Sprint scorecard — what we should see
        </h3>
        <p className="text-sm text-[#3F3832] font-medium">{SCORECARD_ASSUMPTIONS}</p>
        <p className="text-xs text-[#6B5344] font-medium">
          Score this at Sunday retro. Target is the bar. Min is still on track. Stretch is a strong organic week, not
          ads. Personal Facebook starts at {ORGANIC_FACEBOOK_FOLLOWERS_LABEL}.
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="sprint-scorecard-rollups">
          {scorecardRollups.map((row) => (
            <li
              key={row.sprintId}
              className="rounded-xl border border-[#E8DFD2] bg-white px-3 py-3 min-h-[44px]"
              data-testid={`sprint-scorecard-rollup-${row.sprintId}`}
            >
              <p className="text-sm font-black uppercase text-[#1F1917]">{row.label}</p>
              <p className="text-[11px] font-mono text-[#C2410C]">{row.dates}</p>
              <p className="text-xs font-medium text-[#3F3832] mt-1">
                {row.postsPlanned} posts · {row.livesPlanned} lives · {formatScorecardNumber(row.orders.target)} orders
                (min {formatScorecardNumber(row.orders.min)}) · {formatScorecardNumber(row.revenue.target, 'usd')} sales
                · FB {row.personalFbEnd.toLocaleString()} · brand pages ~{row.brandEachEnd} each
              </p>
            </li>
          ))}
        </ol>
        <ol className="space-y-3" data-testid="sprint-scorecard-weeks">
          {scorecardWeeks.map((week) => (
            <li
              key={week.id}
              className="rounded-2xl border border-[#E8DFD2] bg-white px-3 py-3 space-y-2"
              data-testid={`sprint-scorecard-${week.id}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-black uppercase text-[#1F1917]">
                  {week.sprintLabel} · {week.weekLabel}
                </h4>
                <span className="text-[11px] font-mono font-bold text-[#C2410C]">{week.dates}</span>
              </div>
              <p className="text-xs text-[#6B5344]">{week.note}</p>
              <p className="text-[11px] font-medium text-[#3F3832]">
                Calendar: {week.postsPlanned} public posts · {week.livesPlanned} lives · unique reach ~
                {week.uniqueReach.toLocaleString()} · retro {week.retroIso}
              </p>
              <ul className="space-y-1.5">
                {week.metrics.map((metric) => (
                  <li key={metric.id} className="rounded-lg border border-[#F4EDE3] bg-[#FFFCF7] px-2.5 py-2">
                    <p className="text-xs font-semibold text-[#1F1917]">{metric.label}</p>
                    <p className="text-[11px] font-mono tabular-nums text-[#C2410C]">
                      min {formatScorecardNumber(metric.min, metric.unit)} · target{' '}
                      {formatScorecardNumber(metric.target, metric.unit)} · stretch{' '}
                      {formatScorecardNumber(metric.stretch, metric.unit)}
                    </p>
                    <p className="text-[10px] text-[#6B5344]">{metric.howToMeasure}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-[#F7F1E8] text-[#1F1917] border border-[#E8DFD2] rounded-[2rem] p-6 sm:p-8 shadow-[0_12px_40px_rgba(31,25,23,0.05)] space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] border border-[#C2410C]/30 text-[10px] font-mono font-black uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" /> IP SPRINT & SCHEDULE
        </div>
        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-serif text-[#1F1917]">
          Agile Sprint Roadmap & Delivery Schedule
        </h3>
        <p className="text-sm text-[#3F3832] font-medium leading-relaxed max-w-3xl">
          Phase 1 is the $10,000 gear launch — shirts first, plus About, Contact, Privacy, and Orders on SnatchVault.
          Each sprint creates 3 T-shirt sales videos. Memberships stay Coming Soon until Phase 2. Phase 3 is open for later discussion.
          {canEdit ? ' Add or remove items in each phase. Changes save to this plan and the Word/PDF exports.' : ''}
        </p>
      </div>

      <div id={IP_PHASE_1_ID} className="space-y-4 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h4 className="text-sm font-black uppercase tracking-wider text-[#1F1917] font-serif flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C2410C]" />
            {PHASE_1_LABEL}
            {phase1DateRange() ? <span className="font-mono text-[11px] text-[#C2410C] normal-case">· {phase1DateRange()}</span> : null}
          </h4>
          {renderAddItemButton('phase1_build', 'Add Phase 1 item')}
        </div>
        <div className="hidden lg:flex items-center gap-1 px-2 py-3 bg-white border border-[#E8DFD2] rounded-2xl overflow-x-auto">
          {['Sprint 0', 'Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center min-w-[5.5rem] px-2">
                <span className="text-[9px] font-mono font-black text-[#C2410C] uppercase">{label}</span>
                <span className="text-[8px] font-mono font-black text-[#1F1917] leading-tight text-center">
                  {sprintWindowById(`sprint${i}`)?.dates}
                </span>
                <span className="text-[8px] font-mono text-[#3F3832] tabular-nums">
                  {taskCountsForSprint(tasks, label).done}/{taskCountsForSprint(tasks, label).total} tasks
                </span>
              </div>
              {i < 4 && <div className="h-0.5 flex-1 min-w-[2rem] bg-[#C2410C]/40 rounded-full" />}
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {phase1.filter((i) => i.id.startsWith('sprint')).map((item, idx) => renderSprintCard(item, idx))}
          {phase1.filter((i) => !i.id.startsWith('sprint')).map((item, idx) => renderSprintCard(item, idx))}
        </div>
      </div>

      <div id={IP_PHASE_2_ID} className="space-y-4 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h4 className="text-sm font-black uppercase tracking-wider text-[#1F1917] font-serif flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            {PHASE_2_LABEL}
          </h4>
          {renderAddItemButton('phase2_addons', 'Add Phase 2 item')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phase2.map((item, idx) => renderSprintCard(item, idx))}
        </div>
        <p className="text-sm text-[#3F3832] font-medium">{MEMBERSHIPS_COMING_SOON_NOTE}</p>
      </div>

      <div id={IP_PHASE_3_ID} className="space-y-4 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h4 className="text-sm font-semibold tracking-wider text-[#1F1917] font-serif flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C4A574]" />
            {PHASE_3_LABEL}
          </h4>
          {renderAddItemButton('phase3_future', 'Add Phase 3 item')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phase3.map((item, idx) => renderSprintCard(item, idx))}
        </div>
      </div>
    </div>
  );
};
