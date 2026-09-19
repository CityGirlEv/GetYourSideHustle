import { moodWorkflowTreeNodes } from './moodWorkflow';

export type SiteNodeStatus = 'live' | 'planned' | 'gated';
export type SiteBranch = 'public' | 'tools' | 'admin' | 'email';

export interface SiteTreeNode {
  id: string;
  label: string;
  path?: string;
  status: SiteNodeStatus;
  branch: SiteBranch;
  weight?: number;
  children?: SiteTreeNode[];
}

export interface TreemapCell {
  id: string;
  label: string;
  path?: string;
  status: SiteNodeStatus;
  branch: SiteBranch;
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  weight: number;
}

export const APP_SITE_TREE: SiteTreeNode = {
  id: 'root',
  label: 'MY PLAN, NOT MY MOOD',
  path: '/',
  status: 'live',
  branch: 'public',
  children: [
    {
      id: 'public',
      label: 'Public Storefront',
      path: '/',
      status: 'live',
      branch: 'public',
      children: [
        { id: 'home', label: 'Home / Storefront', path: '/', status: 'live', branch: 'public', weight: 4 },
        { id: 'about', label: 'About', path: '/about', status: 'live', branch: 'public', weight: 2 },
        { id: 'gear', label: 'Accountability Gear', path: '/gear', status: 'live', branch: 'public', weight: 3 },
        { id: 'planners', label: 'Planners & Desk Pads', path: '/planners', status: 'live', branch: 'public', weight: 3 },
        { id: 'pay', label: 'Make Payment', path: '/pay', status: 'live', branch: 'public', weight: 3 },
        { id: 'join', label: 'Join / Memberships (Coming Soon)', path: '/join', status: 'gated', branch: 'public', weight: 3 },
        { id: 'memberships', label: 'Memberships (Coming Soon)', path: '/join', status: 'gated', branch: 'public', weight: 2 },
        { id: 'privacy', label: 'Privacy Policy', path: '/privacy-policy', status: 'live', branch: 'public', weight: 1 },
        { id: 'terms', label: 'Terms of Use', path: '/terms-of-use', status: 'live', branch: 'public', weight: 1 },
        { id: 'contact', label: 'Contact', path: '/contact', status: 'live', branch: 'public', weight: 1 },
        { id: 'faq', label: 'FAQ', path: '/faq', status: 'live', branch: 'public', weight: 1 },
        { id: 'beta-rewards', label: 'Beta Tester Rewards', path: '/beta-rewards', status: 'live', branch: 'public', weight: 2 },
        { id: 'beta-guide', label: 'Beta Testing Guide', path: '/beta-guide', status: 'live', branch: 'public', weight: 2 },
      ],
    },
    {
      id: 'tools',
      label: 'Interactive Tools',
      path: '/',
      status: 'live',
      branch: 'tools',
      children: [
        { id: 'mood', label: "What's Your Mood?", path: '/#mood-tool', status: 'live', branch: 'tools', weight: 4 },
        ...moodWorkflowTreeNodes(),
        { id: 'receipts', label: 'What Won Today? Receipts', path: '/#receipts', status: 'live', branch: 'tools', weight: 4 },
        { id: 'affirmations', label: 'Daily Affirmations', status: 'gated', branch: 'tools', weight: 3 },
        { id: 'challenge', label: '7-Day Reset Challenge', status: 'gated', branch: 'tools', weight: 3 },
        { id: 'account', label: 'Account / Sign In · Register', status: 'live', branch: 'tools', weight: 2 },
        { id: 'cart', label: 'Shopping Cart', status: 'live', branch: 'tools', weight: 2 },
      ],
    },
    {
      id: 'admin',
      label: 'Admin Portal',
      path: '/admin/plan',
      status: 'gated',
      branch: 'admin',
      children: [
        { id: 'plan', label: 'Plan', path: '/admin/plan', status: 'gated', branch: 'admin', weight: 5 },
        { id: 'budget', label: 'Budget (Super Admin)', path: '/admin/budget', status: 'gated', branch: 'admin', weight: 4 },
        { id: 'inventory-pricing', label: 'Inventory (Admin)', path: '/admin/inventory-pricing', status: 'gated', branch: 'admin', weight: 4 },
        { id: 'testing', label: 'Testing', path: '/admin/testing', status: 'gated', branch: 'admin', weight: 4 },
        { id: 'tasks', label: 'Tasks', path: '/admin/tasks', status: 'gated', branch: 'admin', weight: 4 },
        { id: 'factory', label: 'Content Factory', path: '/admin/factory', status: 'gated', branch: 'admin', weight: 4 },
        { id: 'gear-selections', label: 'Gear', path: '/admin/gear-selections', status: 'gated', branch: 'admin', weight: 3 },
        { id: 'logo-concepts', label: 'Logos', path: '/admin/logo-concepts', status: 'gated', branch: 'admin', weight: 3 },
        { id: 'asset-library', label: 'Asset Library', path: '/admin/asset-library', status: 'gated', branch: 'admin', weight: 3 },
        { id: 'users', label: 'Users', path: '/admin/users', status: 'gated', branch: 'admin', weight: 3 },
        { id: 'emails', label: 'Emails', path: '/admin/emails', status: 'gated', branch: 'admin', weight: 3 },
        { id: 'mailing-list', label: 'List (Admin)', path: '/admin/mailing-list', status: 'gated', branch: 'admin', weight: 3 },
        { id: 'guides', label: 'Beta Guide (Admin)', path: '/admin/guides', status: 'gated', branch: 'admin', weight: 3 },
        { id: 'sitemap', label: 'Site Map', path: '/sitemap', status: 'live', branch: 'admin', weight: 1 },
      ],
    },
    {
      id: 'email',
      label: 'Email Program (Phase 1)',
      status: 'planned',
      branch: 'email',
      children: [
        { id: 'email-auth', label: 'Signup · Approval · Welcome', status: 'live', branch: 'email', weight: 3 },
        { id: 'email-member', label: 'Membership · Beta · Challenge', status: 'planned', branch: 'email', weight: 3 },
        { id: 'email-shop', label: 'Orders · Cart · Fulfillment', status: 'planned', branch: 'email', weight: 3 },
        { id: 'email-admin', label: 'Admin alerts · Contact', status: 'live', branch: 'email', weight: 2 },
      ],
    },
  ],
};

export function nodeWeight(node: SiteTreeNode): number {
  if (!node.children?.length) return node.weight ?? 1;
  return node.children.reduce((sum, child) => sum + nodeWeight(child), 0);
}

export function flattenLeaves(node: SiteTreeNode): SiteTreeNode[] {
  if (!node.children?.length) return [node];
  return node.children.flatMap(flattenLeaves);
}

export function isMembershipSiteNode(id: string): boolean {
  return id === 'join' || id === 'memberships';
}

/** Hide Memberships / Join from everyone except Admin and Super Admin. */
export function filterSiteTree(node: SiteTreeNode, canSeeMemberships: boolean): SiteTreeNode {
  const children = node.children
    ?.filter((child) => canSeeMemberships || !isMembershipSiteNode(child.id))
    .map((child) => filterSiteTree(child, canSeeMemberships));
  return children ? { ...node, children } : node;
}

export function siteBranches(tree: SiteTreeNode = APP_SITE_TREE): SiteTreeNode[] {
  return tree.children ?? [];
}

/** Slice-and-dice treemap in a 0–100 coordinate space. */
export function layoutTreemap(
  node: SiteTreeNode,
  x = 0,
  y = 0,
  w = 100,
  h = 100,
  depth = 0,
): TreemapCell[] {
  const kids = node.children ?? [];
  if (!kids.length) {
    return [
      {
        id: node.id,
        label: node.label,
        path: node.path,
        status: node.status,
        branch: node.branch,
        x,
        y,
        w,
        h,
        depth,
        weight: nodeWeight(node),
      },
    ];
  }

  const total = kids.reduce((sum, child) => sum + nodeWeight(child), 0) || 1;
  const horizontal = w >= h;
  let cursor = horizontal ? x : y;
  const cells: TreemapCell[] = [];

  kids.forEach((child) => {
    const size = ((horizontal ? w : h) * nodeWeight(child)) / total;
    cells.push(
      ...layoutTreemap(
        child,
        horizontal ? cursor : x,
        horizontal ? y : cursor,
        horizontal ? size : w,
        horizontal ? h : size,
        depth + 1,
      ),
    );
    cursor += size;
  });

  return cells;
}

export function treemapCoversUnitSquare(cells: TreemapCell[]): boolean {
  const area = cells.reduce((sum, cell) => sum + cell.w * cell.h, 0);
  return Math.abs(area - 10000) < 0.01;
}
