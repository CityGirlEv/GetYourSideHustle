import {
  guideHeldVisibilityStatuses,
  guideIsReviewed,
  guideStatusAfterVisibilityPick,
  toggleGuideReviewed,
  type GuideVisibilityStatus,
} from "../lib/guide-catalog-state";

const VISIBILITY_OPTIONS: { value: GuideVisibilityStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending / Needs Further Review" },
  { value: "fixed_rereview", label: "Fixed/Re-Review" },
  { value: "inactive", label: "Inactive" },
];

/**
 * Admin status line under the guide header:
 * Active / Pending / Fixed/Re-Review / Inactive + Not Reviewed / Reviewed.
 * Pending also checks Reviewed + Inactive. Fixed/Re-Review is Not Reviewed (back to QA).
 */
export function GuideActiveToggle({
  guideId,
  status,
  busy = false,
  canSetReviewedByDev = false,
  onChange,
}: {
  guideId: string;
  status: GuideVisibilityStatus;
  busy?: boolean;
  /** Only Evelyn may set Reviewed by Dev when marking Reviewed. */
  canSetReviewedByDev?: boolean;
  onChange: (next: GuideVisibilityStatus) => void;
}) {
  const name = `guide-active-${guideId}`;
  const reviewed = guideIsReviewed(status);
  const notReviewed = !reviewed;
  const held = guideHeldVisibilityStatuses(status);

  const setReviewed = (wantReviewed: boolean) => {
    if (busy) return;
    const next = toggleGuideReviewed(status, wantReviewed, canSetReviewedByDev);
    if (next !== status) onChange(next);
  };

  return (
    <div
      className={`guide-active-toggle is-${status}`}
      data-testid={`guide-active-toggle-${guideId}`}
      role="group"
      aria-label={busy ? "Saving guide status" : "Guide status"}
    >
      {VISIBILITY_OPTIONS.map((opt) => {
        const checked = held.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={`guide-active-toggle__option${checked ? " is-checked" : ""}`}
          >
            <input
              type="checkbox"
              name={`${name}-${opt.value}`}
              checked={checked}
              disabled={busy}
              data-testid={`guide-active-check-${opt.value}-${guideId}`}
              onChange={() => {
                if (checked || busy) return;
                onChange(
                  guideStatusAfterVisibilityPick(
                    status,
                    opt.value as "active" | "pending" | "fixed_rereview" | "inactive",
                    canSetReviewedByDev,
                  ),
                );
              }}
            />
            <span>{opt.label}</span>
          </label>
        );
      })}
      <span
        className="guide-active-toggle__review-pair"
        role="group"
        aria-label="Guide review status"
      >
        <label
          className={`guide-active-toggle__option guide-active-toggle__reviewed is-not-reviewed${
            notReviewed ? " is-checked" : ""
          }`}
        >
          <input
            type="checkbox"
            name={`${name}-not-reviewed`}
            checked={notReviewed}
            disabled={busy}
            data-testid={`guide-not-reviewed-check-${guideId}`}
            onChange={() => {
              if (!notReviewed) setReviewed(false);
            }}
          />
          <span>Not Reviewed</span>
        </label>
        <label
          className={`guide-active-toggle__option guide-active-toggle__reviewed is-reviewed${
            reviewed ? " is-checked" : ""
          }`}
        >
          <input
            type="checkbox"
            name={`${name}-reviewed`}
            checked={reviewed}
            disabled={busy}
            data-testid={`guide-reviewed-check-${guideId}`}
            onChange={() => {
              if (!reviewed) setReviewed(true);
            }}
          />
          <span>Reviewed</span>
        </label>
      </span>
      {busy ? <span className="guide-active-toggle__busy">Saving…</span> : null}
    </div>
  );
}
