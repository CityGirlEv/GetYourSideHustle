import { ArrowDown, Sparkles } from "lucide-react";

/** Points newcomers to the first quiz question on GYSH Match Wizard pages. */
export function WizardStartHereBanner() {
  return (
    <div className="wizard-start-here" role="status">
      <span className="wizard-start-here__chip">
        <Sparkles className="wizard-start-here__spark" size={12} aria-hidden />
        <span className="wizard-start-here__label">Start here</span>
      </span>
      <ArrowDown className="wizard-start-here__arrow" size={14} aria-hidden />
    </div>
  );
}
