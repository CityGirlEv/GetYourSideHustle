import React from 'react';
import {
  PHASE_PAYMENT_SCHEDULE,
  PAYMENT_STATUS_LABELS,
  formatUsdAmount,
  paymentSchedulePaid,
  paymentScheduleRemaining,
  paymentScheduleTotal,
  type PhasePaymentInstallment,
} from '../lib/gearSalesPlan';
import { sprintIdWithDates } from '../lib/sprintCalendar';

const STATUS_TONE: Record<PhasePaymentInstallment['status'], string> = {
  paid: 'bg-[#D1FAE5] text-[#047857] border-[#6EE7B7]',
  due: 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]',
  upcoming: 'bg-white text-[#3F3832] border-[#E5DFD3]',
};

export const PaymentScheduleCard: React.FC<{
  id?: string;
  compact?: boolean;
}> = ({ id, compact = false }) => {
  const paid = paymentSchedulePaid();
  const remaining = paymentScheduleRemaining();
  const total = paymentScheduleTotal();

  return (
    <section
      id={id}
      className={`bg-[#FFFCF7] border border-[#E8DFD2] rounded-[2rem] ${compact ? 'p-5' : 'p-6 sm:p-8'} shadow-[0_12px_40px_rgba(31,25,23,0.06)] space-y-4 scroll-mt-28`}
      data-testid="payment-schedule"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-black uppercase font-serif text-[#1F1917]">Payment schedule</h3>
          <p className="text-sm text-[#3F3832] font-medium mt-1">
            The $10,000 Phase 1 fee is three payments. Angela has already paid {formatUsdAmount(paid)}.
            Payment 2 is the Sprint 1 installment.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">
            Paid {formatUsdAmount(paid)} · still due {formatUsdAmount(remaining)}
          </p>
          <p className="text-sm font-mono font-black text-[#1F1917] tabular-nums">{formatUsdAmount(total)} total</p>
        </div>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PHASE_PAYMENT_SCHEDULE.map((row) => (
          <li
            key={row.id}
            className={`rounded-2xl border-2 px-4 py-3 min-h-[44px] ${STATUS_TONE[row.status]}`}
            data-testid={`payment-schedule-${row.id}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider">{row.label}</span>
              <span className="text-[10px] font-black uppercase">{PAYMENT_STATUS_LABELS[row.status]}</span>
            </div>
            <p className="text-2xl font-black font-mono tabular-nums mt-1">{formatUsdAmount(row.amount)}</p>
            <p className="text-xs font-medium mt-1">
              {sprintIdWithDates(row.sprintId, row.sprintLabel)} · {row.dueLabel}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};
