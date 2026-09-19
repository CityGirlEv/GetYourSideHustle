import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { confirmDelete } from '../lib/confirmDelete';
import {
  BETA_GUIDE_ITEM_KINDS,
  BETA_GUIDE_KIND_LABELS,
  BETA_GUIDE_PERK_LABELS,
  BETA_GUIDE_PERKS,
  BETA_TESTING_GUIDE_INTRO,
  BETA_TESTING_GUIDE_PATH,
  BETA_TESTING_GUIDE_TITLE,
  addBetaGuideItem,
  applyBetaGuideItemPatch,
  createBetaGuideItem,
  removeBetaGuideItem,
  type BetaGuideItem,
  type BetaGuideItemKind,
  type BetaGuideItemPatch,
  type BetaGuidePerk,
} from '../lib/betaTestingGuide';
import {
  buildBetaTestingGuideStorePayload,
  fetchBetaTestingGuideStore,
  loadBetaTestingGuideFromStorage,
  saveBetaTestingGuideStore,
  saveBetaTestingGuideToStorage,
} from '../lib/betaTestingGuideStore';

export const BetaTestingGuideAdminPage: React.FC<{
  actorName?: string | null;
  actorEmail?: string | null;
}> = ({ actorName = 'House', actorEmail = null }) => {
  const [items, setItems] = useState<BetaGuideItem[]>(() => loadBetaTestingGuideFromStorage());
  const [saveHint, setSaveHint] = useState('Edits save on this device and to the shared guide testers see.');
  const [draftKind, setDraftKind] = useState<BetaGuideItemKind>('idea');
  const saveTimer = useRef<number | null>(null);
  const skipRemoteApply = useRef(false);

  const persist = useCallback(
    (next: BetaGuideItem[]) => {
      const payload = buildBetaTestingGuideStorePayload(next, actorEmail ?? actorName ?? null);
      saveBetaTestingGuideToStorage(payload);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void saveBetaTestingGuideStore(payload).then((result) => {
          if (result.ok && !result.skipped) {
            setSaveHint('Saved to the shared Beta Testing Guide.');
            return;
          }
          if (result.skipped) {
            setSaveHint('Saved on this device. Shared database is not connected yet.');
            return;
          }
          setSaveHint(result.error || 'Could not save to the shared guide.');
        });
      }, 500);
    },
    [actorEmail, actorName],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchBetaTestingGuideStore().then((remote) => {
      if (cancelled || skipRemoteApply.current || !remote) return;
      setItems(remote.items);
      saveBetaTestingGuideToStorage(remote);
    });
    return () => {
      cancelled = true;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  const updateItems = (next: BetaGuideItem[]) => {
    skipRemoteApply.current = true;
    setItems(next);
    persist(next);
  };

  const patchItem = (id: string, patch: BetaGuideItemPatch) => {
    updateItems(items.map((item) => (item.id === id ? applyBetaGuideItemPatch(item, patch) : item)));
  };

  return (
    <div className="space-y-4 animate-fadeIn" data-testid="beta-testing-guide-admin">
      <section className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" /> Living guide
        </div>
        <h2 className="text-2xl font-black text-[#1F1917] uppercase tracking-tight font-serif">
          {BETA_TESTING_GUIDE_TITLE}
        </h2>
        <p className="text-sm text-[#3F3832] font-medium leading-relaxed max-w-3xl">{BETA_TESTING_GUIDE_INTRO}</p>
        <p className="text-xs text-[#3F3832] font-medium" data-testid="beta-guide-admin-save-hint">
          {saveHint}
        </p>
        <a
          href={BETA_TESTING_GUIDE_PATH}
          className="min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] bg-white text-[#1F1917] text-xs font-black uppercase tracking-wide inline-flex items-center gap-2"
          data-testid="beta-guide-admin-preview"
        >
          <ExternalLink className="w-4 h-4" /> Open the tester page
        </a>
      </section>

      <section className="bg-[#FFEDD5] border-2 border-[#1F1917] rounded-3xl p-5 space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-[#1F1917]">Add an item</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <label className="flex flex-col gap-1 text-[10px] font-mono font-bold uppercase tracking-wide text-[#6B5344]">
            Type
            <select
              value={draftKind}
              onChange={(event) => setDraftKind(event.target.value as BetaGuideItemKind)}
              className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-sm font-semibold text-[#1F1917]"
              aria-label="New guide item type"
            >
              {BETA_GUIDE_ITEM_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {BETA_GUIDE_KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => updateItems(addBetaGuideItem(items, createBetaGuideItem(actorName || 'House', Date.now(), draftKind)))}
            className="min-h-[44px] px-4 rounded-xl bg-[#EA580C] text-white text-xs font-black uppercase tracking-wide inline-flex items-center gap-2"
            data-testid="beta-guide-add-item"
          >
            <Plus className="w-4 h-4" /> Add item
          </button>
        </div>
      </section>

      <ul className="space-y-3" data-testid="beta-guide-admin-list">
        {items.map((item) => (
          <li
            key={item.id}
            className="bg-white border-2 border-[#1F1917] rounded-3xl p-4 sm:p-5 space-y-3"
            data-testid={`beta-guide-admin-row-${item.id}`}
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_11rem_auto] sm:items-start">
              <label className="flex flex-col gap-1 text-[10px] font-mono font-bold uppercase tracking-wide text-[#6B5344]">
                Title
                <input
                  value={item.title}
                  onChange={(event) => patchItem(item.id, { title: event.target.value })}
                  className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917]/20 bg-white text-sm font-semibold text-[#1F1917]"
                  aria-label={`${item.title} title`}
                />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-mono font-bold uppercase tracking-wide text-[#6B5344]">
                Type
                <select
                  value={item.kind}
                  onChange={(event) =>
                    patchItem(item.id, { kind: event.target.value as BetaGuideItemKind })
                  }
                  className="min-h-[44px] px-2 rounded-xl border-2 border-[#1F1917]/20 bg-white text-sm font-semibold text-[#1F1917]"
                  aria-label={`${item.title} type`}
                >
                  {BETA_GUIDE_ITEM_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {BETA_GUIDE_KIND_LABELS[kind]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-mono font-bold uppercase tracking-wide text-[#6B5344]">
                Gear blessing
                <select
                  value={item.perk}
                  disabled={item.kind !== 'blessing'}
                  onChange={(event) => patchItem(item.id, { perk: event.target.value as BetaGuidePerk })}
                  className="min-h-[44px] px-2 rounded-xl border-2 border-[#1F1917]/20 bg-white text-sm font-semibold text-[#1F1917] disabled:opacity-50"
                  aria-label={`${item.title} gear blessing`}
                >
                  {BETA_GUIDE_PERKS.map((perk) => (
                    <option key={perk} value={perk}>
                      {BETA_GUIDE_PERK_LABELS[perk]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                aria-label={`Delete ${item.title}`}
                onClick={() => {
                  if (!confirmDelete()) return;
                  updateItems(removeBetaGuideItem(items, item.id));
                }}
                className="min-h-[44px] min-w-[44px] self-end rounded-xl border-2 border-[#1F1917] bg-white text-[#9A3412] inline-flex items-center justify-center"
                data-testid={`beta-guide-delete-${item.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <label className="flex flex-col gap-1 text-[10px] font-mono font-bold uppercase tracking-wide text-[#6B5344]">
              Details
              <textarea
                value={item.body}
                onChange={(event) => patchItem(item.id, { body: event.target.value })}
                rows={3}
                className="min-h-[88px] px-3 py-2 rounded-xl border-2 border-[#1F1917]/20 bg-white text-sm font-medium text-[#1F1917] leading-relaxed"
                aria-label={`${item.title} details`}
              />
            </label>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C2410C]">Added by {item.addedBy}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
