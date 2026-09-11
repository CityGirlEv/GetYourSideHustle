import React from 'react';
import { GitBranch, LayoutGrid, Lock, Map } from 'lucide-react';
import { HEADER_CONTENT_OFFSET } from '../lib/headerClearance';
import {
  APP_SITE_TREE,
  filterSiteTree,
  flattenLeaves,
  layoutTreemap,
  nodeWeight,
  siteBranches,
  type SiteBranch,
  type SiteNodeStatus,
  type SiteTreeNode,
} from '../lib/siteMap';
import type { StoreRoute } from '../lib/storeRoutes';
import { storeRouteFromSitePath } from '../lib/storeRoutes';
import { Logo } from './Logo';

const BRANCH_TONE: Record<SiteBranch, { fill: string; text: string; border: string; chip: string }> = {
  public: { fill: '#C2410C', text: '#FFFFFF', border: '#9A3412', chip: 'bg-[#C2410C] text-white' },
  tools: { fill: '#E8A05A', text: '#1F1917', border: '#C2410C', chip: 'bg-[#E8A05A] text-[#1F1917]' },
  admin: { fill: '#2D2623', text: '#FFFFFF', border: '#1F1917', chip: 'bg-[#2D2623] text-white' },
  email: { fill: '#8FA8C4', text: '#1F1917', border: '#5C738C', chip: 'bg-[#8FA8C4] text-[#1F1917]' },
};

const STATUS_LABEL: Record<SiteNodeStatus, string> = {
  live: 'Live',
  planned: 'Planned',
  gated: 'Gated',
};

interface SiteMapPageProps {
  onNavigate: (route: StoreRoute) => void;
  canSeeMemberships?: boolean;
  embedded?: boolean;
}

function storeRouteFromPath(path?: string): StoreRoute | null {
  return storeRouteFromSitePath(path);
}

export const SiteMapPage: React.FC<SiteMapPageProps> = ({ onNavigate, canSeeMemberships = false, embedded = false }) => {
  const tree = filterSiteTree(APP_SITE_TREE, canSeeMemberships);
  const branches = siteBranches(tree);
  const leaves = flattenLeaves(tree);
  const cells = layoutTreemap(tree);
  const liveCount = leaves.filter((leaf) => leaf.status === 'live').length;
  const plannedCount = leaves.filter((leaf) => leaf.status === 'planned').length;
  const gatedCount = leaves.filter((leaf) => leaf.status === 'gated').length;

  const openNode = (node: { path?: string }) => {
    const route = storeRouteFromPath(node.path);
    if (route) onNavigate(route);
  };

  return (
    <div className={`${embedded ? '' : HEADER_CONTENT_OFFSET} ${embedded ? 'pb-6 px-0' : 'pb-16 px-4 sm:px-6 lg:px-8'}`} data-testid="site-map-page">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Logo variant="seal-only" size="md" className="shrink-0 bg-[#FAF8F5] rounded-2xl p-1 border border-[#E5DFD3]" />
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] border border-[#C2410C]/30 text-[10px] font-mono font-black uppercase tracking-wider mb-2">
                <Map className="w-3.5 h-3.5" /> Information Architecture
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-serif text-[#1F1917]">
                Site Map <span className="text-[#C2410C] italic">&amp; Tree Map</span>
              </h1>
              <p className="text-sm text-[#3F3832] font-medium mt-1 max-w-2xl">
                How MY PLAN, NOT MY MOOD is structured — live storefront pages, membership tools, admin portal, and the included email program.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <Stat label="Surfaces" value={String(leaves.length)} />
            <Stat label="Live" value={String(liveCount)} />
            <Stat label="Planned" value={String(plannedCount)} />
            <Stat label="Gated" value={String(gatedCount)} />
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide">
            <span className="px-3 min-h-[32px] inline-flex items-center rounded-full bg-[#C2410C] text-white">Public</span>
            <span className="px-3 min-h-[32px] inline-flex items-center rounded-full bg-[#E8A05A] text-[#1F1917]">Tools</span>
            <span className="px-3 min-h-[32px] inline-flex items-center rounded-full bg-[#2D2623] text-white">Admin</span>
            <span className="px-3 min-h-[32px] inline-flex items-center rounded-full bg-[#8FA8C4] text-[#1F1917]">Email</span>
            <span className="px-3 min-h-[32px] inline-flex items-center rounded-full border-2 border-[#1F1917] text-[#1F1917]">Live</span>
            <span className="px-3 min-h-[32px] inline-flex items-center rounded-full border-2 border-dashed border-[#3F3832] text-[#3F3832]">Planned</span>
            <span className="px-3 min-h-[32px] inline-flex items-center gap-1 rounded-full bg-[#FAF8F5] border-2 border-[#1F1917] text-[#1F1917]">
              <Lock className="w-3 h-3" /> Gated
            </span>
          </div>
        </header>

        <section className="bg-[#FAF8F5] border-2 border-[#1F1917] rounded-3xl p-5 sm:p-8 space-y-6" aria-labelledby="sitemap-tree-heading">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#C2410C]" />
            <h2 id="sitemap-tree-heading" className="text-xl font-black uppercase font-serif text-[#1F1917]">
              Site Map — Tree
            </h2>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="min-h-[44px] px-6 rounded-2xl bg-[#C2410C] text-white font-black uppercase tracking-wide border-2 border-[#1F1917]"
            >
              {APP_SITE_TREE.label}
            </button>
          </div>
          <div className="hidden sm:block h-6 w-px bg-[#1F1917] mx-auto" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {branches.map((branch) => (
              <BranchColumn key={branch.id} branch={branch} onOpen={openNode} />
            ))}
          </div>
        </section>

        <section className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-8 space-y-4" aria-labelledby="sitemap-treemap-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-[#C2410C]" />
              <h2 id="sitemap-treemap-heading" className="text-xl font-black uppercase font-serif text-[#1F1917]">
                Tree Map — Surface Weight
              </h2>
            </div>
            <p className="text-xs font-medium text-[#3F3832] max-w-md">
              Tile size is weighted by how much of the product each surface represents. Click a live tile to open it.
            </p>
          </div>

          <div
            className="relative w-full overflow-hidden rounded-2xl border-2 border-[#1F1917] bg-[#E5DFD3]"
            style={{ paddingBottom: '62%' }}
            data-testid="site-treemap"
          >
            {cells.map((cell) => {
              const tone = BRANCH_TONE[cell.branch];
              const route = storeRouteFromPath(cell.path);
              const planned = cell.status === 'planned';
              return (
                <button
                  key={cell.id}
                  type="button"
                  disabled={!route}
                  onClick={() => openNode(cell)}
                  title={`${cell.label} · ${STATUS_LABEL[cell.status]} · weight ${cell.weight}`}
                  className={`absolute overflow-hidden text-left px-2 py-1.5 border border-white/40 ${
                    route ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-white' : 'cursor-default'
                  }`}
                  style={{
                    left: `${cell.x}%`,
                    top: `${cell.y}%`,
                    width: `${cell.w}%`,
                    height: `${cell.h}%`,
                    background: tone.fill,
                    color: tone.text,
                    opacity: planned ? 0.72 : 1,
                  }}
                >
                  <span className="block text-[9px] sm:text-[10px] font-black uppercase leading-tight line-clamp-3">
                    {cell.label}
                  </span>
                  <span className="hidden sm:block text-[8px] font-mono uppercase opacity-80 mt-0.5">
                    {STATUS_LABEL[cell.status]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-[#E5DFD3] bg-[#FAF8F5] py-3">
      <div className="text-2xl font-black text-[#C2410C] tabular-nums">{value}</div>
      <div className="text-[10px] font-mono font-black uppercase text-[#3F3832]">{label}</div>
    </div>
  );
}

function BranchColumn({
  branch,
  onOpen,
}: {
  branch: SiteTreeNode;
  onOpen: (node: SiteTreeNode) => void;
}) {
  const tone = BRANCH_TONE[branch.branch];
  return (
    <div className="rounded-2xl border-2 border-[#1F1917] bg-white overflow-hidden">
      <div className={`px-3 py-3 min-h-[44px] flex items-center justify-between gap-2 ${tone.chip}`}>
        <span className="text-[11px] font-black uppercase leading-tight">{branch.label}</span>
        <span className="text-[10px] font-mono font-black tabular-nums">{nodeWeight(branch)}</span>
      </div>
      <ul className="p-2 space-y-1.5">
        {(branch.children ?? []).map((child) => {
          const route = storeRouteFromPath(child.path);
          const dashed = child.status === 'planned';
          return (
            <li key={child.id}>
              <button
                type="button"
                disabled={!route}
                onClick={() => onOpen(child)}
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left text-[11px] font-black uppercase leading-snug border-2 ${
                  dashed ? 'border-dashed border-[#3F3832] text-[#3F3832] bg-[#FAF8F5]' : 'border-[#1F1917] text-[#1F1917] bg-[#FAF8F5]'
                } ${route ? 'hover:bg-[#FFEDD5] hover:border-[#C2410C] cursor-pointer' : 'cursor-default'}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{child.label}</span>
                  {child.status === 'gated' && <Lock className="w-3.5 h-3.5 shrink-0 text-[#C2410C]" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SiteMapPage;
