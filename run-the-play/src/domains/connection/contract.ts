import { ConnectorCapabilities } from '../registry/types';

export interface PlatformAccount {
  account_identifier: string;
  account_name: string;
  avatar_url?: string;
  subscriber_count?: number;
}

export interface PlatformContentItem {
  external_content_id: string;
  title: string;
  publication_type: 'youtube_short' | 'youtube_video' | 'tiktok_post' | 'instagram_reel';
  published_at: Date;
  url: string;
}

export interface PlatformRawMetrics {
  external_content_id: string;
  collected_at: Date;
  raw_payload: Record<string, unknown>;
}

export interface NormalizedMetricsPayload {
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
  source_type: 'LIVE_API' | 'PUBLIC_API' | 'MANUAL' | 'IMPORTED' | 'MOCK' | 'SEEDED' | 'SIMULATED' | 'ESTIMATED' | 'UNAVAILABLE';
  is_synthetic: boolean;
}

export interface PlatformConnectorContract {
  platform_id: string;
  
  authenticate(credentials: Record<string, unknown>): Promise<{ access_token: string; refresh_token?: string }>;
  disconnect(connection_id: string): Promise<boolean>;
  getAccount(connection_id: string): Promise<PlatformAccount>;
  getContent(connection_id: string, limit?: number): Promise<PlatformContentItem[]>;
  getContentMetrics(connection_id: string, external_content_ids: string[]): Promise<PlatformRawMetrics[]>;
  getHistoricalMetrics(connection_id: string, external_content_id: string, from: Date, to: Date): Promise<PlatformRawMetrics[]>;
  getCapabilities(): ConnectorCapabilities;
  refresh(connection_id: string): Promise<boolean>;
  normalize(raw: PlatformRawMetrics): NormalizedMetricsPayload;
}
