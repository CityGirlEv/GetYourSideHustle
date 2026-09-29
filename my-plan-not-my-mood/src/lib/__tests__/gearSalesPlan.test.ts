import { describe, expect, it } from 'vitest';
import {
  COMPLIMENTARY_WORK,
  GEAR_SALES_BUDGET_TOTAL,
  GEAR_SALES_LINE_ITEMS_SEED,
  MEMBERSHIPS_COMING_SOON_NOTE,
  PHASE_1_PAID_TO_DATE,
  PHASE_1_PAYMENT_2_RECEIVED_ISO,
  PHASE_1_PAYMENT_2_RECEIVED_LABEL,
  PHASE_PAYMENT_SCHEDULE,
  MARKETING_VIDEOS_COMP_NAME,
  MARKETING_VIDEOS_COUNT,
  MARKETING_VIDEOS_DELIVERABLE,
  TEE_SALES_VIDEOS_DELIVERABLE,
  TEE_SALES_VIDEOS_PER_SPRINT,
  complimentaryRetailTotal,
  duePaymentInstallment,
  formatUsdAmount,
  paymentSchedulePaid,
  paymentScheduleRemaining,
  paymentScheduleTotal,
  phase1LineItemTotal,
  phase1PaidBudgetCopy,
  upgradeDeliverableLabel,
} from '../gearSalesPlan';

describe('gearSalesPlan', () => {
  it('prices Phase 1 gear items at exactly $10,000', () => {
    expect(phase1LineItemTotal()).toBe(GEAR_SALES_BUDGET_TOTAL);
    expect(phase1LineItemTotal(GEAR_SALES_LINE_ITEMS_SEED)).toBe(10_000);
    expect(GEAR_SALES_LINE_ITEMS_SEED.filter((item) => item.phase === 'phase1_build')).toHaveLength(5);
  });

  it('splits the $10,000 fee into three payments and marks $7,000 received after Payment 2', () => {
    expect(paymentScheduleTotal()).toBe(10_000);
    expect(PHASE_PAYMENT_SCHEDULE.map((row) => row.amount)).toEqual([3_500, 3_500, 3_000]);
    expect(PHASE_1_PAYMENT_2_RECEIVED_ISO).toBe('2026-09-18');
    expect(PHASE_PAYMENT_SCHEDULE.find((row) => row.id === 'pay-2')).toMatchObject({
      status: 'paid',
      dueLabel: PHASE_1_PAYMENT_2_RECEIVED_LABEL,
    });
    expect(PHASE_1_PAID_TO_DATE).toBe(7_000);
    expect(paymentSchedulePaid()).toBe(7_000);
    expect(paymentScheduleRemaining()).toBe(3_000);
    expect(duePaymentInstallment()?.id).toBe('pay-3');
    expect(duePaymentInstallment()?.sprintLabel).toBe('Sprint 3');
    expect(phase1PaidBudgetCopy()).toBe('$7,000 is already paid. Payment 3 ($3,000) is due Sprint 3.');
    expect(GEAR_SALES_LINE_ITEMS_SEED.find((item) => item.id === 'memberships-phase2')?.baseAmount).toBe(0);
    expect(GEAR_SALES_LINE_ITEMS_SEED.find((item) => item.id === 'future-phase3')?.phase).toBe('phase3_future');
    expect(MEMBERSHIPS_COMING_SOON_NOTE).toMatch(/Coming Soon/i);
  });

  it('puts shirt creation, launch pages, and Orders in Phase 1', () => {
    const phase1 = GEAR_SALES_LINE_ITEMS_SEED.filter((item) => item.phase === 'phase1_build');
    const blob = phase1.map((item) => `${item.name} ${item.summary} ${item.deliverables?.join(' ')}`).join(' ');
    expect(blob).toMatch(/Developing Shirts/i);
    expect(blob).toMatch(/hoodie/i);
    expect(blob).toMatch(/hat/i);
    expect(blob).toMatch(/About page/);
    expect(blob).toMatch(/Contact page/);
    expect(blob).toMatch(/Privacy Policy/);
    expect(blob).toMatch(/Orders on SnatchVault/i);
    expect(blob).toMatch(/snatchvault\.com\/collections\/my-plan-gear/i);
    expect(blob).toMatch(/product in hand/i);
    expect(blob).toMatch(/6\.2K Facebook/i);
    expect(GEAR_SALES_LINE_ITEMS_SEED.find((item) => item.id === 'roi-phase2')?.summary).toMatch(/6\.2K/);
  });

  it('lists complimentary logo, mockups, hosting, and 4 marketing videos at $0 charged with retail if sold', () => {
    expect(COMPLIMENTARY_WORK.every((item) => item.chargedAmount === 0)).toBe(true);
    expect(complimentaryRetailTotal()).toBe(5_250);
    expect(COMPLIMENTARY_WORK.find((item) => item.id === 'comp-logo')?.retailAmount).toBe(1_200);
    expect(COMPLIMENTARY_WORK.find((item) => item.id === 'comp-videos')).toMatchObject({
      name: MARKETING_VIDEOS_COMP_NAME,
      retailAmount: 1_500,
      chargedAmount: 0,
    });
    expect(formatUsdAmount(1200)).toBe('$1,200');
    expect(phase1LineItemTotal()).toBe(10_000);
  });

  it('puts 3 T-shirt sales videos on every Phase 1 sprint', () => {
    expect(TEE_SALES_VIDEOS_PER_SPRINT).toBe(3);
    expect(TEE_SALES_VIDEOS_DELIVERABLE).toMatch(/3 T-shirt sales videos/);
    const sprints = GEAR_SALES_LINE_ITEMS_SEED.filter((item) => item.phase === 'phase1_build' && item.id.startsWith('sprint'));
    expect(sprints).toHaveLength(5);
    expect(sprints.every((item) => item.deliverables?.includes(TEE_SALES_VIDEOS_DELIVERABLE))).toBe(true);
  });

  it('puts 4 complimentary marketing videos on Angela’s Phase 1', () => {
    expect(MARKETING_VIDEOS_COUNT).toBe(4);
    expect(MARKETING_VIDEOS_DELIVERABLE).toMatch(/4 marketing videos/);
    expect(MARKETING_VIDEOS_DELIVERABLE).toMatch(/complimentary at no charge/);
    expect(GEAR_SALES_LINE_ITEMS_SEED.find((item) => item.id === 'sprint0')?.deliverables).toContain(
      MARKETING_VIDEOS_DELIVERABLE,
    );
    expect(
      upgradeDeliverableLabel('3 professional videos — Evelyn delivered 4 at no charge'),
    ).toBe(MARKETING_VIDEOS_DELIVERABLE);
  });
});
