import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FileText,
  Shield,
  TestTube,
  CheckSquare,
  Lock,
  ArrowLeft,
  Sparkles,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  UserPlus,
  LogIn,
  AlertCircle,
  ExternalLink,
  Edit3,
  Save,
  DollarSign,
  Percent,
  Eye,
  EyeOff,
  Users,
  User,
  X,
  Share2,
  Video,
  Mail,
  ChevronDown,
  ChevronRight,
  PenLine,
  Phone,
  Mic,
} from 'lucide-react';
import { Logo } from './Logo';
import { MAKE_PAYMENT_TASK_ID, PAY_PAGE_PATH } from '../lib/phasePayments';
import {
  AdminUser,
} from '../lib/adminAuth';
import {
  LOGIN_EMAIL_AUTOCOMPLETE,
  LOGIN_EMAIL_FIELD_NAME,
  LOGIN_FORM_AUTOCOMPLETE,
  LOGIN_PASSWORD_AUTOCOMPLETE,
  LOGIN_PASSWORD_FIELD_NAME,
  emptyAuthCredentials,
} from '../lib/loginFields';
import { PASSWORD_RESET_NOTICE, requestPasswordResetAsync } from '../lib/passwordReset';
import { sendPasswordResetEmail, sendUserApprovedEmail, shouldSendApprovalEmail } from '../lib/email/notifications';
import { SAVED_TO_DATABASE_NOTICE, SAVING_TO_DATABASE_LABEL, SAVE_DATABASE_SKIPPED_NOTICE } from '../lib/logoStore';
import {
  WORKBOARD_SAVE_HINT,
  buildWorkBoardStorePayload,
  fetchWorkBoardStore,
  hydrateWorkBoardFromRemote,
  saveWorkBoardStore,
  shouldApplyRemoteWorkBoardPull,
  WORKBOARD_POLL_MS,
  workBoardFingerprint,
  workBoardHasUnsavedChanges,
  taskRowFingerprint,
  qaRowFingerprint,
  snapshotRowFingerprints,
  workRowHasUnsavedEdits,
} from '../lib/workBoardStore';
import { attachWorkItemFieldAudit } from '../lib/workItemAudit';
import {
  getAppUsers,
  updateUserProfileAsync,
  deleteUserAsync,
  UserRole,
  UserStatus,
  AppUser,
  getRolePermissions,
  getRoleLabel,
  ALL_USER_ROLES,
  registerUserAsync,
  getCurrentUserSession,
  isSuperAdmin,
  canEditUserAsActor,
  NMP_USER_DIRECTORY_LABEL,
  NMP_USER_DIRECTORY_NOTE,
  refreshRemoteUsers,
  loginUserAsync,
  importBrowserUsersToD1,
  hasLocalUsersToImport,
  USER_STATUS_LABELS,
  listPortalTesters,
} from '../lib/userAuth';
import { formatPhoneDisplay, phoneSignupError, phoneTelHref } from '../lib/phoneNumber';
import { rolloverSprint, sprintSelectOptions } from '../lib/sprintRollover';
import {
  FULL_AUDIT_LOG_HEADING,
  USER_AUDIT_EMPTY,
  auditCountForUser,
  auditLogForUser,
  backfillUserAuditFromUsers,
  defaultUserAuditOpen,
  fullAuditLogSummary,
  getUserAuditLog,
  isUserAuditOpen,
  toggleUserAuditOpen,
  userAuditToggleLabel,
} from '../lib/userAuditLog';
import { FullAuditLog, UserAuditEntries } from './UserAuditLog';
import { appUserAsAdminSession, resolvePortalAdminSession } from '../lib/portalSession';
import {
  ANGELA_NIECE_ORIGIN,
  DEFAULT_PROPOSAL_TEXT,
  MUNTIE_EV_BIO,
  PROJECT_OVERVIEW_TEXT,
  ensureAngelaNieceOrigin,
} from '../lib/planIntro';
import { ADMIN_STUDIO_HEADER_CLASS, ADMIN_STUDIO_HEADER_INNER_CLASS, ADMIN_STUDIO_MAIN_CLASS, HEADER_CONTENT_OFFSET } from '../lib/headerClearance';
import { EmailTemplatesPanel } from './EmailTemplatesPanel';
import { LaunchPage } from './LaunchPage';
import { AgendaBoard } from './AgendaBoard';
import { ADD_TO_AGENDA_LABEL, ON_AGENDA_LABEL, syncTaskToUpcomingAgenda } from '../lib/taskAgenda';
import { AdminStudioNav } from './AdminStudioNav';
import { AdminStudioPlaceholder } from './AdminStudioPlaceholder';
import { ComingSoonBadge } from './ComingSoonBadge';
import { BRAND_TAB_ROW_CLASS, brandTabClass } from '../lib/brandUi';
import { GearSelectionsPage } from './GearSelectionsPage';
import { ContentFactoryPage } from './ContentFactoryPage';
import { PostingSchedulePage } from './PostingSchedulePage';
import { AssetLibraryPage } from './AssetLibraryPage';
import { LogoConceptsPage } from './LogoConceptsPage';
import { SiteMapPage } from './SiteMapPage';
import { MakePaymentPage } from './MakePaymentPage';
import { InventoryPricingPage } from './InventoryPricingPage';
import { BetaTestingGuideAdminPage } from './BetaTestingGuideAdminPage';
import type { AdminPortalTab } from '../lib/adminPortalTabs';
import { ADMIN_HUB_TITLE, canOpenStudioTab, isFinancialsTab, mapLegacyAdminTab, type AdminStudioTab } from '../lib/adminStudio';
import {
  PLAN_BUDGET_SECTION_ID,
  PLAN_BUDGET_VERSIONS_ID,
  PLAN_DOWNLOAD_SECTION_DEFAULT_OPEN,
  adminPortalPath,
  canOpenAgendaTab,
  canOpenBudgetTab,
  canOpenPlanTab,
  planPageCardOrder,
  postLoginAdminTab,
  resolveAdminPortalTab,
} from '../lib/planPage';
import {
  CURRENT_BUDGET_FLAT_RATE,
  effectiveBudgetDiscount,
  ensurePreviousBudgetSnapshot,
  formatBudgetTimestamp,
  isPreviousBudgetEdition,
  type PreviousBudgetSnapshot,
} from '../lib/budgetEditions';
import { WorkBoardColumnBar } from './WorkBoardColumnBar';
import { WorkBoardFilterPanel } from './WorkBoardFilterPanel';
import { WorkBoardBulkBar } from './WorkBoardBulkBar';
import { BlockedNoteDialog } from './BlockedNoteDialog';
import { WorkBoardSprintSections, useSprintSectionState } from './WorkBoardSprintSections';
import {
  WorkBoardExpandableRow,
  WorkBoardField,
  WorkBoardFieldGrid,
  WorkBoardHeaderDate,
  WorkBoardHeaderSelect,
  workBoardFieldClassName,
} from './WorkBoardExpandableRow';
import { WorkItemNotesAttachments } from './WorkItemNotesAttachments';
import { WorkItemDescriptionChecklist } from './WorkItemDescriptionChecklist';
import { ProposalSprintChecklist } from './ProposalSprintChecklist';
import { IpSprintSchedulePage } from './IpSprintSchedulePage';
import {
  type SprintDeliverable,
  type DeliverableInput,
  normalizeDeliverables,
  mergeDeliverables,
  deliverableLabelList,
} from '../lib/sprintDeliverables';
import { IP_BRAND_ASSETS_ID } from '../lib/ipToc';
import { toggleExpandedPlan } from '../lib/paymentPlanAccordion';
import { allowDocumentPricing } from '../lib/documentPricing';
import { buildTechStackDocumentHtml } from '../lib/ipTechStack';
import { applyOfficialSprintDates, sprintLabelWithDates } from '../lib/sprintCalendar';
import {
  GEAR_SALES_LINE_ITEMS_SEED,
  LINE_ITEMS_STORAGE_KEY,
  PHASE_1_LABEL,
  PHASE_2_LABEL,
  PHASE_3_LABEL,
  phase1PaidBudgetCopy,
  upgradeDeliverableLabel,
} from '../lib/gearSalesPlan';
import { PaymentScheduleCard } from './PaymentScheduleCard';
import {
  addIpLineItem,
  createBlankIpLineItem,
  keepSavedLineItemCopy,
  mergeMissingDefaultLineItems,
  mergeSavedIpLineItems,
  removeIpLineItem,
  sprintFromBudgetItemId,
  type BudgetItemAssignee,
  type BudgetItemSprint,
  type BudgetItemStatus,
} from '../lib/ipLineItems';
import {
  buildAngelaSignoffDocumentHtml,
  canSignAngelaPlan,
  formatSignoffLine,
  getAngelaPlanSignoff,
  signAngelaPlan,
  type AngelaPlanSignoff,
} from '../lib/planSignoff';
import {
  buildClickableTocHtml,
  buildConfidentialityNoticeHtml,
  buildDeliverableListHtml,
  buildProjectOverviewHtml,
  buildRoadmapDocumentSection,
  hasDuplicatedDeliverableNumbers,
  hasInternalFooterNote,
  hasIpRoadmapByPhaseToc,
  sprintShortLabel,
  tocHasPhaseButton,
  type DocumentSprintCard,
} from '../lib/proposalDocumentRows';
import {
  CLIENT_DISPLAY_NAME,
  CLIENT_EMAIL,
  CLIENT_NAME,
  CLIENT_ROLE,
  replaceLegacyClientDisplayName,
} from '../lib/clientIdentity';
import {
  type TaskItem,
  type QaTestItem,
  type TaskStatus,
  type QaStatus,
  type TaskStatusFilter,
  type QaStatusFilter,
  type SprintCategory,
  type WorkPriority,
  type WorkAssignee,
  type TaskCategory,
  type QaCategory,
  defaultTaskBoardFilters,
  defaultTestingPortalFilters,
  filterTasks,
  filterQaTests,
  isWorkDueDatePast,
  DEFAULT_WORK_BOARD_SORT,
  buildSprintChipCounts,
  buildStatusChipCounts,
  buildPriorityChipCounts,
  buildAssigneeChipCounts,
  buildCategoryChipCounts,
  filtersOmittingSection,
  taskIsDone,
  qaIsDone,
  TASK_STATUSES,
  TASK_STATUS_FILTER_LABELS,
  TASK_STATUS_FILTER_OPTIONS,
  QA_STATUS_FILTER_LABELS,
  QA_STATUS_FILTER_OPTIONS,
  appendRolledOverStatusChip,
  countRolledOverItems,
  formatRolledOverCount,
  QA_STATUSES,
  PRIORITY_OPTIONS,
  ASSIGNOR_OPTIONS,
  testingPortalAssigneeOptions,
  testingPortalHumanAssigneeOptions,
  taskBoardAssigneeOptions,
  assigneeDisplayLabel,
  TASK_CATEGORIES,
  QA_CATEGORIES,
  SPRINT_OPTIONS,
  TASK_STATUS_LABELS,
  QA_STATUS_LABELS,
  QA_STATUS_SHORT_LABELS,
  PRIORITY_LABELS,
  ASSIGNEE_LABELS,
  applyTaskInlinePatch,
  applyQaInlinePatch,
  applyTasksBlockedWithNote,
  taskNeedsBlockedNote,
  currentSprintLabel,
  defaultOpenSprintSections,
  SPRINT_SECTION_TONES,
  FILTER_SECTION_TONES,
  TASK_STATUS_TONES,
  QA_STATUS_TONES,
  TASK_STATUS_SWATCH,
  sprintControlClass,
  QA_STATUS_SWATCH,
  taskStatusRowClass,
  qaStatusRowClass,
  taskStatusLegend,
  qaStatusLegend,
  PRIORITY_TONES,
  workDueDateTextClass,
  workDueDateControlClass,
  toggleSelectedId,
  setManySelected,
  allIdsSelected,
  type TaskInlinePatch,
  type QaInlinePatch,
  type WorkPhase,
  type WorkBoardSort,
  PHASE_OPTIONS,
  PHASE_LABELS,
  toggleWorkItemOpen,
  collapseWorkItemsInSprint,
  markWorkItemDirty,
  workItemIsDirty,
  anyWorkItemsDirty,
  workBoardSaveButtonTone,
  SAVE_ALL_LABEL,
  formatTaskCode,
  formatQaCode,
  nextTaskId,
  workAssigneeFromActor,
  normalizeAssignor,
} from '../lib/workBoard';
import {
  buildSuiteChipCounts,
  defaultQaSuiteFilter,
  isAutomatedQaTest,
  matchesSuiteFilter,
  suiteForQaTest,
  SUITE_LABELS,
  type TestSuite,
} from '../lib/testSuites';
import { PLAYWRIGHT_COMMAND, VITEST_COMMAND } from '../lib/automatedTests';

interface AdminPortalProps {
  onBackToStore: () => void;
  initialTab?: AdminPortalTab;
}

interface SprintLineItem {
  id: string;
  name: string;
  phase: 'phase1_build' | 'phase2_addons' | 'phase3_future';
  duration?: string;
  dates?: string;
  summary?: string;
  deliverables?: SprintDeliverable[];
  description: string;
  notes?: string;
  sprint?: BudgetItemSprint;
  status?: BudgetItemStatus;
  assignee?: BudgetItemAssignee;
  hours: number;
  rate: number;
  baseAmount: number;
  visible?: boolean;
}

type LineItemSeed = Omit<SprintLineItem, 'deliverables'> & { deliverables?: DeliverableInput[] };

const DEFAULT_LINE_ITEMS_SEED: LineItemSeed[] = GEAR_SALES_LINE_ITEMS_SEED as LineItemSeed[];
function normalizeLineItem(item: LineItemSeed): SprintLineItem {
  return applyOfficialSprintDates({
    ...item,
    notes: item.notes ?? '',
    sprint: item.sprint ?? sprintFromBudgetItemId(item.id),
    status: item.status ?? 'not_started',
    assignee: item.assignee ?? 'unassigned',
    deliverables: normalizeDeliverables(item.id, item.deliverables).map((entry) => ({
      ...entry,
      label: upgradeDeliverableLabel(entry.label),
    })),
  });
}

const DEFAULT_LINE_ITEMS: SprintLineItem[] = DEFAULT_LINE_ITEMS_SEED.map(normalizeLineItem);

function mergeLineItemsWithDefaults(saved: LineItemSeed[] | null): SprintLineItem[] {
  const merged = mergeSavedIpLineItems(saved, DEFAULT_LINE_ITEMS_SEED, (d, s) => {
    if (!d) return s;
    const kept = keepSavedLineItemCopy(d, s);
    return {
      ...kept,
      deliverables: mergeDeliverables(s.id, d.deliverables, s.deliverables),
    };
  });
  return mergeMissingDefaultLineItems(merged, DEFAULT_LINE_ITEMS_SEED).map(normalizeLineItem);
}

interface ProposalVersion {
  id: string;
  name: string;
  savedAt: string;
  proposalViewPhase: 'all' | 'phase1' | 'phase2' | 'phase3' | 'split';
  selectedDiscountTier: number;
  proposalNotes: string;
  lineItems: SprintLineItem[];
  showPricing?: boolean;
}

const PROPOSAL_PHASE_LABELS: Record<ProposalVersion['proposalViewPhase'], string> = {
  all: 'All three phases',
  phase1: PHASE_1_LABEL,
  phase2: PHASE_2_LABEL,
  phase3: PHASE_3_LABEL,
  split: 'Side-by-side phases',
};

const DISCOUNT_TIERS = [0, 10, 15, 20, 25] as const;

function getPaymentMilestones(
  discountTier: number,
  discountedTotal: number,
): { label: string; amount: number }[] {
  switch (discountTier) {
    case 0:
      return [
        { label: 'Phase 1 payment (40%)', amount: discountedTotal * 0.4 },
        { label: 'Phase 2 payment (30%)', amount: discountedTotal * 0.3 },
        { label: 'Phase 3 payment (30%)', amount: discountedTotal * 0.3 },
      ];
    case 10:
      return [
        { label: '1/3 Down Payment', amount: discountedTotal / 3 },
        { label: '40% at Sprint 3', amount: discountedTotal * 0.4 },
        { label: '26.7% at Launch', amount: discountedTotal * 0.2667 },
      ];
    case 15:
      return [
        { label: '50% Down Payment', amount: discountedTotal / 2 },
        { label: '50% at Launch', amount: discountedTotal / 2 },
      ];
    case 20:
      return [
        { label: '60% Down Payment', amount: discountedTotal * 0.6 },
        { label: '40% at Launch', amount: discountedTotal * 0.4 },
      ];
    case 25:
      return [{ label: '100% Paid Upfront', amount: discountedTotal }];
    default:
      return [{ label: 'Full Payment', amount: discountedTotal }];
  }
}

interface DiscountSchedulePanelProps {
  idPrefix: string;
  selectedDiscountTier: number;
  onSelectTier: (tier: number) => void;
  phase1BaseTotal: number;
  phase2BaseTotal: number;
  activeScopeBaseTotal: number;
  formatUsd: (amount: number) => string;
  getDiscountedTotal: (discountPercent: number, basePrice?: number) => number;
  showPricing: boolean;
  scopeLabel: string;
}

function DiscountSchedulePanel({
  idPrefix,
  selectedDiscountTier,
  onSelectTier,
  phase1BaseTotal,
  phase2BaseTotal,
  activeScopeBaseTotal,
  formatUsd,
  getDiscountedTotal,
  showPricing,
  scopeLabel,
}: DiscountSchedulePanelProps) {
  const [expandedPlans, setExpandedPlans] = useState<string[]>([]);
  const combinedBase = phase1BaseTotal + phase2BaseTotal;
  const phase1Discounted = getDiscountedTotal(selectedDiscountTier, phase1BaseTotal);
  const phase2Discounted = getDiscountedTotal(selectedDiscountTier, phase2BaseTotal);
  const combinedDiscounted = getDiscountedTotal(selectedDiscountTier, combinedBase);
  const activeDiscounted = getDiscountedTotal(selectedDiscountTier, activeScopeBaseTotal);
  const activeSaved = activeScopeBaseTotal - activeDiscounted;

  const phaseCards = [
    {
      key: 'phase1',
      title: 'Phase 1 â€” Core Build',
      subtitle: 'Sprints 0â€“4 + Architecture',
      base: phase1BaseTotal,
      discounted: phase1Discounted,
      border: 'border-[#C2410C]',
      headerBg: 'bg-[#FFEDD5]',
      titleColor: 'text-[#C2410C]',
    },
    {
      key: 'phase2',
      title: 'Phase 2 â€” Add-Ons',
      subtitle: 'Social, Content Factory & Retainers',
      base: phase2BaseTotal,
      discounted: phase2Discounted,
      border: 'border-[#10B981]',
      headerBg: 'bg-emerald-50',
      titleColor: 'text-emerald-800',
    },
    {
      key: 'combined',
      title: 'Combined Master Package',
      subtitle: 'Phase 1 + Phase 2 Total',
      base: combinedBase,
      discounted: combinedDiscounted,
      border: 'border-[#FDBA74]',
      headerBg: 'bg-gradient-to-r from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7]',
      titleColor: 'text-[#9A3412]',
    },
  ];

  const togglePlan = (key: string) => {
    setExpandedPlans((prev) => {
      const next = toggleExpandedPlan(prev, key);
      // #region agent log
      fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'P',location:'AdminPortal.tsx:togglePlan',message:'Payment plan dropdown toggled',data:{idPrefix,key,expanded:next.includes(key),expandedPlans:next,selectedDiscountTier},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return next;
    });
  };

  return (
    <div className="bg-[#FAF8F5] border-2 border-[#1F1917] rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <div className="text-xs font-mono font-black uppercase text-[#1F1917] mb-2 flex items-center justify-between gap-2">
            <span>Executive Pre-Payment Discount Schedule</span>
            <span className="text-[10px] text-[#C2410C] font-bold shrink-0">25% Off for 100% Upfront</span>
          </div>
          <div className={BRAND_TAB_ROW_CLASS} role="tablist" aria-label="Pre-payment discount">
            {DISCOUNT_TIERS.map((tier) => (
              <button
                key={`${idPrefix}-tier-${tier}`}
                type="button"
                role="tab"
                aria-selected={selectedDiscountTier === tier}
                onClick={() => onSelectTier(tier)}
                className={brandTabClass(selectedDiscountTier === tier)}
              >
                {tier === 25 ? '25% OFF (100% Upfront)' : `${tier}% OFF`}
              </button>
            ))}
          </div>
        </div>

        {showPricing && (
          <div className="bg-[#FFEDD5] border border-[#C2410C]/40 rounded-xl p-4 text-right space-y-1">
            <div className="text-[10px] font-mono text-[#3F3832] uppercase font-bold">
              Active View Base: {formatUsd(activeScopeBaseTotal)}
            </div>
            <div className="text-2xl font-black text-[#C2410C] font-mono">{formatUsd(activeDiscounted)}</div>
            {selectedDiscountTier > 0 && (
              <div className="text-[10px] text-[#065F46] font-mono font-black">
                Amount Saved: {formatUsd(activeSaved)} ({selectedDiscountTier}% off)
              </div>
            )}
            <div className="text-[10px] text-[#1F1917] font-mono font-bold pt-1 border-t border-[#C2410C]/20 mt-2 space-y-0.5">
              <div>Phase 1: {formatUsd(phase1Discounted)}</div>
              <div>Phase 2: {formatUsd(phase2Discounted)}</div>
              <div className="font-black text-[#C2410C]">Combined: {formatUsd(combinedDiscounted)}</div>
            </div>
            <div className="text-[10px] text-[#3F3832] font-mono">{scopeLabel}</div>
          </div>
        )}
      </div>

      {showPricing && (
        <div className="space-y-2 border-t border-[#E5DFD3] pt-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#C2410C]" />
            <h4 className="text-sm font-black text-[#1F1917] uppercase font-serif">
              Payment Plan Selections ({selectedDiscountTier}% Pre-Payment Tier)
            </h4>
          </div>
          <p className="text-[11px] text-[#3F3832] font-medium">
            Open a plan below to expand its payment schedule for the selected pre-payment discount.
          </p>
          <div className="space-y-2">
            {phaseCards.map((phase) => {
              const isOpen = expandedPlans.includes(phase.key);
              const saved = phase.base - phase.discounted;
              const milestones = getPaymentMilestones(selectedDiscountTier, phase.discounted);
              return (
                <div
                  key={`${idPrefix}-${phase.key}`}
                  className={`rounded-xl border-2 ${phase.border} bg-white overflow-hidden shadow-sm`}
                  data-testid={`payment-plan-dropdown-${phase.key}`}
                >
                  <button
                    type="button"
                    onClick={() => togglePlan(phase.key)}
                    aria-expanded={isOpen}
                    className={`w-full min-h-[44px] px-3 py-2 ${phase.headerBg} flex items-center justify-between gap-3 text-left cursor-pointer`}
                  >
                    <span className="min-w-0">
                      <span className={`block text-xs font-black uppercase font-serif ${phase.titleColor}`}>{phase.title}</span>
                      <span className="block text-[10px] font-mono text-[#C2410C]">
                        {phase.subtitle}
                      </span>
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 shrink-0 text-[#EA580C]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0 text-[#EA580C]" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-3 space-y-2 border-t border-[#E5DFD3]">
                      <div className="flex justify-between text-[10px] font-mono text-[#3F3832]">
                        <span>Base</span>
                        <span className="font-bold">{formatUsd(phase.base)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-mono font-black uppercase text-[#1F1917]">Discounted Total</span>
                        <span className="text-lg font-black text-[#C2410C] font-mono tabular-nums">{formatUsd(phase.discounted)}</span>
                      </div>
                      {selectedDiscountTier > 0 && (
                        <div className="text-[10px] text-[#065F46] font-mono font-black">
                          Save {formatUsd(saved)} ({selectedDiscountTier}% off)
                        </div>
                      )}
                      <div className="pt-2 border-t border-[#E5DFD3] space-y-1">
                        <div className="text-[9px] font-mono font-black uppercase text-[#3F3832] tracking-wider">Payment Schedule</div>
                        {milestones.map((m) => (
                          <div key={m.label} className="flex justify-between gap-2 text-[11px] text-[#1F1917]">
                            <span className="text-[#3F3832]">â€¢ {m.label}</span>
                            <span className="font-mono font-bold tabular-nums shrink-0">{formatUsd(m.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function escapeProposalHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildProposalDocumentHtml(params: {
  proposalNotes: string;
  visibleItems: SprintLineItem[];
  totalBasePrice: number;
  selectedDiscountTier: number;
  discountedTotalFormatted: string;
  phaseLabel: string;
  logoUrl: string;
  showPricing: boolean;
  angelaSignoff?: AngelaPlanSignoff | null;
}): string {
  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const notesHtml = params.proposalNotes.includes('<')
    ? params.proposalNotes
    : escapeProposalHtml(params.proposalNotes).replace(/\n/g, '<br/>');

  const docTitle = params.showPricing
    ? 'MY PLAN, NOT MY MOOD — Master Implementation Proposal &amp; Budget'
    : 'MY PLAN, NOT MY MOOD — Master Implementation Plan';
  const subtitle = params.showPricing
    ? 'Official Brand Architecture &amp; Budget Proposal'
    : 'Official Brand Architecture &amp; Implementation Plan';
  const tableHead = 'Sprint Dates';
  const roadmapCards: DocumentSprintCard[] = params.visibleItems.map((item) => {
    const deliverables = normalizeDeliverables(item.id, item.deliverables);
    return {
      id: item.id,
      shortLabel: escapeProposalHtml(sprintShortLabel(item.id)),
      name: escapeProposalHtml(item.name),
      dates: escapeProposalHtml(item.dates || 'Date TBD'),
      duration: escapeProposalHtml(item.duration || ''),
      summary: escapeProposalHtml(item.summary || ''),
      description: escapeProposalHtml(item.description || ''),
      deliverableHtml: buildDeliverableListHtml(
        deliverables.map((d) => `${escapeProposalHtml(d.label)}${d.completed ? ' âœ“' : ''}`),
      ),
      priceLabel: params.showPricing ? `$${item.baseAmount.toLocaleString()}` : undefined,
      phase: item.phase,
    };
  });
  const tocHtml = buildClickableTocHtml(roadmapCards);
  const techHtml = buildTechStackDocumentHtml();
  const tableRows = buildRoadmapDocumentSection(roadmapCards);
  const signoffHtml = params.showPricing ? '' : buildAngelaSignoffDocumentHtml(params.angelaSignoff ?? null);

  const totalBox = params.showPricing
    ? `<div class="total-box">
      <p style="margin: 0; font-size: 12px; color: #3F3832; font-weight: bold;">Active Scope Base Total: $${params.totalBasePrice.toLocaleString()}</p>
      <h2 style="margin: 6px 0 0 0; color: #C2410C; font-size: 22px; font-weight: 900; border: none; padding: 0;">
        Selected Pre-Payment Tier (${params.selectedDiscountTier}% Off): ${params.discountedTotalFormatted}
      </h2>
    </div>`
    : '';

  const overviewHtml = buildProjectOverviewHtml({
    overviewText: escapeProposalHtml(PROJECT_OVERVIEW_TEXT),
    execSummaryHtml: notesHtml,
    originStory: escapeProposalHtml(ANGELA_NIECE_ORIGIN),
    partnerBio: escapeProposalHtml(MUNTIE_EV_BIO),
  });
  const confidentialHtml = buildConfidentialityNoticeHtml(params.showPricing);
  // #region agent log
  fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'pre-fix',hypothesisId:'D',location:'AdminPortal.tsx:buildProposalDocumentHtml',message:'Exported Implementation Plan footer pricing',data:{showPricing:params.showPricing,hasTotalBox:Boolean(params.showPricing),confidentialMentionsBudget:confidentialHtml.includes('budget'),confidentialMentionsPricing:confidentialHtml.includes('pricing')},timestamp:Date.now()})}).catch(()=>{});
  fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'F',location:'AdminPortal.tsx:buildProposalDocumentHtml:client',message:'Document client identity',data:{preparedFor:CLIENT_DISPLAY_NAME,clientEmail:CLIENT_EMAIL,legacyMuntieEvOnAngela:false},timestamp:Date.now()})}).catch(()=>{});
  fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'N',location:'AdminPortal.tsx:buildProposalDocumentHtml:rows',message:'Word/PDF sprint rows numbering and dates',data:{duplicatedNumbers:hasDuplicatedDeliverableNumbers(tableRows),hasSprintDatesColumn:tableHead.includes('Sprint Dates'),rowCount:params.visibleItems.length},timestamp:Date.now()})}).catch(()=>{});
  fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'O',location:'AdminPortal.tsx:buildProposalDocumentHtml:roadmap',message:'Word/PDF uses IP Roadmap boxed layout',data:{hasPhaseBoxes:tableRows.includes('IP Roadmap by Phase'),hasDeliveryCards:tableRows.includes('sprint-card'),hasTimeline:tableRows.includes('timeline-node')},timestamp:Date.now()})}).catch(()=>{});
  fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'P',location:'AdminPortal.tsx:buildProposalDocumentHtml:toc-header',message:'Word/PDF header logo TOC and footer note',data:{logoHeightPx:148,headerInline:true,tocHasPhase1:tocHtml.includes('href="#doc-phase-1"'),tocHasPhase2:tocHtml.includes('href="#doc-phase-2"'),tocHasSprint0:tocHtml.includes('href="#doc-sprint0"') || tocHtml.includes('href="#doc-sprint-0"'),footerHasInternalNote:hasInternalFooterNote(confidentialHtml),documentOmitsConfidentialBox:false},timestamp:Date.now()})}).catch(()=>{});
  fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'Q',location:'AdminPortal.tsx:buildProposalDocumentHtml:tech',message:'Word/PDF includes IP technologies section',data:{hasTechSection:techHtml.includes('id="doc-tech-stack"'),hasReact:techHtml.includes('React 18'),hasSupabase:techHtml.includes('Supabase'),hasStripe:techHtml.includes('Stripe'),tocLinksTech:tocHtml.includes('href="#doc-tech-stack"')},timestamp:Date.now()})}).catch(()=>{});
  fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'R',location:'AdminPortal.tsx:buildProposalDocumentHtml:cover',message:'First page is header plus TOC without Phase 1 button',data:{hasCoverPage:true,hasPageBreakAfterCover:true,headerHasPhaseBadge:false,tocHasPhaseButton:tocHasPhaseButton(tocHtml),tocIsList:tocHtml.includes('toc-list'),sprint0Dates:params.visibleItems.find((i)=>i.id==='sprint0')?.dates??null},timestamp:Date.now()})}).catch(()=>{});
  fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'S',location:'AdminPortal.tsx:buildProposalDocumentHtml:living-signoff',message:'Living document header and Angela sign-off block',data:{hasLivingDocument:true,hasIpRoadmapByPhase:hasIpRoadmapByPhaseToc(tocHtml),hasRoadmapAfterCover:true,isAngelaPlan:!params.showPricing,hasSignoffBlock:Boolean(signoffHtml),signoffIsSigned:Boolean(params.angelaSignoff)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${docTitle}</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1F1917; background: #FAF8F5; line-height: 1.5; margin: 0; }
      .header-banner { background: #ffffff; border: 3px solid #1F1917; border-radius: 16px; padding: 20px 24px; text-align: left; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .header-inline { width: 100%; border-collapse: collapse; }
      .logo-cell { width: 168px; padding-right: 20px; }
      .logo-img { height: 148px; width: auto; display: block; margin: 0; }
      .header-copy { vertical-align: middle; }
      .brand-title { color: #1F1917; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
      .brand-title span { color: #C2410C; font-style: italic; }
      .subtitle { color: #3F3832; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
      .cover-page { page-break-after: always; break-after: page; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; padding-top: 14px; border-top: 2px solid #E5DFD3; text-align: left; font-size: 11px; }
      .living-doc { display: inline-block; margin-top: 10px; padding: 5px 12px; background: #FFEDD5; border: 2px solid #C2410C; border-radius: 999px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #C2410C; }
      .toc-grid { border-collapse: separate; border-spacing: 10px 0; }
      .toc-box { background: #FAF8F5; border: 2px solid #1F1917; border-radius: 16px; padding: 14px; }
      .toc-label { color: #C2410C; font-size: 10px; font-weight: 900; text-transform: uppercase; }
      .toc-sub { font-size: 14px; font-weight: 900; text-transform: uppercase; margin-top: 4px; }
      .toc-chip { display: inline-block; background: #ffffff; border: 1px solid #E5DFD3; border-radius: 8px; padding: 2px 8px; font-size: 9px; font-weight: 900; text-transform: uppercase; margin: 6px 4px 0 0; }
      h2 { color: #1F1917; font-size: 16px; margin-top: 28px; font-weight: 900; border-bottom: 3px solid #C2410C; padding-bottom: 6px; text-transform: uppercase; }
      h2.plain { border: none; padding: 0; margin: 0 0 8px 0; }
      h2.plain.light { color: #ffffff; }
      p { font-size: 12px; }
      .toc-banner { background: #ffffff; border: 3px solid #1F1917; border-radius: 20px; padding: 20px; margin: 24px 0; }
      .schedule-banner { background: #1F1917; color: #ffffff; border: 3px solid #C2410C; border-radius: 20px; padding: 20px; margin: 24px 0; }
      .kicker { display: inline-block; background: #FFEDD5; color: #C2410C; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 4px 10px; border-radius: 10px; margin-bottom: 8px; }
      .kicker.light { background: #C2410C; color: #ffffff; }
      .lede { color: #3F3832; font-size: 12px; margin: 0 0 14px 0; }
      .lede.light { color: #FFEDD5; }
      .toc-link { color: #1F1917; text-decoration: none; border-bottom: 1px dotted #C2410C; }
      .chip { display: inline-block; background: #ffffff; border: 1px solid #E5DFD3; border-radius: 8px; padding: 2px 8px; font-size: 9px; font-weight: 900; text-transform: uppercase; margin: 6px 4px 0 0; }
      .subphase-head { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #3F3832; margin: 14px 0 8px 0; }
      .tech-banner { background: #ffffff; border: 3px solid #1F1917; border-radius: 20px; padding: 20px; margin: 24px 0; }
      .tech-table { border-collapse: collapse; width: 100%; }
      .tech-table th { font-size: 10px; text-transform: uppercase; color: #C2410C; border-bottom: 2px solid #1F1917; padding: 8px 6px; }
      .tech-table td { font-size: 11px; border-bottom: 1px solid #E5DFD3; padding: 8px 6px; vertical-align: top; }
      .tech-cat { font-weight: 900; text-transform: uppercase; color: #C2410C; width: 22%; }
      .tech-name { font-weight: 800; width: 34%; }
      .tech-purpose { color: #3F3832; }
      .phase-head { font-size: 13px; font-weight: 900; text-transform: uppercase; margin: 22px 0 10px 0; }
      .phase-head.phase2 { color: #B45309; }
      .timeline { margin: 0 0 14px 0; background: #FAF8F5; border: 2px solid #E5DFD3; border-radius: 14px; }
      .timeline-node { text-align: center; font-size: 9px; font-weight: 900; text-transform: uppercase; color: #C2410C; padding: 10px 4px; }
      .timeline-date { display: block; font-size: 8px; font-weight: 700; color: #1F1917; text-transform: none; margin-top: 4px; }
      .timeline-line { border-top: 2px solid #FDBA74; width: 8%; }
      .card-grid { border-collapse: separate; }
      .sprint-card { background: #ffffff; border: 2px solid #1F1917; border-radius: 16px; padding: 14px; }
      .sprint-kicker { color: #C2410C; font-size: 9px; font-weight: 900; text-transform: uppercase; }
      .sprint-title { font-size: 12px; font-weight: 900; text-transform: uppercase; margin: 4px 0 8px 0; }
      .card-summary { font-size: 11px; font-weight: 700; color: #1F1917; margin: 8px 0 4px 0; }
      .card-desc { font-size: 10px; color: #3F3832; margin: 0 0 8px 0; }
      .deliverable-list { margin: 8px 0 0 0; padding: 8px 0 0 0; border-top: 1px solid #E5DFD3; list-style: none; }
      .deliverable-list li { font-size: 10px; color: #3F3832; margin: 0 0 4px 0; }
      .check { color: #10B981; font-weight: 900; }
      .card-price { margin-top: 10px; font-size: 13px; font-weight: 900; color: #C2410C; text-align: right; }
      .total-box { background: #FFEDD5; border: 3px solid #C2410C; border-radius: 16px; padding: 20px; margin-top: 24px; text-align: right; }
      .footer-banner { margin-top: 40px; border-top: 2px solid #1F1917; padding-top: 18px; text-align: center; }
      .powered-badge { display: inline-flex; align-items: center; gap: 8px; font-weight: 900; font-size: 12px; color: #1F1917; text-transform: uppercase; background: #ffffff; border: 2px solid #1F1917; padding: 6px 16px; border-radius: 50px; }
      .signoff-box { background: #ffffff; border: 3px solid #10B981; border-radius: 20px; padding: 20px; margin: 28px 0 0 0; }
      .signed-line { font-size: 12px; font-weight: 800; color: #065F46; }
      .script-sign { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 28px; color: #1F1917; margin-top: 8px; }
      .sign-line { margin-top: 18px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; }
      .header-badge { display: inline-block; margin-top: 8px; background: #1F1917; color: #ffffff; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 999px; }
      .overview-box { background: #ffffff; border: 3px solid #1F1917; border-radius: 20px; padding: 20px; margin: 0 0 24px 0; }
      .overview-body { font-size: 12px; color: #1F1917; }
      .confidential-box { background: #FFF7ED; border: 2px solid #C2410C; border-radius: 16px; padding: 16px; margin-top: 20px; text-align: left; }
      .confidential-kicker { color: #C2410C; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
      .confidential-box p { font-size: 10px; color: #3F3832; margin: 0; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="cover-page">
      <div class="header-banner">
        <table class="header-inline" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td class="logo-cell" valign="middle">
              <img src="${params.logoUrl}" alt="MY PLAN, NOT MY MOOD Logo Seal" class="logo-img" onerror="this.style.display='none'" />
            </td>
            <td class="header-copy" valign="middle">
              <div class="brand-title">MY PLAN, <span>NOT MY MOOD</span></div>
              <div class="subtitle">${subtitle}</div>
              <div class="living-doc">Living Document â€” updates as sprints land</div>
              <div class="header-badge">Confidential &amp; Proprietary</div>
            </td>
          </tr>
        </table>
        <div class="meta-grid">
          <div><strong>Prepared For:</strong> ${CLIENT_DISPLAY_NAME}</div>
          <div style="text-align: right;"><strong>Date:</strong> ${todayStr}</div>
          <div><strong>${CLIENT_ROLE}:</strong> ${CLIENT_NAME} &nbsp;Â·&nbsp; <strong>Email:</strong> <a href="mailto:${CLIENT_EMAIL}">${CLIENT_EMAIL}</a></div>
          <div style="text-align: right;"><strong>Technical Execution Partner:</strong> Muntie Ev's AI Agents</div>
        </div>
      </div>
      ${tocHtml}
    </div>

    ${overviewHtml}

    ${tableRows}

    ${techHtml}

    ${totalBox}
    ${signoffHtml}

    <div class="footer-banner">
      <div class="powered-badge">
        <span>Powered by Munties AI Agents</span>
        <span style="color: #C2410C;">â€¢ www.MuntiesAIAgents.com/MyPlan</span>
      </div>
      <p style="margin: 12px 0 0 0; font-size: 11px; font-weight: 700; color: #1F1917;">
        ${CLIENT_ROLE}: ${CLIENT_NAME} &nbsp;Â·&nbsp; Email: <a href="mailto:${CLIENT_EMAIL}">${CLIENT_EMAIL}</a>
      </p>
      ${confidentialHtml}
    </div>
  </body>
</html>`;
}

function wrapProposalHtmlWithPdfToolbar(html: string, autoSave = false): string {
  const toolbarHtml = `
      <div id="pdf-toolbar" style="position:sticky;top:0;z-index:9999;background:#1F1917;color:#fff;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #C2410C;font-family:Segoe UI,Arial,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
        <span style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;">MY PLAN, NOT MY MOOD â€” PDF Preview</span>
        <div style="display:flex;gap:10px;align-items:center;">
          <button type="button" id="pdf-view-btn" style="background:#FAF8F5;color:#1F1917;border:2px solid #fff;padding:10px 18px;font-weight:900;border-radius:10px;cursor:pointer;font-size:12px;text-transform:uppercase;">View</button>
          <button type="button" id="pdf-save-btn" style="background:#C2410C;color:#fff;border:2px solid #fff;padding:10px 18px;font-weight:900;border-radius:10px;cursor:pointer;font-size:12px;text-transform:uppercase;">Save PDF</button>
        </div>
      </div>
      <style>@media print { #pdf-toolbar { display: none !important; } body { padding-top: 0 !important; } }</style>
      <script>
        (function () {
          function scrollToDocumentTop() {
            window.scrollTo(0, 0);
          }
          function saveAsPdf() {
            window.print();
          }
          document.getElementById('pdf-view-btn')?.addEventListener('click', scrollToDocumentTop);
          document.getElementById('pdf-save-btn')?.addEventListener('click', saveAsPdf);
          ${autoSave ? 'window.addEventListener("load", function () { setTimeout(saveAsPdf, 500); });' : ''}
        })();
      </script>
    `;
  return html.replace(/<body([^>]*)>/i, `<body$1>${toolbarHtml}`);
}

function openProposalPdfWindow(html: string, autoSave: boolean): Window | null {
  const enhancedHtml = wrapProposalHtmlWithPdfToolbar(html, autoSave);
  const blob = new Blob([enhancedHtml], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const pdfWindow = window.open(blobUrl, '_blank', 'width=1280,height=920');
  if (pdfWindow) {
    pdfWindow.focus();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } else {
    URL.revokeObjectURL(blobUrl);
  }
  return pdfWindow;
}

function WorkBoardPersistBar({
  notice,
  saving,
  onSave,
  canSave,
}: {
  notice: string;
  saving: boolean;
  onSave: () => void;
  canSave: boolean;
}) {
  const saveEnabled = Boolean(canSave);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
      <p className="text-xs font-semibold text-[#3F281C]" data-testid="workboard-persist-notice">
        {notice || WORKBOARD_SAVE_HINT}
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={!saveEnabled}
        data-testid="workboard-save"
        className={`min-h-[44px] min-w-[44px] px-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-wide inline-flex items-center justify-center gap-1.5 shrink-0 ${workBoardSaveButtonTone(saveEnabled)}`}
      >
        <Save className="w-3.5 h-3.5" /> {saving ? SAVING_TO_DATABASE_LABEL : SAVE_ALL_LABEL}
      </button>
    </div>
  );
}

function WorkBoardStatusLegend({
  items,
  testId,
}: {
  items: Array<{ id: string; label: string; className: string }>;
  testId: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid={testId} aria-label="Status colors">
      {items.map((item) => (
        <span
          key={item.id}
          className={`inline-flex items-center min-h-[32px] px-2.5 rounded-lg border-2 text-[10px] font-black uppercase tracking-wide ${item.className}`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function WorkBoardCollapsibleSummary({
  title,
  countLabel,
  percentLabel,
  open,
  onToggle,
  children,
  testId,
}: {
  title: string;
  countLabel: string;
  percentLabel: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <section className="bg-[#F5D4A8] text-[#4A2C14] border-2 border-[#E8B87A] rounded-3xl shadow-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        data-testid={testId}
        className="w-full min-h-[52px] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-left cursor-pointer"
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          {open ? <ChevronDown className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
          <span className="text-[10px] sm:text-sm font-sans font-black uppercase tracking-wide text-[#5C3310]">
            {title}
          </span>
          <span className="text-base sm:text-xl font-black font-serif uppercase truncate" data-testid={`${testId}-count`}>
            {countLabel}
          </span>
        </span>
        <span className="px-3 py-1 bg-[#FAF0DE] text-[#4A2C14] rounded-xl font-black font-mono text-xs uppercase shadow-sm border border-[#E8B87A] shrink-0">
          {percentLabel}
        </span>
      </button>
      {open ? (
        <div className="px-5 pb-5 space-y-3 border-t border-[#E8B87A]/70">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStore, initialTab }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => resolvePortalAdminSession());
  const [activeTab, setActiveTab] = useState<AdminPortalTab>(() => resolveAdminPortalTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      setActiveTab(resolveAdminPortalTab(initialTab));
    }
  }, [initialTab]);

  useEffect(() => {
    const permissions = getRolePermissions(getCurrentUserSession() ?? currentUser);
    const resolved = resolveAdminPortalTab(activeTab);
    if (resolved === 'plan' && !canOpenPlanTab(permissions.canViewProposal, permissions.canViewIP)) {
      setActiveTab(permissions.canViewTesting ? 'testing' : 'tasks');
    }
    if (!permissions.canManageUsers && activeTab === 'users') {
      setActiveTab(permissions.canViewTesting ? 'testing' : 'tasks');
    }
    if (!permissions.canManageEmailTemplates && (activeTab === 'emails' || activeTab === 'mailing-list')) {
      setActiveTab(permissions.canViewTesting ? 'testing' : 'tasks');
    }
    if ((activeTab === 'budget' || activeTab === 'pay' || activeTab === 'previous-budget' || activeTab === 'inventory-pricing') && !canOpenBudgetTab(permissions.canViewBudget)) {
      setActiveTab(canOpenPlanTab(permissions.canViewProposal, permissions.canViewIP) ? 'plan' : 'testing');
    }
    if (activeTab === 'agenda' && !canOpenAgendaTab(permissions.canViewAgenda)) {
      setActiveTab(canOpenPlanTab(permissions.canViewProposal, permissions.canViewIP) ? 'plan' : 'testing');
    }
    if (activeTab === 'memberships' && !canOpenStudioTab('memberships', permissions)) {
      setActiveTab(canOpenPlanTab(permissions.canViewProposal, permissions.canViewIP) ? 'plan' : 'testing');
    }
    if (
      (activeTab === 'factory' ||
        activeTab === 'calendar' ||
        activeTab === 'gear-selections' ||
        activeTab === 'asset-library' ||
        activeTab === 'logo-concepts') &&
      !permissions.canManageContentFactory
    ) {
      setActiveTab(canOpenPlanTab(permissions.canViewProposal, permissions.canViewIP) ? 'plan' : 'testing');
    }
  }, [currentUser, activeTab]);

  const selectAdminTab = (tab: AdminPortalTab) => {
    if (tab === 'budget' || tab === 'pay' || tab === 'previous-budget' || tab === 'inventory-pricing') {
      setProposalAudience('internal');
      localStorage.setItem('myplan_proposal_audience', 'internal');
    }
    setActiveTab(tab);
    const dest = adminPortalPath(tab);
    const hash = window.location.hash;
    if (window.location.pathname !== dest) {
      window.history.pushState({}, '', `${dest}${tab === 'tasks' ? hash : ''}`);
    }
  };

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'forgot'>('login');
  const [emailInput, setEmailInput] = useState(emptyAuthCredentials().email);
  const [passInput, setPassInput] = useState(emptyAuthCredentials().password);
  const [showPassword, setShowPassword] = useState(false);
  const [blockAutofill, setBlockAutofill] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    if (!currentUser) {
      const blank = emptyAuthCredentials();
      setEmailInput(blank.email);
      setPassInput(blank.password);
      setBlockAutofill(true);
    }
  }, [currentUser]);

  // Proposal State
  const [lineItems, setLineItems] = useState<SprintLineItem[]>(() => {
    try {
      const saved = localStorage.getItem(LINE_ITEMS_STORAGE_KEY);
      return mergeLineItemsWithDefaults(saved ? JSON.parse(saved) : null);
    } catch {
      return mergeLineItemsWithDefaults(null);
    }
  });
  const [previousBudget] = useState<PreviousBudgetSnapshot>(() => ensurePreviousBudgetSnapshot());

  useEffect(() => {
    localStorage.setItem(LINE_ITEMS_STORAGE_KEY, JSON.stringify(lineItems));
  }, [lineItems]);

  const handleToggleLineItemVisibility = (id: string) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visible: item.visible === false ? true : false } : item
      )
    );
  };

  const handleUpdateLineItem = (id: string, patch: Partial<SprintLineItem>) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const handleUpdateDeliverable = (
    sprintId: string,
    deliverableId: string,
    patch: Partial<SprintDeliverable>,
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== sprintId) return item;
        return {
          ...item,
          deliverables: (item.deliverables ?? []).map((d) =>
            d.id === deliverableId ? { ...d, ...patch } : d,
          ),
        };
      }),
    );
  };

  const handleAddDeliverable = (sprintId: string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== sprintId) return item;
        const nextNum = (item.deliverables?.length ?? 0) + 1;
        const newItem: SprintDeliverable = {
          id: `${sprintId}-custom-${Date.now()}`,
          label: `New checklist item ${nextNum}`,
          completed: false,
          assignee: 'unassigned',
        };
        return { ...item, deliverables: [...(item.deliverables ?? []), newItem] };
      }),
    );
  };

  const handleRemoveDeliverable = (sprintId: string, deliverableId: string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== sprintId) return item;
        return {
          ...item,
          deliverables: (item.deliverables ?? []).filter((d) => d.id !== deliverableId),
        };
      }),
    );
  };

  const handleAddIpLineItem = (phase: SprintLineItem['phase']) => {
    setLineItems((prev) => addIpLineItem(prev, normalizeLineItem(createBlankIpLineItem(phase))));
  };

  const handleRemoveIpLineItem = (id: string) => {
    setLineItems((prev) => removeIpLineItem(prev, id));
  };

  const handleUpdateIpScheduleItem = (
    id: string,
    patch: Partial<{
      name: string;
      summary: string;
      description: string;
      dates: string;
      duration: string;
      deliverables: string[];
    }>,
  ) => {
    const { deliverables, ...rest } = patch;
    handleUpdateLineItem(id, {
      ...rest,
      ...(deliverables
        ? { deliverables: normalizeDeliverables(id, deliverables) }
        : {}),
    });
  };

  const [proposalAudience, setProposalAudience] = useState<'internal' | 'angela'>(() => {
    return localStorage.getItem('myplan_proposal_audience') === 'angela' ? 'angela' : 'internal';
  });

  const appSession = getCurrentUserSession();
  const permissionActor = appSession ?? currentUser;
  const portalPerms = getRolePermissions(permissionActor);
  const canViewBudget = portalPerms.isSuperAdmin;
  const showLineItemBreakdown = canViewBudget;
  const showPricing = canViewBudget && proposalAudience === 'internal';

  const setProposalAudienceMode = (audience: 'internal' | 'angela') => {
    if (audience === 'internal' && !getRolePermissions(getCurrentUserSession() ?? currentUser).canViewBudget) return;
    setProposalAudience(audience);
    localStorage.setItem('myplan_proposal_audience', audience);
  };

  useEffect(() => {
    if (canViewBudget) {
      if (isFinancialsTab(activeTab) && proposalAudience !== 'internal') {
        setProposalAudience('internal');
        localStorage.setItem('myplan_proposal_audience', 'internal');
      }
      return;
    }
    if (proposalAudience !== 'angela') {
      setProposalAudience('angela');
      localStorage.setItem('myplan_proposal_audience', 'angela');
    }
  }, [activeTab, canViewBudget, proposalAudience]);

  const setProposalPricingVisible = (visible: boolean) => {
    setProposalAudienceMode(visible ? 'internal' : 'angela');
  };

  const [selectedDiscountTier, setSelectedDiscountTier] = useState<number>(0);
  const [proposalViewPhase, setProposalViewPhase] = useState<ProposalVersion['proposalViewPhase']>('phase1');
  const [proposalNotes, setProposalNotes] = useState<string>(() => {
    const stored = localStorage.getItem('myplan_admin_proposal_notes');
    if (!stored) return DEFAULT_PROPOSAL_TEXT;
    const migrated = ensureAngelaNieceOrigin(replaceLegacyClientDisplayName(stored));
    if (migrated !== stored) localStorage.setItem('myplan_admin_proposal_notes', migrated);
    return migrated;
  });
  const [isEditingDoc, setIsEditingDoc] = useState<boolean>(false);
  const [documentPreview, setDocumentPreview] = useState<{ showPricing: boolean } | null>(null);
  const [angelaSignoff, setAngelaSignoff] = useState<AngelaPlanSignoff | null>(() => getAngelaPlanSignoff());
  const [isSignoffOpen, setIsSignoffOpen] = useState(false);
  const [signoffName, setSignoffName] = useState(CLIENT_NAME);
  const [signoffError, setSignoffError] = useState('');
  const [isPlanDownloadOpen, setIsPlanDownloadOpen] = useState(PLAN_DOWNLOAD_SECTION_DEFAULT_OPEN);
  const [tempNotes, setTempNotes] = useState<string>(proposalNotes);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedProposalVersions, setSavedProposalVersions] = useState<ProposalVersion[]>(() => {
    try {
      const raw = localStorage.getItem('myplan_proposal_versions');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Copy Swatch State
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // QA Test Matrix State — shared D1 is the source of truth (do not hydrate from localStorage).
  const [qaTests, setQaTests] = useState<QaTestItem[]>([]);

  // Task Page State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSprint, setNewTaskSprint] = useState<SprintCategory>(() => rolloverSprint(currentSprintLabel()));
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Launch');
  const [newTaskPriority, setNewTaskPriority] = useState<WorkPriority>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState<WorkAssignee>('unassigned');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilters, setTaskFilters] = useState(() =>
    defaultTaskBoardFilters<TaskStatusFilter>(getCurrentUserSession() ?? currentUser),
  );
  const [taskSort, setTaskSort] = useState<WorkBoardSort>(DEFAULT_WORK_BOARD_SORT);
  const [qaSearch, setQaSearch] = useState('');
  const [qaFilters, setQaFilters] = useState(() =>
    defaultTestingPortalFilters<QaStatusFilter>(getCurrentUserSession() ?? currentUser),
  );
  const [qaSort, setQaSort] = useState<WorkBoardSort>(DEFAULT_WORK_BOARD_SORT);
  const [qaSuiteFilter, setQaSuiteFilter] = useState<Set<TestSuite>>(() => defaultQaSuiteFilter());
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(() => new Set());
  const [selectedQaIds, setSelectedQaIds] = useState<Set<string>>(() => new Set());
  const [blockedNoteTaskIds, setBlockedNoteTaskIds] = useState<string[] | null>(null);
  const { openSections: taskOpenSections, toggleSection: toggleTaskSection } = useSprintSectionState(defaultOpenSprintSections());
  const { openSections: qaOpenSections, toggleSection: toggleQaSection } = useSprintSectionState(defaultOpenSprintSections());
  const [openTaskRows, setOpenTaskRows] = useState<Record<string, boolean>>({});
  const [openQaRows, setOpenQaRows] = useState<Record<string, boolean>>({});

  // Must sit after `tasks` / `openTaskRows` — referencing them earlier TDZ-crashes AdminPortal to a blank page.
  useEffect(() => {
    if (activeTab !== 'tasks') return;
    const taskId = window.location.hash.replace(/^#/, '');
    if (!taskId) return;
    setOpenTaskRows((prev) => ({ ...prev, [taskId]: true }));
    const timer = window.setTimeout(() => {
      document.getElementById(taskId)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [activeTab, tasks]);

  useEffect(() => {
    if (activeTab !== 'tasks') return;
    setTaskFilters(defaultTaskBoardFilters<TaskStatusFilter>(getCurrentUserSession() ?? currentUser));
  }, [activeTab, currentUser?.email]);

  useEffect(() => {
    setQaFilters(defaultTestingPortalFilters<QaStatusFilter>(getCurrentUserSession() ?? currentUser));
  }, [currentUser?.email]);

  const [dirtyTaskIds, setDirtyTaskIds] = useState<Set<string>>(() => new Set());
  const [dirtyTestIds, setDirtyTestIds] = useState<Set<string>>(() => new Set());
  const handleToggleQaSection = (sprint: SprintCategory) => {
    const opening = !qaOpenSections[sprint];
    toggleQaSection(sprint);
    if (opening) {
      setOpenQaRows((prev) => collapseWorkItemsInSprint(prev, qaTests, sprint));
    }
  };
  const [taskSummaryOpen, setTaskSummaryOpen] = useState(false);
  const [workBoardNotice, setWorkBoardNotice] = useState('');
  const [workBoardSaving, setWorkBoardSaving] = useState(false);
  const workBoardHydrated = useRef(false);
  const workBoardDirtyRef = useRef(false);
  const workBoardSavingRef = useRef(false);
  const workBoardPullEpochRef = useRef(0);
  const applyingRemoteWorkBoardRef = useRef(false);
  const workBoardPendingSaveRef = useRef(false);
  const lastSavedFingerprintRef = useRef<string | null>(null);
  const lastSavedTaskRowsRef = useRef<Map<string, string> | null>(null);
  const lastSavedTestRowsRef = useRef<Map<string, string> | null>(null);
  const tasksRef = useRef(tasks);
  const qaTestsRef = useRef(qaTests);
  const removedTaskIdsRef = useRef<string[]>([]);
  const removedTestIdsRef = useRef<string[]>([]);
  tasksRef.current = tasks;
  qaTestsRef.current = qaTests;
  const workBoardHasUnsaved =
    anyWorkItemsDirty(dirtyTaskIds, dirtyTestIds) ||
    workBoardHasUnsavedChanges(workBoardFingerprint(tasks, qaTests), lastSavedFingerprintRef.current);
  workBoardDirtyRef.current = workBoardHasUnsaved;

  const workBoardActorEmail = () =>
    getCurrentUserSession()?.email ?? currentUser?.email ?? null;

  const persistWorkBoard = useCallback(
    (nextTasks: TaskItem[], nextTests: QaTestItem[]) => {
      if (!workBoardHydrated.current) {
        workBoardPendingSaveRef.current = true;
        return;
      }
      if (workBoardSavingRef.current) {
        workBoardPendingSaveRef.current = true;
        return;
      }
      const savedFingerprint = workBoardFingerprint(nextTasks, nextTests);
      workBoardSavingRef.current = true;
      setWorkBoardSaving(true);
      void saveWorkBoardStore(
        buildWorkBoardStorePayload(nextTasks, nextTests, workBoardActorEmail(), new Date(), {
          taskIds: removedTaskIdsRef.current,
          testIds: removedTestIdsRef.current,
        }),
      )
        .then((result) => {
          if (result.skipped) {
            setWorkBoardNotice(SAVE_DATABASE_SKIPPED_NOTICE);
            return;
          }
          if (!result.ok) {
            setWorkBoardNotice(result.error || 'Could not save tasks and tests to the database');
            return;
          }
          // Keep dirty if the user edited again while this save was in flight.
          if (workBoardFingerprint(tasksRef.current, qaTestsRef.current) === savedFingerprint) {
            workBoardPullEpochRef.current += 1;
            lastSavedFingerprintRef.current = savedFingerprint;
            lastSavedTaskRowsRef.current = snapshotRowFingerprints(nextTasks, taskRowFingerprint);
            lastSavedTestRowsRef.current = snapshotRowFingerprints(nextTests, qaRowFingerprint);
            workBoardDirtyRef.current = false;
            setDirtyTaskIds(new Set());
            setDirtyTestIds(new Set());
          }
          setWorkBoardNotice(SAVED_TO_DATABASE_NOTICE);
        })
        .finally(() => {
          workBoardSavingRef.current = false;
          setWorkBoardSaving(false);
          if (workBoardPendingSaveRef.current) {
            workBoardPendingSaveRef.current = false;
            persistWorkBoard(tasksRef.current, qaTestsRef.current);
          }
        });
    },
    [currentUser],
  );

  const saveWorkBoardNow = useCallback(() => {
    persistWorkBoard(tasksRef.current, qaTestsRef.current);
  }, [persistWorkBoard]);

  const applyRemoteWorkBoard = useCallback((remote: Awaited<ReturnType<typeof fetchWorkBoardStore>>) => {
    if (
      workBoardHydrated.current &&
      !shouldApplyRemoteWorkBoardPull({
        dirty: workBoardDirtyRef.current,
        saving: workBoardSavingRef.current,
        hydrated: true,
      })
    ) {
      return { tasks: tasksRef.current, tests: qaTestsRef.current };
    }
    if (remote && !remote.empty) {
      removedTaskIdsRef.current = [...new Set([...(remote.removedTaskIds ?? []), ...removedTaskIdsRef.current])];
      removedTestIdsRef.current = [...new Set([...(remote.removedTestIds ?? []), ...removedTestIdsRef.current])];
    }
    const next = hydrateWorkBoardFromRemote(remote, tasksRef.current, qaTestsRef.current, {
      // First load always merges by progress so seed/not-started rows cannot wipe Done.
      preferLocal: false,
      removedTaskIds: removedTaskIdsRef.current,
      removedTestIds: removedTestIdsRef.current,
    });
    const nextFingerprint = workBoardFingerprint(next.tasks, next.tests);
    if (!workBoardHydrated.current) {
      lastSavedFingerprintRef.current = nextFingerprint;
      lastSavedTaskRowsRef.current = snapshotRowFingerprints(next.tasks, taskRowFingerprint);
      lastSavedTestRowsRef.current = snapshotRowFingerprints(next.tests, qaRowFingerprint);
    }
    if (nextFingerprint === workBoardFingerprint(tasksRef.current, qaTestsRef.current)) {
      return next;
    }
    applyingRemoteWorkBoardRef.current = true;
    tasksRef.current = next.tasks;
    qaTestsRef.current = next.tests;
    setTasks(next.tasks);
    setQaTests(next.tests);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pull = () => {
      const epoch = workBoardPullEpochRef.current;
      void fetchWorkBoardStore().then((remote) => {
        if (cancelled || epoch !== workBoardPullEpochRef.current) return;
        applyRemoteWorkBoard(remote);
        workBoardHydrated.current = true;
        if (workBoardPendingSaveRef.current) {
          workBoardPendingSaveRef.current = false;
          persistWorkBoard(tasksRef.current, qaTestsRef.current);
        }
      });
    };
    pull();
    if (WORKBOARD_POLL_MS <= 0) {
      return () => {
        cancelled = true;
      };
    }
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      pull();
    }, WORKBOARD_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [applyRemoteWorkBoard, persistWorkBoard]);

  // User Management State
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => getAppUsers());
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPass, setEditPass] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  // New user creation state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [showNewUserPass, setShowNewUserPass] = useState(false);
  const [newUserRole, setNewUserRole] = useState<UserRole>('member');
  const [auditLog, setAuditLog] = useState(() => getUserAuditLog());
  const [openUserAudit, setOpenUserAudit] = useState(() => defaultUserAuditOpen());
  const [usersLoadError, setUsersLoadError] = useState('');
  const [usersImportNotice, setUsersImportNotice] = useState('');

  const refreshUsers = async () => {
    setUsersLoadError('');
    try {
      if (hasLocalUsersToImport()) {
        const migrated = await importBrowserUsersToD1();
        if (migrated.error) {
          setUsersLoadError(migrated.error);
        } else if (migrated.imported > 0) {
          setUsersImportNotice(
            `Imported ${migrated.imported} user(s) from this browser into the shared database.`,
          );
        }
      }
      const users = await refreshRemoteUsers();
      setAppUsers(users);
      setAuditLog(backfillUserAuditFromUsers(users));
    } catch (err) {
      setUsersLoadError(
        err instanceof Error
          ? err.message
          : 'Could not load users from the shared database. Sign out and sign in again.',
      );
    }
  };

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'testing') {
      void refreshUsers();
    }
  }, [activeTab]);

  const userAdminActor = () => getCurrentUserSession() ?? currentUser;

  const handleToggleUserStatus = async (user: AppUser) => {
    const actor = userAdminActor();
    if (!canEditUserAsActor(actor, user)) {
      alert('Super Admin profiles can only be changed by a Super Admin.');
      return;
    }
    const nextStatus: UserStatus =
      user.status === 'pending' ? 'active' : user.status === 'active' ? 'inactive' : 'pending';
    const result = await updateUserProfileAsync(user.id, { status: nextStatus }, actor);
    if (!result.success) {
      alert(result.error || 'Unable to update user status.');
      return;
    }
    if (result.user && shouldSendApprovalEmail(user.status, nextStatus)) {
      await sendUserApprovedEmail(result.user);
    }
    await refreshUsers();
  };

  const handleToggleUserRole = async (user: AppUser, roleToToggle: UserRole) => {
    const actor = userAdminActor();
    const permissions = getRolePermissions(actor);
    if (!canEditUserAsActor(actor, user)) {
      alert('Super Admin profiles can only be changed by a Super Admin.');
      return;
    }
    if (roleToToggle === 'super_admin' && !permissions.canAssignSuperAdmin) {
      alert('Only Super Admin can grant Super Admin permissions.');
      return;
    }

    let updatedRoles = user.roles ? [...user.roles] : [user.role];
    if (updatedRoles.includes(roleToToggle)) {
      if (updatedRoles.length > 1) {
        updatedRoles = updatedRoles.filter((r) => r !== roleToToggle);
      }
    } else {
      updatedRoles.push(roleToToggle);
    }
    const result = await updateUserProfileAsync(user.id, { roles: updatedRoles }, actor);
    if (!result.success) {
      alert(result.error || 'Unable to update user roles.');
      return;
    }
    await refreshUsers();
  };

  const handleOpenEditUserModal = (user: AppUser) => {
    if (!canEditUserAsActor(userAdminActor(), user)) {
      alert('Super Admin profiles can only be changed by a Super Admin.');
      return;
    }
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditPass('');
    setShowEditPass(false);
    setEditRoles(user.roles || [user.role]);
    setEditStatus(user.status || 'active');
  };

  const handleSaveUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const actor = userAdminActor();
    const previousStatus = editingUser.status;
    const result = await updateUserProfileAsync(editingUser.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      password: editPass.trim() ? editPass : undefined,
      roles: editRoles,
      status: editStatus,
    }, actor);
    if (!result.success) {
      alert(result.error || 'Unable to save user profile.');
      return;
    }
    if (shouldSendApprovalEmail(previousStatus, editStatus)) {
      await sendUserApprovedEmail({
        name: editName.trim() || editingUser.name,
        email: editEmail.trim().toLowerCase() || editingUser.email,
      });
    }
    setEditingUser(null);
    await refreshUsers();
  };

  const handleDeleteUserClick = async (userId: string) => {
    const target = appUsers.find((u) => u.id === userId);
    if (target && !canEditUserAsActor(userAdminActor(), target)) {
      alert('Super Admin accounts can only be deleted by a Super Admin.');
      return;
    }
    if (confirm('Are you sure you want to delete this user from the app database?')) {
      const result = await deleteUserAsync(userId, userAdminActor());
      if (!result.success) {
        alert(result.error || 'Unable to delete user.');
        return;
      }
      await refreshUsers();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');
    const res = await loginUserAsync(emailInput, passInput);
    if (res.success && res.user) {
      const asAdmin = appUserAsAdminSession(res.user);
      if (asAdmin) {
        setCurrentUser(asAdmin);
        setEmailInput('');
        setPassInput('');
        setBlockAutofill(true);
        const landing = postLoginAdminTab(res.user);
        if (landing === 'tasks' && resolveAdminPortalTab(activeTab) === 'plan') {
          selectAdminTab('tasks');
        }
        return;
      }
      setAuthError('This account cannot access Admin Hub.');
    } else {
      setAuthError(res.error || 'Authentication failed');
    }
  };

  const handleAdminForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');
    const result = await requestPasswordResetAsync(emailInput, window.location.origin);
    if (result.send) {
      await sendPasswordResetEmail(result.send);
    }
    setAuthNotice(result.message || PASSWORD_RESET_NOTICE);
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Proposal Calculations & Phase Filtering
  const viewingPrevious = isPreviousBudgetEdition(activeTab);
  const displayLineItems = viewingPrevious
    ? (Array.isArray(previousBudget.lineItems) ? previousBudget.lineItems : []).map((item) =>
        normalizeLineItem(item as LineItemSeed),
      )
    : lineItems;
  const displayDiscountTier = effectiveBudgetDiscount(
    activeTab,
    previousBudget.selectedDiscountTier,
    0,
  );
  const phase1Items = displayLineItems.filter((item) => item.phase === 'phase1_build');
  const phase2Items = displayLineItems.filter((item) => item.phase === 'phase2_addons');
  const phase3Items = displayLineItems.filter((item) => item.phase === 'phase3_future');

  const phase1BaseTotal = phase1Items
    .filter((item) => item.visible !== false)
    .reduce((sum, item) => sum + item.baseAmount, 0);

  const phase2BaseTotal = phase2Items
    .filter((item) => item.visible !== false)
    .reduce((sum, item) => sum + item.baseAmount, 0);

  const phase3BaseTotal = phase3Items
    .filter((item) => item.visible !== false)
    .reduce((sum, item) => sum + item.baseAmount, 0);

  const activeFilteredItems = displayLineItems.filter((item) => {
    if (proposalViewPhase === 'phase1') return item.phase === 'phase1_build';
    if (proposalViewPhase === 'phase2') return item.phase === 'phase2_addons';
    if (proposalViewPhase === 'phase3') return item.phase === 'phase3_future';
    return true;
  });

  const totalBasePrice = activeFilteredItems
    .filter((item) => item.visible !== false)
    .reduce((sum, item) => sum + item.baseAmount, 0);

  const getDiscountedTotal = (discountPercent: number, basePrice: number = totalBasePrice) =>
    basePrice * (1 - discountPercent / 100);
  const getLineItemNewPrice = (baseAmount: number, discountPercent: number = displayDiscountTier) =>
    getDiscountedTotal(discountPercent, baseAmount);
  const getLineItemAmountSaved = (baseAmount: number, discountPercent: number = displayDiscountTier) =>
    baseAmount - getLineItemNewPrice(baseAmount, discountPercent);
  const formatUsd = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  const getProposalPreviewItems = () =>
    activeFilteredItems.filter((item) => item.visible !== false);

  const getProposalDocumentHtmlFor = (withPricing: boolean) => {
    const includePricing = allowDocumentPricing(canViewBudget, withPricing);
    const visibleItems = getProposalPreviewItems();
    // #region agent log
    fetch('http://127.0.0.1:7427/ingest/7f828d82-d7cf-432b-8668-57028a1f78a9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd632f'},body:JSON.stringify({sessionId:'bd632f',runId:'post-fix',hypothesisId:'K',location:'AdminPortal.tsx:getProposalDocumentHtmlFor',message:'Document export pricing clamp',data:{requestedWithPricing:withPricing,canViewBudget,includePricing,role:currentUser?.role??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return buildProposalDocumentHtml({
      proposalNotes,
      visibleItems,
      totalBasePrice,
      selectedDiscountTier,
      discountedTotalFormatted: formatUsd(getDiscountedTotal(selectedDiscountTier)),
      phaseLabel: PROPOSAL_PHASE_LABELS[proposalViewPhase],
      logoUrl: `${window.location.origin}/images/official_logo_seal.png`,
      showPricing: includePricing,
      angelaSignoff: includePricing ? null : angelaSignoff,
    });
  };

  const getProposalDocumentHtml = () => getProposalDocumentHtmlFor(showPricing);

  const persistProposalVersions = (versions: ProposalVersion[]) => {
    setSavedProposalVersions(versions);
    localStorage.setItem('myplan_proposal_versions', JSON.stringify(versions));
  };

  const handleSaveProposalVersion = () => {
    const version: ProposalVersion = {
      id: `pv-${Date.now()}`,
      name: `${showPricing ? 'Internal' : 'Customer (Angela)'} Â· ${PROPOSAL_PHASE_LABELS[proposalViewPhase]}${showPricing ? ` Â· ${selectedDiscountTier}% off Â· ${formatUsd(getDiscountedTotal(selectedDiscountTier))}` : ''}`,
      savedAt: new Date().toISOString(),
      proposalViewPhase,
      selectedDiscountTier,
      proposalNotes,
      lineItems,
      showPricing,
    };
    const next = [version, ...savedProposalVersions].slice(0, 20);
    persistProposalVersions(next);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleLoadProposalVersion = (version: ProposalVersion) => {
    setProposalViewPhase(version.proposalViewPhase);
    setSelectedDiscountTier(version.selectedDiscountTier);
    setProposalNotes(version.proposalNotes);
    setLineItems(mergeLineItemsWithDefaults(version.lineItems));
    if (version.showPricing !== undefined) {
      setProposalPricingVisible(version.showPricing);
    }
    localStorage.setItem('myplan_admin_proposal_notes', version.proposalNotes);
    localStorage.setItem(LINE_ITEMS_STORAGE_KEY, JSON.stringify(version.lineItems));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDeleteProposalVersion = (id: string) => {
    persistProposalVersions(savedProposalVersions.filter((v) => v.id !== id));
  };

  const handleOpenPhase1ContractSignoff = () => {
    setSignoffError('');
    setIsSignoffOpen(true);
  };

  const handleAngelaPlanSignoff = () => {
    const check = canSignAngelaPlan(signoffName);
    if (!check.ok) {
      setSignoffError(check.reason);
      return;
    }
    try {
      setAngelaSignoff(signAngelaPlan(signoffName));
      setSignoffError('');
      setIsSignoffOpen(false);
    } catch (err) {
      setSignoffError(err instanceof Error ? err.message : 'Could not complete sign-off.');
    }
  };

  const proposalPreviewHtml = useMemo(
    () => (documentPreview ? getProposalDocumentHtmlFor(documentPreview.showPricing) : ''),
    [documentPreview, proposalNotes, lineItems, totalBasePrice, selectedDiscountTier, proposalViewPhase, angelaSignoff],
  );

  const proposalAudienceSlug = (withPricing: boolean) => (withPricing ? 'Internal' : 'Angela-Plan');

  const handleOpenDocumentPreview = (withPricing: boolean) => {
    setDocumentPreview({ showPricing: withPricing });
  };

  const handleViewPdfWindow = (withPricing: boolean) => {
    const html = getProposalDocumentHtmlFor(withPricing);
    const pdfWindow = openProposalPdfWindow(html, false);
    if (!pdfWindow) {
      handleOpenDocumentPreview(withPricing);
    }
  };

  const handleSavePdfWindow = (withPricing: boolean) => {
    const html = getProposalDocumentHtmlFor(withPricing);
    const pdfWindow = openProposalPdfWindow(html, true);
    if (!pdfWindow) {
      handleOpenDocumentPreview(withPricing);
      window.setTimeout(() => handleSavePdfFromIframe(proposalIframeRef.current), 300);
    }
  };

  const handleSavePdfFromIframe = (iframe: HTMLIFrameElement | null) => {
    const win = iframe?.contentWindow;
    if (win) {
      win.focus();
      win.print();
    }
  };

  const handleExportDocxFor = (withPricing: boolean) => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    const htmlContent = getProposalDocumentHtmlFor(withPricing);
    const wordWrapped = htmlContent.replace(
      '<html>',
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>",
    );
    const blob = new Blob(['\ufeff', wordWrapped], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const phaseSlug = proposalViewPhase.replace(/[^a-z0-9]+/gi, '-');
    link.download = `MyPlan_Proposal_${phaseSlug}_${proposalAudienceSlug(withPricing)}${withPricing ? `_${selectedDiscountTier}pct` : ''}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDocx = () => handleExportDocxFor(showPricing);

  const handleDownloadProposalHtml = (withPricing: boolean = showPricing) => {
    const htmlContent = getProposalDocumentHtmlFor(withPricing);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const phaseSlug = proposalViewPhase.replace(/[^a-z0-9]+/gi, '-');
    link.download = `MyPlan_Proposal_${phaseSlug}_${proposalAudienceSlug(withPricing)}${withPricing ? `_${selectedDiscountTier}pct` : ''}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const proposalIframeRef = React.useRef<HTMLIFrameElement>(null);

  const flagWorkBoardDirty = (kind: 'task' | 'test', ids: readonly string[]) => {
    workBoardDirtyRef.current = true;
    workBoardPullEpochRef.current += 1;
    if (kind === 'task') setDirtyTaskIds((prev) => markWorkItemDirty(prev, ids));
    else setDirtyTestIds((prev) => markWorkItemDirty(prev, ids));
  };

  const workBoardAuditActor = () => ({
    name: permissionActor?.name ?? currentUser?.name ?? 'Unknown',
    email: permissionActor?.email ?? currentUser?.email,
  });

  const handleUpdateTask = (id: string, patch: TaskInlinePatch) => {
    const actor = workAssigneeFromActor(permissionActor ?? currentUser);
    if (patch.status === 'blocked' && patch.notes === undefined) {
      const current = tasksRef.current.find((task) => task.id === id);
      if (current && taskNeedsBlockedNote(current.status, 'blocked')) {
        setBlockedNoteTaskIds([id]);
        return;
      }
    }
    const current = tasksRef.current.find((task) => task.id === id);
    if (!current) return;
    const patched = applyTaskInlinePatch(current, patch, actor);
    const nextItem = attachWorkItemFieldAudit(current, patched, workBoardAuditActor(), 'task');
    const next = tasksRef.current.map((task) => (task.id === id ? nextItem : task));
    tasksRef.current = next;
    flagWorkBoardDirty('task', [id]);
    setTasks(next);
    if (patch.status !== undefined || patch.assignee !== undefined) persistWorkBoard(next, qaTestsRef.current);
  };

  const handleBulkUpdateTasks = (ids: string[], patch: TaskInlinePatch) => {
    const actor = workAssigneeFromActor(permissionActor ?? currentUser);
    if (patch.status === 'blocked' && patch.notes === undefined) {
      const needingNote = ids.filter((id) => {
        const current = tasksRef.current.find((task) => task.id === id);
        return current && taskNeedsBlockedNote(current.status, 'blocked');
      });
      if (needingNote.length > 0) {
        setBlockedNoteTaskIds(needingNote);
        return;
      }
    }
    const selected = new Set(ids);
    const auditActor = workBoardAuditActor();
    const next = tasksRef.current.map((task) => {
      if (!selected.has(task.id)) return task;
      const patched = applyTaskInlinePatch(task, patch, actor);
      return attachWorkItemFieldAudit(task, patched, auditActor, 'task');
    });
    flagWorkBoardDirty('task', ids);
    tasksRef.current = next;
    setTasks(next);
    if (patch.status !== undefined || patch.assignee !== undefined) persistWorkBoard(next, qaTestsRef.current);
  };

  const confirmBlockedNote = (note: string) => {
    const ids = blockedNoteTaskIds ?? [];
    const noteActor = {
      name: permissionActor?.name ?? currentUser?.name ?? 'Unknown',
      email: permissionActor?.email ?? currentUser?.email,
    };
    const patchActor = workAssigneeFromActor(permissionActor ?? currentUser);
    const result = applyTasksBlockedWithNote(tasksRef.current, ids, note, noteActor, patchActor);
    if (!result.ok) return result.error;
    tasksRef.current = result.tasks;
    flagWorkBoardDirty('task', ids);
    setTasks(result.tasks);
    persistWorkBoard(result.tasks, qaTestsRef.current);
    setBlockedNoteTaskIds(null);
  };

  const handleUpdateQa = (id: string, patch: QaInlinePatch) => {
    const actor = workAssigneeFromActor(permissionActor ?? currentUser);
    const current = qaTestsRef.current.find((test) => test.id === id);
    if (!current) return;
    const patched = applyQaInlinePatch(current, patch, actor);
    const nextItem = attachWorkItemFieldAudit(current, patched, workBoardAuditActor(), 'test');
    const next = qaTestsRef.current.map((test) => (test.id === id ? nextItem : test));
    qaTestsRef.current = next;
    flagWorkBoardDirty('test', [id]);
    setQaTests(next);
    if (patch.status !== undefined || patch.assignee !== undefined) persistWorkBoard(tasksRef.current, next);
  };

  const handleBulkUpdateQa = (ids: string[], patch: QaInlinePatch) => {
    const actor = workAssigneeFromActor(permissionActor ?? currentUser);
    const selected = new Set(ids);
    const auditActor = workBoardAuditActor();
    const next = qaTestsRef.current.map((test) => {
      if (!selected.has(test.id)) return test;
      const patched = applyQaInlinePatch(test, patch, actor);
      return attachWorkItemFieldAudit(test, patched, auditActor, 'test');
    });
    flagWorkBoardDirty('test', ids);
    qaTestsRef.current = next;
    setQaTests(next);
    if (patch.status !== undefined || patch.assignee !== undefined) persistWorkBoard(tasksRef.current, next);
  };

  const handleCycleTaskStatus = (id: string) => {
    const current = tasksRef.current.find((t) => t.id === id);
    if (!current) return;
    const order: TaskStatus[] = ['not_started', 'in_progress', 'done', 'blocked'];
    const status = order[(Math.max(0, order.indexOf(current.status)) + 1) % order.length];
    handleUpdateTask(id, { status });
  };

  const handleCycleQaStatus = (id: string) => {
    const current = qaTestsRef.current.find((t) => t.id === id);
    if (!current) return;
    const order: QaStatus[] = [
      'untested',
      'in_progress',
      'passed',
      'failed',
      'fixed_retest',
      'failed_retest',
      'blocked',
    ];
    const status = order[(Math.max(0, order.indexOf(current.status)) + 1) % order.length];
    handleUpdateQa(id, { status });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: nextTaskId(tasksRef.current),
      title: newTaskTitle.trim(),
      sprint: rolloverSprint(newTaskSprint),
      category: newTaskCategory,
      priority: newTaskPriority,
      status: 'not_started',
      assignee: newTaskAssignee,
      assignor: workAssigneeFromActor(permissionActor ?? currentUser),
      dueDate: '',
    };
    const nextTasks = [newTask, ...tasksRef.current];
    tasksRef.current = nextTasks;
    flagWorkBoardDirty('task', [newTask.id]);
    setTasks(nextTasks);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (id: string) => {
    removedTaskIdsRef.current = [...new Set([...removedTaskIdsRef.current, id])];
    const nextTasks = tasksRef.current.filter((t) => t.id !== id);
    tasksRef.current = nextTasks;
    flagWorkBoardDirty('task', [id]);
    setTasks(nextTasks);
    setSelectedTaskIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteQa = (id: string) => {
    removedTestIdsRef.current = [...new Set([...removedTestIdsRef.current, id])];
    const nextTests = qaTestsRef.current.filter((t) => t.id !== id);
    qaTestsRef.current = nextTests;
    flagWorkBoardDirty('test', [id]);
    setQaTests(nextTests);
    setSelectedQaIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleToggleTaskAgenda = (task: TaskItem) => {
    const onAgenda = !task.onAgenda;
    handleUpdateTask(task.id, { onAgenda });
    const actor = {
      email: permissionActor?.email ?? currentUser?.email,
      name: permissionActor?.name ?? currentUser?.name,
      isSuperAdmin: portalPerms.isSuperAdmin,
    };
    void syncTaskToUpcomingAgenda(
      { id: task.id, title: task.title, description: task.description, notes: task.notes },
      onAgenda,
      actor,
    );
  };

  const completedTaskCount = tasks.filter((t) => t.status === 'done').length;
  const rolledOverTaskCount = countRolledOverItems(tasks);
  const taskProgressPercent = tasks.length > 0 ? Math.round((completedTaskCount / tasks.length) * 100) : 0;
  const suiteScopedQaTests = qaTests.filter((t) => matchesSuiteFilter(t, qaSuiteFilter));
  const passedQaCount = suiteScopedQaTests.filter((t) => t.status === 'passed').length;
  const rolledOverQaCount = countRolledOverItems(suiteScopedQaTests);
  const filteredTasks = filterTasks(tasks, taskFilters, taskSearch);
  const filteredQaTests = filterQaTests(suiteScopedQaTests, qaFilters, qaSearch);
  const qaSuiteChips = buildSuiteChipCounts(qaTests, qaIsDone);

  const taskSprintChips = buildSprintChipCounts(
    filterTasks(tasks, filtersOmittingSection(taskFilters, 'sprint'), taskSearch),
    taskIsDone,
  );
  const taskStatusChipItems = filterTasks(
    tasks,
    filtersOmittingSection(taskFilters, 'status'),
    taskSearch,
  );
  const taskStatusChips = appendRolledOverStatusChip(
    buildStatusChipCounts(
      taskStatusChipItems,
      TASK_STATUSES,
      TASK_STATUS_LABELS,
      (s) => s === 'done',
      TASK_STATUS_SWATCH,
    ),
    taskStatusChipItems,
    taskIsDone,
  );
  const taskPriorityChips = buildPriorityChipCounts(
    filterTasks(tasks, filtersOmittingSection(taskFilters, 'priority'), taskSearch),
    taskIsDone,
  );
  const taskCategoryChips = buildCategoryChipCounts(
    filterTasks(tasks, filtersOmittingSection(taskFilters, 'category'), taskSearch),
    TASK_CATEGORIES,
    taskIsDone,
  );

  const qaSprintChips = buildSprintChipCounts(
    filterQaTests(suiteScopedQaTests, filtersOmittingSection(qaFilters, 'sprint'), qaSearch),
    qaIsDone,
  );
  const qaStatusChipItems = filterQaTests(
    suiteScopedQaTests,
    filtersOmittingSection(qaFilters, 'status'),
    qaSearch,
  );
  const qaStatusChips = appendRolledOverStatusChip(
    buildStatusChipCounts(qaStatusChipItems, QA_STATUSES, QA_STATUS_LABELS, (s) => s === 'passed', QA_STATUS_SWATCH),
    qaStatusChipItems,
    qaIsDone,
  );
  const qaPriorityChips = buildPriorityChipCounts(
    filterQaTests(suiteScopedQaTests, filtersOmittingSection(qaFilters, 'priority'), qaSearch),
    qaIsDone,
  );
  const testerPeople = useMemo(
    () => listPortalTesters(appUsers).map((tester) => ({ id: tester.id, name: tester.name })),
    [appUsers],
  );
  const qaAssigneeOrdered = useMemo(() => testingPortalAssigneeOptions(testerPeople), [testerPeople]);
  const qaHumanAssignees = useMemo(() => testingPortalHumanAssigneeOptions(testerPeople), [testerPeople]);
  const qaAssigneeLabels = useMemo(
    () => Object.fromEntries(qaAssigneeOrdered.map((id) => [id, assigneeDisplayLabel(id, testerPeople)])),
    [qaAssigneeOrdered, testerPeople],
  );
  const taskAssigneeOrdered = useMemo(() => taskBoardAssigneeOptions(testerPeople), [testerPeople]);
  const taskAssigneeLabels = useMemo(
    () => Object.fromEntries(taskAssigneeOrdered.map((id) => [id, assigneeDisplayLabel(id, testerPeople)])),
    [taskAssigneeOrdered, testerPeople],
  );
  const qaAssigneeChips = buildAssigneeChipCounts(
    filterQaTests(suiteScopedQaTests, filtersOmittingSection(qaFilters, 'assignee'), qaSearch),
    qaIsDone,
    qaAssigneeOrdered,
    testerPeople,
  );
  const taskAssigneeChips = buildAssigneeChipCounts(
    filterTasks(tasks, filtersOmittingSection(taskFilters, 'assignee'), taskSearch),
    taskIsDone,
    taskAssigneeOrdered,
    testerPeople,
  );
  const qaCategoryChips = buildCategoryChipCounts(
    filterQaTests(suiteScopedQaTests, filtersOmittingSection(qaFilters, 'category'), qaSearch),
    QA_CATEGORIES,
    qaIsDone,
  );

  const visibleTaskIds = filteredTasks.map((task) => task.id);
  const visibleQaIds = filteredQaTests.map((test) => test.id);
  const selectedVisibleTaskCount = visibleTaskIds.filter((id) => selectedTaskIds.has(id)).length;
  const selectedVisibleQaCount = visibleQaIds.filter((id) => selectedQaIds.has(id)).length;

  const qaStatusBadgeClass = (status: QaStatus) => QA_STATUS_TONES[status];
  const taskStatusBadgeClass = (status: TaskStatus) => TASK_STATUS_TONES[status];

  // GATED AUTHENTICATION SCREEN IF NOT LOGGED IN
  if (!currentUser) {
    return (
      <div className={`min-h-screen bg-[#FAF8F5] text-[#1F1917] flex flex-col items-center justify-start px-4 pb-8 font-sans selection:bg-[#C2410C] selection:text-white ${HEADER_CONTENT_OFFSET}`}>
        <div className="max-w-md w-full bg-[#FAF8F5] text-[#1F1917] border-4 border-[#C2410C] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] font-mono font-black text-xs uppercase tracking-wider border border-[#C2410C]/30">
              <Lock className="w-3.5 h-3.5" /> GATED ADMIN SECURITY PORTAL
            </div>
            <div className="flex justify-center my-2">
              <Logo variant="seal-only" size="lg" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight font-serif text-[#1F1917]">
              MY PLAN, NOT MY MOOD
            </h2>
            <p className="text-xs text-[#3F3832] font-medium leading-relaxed">
              Separate App User Database & Master Administration Suite. Please sign in to access Implementation Plan, IP Assets, Testing Portal & Tasks.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          {authNotice && (
            <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs rounded-xl font-medium">
              {authNotice}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete={LOGIN_FORM_AUTOCOMPLETE} data-testid="admin-login-form">
              <div>
                <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Admin Email</label>
                <input
                  type="email"
                  name={LOGIN_EMAIL_FIELD_NAME}
                  autoComplete={LOGIN_EMAIL_AUTOCOMPLETE}
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  readOnly={blockAutofill}
                  onFocus={() => setBlockAutofill(false)}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3 py-2 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                  required
                  data-testid="admin-login-email"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Passcode / Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name={LOGIN_PASSWORD_FIELD_NAME}
                    autoComplete={LOGIN_PASSWORD_AUTOCOMPLETE}
                    readOnly={blockAutofill}
                    onFocus={() => setBlockAutofill(false)}
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3 py-2 pr-10 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                    required
                    data-testid="admin-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917] flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Unlock Admin Portal
              </button>

              <p className="text-center text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthNotice(''); }}
                  className="text-[#C2410C] font-black underline underline-offset-2 hover:text-[#1F1917] cursor-pointer min-h-[44px]"
                  data-testid="admin-forgot-password-link"
                >
                  Forgot password?
                </button>
              </p>
              <p className="text-center text-[11px] text-[#3F3832] font-medium leading-relaxed">
                Testers: register from the storefront. New accounts stay pending until an admin activates them.
              </p>
            </form>
          ) : (
            <form onSubmit={handleAdminForgotSubmit} className="space-y-4" data-testid="admin-forgot-password-form">
              <div>
                <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Account Email</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-white border-2 border-[#1F1917] rounded-xl px-3 py-2 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917]"
              >
                Send Reset Link
              </button>
              <p className="text-center text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthNotice(''); }}
                  className="text-[#C2410C] font-black underline underline-offset-2 hover:text-[#1F1917] cursor-pointer min-h-[44px]"
                >
                  Back to sign in
                </button>
              </p>
            </form>
          )}

          <div className="pt-2 border-t border-[#E5DFD3] text-center">
            <button
              onClick={onBackToStore}
              className="text-xs text-[#3F3832] hover:text-[#1F1917] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return To Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED MASTER ADMIN SUITE
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1917] font-sans selection:bg-[#C2410C] selection:text-white flex flex-col">
      {/* Top Header Navigation Bar */}
      <header className={ADMIN_STUDIO_HEADER_CLASS}>
        <div className={ADMIN_STUDIO_HEADER_INNER_CLASS}>
          <div className="flex items-end gap-2 min-w-0 pb-0">
            <button
              onClick={onBackToStore}
              className="min-h-[44px] px-2 py-1 bg-white hover:bg-[#FFEDD5] text-[#C2410C] rounded-t-lg text-[10px] font-black uppercase tracking-wide cursor-pointer border border-[#FDBA74] shrink-0 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </button>
            <span
              className="font-serif font-black text-xs sm:text-sm text-[#9A3412] tracking-tight uppercase truncate min-w-0 leading-none pb-2"
              data-testid="admin-studio-title"
            >
              {ADMIN_HUB_TITLE}
            </span>
          </div>

          <AdminStudioNav
            activeTab={mapLegacyAdminTab(activeTab)}
            permissions={getRolePermissions(getCurrentUserSession() ?? currentUser)}
            onSelect={(tab: AdminStudioTab) => selectAdminTab(tab)}
            testingSuiteFilter={qaSuiteFilter}
            testingSuiteCounts={qaSuiteChips}
            onSelectTestingSuite={(suite) => {
              selectAdminTab('testing');
              setQaSuiteFilter(new Set([suite]));
            }}
            taskBoardCount={{ done: completedTaskCount, total: tasks.length }}
            testBoardCount={{
              done: qaTests.filter(qaIsDone).length,
              total: qaTests.length,
            }}
            previousBudgetCapturedAt={previousBudget.capturedAt}
          />
        </div>
      </header>

      {/* Main Content View */}
      <main className={ADMIN_STUDIO_MAIN_CLASS}>
        {/* TAB 1: PLAN â€” combined Angela Plan + IP Roadmap */}
        {(resolveAdminPortalTab(activeTab) === 'plan' || activeTab === 'budget' || viewingPrevious) && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            {canViewBudget && activeTab !== 'budget' && !viewingPrevious && (
              <div
                data-testid="internal-plan-download-card"
                className={`order-1 rounded-[1.75rem] border p-6 shadow-[0_10px_32px_rgba(31,25,23,0.06)] space-y-3 transition-all ${
                  proposalAudience === 'internal'
                    ? 'border-[#E8DFD2] bg-[#FFFCF7] ring-1 ring-[#C4A574]/30'
                    : 'border-[#E8DFD2] bg-white hover:border-[#C4A574]'
                }`}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F1E8] text-[#9A6B3D] text-[10px] tracking-[0.18em] uppercase font-serif">
                  <DollarSign className="w-3.5 h-3.5" /> Internal
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#1F1917]">
                  Implementation Plan &amp; Budget
                </h3>
                <p className="text-xs text-[#3F3832] font-medium leading-relaxed">
                  Full pricing, pre-payment discount schedule, phase payment plans, and sprint investment totals.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setProposalAudienceMode('internal')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase cursor-pointer border-2 ${
                      proposalAudience === 'internal'
                        ? 'bg-[#EA580C] text-white border-[#FDBA74]'
                        : 'bg-white text-[#1F1917] border-[#E5DFD3] hover:border-[#1F1917]'
                    }`}
                  >
                    Active View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDocumentPreview(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-[10px] font-black uppercase cursor-pointer border border-[#FDBA74] flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Word
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewPdfWindow(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFEDD5] text-[#1F1917] text-[10px] font-black uppercase cursor-pointer border-2 border-[#1F1917] flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePdfWindow(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-[10px] font-black uppercase cursor-pointer border border-[#1F1917] flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Save PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportDocxFor(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-[10px] font-black uppercase cursor-pointer border border-[#1F1917] flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Save Word
                  </button>
                  <button
                    type="button"
                    data-testid="open-interactive-budget-card"
                    onClick={() => selectAdminTab('budget')}
                    className="px-3 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-[10px] font-black uppercase cursor-pointer border-2 border-[#1F1917] flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Open Interactive Budget
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'budget' && !viewingPrevious && (
            <div className="order-4 space-y-8">
            <IpSprintSchedulePage
              lineItems={lineItems.map((item) => ({
                ...item,
                deliverables: deliverableLabelList(item.deliverables ?? []),
              }))}
              tasks={tasks}
              canEdit={getRolePermissions(permissionActor).canViewProposal}
              onAddItem={handleAddIpLineItem}
              onRemoveItem={handleRemoveIpLineItem}
              onUpdateItem={handleUpdateIpScheduleItem}
              extraTocItems={[
                {
                  id: IP_BRAND_ASSETS_ID,
                  label: 'Brand Assets',
                  subtitle: 'Logo, palette & marks',
                },
              ]}
              introSummary={proposalNotes}
              angelaPlanDocs={{
                onViewPdf: () => handleViewPdfWindow(proposalAudience === 'internal'),
                onSavePdf: () => handleSavePdfWindow(proposalAudience === 'internal'),
                onViewWord: () => handleOpenDocumentPreview(proposalAudience === 'internal'),
                onSaveWord: () => handleExportDocxFor(proposalAudience === 'internal'),
                canViewBudget,
                audience: proposalAudience === 'internal' ? 'internal' : 'angela',
                onAudienceChange: (next) => setProposalAudienceMode(next),
                onOpenBudget: canViewBudget ? () => selectAdminTab('budget') : undefined,
                onApprovePhase1Contract: handleOpenPhase1ContractSignoff,
                phase1Signoff: angelaSignoff,
              }}
            />
            </div>
            )}
            {activeTab === 'budget' && canViewBudget && (
              <div
                id={PLAN_BUDGET_VERSIONS_ID}
                className="order-3 bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 scroll-mt-28"
                data-testid="internal-budget-versions"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C2410C] text-white text-[10px] font-mono font-black uppercase tracking-wider mb-2">
                      Budget Versions
                    </div>
                    <h3 className="text-lg font-black text-[#1F1917] uppercase font-serif">
                      Saved Internal Budgets
                    </h3>
                    <p className="text-xs text-[#3F3832] font-medium mt-1">
                      Snapshot pricing, discount tier, and scope. Load a version to restore it.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProposalVersion}
                    className="min-h-[44px] px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-[10px] font-black uppercase cursor-pointer border-2 border-[#1F1917] inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Budget Version
                  </button>
                </div>
                {savedProposalVersions.length === 0 ? (
                  <p className="text-sm text-[#3F3832] font-medium">
                    No budget versions saved yet. Click Save Budget Version after you set the discount and scope.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedProposalVersions.map((version) => (
                      <div
                        key={version.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF8F5] border-2 border-[#E5DFD3]"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1F1917]">{version.name}</div>
                          <div className="text-[9px] font-mono text-[#3F3832]">
                            {new Date(version.savedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLoadProposalVersion(version)}
                            className="min-h-[44px] px-3 rounded-lg bg-[#C2410C] text-white text-[9px] font-black uppercase cursor-pointer"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProposalVersion(version.id)}
                            className="min-h-[44px] px-3 rounded-lg bg-white border border-red-300 text-red-600 text-[9px] font-black uppercase cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {canViewBudget && activeTab !== 'budget' && !viewingPrevious && (
            <div className="order-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-2 border-[#1F1917] rounded-3xl p-6 shadow-xl">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> MASTER DELIVERABLE PROPOSAL
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1F1917] uppercase tracking-tight font-serif">
                  MY PLAN, NOT MY MOOD — Implementation Plan
                </h2>
                <p className="text-xs text-[#3F3832] font-medium mt-1">
                  Prepared for {CLIENT_DISPLAY_NAME} Â· {CLIENT_ROLE} Â· {CLIENT_EMAIL}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {isSaved && (
                  <span className="px-3 py-1.5 rounded-xl bg-[#10B981] text-white text-[10px] font-black uppercase animate-fadeIn">
                    âœ“ Saved
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => { setTempNotes(proposalNotes); setIsEditingDoc(true); }}
                  className="px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-[#FFEDD5] text-[#1F1917] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-2 border-[#1F1917] shadow-sm flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4 text-[#C2410C]" /> Edit Text
                </button>
                <button
                  type="button"
                  onClick={() => handleViewPdfWindow(false)}
                  className="px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-[#FFEDD5] text-[#1F1917] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-2 border-[#1F1917] shadow-sm flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-[#C2410C]" /> View PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePdfWindow(false)}
                  className="px-3.5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md border border-[#1F1917] flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleExportDocxFor(false)}
                  className="px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md border border-[#FDBA74] flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download (.DOC)
                </button>
              </div>
            </div>
            )}

            {/* INLINE PROPOSAL DOCUMENT EDITOR MODAL */}
            {isEditingDoc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1917]/80 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white border-4 border-[#1F1917] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b-2 border-[#1F1917] pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider mb-1">
                        <Edit3 className="w-3.5 h-3.5" /> LIVE INLINE DOCUMENT EDITOR
                      </div>
                      <h3 className="text-xl font-black text-[#1F1917] font-serif uppercase">
                        Edit Master Executive Proposal Document
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsEditingDoc(false)}
                      className="px-3 py-1.5 bg-[#FAF8F5] text-[#1F1917] rounded-xl text-xs font-bold border border-[#1F1917] cursor-pointer"
                    >
                      âœ• Close
                    </button>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1 uppercase">
                        Executive Summary & Brand Thesis Text
                      </label>
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        rows={8}
                        className="w-full bg-[#FAF8F5] border-2 border-[#1F1917] rounded-2xl p-4 text-xs font-mono text-[#1F1917] leading-relaxed focus:border-[#C2410C] focus:outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5DFD3] flex items-center justify-end gap-3">
                    <button
                      onClick={() => setIsEditingDoc(false)}
                      className="px-5 py-2.5 bg-[#FAF8F5] text-[#1F1917] font-bold text-xs uppercase rounded-xl border border-[#1F1917] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setProposalNotes(tempNotes);
                        localStorage.setItem('myplan_admin_proposal_notes', tempNotes);
                        setIsEditingDoc(false);
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2500);
                      }}
                      className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-[#1F1917] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Save Document Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PROPOSAL DOCUMENT PREVIEW â€” large window */}
            {documentPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-[#1F1917]/85 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white border-4 border-[#1F1917] rounded-2xl w-[min(1400px,98vw)] h-[96vh] shadow-2xl flex flex-col overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1F1917] p-4 sm:p-5 shrink-0">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider mb-1">
                        <Eye className="w-3.5 h-3.5" /> DOCUMENT PREVIEW
                      </div>
                      <h3 className="text-lg font-black text-[#1F1917] font-serif uppercase">
                        {documentPreview.showPricing ? 'Internal Plan & Budget' : "Angela's Plan â€” Scope Only"}
                      </h3>
                      <p className="text-[10px] text-[#3F3832] font-mono mt-0.5">
                        {PROPOSAL_PHASE_LABELS[proposalViewPhase]}
                        {documentPreview.showPricing && (
                          <> Â· {selectedDiscountTier}% tier Â· {formatUsd(getDiscountedTotal(selectedDiscountTier))}</>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSavePdfFromIframe(proposalIframeRef.current)}
                        className="px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-[10px] uppercase rounded-xl cursor-pointer border border-[#FDBA74] flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Save PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportDocxFor(documentPreview.showPricing)}
                        className="px-3.5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-[10px] uppercase rounded-xl cursor-pointer border border-[#1F1917] flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Save Word
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadProposalHtml(documentPreview.showPricing)}
                        className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#FFEDD5] text-[#1F1917] font-black text-[10px] uppercase rounded-xl cursor-pointer border-2 border-[#1F1917] flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Save HTML
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProposalVersion}
                        className="px-3.5 py-2 bg-[#10B981] hover:bg-emerald-700 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer border border-[#1F1917] flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Version
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocumentPreview(null)}
                        className="px-3 py-2 bg-[#EA580C] text-white rounded-xl text-[10px] font-black uppercase cursor-pointer"
                      >
                        âœ• Close
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 bg-[#E5DFD3] p-3 sm:p-4">
                    <iframe
                      ref={proposalIframeRef}
                      title="Proposal Document Preview"
                      srcDoc={proposalPreviewHtml}
                      className="w-full h-full min-h-[78vh] rounded-2xl border-2 border-[#1F1917] bg-white"
                    />
                  </div>

                  {savedProposalVersions.length > 0 && (
                    <div className="border-t border-[#E5DFD3] p-4 max-h-28 overflow-y-auto shrink-0 space-y-2">
                      <div className="text-[10px] font-mono font-black uppercase text-[#3F3832] tracking-wider">
                        Saved Versions ({savedProposalVersions.length})
                      </div>
                      {savedProposalVersions.map((version) => (
                        <div
                          key={version.id}
                          className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3]"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#1F1917] truncate">{version.name}</div>
                            <div className="text-[9px] font-mono text-[#3F3832]">
                              {new Date(version.savedAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleLoadProposalVersion(version)}
                              className="px-2.5 py-1 rounded-lg bg-[#C2410C] text-white text-[9px] font-black uppercase cursor-pointer"
                            >
                              Load
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProposalVersion(version.id)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-red-300 text-red-600 text-[9px] font-black uppercase cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isSignoffOpen && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1F1917]/80 backdrop-blur-sm animate-fadeIn"
                role="dialog"
                aria-modal="true"
                aria-labelledby="phase1-signoff-title"
                data-testid="phase1-contract-signoff-modal"
              >
                <div className="bg-white border-4 border-[#1F1917] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
                  <div className="flex items-start justify-between gap-3 border-b-2 border-[#1F1917] pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider mb-1">
                        <PenLine className="w-3.5 h-3.5" /> Electronic Signature
                      </div>
                      <h3 id="phase1-signoff-title" className="text-xl font-black text-[#1F1917] font-serif uppercase">
                        Approve Phase 1 Contract
                      </h3>
                      <p className="text-sm text-[#3F3832] font-medium mt-1">
                        Typing your name and confirming is the electronic signature for Angela&apos;s Plan and the Phase 1 Merchandise Hosting Agreement.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSignoffOpen(false)}
                      className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#3F3832] hover:text-[#1F1917] rounded-xl cursor-pointer"
                      aria-label="Close Phase 1 contract sign-off"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <label htmlFor="phase1-signoff-name" className="block text-[10px] font-mono font-bold uppercase text-[#3F3832] mb-1">
                      Signer name
                    </label>
                    <input
                      id="phase1-signoff-name"
                      data-testid="phase1-signoff-name"
                      type="text"
                      value={signoffName}
                      onChange={(e) => {
                        setSignoffName(e.target.value);
                        if (signoffError) setSignoffError('');
                      }}
                      className="w-full min-h-[44px] px-3 py-2 border-2 border-[#1F1917] rounded-xl font-bold text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                      autoComplete="name"
                    />
                    {signoffError ? (
                      <p className="text-xs font-bold text-[#C2410C] mt-2" data-testid="phase1-signoff-error">
                        {signoffError}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSignoffOpen(false)}
                      className="min-h-[44px] px-5 py-2.5 bg-[#FAF8F5] text-[#1F1917] font-bold text-xs uppercase rounded-xl border border-[#1F1917] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      data-testid="phase1-signoff-confirm"
                      onClick={handleAngelaPlanSignoff}
                      className="min-h-[44px] px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-[#1F1917] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <PenLine className="w-4 h-4" /> Sign Phase 1
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Internal budget — shown first when Internal is selected */}
            {(activeTab === 'budget' || viewingPrevious) && canViewBudget && (
            <div
              id={PLAN_BUDGET_SECTION_ID}
              className="order-2 bg-white border-2 border-[#1F1917] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 scroll-mt-28"
              data-testid={viewingPrevious ? 'previous-interactive-budget' : 'internal-interactive-budget'}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DFD3] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#1F1917] uppercase tracking-wider font-mono">
                    {viewingPrevious ? 'Previous Budget' : '1. SPRINT LINE ITEM BREAKDOWN & ESTIMATES'}
                  </h3>
                  <p className="text-xs text-[#3F3832] mt-0.5">
                    {viewingPrevious
                      ? `Archived ${formatBudgetTimestamp(previousBudget.capturedAt)}. This is the pre-payment discount version.`
                      : `Flat rate $${CURRENT_BUDGET_FLAT_RATE.toLocaleString()} in three payments. ${phase1PaidBudgetCopy()}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#C2410C] bg-[#FFEDD5] px-3 py-1 rounded-full border border-[#C2410C]/20">
                    {activeFilteredItems.length} Active Modules Selected
                  </span>
                </div>
              </div>

              {/* Interactive Phase Toggle Control Bar */}
              <div className="bg-[#FAF8F5] border-2 border-[#1F1917] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-xs font-mono font-black uppercase text-[#1F1917] tracking-wider block">
                    Phase Scope Selector:
                  </span>
                  <p className="text-[11px] text-[#3F3832]">
                    {viewingPrevious
                      ? 'Archived pre-payment discount schedule. Numbers below are the previous budget.'
                      : `Flat rate $${CURRENT_BUDGET_FLAT_RATE.toLocaleString()} — no pre-payment discount.`}
                  </p>
                </div>
                <div className={BRAND_TAB_ROW_CLASS} role="tablist" aria-label="Budget phases">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={proposalViewPhase === 'all'}
                    onClick={() => setProposalViewPhase('all')}
                    className={brandTabClass(proposalViewPhase === 'all')}
                  >
                    All phases{showPricing && proposalViewPhase === 'all' && ` (${formatUsd(lineItems.reduce((s, i) => s + i.baseAmount, 0))})`}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={proposalViewPhase === 'phase1'}
                    onClick={() => setProposalViewPhase('phase1')}
                    className={brandTabClass(proposalViewPhase === 'phase1')}
                  >
                    Phase 1 · Gear{showPricing && proposalViewPhase === 'phase1' && ` (${formatUsd(phase1BaseTotal)})`}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={proposalViewPhase === 'phase2'}
                    onClick={() => setProposalViewPhase('phase2')}
                    className={brandTabClass(proposalViewPhase === 'phase2')}
                  >
                    Phase 2 · Memberships <ComingSoonBadge className={proposalViewPhase === 'phase2' ? 'bg-white text-[#059669] border-white' : ''} />{showPricing && proposalViewPhase === 'phase2' && ` (${formatUsd(phase2BaseTotal)})`}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={proposalViewPhase === 'phase3'}
                    onClick={() => setProposalViewPhase('phase3')}
                    className={brandTabClass(proposalViewPhase === 'phase3')}
                  >
                    Phase 3 · Future{showPricing && proposalViewPhase === 'phase3' && ` (${formatUsd(phase3BaseTotal)})`}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={proposalViewPhase === 'split'}
                    onClick={() => setProposalViewPhase('split')}
                    className={brandTabClass(proposalViewPhase === 'split')}
                  >
                    Side-by-side
                  </button>
                </div>
              </div>

              {showPricing && !viewingPrevious && (
                <PaymentScheduleCard compact />
              )}

              {/* Top Executive Pre-Payment Discount Schedule Bar — previous budget only */}
              {showPricing && viewingPrevious && (
              <DiscountSchedulePanel
                idPrefix="top"
                selectedDiscountTier={displayDiscountTier}
                onSelectTier={() => undefined}
                phase1BaseTotal={phase1BaseTotal}
                phase2BaseTotal={phase2BaseTotal}
                activeScopeBaseTotal={totalBasePrice}
                formatUsd={formatUsd}
                getDiscountedTotal={getDiscountedTotal}
                showPricing={showPricing}
                scopeLabel={
                  proposalViewPhase === 'phase1'
                    ? 'Phase 1 gear launch — archived scope'
                    : proposalViewPhase === 'phase2'
                      ? 'Phase 2 memberships — Coming Soon'
                      : proposalViewPhase === 'phase3'
                        ? 'Phase 3 — open for discussion'
                        : 'All phases — archived pre-payment budget'
                }
              />
              )}

              {/* Scope Table View / Split View */}
              {proposalViewPhase === 'split' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="border-2 border-[#C2410C] rounded-2xl p-4 bg-[#FAF8F5]/50 space-y-3">
                    <h4 className="text-sm font-black text-[#C2410C] uppercase font-serif px-1">
                      Phase 1 â€” Core Platform Build
                    </h4>
                    <ProposalSprintChecklist
                      items={phase1Items}
                      selectedDiscountTier={displayDiscountTier}
                      showPricing={showPricing}
                      formatUsd={formatUsd}
                      getLineItemNewPrice={getLineItemNewPrice}
                      getLineItemAmountSaved={getLineItemAmountSaved}
                      onToggleVisibility={viewingPrevious ? () => undefined : handleToggleLineItemVisibility}
                      onUpdateItem={viewingPrevious ? () => undefined : handleUpdateLineItem}
                      onUpdateDeliverable={viewingPrevious ? () => undefined : handleUpdateDeliverable}
                      onAddDeliverable={viewingPrevious ? () => undefined : handleAddDeliverable}
                      onRemoveDeliverable={viewingPrevious ? () => undefined : handleRemoveDeliverable}
                      readOnly={viewingPrevious}
                      defaultExpandedIds={['sprint0', 'sprint1']}
                    />
                  </div>
                  <div className="border-2 border-[#10B981] rounded-2xl p-4 bg-[#FAF8F5]/50 space-y-3">
                    <h4 className="text-sm font-black text-[#10B981] uppercase font-serif px-1">
                      Phase 2 â€” Add-Ons & Retainers
                    </h4>
                    <ProposalSprintChecklist
                      items={phase2Items}
                      selectedDiscountTier={displayDiscountTier}
                      showPricing={showPricing}
                      formatUsd={formatUsd}
                      getLineItemNewPrice={getLineItemNewPrice}
                      getLineItemAmountSaved={getLineItemAmountSaved}
                      onToggleVisibility={viewingPrevious ? () => undefined : handleToggleLineItemVisibility}
                      onUpdateItem={viewingPrevious ? () => undefined : handleUpdateLineItem}
                      onUpdateDeliverable={viewingPrevious ? () => undefined : handleUpdateDeliverable}
                      onAddDeliverable={viewingPrevious ? () => undefined : handleAddDeliverable}
                      onRemoveDeliverable={viewingPrevious ? () => undefined : handleRemoveDeliverable}
                      readOnly={viewingPrevious}
                      defaultExpandedIds={['socials-ad-infra']}
                    />
                  </div>
                </div>
              ) : (
                <ProposalSprintChecklist
                  items={activeFilteredItems}
                  selectedDiscountTier={displayDiscountTier}
                  showPricing={showPricing}
                  formatUsd={formatUsd}
                  getLineItemNewPrice={getLineItemNewPrice}
                  getLineItemAmountSaved={getLineItemAmountSaved}
                  onToggleVisibility={viewingPrevious ? () => undefined : handleToggleLineItemVisibility}
                  onUpdateItem={viewingPrevious ? () => undefined : handleUpdateLineItem}
                  onUpdateDeliverable={viewingPrevious ? () => undefined : handleUpdateDeliverable}
                  onAddDeliverable={viewingPrevious ? () => undefined : handleAddDeliverable}
                  onRemoveDeliverable={viewingPrevious ? () => undefined : handleRemoveDeliverable}
                  readOnly={viewingPrevious}
                  defaultExpandedIds={['sprint0']}
                />
              )}

            </div>
            )}
          </div>
        )}

        {/* TAB 2: IP & BRAND ASSETS */}
        {activeTab === 'ip' && (
          <div className="space-y-8 animate-fadeIn">
            <IpSprintSchedulePage
              lineItems={lineItems.map((item) => ({
                ...item,
                deliverables: deliverableLabelList(item.deliverables ?? []),
              }))}
              tasks={tasks}
              canEdit={getRolePermissions(permissionActor).canViewProposal}
              onAddItem={handleAddIpLineItem}
              onRemoveItem={handleRemoveIpLineItem}
              onUpdateItem={handleUpdateIpScheduleItem}
              extraTocItems={[
                {
                  id: IP_BRAND_ASSETS_ID,
                  label: 'Brand Assets',
                  subtitle: 'Logo, palette & marks',
                },
              ]}
            />

            <div
              id={IP_BRAND_ASSETS_ID}
              className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 scroll-mt-28"
            >
              <div className="flex flex-col gap-4 border-b border-[#E5DFD3] pb-4">
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  <Logo
                    variant="seal-only"
                    size="xl"
                    className="shrink-0 drop-shadow-md !w-20 !h-20 sm:!w-28 sm:!h-28 md:!w-36 md:!h-36"
                  />
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider mb-2">
                      <Shield className="w-3.5 h-3.5" /> BRAND ASSET REGISTRY
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1F1917] uppercase tracking-tight font-serif leading-tight">
                      MY PLAN, NOT MY MOOD â„¢ â€” IP & Brand Assets
                    </h3>
                  </div>
                </div>
              </div>

              {/* Logo Asset Downloads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FAF8F5] border border-[#1F1917] rounded-2xl p-5 sm:p-6 flex flex-row items-center gap-4 sm:gap-5 text-left">
                  <div className="p-3 sm:p-4 bg-white rounded-2xl border border-[#E5DFD3] shadow-md shrink-0">
                    <Logo
                      variant="seal-only"
                      size="xl"
                      className="!w-24 !h-24 sm:!w-32 sm:!h-32 md:!w-36 md:!h-36"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1 gap-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-[#1F1917] uppercase">Brand Seal SVG Vector</h4>
                      <p className="text-xs text-[#3F3832] mt-1">Frameless transparent SVG seal for hats, tags, and app headers.</p>
                    </div>
                    <button
                      onClick={() => alert('Downloading Vector Seal SVG...')}
                      className="self-start px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" /> Download SVG Seal
                    </button>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#1F1917] rounded-2xl p-5 sm:p-6 flex flex-row items-center gap-4 sm:gap-5 text-left">
                  <div className="p-3 sm:p-4 bg-white rounded-2xl border border-[#E5DFD3] shadow-md shrink-0">
                    <Logo
                      variant="horizontal"
                      size="lg"
                      className="shrink-0 !gap-3 sm:!gap-4 [&_img]:!w-20 [&_img]:!h-20 sm:[&_img]:!w-28 sm:[&_img]:!h-28"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1 gap-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-[#1F1917] uppercase">Full Wordmark Lockup</h4>
                      <p className="text-xs text-[#3F3832] mt-1">Complete horizontal brand logo lockup for banners and packaging.</p>
                    </div>
                    <button
                      onClick={() => alert('Downloading Wordmark PNG...')}
                      className="self-start px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full Lockup
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Swatch Palette */}
              <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
                <h4 className="text-sm font-black text-[#1F1917] font-mono uppercase">Official Brand Color Palette</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { name: 'Warm Cream', hex: '#FAF8F5', bg: 'bg-[#FAF8F5]', text: 'text-[#1F1917]' },
                    { name: 'Dark Espresso', hex: '#1F1917', bg: 'bg-[#1F1917]', text: 'text-white' },
                    { name: 'Rust Orange', hex: '#C2410C', bg: 'bg-[#C2410C]', text: 'text-white' },
                    { name: 'Gold Tone', hex: '#F59E0B', bg: 'bg-[#F59E0B]', text: 'text-[#1F1917]' },
                    { name: 'Victory Green', hex: '#10B981', bg: 'bg-[#10B981]', text: 'text-white' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => copyToClipboard(c.hex)}
                      className={`${c.bg} ${c.text} p-4 rounded-2xl border-2 border-[#1F1917] shadow-md text-left transition-transform hover:scale-105 cursor-pointer`}
                    >
                      <div className="text-xs font-black uppercase">{c.name}</div>
                      <div className="text-[10px] font-mono font-bold flex items-center justify-between mt-2">
                        {c.hex}
                        {copiedHex === c.hex ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* IP Trademark Statement */}
              <div className="bg-[#FFEDD5] border-2 border-[#C2410C] rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-black text-[#C2410C] uppercase tracking-wider font-mono">
                  TRADEMARK & COPYRIGHT DECLARATION
                </h4>
                <p className="text-xs text-[#1F1917] font-medium leading-relaxed">
                  "MY PLAN, NOT MY MOOD" â„¢ and "DO NOT LET A TEMPORARY MOOD DETERMINE A PERMANENT OUTCOME" â„¢ are protected proprietary marks of {CLIENT_DISPLAY_NAME} and Muntie Ev's AI Studio. All rights reserved across digital software, apparel line, and stationary publications.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TESTING PORTAL & QA MATRIX */}
        {activeTab === 'testing' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5" data-testid="qa-suite-cards">
              {qaSuiteChips.map((chip) => {
                const showingAll = qaSuiteFilter.size === 0;
                const selected = showingAll || qaSuiteFilter.has(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    data-testid={`qa-suite-${chip.id}`}
                    data-active={selected && !showingAll}
                    onClick={() => {
                      setQaSuiteFilter((prev) => {
                        if (prev.size === 1 && prev.has(chip.id)) return new Set();
                        return new Set([chip.id]);
                      });
                    }}
                    className={`text-left rounded-xl px-3 py-2 border-2 min-h-[44px] cursor-pointer ${
                      selected && !showingAll
                        ? 'border-[#C2410C] bg-[#FFEDD5] text-[#9A3412]'
                        : 'border-[#E7E0D6] bg-[#FAF8F5] text-[#1F1917]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: chip.accent }} />
                        <span className="text-xs font-sans font-black uppercase tracking-wide truncate">
                          {chip.label}
                        </span>
                      </span>
                      <span className="text-base font-black font-serif tabular-nums shrink-0">
                        {chip.done}/{chip.total}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <WorkBoardPersistBar
              notice={workBoardNotice}
              saving={workBoardSaving}
              onSave={saveWorkBoardNow}
              canSave={workBoardHasUnsaved}
            />
            <WorkBoardStatusLegend items={qaStatusLegend()} testId="qa-status-legend" />

            <WorkBoardFilterPanel<QaStatusFilter>
              search={qaSearch}
              onSearchChange={setQaSearch}
              searchPlaceholder="Search QA tests, category, sprint, assigneeâ€¦"
              sprintChips={qaSprintChips}
              statusChips={qaStatusChips}
              priorityChips={qaPriorityChips}
              assigneeChips={qaAssigneeChips}
              categoryChips={qaCategoryChips}
              sprintFilter={qaFilters.sprint}
              statusFilter={qaFilters.status}
              priorityFilter={qaFilters.priority}
              assigneeFilter={qaFilters.assignee}
              categoryFilter={qaFilters.category}
              sprintOrdered={SPRINT_OPTIONS}
              statusOrdered={QA_STATUS_FILTER_OPTIONS}
              priorityOrdered={PRIORITY_OPTIONS}
              assigneeOrdered={qaAssigneeOrdered}
              categoryOrdered={QA_CATEGORIES}
              onSprintChange={(next) => setQaFilters((prev) => ({ ...prev, sprint: next as Set<SprintCategory> }))}
              onStatusChange={(next) => setQaFilters((prev) => ({ ...prev, status: next }))}
              onPriorityChange={(next) => setQaFilters((prev) => ({ ...prev, priority: next as Set<WorkPriority> }))}
              onAssigneeChange={(next) => {
                setQaFilters((prev) => ({ ...prev, assignee: next as Set<WorkAssignee> }));
                if (next.has('vitest') && next.size === 1) setQaSuiteFilter(new Set(['vitest']));
                else if (next.has('playwright') && next.size === 1) setQaSuiteFilter(new Set(['playwright']));
                else if (next.has('vitest') || next.has('playwright')) setQaSuiteFilter(new Set());
                else if (next.size > 0) setQaSuiteFilter(defaultQaSuiteFilter());
              }}
              onCategoryChange={(next) => setQaFilters((prev) => ({ ...prev, category: next }))}
              dueFilter={qaFilters.due}
              onDueChange={(next) => setQaFilters((prev) => ({ ...prev, due: next }))}
              filteredCount={filteredQaTests.length}
              totalCount={suiteScopedQaTests.length}
              testIdPrefix="qa-board"
            />

            {/* Filtered QA Test Matrix */}
            <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-3 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DFD3] pb-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFEDD5] text-[#C2410C] text-[10px] font-sans font-black uppercase tracking-wide mb-1">
                    <Sparkles className="w-3 h-3" /> QA VERIFICATION MATRIX
                  </div>
                  <h3 className="text-base font-black text-[#1F1917] uppercase tracking-tight font-serif">
                    {qaSuiteFilter.size === 1 && qaSuiteFilter.has('vitest')
                      ? 'VITEST UNIT TESTS'
                      : qaSuiteFilter.size === 1 && qaSuiteFilter.has('playwright')
                        ? 'PLAYWRIGHT BROWSER TESTS'
                        : qaSuiteFilter.size === 0
                          ? 'ALL SUITES'
                          : 'MANUAL & FEATURE QA TESTS'}
                  </h3>
                </div>
                <span
                  className="text-xs font-mono font-bold text-[#1F1917] bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#E7E0D6]"
                  data-testid="qa-board-counts"
                >
                  {passedQaCount}/{suiteScopedQaTests.length} Passed
                  {rolledOverQaCount > 0 ? ` · ${formatRolledOverCount(rolledOverQaCount)}` : ''}
                </span>
              </div>

              <WorkBoardBulkBar
                selectedCount={selectedVisibleQaCount}
                visibleCount={visibleQaIds.length}
                allVisibleSelected={allIdsSelected(selectedQaIds, visibleQaIds)}
                onToggleSelectAllVisible={() =>
                  setSelectedQaIds((current) =>
                    setManySelected(current, visibleQaIds, !allIdsSelected(current, visibleQaIds)),
                  )
                }
                onClearSelection={() => setSelectedQaIds(new Set())}
                testId="qa-bulk-bar"
                onSave={saveWorkBoardNow}
                saving={workBoardSaving}
                canSave={workBoardHasUnsaved}
                fields={[
                  {
                    id: 'status',
                    label: 'Status',
                    options: QA_STATUSES.map((status) => ({ value: status, label: QA_STATUS_LABELS[status] })),
                    onApply: (value) => handleBulkUpdateQa([...selectedQaIds], { status: value as QaStatus }),
                  },
                  {
                    id: 'sprint',
                    label: 'Sprint',
                    options: SPRINT_OPTIONS.map((sprint) => ({ value: sprint, label: sprintLabelWithDates(sprint) })),
                    onApply: (value) => handleBulkUpdateQa([...selectedQaIds], { sprint: value as SprintCategory }),
                  },
                  {
                    id: 'priority',
                    label: 'Priority',
                    options: PRIORITY_OPTIONS.map((priority) => ({ value: priority, label: PRIORITY_LABELS[priority] })),
                    onApply: (value) => handleBulkUpdateQa([...selectedQaIds], { priority: value as WorkPriority }),
                  },
                  {
                    id: 'assignee',
                    label: 'Assignee',
                    options: qaHumanAssignees.map((assignee) => ({ value: assignee, label: qaAssigneeLabels[assignee] })),
                    onApply: (value) => handleBulkUpdateQa([...selectedQaIds], { assignee: value as WorkAssignee }),
                  },
                  {
                    id: 'category',
                    label: 'Category',
                    options: QA_CATEGORIES.map((category) => ({ value: category, label: category })),
                    onApply: (value) => handleBulkUpdateQa([...selectedQaIds], { category: value as QaCategory }),
                  },
                ]}
                dateFields={[
                  {
                    id: 'dueDate',
                    label: 'Due date',
                    onApply: (value) => handleBulkUpdateQa([...selectedQaIds], { dueDate: value }),
                  },
                ]}
              />

              {filteredQaTests.length === 0 ? (
                <p className="text-sm text-[#3F3832] font-medium text-center py-8">
                  No QA tests match the current filters. Clear filters or adjust your search.
                </p>
              ) : (
                <WorkBoardSprintSections
                  items={filteredQaTests}
                  openSections={qaOpenSections}
                  onToggleSection={toggleQaSection}
                  isDone={(test) => test.status === 'passed'}
                  selectedIds={selectedQaIds}
                  onToggleSelected={(id) => setSelectedQaIds((current) => toggleSelectedId(current, id))}
                  onToggleSectionSelected={(ids, selectAll) =>
                    setSelectedQaIds((current) => setManySelected(current, ids, selectAll))
                  }
                  bulkBar={() => null}
                  saveAll={{
                    onSave: saveWorkBoardNow,
                    saving: workBoardSaving,
                    enabled: workBoardHasUnsaved,
                  }}
                  sort={qaSort}
                  columnBar={
                    <WorkBoardColumnBar
                      sort={qaSort}
                      onSort={setQaSort}
                      sprintFilter={qaFilters.sprint}
                      sprintOrdered={SPRINT_OPTIONS}
                      onSprintChange={(next) => setQaFilters((prev) => ({ ...prev, sprint: next as Set<SprintCategory> }))}
                      statusFilter={qaFilters.status}
                      statusOrdered={QA_STATUS_FILTER_OPTIONS}
                      statusLabels={QA_STATUS_FILTER_LABELS}
                      onStatusChange={(next) => setQaFilters((prev) => ({ ...prev, status: next }))}
                      assigneeFilter={qaFilters.assignee}
                      assigneeOrdered={qaAssigneeOrdered}
                      assigneeLabels={qaAssigneeLabels}
                      onAssigneeChange={(next) => setQaFilters((prev) => ({ ...prev, assignee: next as Set<WorkAssignee> }))}
                      dueFilter={qaFilters.due}
                      onDueChange={(next) => setQaFilters((prev) => ({ ...prev, due: next }))}
                      testIdPrefix="qa-board"
                    />
                  }
                  renderItem={(test) => (
                    <WorkBoardExpandableRow
                      id={test.id}
                      code={formatQaCode(test.id, qaTests)}
                      title={test.title}
                      sprint={test.sprint}
                      open={Boolean(openQaRows[test.id])}
                      onToggle={() => setOpenQaRows((prev) => toggleWorkItemOpen(prev, test.id))}
                      className={qaStatusRowClass(test.status)}
                      status={test.status}
                      priority={test.priority}
                      overdue={isWorkDueDatePast(test.dueDate) && test.status !== 'passed'}
                      saving={false}
                      canSave={
                        workItemIsDirty(dirtyTestIds, test.id) ||
                        workRowHasUnsavedEdits(test.id, qaRowFingerprint(test), lastSavedTestRowsRef.current)
                      }
                      onSave={saveWorkBoardNow}
                      saveLabel={`Save ${formatQaCode(test.id, qaTests)} to database`}
                      onDelete={() => handleDeleteQa(test.id)}
                      deleteLabel={`Delete ${test.title}`}
                      badges={
                        <>
                          <WorkBoardHeaderSelect
                            ariaLabel="Sprint"
                            testId={`work-row-sprint-${test.id}`}
                            value={test.sprint}
                            onChange={(value) => handleUpdateQa(test.id, { sprint: value as SprintCategory })}
                            options={sprintSelectOptions(SPRINT_OPTIONS, test.sprint).map((sprint) => ({ value: sprint, label: sprintLabelWithDates(sprint) }))}
                            className={`${sprintControlClass(test.sprint)} border-current`}
                          />
                          <WorkBoardHeaderSelect
                            ariaLabel="Status"
                            testId={`work-row-status-${test.id}`}
                            value={test.status}
                            onChange={(value) => handleUpdateQa(test.id, { status: value as QaStatus })}
                            options={QA_STATUSES.map((status) => ({
                              value: status,
                              label: status === 'fixed_retest' || status === 'failed_retest'
                                ? `${QA_STATUS_LABELS[status]} (${QA_STATUS_SHORT_LABELS[status]})`
                                : QA_STATUS_LABELS[status],
                            }))}
                            className={qaStatusBadgeClass(test.status)}
                          />
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 h-7 inline-flex items-center rounded border"
                            style={{
                              background: `${{ manual: '#FFEDD5', vitest: '#DBEAFE', playwright: '#EDE9FE' }[suiteForQaTest(test)]}`,
                              color: `${{ manual: '#C2410C', vitest: '#1D4ED8', playwright: '#6D28D9' }[suiteForQaTest(test)]}`,
                              borderColor: `${{ manual: '#FDBA74', vitest: '#93C5FD', playwright: '#C4B5FD' }[suiteForQaTest(test)]}`,
                            }}
                          >
                            {SUITE_LABELS[suiteForQaTest(test)]}
                          </span>
                          {isAutomatedQaTest(test) ? (
                            <span className="text-[9px] font-mono font-bold px-1.5 h-7 inline-flex items-center rounded bg-[#F6EBE4] text-[#6B3A2C] border border-[#C9A08C]/60">
                              {SUITE_LABELS[suiteForQaTest(test)]}
                            </span>
                          ) : (
                            <WorkBoardHeaderSelect
                              ariaLabel="Assignee"
                              value={test.assignee}
                              onChange={(value) => handleUpdateQa(test.id, { assignee: value as WorkAssignee })}
                              options={qaHumanAssignees.map((assignee) => ({
                                value: assignee,
                                label: qaAssigneeLabels[assignee],
                              }))}
                              className="bg-[#F6EBE4] text-[#6B3A2C] border-[#C9A08C]/60"
                            />
                          )}
                          <WorkBoardHeaderDate
                            value={test.dueDate ?? ''}
                            overdue={isWorkDueDatePast(test.dueDate) && test.status !== 'passed'}
                            testId={`work-row-due-${test.id}`}
                            onChange={(value) => handleUpdateQa(test.id, { dueDate: value })}
                          />
                        </>
                      }
                    >
                      <WorkBoardFieldGrid>
                        <WorkBoardField label="Title">
                          <input
                            type="text"
                            value={test.title}
                            onChange={(e) => handleUpdateQa(test.id, { title: e.target.value })}
                            className={`${workBoardFieldClassName} ${workDueDateTextClass(test.dueDate, { done: test.status === 'passed' })}`}
                            aria-label="Test title"
                          />
                        </WorkBoardField>
                        <WorkBoardField label="Sprint">
                          <select
                            value={test.sprint}
                            onChange={(e) => handleUpdateQa(test.id, { sprint: e.target.value as SprintCategory })}
                            className={workBoardFieldClassName}
                            aria-label="Sprint"
                          >
                            {sprintSelectOptions(SPRINT_OPTIONS, test.sprint).map((s) => <option key={s} value={s}>{sprintLabelWithDates(s)}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Phase">
                          <select
                            value={test.phase ?? 'Phase 1'}
                            onChange={(e) => handleUpdateQa(test.id, { phase: e.target.value as WorkPhase })}
                            className={workBoardFieldClassName}
                            aria-label="Phase"
                          >
                            {PHASE_OPTIONS.map((p) => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Category">
                          <select
                            value={test.category}
                            onChange={(e) => handleUpdateQa(test.id, { category: e.target.value as QaCategory })}
                            className={workBoardFieldClassName}
                            aria-label="Category"
                          >
                            {QA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Priority">
                          <select
                            value={test.priority}
                            onChange={(e) => handleUpdateQa(test.id, { priority: e.target.value as WorkPriority })}
                            className={workBoardFieldClassName}
                            aria-label="Priority"
                          >
                            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Status">
                          <select
                            value={test.status}
                            onChange={(e) => handleUpdateQa(test.id, { status: e.target.value as QaStatus })}
                            className={`${workBoardFieldClassName} border-2 ${qaStatusBadgeClass(test.status)}`}
                            aria-label="Status"
                          >
                            {QA_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {QA_STATUS_LABELS[s]}
                                {s === 'fixed_retest' || s === 'failed_retest'
                                  ? ` (${QA_STATUS_SHORT_LABELS[s]})`
                                  : ''}
                              </option>
                            ))}
                          </select>
                          <p className="text-[10px] text-[#6B5344] leading-snug mt-1">
                            Fail → Dev. Dev sets Fixed/Retest (FXR) or Failed/Retest (FD/R) → back to tester to Pass or Fail.
                            Tasks do not use this cycle.
                          </p>
                        </WorkBoardField>
                        <WorkBoardField label="Assignee">
                          {isAutomatedQaTest(test) ? (
                            <p className="text-xs font-bold text-[#1F1917] py-2">
                              {SUITE_LABELS[suiteForQaTest(test)]} suite — not Angela or Evelyn
                            </p>
                          ) : (
                            <select
                              value={test.assignee}
                              onChange={(e) => handleUpdateQa(test.id, { assignee: e.target.value as WorkAssignee })}
                              className={workBoardFieldClassName}
                              aria-label="Assignee"
                            >
                              {qaHumanAssignees.map((a) => <option key={a} value={a}>{qaAssigneeLabels[a]}</option>)}
                            </select>
                          )}
                        </WorkBoardField>
                        <WorkBoardField label="Assignor">
                          <select
                            value={normalizeAssignor(test.assignor)}
                            onChange={(e) => handleUpdateQa(test.id, { assignor: e.target.value as WorkAssignee })}
                            className={workBoardFieldClassName}
                            aria-label="Assignor"
                          >
                            {ASSIGNOR_OPTIONS.map((a) => <option key={a} value={a}>{ASSIGNEE_LABELS[a]}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Due date">
                          <input
                            type="date"
                            value={test.dueDate ?? ''}
                            onChange={(e) => handleUpdateQa(test.id, { dueDate: e.target.value })}
                            className={`${workBoardFieldClassName} ${workDueDateControlClass(isWorkDueDatePast(test.dueDate) && test.status !== 'passed')}`}
                            aria-label="Due date"
                          />
                        </WorkBoardField>
                      </WorkBoardFieldGrid>
                      <WorkItemDescriptionChecklist
                        kind="test"
                        steps={test.steps ?? []}
                        actor={{ isSuperAdmin: portalPerms.canEditWorkChecklistSteps }}
                        relatedLinks={(test.linkedTaskIds ?? []).map((taskId) => {
                          const task = tasks.find((row) => row.id === taskId);
                          return {
                            code: formatTaskCode(taskId, tasks),
                            title: task?.title ?? taskId,
                            href: '/admin/tasks',
                          };
                        })}
                        testId={`qa-desc-${test.id}`}
                        onStepsChange={(next) => handleUpdateQa(test.id, { steps: next })}
                      />
                      <WorkItemNotesAttachments
                        itemKind="test"
                        itemId={test.id}
                        itemTitle={test.title}
                        notesRaw={test.desc}
                        attachments={test.attachments ?? []}
                        actor={{
                          name: permissionActor?.name ?? currentUser.name,
                          email: permissionActor?.email ?? currentUser.email,
                          isSuperAdmin: portalPerms.isSuperAdmin,
                        }}
                        testId={`qa-notes-${test.id}`}
                        onNotesChange={(next) => handleUpdateQa(test.id, { desc: next })}
                        onAttachmentsChange={(next) =>
                          handleUpdateQa(test.id, { attachments: next })
                        }
                      />
                    </WorkBoardExpandableRow>
                  )}
                />
              )}

              {/* Voice Trust Layer Planned Architecture Document */}
              <div className="bg-[#1F1917] text-white rounded-2xl p-5 border-2 border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-amber-300 shrink-0" aria-hidden />
                    <h4 className="font-serif font-black text-sm text-white uppercase">
                      Voice Trust Layer {'\u2014'} Planned Feature Architecture
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded uppercase font-black">
                    Future / Planned Release
                  </span>
                </div>
                <p className="text-xs text-white leading-relaxed font-sans">
                  The Voice Trust Layer is designed to empower users to read affirmations aloud with instant vocal feedback. Delivery style will embody documentary narrator energy (comfort + authority: &quot;Again. Stronger.&quot;). Data model interfaces (<code className="text-amber-300">VoiceTrustAttempt</code>) and schemas have been prepared cleanly in <code className="text-amber-300">src/lib/affirmations.ts</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TASK PAGE & ROADMAP */}
        {activeTab === 'tasks' && (
          <div className="space-y-3 animate-fadeIn">
            <WorkBoardCollapsibleSummary
              title="Sprint work board"
              countLabel={`${completedTaskCount} of ${tasks.length} tasks completed${rolledOverTaskCount > 0 ? ` · ${formatRolledOverCount(rolledOverTaskCount)}` : ''}`}
              percentLabel={`${taskProgressPercent}% done`}
              open={taskSummaryOpen}
              onToggle={() => setTaskSummaryOpen((prev) => !prev)}
              testId="task-summary"
            >
              <p className="text-xs font-medium text-[#3F281C] max-w-2xl">
                Search, filter by sprint bubbles, then select rows to bulk-update status, assignee, priority, or category.
              </p>
              <WorkBoardPersistBar
                notice={workBoardNotice}
                saving={workBoardSaving}
                onSave={saveWorkBoardNow}
                canSave={workBoardHasUnsaved}
              />
              <WorkBoardStatusLegend items={taskStatusLegend()} testId="task-status-legend" />
              <div className="w-full bg-[#FAF0DE] h-4 rounded-full overflow-hidden border border-[#E8B87A]">
                <div
                  className="bg-[#E8B87A] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>
            </WorkBoardCollapsibleSummary>

            <WorkBoardFilterPanel<TaskStatusFilter>
              search={taskSearch}
              onSearchChange={setTaskSearch}
              searchPlaceholder="Search tasks, category, sprint, assigneeâ€¦"
              sprintChips={taskSprintChips}
              statusChips={taskStatusChips}
              priorityChips={taskPriorityChips}
              assigneeChips={taskAssigneeChips}
              categoryChips={taskCategoryChips}
              sprintFilter={taskFilters.sprint}
              statusFilter={taskFilters.status}
              priorityFilter={taskFilters.priority}
              assigneeFilter={taskFilters.assignee}
              categoryFilter={taskFilters.category}
              sprintOrdered={SPRINT_OPTIONS}
              statusOrdered={TASK_STATUS_FILTER_OPTIONS}
              priorityOrdered={PRIORITY_OPTIONS}
              assigneeOrdered={taskAssigneeOrdered}
              categoryOrdered={TASK_CATEGORIES}
              onSprintChange={(next) => setTaskFilters((prev) => ({ ...prev, sprint: next as Set<SprintCategory> }))}
              onStatusChange={(next) => setTaskFilters((prev) => ({ ...prev, status: next }))}
              onPriorityChange={(next) => setTaskFilters((prev) => ({ ...prev, priority: next as Set<WorkPriority> }))}
              onAssigneeChange={(next) => setTaskFilters((prev) => ({ ...prev, assignee: next as Set<WorkAssignee> }))}
              onCategoryChange={(next) => setTaskFilters((prev) => ({ ...prev, category: next }))}
              dueFilter={taskFilters.due}
              onDueChange={(next) => setTaskFilters((prev) => ({ ...prev, due: next }))}
              filteredCount={filteredTasks.length}
              totalCount={tasks.length}
              testIdPrefix="task-board"
            />

            <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-3 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DFD3] pb-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7FB3A8] text-[#1F3F38] text-[10px] font-sans font-black uppercase tracking-wide mb-1">
                    <CheckSquare className="w-3 h-3" /> TASK VERIFICATION BOARD
                  </div>
                  <h3 className="text-base font-black text-[#1F1917] uppercase tracking-tight font-serif">
                    SPRINT TASKS &amp; ROADMAP
                  </h3>
                </div>
                <span
                  className="text-xs font-mono font-bold text-[#5C3328] bg-[#F6EBE4] px-3 py-1 rounded-xl border border-[#C9A08C]"
                  data-testid="task-board-counts"
                >
                  {completedTaskCount}/{tasks.length} Done
                  {rolledOverTaskCount > 0 ? ` · ${formatRolledOverCount(rolledOverTaskCount)}` : ''}
                </span>
              </div>

              <form onSubmit={handleAddTask} className="flex flex-col md:flex-row flex-wrap gap-3 items-center">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new roadmap task..."
                  className="flex-1 min-w-[12rem] w-full min-h-[44px] bg-[#FAF8F5] border-2 border-[#C9A08C] rounded-xl px-4 text-xs font-bold focus:border-[#E8B87A] focus:outline-none"
                  required
                />
                <select
                  value={newTaskSprint}
                  onChange={(e) => setNewTaskSprint(e.target.value as SprintCategory)}
                  className="w-full md:w-auto min-h-[44px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3 text-xs font-bold cursor-pointer"
                >
                  {sprintSelectOptions(SPRINT_OPTIONS).map((s) => (
                    <option key={s} value={s}>{sprintLabelWithDates(s)}</option>
                  ))}
                </select>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                  className="w-full md:w-auto min-h-[44px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3 text-xs font-bold cursor-pointer"
                >
                  {TASK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as WorkPriority)}
                  className="w-full md:w-auto min-h-[44px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3 text-xs font-bold cursor-pointer"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value as WorkAssignee)}
                  className="w-full md:w-auto min-h-[44px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3 text-xs font-bold cursor-pointer"
                >
                  {taskAssigneeOrdered.map((a) => (
                    <option key={a} value={a}>{taskAssigneeLabels[a]}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full md:w-auto min-h-[44px] px-5 bg-[#F5D4A8] hover:bg-[#E8B87A] text-[#4A2E24] font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-sm border-2 border-[#E8B87A] flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </form>

              <WorkBoardBulkBar
                selectedCount={selectedVisibleTaskCount}
                visibleCount={visibleTaskIds.length}
                allVisibleSelected={allIdsSelected(selectedTaskIds, visibleTaskIds)}
                onToggleSelectAllVisible={() =>
                  setSelectedTaskIds((current) =>
                    setManySelected(current, visibleTaskIds, !allIdsSelected(current, visibleTaskIds)),
                  )
                }
                onClearSelection={() => setSelectedTaskIds(new Set())}
                testId="task-bulk-bar"
                onSave={saveWorkBoardNow}
                saving={workBoardSaving}
                canSave={workBoardHasUnsaved}
                fields={[
                  {
                    id: 'status',
                    label: 'Status',
                    options: TASK_STATUSES.map((status) => ({ value: status, label: TASK_STATUS_LABELS[status] })),
                    onApply: (value) => handleBulkUpdateTasks([...selectedTaskIds], { status: value as TaskStatus }),
                  },
                  {
                    id: 'sprint',
                    label: 'Sprint',
                    options: SPRINT_OPTIONS.map((sprint) => ({ value: sprint, label: sprintLabelWithDates(sprint) })),
                    onApply: (value) => handleBulkUpdateTasks([...selectedTaskIds], { sprint: value as SprintCategory }),
                  },
                  {
                    id: 'priority',
                    label: 'Priority',
                    options: PRIORITY_OPTIONS.map((priority) => ({ value: priority, label: PRIORITY_LABELS[priority] })),
                    onApply: (value) => handleBulkUpdateTasks([...selectedTaskIds], { priority: value as WorkPriority }),
                  },
                  {
                    id: 'assignee',
                    label: 'Assignee',
                    options: taskAssigneeOrdered.map((assignee) => ({ value: assignee, label: taskAssigneeLabels[assignee] })),
                    onApply: (value) => handleBulkUpdateTasks([...selectedTaskIds], { assignee: value as WorkAssignee }),
                  },
                  {
                    id: 'category',
                    label: 'Category',
                    options: TASK_CATEGORIES.map((category) => ({ value: category, label: category })),
                    onApply: (value) => handleBulkUpdateTasks([...selectedTaskIds], { category: value as TaskCategory }),
                  },
                ]}
                dateFields={[
                  {
                    id: 'dueDate',
                    label: 'Due date',
                    onApply: (value) => handleBulkUpdateTasks([...selectedTaskIds], { dueDate: value }),
                  },
                ]}
              />

              {filteredTasks.length === 0 ? (
                <p className="text-sm text-[#3F3832] font-medium text-center py-8">
                  No tasks match the current filters. Clear filters or adjust your search.
                </p>
              ) : (
                <WorkBoardSprintSections
                  items={filteredTasks}
                  openSections={taskOpenSections}
                  onToggleSection={toggleTaskSection}
                  isDone={(task) => task.status === 'done'}
                  selectedIds={selectedTaskIds}
                  onToggleSelected={(id) => setSelectedTaskIds((current) => toggleSelectedId(current, id))}
                  onToggleSectionSelected={(ids, selectAll) =>
                    setSelectedTaskIds((current) => setManySelected(current, ids, selectAll))
                  }
                  bulkBar={() => null}
                  saveAll={{
                    onSave: saveWorkBoardNow,
                    saving: workBoardSaving,
                    enabled: workBoardHasUnsaved,
                  }}
                  sort={taskSort}
                  columnBar={
                    <WorkBoardColumnBar
                      sort={taskSort}
                      onSort={setTaskSort}
                      sprintFilter={taskFilters.sprint}
                      sprintOrdered={SPRINT_OPTIONS}
                      onSprintChange={(next) => setTaskFilters((prev) => ({ ...prev, sprint: next as Set<SprintCategory> }))}
                      statusFilter={taskFilters.status}
                      statusOrdered={TASK_STATUS_FILTER_OPTIONS}
                      statusLabels={TASK_STATUS_FILTER_LABELS}
                      onStatusChange={(next) => setTaskFilters((prev) => ({ ...prev, status: next }))}
                      assigneeFilter={taskFilters.assignee}
                      assigneeOrdered={taskAssigneeOrdered}
                      assigneeLabels={taskAssigneeLabels}
                      onAssigneeChange={(next) => setTaskFilters((prev) => ({ ...prev, assignee: next as Set<WorkAssignee> }))}
                      dueFilter={taskFilters.due}
                      onDueChange={(next) => setTaskFilters((prev) => ({ ...prev, due: next }))}
                      testIdPrefix="task-board"
                    />
                  }
                  renderItem={(t) => (
                    <WorkBoardExpandableRow
                      id={t.id}
                      code={formatTaskCode(t.id, tasks)}
                      title={t.title}
                      sprint={t.sprint}
                      open={Boolean(openTaskRows[t.id])}
                      onToggle={() => setOpenTaskRows((prev) => toggleWorkItemOpen(prev, t.id))}
                      testId={`task-row-${t.id}`}
                      codeTestId={`task-code-${t.id}`}
                      className={taskStatusRowClass(t.status)}
                      status={t.status}
                      priority={t.priority}
                      overdue={isWorkDueDatePast(t.dueDate) && t.status !== 'done'}
                      saving={false}
                      canSave={
                        workItemIsDirty(dirtyTaskIds, t.id) ||
                        workRowHasUnsavedEdits(t.id, taskRowFingerprint(t), lastSavedTaskRowsRef.current)
                      }
                      onSave={saveWorkBoardNow}
                      saveLabel={`Save ${formatTaskCode(t.id, tasks)} to database`}
                      onDelete={() => handleDeleteTask(t.id)}
                      deleteLabel={`Delete ${t.title}`}
                      badges={
                        <>
                          <WorkBoardHeaderSelect
                            ariaLabel="Sprint"
                            testId={`work-row-sprint-${t.id}`}
                            value={t.sprint}
                            onChange={(value) => handleUpdateTask(t.id, { sprint: value as SprintCategory })}
                            options={sprintSelectOptions(SPRINT_OPTIONS, t.sprint).map((sprint) => ({ value: sprint, label: sprintLabelWithDates(sprint) }))}
                            className={`${sprintControlClass(t.sprint)} border-current`}
                          />
                          <WorkBoardHeaderSelect
                            ariaLabel="Status"
                            testId={`work-row-status-${t.id}`}
                            value={t.status}
                            onChange={(value) => handleUpdateTask(t.id, { status: value as TaskStatus })}
                            options={TASK_STATUSES.map((status) => ({ value: status, label: TASK_STATUS_LABELS[status] }))}
                            className={taskStatusBadgeClass(t.status)}
                          />
                          <WorkBoardHeaderSelect
                            ariaLabel="Assignee"
                            value={t.assignee}
                            onChange={(value) => handleUpdateTask(t.id, { assignee: value as WorkAssignee })}
                            options={taskAssigneeOrdered.map((assignee) => ({ value: assignee, label: taskAssigneeLabels[assignee] }))}
                            className="bg-[#F6EBE4] text-[#6B3A2C] border-[#C9A08C]/60"
                          />
                          <WorkBoardHeaderDate
                            value={t.dueDate ?? ''}
                            overdue={isWorkDueDatePast(t.dueDate) && t.status !== 'done'}
                            testId={`work-row-due-${t.id}`}
                            onChange={(value) => handleUpdateTask(t.id, { dueDate: value })}
                          />
                        </>
                      }
                    >
                      {t.id === MAKE_PAYMENT_TASK_ID && (
                        <a
                          href={PAY_PAGE_PATH}
                          onClick={(event) => {
                            event.preventDefault();
                            window.location.assign(PAY_PAGE_PATH);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl bg-[#EA580C] text-white text-[10px] font-black uppercase tracking-wide"
                        >
                          Open payment page
                        </a>
                      )}
                      <WorkBoardFieldGrid>
                        <WorkBoardField label="Agenda">
                          <label
                            className={`min-h-[44px] px-3 rounded-xl border-2 inline-flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wide ${
                              t.onAgenda
                                ? 'bg-[#C2410C] text-white border-[#1F1917]'
                                : 'bg-white text-[#1F1917] border-[#E5DFD3]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(t.onAgenda)}
                              aria-label={ADD_TO_AGENDA_LABEL}
                              data-testid={`task-add-to-agenda-body-${t.id}`}
                              className="w-4 h-4 accent-[#C2410C]"
                              onChange={() => handleToggleTaskAgenda(t)}
                            />
                            {t.onAgenda ? ON_AGENDA_LABEL : ADD_TO_AGENDA_LABEL}
                          </label>
                        </WorkBoardField>
                        <WorkBoardField label="Title">
                          <input
                            type="text"
                            value={t.title}
                            onChange={(e) => handleUpdateTask(t.id, { title: e.target.value })}
                            onBlur={(e) => {
                              const next = e.target.value.trim();
                              handleUpdateTask(t.id, { title: next || 'Untitled task' });
                            }}
                            className={`${workBoardFieldClassName} ${
                              t.status === 'done' ? 'line-through text-[#3F3832]' : workDueDateTextClass(t.dueDate)
                            }`}
                            aria-label="Task title"
                            data-testid={`task-title-${t.id}`}
                            placeholder="Task title"
                          />
                        </WorkBoardField>
                        <WorkBoardField label="Sprint">
                          <select
                            value={t.sprint}
                            onChange={(e) => handleUpdateTask(t.id, { sprint: e.target.value as SprintCategory })}
                            className={workBoardFieldClassName}
                            aria-label="Sprint"
                          >
                            {sprintSelectOptions(SPRINT_OPTIONS, t.sprint).map((s) => <option key={s} value={s}>{sprintLabelWithDates(s)}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Phase">
                          <select
                            value={t.phase ?? 'Phase 1'}
                            onChange={(e) => handleUpdateTask(t.id, { phase: e.target.value as WorkPhase })}
                            className={workBoardFieldClassName}
                            aria-label="Phase"
                          >
                            {PHASE_OPTIONS.map((p) => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Category">
                          <select
                            value={t.category}
                            onChange={(e) => handleUpdateTask(t.id, { category: e.target.value as TaskCategory })}
                            className={workBoardFieldClassName}
                            aria-label="Category"
                          >
                            {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Priority">
                          <select
                            value={t.priority}
                            onChange={(e) => handleUpdateTask(t.id, { priority: e.target.value as WorkPriority })}
                            className={workBoardFieldClassName}
                            aria-label="Priority"
                          >
                            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Status">
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateTask(t.id, { status: e.target.value as TaskStatus })}
                            className={`${workBoardFieldClassName} border-2 ${taskStatusBadgeClass(t.status)}`}
                            aria-label="Status"
                          >
                            {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Assignee">
                          <select
                            value={t.assignee}
                            onChange={(e) => handleUpdateTask(t.id, { assignee: e.target.value as WorkAssignee })}
                            className={workBoardFieldClassName}
                            aria-label="Assignee"
                          >
                            {taskAssigneeOrdered.map((a) => <option key={a} value={a}>{taskAssigneeLabels[a]}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Assignor">
                          <select
                            value={normalizeAssignor(t.assignor)}
                            onChange={(e) => handleUpdateTask(t.id, { assignor: e.target.value as WorkAssignee })}
                            className={workBoardFieldClassName}
                            aria-label="Assignor"
                          >
                            {ASSIGNOR_OPTIONS.map((a) => <option key={a} value={a}>{ASSIGNEE_LABELS[a]}</option>)}
                          </select>
                        </WorkBoardField>
                        <WorkBoardField label="Due date">
                          <input
                            type="date"
                            value={t.dueDate ?? ''}
                            onChange={(e) => handleUpdateTask(t.id, { dueDate: e.target.value })}
                            className={`${workBoardFieldClassName} ${workDueDateControlClass(isWorkDueDatePast(t.dueDate) && t.status !== 'done')}`}
                            aria-label="Due date"
                          />
                        </WorkBoardField>
                      </WorkBoardFieldGrid>
                      <WorkItemDescriptionChecklist
                        kind="task"
                        steps={t.steps ?? []}
                        actor={{ isSuperAdmin: portalPerms.canEditWorkChecklistSteps }}
                        relatedLinks={(t.linkedTestIds ?? []).map((testId) => {
                          const test = qaTests.find((row) => row.id === testId);
                          return {
                            code: formatQaCode(testId, qaTests),
                            title: test?.title ?? testId,
                            href: '/admin/testing',
                          };
                        })}
                        testId={`task-desc-${t.id}`}
                        onStepsChange={(next) => handleUpdateTask(t.id, { steps: next })}
                      />
                      <WorkItemNotesAttachments
                        itemKind="task"
                        itemId={t.id}
                        itemTitle={t.title}
                        notesRaw={t.notes ?? ''}
                        attachments={t.attachments ?? []}
                        actor={{
                          name: permissionActor?.name ?? currentUser.name,
                          email: permissionActor?.email ?? currentUser.email,
                          isSuperAdmin: portalPerms.isSuperAdmin,
                        }}
                        testId={`task-notes-${t.id}`}
                        onNotesChange={(next) => handleUpdateTask(t.id, { notes: next })}
                        onAttachmentsChange={(next) =>
                          handleUpdateTask(t.id, { attachments: next })
                        }
                      />
                    </WorkBoardExpandableRow>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 5: USERS DATABASE & ROLES */}
        {activeTab === 'emails' && getRolePermissions(currentUser).canManageEmailTemplates && (
          <EmailTemplatesPanel actor={currentUser} />
        )}

        {activeTab === 'mailing-list' && getRolePermissions(currentUser).canManageEmailTemplates && (
          <LaunchPage pageId="list" embedded />
        )}

        {activeTab === 'agenda' && getRolePermissions(permissionActor).canViewAgenda && (
          <AgendaBoard
            tasks={tasks}
            actor={{
              email: permissionActor?.email ?? currentUser.email,
              name: permissionActor?.name ?? currentUser.name,
              isSuperAdmin: portalPerms.isSuperAdmin,
            }}
          />
        )}

        {activeTab === 'pay' && canViewBudget && <MakePaymentPage embedded />}

        {activeTab === 'inventory-pricing' && getRolePermissions(permissionActor).canViewBudget && (
          <InventoryPricingPage embedded actorEmail={permissionActor?.email ?? currentUser.email} />
        )}

        {activeTab === 'sitemap' && (
          <SiteMapPage embedded onNavigate={() => onBackToStore()} canSeeMemberships />
        )}

        {activeTab === 'gear-selections' && getRolePermissions(currentUser).canManageContentFactory && (
          <GearSelectionsPage
            embedded
            actorName={currentUser.name.split(' ')[0] || 'Evelyn'}
            actorEmail={currentUser.email}
            canConfigure={getRolePermissions(currentUser).canManageContentFactory}
            canDelete={getRolePermissions(currentUser).canDeleteGearCards}
            canRename={getRolePermissions(currentUser).canRenameGearHeadings}
          />
        )}

        {activeTab === 'factory' && getRolePermissions(currentUser).canManageContentFactory && (
          <ContentFactoryPage onOpenTab={(tab) => selectAdminTab(tab)} />
        )}

        {activeTab === 'calendar' && getRolePermissions(currentUser).canManageContentFactory && (
          <PostingSchedulePage onOpenTab={(tab) => selectAdminTab(tab)} />
        )}

        {activeTab === 'asset-library' && getRolePermissions(currentUser).canManageContentFactory && (
          <AssetLibraryPage
            actorName={currentUser.name.split(' ')[0] || 'Evelyn'}
            actorEmail={currentUser.email}
            onOpenTab={(tab) => selectAdminTab(tab)}
            canConfigure={getRolePermissions(currentUser).canConfigureAssetLibrary}
          />
        )}

        {activeTab === 'logo-concepts' && getRolePermissions(currentUser).canManageContentFactory && (
          <LogoConceptsPage
            actorName={currentUser.name.split(' ')[0] || 'Evelyn'}
            actorEmail={currentUser.email}
            canConfigure={getRolePermissions(currentUser).canConfigureAssetLibrary}
          />
        )}

        {activeTab === 'guides' ? (
          <BetaTestingGuideAdminPage
            actorName={currentUser.name.split(' ')[0] || 'House'}
            actorEmail={currentUser.email}
          />
        ) : null}

        {(['timesheet', 'daily-progress', 'memberships', 'certificates', 'growth'] as const).map((tab) =>
          activeTab === tab ? <AdminStudioPlaceholder key={tab} tab={tab} /> : null,
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider mb-2">
                    <Users className="w-3.5 h-3.5" /> APP USER DATABASE & RBAC ROLES
                  </div>
                  <h3 className="text-2xl font-black text-[#1F1917] uppercase tracking-tight font-serif">
                    Registered Users Matrix ({appUsers.length} Users)
                  </h3>
                  <p className="text-xs text-[#3F3832] font-medium mt-1">
                    Admins can add and modify users. Super Admin profiles are locked.
                    Only Super Admin can grant Super Admin permissions or edit a Super Admin account.
                  </p>
                  <p className="text-xs text-[#3F3832] font-medium mt-1.5" data-testid="nmp-user-directory-note">
                    {NMP_USER_DIRECTORY_NOTE}
                  </p>
                  {usersLoadError ? (
                    <p className="text-xs font-bold text-red-700 mt-2" role="alert">
                      {usersLoadError}
                    </p>
                  ) : null}
                  {usersImportNotice ? (
                    <p className="text-xs font-bold text-emerald-800 mt-2">{usersImportNotice}</p>
                  ) : null}
                </div>

                <div className="flex flex-col items-stretch sm:items-end gap-2">
                  <span className="text-xs font-mono font-bold bg-[#C2410C] text-white px-3 py-1.5 rounded-xl border border-[#1F1917] text-center">
                    {NMP_USER_DIRECTORY_LABEL}
                  </span>
                  <button
                    type="button"
                    onClick={() => void refreshUsers()}
                    className="text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-xl border-2 border-[#1F1917] bg-white hover:bg-[#FFEDD5]"
                  >
                    Refresh from database
                  </button>
                </div>
              </div>

              {/* Add New User to App Database Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newUserName.trim() || !newUserEmail.trim() || !newUserPass.trim()) return;
                  const phoneError = phoneSignupError(newUserPhone);
                  if (phoneError) {
                    alert(phoneError);
                    return;
                  }
                  const res = await registerUserAsync(
                    newUserName.trim(),
                    newUserEmail.trim(),
                    newUserPass.trim(),
                    newUserRole,
                    true,
                    { phone: newUserPhone },
                  );
                  if (res.success) {
                    setNewUserName('');
                    setNewUserEmail('');
                    setNewUserPhone('');
                    setNewUserPass('');
                    await refreshUsers();
                  } else {
                    alert(res.error || 'Failed to create user');
                  }
                }}
                className="bg-[#FAF8F5] border-2 border-[#1F1917] rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="text-xs font-mono font-black text-[#C2410C] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add New User to App Database
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="min-h-[44px] bg-white border border-[#1F1917] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#C2410C]"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="min-h-[44px] bg-white border border-[#1F1917] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#C2410C]"
                    required
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Phone Number"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="min-h-[44px] bg-white border border-[#1F1917] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#C2410C]"
                    required
                    data-testid="admin-new-user-phone"
                  />
                  <div className="relative">
                    <input
                      type={showNewUserPass ? 'text' : 'password'}
                      placeholder="Password"
                      value={newUserPass}
                      onChange={(e) => setNewUserPass(e.target.value)}
                      className="w-full min-h-[44px] bg-white border border-[#1F1917] rounded-xl px-3 py-2 pr-10 text-xs font-mono focus:outline-none focus:border-[#C2410C]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPass(!showNewUserPass)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                      aria-label={showNewUserPass ? 'Hide password' : 'Show password'}
                    >
                      {showNewUserPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2 sm:col-span-2">
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="min-h-[44px] bg-white border border-[#1F1917] rounded-xl px-2 py-2 text-xs font-bold flex-1 cursor-pointer"
                    >
                      {getRolePermissions(currentUser).canAssignSuperAdmin && (
                        <option value="super_admin">Super Admin</option>
                      )}
                      <option value="admin">Admin</option>
                      <option value="dev">Dev</option>
                      <option value="qa">QA</option>
                      <option value="member">Member</option>
                    </select>
                    <button
                      type="submit"
                      className="min-h-[44px] px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md shrink-0 border border-[#1F1917]"
                    >
                      Create User
                    </button>
                  </div>
                </div>
              </form>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#1F1917] bg-[#FAF8F5] text-[11px] font-mono font-black text-[#1F1917] uppercase tracking-wider">
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Assigned Roles</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD3] text-xs font-sans">
                    {appUsers.map((u) => {
                      const userRoles = u.roles || [u.role];
                      const actor = getCurrentUserSession() ?? currentUser;
                      const superAdminLocked = isSuperAdmin(u) && !isSuperAdmin(actor);
                      const userAuditOpen = isUserAuditOpen(openUserAudit, u.id);
                      const userAuditCount = auditCountForUser(auditLog, u.id);
                      return (
                        <React.Fragment key={u.id}>
                        <tr className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#1F1917]">{u.name}</div>
                            <div className="text-[11px] font-mono text-[#3F3832]">{u.email}</div>
                            {u.phone ? (
                              <a
                                href={phoneTelHref(u.phone) ?? undefined}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#C2410C] hover:text-[#9A3412] min-h-[44px]"
                                data-testid={`user-phone-${u.id}`}
                              >
                                <Phone className="w-3.5 h-3.5" />
                                {formatPhoneDisplay(u.phone)}
                              </a>
                            ) : (
                              <div className="mt-1 text-[11px] font-mono text-[#9A8F86]">No phone</div>
                            )}
                            {u.wantsBeta && (
                              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-lg bg-[#FFEDD5] text-[#C2410C] border border-[#C2410C]/40 text-[9px] font-mono font-black uppercase tracking-wider">
                                Beta Tester
                              </span>
                            )}
                            <button
                              type="button"
                              aria-expanded={userAuditOpen}
                              aria-controls={`user-audit-panel-${u.id}`}
                              onClick={() => setOpenUserAudit((open) => toggleUserAuditOpen(open, u.id))}
                              className="mt-2 min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-xl border-2 border-[#1F1917] bg-white text-[10px] font-mono font-black uppercase tracking-wider text-[#1F1917] cursor-pointer"
                              data-testid={`user-audit-toggle-${u.id}`}
                            >
                              {userAuditToggleLabel(userAuditCount)}
                              <ChevronDown className={`w-3.5 h-3.5 ${userAuditOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              disabled={superAdminLocked}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider border ${
                                superAdminLocked
                                  ? 'cursor-not-allowed opacity-70'
                                  : 'cursor-pointer transition-transform hover:scale-105'
                              } ${
                                u.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : u.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                              title={
                                superAdminLocked
                                  ? 'Super Admin profiles can only be changed by a Super Admin'
                                  : 'Click to toggle account status (Active / Pending / Inactive)'
                              }
                            >
                              {u.status === 'active' ? 'Active' : u.status === 'pending' ? 'Pending' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {ALL_USER_ROLES.map((r) => {
                                const hasRole = userRoles.includes(r);
                                const locked =
                                  superAdminLocked ||
                                  (r === 'super_admin' && !getRolePermissions(actor).canAssignSuperAdmin);
                                return (
                                  <button
                                    key={r}
                                    onClick={() => handleToggleUserRole(u, r)}
                                    disabled={superAdminLocked || (locked && !hasRole)}
                                    className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer border transition-all ${
                                      hasRole
                                        ? r === 'super_admin'
                                          ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-sm'
                                          : r === 'admin'
                                            ? 'bg-[#C2410C] text-white border-[#1F1917] shadow-sm'
                                            : 'bg-[#C2410C] text-white border-[#1F1917] shadow-sm'
                                        : locked
                                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                          : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                                    }`}
                                    title={
                                      superAdminLocked
                                        ? 'Super Admin profiles can only be changed by a Super Admin'
                                        : locked
                                        ? 'Only Super Admin can grant Super Admin permissions'
                                        : `Click to ${hasRole ? 'remove' : 'grant'} role: ${getRoleLabel(r)}`
                                    }
                                  >
                                    {getRoleLabel(r)}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUserModal(u)}
                                disabled={superAdminLocked}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  superAdminLocked
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-[#C2410C] hover:bg-orange-50 cursor-pointer'
                                }`}
                                title={
                                  superAdminLocked
                                    ? 'Super Admin profiles can only be changed by a Super Admin'
                                    : 'Edit user profile'
                                }
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUserClick(u.id)}
                                disabled={superAdminLocked}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  superAdminLocked
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                                }`}
                                title={
                                  superAdminLocked
                                    ? 'Super Admin accounts can only be deleted by a Super Admin'
                                    : 'Delete user'
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {userAuditOpen ? (
                          <tr>
                            <td
                              colSpan={4}
                              id={`user-audit-panel-${u.id}`}
                              className="px-4 pb-4 pt-0 bg-[#FFFCF7]"
                            >
                              <div className="max-h-48 overflow-y-auto">
                                <UserAuditEntries
                                  entries={auditLogForUser(auditLog, u.id)}
                                  empty={USER_AUDIT_EMPTY}
                                  testId={`user-audit-${u.id}`}
                                />
                              </div>
                            </td>
                          </tr>
                        ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <FullAuditLog
                entries={auditLog}
                heading={FULL_AUDIT_LOG_HEADING}
                summary={fullAuditLogSummary(auditLog.length)}
              />
            </div>

            {/* EDIT USER PROFILE MODAL */}
            {editingUser && (
              <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border-4 border-[#1F1917] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp text-[#1F1917]">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-[#C2410C]" />
                      <h4 className="font-serif font-black text-xl text-[#1F1917] uppercase">
                        Edit User Profile
                      </h4>
                    </div>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="p-1 text-gray-400 hover:text-black rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveUserModal} className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-[#3F3832] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#1F1917] rounded-xl font-bold text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-[#3F3832] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 border-2 border-[#1F1917] rounded-xl font-mono font-bold text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-[#3F3832] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="(619) 555-0100"
                        className="w-full min-h-[44px] px-3 py-2 border-2 border-[#1F1917] rounded-xl font-mono font-bold text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                        required
                        data-testid="admin-edit-user-phone"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-[#3F3832] mb-1">
                        New Password (Leave blank to keep unchanged)
                      </label>
                      <div className="relative">
                        <input
                          type={showEditPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={editPass}
                          onChange={(e) => setEditPass(e.target.value)}
                          className="w-full px-3 py-2 pr-10 border-2 border-[#1F1917] rounded-xl font-mono text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPass(!showEditPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
                          aria-label={showEditPass ? 'Hide password' : 'Show password'}
                        >
                          {showEditPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-[#3F3832] mb-1">
                        Account Status Bubble
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['active', 'pending', 'inactive'] as UserStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setEditStatus(st)}
                            className={`py-2 rounded-xl font-mono font-black text-[10px] uppercase border transition-all cursor-pointer ${
                              editStatus === st
                                ? st === 'active'
                                  ? 'bg-emerald-600 text-white border-emerald-900 shadow-md'
                                  : st === 'pending'
                                  ? 'bg-amber-500 text-white border-amber-900 shadow-md'
                                  : 'bg-rose-600 text-white border-rose-900 shadow-md'
                                : 'bg-gray-100 text-gray-500 border-gray-300'
                            }`}
                          >
                            {st === 'active' ? 'Active' : st === 'pending' ? 'Pending' : 'Inactive'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-[#3F3832] mb-1">
                        Assigned Roles (Multi-Select)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {ALL_USER_ROLES.filter(
                          (r) =>
                            r !== 'super_admin' || getRolePermissions(currentUser).canAssignSuperAdmin,
                        ).map((r) => {
                          const isChecked = editRoles.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                if (isChecked) {
                                  if (editRoles.length > 1) {
                                    setEditRoles(editRoles.filter((item) => item !== r));
                                  }
                                } else {
                                  setEditRoles([...editRoles, r]);
                                }
                              }}
                              className={`py-2 px-3 rounded-xl font-mono font-black text-[10px] uppercase border text-left flex items-center justify-between cursor-pointer transition-all ${
                                isChecked
                                  ? r === 'super_admin'
                                    ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-sm'
                                    : 'bg-[#C2410C] text-white border-[#1F1917] shadow-sm'
                                  : 'bg-gray-100 text-gray-500 border-gray-300'
                              }`}
                            >
                              <span>{getRoleLabel(r)}</span>
                              <span>{isChecked ? 'âœ“' : '+'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5DFD3]">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase rounded-xl shadow-md cursor-pointer border border-[#1F1917] flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" /> Save Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <BlockedNoteDialog
        open={Boolean(blockedNoteTaskIds?.length)}
        itemCount={blockedNoteTaskIds?.length ?? 0}
        onCancel={() => setBlockedNoteTaskIds(null)}
        onConfirm={confirmBlockedNote}
      />
    </div>
  );
};
