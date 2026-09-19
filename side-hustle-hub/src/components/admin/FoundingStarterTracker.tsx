import {
  FOUNDING_STARTER_LIMIT,
  foundingStarterSlots,
  foundingStarterSlotsRemaining,
} from "../../lib/admin-membership";
import type { GyshUser } from "../../lib/gysh-roles";

export function FoundingStarterTracker({ users }: { users: GyshUser[] }) {
  const slots = foundingStarterSlots(users);
  const remaining = foundingStarterSlotsRemaining(users);
  const used = FOUNDING_STARTER_LIMIT - remaining;

  return (
    <section
      className="glass founding-starter-tracker"
      data-testid="founding-starter-tracker"
      style={{ padding: 20, borderRadius: 14 }}
    >
      <h3
        style={{
          margin: 0,
          color: "var(--charcoal)",
          fontSize: "1.15rem",
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        First {FOUNDING_STARTER_LIMIT} complimentary Starter
        <span style={{ fontWeight: 600, color: "var(--bronze)", fontSize: "0.95rem" }}>
          {used}/{FOUNDING_STARTER_LIMIT} used · {remaining} open
        </span>
      </h3>
      <p style={{ color: "var(--text-primary)", margin: "8px 0 14px", fontSize: "0.95rem" }}>
        We promised the first five members a free upgrade to Starter. Track the slots here.
        Process: activate the account if it is still pending, open Users Area, set membership to
        Starter, keep “Count toward first 5” and “Notify member” checked, then confirm the slot
        fills.
      </p>
      <ol className="founding-starter-tracker__slots">
        {slots.map(({ slot, grant }) => (
          <li
            key={slot}
            className={`founding-starter-tracker__slot${grant ? " is-filled" : ""}`}
            data-testid={`founding-starter-slot-${slot}`}
          >
            <strong>Slot {slot}</strong>
            {grant ? (
              <span>
                {grant.name}
                {grant.email ? ` · ${grant.email}` : ""}
              </span>
            ) : (
              <span className="founding-starter-tracker__open">Open</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
