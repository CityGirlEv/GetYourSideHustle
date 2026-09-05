import { AppUser, canAccessAdminPortal, getRolePermissions, hasRole } from './userAuth';

/** Memberships stay Phase 2 — only Admin and Super Admin may see the surfaces. */
export function canSeeMemberships(user?: AppUser | null): boolean {
  const perms = getRolePermissions(user);
  return Boolean(perms.hasAdminRole || perms.isSuperAdmin);
}

export const MEMBERSHIP_JOINED_STORAGE_KEY = 'myplan_membership_joined_v1';

export interface MembershipTier {
  id: string;
  name: string;
  priceLabel: string;
  tagline: string;
  highlight?: boolean;
  perks: string[];
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'starter',
    name: 'Plan Starter',
    priceLabel: 'Free',
    tagline: 'Begin the accountability protocol',
    highlight: true,
    perks: [
      'Daily Affirmations (20–30s micro-sets)',
      '7-Day Reset Challenge',
      'Mood-to-Plan tool access',
      'Member community updates',
    ],
  },
  {
    id: 'accountability',
    name: 'Accountability Circle',
    priceLabel: '$19 / mo',
    tagline: 'Stay consistent with your people',
    perks: [
      'Everything in Plan Starter',
      'Weekly group accountability sessions',
      'Plan Receipt check-ins',
      'Shop member pricing (coming soon)',
    ],
  },
  {
    id: 'mentorship',
    name: 'Mentorship Track',
    priceLabel: '$49 / mo',
    tagline: 'Guided execution with real support',
    perks: [
      'Everything in Accountability Circle',
      '1:1 mentorship touchpoints',
      'Private accountability sessions',
      'Priority workshop registration',
    ],
  },
  {
    id: 'executive',
    name: 'Executive Protocol',
    priceLabel: '$99 / mo',
    tagline: 'Full immersion — plan over mood, always',
    perks: [
      'Everything in Mentorship Track',
      'Live workshops & masterclasses',
      'VIP accountability intensives',
      'Early access to gear drops & planners',
      'Founding member perks & recognition',
    ],
  },
];

export function markMembershipJoined(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEMBERSHIP_JOINED_STORAGE_KEY, 'true');
}

export function clearMembershipJoined(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MEMBERSHIP_JOINED_STORAGE_KEY);
}

export function hasMembershipAccess(user: AppUser | null): boolean {
  if (user && user.status === 'active') {
    if (canAccessAdminPortal(user)) return true;
    if (hasRole(user, 'member')) return true;
  }
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MEMBERSHIP_JOINED_STORAGE_KEY) === 'true';
}
