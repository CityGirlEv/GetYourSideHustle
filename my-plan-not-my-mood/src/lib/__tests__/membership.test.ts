import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  canSeeMemberships,
  hasMembershipAccess,
  markMembershipJoined,
  clearMembershipJoined,
  MEMBERSHIP_JOINED_STORAGE_KEY,
  MEMBERSHIP_TIERS,
  MEMBERSHIP_INTRO_RATE_NOTE,
  membershipTierShowsIntroRate,
  AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE,
} from '../membership';

describe('membership', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defines preliminary membership tiers with perks', () => {
    expect(MEMBERSHIP_TIERS.length).toBeGreaterThanOrEqual(4);
    expect(MEMBERSHIP_TIERS[0].perks.some((p) => p.includes('Affirmations'))).toBe(true);
    expect(AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE).toMatch(/scope change/i);
    expect(AFFIRMATIONS_MEMBERSHIP_SCOPE_NOTE).toMatch(/Join to Unlock/);
    expect(MEMBERSHIP_TIERS.some((t) => t.perks.some((p) => p.toLowerCase().includes('mentorship')))).toBe(true);
    expect(MEMBERSHIP_INTRO_RATE_NOTE).toBe('Ends on Oct 31!');
    expect(membershipTierShowsIntroRate(MEMBERSHIP_TIERS[0]!)).toBe(false);
    expect(MEMBERSHIP_TIERS.filter(membershipTierShowsIntroRate).map((tier) => tier.priceLabel)).toEqual([
      '$19 / mo',
      '$49 / mo',
      '$99 / mo',
    ]);
  });

  it('grants access when membership joined flag is set', () => {
    expect(hasMembershipAccess(null)).toBe(false);
    markMembershipJoined();
    expect(localStorage.getItem(MEMBERSHIP_JOINED_STORAGE_KEY)).toBe('true');
    expect(hasMembershipAccess(null)).toBe(true);
    clearMembershipJoined();
    expect(hasMembershipAccess(null)).toBe(false);
  });

  it('shows Memberships only to Admin and Super Admin', () => {
    expect(canSeeMemberships(null)).toBe(false);
    expect(canSeeMemberships({
      id: '1',
      name: 'QA',
      email: 'qa@test.com',
      role: 'qa',
      roles: ['qa'],
      status: 'active',
      wantsBeta: false,
      phone: '',
      createdAt: '2026-01-01',
    })).toBe(false);
    expect(canSeeMemberships({
      id: '2',
      name: 'Dev',
      email: 'dev@test.com',
      role: 'dev',
      roles: ['dev'],
      status: 'active',
      wantsBeta: false,
      phone: '',
      createdAt: '2026-01-01',
    })).toBe(false);
    expect(canSeeMemberships({
      id: '3',
      name: 'Member',
      email: 'm@test.com',
      role: 'member',
      roles: ['member'],
      status: 'active',
      wantsBeta: false,
      phone: '',
      createdAt: '2026-01-01',
    })).toBe(false);
    expect(canSeeMemberships({
      id: '4',
      name: 'Angela',
      email: 'a@test.com',
      role: 'admin',
      roles: ['admin'],
      status: 'active',
      wantsBeta: false,
      phone: '',
      createdAt: '2026-01-01',
    })).toBe(true);
    expect(canSeeMemberships({
      id: '5',
      name: 'Evelyn',
      email: 'e@test.com',
      role: 'super_admin',
      roles: ['super_admin'],
      status: 'active',
      wantsBeta: false,
      phone: '',
      createdAt: '2026-01-01',
    })).toBe(true);
  });

  it('sits Memberships tight under the in-flow header', () => {
    const join = readFileSync(resolve(process.cwd(), 'src/components/JoinPage.tsx'), 'utf8');
    expect(join).toContain('HEADER_COMPACT_PAGE_OFFSET');
    expect(join).toContain('PAGE_CANVAS_CLASS');
    expect(join).not.toContain('HEADER_CONTENT_OFFSET');
    expect(join).toContain('py-2.5 sm:py-3');
    expect(join).toContain('data-testid="join-page"');
  });
});
