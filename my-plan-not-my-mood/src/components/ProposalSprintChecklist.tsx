import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Clock,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import type { SprintDeliverable } from '../lib/sprintDeliverables';
import {
  ASSIGNEE_LABELS,
  ASSIGNEE_OPTIONS,
  SPRINT_OPTIONS,
  type WorkAssignee,
} from '../lib/workBoard';
import {
  BUDGET_STATUS_LABELS,
  BUDGET_STATUSES,
  sprintFromBudgetItemId,
  type BudgetItemAssignee,
  type BudgetItemSprint,
  type BudgetItemStatus,
} from '../lib/ipLineItems';
import { NotesField } from './NotesField';
import {
  computeDeliverableProgress,
  computeProgressByAssignee,
} from '../lib/sprintDeliverables';

export interface ProposalSprintLineItem {
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

const SPRINT_DISPLAY_ORDER = [
  'sprint0',
  'sprint1',
  'sprint2',
  'sprint3',
  'sprint4',
  'arch',
  'design',
  'socials-ad-infra',
  'content-factory-engine',
  'maint-website',
  'maint-socials',
];

interface ProposalSprintChecklistProps {
  items: ProposalSprintLineItem[];
  selectedDiscountTier: number;
  showPricing: boolean;
  formatUsd: (n: number) => string;
  getLineItemNewPrice: (base: number) => number;
  getLineItemAmountSaved: (base: number) => number;
  onToggleVisibility: (id: string) => void;
  onUpdateItem: (id: string, patch: Partial<ProposalSprintLineItem>) => void;
  onUpdateDeliverable: (sprintId: string, deliverableId: string, patch: Partial<SprintDeliverable>) => void;
  onAddDeliverable: (sprintId: string) => void;
  onRemoveDeliverable: (sprintId: string, deliverableId: string) => void;
  defaultExpandedIds?: string[];
  readOnly?: boolean;
}

function sortSprintItems(items: ProposalSprintLineItem[]) {
  return [...items].sort((a, b) => {
    const ai = SPRINT_DISPLAY_ORDER.indexOf(a.id);
    const bi = SPRINT_DISPLAY_ORDER.indexOf(b.id);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

function sprintShortLabel(item: ProposalSprintLineItem): string {
  if (item.id.startsWith('sprint')) return item.id.replace('sprint', 'Sprint ');
  if (item.id === 'arch') return 'Included';
  if (item.id === 'design') return 'Included';
  return 'Phase 2';
}

function ProgressBar({ percent, className = '' }: { percent: number; className?: string }) {
  return (
    <div className={`h-2 rounded-full bg-[#E5DFD3] overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-[#10B981] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

export function ProposalSprintChecklist({
  items,
  selectedDiscountTier,
  showPricing,
  formatUsd,
  getLineItemNewPrice,
  getLineItemAmountSaved,
  onToggleVisibility,
  onUpdateItem,
  onUpdateDeliverable,
  onAddDeliverable,
  onRemoveDeliverable,
  defaultExpandedIds = ['sprint0'],
  readOnly = false,
}: ProposalSprintChecklistProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpandedIds));

  const sorted = sortSprintItems(items);
  const visibleItems = sorted.filter((i) => i.visible !== false);

  const allDeliverables = visibleItems.flatMap((i) => i.deliverables ?? []);
  const overallProgress = computeDeliverableProgress(allDeliverables);
  const assigneeProgress = computeProgressByAssignee(allDeliverables);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(sorted.map((i) => i.id)));
  const collapseAll = () => setExpanded(new Set());

  const visibleCount = visibleItems.length;
  const totalBase = visibleItems.reduce((s, i) => s + i.baseAmount, 0);
  const totalNew = visibleItems.reduce((s, i) => s + getLineItemNewPrice(i.baseAmount), 0);
  const totalSaved = totalBase - totalNew;

  return (
    <div className="space-y-3" data-testid="proposal-sprint-checklist">
      {/* Overall sprint status */}
      <div className="bg-[#1F1917] text-white border-2 border-[#C2410C] rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#FFEDD5]">
              Sprint Status — Deliverables Checklist
            </div>
            <div className="text-xl font-black font-mono text-white tabular-nums mt-0.5">
              {overallProgress.percent}% complete
            </div>
            <div className="text-[10px] font-mono text-[#FFEDD5]/90 mt-0.5">
              {overallProgress.completed} of {overallProgress.total} items checked across {visibleCount} modules
            </div>
          </div>
          <div className="min-w-[10rem] flex-1 max-w-xs">
            <ProgressBar percent={overallProgress.percent} className="h-3 bg-white/20" />
          </div>
        </div>

        {assigneeProgress.length > 0 && (
          <div className="pt-2 border-t border-white/15 space-y-2">
            <div className="text-[9px] font-mono font-black uppercase tracking-wider text-[#FFEDD5] flex items-center gap-1">
              <User className="w-3 h-3" /> Progress by assignee
            </div>
            <div className="flex flex-wrap gap-2">
              {assigneeProgress.map((row) => (
                <div
                  key={row.assignee}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/20 min-w-[7rem]"
                  title={`${row.completed}/${row.total} items`}
                >
                  <div className="text-[9px] font-mono font-black uppercase text-[#FFEDD5]">{row.label}</div>
                  <div className="text-xs font-black font-mono tabular-nums">{row.percent}%</div>
                  <div className="text-[8px] font-mono text-white/70 tabular-nums">
                    {row.completed}/{row.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <p className="text-[10px] font-mono font-black uppercase text-[#3F3832] tracking-wider">
          Agile Sprint Checklist · {visibleCount} modules · numbered items · click sprint to expand
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 rounded-lg border border-[#E5DFD3] text-[9px] font-black uppercase text-[#1F1917] hover:bg-[#FFEDD5] cursor-pointer"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-lg border border-[#E5DFD3] text-[9px] font-black uppercase text-[#1F1917] hover:bg-[#FFEDD5] cursor-pointer"
          >
            Collapse all
          </button>
        </div>
      </div>

      {sorted.map((item) => {
        const isOpen = expanded.has(item.id);
        const isHidden = item.visible === false;
        const newPrice = getLineItemNewPrice(item.baseAmount);
        const amountSaved = getLineItemAmountSaved(item.baseAmount);
        const deliverables = item.deliverables ?? [];
        const sprintProgress = computeDeliverableProgress(deliverables);

        return (
          <div
            key={item.id}
            className={`border-2 rounded-2xl overflow-hidden transition-all ${
              isHidden ? 'border-gray-300 bg-gray-50/80 opacity-70' : 'border-[#1F1917] bg-white shadow-sm'
            }`}
            data-testid={`proposal-sprint-${item.id}`}
          >
            <div className="flex items-stretch gap-0">
              <button
                type="button"
                onClick={() => toggleExpanded(item.id)}
                className="flex-1 flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#FAF8F5] transition-colors cursor-pointer min-w-0"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-[#C2410C] shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#C2410C] shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#FFEDD5] text-[#C2410C] border border-[#C2410C]/30">
                      {sprintShortLabel(item)}
                    </span>
                    {item.dates && (
                      <span className="text-[10px] font-mono font-black uppercase text-[#1F1917]">
                        {item.dates}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        item.phase === 'phase1_build'
                          ? 'bg-orange-100 text-[#C2410C]'
                          : item.phase === 'phase3_future'
                            ? 'bg-amber-50 text-[#9A6B3D]'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.phase === 'phase1_build' ? 'Phase 1' : item.phase === 'phase3_future' ? 'Phase 3' : 'Phase 2'}
                    </span>
                    {deliverables.length > 0 && (
                      <span
                        className={`text-[9px] font-mono font-black px-2 py-0.5 rounded tabular-nums ${
                          sprintProgress.percent === 100
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-[#FAF8F5] text-[#3F3832] border border-[#E5DFD3]'
                        }`}
                      >
                        {sprintProgress.percent}% · {sprintProgress.completed}/{sprintProgress.total}
                      </span>
                    )}
                    {item.duration && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#3F3832]">
                        <Clock className="w-3 h-3" /> {item.duration}
                      </span>
                    )}
                  </div>
                  {!isOpen ? (
                    <div
                      className={`font-black text-sm mt-1 leading-snug ${
                        isHidden ? 'line-through text-gray-500' : 'text-[#1F1917]'
                      }`}
                    >
                      {item.name}
                    </div>
                  ) : null}
                  {!isOpen && item.summary && (
                    <p className="text-[11px] text-[#3F3832] mt-1 line-clamp-1">{item.summary}</p>
                  )}
                  {!isOpen && deliverables.length > 0 && (
                    <div className="mt-1.5 max-w-md">
                      <ProgressBar percent={sprintProgress.percent} />
                    </div>
                  )}
                </div>
              </button>

              <div className={`flex items-center gap-2 shrink-0 ${showPricing ? 'px-3 border-l border-[#E5DFD3]' : 'px-2'}`}>
                <button
                  type="button"
                  onClick={() => onToggleVisibility(item.id)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-mono font-black uppercase flex items-center gap-1 cursor-pointer border ${
                    isHidden
                      ? 'bg-gray-200 text-gray-600 border-gray-400'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                  title={isHidden ? 'Show in proposal' : 'Hide from proposal'}
                >
                  {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                {showPricing && (
                  <div className="text-right min-w-[5.5rem]">
                    <div className={`font-mono font-black text-xs ${isHidden ? 'text-gray-400 line-through' : 'text-[#3F3832]'}`}>
                      {formatUsd(item.baseAmount)}
                    </div>
                    <div className={`font-mono font-black text-xs ${isHidden ? 'text-gray-400' : 'text-[#C2410C]'}`}>
                      {formatUsd(newPrice)}
                    </div>
                    {selectedDiscountTier > 0 && amountSaved > 0 && (
                      <div className={`font-mono font-bold text-[9px] ${isHidden ? 'text-gray-400' : 'text-[#10B981]'}`}>
                        −{formatUsd(amountSaved)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isOpen && (
              <div className="px-4 pb-4 pt-0 border-t border-[#E5DFD3]/80 bg-[#FAF8F5]/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 pt-3">
                  <label className="flex flex-col gap-1 text-[9px] font-mono font-black uppercase text-[#3F3832] tracking-wider">
                    Title
                    <input
                      type="text"
                      value={item.name}
                      readOnly={readOnly}
                      onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border-2 border-[#1F1917] bg-white text-sm font-black text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[9px] font-mono font-black uppercase text-[#3F3832] tracking-wider">
                    Sprint
                    <select
                      value={item.sprint ?? sprintFromBudgetItemId(item.id)}
                      disabled={readOnly}
                      onChange={(e) => onUpdateItem(item.id, { sprint: e.target.value as BudgetItemSprint })}
                      className="w-full min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-xs font-semibold cursor-pointer"
                    >
                      {SPRINT_OPTIONS.map((sprint) => (
                        <option key={sprint} value={sprint}>{sprint}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-[9px] font-mono font-black uppercase text-[#3F3832] tracking-wider">
                    Status
                    <select
                      value={item.status ?? 'not_started'}
                      disabled={readOnly}
                      onChange={(e) => onUpdateItem(item.id, { status: e.target.value as BudgetItemStatus })}
                      className="w-full min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-xs font-semibold cursor-pointer"
                    >
                      {BUDGET_STATUSES.map((status) => (
                        <option key={status} value={status}>{BUDGET_STATUS_LABELS[status]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-[9px] font-mono font-black uppercase text-[#3F3832] tracking-wider">
                    Assignee
                    <select
                      value={item.assignee ?? 'unassigned'}
                      disabled={readOnly}
                      onChange={(e) => onUpdateItem(item.id, { assignee: e.target.value as BudgetItemAssignee })}
                      className="w-full min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-xs font-semibold cursor-pointer"
                    >
                      {ASSIGNEE_OPTIONS.map((assignee) => (
                        <option key={assignee} value={assignee}>{ASSIGNEE_LABELS[assignee]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-[9px] font-mono font-black uppercase text-[#3F3832] tracking-wider sm:col-span-2">
                    Summary
                    <input
                      type="text"
                      value={item.summary ?? ''}
                      readOnly={readOnly}
                      onChange={(e) => onUpdateItem(item.id, { summary: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border-2 border-[#E5DFD3] bg-white text-sm font-semibold text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                    />
                  </label>
                </div>

                <div className="mt-3">
                  <NotesField
                    label="Description"
                    value={item.description}
                    readOnly={readOnly}
                    itemTitle={item.name}
                    testId={`budget-description-${item.id}`}
                    placeholder="Describe this sprint"
                    onChange={readOnly ? undefined : (next) => onUpdateItem(item.id, { description: next })}
                  />
                </div>
                <div className="mt-3">
                  <NotesField
                    label="Notes"
                    value={item.notes ?? ''}
                    readOnly={readOnly}
                    itemTitle={item.name}
                    testId={`budget-notes-${item.id}`}
                    placeholder="Working notes for this sprint"
                    onChange={readOnly ? undefined : (next) => onUpdateItem(item.id, { notes: next })}
                  />
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#1F1917] flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-[#C2410C]" />
                      Sprint Deliverables &amp; Ceremonies Checklist
                    </div>
                    {deliverables.length > 0 && (
                      <span className="text-[9px] font-mono font-black text-[#C2410C] tabular-nums">
                        {sprintProgress.completed}/{sprintProgress.total} · {sprintProgress.percent}%
                      </span>
                    )}
                  </div>

                  {deliverables.length > 0 && (
                    <ProgressBar percent={sprintProgress.percent} className="mb-2" />
                  )}

                  <ul className="space-y-1.5 pl-0 list-none">
                    {deliverables.map((deliverable, idx) => {
                      const itemNumber = idx + 1;
                      return (
                        <li
                          key={deliverable.id}
                          className="flex items-start gap-2 py-1.5 px-2.5 rounded-xl bg-white border border-[#E5DFD3]"
                          data-testid={`deliverable-${item.id}-${deliverable.id}`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateDeliverable(item.id, deliverable.id, {
                                completed: !deliverable.completed,
                              })
                            }
                            className="shrink-0 mt-1 cursor-pointer"
                            aria-label={`Toggle item ${itemNumber}`}
                          >
                            {deliverable.completed ? (
                              <CheckSquare className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                            ) : (
                              <Square className="w-4 h-4 text-[#C2410C]" strokeWidth={2.5} />
                            )}
                          </button>
                          <span
                            className="shrink-0 mt-1.5 min-w-[1.25rem] text-[11px] font-mono font-black text-[#C2410C] tabular-nums"
                            aria-hidden
                          >
                            {itemNumber}.
                          </span>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <input
                              type="text"
                              value={deliverable.label}
                              onChange={(e) =>
                                onUpdateDeliverable(item.id, deliverable.id, { label: e.target.value })
                              }
                              className={`w-full px-2 py-1 rounded-lg border border-[#E5DFD3] text-[11px] text-[#1F1917] bg-[#FAF8F5] focus:border-[#C2410C] focus:outline-none ${
                                deliverable.completed ? 'line-through text-[#3F3832]' : ''
                              }`}
                            />
                            <select
                              value={deliverable.assignee}
                              onChange={(e) =>
                                onUpdateDeliverable(item.id, deliverable.id, {
                                  assignee: e.target.value as WorkAssignee,
                                })
                              }
                              className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg border border-[#E5DFD3] bg-white text-[#3F3832] cursor-pointer"
                            >
                              {ASSIGNEE_OPTIONS.map((a) => (
                                <option key={a} value={a}>
                                  {ASSIGNEE_LABELS[a]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveDeliverable(item.id, deliverable.id)}
                            className="shrink-0 p-1 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer mt-0.5"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    type="button"
                    onClick={() => onAddDeliverable(item.id)}
                    className="mt-2 w-full py-2 rounded-xl border-2 border-dashed border-[#C2410C]/50 text-[10px] font-mono font-black uppercase text-[#C2410C] hover:bg-[#FFEDD5] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add checklist item
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E5DFD3] text-[10px] font-mono">
                  <span className="font-bold text-[#3F3832]">
                    {item.hours > 0
                      ? showPricing
                        ? `${item.hours} hrs @ $${item.rate}/hr`
                        : `${item.hours} estimated hours`
                      : 'Included in sprint scope'}
                  </span>
                  {showPricing && (
                    <span className="font-black text-[#C2410C]">
                      Investment {formatUsd(item.baseAmount)}
                      {selectedDiscountTier > 0 && (
                        <span className="text-[#10B981] ml-2">
                          → {formatUsd(newPrice)} ({selectedDiscountTier}% tier)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {showPricing && (
        <div className="bg-[#FFEDD5] border-2 border-[#C2410C] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 font-mono">
          <span className="text-[10px] font-black uppercase text-[#1F1917]">
            Scope Totals · {selectedDiscountTier}% Pre-Payment Tier
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-[#3F3832] font-bold">Base: {formatUsd(totalBase)}</span>
            <span className="text-[#C2410C] font-black">New: {formatUsd(totalNew)}</span>
            {totalSaved > 0 && (
              <span className="text-[#10B981] font-black">Saved: {formatUsd(totalSaved)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProposalSprintChecklist;
