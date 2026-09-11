/** Badge when Admin unlocks a guide outside normal membership gates. */
export function AdminViewOnlyBadge({
  "data-testid": testId = "admin-view-only-badge",
}: {
  "data-testid"?: string;
}) {
  return (
    <span
      className="glow-badge admin-view-only"
      data-testid={testId}
      title="Unlocked for Admin preview — members still need the required plan"
    >
      Admin view only
    </span>
  );
}
