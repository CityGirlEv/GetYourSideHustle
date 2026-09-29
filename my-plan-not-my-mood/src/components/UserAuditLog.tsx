import React from 'react';
import { History } from 'lucide-react';
import {
  FULL_AUDIT_EMPTY,
  USER_AUDIT_EMPTY,
  auditActionLabel,
  formatAuditWhen,
  type UserAuditEntry,
} from '../lib/userAuditLog';

export const UserAuditEntries: React.FC<{
  entries: UserAuditEntry[];
  empty?: string;
  testId: string;
}> = ({ entries, empty = USER_AUDIT_EMPTY, testId }) => {
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
            <time
              dateTime={entry.at}
              className="text-[10px] font-mono font-black uppercase text-[#C2410C]"
            >
              {formatAuditWhen(entry.at)}
            </time>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#1F1917] bg-white border border-[#1F1917] rounded-lg px-1.5 py-0.5">
              {auditActionLabel(entry.action)}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#1F1917]">{entry.summary}</p>
          <p className="text-[11px] font-mono text-[#3F3832]">
            {entry.userName}
            {entry.userEmail ? ` · ${entry.userEmail}` : ''}
            {entry.actorName && entry.actorId !== entry.userId ? ` · by ${entry.actorName}` : ''}
          </p>
          {entry.detail ? (
            <p className="text-[11px] text-[#3F3832]">{entry.detail}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
};

export const FullAuditLog: React.FC<{
  entries: UserAuditEntry[];
  heading: string;
  summary: string;
}> = ({ entries, heading, summary }) => (
  <section
    className="rounded-2xl border-2 border-[#1F1917] bg-[#FFFCF7] p-4 sm:p-5 space-y-3"
    data-testid="full-audit-log"
  >
    <div className="flex items-start gap-2">
      <History className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
      <div className="min-w-0 space-y-1">
        <h4 className="text-sm font-black uppercase tracking-tight text-[#1F1917]">{heading}</h4>
        <p className="text-xs font-medium text-[#3F3832]">{summary}</p>
      </div>
    </div>
    <div className="max-h-[28rem] overflow-y-auto pr-1">
      <UserAuditEntries entries={entries} empty={FULL_AUDIT_EMPTY} testId="full-audit-log-list" />
    </div>
  </section>
);
