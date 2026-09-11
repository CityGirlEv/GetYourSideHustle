import {
  VSPW_PRODUCT_NAME,
  VSPW_SHORT_NAME,
  vspwIsComingSoon,
  vspwMemberBlurb,
} from "../../lib/vspw";
import { VspwWizard } from "../vspw/VspwWizard";

/**
 * Admin entry for VSPW — full step-by-step wizard so you can walk the flow while building.
 * Member-facing product stays Coming Soon on production until Pro/Elite ship.
 */
export function VideoSceneProductionWizardPage() {
  const memberComingSoon = vspwIsComingSoon();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }} data-testid="vspw-admin-page">
      <div className="glass" style={{ padding: "16px 20px", borderRadius: 14 }}>
        <p
          className="glow-badge free"
          style={{ display: "inline-block", marginBottom: 6 }}
          data-testid="vspw-status-badge"
        >
          {VSPW_SHORT_NAME} · Admin wizard
          {memberComingSoon ? " · members: Coming soon" : " · local build"}
        </p>
        <h2 style={{ margin: "0 0 4px", color: "var(--bronze)", fontSize: "1.35rem" }}>
          {VSPW_PRODUCT_NAME}
        </h2>
        <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: 1.45, fontWeight: 600 }}>
          {vspwMemberBlurb()}
        </p>
        <p style={{ margin: "8px 0 0", color: "var(--text-primary)", lineHeight: 1.45 }}>
          Start at Step 1 and use Continue — or jump via the step chips. Progress saves in this
          browser session.
        </p>
      </div>
      <VspwWizard />
    </div>
  );
}
