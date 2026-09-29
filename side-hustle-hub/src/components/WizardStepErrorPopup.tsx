import { CircleAlert, X } from "lucide-react";
import type { WizardStepGateError } from "../lib/wizard-step-gate";

type WizardStepErrorPopupProps = {
  error: WizardStepGateError | null;
  onClose: () => void;
};

export function WizardStepErrorPopup({ error, onClose }: WizardStepErrorPopupProps) {
  if (!error) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-step-error-title"
      className="wizard-step-error"
      data-testid="wizard-step-error"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="wizard-step-error__card" onClick={(e) => e.stopPropagation()}>
        <div className="wizard-step-error__head">
          <span className="wizard-step-error__icon" aria-hidden>
            <CircleAlert size={22} />
          </span>
          <h3 id="wizard-step-error-title">{error.title}</h3>
          <button
            type="button"
            className="wizard-step-error__close"
            onClick={onClose}
            aria-label="Close"
            data-testid="wizard-step-error-close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="wizard-step-error__lead">
          Complete this before you tap <strong>{error.continueLabel}</strong>:
        </p>
        <ul className="wizard-step-error__list">
          {error.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-primary wizard-step-error__cta"
          onClick={onClose}
          data-testid="wizard-step-error-got-it"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
