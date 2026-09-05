import type { CSSProperties } from "react";
import {
  PARTNER_ASSIGNEES,
  assigneeDisplayLabel,
  formatAssigneePeople,
  parseAssigneePeople,
  type PartnerAssignee,
} from "../../lib/gysh-tasks";

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  /** Accessible name */
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
  /** People chips (defaults to core partners; pass live QA short names to include Milford, etc.). */
  people?: readonly string[];
};

/**
 * Multi-select for schedule / task assignees.
 * Tina+Evelyn alone still stores as "Both" (partner-done rules).
 */
export function AssigneeMultiSelect({
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel = "Assignees",
  className,
  style,
  people = PARTNER_ASSIGNEES,
}: Props) {
  const roster = people.length > 0 ? people : PARTNER_ASSIGNEES;
  const selected = parseAssigneePeople(value, roster);

  const toggle = (person: PartnerAssignee) => {
    if (disabled) return;
    const next = selected.includes(person)
      ? selected.filter((p) => p !== person)
      : [...selected, person];
    onChange(formatAssigneePeople(next, roster));
  };

  const clear = () => {
    if (disabled) return;
    onChange("Unassigned");
  };

  return (
    <div
      className={className}
      role="group"
      aria-label={ariaLabel}
      data-testid="assignee-multi-select"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        ...style,
      }}
    >
      <button
        type="button"
        className={selected.length === 0 ? "btn btn-primary" : "btn btn-outline"}
        style={{ padding: "4px 10px", fontSize: "0.875rem" }}
        disabled={disabled}
        onClick={clear}
        aria-pressed={selected.length === 0}
      >
        Unassigned
      </button>
      {roster.map((person) => {
        const on = selected.some((p) => p.toLowerCase() === person.toLowerCase());
        return (
          <button
            type="button"
            key={person}
            className={on ? "btn btn-primary" : "btn btn-outline"}
            style={{ padding: "4px 10px", fontSize: "0.875rem" }}
            disabled={disabled}
            onClick={() => toggle(person)}
            aria-pressed={on}
          >
            {person}
          </button>
        );
      })}
      {selected.length > 1 && (
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "var(--bronze)",
            marginLeft: 2,
          }}
        >
          {assigneeDisplayLabel(value, roster)}
        </span>
      )}
    </div>
  );
}
