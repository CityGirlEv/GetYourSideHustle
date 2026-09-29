import { describe, it, expect } from 'vitest';
import { validateRecommendation } from '../recommendation/contract';

describe('AI Recommendation Contract Guard', () => {
  it('should pass validation for a valid structured verdict', () => {
    const validPayload = {
      verdict: 'KEEP_GOING',
      confidence: 'HIGH',
      why: ['View velocity increased by 45% in first 2 hours', 'Average retention exceeds 70%'],
      whats_working: ['Strong hook in first 3 seconds', 'High subscriber conversion rate'],
      whats_not_working: ['Click-through rate slightly below niche average'],
      next_play: 'Double down on short-form format with similar hook structure',
      what_to_test_next: 'Test high-contrast thumbnail text variant',
      do_not_do: ['Do not alter video intro length', 'Do not change upload schedule'],
      is_synthetic_recommendation: false,
      ai_provider: 'gemini-1.5-pro',
      prompt_version: '1.0.0',
    };

    const res = validateRecommendation(validPayload);
    expect(res.success).toBe(true);
    expect(res.data?.verdict).toBe('KEEP_GOING');
  });

  it('should reject invalid verdict strings', () => {
    const invalidPayload = {
      verdict: 'MAYBE_SO',
      confidence: 'HIGH',
      why: ['Evidence point'],
      whats_working: [],
      whats_not_working: [],
      next_play: 'Do something',
      what_to_test_next: 'Test variable',
      do_not_do: [],
      is_synthetic_recommendation: false,
      ai_provider: 'test',
      prompt_version: '1.0.0',
    };

    const res = validateRecommendation(invalidPayload);
    expect(res.success).toBe(false);
    expect(res.error).toContain('verdict');
  });

  it('should reject payload missing why evidence', () => {
    const invalidPayload = {
      verdict: 'PIVOT',
      confidence: 'MEDIUM',
      why: [],
      whats_working: [],
      whats_not_working: [],
      next_play: 'Change strategy',
      what_to_test_next: 'Test new hook',
      do_not_do: [],
      is_synthetic_recommendation: false,
      ai_provider: 'test',
      prompt_version: '1.0.0',
    };

    const res = validateRecommendation(invalidPayload);
    expect(res.success).toBe(false);
  });
});
