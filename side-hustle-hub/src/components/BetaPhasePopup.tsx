import { FlaskConical, X } from "lucide-react";
import { BETA_PHASE_NOTICE } from "../lib/beta-phase-notice";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function BetaPhasePopup({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-phase-popup-title"
      className="beta-phase-popup"
      data-testid="beta-phase-popup"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="beta-phase-popup__card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="beta-phase-popup__banner" aria-hidden>
          <span className="beta-phase-popup__icon">
            <FlaskConical size={26} />
          </span>
        </div>
        <div className="beta-phase-popup__head">
          <div>
            <p className="beta-phase-popup__eyebrow">Get Your Side Hustle</p>
            <h3 id="beta-phase-popup-title">{BETA_PHASE_NOTICE.title}</h3>
          </div>
          <button
            type="button"
            className="beta-phase-popup__close"
            onClick={onClose}
            aria-label="Close"
            data-testid="beta-phase-popup-close"
          >
            <X size={16} />
          </button>
        </div>
        <p className="beta-phase-popup__body">{BETA_PHASE_NOTICE.body}</p>
        <div className="beta-phase-popup__actions">
          <button
            type="button"
            className="btn btn-primary beta-phase-popup__cta"
            onClick={onClose}
            data-testid="beta-phase-popup-got-it"
          >
            {BETA_PHASE_NOTICE.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
