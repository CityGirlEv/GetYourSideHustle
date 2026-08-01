import { Lock } from "lucide-react";

/** Closed-sprint badge for sprint bubbles / filter chips across Admin. */
export function SprintLockedBanner({
  size = 11,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`sprint-locked-banner${className ? ` ${className}` : ""}`}
      title="Closed & locked — no further edits"
      data-testid="sprint-locked-banner"
    >
      <Lock size={size} aria-hidden /> Locked
    </span>
  );
}
