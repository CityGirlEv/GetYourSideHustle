import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { saveGuideCatalogContent } from "../lib/guide-catalog-client";
import type { GuideCatalogPatch, GuideCatalogState } from "../lib/guide-catalog-state";
import { guideAdminKitContentKey } from "../lib/guide-admin-content-key";
import {
  moveGuideKitItem,
  newGuideKitItemId,
} from "../lib/guide-kit-overrides";
import type {
  GuideAuthoredStep,
  GuideKit,
  GuidePrerequisite,
  GuideToolCost,
} from "../lib/guide-tools";
import type { GuideSuggestedPricing } from "../lib/guide-suggested-pricing";
import type { GuideSupplyList } from "../lib/guide-supplies";

function cloneSteps(steps: GuideAuthoredStep[]): GuideAuthoredStep[] {
  return steps.map((s) => ({ title: s.title, desc: s.desc }));
}

function clonePrereqs(list: GuidePrerequisite[]): GuidePrerequisite[] {
  return list.map((p) => ({ ...p }));
}

function cloneTools(list: GuideToolCost[]): GuideToolCost[] {
  return list.map((t) => ({ ...t }));
}

function cloneSupplies(list: GuideSupplyList | undefined): GuideSupplyList {
  return {
    starterKitTotal: list?.starterKitTotal ?? "",
    items: (list?.items ?? []).map((i) => ({ ...i })),
  };
}

function clonePricing(list: GuideSuggestedPricing | undefined): GuideSuggestedPricing {
  return {
    raiseTip: list?.raiseTip ?? "",
    ...(list?.intro ? { intro: list.intro } : {}),
    ...(list?.tabLabel ? { tabLabel: list.tabLabel } : {}),
    items: (list?.items ?? []).map((i) => ({ ...i })),
  };
}

type Draft = {
  name: string;
  steps: GuideAuthoredStep[];
  prerequisites: GuidePrerequisite[];
  tools: GuideToolCost[];
  supplies: GuideSupplyList;
  suggestedPricing: GuideSuggestedPricing;
};

export type GuideAdminFocusSection =
  | "all"
  | "steps"
  | "prereqs"
  | "tools"
  | "pricing"
  | "supplies"
  | "name";

/**
 * Admin / QA Side Hustle Library — inline editor for name, steps, tools, prerequisites,
 * Supply List, and Suggested Pricing. Saves into guide_catalog_state.patch_json.
 */
export function GuideAdminContentEditor({
  guideId,
  name,
  kit,
  onSaved,
  onStepsLocalChange,
  focusSection = "all",
}: {
  guideId: string;
  name: string;
  kit: GuideKit;
  onSaved: (state: GuideCatalogState) => void;
  /** Optimistic steps update so tab counts / roadmap refresh before the API returns. */
  onStepsLocalChange?: (steps: GuideAuthoredStep[]) => void;
  /** Which editor blocks to show (driven by prep tabs). */
  focusSection?: GuideAdminFocusSection;
}) {
  const contentKey = guideAdminKitContentKey(guideId, name, kit);
  const baseline = useMemo((): Draft => {
    return {
      name: name.trim(),
      steps: cloneSteps(kit.steps ?? []),
      prerequisites: clonePrereqs(kit.prerequisites ?? []),
      tools: cloneTools(kit.tools ?? []),
      supplies: cloneSupplies(kit.supplies),
      suggestedPricing: clonePricing(kit.suggestedPricing),
    };
    // contentKey fingerprints guideId + name + kit body; ignore kit object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see contentKey
  }, [contentKey]);

  const [draft, setDraft] = useState<Draft>(baseline);
  const [busy, setBusy] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [itemSavedFlash, setItemSavedFlash] = useState<string | null>(null);
  const [dragStep, setDragStep] = useState<number | null>(null);
  /** Keeps trash deletes visible if a parent kit refresh arrives with the old step list. */
  const pendingStepsRef = useRef<GuideAuthoredStep[] | null>(null);

  useEffect(() => {
    const pending = pendingStepsRef.current;
    if (pending) {
      const baselineSteps = baseline.steps.map((s) => ({ title: s.title, desc: s.desc }));
      if (JSON.stringify(baselineSteps) === JSON.stringify(pending)) {
        pendingStepsRef.current = null;
        setDraft(baseline);
      } else {
        setDraft({ ...baseline, steps: pending.map((s) => ({ title: s.title, desc: s.desc })) });
      }
    } else {
      setDraft(baseline);
    }
    setError(null);
    setSavedFlash(false);
    setItemSavedFlash(null);
  }, [baseline]);

  const dirty =
    draft.name.trim() !== baseline.name.trim() ||
    JSON.stringify(draft.steps) !== JSON.stringify(baseline.steps) ||
    JSON.stringify(draft.prerequisites) !== JSON.stringify(baseline.prerequisites) ||
    JSON.stringify(draft.tools) !== JSON.stringify(baseline.tools) ||
    JSON.stringify(draft.supplies) !== JSON.stringify(baseline.supplies) ||
    JSON.stringify(draft.suggestedPricing) !== JSON.stringify(baseline.suggestedPricing);

  const buildPatch = (from: Draft): GuideCatalogPatch | null => {
    const trimmedName = from.name.trim();
    if (!trimmedName) return null;
    return {
      name: trimmedName,
      steps: from.steps.map((s) => ({
        title: s.title.trim() || "Untitled step",
        desc: s.desc.trim(),
      })),
      prerequisites: from.prerequisites.map((p, i) => ({
        id: p.id || newGuideKitItemId("prereq"),
        label: p.label.trim() || `Prerequisite ${i + 1}`,
        detail: p.detail.trim(),
      })),
      tools: from.tools.map((t, i) => ({
        id: t.id || newGuideKitItemId("tool"),
        name: t.name.trim() || `Tool ${i + 1}`,
        freePlanAvailable: t.freePlanAvailable === true,
        costNote: t.costNote?.trim() || "",
        ...(t.url?.trim() ? { url: t.url.trim() } : {}),
        ...(t.alternatives?.trim() ? { alternatives: t.alternatives.trim() } : {}),
        ...(t.optional ? { optional: true } : {}),
        ...(t.planLabelApplicable === false ? { planLabelApplicable: false } : {}),
      })),
      supplies: {
        starterKitTotal: from.supplies.starterKitTotal.trim(),
        items: from.supplies.items.map((item, i) => ({
          id: item.id || newGuideKitItemId("supply"),
          name: item.name.trim() || `Supply ${i + 1}`,
          qty: item.qty.trim() || "1",
          estCost: item.estCost.trim() || "",
          ...(item.notes?.trim() ? { notes: item.notes.trim() } : {}),
          ...(item.optional ? { optional: true } : {}),
        })),
      },
      suggestedPricing: {
        items: from.suggestedPricing.items.map((item, i) => ({
          id: item.id || newGuideKitItemId("price"),
          label: item.label.trim() || `Price ${i + 1}`,
          price: item.price.trim() || "",
          ...(item.notes?.trim() ? { notes: item.notes.trim() } : {}),
        })),
        ...(from.suggestedPricing.raiseTip?.trim()
          ? { raiseTip: from.suggestedPricing.raiseTip.trim() }
          : {}),
        ...(from.suggestedPricing.intro?.trim()
          ? { intro: from.suggestedPricing.intro.trim() }
          : {}),
        ...(from.suggestedPricing.tabLabel?.trim()
          ? { tabLabel: from.suggestedPricing.tabLabel.trim() }
          : {}),
      },
    };
  };

  const persistFrom = async (from: Draft, flashKey?: string) => {
    const patch = buildPatch(from);
    if (!patch) {
      setError("Side Hustle name is required.");
      return false;
    }
    setError(null);
    const state = await saveGuideCatalogContent(guideId, patch);
    onSaved(state);
    if (flashKey) {
      setItemSavedFlash(flashKey);
      window.setTimeout(() => setItemSavedFlash((cur) => (cur === flashKey ? null : cur)), 2200);
    } else {
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2200);
    }
    return true;
  };

  const save = async () => {
    if (busy || savingKey != null || !dirty) return;
    setBusy(true);
    try {
      await persistFrom(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save guide content.");
    } finally {
      setBusy(false);
    }
  };

  const saveItem = async (key: string) => {
    if (busy || savingKey != null) return;
    setSavingKey(key);
    try {
      await persistFrom(draft, key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this item.");
    } finally {
      setSavingKey(null);
    }
  };

  const deleteStep = (idx: number) => {
    const steps = draft.steps.filter((_, i) => i !== idx).map((s) => ({ title: s.title, desc: s.desc }));
    const next: Draft = { ...draft, steps };
    pendingStepsRef.current = steps;
    setDraft(next);
    onStepsLocalChange?.(steps);
    if (busy || savingKey != null) {
      // Still remove locally; user can hit Save & Update if an earlier save is in flight.
      return;
    }
    setSavingKey(`step-delete-${idx}`);
    void (async () => {
      try {
        await persistFrom(next, "step-delete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete step.");
        // Keep the step removed in the editor; user can retry Save & Update.
      } finally {
        setSavingKey(null);
      }
    })();
  };

  const persistImmediate = (next: Draft, flash: string, idx: number) => {
    if (busy || savingKey != null) return;
    setDraft(next);
    setSavingKey(`${flash}-${idx}`);
    void (async () => {
      try {
        await persistFrom(next, flash);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete item.");
        setDraft(baseline);
      } finally {
        setSavingKey(null);
      }
    })();
  };

  const deleteBullet = (
    kind: "prerequisites" | "tools",
    idx: number,
    nextItems: GuidePrerequisite[] | GuideToolCost[],
  ) => {
    const next: Draft =
      kind === "prerequisites"
        ? { ...draft, prerequisites: nextItems as GuidePrerequisite[] }
        : { ...draft, tools: nextItems as GuideToolCost[] };
    persistImmediate(next, `${kind === "tools" ? "tool" : "prereq"}-delete`, idx);
  };

  const saveLocked = busy || savingKey != null;
  const showName =
    focusSection === "all" ||
    focusSection === "name" ||
    focusSection === "steps" ||
    focusSection === "prereqs" ||
    focusSection === "tools";
  const showSteps = focusSection === "all" || focusSection === "steps";
  const showPrereqs = focusSection === "all" || focusSection === "prereqs";
  const showTools = focusSection === "all" || focusSection === "tools";
  const showPricing = focusSection === "all" || focusSection === "pricing";
  const showSupplies = focusSection === "all" || focusSection === "supplies";

  const moveStep = (index: number, dir: -1 | 1) => {
    setDraft((d) => ({ ...d, steps: moveGuideKitItem(d.steps, index, dir) }));
  };

  const onStepDrop = (toIndex: number) => {
    if (dragStep == null || dragStep === toIndex) {
      setDragStep(null);
      return;
    }
    setDraft((d) => {
      const next = d.steps.slice();
      const [row] = next.splice(dragStep, 1);
      if (!row) return d;
      next.splice(toIndex, 0, row);
      return { ...d, steps: next };
    });
    setDragStep(null);
  };

  const addStep = () => {
    setDraft((d) => ({
      ...d,
      steps: [...d.steps, { title: `Step ${d.steps.length + 1}`, desc: "" }],
    }));
  };

  return (
    <section
      className="guide-admin-content-editor"
      data-testid={`guide-admin-content-editor-${guideId}`}
    >
      <div className="guide-admin-content-editor__bar">
        <div>
          <h3 className="guide-admin-content-editor__heading">
            {focusSection === "prereqs"
              ? "Edit Prerequisites"
              : focusSection === "tools"
                ? "Edit Tools"
                : focusSection === "steps"
                  ? "Edit Steps"
                  : focusSection === "supplies"
                    ? "Edit Supply List"
                    : focusSection === "pricing"
                      ? "Edit Suggested Pricing"
                      : "Edit Guide Content"}
          </h3>
          <p className="guide-admin-content-editor__lede">
            {focusSection === "prereqs"
              ? "Edit prerequisites below — each item has its own Save."
              : focusSection === "tools"
                ? "Edit tools below — each item has its own Save."
                : focusSection === "steps"
                  ? "Edit steps below — trash deletes and saves immediately; each step also has Save. Use ↑↓ or drag to reorder."
                  : focusSection === "supplies"
                    ? "Edit Supply List items — add, reorder, delete, and Save."
                    : focusSection === "pricing"
                      ? "Edit Suggested Pricing rows — add, reorder, delete, and Save."
                      : "Inline edit the Side Hustle name, steps, tools, prerequisites, Supply List, and Suggested Pricing. Save each item or use Save & Update for everything."}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={saveLocked || !dirty}
          data-testid="guide-admin-content-save"
          onClick={() => void save()}
        >
          <Save size={16} aria-hidden />
          {busy ? "Saving…" : savedFlash ? "Saved" : "Save & Update"}
        </button>
      </div>

      {error ? (
        <p className="guide-admin-content-editor__error" role="alert">
          {error}
        </p>
      ) : null}

      {showName ? (
        <label className="guide-admin-content-editor__field">
          <span>Side Hustle name</span>
          <input
            type="text"
            className="text-input"
            value={draft.name}
            maxLength={200}
            data-testid="guide-admin-name-input"
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </label>
      ) : null}

      {showSteps ? (
      <div className="guide-admin-content-editor__block" data-testid="guide-admin-steps-editor">
        <div className="guide-admin-content-editor__block-head">
          <h4>Steps</h4>
          <button
            type="button"
            className="btn btn-outline"
            data-testid="guide-admin-add-step"
            onClick={addStep}
          >
            <Plus size={16} aria-hidden /> Add step
          </button>
        </div>
        {draft.steps.length === 0 ? (
          <p className="guide-admin-content-editor__empty">No steps yet — add the first one.</p>
        ) : (
          <ul className="guide-admin-content-editor__steps">
            {draft.steps.map((step, idx) => (
              <li
                key={`guide-admin-step-${idx}`}
                className={`guide-admin-step${dragStep === idx ? " is-dragging" : ""}`}
                onDragOver={(e: DragEvent) => e.preventDefault()}
                onDrop={() => onStepDrop(idx)}
                data-testid={`guide-admin-step-${idx}`}
              >
                <div className="guide-admin-step__toolbar">
                  <span
                    className="guide-admin-step__grip"
                    title="Drag to reorder"
                    aria-hidden
                    draggable
                    onDragStart={() => setDragStep(idx)}
                    onDragEnd={() => setDragStep(null)}
                  >
                    <GripVertical size={16} />
                  </span>
                  <span className="guide-admin-step__num">{idx + 1}.</span>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Move step ${idx + 1} up`}
                    disabled={idx === 0}
                    data-testid={`guide-admin-step-up-${idx}`}
                    onClick={() => moveStep(idx, -1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Move step ${idx + 1} down`}
                    disabled={idx === draft.steps.length - 1}
                    data-testid={`guide-admin-step-down-${idx}`}
                    onClick={() => moveStep(idx, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Delete step ${idx + 1}`}
                    data-testid={`guide-admin-step-delete-${idx}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteStep(idx);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  className="text-input guide-admin-step__title"
                  value={step.title}
                  placeholder="Step title"
                  aria-label={`Step ${idx + 1} title`}
                  data-testid={`guide-admin-step-title-${idx}`}
                  onChange={(e) =>
                    setDraft((d) => {
                      const steps = d.steps.slice();
                      steps[idx] = { ...steps[idx]!, title: e.target.value };
                      return { ...d, steps };
                    })
                  }
                  onKeyDown={(e) => {
                    // Title is a single-line input — Enter must not blur/jump the page.
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    e.stopPropagation();
                    const area = e.currentTarget
                      .closest("li")
                      ?.querySelector<HTMLTextAreaElement>("textarea.guide-admin-richtext--step");
                    area?.focus();
                  }}
                />
                <textarea
                  className="text-input guide-admin-richtext guide-admin-richtext--step"
                  value={step.desc}
                  rows={6}
                  placeholder="Step details — write like a short Word paragraph"
                  aria-label={`Step ${idx + 1} details`}
                  data-testid={`guide-admin-step-desc-${idx}`}
                  onChange={(e) =>
                    setDraft((d) => {
                      const steps = d.steps.slice();
                      steps[idx] = { ...steps[idx]!, desc: e.target.value };
                      return { ...d, steps };
                    })
                  }
                  onKeyDown={(e) => {
                    // Keep Enter as a newline; don't let parent shortcuts steal focus.
                    if (e.key === "Enter") e.stopPropagation();
                  }}
                />
                <div className="guide-admin-step__save-row">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={saveLocked}
                    data-testid={`guide-admin-step-save-${idx}`}
                    onClick={() => void saveItem(`step-${idx}`)}
                  >
                    <Save size={16} aria-hidden />
                    {savingKey === `step-${idx}`
                      ? "Saving…"
                      : itemSavedFlash === `step-${idx}`
                        ? "Step saved"
                        : `Save step ${idx + 1}`}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="guide-admin-content-editor__block-foot">
          <button
            type="button"
            className="btn btn-outline"
            data-testid="guide-admin-add-step-bottom"
            onClick={addStep}
          >
            <Plus size={16} aria-hidden /> Add step
          </button>
        </div>
      </div>
      ) : null}

      {showPrereqs ? (
      <BulletListEditor
        title="Prerequisites"
        testId="guide-admin-prereqs"
        itemNoun="prerequisite"
        saveLocked={saveLocked}
        savingKey={savingKey}
        itemSavedFlash={itemSavedFlash}
        onSaveItem={(idx) => void saveItem(`prereq-${idx}`)}
        items={draft.prerequisites.map((p) => ({
          id: p.id,
          heading: p.label,
          body: p.detail,
        }))}
        addLabel="Add prerequisite"
        onChange={(items) =>
          setDraft((d) => ({
            ...d,
            prerequisites: items.map((item, i) => ({
              id: item.id || newGuideKitItemId("prereq"),
              label: item.heading || `Prerequisite ${i + 1}`,
              detail: item.body,
            })),
          }))
        }
        onDeleteItem={(idx, items) =>
          deleteBullet(
            "prerequisites",
            idx,
            items.map((item, i) => ({
              id: item.id || newGuideKitItemId("prereq"),
              label: item.heading || `Prerequisite ${i + 1}`,
              detail: item.body,
            })),
          )
        }
      />
      ) : null}

      {showTools ? (
      <BulletListEditor
        title="Tools"
        testId="guide-admin-tools"
        itemNoun="tool"
        toolMode
        saveLocked={saveLocked}
        savingKey={savingKey}
        itemSavedFlash={itemSavedFlash}
        onSaveItem={(idx) => void saveItem(`tool-${idx}`)}
        items={draft.tools.map((t) => ({
          id: t.id,
          heading: t.name,
          body: t.costNote || "",
          url: t.url,
          costNote: t.costNote,
          alternatives: t.alternatives,
          freePlanAvailable: t.freePlanAvailable,
        }))}
        addLabel="Add tool"
        onChange={(items) =>
          setDraft((d) => ({
            ...d,
            tools: items.map((item, i) => {
              const prev = d.tools.find((t) => t.id === item.id);
              return {
                id: item.id || newGuideKitItemId("tool"),
                name: item.heading || `Tool ${i + 1}`,
                freePlanAvailable: item.freePlanAvailable === true,
                costNote: item.costNote ?? item.body,
                ...(item.url?.trim() ? { url: item.url.trim() } : {}),
                ...(item.alternatives?.trim()
                  ? { alternatives: item.alternatives.trim() }
                  : prev?.alternatives
                    ? { alternatives: prev.alternatives }
                    : {}),
                ...(prev?.optional ? { optional: true } : {}),
                ...(prev?.planLabelApplicable === false ? { planLabelApplicable: false } : {}),
              };
            }),
          }))
        }
        onDeleteItem={(idx, items) =>
          deleteBullet(
            "tools",
            idx,
            items.map((item, i) => {
              const prev = draft.tools.find((t) => t.id === item.id);
              return {
                id: item.id || newGuideKitItemId("tool"),
                name: item.heading || `Tool ${i + 1}`,
                freePlanAvailable: item.freePlanAvailable === true,
                costNote: item.costNote ?? item.body,
                ...(item.url?.trim() ? { url: item.url.trim() } : {}),
                ...(item.alternatives?.trim()
                  ? { alternatives: item.alternatives.trim() }
                  : prev?.alternatives
                    ? { alternatives: prev.alternatives }
                    : {}),
                ...(prev?.optional ? { optional: true } : {}),
                ...(prev?.planLabelApplicable === false ? { planLabelApplicable: false } : {}),
              };
            }),
          )
        }
      />
      ) : null}

      {showPricing ? (
      <div className="guide-admin-content-editor__block" data-testid="guide-admin-pricing-editor">
        <div className="guide-admin-content-editor__block-head">
          <h4>Suggested Pricing</h4>
          <button
            type="button"
            className="btn btn-outline"
            data-testid="guide-admin-pricing-add"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                suggestedPricing: {
                  ...d.suggestedPricing,
                  items: [
                    ...d.suggestedPricing.items,
                    {
                      id: newGuideKitItemId("price"),
                      label: "",
                      price: "",
                    },
                  ],
                },
              }))
            }
          >
            <Plus size={16} aria-hidden /> Add price
          </button>
        </div>
        <label className="guide-admin-content-editor__field">
          <span>Tab label</span>
          <input
            type="text"
            className="text-input"
            value={draft.suggestedPricing.tabLabel ?? ""}
            placeholder="Suggested Pricing"
            maxLength={200}
            data-testid="guide-admin-pricing-tab-label"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                suggestedPricing: { ...d.suggestedPricing, tabLabel: e.target.value },
              }))
            }
          />
        </label>
        <label className="guide-admin-content-editor__field">
          <span>Intro</span>
          <textarea
            className="text-input guide-admin-richtext guide-admin-richtext--step"
            value={draft.suggestedPricing.intro ?? ""}
            rows={6}
            placeholder="Starter examples, formulas, and disclaimers shown above the price list"
            data-testid="guide-admin-pricing-intro"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                suggestedPricing: { ...d.suggestedPricing, intro: e.target.value },
              }))
            }
          />
        </label>
        <label className="guide-admin-content-editor__field">
          <span>Raise tip</span>
          <textarea
            className="text-input guide-admin-richtext"
            value={draft.suggestedPricing.raiseTip ?? ""}
            rows={3}
            placeholder="How to raise rates after a few happy customers"
            data-testid="guide-admin-pricing-raise-tip"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                suggestedPricing: { ...d.suggestedPricing, raiseTip: e.target.value },
              }))
            }
          />
        </label>
        <div className="guide-admin-step__save-row">
          <button
            type="button"
            className="btn btn-primary"
            disabled={saveLocked}
            data-testid="guide-admin-pricing-copy-save"
            onClick={() => void saveItem("pricing-copy")}
          >
            <Save size={16} aria-hidden />
            {savingKey === "pricing-copy"
              ? "Saving…"
              : itemSavedFlash === "pricing-copy"
                ? "Pricing copy saved"
                : "Save pricing copy"}
          </button>
        </div>
        {draft.suggestedPricing.items.length === 0 ? (
          <p className="guide-admin-content-editor__empty">No prices yet — add the first one.</p>
        ) : (
          <ul className="guide-admin-bullets">
            {draft.suggestedPricing.items.map((item, idx) => (
              <li key={item.id || `price-${idx}`} className="guide-admin-bullet">
                <span className="guide-admin-bullet__mark" aria-hidden>
                  $
                </span>
                <div className="guide-admin-bullet__body">
                  <div className="guide-admin-field-grid">
                    <label className="guide-admin-content-editor__field">
                      <span>Label</span>
                      <input
                        type="text"
                        className="text-input"
                        value={item.label}
                        placeholder="Package or job type"
                        aria-label={`Price ${idx + 1} label`}
                        data-testid={`guide-admin-pricing-label-${idx}`}
                        onChange={(e) =>
                          setDraft((d) => {
                            const items = d.suggestedPricing.items.slice();
                            items[idx] = { ...items[idx]!, label: e.target.value };
                            return {
                              ...d,
                              suggestedPricing: { ...d.suggestedPricing, items },
                            };
                          })
                        }
                      />
                    </label>
                    <label className="guide-admin-content-editor__field">
                      <span>Price</span>
                      <input
                        type="text"
                        className="text-input"
                        value={item.price}
                        placeholder="$25 – $40"
                        aria-label={`Price ${idx + 1} amount`}
                        data-testid={`guide-admin-pricing-price-${idx}`}
                        onChange={(e) =>
                          setDraft((d) => {
                            const items = d.suggestedPricing.items.slice();
                            items[idx] = { ...items[idx]!, price: e.target.value };
                            return {
                              ...d,
                              suggestedPricing: { ...d.suggestedPricing, items },
                            };
                          })
                        }
                      />
                    </label>
                  </div>
                  <textarea
                    className="text-input guide-admin-richtext"
                    value={item.notes ?? ""}
                    rows={3}
                    placeholder="Notes (optional)"
                    aria-label={`Price ${idx + 1} notes`}
                    data-testid={`guide-admin-pricing-notes-${idx}`}
                    onChange={(e) =>
                      setDraft((d) => {
                        const items = d.suggestedPricing.items.slice();
                        items[idx] = { ...items[idx]!, notes: e.target.value };
                        return {
                          ...d,
                          suggestedPricing: { ...d.suggestedPricing, items },
                        };
                      })
                    }
                  />
                  <div className="guide-admin-step__save-row">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={saveLocked}
                      data-testid={`guide-admin-pricing-save-${idx}`}
                      onClick={() => void saveItem(`price-${idx}`)}
                    >
                      <Save size={16} aria-hidden />
                      {savingKey === `price-${idx}`
                        ? "Saving…"
                        : itemSavedFlash === `price-${idx}`
                          ? "Price saved"
                          : `Save price ${idx + 1}`}
                    </button>
                  </div>
                </div>
                <div className="guide-admin-bullet__actions">
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Move price ${idx + 1} up`}
                    disabled={idx === 0}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        suggestedPricing: {
                          ...d.suggestedPricing,
                          items: moveGuideKitItem(d.suggestedPricing.items, idx, -1),
                        },
                      }))
                    }
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Move price ${idx + 1} down`}
                    disabled={idx === draft.suggestedPricing.items.length - 1}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        suggestedPricing: {
                          ...d.suggestedPricing,
                          items: moveGuideKitItem(d.suggestedPricing.items, idx, 1),
                        },
                      }))
                    }
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Delete price ${idx + 1}`}
                    disabled={saveLocked}
                    data-testid={`guide-admin-pricing-delete-${idx}`}
                    onClick={() =>
                      persistImmediate(
                        {
                          ...draft,
                          suggestedPricing: {
                            ...draft.suggestedPricing,
                            items: draft.suggestedPricing.items.filter((_, i) => i !== idx),
                          },
                        },
                        "price-delete",
                        idx,
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      ) : null}

      {showSupplies ? (
      <div className="guide-admin-content-editor__block" data-testid="guide-admin-supplies-editor">
        <div className="guide-admin-content-editor__block-head">
          <h4>Supply List</h4>
          <button
            type="button"
            className="btn btn-outline"
            data-testid="guide-admin-supplies-add"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                supplies: {
                  ...d.supplies,
                  items: [
                    ...d.supplies.items,
                    {
                      id: newGuideKitItemId("supply"),
                      name: "",
                      qty: "1",
                      estCost: "",
                    },
                  ],
                },
              }))
            }
          >
            <Plus size={16} aria-hidden /> Add supply
          </button>
        </div>
        <label className="guide-admin-content-editor__field">
          <span>Estimated cost to gather supplies before the first paid job</span>
          <input
            type="text"
            className="text-input"
            value={draft.supplies.starterKitTotal}
            placeholder="About $25–55 if you buy everything new"
            data-testid="guide-admin-supplies-starter-total"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                supplies: { ...d.supplies, starterKitTotal: e.target.value },
              }))
            }
          />
        </label>
        <div className="guide-admin-step__save-row">
          <button
            type="button"
            className="btn btn-primary"
            disabled={saveLocked}
            data-testid="guide-admin-supplies-total-save"
            onClick={() => void saveItem("supplies-total")}
          >
            <Save size={16} aria-hidden />
            {savingKey === "supplies-total"
              ? "Saving…"
              : itemSavedFlash === "supplies-total"
                ? "Starter kit total saved"
                : "Save starter kit total"}
          </button>
        </div>
        {draft.supplies.items.length === 0 ? (
          <p className="guide-admin-content-editor__empty">No supplies yet — add the first one.</p>
        ) : (
          <ul className="guide-admin-bullets">
            {draft.supplies.items.map((item, idx) => (
              <li key={item.id || `supply-${idx}`} className="guide-admin-bullet">
                <span className="guide-admin-bullet__mark" aria-hidden>
                  {idx + 1}.
                </span>
                <div className="guide-admin-bullet__body">
                  <label className="guide-admin-content-editor__field">
                    <span>Item</span>
                    <input
                      type="text"
                      className="text-input"
                      value={item.name}
                      placeholder="Supply name"
                      aria-label={`Supply ${idx + 1} name`}
                      data-testid={`guide-admin-supplies-name-${idx}`}
                      onChange={(e) =>
                        setDraft((d) => {
                          const items = d.supplies.items.slice();
                          items[idx] = { ...items[idx]!, name: e.target.value };
                          return { ...d, supplies: { ...d.supplies, items } };
                        })
                      }
                    />
                  </label>
                  <div className="guide-admin-field-grid">
                    <label className="guide-admin-content-editor__field">
                      <span>Qty</span>
                      <input
                        type="text"
                        className="text-input"
                        value={item.qty}
                        placeholder="1"
                        aria-label={`Supply ${idx + 1} quantity`}
                        data-testid={`guide-admin-supplies-qty-${idx}`}
                        onChange={(e) =>
                          setDraft((d) => {
                            const items = d.supplies.items.slice();
                            items[idx] = { ...items[idx]!, qty: e.target.value };
                            return { ...d, supplies: { ...d.supplies, items } };
                          })
                        }
                      />
                    </label>
                    <label className="guide-admin-content-editor__field">
                      <span>Est. cost</span>
                      <input
                        type="text"
                        className="text-input"
                        value={item.estCost}
                        placeholder="$6–12"
                        aria-label={`Supply ${idx + 1} estimated cost`}
                        data-testid={`guide-admin-supplies-cost-${idx}`}
                        onChange={(e) =>
                          setDraft((d) => {
                            const items = d.supplies.items.slice();
                            items[idx] = { ...items[idx]!, estCost: e.target.value };
                            return { ...d, supplies: { ...d.supplies, items } };
                          })
                        }
                      />
                    </label>
                  </div>
                  <textarea
                    className="text-input guide-admin-richtext"
                    value={item.notes ?? ""}
                    rows={3}
                    placeholder="Notes (optional)"
                    aria-label={`Supply ${idx + 1} notes`}
                    data-testid={`guide-admin-supplies-notes-${idx}`}
                    onChange={(e) =>
                      setDraft((d) => {
                        const items = d.supplies.items.slice();
                        items[idx] = { ...items[idx]!, notes: e.target.value };
                        return { ...d, supplies: { ...d.supplies, items } };
                      })
                    }
                  />
                  <label className="guide-admin-bullet__check">
                    <input
                      type="checkbox"
                      checked={item.optional === true}
                      data-testid={`guide-admin-supplies-optional-${idx}`}
                      onChange={(e) =>
                        setDraft((d) => {
                          const items = d.supplies.items.slice();
                          items[idx] = { ...items[idx]!, optional: e.target.checked };
                          return { ...d, supplies: { ...d.supplies, items } };
                        })
                      }
                    />
                    Optional
                  </label>
                  <div className="guide-admin-step__save-row">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={saveLocked}
                      data-testid={`guide-admin-supplies-save-${idx}`}
                      onClick={() => void saveItem(`supply-${idx}`)}
                    >
                      <Save size={16} aria-hidden />
                      {savingKey === `supply-${idx}`
                        ? "Saving…"
                        : itemSavedFlash === `supply-${idx}`
                          ? "Supply saved"
                          : `Save supply ${idx + 1}`}
                    </button>
                  </div>
                </div>
                <div className="guide-admin-bullet__actions">
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Move supply ${idx + 1} up`}
                    disabled={idx === 0}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        supplies: {
                          ...d.supplies,
                          items: moveGuideKitItem(d.supplies.items, idx, -1),
                        },
                      }))
                    }
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Move supply ${idx + 1} down`}
                    disabled={idx === draft.supplies.items.length - 1}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        supplies: {
                          ...d.supplies,
                          items: moveGuideKitItem(d.supplies.items, idx, 1),
                        },
                      }))
                    }
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Delete supply ${idx + 1}`}
                    disabled={saveLocked}
                    data-testid={`guide-admin-supplies-delete-${idx}`}
                    onClick={() =>
                      persistImmediate(
                        {
                          ...draft,
                          supplies: {
                            ...draft.supplies,
                            items: draft.supplies.items.filter((_, i) => i !== idx),
                          },
                        },
                        "supply-delete",
                        idx,
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      ) : null}
    </section>
  );
}

type BulletItem = {
  id: string;
  heading: string;
  body: string;
  url?: string;
  costNote?: string;
  alternatives?: string;
  freePlanAvailable?: boolean;
};

function BulletListEditor({
  title,
  testId,
  itemNoun,
  items,
  addLabel,
  toolMode = false,
  saveLocked,
  savingKey,
  itemSavedFlash,
  onSaveItem,
  onChange,
  onDeleteItem,
}: {
  title: string;
  testId: string;
  itemNoun: string;
  items: BulletItem[];
  addLabel: string;
  toolMode?: boolean;
  saveLocked: boolean;
  savingKey: string | null;
  itemSavedFlash: string | null;
  onSaveItem: (idx: number) => void;
  onChange: (items: BulletItem[]) => void;
  /** Trash persists immediately with the filtered list. */
  onDeleteItem?: (idx: number, nextItems: BulletItem[]) => void;
}) {
  const flashPrefix = toolMode ? "tool" : "prereq";
  return (
    <div className="guide-admin-content-editor__block" data-testid={`${testId}-editor`}>
      <div className="guide-admin-content-editor__block-head">
        <h4>{title}</h4>
        <button
          type="button"
          className="btn btn-outline"
          data-testid={`${testId}-add`}
          onClick={() =>
            onChange([
              ...items,
              {
                id: newGuideKitItemId(toolMode ? "tool" : "prereq"),
                heading: "",
                body: "",
                costNote: "",
                freePlanAvailable: false,
              },
            ])
          }
        >
          <Plus size={16} aria-hidden /> {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="guide-admin-content-editor__empty">No items — add a bullet to start.</p>
      ) : (
        <ul className="guide-admin-bullets">
          {items.map((item, idx) => {
            const itemKey = `${flashPrefix}-${idx}`;
            return (
              <li key={item.id || `${testId}-${idx}`} className="guide-admin-bullet">
                <span className="guide-admin-bullet__mark" aria-hidden>
                  •
                </span>
                <div className="guide-admin-bullet__body">
                  <input
                    type="text"
                    className="text-input"
                    value={item.heading}
                    placeholder={toolMode ? "Tool name" : "Prerequisite title"}
                    aria-label={`${title} ${idx + 1} title`}
                    data-testid={`${testId}-heading-${idx}`}
                    onChange={(e) => {
                      const next = items.slice();
                      next[idx] = { ...item, heading: e.target.value };
                      onChange(next);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      e.stopPropagation();
                      const area = e.currentTarget
                        .closest("li")
                        ?.querySelector<HTMLTextAreaElement>("textarea");
                      area?.focus();
                    }}
                  />
                  {toolMode ? (
                    <>
                      <textarea
                        className="text-input guide-admin-richtext guide-admin-richtext--step"
                        value={item.costNote || item.body}
                        rows={6}
                        placeholder="Cost notes, plan info, or free-form text"
                        aria-label={`${title} ${idx + 1} cost / notes`}
                        data-testid={`${testId}-body-${idx}`}
                        onChange={(e) => {
                          const next = items.slice();
                          next[idx] = { ...item, body: e.target.value, costNote: e.target.value };
                          onChange(next);
                        }}
                      />
                      <input
                        type="url"
                        className="text-input"
                        value={item.url || ""}
                        placeholder="https://… (optional link)"
                        aria-label={`${title} ${idx + 1} URL`}
                        data-testid={`${testId}-url-${idx}`}
                        onChange={(e) => {
                          const next = items.slice();
                          next[idx] = { ...item, url: e.target.value };
                          onChange(next);
                        }}
                      />
                      <label className="guide-admin-bullet__check">
                        <input
                          type="checkbox"
                          checked={item.freePlanAvailable === true}
                          data-testid={`${testId}-free-${idx}`}
                          onChange={(e) => {
                            const next = items.slice();
                            next[idx] = { ...item, freePlanAvailable: e.target.checked };
                            onChange(next);
                          }}
                        />
                        Free plan available
                      </label>
                    </>
                  ) : (
                    <textarea
                      className="text-input guide-admin-richtext guide-admin-richtext--step"
                      value={item.body}
                      rows={6}
                      placeholder="Details — bullets or short paragraphs"
                      aria-label={`${title} ${idx + 1} details`}
                      data-testid={`${testId}-body-${idx}`}
                      onChange={(e) => {
                        const next = items.slice();
                        next[idx] = { ...item, body: e.target.value };
                        onChange(next);
                      }}
                    />
                  )}
                  <div className="guide-admin-step__save-row">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={saveLocked}
                      data-testid={`${testId}-save-${idx}`}
                      onClick={() => onSaveItem(idx)}
                    >
                      <Save size={16} aria-hidden />
                      {savingKey === itemKey
                        ? "Saving…"
                        : itemSavedFlash === itemKey
                          ? `${itemNoun[0]!.toUpperCase()}${itemNoun.slice(1)} saved`
                          : `Save ${itemNoun} ${idx + 1}`}
                    </button>
                  </div>
                </div>
                <div className="guide-admin-bullet__actions">
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Move ${title} ${idx + 1} up`}
                    disabled={idx === 0}
                    onClick={() => onChange(moveGuideKitItem(items, idx, -1))}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Move ${title} ${idx + 1} down`}
                    disabled={idx === items.length - 1}
                    onClick={() => onChange(moveGuideKitItem(items, idx, 1))}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline guide-admin-step__icon-btn"
                    aria-label={`Delete ${title} ${idx + 1}`}
                    disabled={saveLocked}
                    data-testid={`${testId}-delete-${idx}`}
                    onClick={() => {
                      const next = items.filter((_, i) => i !== idx);
                      if (onDeleteItem) onDeleteItem(idx, next);
                      else onChange(next);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
