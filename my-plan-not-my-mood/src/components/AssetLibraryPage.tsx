import React, { useState } from 'react';
import { Images } from 'lucide-react';
import {
  ASSET_LIBRARY_HUB_SECTIONS,
  ASSET_LIBRARY_SHOW_ALL_FOCUS_IDS,
  DEFAULT_ASSET_LIBRARY_HUB_TAB,
  DEFAULT_ASSET_LIBRARY_SHOW_ALL_FOCUS,
  isAssetLibraryShowAllTab,
  resolveAssetLibraryHubTab,
  resolveAssetLibraryShowAllFocus,
  studioTabClass,
  studioTabMetaClass,
  type AssetLibraryHubSectionId,
  type AssetLibraryShowAllFocus,
} from '../lib/assetLibrary';
import type { AdminStudioTab } from '../lib/adminStudio';
import { AccessoriesPage } from './AccessoriesPage';
import { GearSelectionsPage } from './GearSelectionsPage';
import { LogoConceptsPage } from './LogoConceptsPage';

const SHOW_ALL_TAB_LABELS: Record<AssetLibraryShowAllFocus, string> = {
  gear: 'Gear',
  logos: 'Logos',
  accessories: 'Accessories',
};

export const AssetLibraryPage: React.FC<{
  actorName?: string;
  actorEmail?: string;
  onOpenTab: (tab: AdminStudioTab) => void;
  canConfigure?: boolean;
}> = ({ actorName = 'Evelyn', actorEmail, canConfigure = false }) => {
  const [activeHub, setActiveHub] = useState<AssetLibraryHubSectionId>(DEFAULT_ASSET_LIBRARY_HUB_TAB);
  const [showAllFocus, setShowAllFocus] = useState<AssetLibraryShowAllFocus>(DEFAULT_ASSET_LIBRARY_SHOW_ALL_FOCUS);
  const hubId = resolveAssetLibraryHubTab(activeHub);
  const hub = ASSET_LIBRARY_HUB_SECTIONS.find((section) => section.id === hubId) ?? ASSET_LIBRARY_HUB_SECTIONS[0]!;
  const showAll = isAssetLibraryShowAllTab(hubId);
  const innerFocus = resolveAssetLibraryShowAllFocus(showAllFocus);

  const showGear = hub.id === 'gear' || (showAll && innerFocus === 'gear');
  const showLogos = hub.id === 'logos' || (showAll && innerFocus === 'logos');
  const showAccessories = hub.id === 'accessories' || (showAll && innerFocus === 'accessories');

  return (
    <section className="space-y-4 animate-fadeIn" data-testid="asset-library-page">
      <div className="space-y-2 px-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider">
          <Images className="w-3.5 h-3.5" /> Asset Library
        </div>
        <p className="text-sm font-medium text-[#3F3832] w-full">
          Use Show All for Hats, Logos, Accessories, and Gear together, or open one tab at a time.
        </p>
      </div>

      <div className="flex flex-wrap gap-0 border-b-2 border-[#E8DFD2]" role="tablist" aria-label="Asset Library">
        {ASSET_LIBRARY_HUB_SECTIONS.map((section) => {
          const active = section.id === hubId;
          return (
            <button
              type="button"
              key={section.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveHub(section.id)}
              className={studioTabClass(active)}
              data-testid={`asset-library-tab-${section.id}`}
            >
              {section.label}
              {section.phase ? <span className={studioTabMetaClass(active)}>{section.phase}</span> : null}
            </button>
          );
        })}
      </div>

      <section
        className="rounded-[1.75rem] border border-[#E8DFD2] bg-[#FFFCF7] p-4 space-y-4"
        data-testid={`asset-library-hub-${hub.id}`}
      >
        <p className="text-sm font-medium text-[#3F3832] w-full">{hub.summary}</p>
        {showAll ? (
          <div
            className="flex flex-wrap gap-0 border-b-2 border-[#E8DFD2]"
            role="tablist"
            aria-label="Gear and Logos"
            data-testid="asset-library-show-all-tabs"
          >
            {ASSET_LIBRARY_SHOW_ALL_FOCUS_IDS.map((id) => (
              <button
                type="button"
                key={id}
                role="tab"
                aria-selected={innerFocus === id}
                onClick={() => setShowAllFocus(id)}
                className={studioTabClass(innerFocus === id)}
                data-testid={`asset-library-show-all-tab-${id}`}
              >
                {SHOW_ALL_TAB_LABELS[id]}
              </button>
            ))}
          </div>
        ) : null}
        {showGear ? (
          <div data-testid="asset-library-show-gear">
            <GearSelectionsPage
              actorName={actorName}
              actorEmail={actorEmail}
              embedded
              allowSelect={false}
              allowCompare
              canConfigure={canConfigure}
              canDelete={canConfigure}
              canRename={canConfigure}
            />
          </div>
        ) : null}
        {showLogos ? (
          <div data-testid="asset-library-show-logos">
            <LogoConceptsPage
              actorName={actorName}
              actorEmail={actorEmail}
              embedded
              allowSelect={false}
              canConfigure={canConfigure}
            />
          </div>
        ) : null}
        {showAccessories ? (
          <div data-testid="asset-library-accessories">
            <AccessoriesPage embedded />
          </div>
        ) : null}
      </section>
    </section>
  );
};
