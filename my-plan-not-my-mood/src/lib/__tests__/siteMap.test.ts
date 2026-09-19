import { describe, expect, it } from 'vitest';
import {
  APP_SITE_TREE,
  filterSiteTree,
  flattenLeaves,
  layoutTreemap,
  nodeWeight,
  siteBranches,
  treemapCoversUnitSquare,
} from '../siteMap';
import { storeRouteFromSitePath } from '../storeRoutes';

describe('siteMap', () => {
  it('maps public, tools, admin, and email branches from the root', () => {
    const ids = siteBranches().map((branch) => branch.id);
    expect(ids).toEqual(['public', 'tools', 'admin', 'email']);
    expect(APP_SITE_TREE.label).toContain('MY PLAN');
  });

  it('hides Join / Memberships unless Admin or Super Admin', () => {
    const publicLeaves = flattenLeaves(filterSiteTree(APP_SITE_TREE, false));
    expect(publicLeaves.some((leaf) => leaf.id === 'join')).toBe(false);
    expect(publicLeaves.some((leaf) => leaf.id === 'memberships')).toBe(false);
    expect(publicLeaves.map((leaf) => leaf.label)).toContain("What's Your Mood?");
    expect(publicLeaves.map((leaf) => leaf.label)).toContain('Hero mood bubbles');
    expect(publicLeaves.map((leaf) => leaf.label)).toContain('Mood workflow map');
    expect(publicLeaves.map((leaf) => leaf.label)).toContain('Home / Storefront');
    expect(publicLeaves.map((leaf) => leaf.label)).toContain('Make Payment');
    expect(publicLeaves.map((leaf) => leaf.label)).toContain('Privacy Policy');
    expect(publicLeaves.map((leaf) => leaf.label)).toContain('Logos');
    expect(publicLeaves.find((leaf) => leaf.id === 'gear')?.status).toBe('live');
    expect(publicLeaves.find((leaf) => leaf.id === 'privacy')?.status).toBe('live');
    expect(publicLeaves.map((leaf) => leaf.label)).not.toContain('Mailing List');
    expect(flattenLeaves(APP_SITE_TREE).find((leaf) => leaf.id === 'mailing-list')?.path).toBe('/admin/mailing-list');
    expect(flattenLeaves(APP_SITE_TREE).find((leaf) => leaf.id === 'mailing-list')?.status).toBe('gated');
    expect(publicLeaves.find((leaf) => leaf.id === 'budget')?.status).toBe('gated');
    expect(publicLeaves.find((leaf) => leaf.id === 'inventory-pricing')?.status).toBe('gated');
    const publicPaths = publicLeaves.map((leaf) => leaf.path).filter(Boolean) as string[];
    expect(publicPaths).toEqual(expect.arrayContaining(['/', '/about', '/gear', '/privacy-policy', '/contact', '/faq']));
    expect(
      publicPaths
        .filter((path) => !path.startsWith('/admin'))
        .every((path) => storeRouteFromSitePath(path) !== null),
    ).toBe(true);
    const adminLeaves = flattenLeaves(filterSiteTree(APP_SITE_TREE, true));
    expect(adminLeaves.map((leaf) => leaf.label)).toContain('Join / Memberships (Coming Soon)');
    expect(adminLeaves.map((leaf) => leaf.label)).toContain('Memberships (Coming Soon)');
    expect(adminLeaves.find((leaf) => leaf.id === 'join')?.status).toBe('gated');
  });

  it('lays out a treemap whose cells fill the 100×100 canvas', () => {
    const cells = layoutTreemap(APP_SITE_TREE);
    expect(cells.length).toBe(flattenLeaves(APP_SITE_TREE).length);
    expect(treemapCoversUnitSquare(cells)).toBe(true);
    expect(cells.every((cell) => cell.w > 0 && cell.h > 0)).toBe(true);
    expect(nodeWeight(APP_SITE_TREE)).toBeGreaterThan(20);
  });
});
