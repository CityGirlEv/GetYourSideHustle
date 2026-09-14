import { useEffect, useMemo, useRef, useState } from "react";
import { saveGuideCatalogContent } from "../lib/guide-catalog-client";
import {
  formatGuideAssigneeIds,
  guideAssigneeClickSelection,
  guideAssigneeRoster,
  guideLibraryAssigneeSelection,
  parseGuideAssigneeIds,
} from "../lib/guide-assignee";
import type { GuideCatalogState } from "../lib/guide-catalog-state";
import { fetchTestStatuses } from "../lib/gysh-test-plan";
import { guideReviewCaseIdsForGuide } from "../lib/guide-review-link";
import { testOwnerLabel, type QaTester } from "../lib/gysh-roles";

/**
 * Admin Guide Library — single assignee for this Side Hustle.
 * Chips: Unassigned + the QA roster (catalog partners and anyone already assigned).
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
    guideLibraryAssigneeSelection(patchAssignee),
  );
  const [linkedTestAssignee, setLinkedTestAssignee] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  /** Bump to ignore in-flight linked-test hydration after the user picks someone. */
  const hydrateEpochRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    if (busyRef.current) return;
    const epoch = ++hydrateEpochRef.current;
    const fromPatch = guideLibraryAssigneeSelection(patchAssignee);
    setSelected(fromPatch);
    if (fromPatch.length) {
      setLinkedTestAssignee("");
      return;
    }
    const caseIds = guideReviewCaseIdsForGuide(guideId);
    if (!caseIds.length) {
      setLinkedTestAssignee("");
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
        setLinkedTestAssignee(linked[0] ?? "");
      } catch {
        if (epoch === hydrateEpochRef.current) setLinkedTestAssignee("");
      }
    })();
  }, [guideId, patchAssignee]);

  const roster = useMemo(() => {
    if (testers?.length) return [...testers];
    return guideAssigneeRoster({
      guidePatchAssignees,
      extraIds: selected,
    });
  }, [testers, guidePatchAssignees, selected]);

  const save = async (nextIds: string[]) => {
    const next = formatGuideAssigneeIds(nextIds.slice(0, 1));
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const state = await saveGuideCatalogContent(guideId, {
        assignee: next,
      });
      const persisted = parseGuideAssigneeIds(state.patch?.assignee).slice(0, 1);
      setSelected(next ? (persisted.length ? persisted : [next]) : []);
      onSaved({
        ...state,
        patch: { ...(state.patch ?? {}), assignee: next },
      });
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save assignee.");
      setSelected(guideLibraryAssigneeSelection(patchAssignee));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  /** One assignee only — clicking a QA replaces whoever was selected. */
  const selectOne = (id: string) => {
    if (busy) return;
    const next = guideAssigneeClickSelection(patchAssignee, selected, id);
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
        {linkedTestAssignee &&
        !parseGuideAssigneeIds(patchAssignee).length &&
        !busy &&
        !savedFlash ? (
          <span className="guide-assignee-field__hint">
            Linked test is {testOwnerLabel(linkedTestAssignee, roster)} — click a name to
            save it on this guide.
          </span>
        ) : null}
      </div>
      <p className="guide-assignee-field__lede">
        Pick one assignee — it syncs the linked GUIDE-REV test.
      </p>
      {error ? (
        <p className="guide-assignee-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
