import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardFieldLabel } from "@/components/intake/WizardFieldLabel";
import {
  REFERRAL_DETAIL_FIELDS,
  REFERRAL_SOURCES,
  REFERRAL_SOURCES_WITH_DETAIL,
  type ReferralSource,
} from "@/lib/referral-sources";

type IntakeReferralFieldsProps = {
  referralSources: ReferralSource[];
  referralDetailValues: {
    agent_referral: string;
    friend_family: string;
    medicare_event: string;
    other: string;
  };
  referralOther: string;
  onReferralSourceChange: (value: ReferralSource) => void;
  onReferralDetailChange: (source: keyof IntakeReferralFieldsProps["referralDetailValues"], value: string) => void;
  onReferralOtherChange: (value: string) => void;
};

export function IntakeReferralFields({
  referralSources,
  referralDetailValues,
  referralOther,
  onReferralSourceChange,
  onReferralDetailChange,
  onReferralOtherChange,
}: IntakeReferralFieldsProps) {
  return (
    <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
      <WizardFieldLabel tip="Optional — helps us understand how people find the tool. Do not enter names, email, phone numbers, or other personal information.">
        How did you hear about us?
      </WizardFieldLabel>
      <p className="text-xs text-muted-foreground leading-snug">
        Optional — select all that apply. Do not enter your name, email, phone, or anyone else&apos;s
        personal information.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {REFERRAL_SOURCES.map(({ value, label }) => (
          <label
            key={value}
            className={`flex items-center gap-1.5 text-xs cursor-pointer border rounded-md px-2 py-1.5 bg-background hover:bg-muted/40 leading-tight ${
              referralSources.includes(value) ? "border-primary bg-primary/5" : "border-input"
            }`}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-primary shrink-0"
              checked={referralSources.includes(value)}
              onChange={() => onReferralSourceChange(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {REFERRAL_SOURCES_WITH_DETAIL.filter((source) => referralSources.includes(source)).map(
        (source) => {
          const field = REFERRAL_DETAIL_FIELDS[source];
          return (
            <div key={source} className="space-y-1 pt-1 border-t border-primary/10">
              <WizardFieldLabel tip={field.hint}>
                {field.label}
                {field.required ? " *" : ""}
              </WizardFieldLabel>
              <Input
                className="h-9 text-sm"
                placeholder={field.placeholder}
                value={referralDetailValues[source]}
                onChange={(e) => onReferralDetailChange(source, e.target.value.slice(0, 80))}
                maxLength={80}
                required={field.required}
              />
            </div>
          );
        },
      )}
      {referralSources.includes("other") && (
        <div className="space-y-1 pt-1 border-t border-primary/10">
          <Label className="text-xs">Please briefly describe *</Label>
          <Input
            className="h-9 text-sm"
            placeholder="e.g. Community bulletin board"
            value={referralOther}
            onChange={(e) => onReferralOtherChange(e.target.value.slice(0, 80))}
            maxLength={80}
            required
          />
          <p className="text-[11px] text-muted-foreground">
            No names, email addresses, or phone numbers.
          </p>
        </div>
      )}
    </Card>
  );
}
