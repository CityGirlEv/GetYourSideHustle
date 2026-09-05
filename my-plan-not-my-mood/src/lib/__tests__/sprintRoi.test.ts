import { describe, expect, it } from 'vitest';
import { GEAR_SALES_BUDGET_TOTAL } from '../gearSalesPlan';
import {
  ORGANIC_AVERAGE_ORDER_VALUE,
  ORGANIC_CONTRIBUTION_MARGIN,
  ORGANIC_FACEBOOK_FOLLOWERS,
  ORGANIC_ONLY_NOTE,
  buildSprintRoiRow,
  formatRoiPercent,
  organicWeeklyOrders,
  phase1OrganicRoi,
  roiPercent,
  sprintRoiRows,
} from '../sprintRoi';

describe('sprintRoi', () => {
  it('models organic-only orders from 6.2K personal Facebook followers', () => {
    expect(ORGANIC_FACEBOOK_FOLLOWERS).toBe(6_200);
    expect(ORGANIC_ONLY_NOTE).toMatch(/organic-only/i);
    expect(ORGANIC_ONLY_NOTE).toMatch(/6\.2K/);
    const weekly = organicWeeklyOrders();
    expect(weekly).toBeCloseTo(6_200 * 0.08 * 0.03 * 0.05, 5);
    expect(weekly).toBeGreaterThan(0.5);
    expect(weekly).toBeLessThan(1);
  });

  it('gives every Phase 1 sprint an ROI and starts selling in Sprint 0', () => {
    const rows = sprintRoiRows();
    expect(rows.map((row) => row.id)).toEqual(['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4']);
    expect(rows[0]?.sellingWeeks).toBe(0.5);
    expect(rows[0]?.expectedUnits).toBeGreaterThan(0);
    expect(rows[1]?.sellingWeeks).toBe(1);
    expect(buildSprintRoiRow('sprint0').note).toMatch(/Shop Gear is live/i);
    expect(buildSprintRoiRow('sprint3').sellingWeeks).toBe(1);
    expect(rows.reduce((sum, row) => sum + row.investment, 0)).toBe(GEAR_SALES_BUDGET_TOTAL);
  });

  it('does not recover the $10K Phase 1 fee from organic Facebook during the build', () => {
    const phase = phase1OrganicRoi();
    expect(phase.investment).toBe(10_000);
    expect(phase.expectedRevenue).toBeLessThan(200);
    expect(phase.roiPercent).toBeLessThan(-90);
    expect(phase.trailing90DayRevenue).toBeCloseTo(organicWeeklyOrders() * 13 * ORGANIC_AVERAGE_ORDER_VALUE, 1);
    expect(roiPercent(100, 40)).toBe(-60);
    expect(formatRoiPercent(-98.2)).toBe('-98%');
    expect(ORGANIC_CONTRIBUTION_MARGIN).toBe(0.4);
  });
});
