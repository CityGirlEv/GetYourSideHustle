import { describe, it, expect } from 'vitest';
import { SEEDED_PLATFORM_REGISTRY, getPlatformRegistryEntry } from '../registry/seed';

describe('Platform Registry Domain', () => {
  it('should seed at least 11 platforms as required by specification', () => {
    expect(SEEDED_PLATFORM_REGISTRY.length).toBeGreaterThanOrEqual(11);
  });

  it('should contain YouTube as AVAILABLE with full capability set', () => {
    const yt = getPlatformRegistryEntry('youtube');
    expect(yt).toBeDefined();
    expect(yt?.status).toBe('AVAILABLE');
    expect(yt?.capabilities.has_views).toBe(true);
    expect(yt?.capabilities.has_watch_time).toBe(true);
    expect(yt?.capabilities.has_retention_curve).toBe(true);
  });

  it('should list all future platforms in seed', () => {
    const platformIds = SEEDED_PLATFORM_REGISTRY.map((p) => p.id);
    expect(platformIds).toContain('tiktok');
    expect(platformIds).toContain('facebook');
    expect(platformIds).toContain('instagram');
    expect(platformIds).toContain('x');
    expect(platformIds).toContain('threads');
    expect(platformIds).toContain('linkedin');
    expect(platformIds).toContain('pinterest');
    expect(platformIds).toContain('twitch');
    expect(platformIds).toContain('reddit');
    expect(platformIds).toContain('snapchat');
  });
});
