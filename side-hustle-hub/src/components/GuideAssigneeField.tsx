import { useEffect, useMemo, useRef, useState } from "react";
import { saveGuideCatalogContent } from "../lib/guide-catalog-client";
import {
  DEFAULT_GUIDE_ASSIGNEE,
  effectiveGuideAssignees,
  formatGuideAssigneeIds,
  guideAssigneeFilterRoster,
  nextSingleGuideAssignee,
  parseGuideAssigneeIds,
} from "../lib/guide-assignee";
import type { GuideCatalogState } from "../lib/guide-catalog-state";
import { fetchTestStatuses } from "../lib/gysh-test-plan";
import { guideReviewCaseIdsForGuide } from "../lib/guide-review-link";
import { testOwnerLabel, type QaTester } from "../lib/gysh-roles";

/**
 * Admin Guide Library — single assignee for this Side Hustle.
 * Chips: Unassigned + only QAs who already have ≥1 guide assigned
 * (plus this guide’s current assignee so they stay visible).
 * Clicking a QA replaces the current assignee (one person only).
 */
export function GuideAssigneeField({
  guideId,
  patchAssignee,
  guidePatchAssignees,
  testers,
  onSaved,
}: {
  guideId: string;
  /** Current catalog patch.assignee (single id; legacy multi `id1+id2` uses the first). */
  patchAssignee?: string | null;
  /** Other guides’ patch.assignee values — grows the bubble roster. */
  guidePatchAssignees?: Iterable<unknown> | null;
  /** Optional fixed roster (tests). */
  testers?: readonly QaTester[];
  onSaved: (state: GuideCatalogState) => void;
}) {
  const [selected, setSelected] = useState<string[]>(() =>
    effectiveGuideAssignees(patchAssignee, DEFAULT_GUIDE_ASSIGNEE).slice(0, 1),
  );
  const [hydratedFromTest, setHydratedFromTest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  /** Bump to ignore in-flight linked-test hydration after the user picks someone. */
  const hydrateEpochRef = useRef(0);

  useEffect(() => {
    const epoch = ++hydrateEpochRef.current;
    const fromPatch = parseGuideAssigneeIds(patchAssignee).slice(0, 1);
    if (fromPatch.length) {
      setSelected(fromPatch);
      setHydratedFromTest(false);
      return;
    }
    setHydratedFromTest(false);
    const caseIds = guideReviewCaseIdsForGuide(guideId);
    if (!caseIds.length) {
      setSelected([DEFAULT_GUIDE_ASSIGNEE]);
      return;
    }
    void (async () => {
      try {
        const payload = await fetchTestStatuses();
        if (epoch !== hydrateEpochRef.current) return;
        let linked: string[] = [];
        for (const caseId of caseIds) {
          linked = parseGuideAssigneeIds(payload.assignees?.[caseId]).slice(0, 1);
          if (linked.length) break;
        }
        setSelected(linked.length ? linked : [DEFAULT_GUIDE_ASSIGNEE]);
        setHydratedFromTest(linked.length > 0);
      } catch {
        if (epoch === hydrateEpochRef.current) setSelected([DEFAULT_GUIDE_ASSIGNEE]);
      }
    })();
  }, [guideId, patchAssignee]);

  const roster = useMemo(() => {
    if (testers?.length) return [...testers];
    return guideAssigneeFilterRoster({
      guidePatchAssignees,
      extraIds: selected,
    });
  }, [testers, guidePatchAssignees, selected]);

  const save = async (nextIds: string[]) => {
    const next = formatGuideAssigneeIds(nextIds.slice(0, 1));
    setBusy(true);
    setError(null);
    try {
      const state = await saveGuideCatalogContent(guideId, {
        assignee: next,
      });
      setSelected(parseGuideAssigneeIds(state.patch?.assignee).slice(0, 1));
      onSaved(state);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save assignee.");
    } finally {
      setBusy(false);
    }
  };

  /** One assignee only — clicking a QA replaces whoever was selected. */
  const selectOne = (id: string) => {
    if (busy) return;
    const next = nextSingleGuideAssignee(selected, id);
    if (!next) return;
    hydrateEpochRef.current += 1;
    setSelected(next);
    void save(next);
  };

  const clear = () => {
    if (busy) return;
    hydrateEpochRef.current += 1;
    setSelected([]);
    void save([]);
  };

  const selectedKey = selected[0] ?? "";

  return (
    <div
      className="guide-assignee-field"
      data-testid={`guide-assignee-field-${guideId}`}
    >
      <span className="guide-assignee-field__label" id={`guide-assignee-label-${guideId}`}>
        Assignee
      </span>
      <div
        className="guide-assignee-field__bubbles"
        role="radiogroup"
        aria-labelledby={`guide-assignee-label-${guideId}`}
        data-testid={`guide-assignee-bubbles-${guideId}`}
        data-selected={selectedKey}
      >
        <button
          type="button"
          className="qa-tester-bubble qa-filter-chip"
          role="radio"
          data-active={selected.length === 0 ? "true" : "false"}
          data-testid={`guide-assignee-unassigned-${guideId}`}
          disabled={busy}
          aria-checked={selected.length === 0}
          onClick={clear}
        >
          <input
            type="radio"
            className="qa-filter-chip__check"
            checked={selected.length === 0}
            readOnly
            tabIndex={-1}
            aria-hidden
          />
          Unassigned
        </button>
        {roster.map((t) => {
          const on = selected[0] === t.id;
          return (
            <button
              type="button"
              key={t.id}
              className="qa-tester-bubble qa-filter-chip"
              role="radio"
              data-active={on ? "true" : "false"}
              data-testid={`guide-assignee-bubble-${guideId}-${t.id}`}
              disabled={busy}
              aria-checked={on}
              title={t.name}
              style={
                on
                  ? { borderColor: t.accent, boxShadow: `0 0 0 1px ${t.accent}` }
                  : undefined
              }
              onClick={() => selectOne(t.id)}
            >
              <input
                type="radio"
                className="qa-filter-chip__check"
                checked={on}
                readOnly
                tabIndex={-1}
                aria-hidden
              />
              <span
                className="qa-tester-dot"
                style={{ background: t.accent }}
                aria-hidden
              />
              {testOwnerLabel(t.id, roster)}
            </button>
          );
        })}
      </div>
      <div className="guide-assignee-field__row">
        {busy ? (
          <span className="guide-assignee-field__hint" aria-live="polite">
            Saving…
          </span>
        ) : null}
        {savedFlash && !busy ? (
          <span className="guide-assignee-field__hint is-saved" aria-live="polite">
            Saved — linked test updated
          </span>
        ) : null}
        {hydratedFromTest && !parseGuideAssigneeIds(patchAssignee).length && !busy && !savedFlash ? (
          <span className="guide-assignee-field__hint">From linked test</span>
        ) : null}
      </div>
      <p className="guide-assignee-field__lede">
        Only Unassigned and QAs who already have guides appear here. Pick one assignee — it syncs the
        linked GUIDE-REV test.
      </p>
      {error ? (
        <p className="guide-assignee-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
