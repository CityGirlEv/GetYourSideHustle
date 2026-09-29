import { describe, it, expect } from 'vitest';
import { MOOD_OPTIONS } from '../data/moods';
import { PRODUCTS } from '../data/products';

describe('My Plan, Not My Mood Store & Data Engine', () => {
  it('should contain 6 primary mood options with concrete action steps', () => {
    expect(MOOD_OPTIONS.length).toEqual(6);
    MOOD_OPTIONS.forEach((m) => {
      expect(m.label).toBeDefined();
      expect(m.actionStep.length).toBeGreaterThan(10);
    });
  });

  it('should catalog hero products across all signature collections', () => {
    const collections = PRODUCTS.map((p) => p.collection);
    expect(collections).toContain('original');
    expect(collections).toContain('check-the-box');
    expect(collections).toContain('midlife');
    expect(collections).toContain('planners');
  });
});
