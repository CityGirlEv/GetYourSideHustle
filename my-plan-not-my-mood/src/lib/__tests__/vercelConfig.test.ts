import { describe, it, expect } from 'vitest';
import vercelConfig from '../../../vercel.json';

describe('My Plan, Not My Mood — Vercel Config Validation', () => {
  it('defines valid buildCommand and outputDirectory for Vite', () => {
    expect(vercelConfig.buildCommand).toBe('bun run build');
    expect(vercelConfig.outputDirectory).toBe('dist');
    expect(vercelConfig.cleanUrls).toBe(true);
  });

  it('includes SPA rewrites to index.html', () => {
    expect(vercelConfig.rewrites).toEqual([
      {
        source: '/(.*)',
        destination: '/index.html',
      },
    ]);
  });

  it('includes security and cache headers', () => {
    expect(Array.isArray(vercelConfig.headers)).toBe(true);
    const globalHeaderRule = vercelConfig.headers.find((h: any) => h.source === '/(.*)');
    expect(globalHeaderRule).toBeDefined();

    const headerKeys = globalHeaderRule?.headers.map((h: any) => h.key) ?? [];
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('X-XSS-Protection');
  });
});
