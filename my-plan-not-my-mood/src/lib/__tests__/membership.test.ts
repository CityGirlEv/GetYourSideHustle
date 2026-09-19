import { describe, it, expect, beforeEach } from 'vitest';
import {
  canSeeMemberships,
  hasMembershipAccess,
  markMembershipJoined,
  clearMembershipJoined,
  MEMBERSHIP_JOINED_STORAGE_KEY,
  MEMBERSHIP_TIERS,
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
});
