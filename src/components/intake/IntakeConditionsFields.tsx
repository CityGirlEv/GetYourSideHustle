import { Check, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoiceButton } from "@/components/VoiceButton";
import { INTAKE_CONDITIONS } from "@/lib/intake-constants";
import { WizardFieldLabel } from "@/components/intake/WizardFieldLabel";

type IntakeConditionsFieldsProps = {
  conditions: string[];
  otherConditions: string[];
  otherInput: string;
  onOtherInputChange: (value: string) => void;
  onToggleCondition: (condition: string) => void;
  onAddOtherCondition: () => void;
  onRemoveOtherCondition: (condition: string) => void;
  /** When false, omits the "b." prefix used in the plan comparison wizard. */
  showComparisonLabel?: boolean;
};

export function IntakeConditionsFields({
  conditions,
  otherConditions,
  otherInput,
  onOtherInputChange,
  onToggleCondition,
  onAddOtherCondition,
  onRemoveOtherCondition,
  showComparisonLabel = true,
}: IntakeConditionsFieldsProps) {
  return (
    <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
      <WizardFieldLabel tip="Health conditions help us suggest common medications and tailor drug-cost estimates. Optional — check all that apply.">
        {showComparisonLabel ? "b. Conditions" : "Conditions"}
      </WizardFieldLabel>
      <p className="text-xs text-muted-foreground">Optional — tap to select; tap again to remove</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {INTAKE_CONDITIONS.map((c) => {
          const selected = conditions.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => onToggleCondition(c)}
              className={`flex items-center gap-1.5 text-xs text-left border rounded-md px-2 py-1.5 leading-tight transition ${
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input hover:bg-muted/40"
              }`}
            >
              {selected ? <Check className="h-3 w-3 shrink-0" /> : null}
              <span>{c}</span>
            </button>
          );
        })}
      </div>
      {conditions.includes("Other") && (
        <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
          <WizardFieldLabel tip="Type a condition not listed above, then press Enter or tap + to add it. This helps us suggest relevant medications.">
            Add your condition(s)
          </WizardFieldLabel>
          <div className="flex flex-col gap-2">
            <Input
              className="w-full min-h-10"
              placeholder="e.g. Asthma, Glaucoma, Osteoporosis"
              value={otherInput}
              onChange={(e) => onOtherInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddOtherCondition();
                }
              }}
            />
            <div className="flex items-center gap-2">
              <VoiceButton
                label="Speak condition name"
                onTranscript={(t) => onOtherInputChange(t)}
              />
              <Button size="sm" onClick={onAddOtherCondition}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {otherConditions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {otherConditions.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => onRemoveOtherCondition(c)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>
      )}
    </Card>
  );
}
