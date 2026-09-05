import { describe, expect, it } from 'vitest';
import {
  COMPLIMENTARY_WORK,
  GEAR_SALES_BUDGET_TOTAL,
  GEAR_SALES_LINE_ITEMS_SEED,
  MEMBERSHIPS_COMING_SOON_NOTE,
  PHASE_PAYMENT_SCHEDULE,
  complimentaryRetailTotal,
  formatUsdAmount,
  paymentScheduleTotal,
  phase1LineItemTotal,
} from '../gearSalesPlan';

describe('gearSalesPlan', () => {
  it('prices Phase 1 gear items at exactly $10,000', () => {
    expect(phase1LineItemTotal()).toBe(GEAR_SALES_BUDGET_TOTAL);
    expect(phase1LineItemTotal(GEAR_SALES_LINE_ITEMS_SEED)).toBe(10_000);
    expect(GEAR_SALES_LINE_ITEMS_SEED.filter((item) => item.phase === 'phase1_build')).toHaveLength(5);
  });

  it('splits the $10,000 payment across three phases and leaves later work unpriced', () => {
    expect(paymentScheduleTotal()).toBe(10_000);
    expect(PHASE_PAYMENT_SCHEDULE.map((row) => row.amount)).toEqual([4_000, 3_000, 3_000]);
    expect(GEAR_SALES_LINE_ITEMS_SEED.find((item) => item.id === 'memberships-phase2')?.baseAmount).toBe(0);
    expect(GEAR_SALES_LINE_ITEMS_SEED.find((item) => item.id === 'future-phase3')?.phase).toBe('phase3_future');
    expect(MEMBERSHIPS_COMING_SOON_NOTE).toMatch(/Coming Soon/i);
  });

  it('puts shirt creation, launch pages, and Phase 1 email in Phase 1', () => {
    const phase1 = GEAR_SALES_LINE_ITEMS_SEED.filter((item) => item.phase === 'phase1_build');
    const blob = phase1.map((item) => `${item.name} ${item.summary} ${item.deliverables?.join(' ')}`).join(' ');
    expect(blob).toMatch(/Developing Shirts/i);
    expect(blob).toMatch(/hoodie/i);
    expect(blob).toMatch(/hat/i);
    expect(blob).toMatch(/About page/);
    expect(blob).toMatch(/Contact page/);
    expect(blob).toMatch(/Privacy Policy/);
    expect(blob).toMatch(/Phase 1 email/i);
    expect(blob).toMatch(/product in hand/i);
    expect(blob).toMatch(/6\.2K Facebook/i);
    expect(GEAR_SALES_LINE_ITEMS_SEED.find((item) => item.id === 'roi-phase2')?.summary).toMatch(/6\.2K/);
  });

  it('lists complimentary logo, mockups, and hosting at $0 charged with retail if sold', () => {
    expect(COMPLIMENTARY_WORK.every((item) => item.chargedAmount === 0)).toBe(true);
    expect(complimentaryRetailTotal()).toBe(3_750);
    expect(COMPLIMENTARY_WORK.find((item) => item.id === 'comp-logo')?.retailAmount).toBe(1_200);
    expect(formatUsdAmount(1200)).toBe('$1,200');
    expect(phase1LineItemTotal()).toBe(10_000);
  });
});
