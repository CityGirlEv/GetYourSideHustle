import { useState } from "react";
import { Download } from "lucide-react";
import {
  GUIDE_PDF_MIN_TIER,
  guidePdfAvailableLabel,
  resolveGuideAccess,
} from "../lib/guide-access";
import { downloadLaunchGuidePdf } from "../lib/launch-guide-pdf";
import { reservePdfTab } from "../lib/open-pdf";
import { hustleById } from "../lib/side-hustle-catalog";
import { LAUNCH_GUIDES } from "../lib/launch-guides";

/** True when a printable launch-guide PDF exists for this id. */
export function guideHasPdfDownload(guideId: string): boolean {
  const id = String(guideId || "").trim();
  if (!id) return false;
  return Boolean(hustleById(id) || LAUNCH_GUIDES.some((g) => g.id === id));
}

type GuidePdfButtonProps = {
  guideId: string;
  isMember: boolean;
  membershipTier?: string | null;
  isAdmin?: boolean;
  onJoin?: () => void;
};

/** Per-card PDF download for the Guide Library listing. */
export function GuidePdfButton({
  guideId,
  isMember,
  membershipTier = null,
  isAdmin = false,
  onJoin,
}: GuidePdfButtonProps) {
  const [busy, setBusy] = useState(false);
  if (!guideHasPdfDownload(guideId)) return null;

  const pdfAccess = resolveGuideAccess({
    isMember,
    membershipTier,
    minTier: GUIDE_PDF_MIN_TIER,
    isAdmin,
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
          {guidePdfAvailableLabel()}
        </span>
      ) : null}
    </button>
  );
}
