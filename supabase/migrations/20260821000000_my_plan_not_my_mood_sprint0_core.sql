-- My Plan, Not My Mood - Sprint 0 Core Database Schema Migration
-- Author: Engineering Team
-- Scope: Multi-Tenancy, Platform Registry, Connections, Content Assets, Publications, Ingestion, Provenance, Metrics, Snapshots, Recommendations, Dev OS

-- 1. Identity & Tenancy
CREATE TYPE public.user_role AS ENUM ('OWNER', 'ADMIN', 'ANALYST', 'CREATOR', 'COACH', 'VIEWER');

CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workspace_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role public.user_role NOT NULL DEFAULT 'CREATOR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 2. Platform Registry & Connections
CREATE TYPE public.platform_status AS ENUM ('AVAILABLE', 'BETA', 'MANUAL_DATA_ONLY', 'PLANNED', 'UNSUPPORTED', 'DISABLED');
CREATE TYPE public.auth_method AS ENUM ('OAUTH2', 'API_KEY', 'PUBLIC_SCRAPE_LEGAL', 'MANUAL', 'EXPORT_IMPORT');

CREATE TABLE IF NOT EXISTS public.platform_registry (
    id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    status public.platform_status NOT NULL DEFAULT 'PLANNED',
    auth_method public.auth_method NOT NULL DEFAULT 'OAUTH2',
    api_version VARCHAR(20),
    capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
    rate_limit_rpm INT DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    platform_id VARCHAR(50) NOT NULL REFERENCES public.platform_registry(id),
    account_identifier VARCHAR(255) NOT NULL,
    account_name VARCHAR(255),
    encrypted_credentials JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, platform_id, account_identifier)
);

-- 3. Content Asset & Platform Publication
CREATE TABLE IF NOT EXISTS public.content_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    canonical_tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platform_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_asset_id UUID NOT NULL REFERENCES public.content_assets(id) ON DELETE CASCADE,
    platform_connection_id UUID NOT NULL REFERENCES public.platform_connections(id) ON DELETE CASCADE,
    external_content_id VARCHAR(255) NOT NULL,
    publication_type VARCHAR(50) NOT NULL,
    published_at TIMESTAMPTZ,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform_connection_id, external_content_id)
);

-- 4. Ingestion & Provenance
CREATE TYPE public.provenance_source_type AS ENUM (
    'LIVE_API', 'PUBLIC_API', 'MANUAL', 'IMPORTED', 'MOCK', 'SEEDED', 'SIMULATED', 'ESTIMATED', 'UNAVAILABLE'
);
CREATE TYPE public.ingestion_status AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

CREATE TABLE IF NOT EXISTS public.raw_ingestion_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    platform_connection_id UUID REFERENCES public.platform_connections(id),
    status public.ingestion_status NOT NULL DEFAULT 'PENDING',
    source_type public.provenance_source_type NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    records_ingested INT DEFAULT 0,
    error_log JSONB
);

CREATE TABLE IF NOT EXISTS public.raw_metrics_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_run_id UUID NOT NULL REFERENCES public.raw_ingestion_runs(id) ON DELETE CASCADE,
    platform_publication_id UUID REFERENCES public.platform_publications(id),
    raw_payload JSONB NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.normalized_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    platform_publication_id UUID NOT NULL REFERENCES public.platform_publications(id) ON DELETE CASCADE,
    ingestion_run_id UUID NOT NULL REFERENCES public.raw_ingestion_runs(id),
    
    views BIGINT,
    likes BIGINT,
    comments BIGINT,
    shares BIGINT,
    watch_time_seconds NUMERIC(12, 2),
    average_view_duration_seconds NUMERIC(8, 2),
    average_percentage_viewed NUMERIC(5, 2),
    engaged_views BIGINT,
    stayed_to_watch_pct NUMERIC(5, 2),
    swiped_away_pct NUMERIC(5, 2),
    subscribers_gained INT,
    impressions BIGINT,
    click_through_rate_pct NUMERIC(5, 2),
    
    source_type public.provenance_source_type NOT NULL,
    source_platform VARCHAR(50) NOT NULL,
    connector_version VARCHAR(50) NOT NULL,
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    is_synthetic BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    collected_at TIMESTAMPTZ NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL
);

-- 5. Historical Snapshots
CREATE TYPE public.content_state AS ENUM (
    'TESTING', 'ACCELERATING', 'STRONG', 'PLATEAUING', 'SECOND_PUSH', 'WINNER', 'UNDERPERFORMING', 'NEEDS_BETTER_HOOK', 'NEEDS_BETTER_RETENTION'
);

CREATE TABLE IF NOT EXISTS public.historical_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_publication_id UUID NOT NULL REFERENCES public.platform_publications(id) ON DELETE CASCADE,
    snapshot_at TIMESTAMPTZ NOT NULL,
    views_total BIGINT NOT NULL,
    views_gained_1h INT,
    views_gained_24h INT,
    velocity_views_per_hour NUMERIC(10, 2),
    acceleration_pct NUMERIC(6, 2),
    time_to_100_views_minutes INT,
    time_to_500_views_minutes INT,
    time_to_1000_views_minutes INT,
    detected_state public.content_state NOT NULL DEFAULT 'TESTING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AI Recommendations
CREATE TYPE public.recommendation_verdict AS ENUM ('KEEP_GOING', 'PIVOT', 'DROP_IT', 'NOT_ENOUGH_DATA');
CREATE TYPE public.confidence_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    content_asset_id UUID REFERENCES public.content_assets(id),
    platform_publication_id UUID REFERENCES public.platform_publications(id),
    
    verdict public.recommendation_verdict NOT NULL,
    confidence public.confidence_level NOT NULL,
    why JSONB NOT NULL,
    whats_working JSONB NOT NULL,
    whats_not_working JSONB NOT NULL,
    next_play TEXT NOT NULL,
    what_to_test_next TEXT NOT NULL,
    do_not_do JSONB NOT NULL,
    
    is_synthetic_recommendation BOOLEAN NOT NULL DEFAULT FALSE,
    ai_provider VARCHAR(50) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Dev OS Management
CREATE TYPE public.task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE public.task_status AS ENUM ('BACKLOG', 'READY', 'IN_PROGRESS', 'BLOCKED', 'READY_FOR_TESTING', 'TESTING', 'COMPLETE');
CREATE TYPE public.task_type AS ENUM ('FEATURE', 'BUG', 'REFACTOR', 'INFRASTRUCTURE', 'DOCS');
CREATE TYPE public.test_status AS ENUM ('NOT_RUN', 'PASS', 'FAIL', 'BLOCKED', 'READY_FOR_RETEST');
CREATE TYPE public.defect_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE public.defect_status AS ENUM ('OPEN', 'IN_FIX', 'RESOLVED', 'RETEST_FAILED', 'CLOSED');

CREATE TABLE IF NOT EXISTS public.dev_os_requirements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    sprint_target VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dev_os_user_stories (
    id VARCHAR(50) PRIMARY KEY,
    requirement_id VARCHAR(50) NOT NULL REFERENCES public.dev_os_requirements(id),
    role VARCHAR(100) NOT NULL,
    want TEXT NOT NULL,
    so_that TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dev_os_tasks (
    id VARCHAR(50) PRIMARY KEY,
    requirement_id VARCHAR(50) REFERENCES public.dev_os_requirements(id),
    user_story_id VARCHAR(50) REFERENCES public.dev_os_user_stories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sprint VARCHAR(20) NOT NULL DEFAULT 'Sprint 0',
    priority public.task_priority NOT NULL DEFAULT 'MEDIUM',
    status public.task_status NOT NULL DEFAULT 'BACKLOG',
    type public.task_type NOT NULL DEFAULT 'FEATURE',
    estimated_hours NUMERIC(4, 1),
    actual_hours NUMERIC(4, 1),
    acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dev_os_test_cases (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) REFERENCES public.dev_os_tasks(id),
    requirement_id VARCHAR(50) REFERENCES public.dev_os_requirements(id),
    sprint VARCHAR(20) NOT NULL,
    feature VARCHAR(100) NOT NULL,
    preconditions TEXT,
    steps JSONB NOT NULL,
    expected_result TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dev_os_test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_id VARCHAR(50) NOT NULL REFERENCES public.dev_os_test_cases(id),
    status public.test_status NOT NULL,
    actual_result TEXT NOT NULL,
    tester_notes TEXT,
    executed_by VARCHAR(100) NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dev_os_defects (
    id VARCHAR(50) PRIMARY KEY,
    test_case_id VARCHAR(50) REFERENCES public.dev_os_test_cases(id),
    task_id VARCHAR(50) REFERENCES public.dev_os_tasks(id),
    severity public.defect_severity NOT NULL DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    reproduction_steps TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    actual_behavior TEXT NOT NULL,
    status public.defect_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normalized_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
