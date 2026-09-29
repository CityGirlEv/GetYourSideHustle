/** Product-sale split on the gear drop. Separate from the $10,000 Phase 1 build fee. */
export const GEAR_SALES_BRAND_SHARE = 0.7;
export const GEAR_SALES_HOST_SHARE = 0.3;
export const GEAR_SALES_SPLIT_LABEL = '70/30';

export const GEAR_SALES_SPLIT_HEADING = 'Gear sales split — 70/30';

export const GEAR_SALES_SPLIT_NOTE =
  'Gear sales split 70/30. Angela keeps 70% of product sales. Evelyn receives 30% to cover hosting the gear, processing sales, administrative fees, and application fees. This is separate from the $10,000 Phase 1 build fee.';

export const GEAR_SALES_SPLIT_DETAILS: Array<{ label: string; detail: string }> = [
  {
    label: 'Angela — 70%',
    detail:
      'Keeps 70% of gear sales. She still owns the goods and covers blanks, print, shipping, returns, and customer product issues.',
  },
  {
    label: 'Evelyn — 30%',
    detail:
      'Receives 30% of gear sales to cover hosting the gear, processing sales, administrative fees, and application fees.',
  },
  {
    label: 'Not the $10,000',
    detail:
      'The $10,000 Phase 1 fee pays the five build sprints. The 30% is how ongoing store operation is paid as shirts sell.',
  },
];

export interface GearSaleSplit {
  brand: number;
  host: number;
  total: number;
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function splitGearSaleAmount(amount: number): GearSaleSplit {
  const total = Math.max(0, amount);
  const host = roundCents(total * GEAR_SALES_HOST_SHARE);
  const brand = roundCents(total - host);
  return { brand, host, total };
}

export function formatSharePercent(share: number): string {
  return `${Math.round(share * 100)}%`;
}
