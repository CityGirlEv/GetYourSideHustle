export type PlatformStatus = 
  | 'AVAILABLE' 
  | 'BETA' 
  | 'MANUAL_DATA_ONLY' 
  | 'PLANNED' 
  | 'UNSUPPORTED' 
  | 'DISABLED';

export type AuthMethod = 
  | 'OAUTH2' 
  | 'API_KEY' 
  | 'PUBLIC_SCRAPE_LEGAL' 
  | 'MANUAL' 
  | 'EXPORT_IMPORT';

export interface ConnectorCapabilities {
  has_views: boolean;
  has_likes: boolean;
  has_comments: boolean;
  has_shares: boolean;
  has_watch_time: boolean;
  has_retention_curve: boolean;
  has_swiped_away: boolean;
  has_traffic_sources: boolean;
  supports_historical_backfill: boolean;
  supports_realtime_polling: boolean;
  max_historical_days: number;
  rate_limit_rpm: number;
}

export interface PlatformRegistryEntry {
  id: string;
  display_name: string;
  status: PlatformStatus;
  auth_method: AuthMethod;
  api_version?: string;
  capabilities: ConnectorCapabilities;
  rate_limit_rpm: number;
  doc_url?: string;
}
