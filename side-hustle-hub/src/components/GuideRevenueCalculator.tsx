import { useEffect, useMemo, useState } from "react";
import {
  computeGuideCalc,
  formatGuideCalcMoney,
  formatGuideCalcMoneyPrecise,
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
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    const next = guideCalcProfileForId(guideId, guideName);
    setInputs({ ...next.defaults });
    setBudget(next.budget.map((l) => ({ ...l })));
    setItemName("");
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
        {profile.disclaimerExtra ? (
          <p className="guide-revenue-calc__disclaimer guide-revenue-calc__disclaimer--extra">
            {profile.disclaimerExtra}
          </p>
        ) : null}
      </header>

      <div className="guide-revenue-calc__grid">
        <div className="guide-revenue-calc__inputs">
          {profile.mode === "delivery" ? (
            <>
              <FieldNumber
                label="Hours worked"
                value={inputs.hoursWorked ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("hoursWorked", v)}
              />
              <FieldNumber
                label="Number of deliveries"
                value={inputs.deliveries ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("deliveries", v)}
              />
              <FieldNumber
                label="Delivery / base earnings ($)"
                value={inputs.baseEarnings ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("baseEarnings", v)}
              />
              <FieldNumber
                label="Tips ($)"
                value={inputs.tips ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("tips", v)}
              />
              <FieldNumber
                label="Promotions / bonuses ($)"
                value={inputs.promotions ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("promotions", v)}
              />
              <FieldNumber
                label="Total miles driven"
                value={inputs.totalMiles ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("totalMiles", v)}
              />
            </>
          ) : null}

          {profile.mode === "resale" ? (
            <>
              <div className="guide-revenue-calc__field">
                <label className="guide-revenue-calc__label">
                  <span>Item name</span>
                </label>
                <input
                  type="text"
                  className="text-input"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Mid-century ceramic lamp"
                  aria-label="Item name"
                  data-testid="guide-revenue-calc-item-name"
                />
              </div>
              <FieldNumber
                label="Purchase price ($)"
                value={inputs.purchasePrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("purchasePrice", v)}
              />
              <FieldNumber
                label="Expected selling price ($)"
                value={inputs.expectedSellingPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("expectedSellingPrice", v)}
              />
              <FieldNumber
                label="Marketplace fees ($)"
                value={inputs.marketplaceFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("marketplaceFees", v)}
              />
              <FieldNumber
                label="Payment fees ($)"
                value={inputs.paymentFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentFees", v)}
              />
              <FieldNumber
                label="Shipping paid by seller ($)"
                value={inputs.shippingPaidBySeller ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("shippingPaidBySeller", v)}
              />
              <FieldNumber
                label="Packaging cost ($)"
                value={inputs.packagingCost ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("packagingCost", v)}
              />
              <FieldNumber
                label="Cleaning / repair cost ($)"
                value={inputs.cleaningRepairCost ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("cleaningRepairCost", v)}
              />
              <FieldNumber
                label="Other costs ($)"
                value={inputs.otherCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherCosts", v)}
              />
              <FieldNumber
                label="Desired profit ($)"
                value={inputs.desiredProfit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("desiredProfit", v)}
              />
            </>
          ) : null}

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
                label={guideId === "digital-products" ? "Product price ($)" : "Units sold / month"}
                value={
                  guideId === "digital-products" ? (inputs.price ?? 0) : (inputs.units ?? 0)
                }
                resetKey={fieldKey}
                onChange={(v) =>
                  setInput(guideId === "digital-products" ? "price" : "units", v)
                }
              />
              <FieldNumber
                label={guideId === "digital-products" ? "Sales per month" : "Unit retail price ($)"}
                value={
                  guideId === "digital-products" ? (inputs.units ?? 0) : (inputs.price ?? 0)
                }
                resetKey={fieldKey}
                onChange={(v) =>
                  setInput(guideId === "digital-products" ? "units" : "price", v)
                }
              />
              {guideId === "digital-products" ? (
                <FieldNumber
                  label="Monthly profit goal ($)"
                  value={inputs.monthlyProfitGoal ?? 0}
                  resetKey={fieldKey}
                  onChange={(v) => setInput("monthlyProfitGoal", v)}
                />
              ) : (
                <>
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
              )}
            </>
          ) : null}

          {profile.mode === "impact" ? (
            <>
              <FieldNumber
                label="Number of sessions"
                value={inputs.sessions ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("sessions", v)}
              />
              <FieldNumber
                label="People helped per session"
                value={inputs.peoplePerSession ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("peoplePerSession", v)}
              />
              <FieldNumber
                label="Minutes per session"
                value={inputs.minutesPerSession ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("minutesPerSession", v)}
              />
              <FieldNumber
                label="Preparation minutes per session"
                value={inputs.prepMinutesPerSession ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("prepMinutesPerSession", v)}
              />
              <p className="guide-revenue-calc__disclaimer guide-revenue-calc__disclaimer--extra">
                FUTURE EXAMPLE ONLY — current session is FREE
              </p>
              <FieldNumber
                label="If I later charged ($ / session)"
                value={inputs.futureRatePerSession ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("futureRatePerSession", v)}
              />
              <FieldNumber
                label="Potential sessions (future example)"
                value={inputs.futureSessionCount ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("futureSessionCount", v)}
              />
            </>
          ) : null}

          {profile.mode === "kindness" ? (
            <>
              <FieldNumber
                label="Give-Back activities completed"
                value={inputs.activitiesCompleted ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("activitiesCompleted", v)}
              />
              <FieldNumber
                label="People helped"
                value={inputs.peopleHelped ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("peopleHelped", v)}
              />
              <FieldNumber
                label="Minutes helping"
                value={inputs.minutesHelping ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("minutesHelping", v)}
              />
              <FieldNumber
                label="My monthly kindness goal (activities)"
                value={inputs.monthlyGoal ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyGoal", v)}
              />
            </>
          ) : null}

          {profile.mode === "split" ? (
            <>
              <FieldNumber
                label={guideId === "kids-reinvest-jar" ? "Money I earned ($)" : "Money collected ($)"}
                value={inputs.moneyCollected ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("moneyCollected", v)}
              />
              <FieldNumber
                label={guideId === "kids-reinvest-jar" ? "What it cost ($)" : "Hustle expenses ($)"}
                value={inputs.hustleExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("hustleExpenses", v)}
              />
              <FieldNumber
                label="Save %"
                value={inputs.savePercent ?? 0}
                resetKey={fieldKey}
                max={100}
                onChange={(v) => setInput("savePercent", Math.min(100, v))}
              />
              <FieldNumber
                label={guideId === "kids-reinvest-jar" ? "Fun %" : "Enjoy %"}
                value={inputs.enjoyPercent ?? 0}
                resetKey={fieldKey}
                max={100}
                onChange={(v) => setInput("enjoyPercent", Math.min(100, v))}
              />
              <FieldNumber
                label="Grow %"
                value={inputs.growPercent ?? 0}
                resetKey={fieldKey}
                max={100}
                onChange={(v) => setInput("growPercent", Math.min(100, v))}
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
                label={
                  guideId === "kids-party-game-host"
                    ? "Number of parties"
                    : guideId === "lead-followup-assistant"
                      ? "Number of clients"
                      : guideId === "personal-shopper"
                        ? "Jobs per week"
                        : guideId === "youth-sports-helper"
                          ? "Practices per week"
                          : guideId === "local-content-photographer"
                            ? "Number of shoots"
                            : guideId === "appointment-setter"
                              ? "Projects per week"
                              : guideId === "online-research-assistant"
                                ? "Projects per week"
                                : guideId === "mothers-helper"
                                  ? "Jobs per week"
                                  : guideId === "babysitting"
                                    ? "Jobs per week"
                            : "Jobs / clients per month"
                }
                value={inputs.jobsPerMonth ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("jobsPerMonth", v)}
              />
              <FieldNumber
                label={
                  guideId === "kids-party-game-host"
                    ? "Party price ($)"
                    : guideId === "lead-followup-assistant"
                      ? "Monthly client fee ($)"
                      : guideId === "personal-shopper"
                        ? "Shopping fee per job ($)"
                        : guideId === "youth-sports-helper"
                          ? "Pay per practice ($)"
                          : guideId === "local-content-photographer"
                            ? "Price per shoot ($)"
                            : guideId === "appointment-setter"
                              ? "Project price ($)"
                              : guideId === "online-research-assistant"
                                ? "Project price ($)"
                                : guideId === "mothers-helper"
                                  ? "Average job price ($)"
                                  : guideId === "babysitting"
                                    ? "Hourly rate ($)"
                            : "Average sale ($)"
                }
                value={inputs.avgTicket ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("avgTicket", v)}
              />
              {guideId === "personal-shopper" ? (
                <FieldNumber
                  label="Average add-on fees ($)"
                  value={inputs.addOnFees ?? 0}
                  resetKey={fieldKey}
                  onChange={(v) => setInput("addOnFees", v)}
                />
              ) : null}
              {guideId === "appointment-setter" ? (
                <>
                  <FieldNumber
                    label="Recurring client revenue ($ / week)"
                    value={inputs.recurringClientRevenue ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("recurringClientRevenue", v)}
                  />
                  <FieldNumber
                    label="Hours worked (week)"
                    value={inputs.hoursPerClient ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerClient", v)}
                  />
                </>
              ) : null}
              {guideId === "online-research-assistant" ? (
                <>
                  <FieldNumber
                    label="Average research hours per project"
                    value={inputs.researchHoursPerProject ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("researchHoursPerProject", v)}
                  />
                  <FieldNumber
                    label="Admin / formatting hours per project"
                    value={inputs.adminHoursPerProject ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("adminHoursPerProject", v)}
                  />
                </>
              ) : null}
              {guideId === "youth-sports-helper" ? (
                <>
                  <FieldNumber
                    label="Extra event pay ($)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Hours per practice"
                    value={inputs.hoursPerPractice ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerPractice", v)}
                  />
                </>
              ) : null}
              {guideId === "mothers-helper" ? (
                <>
                  <FieldNumber
                    label="Tips / extra approved pay ($)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Hours worked per week"
                    value={inputs.hoursWorkedPerWeek ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursWorkedPerWeek", v)}
                  />
                </>
              ) : null}
              {guideId === "babysitting" ? (
                <>
                  <FieldNumber
                    label="Hours per job"
                    value={inputs.hoursPerJob ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerJob", v)}
                  />
                  <FieldNumber
                    label="Add-on income ($)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                </>
              ) : null}
              {guideId === "lead-followup-assistant" ? (
                <FieldNumber
                  label="Estimated hours per client"
                  value={inputs.hoursPerClient ?? 0}
                  resetKey={fieldKey}
                  onChange={(v) => setInput("hoursPerClient", v)}
                />
              ) : null}
              {guideId === "local-content-photographer" ? (
                <>
                  <FieldNumber
                    label="Hours per shoot"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                  <FieldNumber
                    label="Editing hours per shoot"
                    value={inputs.editingHoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("editingHoursPerShoot", v)}
                  />
                </>
              ) : null}
            </>
          ) : null}

          {profile.mode === "resale" ||
          profile.mode === "impact" ||
          profile.mode === "kindness" ||
          profile.mode === "split" ? null : profile.mode !== "product" ? (
            <div className="guide-revenue-calc__budget">
              <h4>
                {profile.mode === "delivery"
                  ? "Cash expenses"
                  : guideId === "youth-sports-helper"
                    ? "Weekly costs"
                    : guideId === "appointment-setter"
                      ? "Weekly costs"
                      : guideId === "online-research-assistant"
                        ? "Weekly costs"
                        : guideId === "mothers-helper"
                          ? "Weekly costs"
                          : guideId === "babysitting"
                            ? "Weekly costs"
                    : "Monthly costs"}
              </h4>
              {budget.map((line) => (
                <label key={line.id} className="guide-revenue-calc__budget-row">
                  <span>{line.label}</span>
                  <CalcNumberInput
                    value={line.amount}
                    resetKey={fieldKey}
                    ariaLabel={`${line.label} amount`}
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
          {profile.mode === "resale" && result.metrics?.maxBuyPrice != null ? (
            <div
              className="guide-revenue-calc__max-buy"
              data-testid="guide-revenue-calc-max-buy"
            >
              <p className="guide-revenue-calc__net-label">MAXIMUM I SHOULD PAY</p>
              <p
                className={`guide-revenue-calc__net${(result.metrics.maxBuyPrice ?? 0) < 0 ? " is-neg" : ""}`}
              >
                {formatGuideCalcMoneyPrecise(result.metrics.maxBuyPrice)}
              </p>
            </div>
          ) : null}
          <p className="guide-revenue-calc__net-label">
            {profile.mode === "delivery"
              ? "Est. cash profit"
              : profile.mode === "resale"
                ? "Estimated net profit"
                : profile.mode === "impact"
                  ? "Total give-back hours"
                  : profile.mode === "kindness"
                    ? "Total helping hours"
                    : profile.mode === "split"
                      ? "Money left to split"
                      : guideId === "personal-shopper" ||
                        guideId === "youth-sports-helper" ||
                        guideId === "appointment-setter" ||
                        guideId === "online-research-assistant" ||
                        guideId === "mothers-helper" ||
                        guideId === "babysitting"
                      ? "Est. weekly profit"
                      : "Est. net / month"}
          </p>
          <p
            className={`guide-revenue-calc__net${result.net < 0 ? " is-neg" : ""}`}
            data-testid="guide-revenue-calc-net"
          >
            {profile.mode === "impact"
              ? `${(result.metrics?.totalGiveBackHours ?? result.net).toFixed(1)} hrs`
              : profile.mode === "kindness"
                ? `${(result.metrics?.totalHelpingHours ?? result.net).toFixed(1)} hrs`
                : profile.mode === "delivery" || profile.mode === "resale" || profile.mode === "split"
                  ? formatGuideCalcMoneyPrecise(result.net)
                  : formatGuideCalcMoney(result.net)}
          </p>
          {profile.mode === "impact" || profile.mode === "kindness" || profile.mode === "split" ? null : (
          <p className="guide-revenue-calc__margin">
            {profile.mode === "resale" ? "Profit margin" : "Margin"}{" "}
            {result.marginPercent.toFixed(0)}%
            {profile.mode === "resale" && result.metrics?.roiPercent != null
              ? ` · ROI ${result.metrics.roiPercent.toFixed(0)}%`
              : ""}
          </p>
          )}
          <dl className="guide-revenue-calc__breakdown">
            {itemName.trim() && profile.mode === "resale" ? (
              <div>
                <dt>Item</dt>
                <dd>{itemName.trim()}</dd>
              </div>
            ) : null}
            {profile.mode === "kindness" ? (
              <>
                <div>
                  <dt>Activities completed</dt>
                  <dd>{result.metrics?.totalActivities ?? 0}</dd>
                </div>
                <div>
                  <dt>People helped</dt>
                  <dd>{result.metrics?.totalPeopleHelpedKindness ?? 0}</dd>
                </div>
                <div>
                  <dt>Minutes helping</dt>
                  <dd>{result.metrics?.totalHelpingMinutes ?? 0}</dd>
                </div>
                <div>
                  <dt>Monthly kindness goal</dt>
                  <dd>{result.metrics?.kindnessMonthlyGoal ?? 0}</dd>
                </div>
                <div>
                  <dt>Still to go</dt>
                  <dd>{result.metrics?.kindnessStillToGo ?? 0}</dd>
                </div>
              </>
            ) : profile.mode === "split" ? (
              <>
                <div>
                  <dt>{guideId === "kids-reinvest-jar" ? "Money earned" : "Money collected"}</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.revenue)}</dd>
                </div>
                <div>
                  <dt>{guideId === "kids-reinvest-jar" ? "What it cost" : "Hustle expenses"}</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.expenses)}</dd>
                </div>
                <div>
                  <dt>Money left to split</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics?.moneyAvailable ?? result.net)}</dd>
                </div>
                <div>
                  <dt>Save</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics?.saveAmount ?? 0)}</dd>
                </div>
                <div>
                  <dt>{guideId === "kids-reinvest-jar" ? "Fun" : "Enjoy"}</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics?.enjoyAmount ?? 0)}</dd>
                </div>
                <div>
                  <dt>Grow</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics?.growAmount ?? 0)}</dd>
                </div>
                <div>
                  <dt>Percentages total</dt>
                  <dd>
                    {(result.metrics?.percentTotal ?? 0).toFixed(0)}%
                    {result.metrics?.percentagesValid ? "" : " — must equal 100%"}
                  </dd>
                </div>
              </>
            ) : profile.mode === "impact" ? (
              <>
                <div>
                  <dt>Total people helped</dt>
                  <dd>{result.metrics?.totalPeopleHelped ?? 0}</dd>
                </div>
                <div>
                  <dt>Teaching time</dt>
                  <dd>{(result.metrics?.teachingHours ?? 0).toFixed(1)} hrs</dd>
                </div>
                <div>
                  <dt>Preparation time</dt>
                  <dd>{(result.metrics?.prepHours ?? 0).toFixed(1)} hrs</dd>
                </div>
                {result.metrics?.futureExampleRevenue != null ? (
                  <div>
                    <dt>Future example revenue (NOT current)</dt>
                    <dd>{formatGuideCalcMoney(result.metrics.futureExampleRevenue)}</dd>
                  </div>
                ) : null}
              </>
            ) : (
              <>
            <div>
              <dt>{profile.mode === "resale" ? "Expected sale" : "Gross earnings"}</dt>
              <dd>
                {profile.mode === "delivery" || profile.mode === "resale"
                  ? formatGuideCalcMoneyPrecise(result.revenue)
                  : formatGuideCalcMoney(result.revenue)}
              </dd>
            </div>
            <div>
              <dt>
                {profile.mode === "delivery"
                  ? "Cash expenses"
                  : profile.mode === "resale"
                    ? "Total cost"
                    : "Costs"}
              </dt>
              <dd>
                {profile.mode === "delivery" || profile.mode === "resale"
                  ? formatGuideCalcMoneyPrecise(result.expenses)
                  : formatGuideCalcMoney(result.expenses)}
              </dd>
            </div>
            {guideId === "digital-products" && result.metrics?.profitPerSale != null ? (
              <>
                <div>
                  <dt>Profit per sale</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics.profitPerSale)}</dd>
                </div>
                <div>
                  <dt>Sales needed (rounded up)</dt>
                  <dd>{result.metrics.salesNeeded ?? 0}</dd>
                </div>
              </>
            ) : null}
              </>
            )}
            {result.metrics?.totalInvestment != null ? (
              <div>
                <dt>Total investment</dt>
                <dd>{formatGuideCalcMoneyPrecise(result.metrics.totalInvestment)}</dd>
              </div>
            ) : null}
            {result.metrics?.totalSellingCosts != null ? (
              <div>
                <dt>Total selling costs</dt>
                <dd>{formatGuideCalcMoneyPrecise(result.metrics.totalSellingCosts)}</dd>
              </div>
            ) : null}
            {result.metrics?.grossPerHour != null ? (
              <div>
                <dt>Gross / hour</dt>
                <dd>{formatGuideCalcMoneyPrecise(result.metrics.grossPerHour)}</dd>
              </div>
            ) : null}
            {result.metrics?.netPerHour != null ? (
              <div>
                <dt>
                  {guideId === "lead-followup-assistant" ||
                  guideId === "local-content-photographer" ||
                  guideId === "youth-sports-helper" ||
                  guideId === "appointment-setter" ||
                  guideId === "online-research-assistant" ||
                  guideId === "mothers-helper"
                    ? "Effective hourly earnings"
                    : "Est. net / hour"}
                </dt>
                <dd>{formatGuideCalcMoneyPrecise(result.metrics.netPerHour)}</dd>
              </div>
            ) : null}
            {result.metrics?.grossPerMile != null ? (
              <div>
                <dt>Gross / mile</dt>
                <dd>{formatGuideCalcMoneyPrecise(result.metrics.grossPerMile)}</dd>
              </div>
            ) : null}
            {result.metrics?.netPerDelivery != null &&
            (profile.mode === "delivery" || guideId === "kids-party-game-host") ? (
              <div>
                <dt>
                  {guideId === "kids-party-game-host"
                    ? "Profit per party"
                    : "Est. net / delivery"}
                </dt>
                <dd>{formatGuideCalcMoneyPrecise(result.metrics.netPerDelivery)}</dd>
              </div>
            ) : null}
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
