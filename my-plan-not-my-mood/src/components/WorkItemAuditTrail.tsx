import React, { useState } from 'react';
import { ChevronDown, History } from 'lucide-react';
import { formatAuditWhen } from '../lib/userAuditLog';
import {
  WORK_BOARD_AUDIT_EMPTY,
  WORK_BOARD_AUDIT_HEADING,
  WORK_ITEM_AUDIT_EMPTY,
  workAuditActionLabel,
  workItemAuditToggleLabel,
  type WorkItemAuditEntry,
} from '../lib/workItemAudit';

export const WorkItemAuditEntries: React.FC<{
  entries: WorkItemAuditEntry[];
  empty?: string;
  testId: string;
}> = ({ entries, empty = WORK_ITEM_AUDIT_EMPTY, testId }) => {
  if (entries.length === 0) {
    return (
      <p className="text-xs font-medium text-[#3F3832] py-2" data-testid={`${testId}-empty`}>
        {empty}
      </p>
    );
  }

  return (
    <ol className="space-y-2" data-testid={testId}>
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-xl border border-[#E8DFD2] bg-[#FAF8F5] px-3 py-2 space-y-0.5"
          data-testid={`${testId}-entry-${entry.id}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <time dateTime={entry.at} className="text-[10px] font-mono font-black uppercase text-[#C2410C]">
              {formatAuditWhen(entry.at)}
            </time>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#1F1917] bg-white border border-[#1F1917] rounded-lg px-1.5 py-0.5">
              {workAuditActionLabel(entry.action)}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#1F1917]">{entry.summary}</p>
          <p className="text-[11px] font-mono text-[#3F3832]">
            {entry.actorName || 'Unknown'}
            {entry.actorEmail ? ` · ${entry.actorEmail}` : ''}
            {entry.itemTitle && entry.kind ? ` · ${entry.kind === 'test' ? 'Test' : 'Task'} ${entry.itemTitle}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
};

export const WorkItemAuditTrail: React.FC<{
  entries: WorkItemAuditEntry[] | undefined;
  itemId: string;
  testId: string;
}> = ({ entries, itemId, testId }) => {
  const [open, setOpen] = useState(false);
  const list = entries ?? [];
  const panelId = `${testId}-panel`;

  return (
    <div className="rounded-2xl border border-[#E8DFD2] bg-white px-3 py-2 space-y-2" data-testid={testId}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className="min-h-[44px] w-full inline-flex items-center justify-between gap-2 text-left cursor-pointer"
        data-testid={`${testId}-toggle`}
      >
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider text-[#1F1917]">
          <History className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
          {workItemAuditToggleLabel(list.length)}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div id={panelId} className="max-h-64 overflow-y-auto pr-1">
          <WorkItemAuditEntries entries={list} testId={`${testId}-list`} />
        </div>
      ) : null}
    </div>
  );
};

export const WorkBoardAuditLog: React.FC<{
  entries: WorkItemAuditEntry[];
  heading?: string;
  summary: string;
  testId: string;
}> = ({ entries, heading = WORK_BOARD_AUDIT_HEADING, summary, testId }) => (
  <section
    className="rounded-2xl border-2 border-[#1F1917] bg-[#FFFCF7] p-4 sm:p-5 space-y-3"
    data-testid={testId}
  >
    <div className="flex items-start gap-2">
      <History className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
      <div className="min-w-0 space-y-1">
        <h4 className="text-sm font-black uppercase tracking-tight text-[#1F1917]">{heading}</h4>
        <p className="text-xs font-medium text-[#3F3832]">{summary}</p>
      </div>
    </div>
    <div className="max-h-[28rem] overflow-y-auto pr-1">
      <WorkItemAuditEntries
        entries={entries}
        empty={WORK_BOARD_AUDIT_EMPTY}
        testId={`${testId}-list`}
      />
    </div>
  </section>
);
