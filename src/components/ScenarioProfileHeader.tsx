import { Calendar, DollarSign, MapPin, User } from "lucide-react";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import {
  formatScenarioConditions,
  formatScenarioCostPreference,
  formatScenarioGender,
  formatScenarioMedicationLine,
} from "@/lib/scenario-display";
import { YOUR_PLAN_COMPARISON } from "@/lib/plan-comparison-copy";

type ScenarioProfile = ScenarioPdfInput & { county?: string };

export function ScenarioProfileHeader({
  scenario,
  title = YOUR_PLAN_COMPARISON,
}: {
  scenario: ScenarioProfile;
  title?: string;
}) {
  return (
    <div className="text-left space-y-4">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <Field
          icon={<Calendar className="h-3 w-3" />}
          label="Plan year"
          value={String(scenario.year)}
        />
        <Field
          icon={<User className="h-3 w-3" />}
          label="Birth year"
          value={String(scenario.birthYear)}
        />
        <Field
          icon={<MapPin className="h-3 w-3" />}
          label="ZIP region"
          value={`${scenario.zip3}xx${scenario.county ? ` · ${scenario.county}` : ""}`}
        />
        <Field label="Gender" value={formatScenarioGender(scenario.gender)} />
        <Field label="Tobacco" value={scenario.tobacco ? "Yes" : "No"} />
        <Field label="Income band" value={scenario.incomeBand || "—"} />
        <Field
          icon={<DollarSign className="h-3 w-3" />}
          label="Cost preference"
          value={formatScenarioCostPreference(scenario.costPreference)}
        />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Conditions</div>
        <div className="text-sm">{formatScenarioConditions(scenario.conditions)}</div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Medications
        </div>
        {scenario.medications?.length ? (
          <ul className="text-sm space-y-1">
            {scenario.medications.map((m) => (
              <li key={m.id}>{formatScenarioMedicationLine(m)}</li>
            ))}
          </ul>
        ) : (
          <div className="text-sm">None reported</div>
        )}
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="font-semibold capitalize">{value}</div>
    </div>
  );
}
