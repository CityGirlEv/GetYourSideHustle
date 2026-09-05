import { describe, expect, it } from 'vitest';
import { toggleExpandedPlan } from '../paymentPlanAccordion';

describe('toggleExpandedPlan', () => {
  it('expands a closed payment plan section', () => {
    expect(toggleExpandedPlan([], 'phase1')).toEqual(['phase1']);
  });

  it('collapses an open payment plan section without closing others', () => {
    expect(toggleExpandedPlan(['phase1', 'combined'], 'phase1')).toEqual(['combined']);
  });
});
