import { describe, expect, it } from 'vitest';
import {
  DOC_TECH_STACK_ID,
  IP_TECHNOLOGIES,
  buildTechStackDocumentHtml,
} from '../ipTechStack';

describe('ipTechStack', () => {
  it('lists every IP Plan technology layer', () => {
    const names = IP_TECHNOLOGIES.map((t) => t.name);
    expect(names).toContain('React 18 + Vite 6 + TypeScript');
    expect(names).toContain('Supabase (PostgreSQL + Auth)');
    expect(names).toContain('Stripe');
    expect(names).toContain('Cloudflare Pages + DNS / SSL');
    expect(names).toContain('Vitest + Playwright');
    expect(IP_TECHNOLOGIES.length).toBeGreaterThanOrEqual(8);
  });

  it('renders a Word/PDF section with jump target and each technology', () => {
    const html = buildTechStackDocumentHtml();
    expect(html).toContain(`id="${DOC_TECH_STACK_ID}"`);
    expect(html).toContain('Technologies in this Implementation Plan');
    for (const tech of IP_TECHNOLOGIES) {
      expect(html).toContain(tech.name);
      expect(html).toContain(tech.category);
    }
  });
});
