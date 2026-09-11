import { describe, expect, it } from 'vitest';
import {
  GEAR_SALES_BRAND_SHARE,
  GEAR_SALES_HOST_SHARE,
  GEAR_SALES_SPLIT_DETAILS,
  GEAR_SALES_SPLIT_NOTE,
  formatSharePercent,
  splitGearSaleAmount,
} from '../gearSalesSplit';

describe('gearSalesSplit', () => {
  it('splits gear sales 70/30 with Evelyn’s 30% covering store operation', () => {
    expect(GEAR_SALES_BRAND_SHARE + GEAR_SALES_HOST_SHARE).toBe(1);
    expect(formatSharePercent(GEAR_SALES_BRAND_SHARE)).toBe('70%');
    expect(formatSharePercent(GEAR_SALES_HOST_SHARE)).toBe('30%');
    expect(splitGearSaleAmount(38)).toEqual({ brand: 26.6, host: 11.4, total: 38 });
    expect(splitGearSaleAmount(100)).toEqual({ brand: 70, host: 30, total: 100 });
    expect(GEAR_SALES_SPLIT_NOTE).toMatch(/70\/30/);
    expect(GEAR_SALES_SPLIT_NOTE).toMatch(/Angela keeps 70%/);
    expect(GEAR_SALES_SPLIT_NOTE).toMatch(/Evelyn receives 30%/);
    expect(GEAR_SALES_SPLIT_NOTE).toMatch(/hosting the gear/);
    expect(GEAR_SALES_SPLIT_NOTE).toMatch(/processing sales/);
    expect(GEAR_SALES_SPLIT_NOTE).toMatch(/administrative fees/);
    expect(GEAR_SALES_SPLIT_NOTE).toMatch(/application fees/);
    expect(GEAR_SALES_SPLIT_NOTE).toMatch(/\$10,000/);
    expect(GEAR_SALES_SPLIT_NOTE).not.toMatch(/does not assign the Host a merch revenue share/i);
    expect(GEAR_SALES_SPLIT_DETAILS.map((row) => row.label).join(' ')).toMatch(/70%/);
    expect(GEAR_SALES_SPLIT_DETAILS.map((row) => row.detail).join(' ')).toMatch(/application fees/);
  });
});
