import { useState } from "react";
import { Download } from "lucide-react";
import {
  GUIDE_PDF_MIN_TIER,
  guidePdfGateLabel,
  resolveGuideAccess,
  type GuideMinTier,
} from "../lib/guide-access";
import { downloadLaunchGuidePdf, guideHasPdfDownload } from "../lib/launch-guide-pdf";
import { reservePdfTab } from "../lib/open-pdf";

export { guideHasPdfDownload };

type GuidePdfButtonProps = {
  guideId: string;
  isMember: boolean;
  membershipTier?: string | null;
  isAdmin?: boolean;
  /** Guide’s own membership floor — PDF unlocks with the same ladder as on-screen viewing. */
  minTier?: GuideMinTier;
  onJoin?: () => void;
};

/** Per-guide PDF download (library listing + open launch guide). Members only. */
export function GuidePdfButton({
  guideId,
  isMember,
  membershipTier = null,
  isAdmin = false,
  minTier = GUIDE_PDF_MIN_TIER,
  onJoin,
}: GuidePdfButtonProps) {
  const [busy, setBusy] = useState(false);
  if (!guideHasPdfDownload(guideId)) return null;

  const pdfAccess = resolveGuideAccess({
    isMember,
    membershipTier,
    minTier,
    isAdmin,
    guideId,
  });
  const canDownload = pdfAccess.unlocked;

  return (
    <button
      type="button"
      className={`btn btn-outline launch-guide-pdf-btn free-guide-card-pdf${!canDownload ? " is-gated" : ""}`}
      data-testid={`guide-library-pdf-${guideId}`}
      disabled={busy || (!canDownload && !onJoin)}
      aria-describedby={!canDownload ? `guide-library-pdf-gate-${guideId}` : undefined}
      onClick={() => {
        if (!canDownload) {
          onJoin?.();
          return;
        }
        const tab = reservePdfTab();
        setBusy(true);
        void downloadLaunchGuidePdf(guideId, tab)
          .catch((err) => {
            console.error("[GYSH] launch guide PDF failed", err);
            try {
              tab?.close();
            } catch {
              /* ignore */
            }
          })
          .finally(() => setBusy(false));
      }}
    >
      <Download size={16} aria-hidden />
      {busy ? "Opening PDF…" : "Download PDF"}
      {!canDownload ? (
        <span
          className="glow-badge membership-lock-badge launch-guide-pdf-gate-badge"
          id={`guide-library-pdf-gate-${guideId}`}
          data-testid={`guide-library-pdf-gate-${guideId}`}
        >
          {guidePdfGateLabel(pdfAccess)}
        </span>
      ) : null}
    </button>
  );
}
