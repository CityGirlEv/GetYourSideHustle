import { describe, it, expect } from 'vitest';
import { buildNormalizedMetrics, isSyntheticSource } from '../metrics/provenance';

describe('Data Provenance Engine', () => {
  it('should identify synthetic source types correctly', () => {
    expect(isSyntheticSource('LIVE_API')).toBe(false);
    expect(isSyntheticSource('PUBLIC_API')).toBe(false);
    expect(isSyntheticSource('MANUAL')).toBe(false);
    expect(isSyntheticSource('MOCK')).toBe(true);
    expect(isSyntheticSource('SIMULATED')).toBe(true);
    expect(isSyntheticSource('SEEDED')).toBe(true);
  });

  it('CRITICAL: Missing metrics must return NULL and NEVER default to 0', () => {
    const metrics = buildNormalizedMetrics({
      workspace_id: 'ws-123',
      platform_publication_id: 'pub-456',
      raw_payload: {
        viewCount: 1500,
      },
      source_type: 'LIVE_API',
      source_platform: 'youtube',
      ingestion_run_id: 'run-789',
    });

    expect(metrics.views).toBe(1500);
    expect(metrics.watch_time_seconds).toBeNull();
    expect(metrics.average_view_duration_seconds).toBeNull();
    expect(metrics.stayed_to_watch_pct).toBeNull();
    expect(metrics.provenance.is_synthetic).toBe(false);
    expect(metrics.provenance.source_type).toBe('LIVE_API');
  });

  it('should mark synthetic datasets as is_synthetic = true and is_verified = false', () => {
    const metrics = buildNormalizedMetrics({
      workspace_id: 'ws-123',
      platform_publication_id: 'pub-456',
      raw_payload: {
        views: 100,
      },
      source_type: 'SIMULATED',
      source_platform: 'youtube',
      ingestion_run_id: 'run-mock-01',
    });

    expect(metrics.provenance.is_synthetic).toBe(true);
    expect(metrics.provenance.is_verified).toBe(false);
    expect(metrics.provenance.source_type).toBe('SIMULATED');
  });
});
