import { useEffect, useMemo, useState } from "react";
import {
  computeGuideCalc,
  formatGuideCalcMoney,
  guideCalcFieldDisplay,
  guideCalcProfileForId,
  parseGuideCalcField,
  type GuideCalcBudgetLine,
} from "../lib/guide-revenue-calc";

type GuideRevenueCalculatorProps = {
  guideId: string;
  guideName: string;
};

/** Single-hustle profit estimator embedded on the Launch Guide page. */
export function GuideRevenueCalculator({ guideId, guideName }: GuideRevenueCalculatorProps) {
  const profile = useMemo(
    () => guideCalcProfileForId(guideId, guideName),
    [guideId, guideName],
  );
  const [inputs, setInputs] = useState<Record<string, number>>(() => ({ ...profile.defaults }));
  const [budget, setBudget] = useState<GuideCalcBudgetLine[]>(() =>
    profile.budget.map((l) => ({ ...l })),
  );

  useEffect(() => {
    const next = guideCalcProfileForId(guideId, guideName);
    setInputs({ ...next.defaults });
    setBudget(next.budget.map((l) => ({ ...l })));
  }, [guideId, guideName]);

  const result = computeGuideCalc(profile.mode, inputs, budget);
  const fieldKey = `${guideId}:${guideName}`;

  const setInput = (key: string, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const setBudgetAmount = (id: string, amount: number) => {
    setBudget((prev) => prev.map((line) => (line.id === id ? { ...line, amount } : line)));
  };

  return (
    <div className="guide-revenue-calc" data-testid={`guide-revenue-calc-${guideId}`}>
      <header className="guide-revenue-calc__head">
        <h3>{profile.title}</h3>
        <p>{profile.blurb}</p>
        <p className="guide-revenue-calc__disclaimer">
          Planning estimate only — not a guarantee. Type your numbers or use the arrows.
        </p>
      </header>

      <div className="guide-revenue-calc__grid">
        <div className="guide-revenue-calc__inputs">
          {profile.mode === "lodging" ? (
            <>
              <FieldNumber
                label="Nightly rate ($)"
                value={inputs.nightlyRate ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("nightlyRate", v)}
              />
              <FieldNumber
                label="Occupancy (%)"
                value={inputs.occupancyPercent ?? 0}
                resetKey={fieldKey}
                max={100}
                onChange={(v) => setInput("occupancyPercent", Math.min(100, v))}
              />
              <FieldNumber
                label="Cleaning fee per booking ($)"
                value={inputs.cleaningFee ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("cleaningFee", v)}
              />
              <FieldNumber
                label="Average stay (nights)"
                value={inputs.avgStayNights ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("avgStayNights", v)}
              />
            </>
          ) : null}

          {profile.mode === "product" ? (
            <>
              <FieldNumber
                label="Units sold / month"
                value={inputs.units ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("units", v)}
              />
              <FieldNumber
                label="Unit retail price ($)"
                value={inputs.price ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("price", v)}
              />
              <FieldNumber
                label="Unit cost / COGS ($)"
                value={inputs.unitCost ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("unitCost", v)}
              />
              <FieldNumber
                label="Monthly ad spend ($)"
                value={inputs.adSpend ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("adSpend", v)}
              />
            </>
          ) : null}

          {profile.mode === "social" ? (
            <>
              <FieldNumber
                label="Followers"
                value={inputs.followers ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("followers", v)}
              />
              <FieldNumber
                label="Engagement rate (%)"
                value={inputs.engagementPercent ?? 0}
                resetKey={fieldKey}
                max={100}
                onChange={(v) => setInput("engagementPercent", Math.min(100, v))}
              />
              <FieldNumber
                label="Sponsored posts / month"
                value={inputs.sponsorPosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("sponsorPosts", v)}
              />
              <FieldNumber
                label="CPM ($)"
                value={inputs.cpm ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("cpm", v)}
              />
            </>
          ) : null}

          {profile.mode === "service" ? (
            <>
              <FieldNumber
                label="Jobs / clients per month"
                value={inputs.jobsPerMonth ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("jobsPerMonth", v)}
              />
              <FieldNumber
                label="Average sale ($)"
                value={inputs.avgTicket ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("avgTicket", v)}
              />
            </>
          ) : null}

          {profile.mode !== "product" ? (
            <div className="guide-revenue-calc__budget">
              <h4>Monthly costs</h4>
              {budget.map((line) => (
                <label key={line.id} className="guide-revenue-calc__budget-row">
                  <span>{line.label}</span>
                  <CalcNumberInput
                    value={line.amount}
                    resetKey={fieldKey}
                    ariaLabel={`${line.label} monthly amount`}
                    onChange={(v) => setBudgetAmount(line.id, v)}
                  />
                </label>
              ))}
            </div>
          ) : (
            <div className="guide-revenue-calc__budget">
              <h4>Other monthly costs</h4>
              {budget
                .filter((l) => l.id !== "ads")
                .map((line) => (
                  <label key={line.id} className="guide-revenue-calc__budget-row">
                    <span>{line.label}</span>
                    <CalcNumberInput
                      value={line.amount}
                      resetKey={fieldKey}
                      ariaLabel={`${line.label} monthly amount`}
                      onChange={(v) => setBudgetAmount(line.id, v)}
                    />
                  </label>
                ))}
            </div>
          )}
        </div>

        <aside className="guide-revenue-calc__results" aria-live="polite">
          <p className="guide-revenue-calc__net-label">Est. net / month</p>
          <p
            className={`guide-revenue-calc__net${result.net < 0 ? " is-neg" : ""}`}
            data-testid="guide-revenue-calc-net"
          >
            {formatGuideCalcMoney(result.net)}
          </p>
          <p className="guide-revenue-calc__margin">
            Margin {result.marginPercent.toFixed(0)}%
          </p>
          <dl className="guide-revenue-calc__breakdown">
            <div>
              <dt>Gross revenue</dt>
              <dd>{formatGuideCalcMoney(result.revenue)}</dd>
            </div>
            <div>
              <dt>Costs</dt>
              <dd>{formatGuideCalcMoney(result.expenses)}</dd>
            </div>
          </dl>
          {result.notes.length > 0 ? (
            <ul className="guide-revenue-calc__notes">
              {result.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
  resetKey,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  resetKey: string;
  max?: number;
}) {
  return (
    <div className="guide-revenue-calc__field">
      <label className="guide-revenue-calc__label">
        <span>{label}</span>
      </label>
      <CalcNumberInput
        value={value}
        onChange={onChange}
        resetKey={resetKey}
        max={max}
        ariaLabel={label}
        className="text-input"
      />
    </div>
  );
}

function CalcNumberInput({
  value,
  onChange,
  resetKey,
  max,
  ariaLabel,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  resetKey: string;
  max?: number;
  ariaLabel: string;
  className?: string;
}) {
  const [draft, setDraft] = useState<string | undefined>(undefined);

  useEffect(() => {
    setDraft(undefined);
  }, [resetKey]);

  return (
    <input
      type="number"
      min={0}
      max={max}
      step={1}
      inputMode="decimal"
      placeholder="0"
      value={guideCalcFieldDisplay(value, draft)}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        const parsed = parseGuideCalcField(raw);
        onChange(max != null ? Math.min(max, parsed) : parsed);
      }}
      onBlur={() => setDraft(undefined)}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
