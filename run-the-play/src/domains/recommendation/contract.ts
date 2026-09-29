import { z } from 'zod';
import { StrictNormalizedMetrics } from '../metrics/provenance';

export const RecommendationVerdictEnum = z.enum([
  'KEEP_GOING',
  'PIVOT',
  'DROP_IT',
  'NOT_ENOUGH_DATA',
]);

export const ConfidenceLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const AIRecommendationSchema = z.object({
  verdict: RecommendationVerdictEnum,
  confidence: ConfidenceLevelEnum,
  why: z.array(z.string().min(1)).min(1, 'At least one evidence item is required'),
  whats_working: z.array(z.string()),
  whats_not_working: z.array(z.string()),
  next_play: z.string().min(5, 'Next play must be detailed'),
  what_to_test_next: z.string().min(5, 'Must specify one controlled variable experiment'),
  do_not_do: z.array(z.string()),
  is_synthetic_recommendation: z.boolean(),
  ai_provider: z.string(),
  prompt_version: z.string(),
});

export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;

export interface AIRecommendationInput {
  content_title: string;
  publication_type: string;
  metrics: StrictNormalizedMetrics;
  historical_velocity?: number;
}

export interface AIRecommendationProvider {
  name: string;
  generateRecommendation(input: AIRecommendationInput): Promise<AIRecommendation>;
}

export function validateRecommendation(payload: unknown): {
  success: boolean;
  data?: AIRecommendation;
  error?: string;
} {
  const result = AIRecommendationSchema.safeParse(payload);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}
