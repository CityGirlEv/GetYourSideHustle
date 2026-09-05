export type ProvenanceSourceType = 
  | 'LIVE_API'
  | 'PUBLIC_API'
  | 'MANUAL'
  | 'IMPORTED'
  | 'MOCK'
  | 'SEEDED'
  | 'SIMULATED'
  | 'ESTIMATED'
  | 'UNAVAILABLE';

export interface ProvenanceMetadata {
  source_type: ProvenanceSourceType;
  source_platform: string;
  connector_version: string;
  environment: string;
  collection_method: string;
  collected_at: string;
  effective_at: string;
  is_synthetic: boolean;
  is_verified: boolean;
  ingestion_run_id: string;
}

export interface StrictNormalizedMetrics {
  workspace_id: string;
  platform_publication_id: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  watch_time_seconds: number | null;
  average_view_duration_seconds: number | null;
  average_percentage_viewed: number | null;
  stayed_to_watch_pct: number | null;
  swiped_away_pct: number | null;
  subscribers_gained: number | null;
  provenance: ProvenanceMetadata;
}

export function isSyntheticSource(sourceType: ProvenanceSourceType): boolean {
  return ['MOCK', 'SEEDED', 'SIMULATED', 'ESTIMATED'].includes(sourceType);
}

export function sanitizeMetricValue(val: unknown): number | null {
  if (val === undefined || val === null || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export function buildNormalizedMetrics(input: {
  workspace_id: string;
  platform_publication_id: string;
  raw_payload: Record<string, unknown>;
  source_type: ProvenanceSourceType;
  source_platform: string;
  ingestion_run_id: string;
  environment?: string;
}): StrictNormalizedMetrics {
  const isSynthetic = isSyntheticSource(input.source_type);
  const now = new Date().toISOString();

  return {
    workspace_id: input.workspace_id,
    platform_publication_id: input.platform_publication_id,
    // CRITICAL: Missing data is strictly NULL, NEVER defaulted to 0
    views: sanitizeMetricValue(input.raw_payload.viewCount ?? input.raw_payload.views),
    likes: sanitizeMetricValue(input.raw_payload.likeCount ?? input.raw_payload.likes),
    comments: sanitizeMetricValue(input.raw_payload.commentCount ?? input.raw_payload.comments),
    shares: sanitizeMetricValue(input.raw_payload.shareCount ?? input.raw_payload.shares),
    watch_time_seconds: sanitizeMetricValue(input.raw_payload.watchTimeSeconds ?? input.raw_payload.watch_time),
    average_view_duration_seconds: sanitizeMetricValue(input.raw_payload.averageViewDurationSeconds),
    average_percentage_viewed: sanitizeMetricValue(input.raw_payload.averagePercentageViewed),
    stayed_to_watch_pct: sanitizeMetricValue(input.raw_payload.stayedToWatchPct),
    swiped_away_pct: sanitizeMetricValue(input.raw_payload.swipedAwayPct),
    subscribers_gained: sanitizeMetricValue(input.raw_payload.subscribersGained),
    provenance: {
      source_type: input.source_type,
      source_platform: input.source_platform,
      connector_version: '1.0.0',
      environment: input.environment || 'production',
      collection_method: input.source_type === 'LIVE_API' ? 'OAUTH2_REST' : 'MANUAL_OR_SYNTHETIC',
      collected_at: now,
      effective_at: now,
      is_synthetic: isSynthetic,
      is_verified: !isSynthetic,
      ingestion_run_id: input.ingestion_run_id,
    },
  };
}
