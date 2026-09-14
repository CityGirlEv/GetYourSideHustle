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
            guideId === "book-publishing" ? (
            <>
              <FieldNumber
                label="Ebook units / month"
                value={inputs.ebookUnits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("ebookUnits", v)}
              />
              <FieldNumber
                label="Ebook actual revenue / unit ($)"
                value={inputs.ebookRevPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("ebookRevPerUnit", v)}
              />
              <FieldNumber
                label="Paperback units / month"
                value={inputs.paperbackUnits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paperbackUnits", v)}
              />
              <FieldNumber
                label="Paperback actual revenue / unit ($)"
                value={inputs.paperbackRevPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paperbackRevPerUnit", v)}
              />
              <FieldNumber
                label="Hardcover units / month"
                value={inputs.hardcoverUnits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("hardcoverUnits", v)}
              />
              <FieldNumber
                label="Hardcover actual revenue / unit ($)"
                value={inputs.hardcoverRevPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("hardcoverRevPerUnit", v)}
              />
              <FieldNumber
                label="Audiobook units / month"
                value={inputs.audiobookUnits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("audiobookUnits", v)}
              />
              <FieldNumber
                label="Audiobook actual revenue / unit ($)"
                value={inputs.audiobookRevPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("audiobookRevPerUnit", v)}
              />
              <FieldNumber
                label="Direct / other book revenue ($ / month)"
                value={inputs.directOtherRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("directOtherRevenue", v)}
              />
              <FieldNumber
                label="Unrecovered production cost ($)"
                value={inputs.unrecoveredProductionCost ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("unrecoveredProductionCost", v)}
              />
              <FieldNumber
                label="Avg profit contribution per sale ($)"
                value={inputs.avgProfitContributionPerSale ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("avgProfitContributionPerSale", v)}
              />
            </>
            ) : (
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
            )
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

          {profile.mode === "savings" ? (
            <>
              <p className="guide-revenue-calc__section-label">Savings goal</p>
              <FieldNumber label="Savings goal cost ($)" value={inputs.juniorSavingsGoalCost ?? 0} resetKey={fieldKey} onChange={(v) => setInput("juniorSavingsGoalCost", v)} />
              <FieldNumber label="Amount already saved ($)" value={inputs.amountAlreadySaved ?? 0} resetKey={fieldKey} onChange={(v) => setInput("amountAlreadySaved", v)} />
              <FieldNumber label="Weeks remaining" value={inputs.weeksRemaining ?? 0} resetKey={fieldKey} onChange={(v) => setInput("weeksRemaining", v)} />
              <p className="guide-revenue-calc__section-label">Approved earning plan</p>
              <FieldNumber label="Average earnings per approved task ($)" value={inputs.averageEarningsPerTask ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageEarningsPerTask", v)} />
              <FieldNumber label="Number of tasks per week" value={inputs.tasksPerWeek ?? 0} resetKey={fieldKey} onChange={(v) => setInput("tasksPerWeek", v)} />
              <FieldNumber label="Chosen savings portion (%)" value={inputs.savingsPortionPercent ?? 0} resetKey={fieldKey} onChange={(v) => setInput("savingsPortionPercent", v)} />
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

          {profile.mode === "service" && guideId === "foreclosure-properties" ? (
            <>
              <p className="guide-revenue-calc__section-label">Flip inputs</p>
              <FieldNumber
                label="Conservative ARV ($)"
                value={inputs.conservativeArv ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("conservativeArv", v)}
              />
              <FieldNumber
                label="Purchase price / bid ($)"
                value={inputs.purchasePrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("purchasePrice", v)}
              />
              <FieldNumber
                label="Buyer premium / auction fees ($)"
                value={inputs.buyerPremium ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("buyerPremium", v)}
              />
              <FieldNumber
                label="Closing / title / legal ($)"
                value={inputs.closingTitleLegal ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("closingTitleLegal", v)}
              />
              <FieldNumber
                label="Repairs ($)"
                value={inputs.repairs ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("repairs", v)}
              />
              <FieldNumber
                label="Repair contingency ($)"
                value={inputs.repairContingency ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("repairContingency", v)}
              />
              <FieldNumber
                label="Financing costs ($)"
                value={inputs.financingCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("financingCosts", v)}
              />
              <FieldNumber
                label="Monthly holding costs ($)"
                value={inputs.monthlyHoldingCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyHoldingCosts", v)}
              />
              <FieldNumber
                label="Expected holding months"
                value={inputs.expectedHoldingMonths ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("expectedHoldingMonths", v)}
              />
              <FieldNumber
                label="Selling costs ($)"
                value={inputs.sellingCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("sellingCosts", v)}
              />
              <FieldNumber
                label="Taxes / insurance / HOA ($)"
                value={inputs.taxesInsuranceHoa ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("taxesInsuranceHoa", v)}
              />
              <FieldNumber
                label="Other flip costs ($)"
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
              <p className="guide-revenue-calc__section-label">Rental inputs</p>
              <FieldNumber
                label="Purchase ($)"
                value={inputs.rentalPurchase ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("rentalPurchase", v)}
              />
              <FieldNumber
                label="Rehab / closing / initial costs ($)"
                value={inputs.rehabClosingInitial ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("rehabClosingInitial", v)}
              />
              <FieldNumber
                label="Monthly rent ($)"
                value={inputs.monthlyRent ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyRent", v)}
              />
              <FieldNumber
                label="Vacancy allowance ($ / month)"
                value={inputs.vacancyAllowance ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("vacancyAllowance", v)}
              />
              <FieldNumber
                label="Taxes ($ / month)"
                value={inputs.rentalTaxes ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("rentalTaxes", v)}
              />
              <FieldNumber
                label="Insurance ($ / month)"
                value={inputs.rentalInsurance ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("rentalInsurance", v)}
              />
              <FieldNumber
                label="Maintenance ($ / month)"
                value={inputs.maintenance ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("maintenance", v)}
              />
              <FieldNumber
                label="CapEx reserve ($ / month)"
                value={inputs.capexReserve ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("capexReserve", v)}
              />
              <FieldNumber
                label="Management ($ / month)"
                value={inputs.management ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("management", v)}
              />
              <FieldNumber
                label="HOA / owner utilities ($ / month)"
                value={inputs.hoaOwnerUtilities ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("hoaOwnerUtilities", v)}
              />
              <FieldNumber
                label="Debt service ($ / month)"
                value={inputs.debtService ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("debtService", v)}
              />
              <FieldNumber
                label="Other operating ($ / month)"
                value={inputs.otherOperating ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherOperating", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "ai-peers" ? (
            <>
              <p className="guide-revenue-calc__section-label">Gross revenue</p>
              <FieldNumber label="1:1 sessions" value={inputs.aiPeersOneOnOneSessions ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersOneOnOneSessions", v)} />
              <FieldNumber label="1:1 session rate ($)" value={inputs.aiPeersOneOnOneRate ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersOneOnOneRate", v)} />
              <FieldNumber label="Small-group participants" value={inputs.aiPeersSmallGroupParticipants ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersSmallGroupParticipants", v)} />
              <FieldNumber label="Small-group price per person ($)" value={inputs.aiPeersSmallGroupPricePerPerson ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersSmallGroupPricePerPerson", v)} />
              <FieldNumber label="Private group sessions" value={inputs.aiPeersPrivateGroupSessions ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersPrivateGroupSessions", v)} />
              <FieldNumber label="Private group fee ($)" value={inputs.aiPeersPrivateGroupFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersPrivateGroupFee", v)} />
              <FieldNumber label="Workshops" value={inputs.aiPeersWorkshopSessions ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersWorkshopSessions", v)} />
              <FieldNumber label="Workshop fee ($)" value={inputs.aiPeersWorkshopFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersWorkshopFee", v)} />
              <FieldNumber label="Series revenue ($)" value={inputs.aiPeersSeriesRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersSeriesRevenue", v)} />
              <FieldNumber label="Add-on revenue ($)" value={inputs.aiPeersAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersAddOnRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Venue ($)" value={inputs.aiPeersVenueCost ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersVenueCost", v)} />
              <FieldNumber label="Printing ($)" value={inputs.aiPeersPrintingCost ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersPrintingCost", v)} />
              <FieldNumber label="Software / subscriptions ($)" value={inputs.aiPeersSoftwareSubscriptions ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersSoftwareSubscriptions", v)} />
              <FieldNumber label="Travel / parking ($)" value={inputs.aiPeersTravelParking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersTravelParking", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.aiPeersPaymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersPaymentFees", v)} />
              <FieldNumber label="Ads ($)" value={inputs.aiPeersAds ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersAds", v)} />
              <FieldNumber label="Host-paid refreshments ($)" value={inputs.aiPeersHostPaidRefreshments ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersHostPaidRefreshments", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.aiPeersOtherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersOtherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Teaching" value={inputs.aiPeersTeachingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersTeachingHours", v)} />
              <FieldNumber label="Prep" value={inputs.aiPeersPrepHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersPrepHours", v)} />
              <FieldNumber label="Travel" value={inputs.aiPeersTravelHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersTravelHours", v)} />
              <FieldNumber label="Setup / cleanup" value={inputs.aiPeersSetupCleanupHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersSetupCleanupHours", v)} />
              <FieldNumber label="Follow-up / admin" value={inputs.aiPeersFollowUpAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("aiPeersFollowUpAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "book-publishing-kids" ? (
            <>
              <p className="guide-revenue-calc__section-label">Earned book income (not list price)</p>
              <FieldNumber label="Direct printed copies sold" value={inputs.storybookDirectPrintedCopiesSold ?? 0} resetKey={fieldKey} onChange={(v) => setInput("storybookDirectPrintedCopiesSold", v)} />
              <FieldNumber label="Average direct sale price ($)" value={inputs.averageDirectSalePrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageDirectSalePrice", v)} />
              <FieldNumber label="eBook sales" value={inputs.ebookSales ?? 0} resetKey={fieldKey} onChange={(v) => setInput("ebookSales", v)} />
              <FieldNumber label="Average actual eBook royalty per sale ($)" value={inputs.averageActualEbookRoyaltyPerSale ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageActualEbookRoyaltyPerSale", v)} />
              <FieldNumber label="Print-on-demand sales" value={inputs.printOnDemandSales ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printOnDemandSales", v)} />
              <FieldNumber label="Average actual print royalty per sale ($)" value={inputs.averageActualPrintRoyaltyPerSale ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageActualPrintRoyaltyPerSale", v)} />
              <FieldNumber label="Other earned book income ($)" value={inputs.otherEarnedBookIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedBookIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Proof copies ($)" value={inputs.proofCopies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("proofCopies", v)} />
              <FieldNumber label="Direct-sale inventory / printing ($)" value={inputs.directSaleInventoryPrinting ?? 0} resetKey={fieldKey} onChange={(v) => setInput("directSaleInventoryPrinting", v)} />
              <FieldNumber label="Art supplies ($)" value={inputs.artSupplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("artSupplies", v)} />
              <FieldNumber label="Software / licensed assets ($)" value={inputs.softwareLicensedAssets ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareLicensedAssets", v)} />
              <FieldNumber label="Event / booth fees ($)" value={inputs.eventBoothFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("eventBoothFees", v)} />
              <FieldNumber label="Packaging / shipping ($)" value={inputs.packagingShipping ?? 0} resetKey={fieldKey} onChange={(v) => setInput("packagingShipping", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising / printing ($)" value={inputs.advertisingPrinting ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingPrinting", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Writing / revision" value={inputs.writingRevisionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("writingRevisionHours", v)} />
              <FieldNumber label="Illustration" value={inputs.illustrationHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("illustrationHours", v)} />
              <FieldNumber label="Layout / proofing" value={inputs.layoutProofingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("layoutProofingHours", v)} />
              <FieldNumber label="Publishing / marketing / sales / admin" value={inputs.publishingMarketingSalesAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("publishingMarketingSalesAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "kids-games-ai" ? (
            <>
              <FieldNumber
                label="Projects made"
                value={inputs.projectsMade ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("projectsMade", v)}
              />
              <FieldNumber
                label="Free projects"
                value={inputs.freeProjects ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("freeProjects", v)}
              />
              <FieldNumber
                label="Parent-managed paid projects"
                value={inputs.paidProjects ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paidProjects", v)}
              />
              <FieldNumber
                label="Average project price ($)"
                value={inputs.avgProjectPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("avgProjectPrice", v)}
              />
              <FieldNumber
                label="Optional supply / tool cost ($)"
                value={inputs.supplyToolCost ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("supplyToolCost", v)}
              />
              <FieldNumber
                label="Other parent-approved cost ($)"
                value={inputs.otherApprovedCost ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherApprovedCost", v)}
              />
              <p className="guide-revenue-calc__section-label">Optional money-learning split</p>
              <FieldNumber
                label="Save (%)"
                value={inputs.savePercent ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("savePercent", v)}
              />
              <FieldNumber
                label="Enjoy (%)"
                value={inputs.enjoyPercent ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("enjoyPercent", v)}
              />
              <FieldNumber
                label="Grow / reinvest (%)"
                value={inputs.growPercent ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("growPercent", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "beach-shell-jewelry" ? (
            <>
              <p className="guide-revenue-calc__section-label">Revenue</p>
              <FieldNumber
                label="Earring pairs sold"
                value={inputs.earringPairs ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("earringPairs", v)}
              />
              <FieldNumber
                label="Average earring price ($)"
                value={inputs.earringPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("earringPrice", v)}
              />
              <FieldNumber
                label="Bracelets sold"
                value={inputs.braceletsSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("braceletsSold", v)}
              />
              <FieldNumber
                label="Average bracelet price ($)"
                value={inputs.braceletPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("braceletPrice", v)}
              />
              <FieldNumber
                label="Necklaces sold"
                value={inputs.necklacesSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("necklacesSold", v)}
              />
              <FieldNumber
                label="Average necklace price ($)"
                value={inputs.necklacePrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("necklacePrice", v)}
              />
              <FieldNumber
                label="Sets / custom pieces sold"
                value={inputs.setsSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("setsSold", v)}
              />
              <FieldNumber
                label="Average set / custom price ($)"
                value={inputs.setPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("setPrice", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="Jewelry findings / materials ($)"
                value={inputs.findingsMaterials ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("findingsMaterials", v)}
              />
              <FieldNumber
                label="Packaging ($)"
                value={inputs.packaging ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("packaging", v)}
              />
              <FieldNumber
                label="Selling / platform fees ($)"
                value={inputs.sellingFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("sellingFees", v)}
              />
              <FieldNumber
                label="Shipping paid by seller ($)"
                value={inputs.shippingPaidBySeller ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("shippingPaidBySeller", v)}
              />
              <FieldNumber
                label="Advertising ($)"
                value={inputs.advertising ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advertising", v)}
              />
              <FieldNumber
                label="Booth / event fees ($)"
                value={inputs.boothFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("boothFees", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber
                label="Labor hours"
                value={inputs.laborHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("laborHours", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "gift-wrapping" ? (
            <>
              <p className="guide-revenue-calc__section-label">Revenue</p>
              <FieldNumber
                label="Small gifts wrapped"
                value={inputs.smallGifts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("smallGifts", v)}
              />
              <FieldNumber
                label="Average small-gift price ($)"
                value={inputs.smallGiftPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("smallGiftPrice", v)}
              />
              <FieldNumber
                label="Medium gifts wrapped"
                value={inputs.mediumGifts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("mediumGifts", v)}
              />
              <FieldNumber
                label="Average medium-gift price ($)"
                value={inputs.mediumGiftPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("mediumGiftPrice", v)}
              />
              <FieldNumber
                label="Large / specialty gifts wrapped"
                value={inputs.largeGifts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("largeGifts", v)}
              />
              <FieldNumber
                label="Average large / specialty price ($)"
                value={inputs.largeGiftPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("largeGiftPrice", v)}
              />
              <FieldNumber
                label="Holiday / event / multi-gift packages"
                value={inputs.packagesSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("packagesSold", v)}
              />
              <FieldNumber
                label="Average package price ($)"
                value={inputs.packagePrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("packagePrice", v)}
              />
              <FieldNumber
                label="Add-on revenue ($)"
                value={inputs.addOnRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("addOnRevenue", v)}
              />
              <FieldNumber
                label="Pickup / delivery revenue ($)"
                value={inputs.pickupDeliveryRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("pickupDeliveryRevenue", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="Wrapping paper ($)"
                value={inputs.wrappingPaper ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("wrappingPaper", v)}
              />
              <FieldNumber
                label="Ribbon / bows ($)"
                value={inputs.ribbonBows ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("ribbonBows", v)}
              />
              <FieldNumber
                label="Boxes / bags / tissue ($)"
                value={inputs.boxesBagsTissue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("boxesBagsTissue", v)}
              />
              <FieldNumber
                label="Tags / decorations ($)"
                value={inputs.tagsDecorations ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("tagsDecorations", v)}
              />
              <FieldNumber
                label="Travel ($)"
                value={inputs.travel ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("travel", v)}
              />
              <FieldNumber
                label="Payment fees ($)"
                value={inputs.paymentFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentFees", v)}
              />
              <FieldNumber
                label="Advertising ($)"
                value={inputs.advertising ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advertising", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
              <p className="guide-revenue-calc__section-label">Hours & jobs</p>
              <FieldNumber
                label="Labor hours"
                value={inputs.laborHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("laborHours", v)}
              />
              <FieldNumber
                label="Jobs / customers"
                value={inputs.jobsCompleted ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("jobsCompleted", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "affiliate" ? (
            <>
              <p className="guide-revenue-calc__section-label">Traffic funnel</p>
              <FieldNumber
                label="Monthly content views / visits"
                value={inputs.monthlyViews ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyViews", v)}
              />
              <FieldNumber
                label="Affiliate link click rate (%)"
                value={inputs.clickRatePercent ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("clickRatePercent", v)}
              />
              <FieldNumber
                label="Conversion rate (%)"
                value={inputs.conversionRatePercent ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("conversionRatePercent", v)}
              />
              <FieldNumber
                label="Average commission ($)"
                value={inputs.averageCommission ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageCommission", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="Website / hosting ($)"
                value={inputs.websiteHosting ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("websiteHosting", v)}
              />
              <FieldNumber
                label="Software ($)"
                value={inputs.software ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("software", v)}
              />
              <FieldNumber
                label="Content production ($)"
                value={inputs.contentProduction ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("contentProduction", v)}
              />
              <FieldNumber
                label="Advertising ($)"
                value={inputs.advertising ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advertising", v)}
              />
              <FieldNumber
                label="Contractors ($)"
                value={inputs.contractors ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("contractors", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "dropshipping" ? (
            <>
              <p className="guide-revenue-calc__section-label">Revenue</p>
              <FieldNumber
                label="Orders / month"
                value={inputs.dropshipOrders ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("dropshipOrders", v)}
              />
              <FieldNumber
                label="Average selling price ($)"
                value={inputs.averageSellingPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageSellingPrice", v)}
              />
              <p className="guide-revenue-calc__section-label">Cost per order</p>
              <FieldNumber
                label="Average product cost ($)"
                value={inputs.averageProductCost ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageProductCost", v)}
              />
              <FieldNumber
                label="Average supplier shipping ($)"
                value={inputs.averageSupplierShipping ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageSupplierShipping", v)}
              />
              <FieldNumber
                label="Payment / platform fees per order ($)"
                value={inputs.paymentPlatformFeesPerOrder ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentPlatformFeesPerOrder", v)}
              />
              <FieldNumber
                label="Average ad cost per order ($)"
                value={inputs.averageAdCostPerOrder ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageAdCostPerOrder", v)}
              />
              <FieldNumber
                label="Refund / chargeback cost per order ($)"
                value={inputs.refundChargebackCostPerOrder ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("refundChargebackCostPerOrder", v)}
              />
              <FieldNumber
                label="Other variable cost per order ($)"
                value={inputs.otherVariableCostPerOrder ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherVariableCostPerOrder", v)}
              />
              <p className="guide-revenue-calc__section-label">Monthly fixed</p>
              <FieldNumber
                label="Monthly store / app costs ($)"
                value={inputs.monthlyStoreAppCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyStoreAppCosts", v)}
              />
              <FieldNumber
                label="Other monthly expenses ($)"
                value={inputs.otherMonthlyExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherMonthlyExpenses", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "fb-marketplace-helper" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly service revenue (not client sale proceeds)</p>
              <FieldNumber
                label="Projects per month"
                value={inputs.fbMarketplaceProjects ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("fbMarketplaceProjects", v)}
              />
              <FieldNumber
                label="Average base project fee ($)"
                value={inputs.averageBaseProjectFee ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageBaseProjectFee", v)}
              />
              <FieldNumber
                label="Listing refresh income ($)"
                value={inputs.listingRefreshIncome ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("listingRefreshIncome", v)}
              />
              <FieldNumber
                label="Complex research income ($)"
                value={inputs.complexResearchIncome ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("complexResearchIncome", v)}
              />
              <FieldNumber
                label="Buyer-message / sale-support income ($)"
                value={inputs.buyerMessageSupportIncome ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("buyerMessageSupportIncome", v)}
              />
              <FieldNumber
                label="Rush / travel add-on income ($)"
                value={inputs.rushTravelAddOnIncome ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("rushTravelAddOnIncome", v)}
              />
              <FieldNumber
                label="Other earned service income ($)"
                value={inputs.otherEarnedServiceIncome ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherEarnedServiceIncome", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="Supplies ($)"
                value={inputs.supplies ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("supplies", v)}
              />
              <FieldNumber
                label="Mileage / transportation ($)"
                value={inputs.mileageTransportation ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("mileageTransportation", v)}
              />
              <FieldNumber
                label="Parking ($)"
                value={inputs.parking ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("parking", v)}
              />
              <FieldNumber
                label="Software / phone business use ($)"
                value={inputs.softwarePhone ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("softwarePhone", v)}
              />
              <FieldNumber
                label="Advertising / printing ($)"
                value={inputs.advertisingPrinting ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advertisingPrinting", v)}
              />
              <FieldNumber
                label="Payment fees ($)"
                value={inputs.paymentFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentFees", v)}
              />
              <FieldNumber
                label="Other business expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber
                label="Client session hours"
                value={inputs.clientSessionHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("clientSessionHours", v)}
              />
              <FieldNumber
                label="Travel hours"
                value={inputs.travelHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("travelHours", v)}
              />
              <FieldNumber
                label="Research / writing / posting hours"
                value={inputs.researchWritingPostingHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("researchWritingPostingHours", v)}
              />
              <FieldNumber
                label="Message / follow-up / admin hours"
                value={inputs.messageFollowUpAdminHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("messageFollowUpAdminHours", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "porch-package-helper" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly service revenue (not package value)</p>
              <FieldNumber label="Standard jobs per week" value={inputs.porchStandardJobsPerWeek ?? 0} resetKey={fieldKey} onChange={(v) => setInput("porchStandardJobsPerWeek", v)} />
              <FieldNumber label="Average standard job fee ($)" value={inputs.averageStandardJobFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageStandardJobFee", v)} />
              <FieldNumber label="Vacation / multi-visit package revenue ($)" value={inputs.vacationPackageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("vacationPackageRevenue", v)} />
              <FieldNumber label="Weather / rush add-on revenue ($)" value={inputs.weatherRushAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("weatherRushAddOnRevenue", v)} />
              <FieldNumber label="Tips / other earned service income ($)" value={inputs.tipsOtherEarnedIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("tipsOtherEarnedIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Mileage / transportation ($)" value={inputs.mileageTransportation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("mileageTransportation", v)} />
              <FieldNumber label="Parking / tolls ($)" value={inputs.parkingTolls ?? 0} resetKey={fieldKey} onChange={(v) => setInput("parkingTolls", v)} />
              <FieldNumber label="Phone / internet business use ($)" value={inputs.phoneInternet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternet", v)} />
              <FieldNumber label="Supplies / equipment ($)" value={inputs.supplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("supplies", v)} />
              <FieldNumber label="Advertising / printing ($)" value={inputs.advertisingPrinting ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingPrinting", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Insurance / licensing ($)" value={inputs.insuranceLicensing ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insuranceLicensing", v)} />
              <FieldNumber label="Other business expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Travel hours" value={inputs.travelHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelHours", v)} />
              <FieldNumber label="On-property service hours" value={inputs.serviceHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("serviceHours", v)} />
              <FieldNumber label="Waiting / return-trip hours" value={inputs.waitingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("waitingHours", v)} />
              <FieldNumber label="Scheduling / admin / marketing hours" value={inputs.adminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("adminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "travel-research-assistant" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly research-fee revenue (not client bookings)</p>
              <FieldNumber label="Quick comparison projects per week" value={inputs.travelQuickComparisonsPerWeek ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelQuickComparisonsPerWeek", v)} />
              <FieldNumber label="Average quick comparison fee ($)" value={inputs.averageQuickComparisonFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageQuickComparisonFee", v)} />
              <FieldNumber label="One-page brief projects per month" value={inputs.onePageBriefsPerMonth ?? 0} resetKey={fieldKey} onChange={(v) => setInput("onePageBriefsPerMonth", v)} />
              <FieldNumber label="Average one-page brief fee ($)" value={inputs.averageOnePageBriefFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageOnePageBriefFee", v)} />
              <FieldNumber label="Refresh / add-on revenue ($)" value={inputs.refreshAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("refreshAddOnRevenue", v)} />
              <FieldNumber label="Tips / other earned research income ($)" value={inputs.tipsOtherResearchIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("tipsOtherResearchIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Internet / phone business use ($)" value={inputs.internetPhone ?? 0} resetKey={fieldKey} onChange={(v) => setInput("internetPhone", v)} />
              <FieldNumber label="Software / cloud storage ($)" value={inputs.softwareStorage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareStorage", v)} />
              <FieldNumber label="Advertising / portfolio ($)" value={inputs.advertisingPortfolio ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingPortfolio", v)} />
              <FieldNumber label="Payment processing fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Business registration / insurance ($)" value={inputs.registrationInsurance ?? 0} resetKey={fieldKey} onChange={(v) => setInput("registrationInsurance", v)} />
              <FieldNumber label="Office supplies / equipment ($)" value={inputs.supplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("supplies", v)} />
              <FieldNumber label="Other business expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Client intake / quoting hours" value={inputs.intakeHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("intakeHours", v)} />
              <FieldNumber label="Research hours" value={inputs.researchHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("researchHours", v)} />
              <FieldNumber label="Brief creation / quality-check hours" value={inputs.briefHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("briefHours", v)} />
              <FieldNumber label="Revision hours" value={inputs.revisionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("revisionHours", v)} />
              <FieldNumber label="Marketing / admin hours" value={inputs.marketingAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "transcription-notes-helper" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly service revenue (do not double-count methods)</p>
              <FieldNumber label="Flat-fee projects per week" value={inputs.transcriptionFlatFeeProjectsPerWeek ?? 0} resetKey={fieldKey} onChange={(v) => setInput("transcriptionFlatFeeProjectsPerWeek", v)} />
              <FieldNumber label="Average flat-fee project price ($)" value={inputs.averageFlatFeeProjectPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageFlatFeeProjectPrice", v)} />
              <FieldNumber label="Per-audio-minute projects per month" value={inputs.perAudioMinuteProjectsPerMonth ?? 0} resetKey={fieldKey} onChange={(v) => setInput("perAudioMinuteProjectsPerMonth", v)} />
              <FieldNumber label="Average audio minutes per per-minute project" value={inputs.averageAudioMinutesPerPerMinuteProject ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageAudioMinutesPerPerMinuteProject", v)} />
              <FieldNumber label="Average rate per audio minute ($)" value={inputs.averageRatePerAudioMinute ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageRatePerAudioMinute", v)} />
              <FieldNumber label="Recurring package revenue per month ($)" value={inputs.recurringPackageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("recurringPackageRevenue", v)} />
              <FieldNumber label="Timestamp / rush / formatting add-ons ($)" value={inputs.timestampRushFormattingAddOns ?? 0} resetKey={fieldKey} onChange={(v) => setInput("timestampRushFormattingAddOns", v)} />
              <FieldNumber label="Tips / other earned service income ($)" value={inputs.tipsOtherEarnedServiceIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("tipsOtherEarnedServiceIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Internet / phone business use ($)" value={inputs.internetPhone ?? 0} resetKey={fieldKey} onChange={(v) => setInput("internetPhone", v)} />
              <FieldNumber label="Software / transcription tools ($)" value={inputs.softwareTools ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareTools", v)} />
              <FieldNumber label="Cloud storage / secure transfer ($)" value={inputs.cloudStorage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("cloudStorage", v)} />
              <FieldNumber label="Headphones / equipment allocation ($)" value={inputs.equipment ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipment", v)} />
              <FieldNumber label="Advertising / portfolio ($)" value={inputs.advertisingPortfolio ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingPortfolio", v)} />
              <FieldNumber label="Payment processing fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Business registration / insurance ($)" value={inputs.registrationInsurance ?? 0} resetKey={fieldKey} onChange={(v) => setInput("registrationInsurance", v)} />
              <FieldNumber label="Other business expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Client intake / quoting hours" value={inputs.intakeHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("intakeHours", v)} />
              <FieldNumber label="Listening / draft hours" value={inputs.listeningDraftHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("listeningDraftHours", v)} />
              <FieldNumber label="Editing / quality-check hours" value={inputs.editingQualityHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("editingQualityHours", v)} />
              <FieldNumber label="Revision hours" value={inputs.revisionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("revisionHours", v)} />
              <FieldNumber label="File handling / delivery hours" value={inputs.fileDeliveryHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("fileDeliveryHours", v)} />
              <FieldNumber label="Marketing / admin hours" value={inputs.marketingAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "website-tester" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly testing-fee revenue (not the client’s website sales)</p>
              <FieldNumber label="Quick checks per week" value={inputs.websiteTesterQuickChecksPerWeek ?? 0} resetKey={fieldKey} onChange={(v) => setInput("websiteTesterQuickChecksPerWeek", v)} />
              <FieldNumber label="Average quick-check fee ($)" value={inputs.averageQuickCheckFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageQuickCheckFee", v)} />
              <FieldNumber label="Expanded projects per month" value={inputs.expandedProjectsPerMonth ?? 0} resetKey={fieldKey} onChange={(v) => setInput("expandedProjectsPerMonth", v)} />
              <FieldNumber label="Average expanded-project fee ($)" value={inputs.averageExpandedProjectFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageExpandedProjectFee", v)} />
              <FieldNumber label="Retest revenue per month ($)" value={inputs.retestRevenuePerMonth ?? 0} resetKey={fieldKey} onChange={(v) => setInput("retestRevenuePerMonth", v)} />
              <FieldNumber label="Recurring package revenue per month ($)" value={inputs.recurringPackageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("recurringPackageRevenue", v)} />
              <FieldNumber label="Add-on / rush revenue per month ($)" value={inputs.addOnRushRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRushRevenue", v)} />
              <FieldNumber label="Tips / other earned service income ($)" value={inputs.tipsOtherEarnedServiceIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("tipsOtherEarnedServiceIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Internet / phone business use ($)" value={inputs.internetPhone ?? 0} resetKey={fieldKey} onChange={(v) => setInput("internetPhone", v)} />
              <FieldNumber label="Software / cloud storage ($)" value={inputs.softwareStorage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareStorage", v)} />
              <FieldNumber label="Device / equipment allocation ($)" value={inputs.equipment ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipment", v)} />
              <FieldNumber label="Advertising / portfolio ($)" value={inputs.advertisingPortfolio ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingPortfolio", v)} />
              <FieldNumber label="Payment processing fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Business registration / insurance ($)" value={inputs.registrationInsurance ?? 0} resetKey={fieldKey} onChange={(v) => setInput("registrationInsurance", v)} />
              <FieldNumber label="Other business expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Client intake / scoping hours" value={inputs.intakeHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("intakeHours", v)} />
              <FieldNumber label="Testing hours" value={inputs.testingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("testingHours", v)} />
              <FieldNumber label="Screenshot / report hours" value={inputs.screenshotReportHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("screenshotReportHours", v)} />
              <FieldNumber label="Retest hours" value={inputs.retestHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("retestHours", v)} />
              <FieldNumber label="Marketing / admin hours" value={inputs.marketingAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "community-newsletter-creator" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly newsletter revenue (not the client’s sponsorships, donations, or ticket sales)</p>
              <FieldNumber label="Newsletter issues per month" value={inputs.newsletterIssuesPerMonth ?? 0} resetKey={fieldKey} onChange={(v) => setInput("newsletterIssuesPerMonth", v)} />
              <FieldNumber label="Average fee per issue ($)" value={inputs.averageFeePerIssue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageFeePerIssue", v)} />
              <FieldNumber label="Template / setup revenue ($)" value={inputs.templateSetupRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("templateSetupRevenue", v)} />
              <FieldNumber label="Interview / research add-on revenue ($)" value={inputs.interviewResearchAddOns ?? 0} resetKey={fieldKey} onChange={(v) => setInput("interviewResearchAddOns", v)} />
              <FieldNumber label="Email build / distribution revenue ($)" value={inputs.emailDistributionRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("emailDistributionRevenue", v)} />
              <FieldNumber label="Print-ready / printing coordination revenue ($)" value={inputs.printReadyRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printReadyRevenue", v)} />
              <FieldNumber label="Sponsor / ad-placement service revenue ($)" value={inputs.sponsorAdServiceRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sponsorAdServiceRevenue", v)} />
              <FieldNumber label="Other earned newsletter income ($)" value={inputs.otherEarnedNewsletterIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedNewsletterIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Phone / internet business use ($)" value={inputs.phoneInternet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternet", v)} />
              <FieldNumber label="Writing / design / email software ($)" value={inputs.writingDesignEmailSoftware ?? 0} resetKey={fieldKey} onChange={(v) => setInput("writingDesignEmailSoftware", v)} />
              <FieldNumber label="Domain / website / storage ($)" value={inputs.domainWebsiteStorage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("domainWebsiteStorage", v)} />
              <FieldNumber label="Licensed images / fonts / assets ($)" value={inputs.licensedAssets ?? 0} resetKey={fieldKey} onChange={(v) => setInput("licensedAssets", v)} />
              <FieldNumber label="Printing / proofs / postage not reimbursed ($)" value={inputs.unreimbursedPrintingPostage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("unreimbursedPrintingPostage", v)} />
              <FieldNumber label="Payment processing fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising / networking ($)" value={inputs.advertisingNetworking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingNetworking", v)} />
              <FieldNumber label="Travel / parking ($)" value={inputs.travelParking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelParking", v)} />
              <FieldNumber label="Office / equipment allocation ($)" value={inputs.officeEquipment ?? 0} resetKey={fieldKey} onChange={(v) => setInput("officeEquipment", v)} />
              <FieldNumber label="Other business expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Content collection / client communication hours" value={inputs.contentCollectionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("contentCollectionHours", v)} />
              <FieldNumber label="Research / interviews / fact-checking hours" value={inputs.researchInterviewHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("researchInterviewHours", v)} />
              <FieldNumber label="Writing / editing hours" value={inputs.writingEditingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("writingEditingHours", v)} />
              <FieldNumber label="Design / formatting hours" value={inputs.designFormattingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("designFormattingHours", v)} />
              <FieldNumber label="Proofing / revisions hours" value={inputs.proofingRevisionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("proofingRevisionHours", v)} />
              <FieldNumber label="Email build / testing / distribution hours" value={inputs.emailDistributionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("emailDistributionHours", v)} />
              <FieldNumber label="Marketing / sales / admin hours" value={inputs.marketingAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "teaching" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly workshop revenue</p>
              <FieldNumber label="Sessions per month" value={inputs.workshopSessionsPerMonth ?? 0} resetKey={fieldKey} onChange={(v) => setInput("workshopSessionsPerMonth", v)} />
              <FieldNumber label="Average session fee ($)" value={inputs.averageSessionFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageSessionFee", v)} />
              <FieldNumber label="Per-participant revenue ($)" value={inputs.perParticipantRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("perParticipantRevenue", v)} />
              <FieldNumber label="Series / private group revenue ($)" value={inputs.seriesPrivateGroupRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("seriesPrivateGroupRevenue", v)} />
              <FieldNumber label="Workbook / materials revenue ($)" value={inputs.workbookMaterialsRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("workbookMaterialsRevenue", v)} />
              <FieldNumber label="Other earned workshop income ($)" value={inputs.otherEarnedWorkshopIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedWorkshopIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Materials / supplies ($)" value={inputs.materialsSupplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("materialsSupplies", v)} />
              <FieldNumber label="Printing ($)" value={inputs.printing ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printing", v)} />
              <FieldNumber label="Venue / platform fees ($)" value={inputs.venuePlatformFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("venuePlatformFees", v)} />
              <FieldNumber label="Insurance / permits / checks ($)" value={inputs.insurancePermitsChecks ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insurancePermitsChecks", v)} />
              <FieldNumber label="Travel / parking ($)" value={inputs.travelParking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelParking", v)} />
              <FieldNumber label="Software / equipment allocation ($)" value={inputs.softwareEquipment ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareEquipment", v)} />
              <FieldNumber label="Payment processing ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Curriculum / preparation hours" value={inputs.curriculumPrepHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("curriculumPrepHours", v)} />
              <FieldNumber label="Marketing / sales hours" value={inputs.marketingSalesHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingSalesHours", v)} />
              <FieldNumber label="Venue coordination hours" value={inputs.venueCoordinationHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("venueCoordinationHours", v)} />
              <FieldNumber label="Setup / cleanup hours" value={inputs.setupCleanupHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("setupCleanupHours", v)} />
              <FieldNumber label="Teaching hours" value={inputs.teachingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("teachingHours", v)} />
              <FieldNumber label="Travel hours" value={inputs.travelHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelHours", v)} />
              <FieldNumber label="Follow-up / admin hours" value={inputs.followUpAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("followUpAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "review-response-assistant" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly review-response revenue (never fake reviews or rating incentives)</p>
              <FieldNumber label="Routine reviews completed" value={inputs.reviewResponsesCompletedPerMonth ?? 0} resetKey={fieldKey} onChange={(v) => setInput("reviewResponsesCompletedPerMonth", v)} />
              <FieldNumber label="Average fee per review or batch allocation ($)" value={inputs.averageFeePerReviewOrBatch ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageFeePerReviewOrBatch", v)} />
              <FieldNumber label="Backlog project revenue ($)" value={inputs.backlogProjectRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("backlogProjectRevenue", v)} />
              <FieldNumber label="Tone / playbook setup revenue ($)" value={inputs.tonePlaybookSetupRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("tonePlaybookSetupRevenue", v)} />
              <FieldNumber label="Monthly retainer revenue ($)" value={inputs.monthlyRetainerRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("monthlyRetainerRevenue", v)} />
              <FieldNumber label="Other earned income ($)" value={inputs.otherEarnedIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Phone / internet ($)" value={inputs.phoneInternet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternet", v)} />
              <FieldNumber label="Software / storage ($)" value={inputs.softwareStorage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareStorage", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Professional services / insurance ($)" value={inputs.professionalServicesInsurance ?? 0} resetKey={fieldKey} onChange={(v) => setInput("professionalServicesInsurance", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Setup / onboarding hours" value={inputs.setupOnboardingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("setupOnboardingHours", v)} />
              <FieldNumber label="Review audit / research hours" value={inputs.reviewAuditHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("reviewAuditHours", v)} />
              <FieldNumber label="Drafting hours" value={inputs.draftingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("draftingHours", v)} />
              <FieldNumber label="Approval / revision hours" value={inputs.approvalRevisionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("approvalRevisionHours", v)} />
              <FieldNumber label="Publishing / reporting hours" value={inputs.publishingReportingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("publishingReportingHours", v)} />
              <FieldNumber label="Marketing / admin hours" value={inputs.marketingAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "consulting" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly consulting revenue (not the client’s salary increase or business results)</p>
              <FieldNumber label="Billable consulting hours per week" value={inputs.consultingBillableHoursPerWeek ?? 0} resetKey={fieldKey} onChange={(v) => setInput("consultingBillableHoursPerWeek", v)} />
              <FieldNumber label="Average hourly rate ($)" value={inputs.averageHourlyRate ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageHourlyRate", v)} />
              <FieldNumber label="Fixed-fee project revenue per month ($)" value={inputs.fixedFeeProjectRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("fixedFeeProjectRevenue", v)} />
              <FieldNumber label="Workshop revenue per month ($)" value={inputs.workshopRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("workshopRevenue", v)} />
              <FieldNumber label="Retainer revenue per month ($)" value={inputs.retainerRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("retainerRevenue", v)} />
              <FieldNumber label="Approved expense reimbursements ($)" value={inputs.approvedExpenseReimbursements ?? 0} resetKey={fieldKey} onChange={(v) => setInput("approvedExpenseReimbursements", v)} />
              <FieldNumber label="Other earned consulting income ($)" value={inputs.otherEarnedConsultingIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedConsultingIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Phone / internet business use ($)" value={inputs.phoneInternet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternet", v)} />
              <FieldNumber label="Scheduling / video / software ($)" value={inputs.schedulingVideoSoftware ?? 0} resetKey={fieldKey} onChange={(v) => setInput("schedulingVideoSoftware", v)} />
              <FieldNumber label="Insurance ($)" value={inputs.insurance ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insurance", v)} />
              <FieldNumber label="Legal / accounting / professional fees ($)" value={inputs.legalAccountingFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("legalAccountingFees", v)} />
              <FieldNumber label="Continuing education / memberships ($)" value={inputs.continuingEducation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("continuingEducation", v)} />
              <FieldNumber label="Advertising / networking ($)" value={inputs.advertisingNetworking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingNetworking", v)} />
              <FieldNumber label="Travel / parking / meals not reimbursed ($)" value={inputs.unreimbursedTravel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("unreimbursedTravel", v)} />
              <FieldNumber label="Payment processing fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Office / equipment allocation ($)" value={inputs.officeEquipment ?? 0} resetKey={fieldKey} onChange={(v) => setInput("officeEquipment", v)} />
              <FieldNumber label="Other business expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Billable delivery hours" value={inputs.billableDeliveryHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("billableDeliveryHours", v)} />
              <FieldNumber label="Preparation / research hours" value={inputs.preparationResearchHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("preparationResearchHours", v)} />
              <FieldNumber label="Proposal / sales hours" value={inputs.proposalSalesHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("proposalSalesHours", v)} />
              <FieldNumber label="Written deliverable hours" value={inputs.writtenDeliverableHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("writtenDeliverableHours", v)} />
              <FieldNumber label="Follow-up / revision hours" value={inputs.followUpRevisionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("followUpRevisionHours", v)} />
              <FieldNumber label="Travel hours" value={inputs.travelHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelHours", v)} />
              <FieldNumber label="Marketing / admin hours" value={inputs.marketingAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "notary" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly notary revenue (lawful notarial fees plus disclosed travel / contracted signing / authorized remote only)</p>
              <FieldNumber label="Appointments per month" value={inputs.notaryAppointmentsPerMonth ?? 0} resetKey={fieldKey} onChange={(v) => setInput("notaryAppointmentsPerMonth", v)} />
              <FieldNumber label="Average lawful notarial fees per appointment ($)" value={inputs.averageLawfulNotarialFeesPerAppointment ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageLawfulNotarialFeesPerAppointment", v)} />
              <FieldNumber label="Permitted travel / convenience fees ($)" value={inputs.permittedTravelConvenienceFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("permittedTravelConvenienceFees", v)} />
              <FieldNumber label="Contracted non-notarial signing-service revenue ($)" value={inputs.contractedSigningServiceRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("contractedSigningServiceRevenue", v)} />
              <FieldNumber label="Authorized remote / electronic revenue ($)" value={inputs.authorizedRemoteElectronicRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("authorizedRemoteElectronicRevenue", v)} />
              <FieldNumber label="Other lawful earned income ($)" value={inputs.otherLawfulEarnedIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherLawfulEarnedIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Commission / renewal allocation ($)" value={inputs.commissionRenewalAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("commissionRenewalAllocation", v)} />
              <FieldNumber label="Bond / insurance allocation ($)" value={inputs.bondInsuranceAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("bondInsuranceAllocation", v)} />
              <FieldNumber label="Seal / journal / certificates ($)" value={inputs.sealJournalCertificates ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sealJournalCertificates", v)} />
              <FieldNumber label="Training / background screening ($)" value={inputs.trainingBackgroundScreening ?? 0} resetKey={fieldKey} onChange={(v) => setInput("trainingBackgroundScreening", v)} />
              <FieldNumber label="Remote platform / technology ($)" value={inputs.remotePlatformTechnology ?? 0} resetKey={fieldKey} onChange={(v) => setInput("remotePlatformTechnology", v)} />
              <FieldNumber label="Printing / scanning / shipping ($)" value={inputs.printingScanningShipping ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printingScanningShipping", v)} />
              <FieldNumber label="Mileage / parking / tolls ($)" value={inputs.mileageParkingTolls ?? 0} resetKey={fieldKey} onChange={(v) => setInput("mileageParkingTolls", v)} />
              <FieldNumber label="Phone / internet ($)" value={inputs.phoneInternet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternet", v)} />
              <FieldNumber label="Payment fees / advertising ($)" value={inputs.paymentFeesAdvertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFeesAdvertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Appointments" value={inputs.appointmentHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("appointmentHours", v)} />
              <FieldNumber label="Travel / waiting" value={inputs.travelWaitingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelWaitingHours", v)} />
              <FieldNumber label="Printing / preparation" value={inputs.printingPreparationHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printingPreparationHours", v)} />
              <FieldNumber label="Records / shipping" value={inputs.recordsShippingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("recordsShippingHours", v)} />
              <FieldNumber label="Marketing / admin / training" value={inputs.marketingAdminTrainingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminTrainingHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "resume-linkedin-helper" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly résumé / LinkedIn revenue (not the client’s job or salary outcome)</p>
              <FieldNumber label="Small projects completed" value={inputs.resumeSmallProjectsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("resumeSmallProjectsCompleted", v)} />
              <FieldNumber label="Average small project fee ($)" value={inputs.averageSmallProjectFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageSmallProjectFee", v)} />
              <FieldNumber label="Resume rewrite revenue ($)" value={inputs.resumeRewriteRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("resumeRewriteRevenue", v)} />
              <FieldNumber label="Resume + LinkedIn package revenue ($)" value={inputs.resumeLinkedInPackageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("resumeLinkedInPackageRevenue", v)} />
              <FieldNumber label="Add-on revenue ($)" value={inputs.addOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRevenue", v)} />
              <FieldNumber label="Other earned income ($)" value={inputs.otherEarnedIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Phone / internet ($)" value={inputs.phoneInternet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternet", v)} />
              <FieldNumber label="Writing / PDF / storage software ($)" value={inputs.writingPdfStorageSoftware ?? 0} resetKey={fieldKey} onChange={(v) => setInput("writingPdfStorageSoftware", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising / networking ($)" value={inputs.advertisingNetworking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingNetworking", v)} />
              <FieldNumber label="Training / professional services ($)" value={inputs.trainingProfessionalServices ?? 0} resetKey={fieldKey} onChange={(v) => setInput("trainingProfessionalServices", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Sales / intake" value={inputs.salesIntakeHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("salesIntakeHours", v)} />
              <FieldNumber label="Client interviews" value={inputs.clientInterviewHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("clientInterviewHours", v)} />
              <FieldNumber label="Research / targeting" value={inputs.researchTargetingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("researchTargetingHours", v)} />
              <FieldNumber label="Writing / formatting" value={inputs.writingFormattingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("writingFormattingHours", v)} />
              <FieldNumber label="Revisions / fact check" value={inputs.revisionsFactCheckHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("revisionsFactCheckHours", v)} />
              <FieldNumber label="Delivery / admin" value={inputs.deliveryAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("deliveryAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "short-form-video-editor" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly editing revenue (not the client’s views, followers, or sales)</p>
              <FieldNumber label="Clips completed" value={inputs.shortFormClipsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("shortFormClipsCompleted", v)} />
              <FieldNumber label="Average fee per clip ($)" value={inputs.averageFeePerClip ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageFeePerClip", v)} />
              <FieldNumber label="Batch / retainer revenue ($)" value={inputs.batchRetainerRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("batchRetainerRevenue", v)} />
              <FieldNumber label="Caption / graphics / add-on revenue ($)" value={inputs.captionGraphicsAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("captionGraphicsAddOnRevenue", v)} />
              <FieldNumber label="Rush / extra version revenue ($)" value={inputs.rushExtraVersionRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("rushExtraVersionRevenue", v)} />
              <FieldNumber label="Other earned income ($)" value={inputs.otherEarnedIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Editing software ($)" value={inputs.editingSoftware ?? 0} resetKey={fieldKey} onChange={(v) => setInput("editingSoftware", v)} />
              <FieldNumber label="Storage / transfer ($)" value={inputs.storageTransfer ?? 0} resetKey={fieldKey} onChange={(v) => setInput("storageTransfer", v)} />
              <FieldNumber label="Licensed music / stock / fonts ($)" value={inputs.licensedMusicStockFonts ?? 0} resetKey={fieldKey} onChange={(v) => setInput("licensedMusicStockFonts", v)} />
              <FieldNumber label="Equipment allocation ($)" value={inputs.equipmentAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipmentAllocation", v)} />
              <FieldNumber label="Phone / internet ($)" value={inputs.phoneInternet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternet", v)} />
              <FieldNumber label="Payment fees / advertising ($)" value={inputs.paymentFeesAdvertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFeesAdvertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Sales / intake" value={inputs.salesIntakeHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("salesIntakeHours", v)} />
              <FieldNumber label="Source review" value={inputs.sourceReviewHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sourceReviewHours", v)} />
              <FieldNumber label="Editing" value={inputs.editingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("editingHours", v)} />
              <FieldNumber label="Captions / graphics / audio" value={inputs.captionsGraphicsAudioHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("captionsGraphicsAudioHours", v)} />
              <FieldNumber label="Revisions / exports" value={inputs.revisionsExportsHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("revisionsExportsHours", v)} />
              <FieldNumber label="Delivery / admin" value={inputs.deliveryAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("deliveryAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "google-business-helper" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly Google Business Profile revenue (never fake profiles or ranking promises)</p>
              <FieldNumber label="Small projects completed" value={inputs.gbpSmallProjectsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("gbpSmallProjectsCompleted", v)} />
              <FieldNumber label="Average small project fee ($)" value={inputs.averageSmallProjectFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageSmallProjectFee", v)} />
              <FieldNumber label="Setup / cleanup revenue ($)" value={inputs.setupCleanupRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("setupCleanupRevenue", v)} />
              <FieldNumber label="Monthly maintenance revenue ($)" value={inputs.monthlyMaintenanceRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("monthlyMaintenanceRevenue", v)} />
              <FieldNumber label="Photo / post / add-on revenue ($)" value={inputs.photoPostAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("photoPostAddOnRevenue", v)} />
              <FieldNumber label="Other earned income ($)" value={inputs.otherEarnedIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Phone / internet ($)" value={inputs.phoneInternet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternet", v)} />
              <FieldNumber label="Software / storage ($)" value={inputs.softwareStorage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareStorage", v)} />
              <FieldNumber label="Travel / parking ($)" value={inputs.travelParking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelParking", v)} />
              <FieldNumber label="Equipment allocation ($)" value={inputs.equipmentAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipmentAllocation", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising / networking ($)" value={inputs.advertisingNetworking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingNetworking", v)} />
              <FieldNumber label="Insurance / professional services ($)" value={inputs.insuranceProfessionalServices ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insuranceProfessionalServices", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Sales / intake" value={inputs.salesIntakeHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("salesIntakeHours", v)} />
              <FieldNumber label="Eligibility / ownership research" value={inputs.eligibilityOwnershipResearchHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("eligibilityOwnershipResearchHours", v)} />
              <FieldNumber label="Audit / preparation" value={inputs.auditPreparationHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("auditPreparationHours", v)} />
              <FieldNumber label="Editing / content" value={inputs.editingContentHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("editingContentHours", v)} />
              <FieldNumber label="Approval / revisions" value={inputs.approvalRevisionHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("approvalRevisionHours", v)} />
              <FieldNumber label="Handoff / reporting" value={inputs.handoffReportingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("handoffReportingHours", v)} />
              <FieldNumber label="Marketing / admin" value={inputs.marketingAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "ugc-creator" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly UGC revenue (not the brand’s views, followers, or sales)</p>
              <FieldNumber label="UGC videos delivered" value={inputs.ugcVideosDelivered ?? 0} resetKey={fieldKey} onChange={(v) => setInput("ugcVideosDelivered", v)} />
              <FieldNumber label="Average production fee ($)" value={inputs.averageProductionFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageProductionFee", v)} />
              <FieldNumber label="Usage rights revenue ($)" value={inputs.usageRightsRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("usageRightsRevenue", v)} />
              <FieldNumber label="Raw footage add-on revenue ($)" value={inputs.rawFootageAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("rawFootageAddOnRevenue", v)} />
              <FieldNumber label="Whitelisting / exclusivity revenue ($)" value={inputs.whitelistingExclusivityRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("whitelistingExclusivityRevenue", v)} />
              <FieldNumber label="Other earned income ($)" value={inputs.otherEarnedIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Products / props not reimbursed ($)" value={inputs.productsPropsNotReimbursed ?? 0} resetKey={fieldKey} onChange={(v) => setInput("productsPropsNotReimbursed", v)} />
              <FieldNumber label="Equipment / software / assets ($)" value={inputs.equipmentSoftwareAssets ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipmentSoftwareAssets", v)} />
              <FieldNumber label="Shipping / travel ($)" value={inputs.shippingTravel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("shippingTravel", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Insurance / professional services ($)" value={inputs.insuranceProfessionalServices ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insuranceProfessionalServices", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Sales / briefs" value={inputs.salesBriefsHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("salesBriefsHours", v)} />
              <FieldNumber label="Concept / script" value={inputs.conceptScriptHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("conceptScriptHours", v)} />
              <FieldNumber label="Filming" value={inputs.filmingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("filmingHours", v)} />
              <FieldNumber label="Editing" value={inputs.editingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("editingHours", v)} />
              <FieldNumber label="Revisions / delivery / admin" value={inputs.revisionsDeliveryAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("revisionsDeliveryAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "virtual-assistant" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly VA revenue (collected only — not unsigned proposals)</p>
              <FieldNumber label="Starter tasks completed" value={inputs.vaStarterTasksCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("vaStarterTasksCompleted", v)} />
              <FieldNumber label="Average starter task fee ($)" value={inputs.averageStarterTaskFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageStarterTaskFee", v)} />
              <FieldNumber label="Retainer revenue collected ($)" value={inputs.retainerRevenueCollected ?? 0} resetKey={fieldKey} onChange={(v) => setInput("retainerRevenueCollected", v)} />
              <FieldNumber label="Special project revenue collected ($)" value={inputs.specialProjectRevenueCollected ?? 0} resetKey={fieldKey} onChange={(v) => setInput("specialProjectRevenueCollected", v)} />
              <FieldNumber label="Approved add-on revenue ($)" value={inputs.approvedAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("approvedAddOnRevenue", v)} />
              <FieldNumber label="Other earned revenue ($)" value={inputs.otherEarnedRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Software subscriptions ($)" value={inputs.softwareSubscriptions ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareSubscriptions", v)} />
              <FieldNumber label="Equipment / internet allocation ($)" value={inputs.equipmentInternetAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipmentInternetAllocation", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Training / insurance / professional services ($)" value={inputs.trainingInsuranceProfessionalServices ?? 0} resetKey={fieldKey} onChange={(v) => setInput("trainingInsuranceProfessionalServices", v)} />
              <FieldNumber label="Approved costs not reimbursed ($)" value={inputs.approvedCostsNotReimbursed ?? 0} resetKey={fieldKey} onChange={(v) => setInput("approvedCostsNotReimbursed", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Task work" value={inputs.taskWorkHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("taskWorkHours", v)} />
              <FieldNumber label="Meetings / messages / admin" value={inputs.meetingsMessagesAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("meetingsMessagesAdminHours", v)} />
              <FieldNumber label="Marketing / sales" value={inputs.marketingSalesHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingSalesHours", v)} />
              <FieldNumber label="Revision / rework" value={inputs.revisionReworkHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("revisionReworkHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "virtual-receptionist" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly receptionist revenue (reserved coverage hours count)</p>
              <FieldNumber label="Coverage blocks completed" value={inputs.vrCoverageBlocksCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("vrCoverageBlocksCompleted", v)} />
              <FieldNumber label="Average fee per block ($)" value={inputs.averageFeePerBlock ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageFeePerBlock", v)} />
              <FieldNumber label="Monthly retainer revenue collected ($)" value={inputs.monthlyRetainerRevenueCollected ?? 0} resetKey={fieldKey} onChange={(v) => setInput("monthlyRetainerRevenueCollected", v)} />
              <FieldNumber label="Overage / after-hours revenue ($)" value={inputs.overageAfterHoursRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("overageAfterHoursRevenue", v)} />
              <FieldNumber label="Setup / reporting add-on revenue ($)" value={inputs.setupReportingAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("setupReportingAddOnRevenue", v)} />
              <FieldNumber label="Other earned revenue ($)" value={inputs.otherEarnedRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherEarnedRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Phone / VoIP / CRM software ($)" value={inputs.phoneVoipCrmSoftware ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneVoipCrmSoftware", v)} />
              <FieldNumber label="Equipment / internet allocation ($)" value={inputs.equipmentInternetAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipmentInternetAllocation", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Training / insurance / professional services ($)" value={inputs.trainingInsuranceProfessionalServices ?? 0} resetKey={fieldKey} onChange={(v) => setInput("trainingInsuranceProfessionalServices", v)} />
              <FieldNumber label="Backup coverage / subcontractors ($)" value={inputs.backupCoverageSubcontractors ?? 0} resetKey={fieldKey} onChange={(v) => setInput("backupCoverageSubcontractors", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Reserved coverage hours" value={inputs.reservedCoverageHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("reservedCoverageHours", v)} />
              <FieldNumber label="Setup / training / reporting" value={inputs.setupTrainingReportingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("setupTrainingReportingHours", v)} />
              <FieldNumber label="Marketing / admin" value={inputs.marketingAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingAdminHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "social" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly creator revenue (collected only — followers are not revenue)</p>
              <FieldNumber label="Sponsored campaign revenue ($)" value={inputs.sponsoredCampaignRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sponsoredCampaignRevenue", v)} />
              <FieldNumber label="Affiliate commissions collected ($)" value={inputs.affiliateCommissionsCollected ?? 0} resetKey={fieldKey} onChange={(v) => setInput("affiliateCommissionsCollected", v)} />
              <FieldNumber label="Platform monetization collected ($)" value={inputs.platformMonetizationCollected ?? 0} resetKey={fieldKey} onChange={(v) => setInput("platformMonetizationCollected", v)} />
              <FieldNumber label="Product gross revenue ($)" value={inputs.productGrossRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("productGrossRevenue", v)} />
              <FieldNumber label="Service / subscription revenue ($)" value={inputs.serviceSubscriptionRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("serviceSubscriptionRevenue", v)} />
              <FieldNumber label="Licensing / other earned income ($)" value={inputs.licensingOtherEarnedIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("licensingOtherEarnedIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Product cost / fulfillment / refunds ($)" value={inputs.productCostFulfillmentRefunds ?? 0} resetKey={fieldKey} onChange={(v) => setInput("productCostFulfillmentRefunds", v)} />
              <FieldNumber label="Platform / payment / affiliate reversals ($)" value={inputs.platformPaymentAffiliateReversals ?? 0} resetKey={fieldKey} onChange={(v) => setInput("platformPaymentAffiliateReversals", v)} />
              <FieldNumber label="Equipment / software / assets ($)" value={inputs.equipmentSoftwareAssets ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipmentSoftwareAssets", v)} />
              <FieldNumber label="Contractors ($)" value={inputs.contractors ?? 0} resetKey={fieldKey} onChange={(v) => setInput("contractors", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Travel / props / samples ($)" value={inputs.travelPropsSamples ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelPropsSamples", v)} />
              <FieldNumber label="Insurance / legal / accounting ($)" value={inputs.insuranceLegalAccounting ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insuranceLegalAccounting", v)} />
              <FieldNumber label="Phone / internet / website ($)" value={inputs.phoneInternetWebsite ?? 0} resetKey={fieldKey} onChange={(v) => setInput("phoneInternetWebsite", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Planning / research" value={inputs.planningResearchHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("planningResearchHours", v)} />
              <FieldNumber label="Production / editing" value={inputs.productionEditingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("productionEditingHours", v)} />
              <FieldNumber label="Publishing / community" value={inputs.publishingCommunityHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("publishingCommunityHours", v)} />
              <FieldNumber label="Brand / sales / negotiation" value={inputs.brandSalesNegotiationHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("brandSalesNegotiationHours", v)} />
              <FieldNumber label="Reporting / admin / support" value={inputs.reportingAdminSupportHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("reportingAdminSupportHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "online-community-moderator" ? (
            <>
              <p className="guide-revenue-calc__section-label">Monthly service revenue</p>
              <FieldNumber label="Small projects per month" value={inputs.moderatorSmallProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("moderatorSmallProjects", v)} />
              <FieldNumber label="Average project fee ($)" value={inputs.averageProjectFee ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageProjectFee", v)} />
              <FieldNumber label="Recurring moderation hours per month" value={inputs.recurringHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("recurringHours", v)} />
              <FieldNumber label="Average hourly rate ($)" value={inputs.averageHourlyRate ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageHourlyRate", v)} />
              <FieldNumber label="Live event / after-hours income ($)" value={inputs.liveEventIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("liveEventIncome", v)} />
              <FieldNumber label="Audit / setup income ($)" value={inputs.auditSetupIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("auditSetupIncome", v)} />
              <FieldNumber label="Other approved service income ($)" value={inputs.otherApprovedServiceIncome ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherApprovedServiceIncome", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Internet / phone business use ($)" value={inputs.internetPhone ?? 0} resetKey={fieldKey} onChange={(v) => setInput("internetPhone", v)} />
              <FieldNumber label="Software / security tools ($)" value={inputs.softwareSecurity ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareSecurity", v)} />
              <FieldNumber label="Computer / equipment allocation ($)" value={inputs.equipment ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipment", v)} />
              <FieldNumber label="Advertising / platform fees ($)" value={inputs.advertisingPlatformFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertisingPlatformFees", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Training ($)" value={inputs.training ?? 0} resetKey={fieldKey} onChange={(v) => setInput("training", v)} />
              <FieldNumber label="Other business expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber label="Moderation coverage hours" value={inputs.moderationHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("moderationHours", v)} />
              <FieldNumber label="Setup / audit hours" value={inputs.setupAuditHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("setupAuditHours", v)} />
              <FieldNumber label="Reports / meetings / admin hours" value={inputs.reportsAdminHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("reportsAdminHours", v)} />
              <FieldNumber label="Marketing hours" value={inputs.marketingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("marketingHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "basic-invitation-creator" ? (
            <>
              <p className="guide-revenue-calc__section-label">Service revenue</p>
              <FieldNumber
                label="Template invitations"
                value={inputs.templateInvites ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("templateInvites", v)}
              />
              <FieldNumber
                label="Average template price ($)"
                value={inputs.templatePrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("templatePrice", v)}
              />
              <FieldNumber
                label="Custom designs"
                value={inputs.customDesigns ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("customDesigns", v)}
              />
              <FieldNumber
                label="Average custom design price ($)"
                value={inputs.customPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("customPrice", v)}
              />
              <FieldNumber
                label="Add-on revenue ($)"
                value={inputs.addOnRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("addOnRevenue", v)}
              />
              <FieldNumber
                label="Rush fees ($)"
                value={inputs.rushFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("rushFees", v)}
              />
              <FieldNumber
                label="Extra revision revenue ($)"
                value={inputs.extraRevisionRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("extraRevisionRevenue", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="Paid graphics / assets / fonts ($)"
                value={inputs.paidAssets ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paidAssets", v)}
              />
              <FieldNumber
                label="Software allocation ($)"
                value={inputs.software ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("software", v)}
              />
              <FieldNumber
                label="Payment processing ($)"
                value={inputs.paymentProcessing ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentProcessing", v)}
              />
              <FieldNumber
                label="Advertising ($)"
                value={inputs.advertising ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advertising", v)}
              />
              <FieldNumber
                label="Test printing ($)"
                value={inputs.testPrinting ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("testPrinting", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
              <p className="guide-revenue-calc__section-label">Hours & projects</p>
              <FieldNumber
                label="Labor hours"
                value={inputs.laborHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("laborHours", v)}
              />
              <FieldNumber
                label="Projects completed"
                value={inputs.projectsCompleted ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("projectsCompleted", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "pod" ? (
            <>
              <p className="guide-revenue-calc__section-label">Product A (main SKU)</p>
              <FieldNumber
                label="Units sold"
                value={inputs.podUnitsSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("podUnitsSold", v)}
              />
              <FieldNumber
                label="Average selling price ($)"
                value={inputs.averageSellingPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageSellingPrice", v)}
              />
              <FieldNumber
                label="POD production / base cost per unit ($)"
                value={inputs.productionCostPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("productionCostPerUnit", v)}
              />
              <FieldNumber
                label="Shipping paid by seller per unit ($)"
                value={inputs.shippingPaidBySellerPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("shippingPaidBySellerPerUnit", v)}
              />
              <FieldNumber
                label="Marketplace / store / payment fees per unit ($)"
                value={inputs.feesPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("feesPerUnit", v)}
              />
              <FieldNumber
                label="Advertising cost per unit ($)"
                value={inputs.advertisingPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advertisingPerUnit", v)}
              />
              <p className="guide-revenue-calc__section-label">Product B (optional comparison)</p>
              <FieldNumber
                label="Second product units sold"
                value={inputs.secondProductUnits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("secondProductUnits", v)}
              />
              <FieldNumber
                label="Second product selling price ($)"
                value={inputs.secondProductPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("secondProductPrice", v)}
              />
              <FieldNumber
                label="Second product cost per unit ($)"
                value={inputs.secondProductCostPerUnit ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("secondProductCostPerUnit", v)}
              />
              <p className="guide-revenue-calc__section-label">Other costs</p>
              <FieldNumber
                label="Discounts ($)"
                value={inputs.discounts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("discounts", v)}
              />
              <FieldNumber
                label="Refunds / replacements ($)"
                value={inputs.refundsReplacements ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("refundsReplacements", v)}
              />
              <FieldNumber
                label="Software / apps ($)"
                value={inputs.softwareApps ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("softwareApps", v)}
              />
              <FieldNumber
                label="Sample costs allocated ($)"
                value={inputs.sampleCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("sampleCosts", v)}
              />
              <FieldNumber
                label="Other operating expenses ($)"
                value={inputs.otherOperatingExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherOperatingExpenses", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "pet-sitting" ? (
            <>
              <p className="guide-revenue-calc__section-label">Service revenue</p>
              <FieldNumber
                label="Dog walks"
                value={inputs.dogWalkVisits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("dogWalkVisits", v)}
              />
              <FieldNumber
                label="Average walk price ($)"
                value={inputs.walkPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("walkPrice", v)}
              />
              <FieldNumber
                label="Drop-in visits"
                value={inputs.dropInVisits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("dropInVisits", v)}
              />
              <FieldNumber
                label="Average drop-in price ($)"
                value={inputs.dropInPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("dropInPrice", v)}
              />
              <FieldNumber
                label="Overnight nights"
                value={inputs.overnightNights ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("overnightNights", v)}
              />
              <FieldNumber
                label="Average overnight price ($)"
                value={inputs.overnightPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("overnightPrice", v)}
              />
              <FieldNumber
                label="Add-on revenue ($)"
                value={inputs.addOnRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("addOnRevenue", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="Mileage / travel ($)"
                value={inputs.mileageTravel ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("mileageTravel", v)}
              />
              <FieldNumber
                label="Supplies ($)"
                value={inputs.supplies ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("supplies", v)}
              />
              <FieldNumber
                label="Payment / platform fees ($)"
                value={inputs.paymentPlatformFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentPlatformFees", v)}
              />
              <FieldNumber
                label="Insurance allocation ($)"
                value={inputs.insuranceAllocation ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("insuranceAllocation", v)}
              />
              <FieldNumber
                label="Advertising ($)"
                value={inputs.advertising ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advertising", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
              <p className="guide-revenue-calc__section-label">Hours & volume</p>
              <FieldNumber
                label="Labor hours"
                value={inputs.laborHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("laborHours", v)}
              />
              <FieldNumber
                label="Total visits"
                value={inputs.totalVisits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("totalVisits", v)}
              />
              <FieldNumber
                label="Clients served"
                value={inputs.clientsServed ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("clientsServed", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "friendship-bracelet-maker" ? (
            <>
              <p className="guide-revenue-calc__section-label">Sales (gifted = $0)</p>
              <FieldNumber label="Simple bracelets sold" value={inputs.friendshipBraceletsSimple ?? 0} resetKey={fieldKey} onChange={(v) => setInput("friendshipBraceletsSimple", v)} />
              <FieldNumber label="Simple price ($)" value={inputs.simplePrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("simplePrice", v)} />
              <FieldNumber label="Pattern bracelets sold" value={inputs.patternCount ?? 0} resetKey={fieldKey} onChange={(v) => setInput("patternCount", v)} />
              <FieldNumber label="Pattern price ($)" value={inputs.patternPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("patternPrice", v)} />
              <FieldNumber label="Personalized bracelets sold" value={inputs.personalizedCount ?? 0} resetKey={fieldKey} onChange={(v) => setInput("personalizedCount", v)} />
              <FieldNumber label="Personalized price ($)" value={inputs.personalizedPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("personalizedPrice", v)} />
              <FieldNumber label="Sets sold" value={inputs.setCount ?? 0} resetKey={fieldKey} onChange={(v) => setInput("setCount", v)} />
              <FieldNumber label="Set price ($)" value={inputs.setPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("setPrice", v)} />
              <FieldNumber label="Custom order revenue ($)" value={inputs.customOrderRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("customOrderRevenue", v)} />
              <FieldNumber label="Bracelets gifted (not revenue)" value={inputs.braceletsGifted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("braceletsGifted", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Thread / cord ($)" value={inputs.threadCord ?? 0} resetKey={fieldKey} onChange={(v) => setInput("threadCord", v)} />
              <FieldNumber label="Beads / findings ($)" value={inputs.beadsFindings ?? 0} resetKey={fieldKey} onChange={(v) => setInput("beadsFindings", v)} />
              <FieldNumber label="Packaging ($)" value={inputs.packaging ?? 0} resetKey={fieldKey} onChange={(v) => setInput("packaging", v)} />
              <FieldNumber label="Display / event ($)" value={inputs.displayEvent ?? 0} resetKey={fieldKey} onChange={(v) => setInput("displayEvent", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Shipping / postage ($)" value={inputs.shippingPostage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("shippingPostage", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Bracelets sold (count)" value={inputs.braceletsSold ?? 0} resetKey={fieldKey} onChange={(v) => setInput("braceletsSold", v)} />
            </>
          ) : profile.mode === "service" && guideId === "leaf-raking" ? (
            <>
              <p className="guide-revenue-calc__section-label">Jobs</p>
              <FieldNumber label="Small jobs" value={inputs.leafBlowingSmallJobs ?? 0} resetKey={fieldKey} onChange={(v) => setInput("leafBlowingSmallJobs", v)} />
              <FieldNumber label="Small job price ($)" value={inputs.smallJobPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("smallJobPrice", v)} />
              <FieldNumber label="Standard jobs" value={inputs.standardJobs ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardJobs", v)} />
              <FieldNumber label="Standard job price ($)" value={inputs.standardJobPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardJobPrice", v)} />
              <FieldNumber label="Large jobs" value={inputs.largeJobs ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largeJobs", v)} />
              <FieldNumber label="Large job price ($)" value={inputs.largeJobPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largeJobPrice", v)} />
              <FieldNumber label="Bagging revenue ($)" value={inputs.baggingRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("baggingRevenue", v)} />
              <FieldNumber label="Removal revenue ($)" value={inputs.removalRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("removalRevenue", v)} />
              <FieldNumber label="Recurring revenue ($)" value={inputs.recurringRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("recurringRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Fuel / charging ($)" value={inputs.fuelCharging ?? 0} resetKey={fieldKey} onChange={(v) => setInput("fuelCharging", v)} />
              <FieldNumber label="Bags / consumables ($)" value={inputs.bagsConsumables ?? 0} resetKey={fieldKey} onChange={(v) => setInput("bagsConsumables", v)} />
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Disposal ($)" value={inputs.disposal ?? 0} resetKey={fieldKey} onChange={(v) => setInput("disposal", v)} />
              <FieldNumber label="Equipment maintenance ($)" value={inputs.equipmentMaintenance ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipmentMaintenance", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Jobs completed" value={inputs.jobsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("jobsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "lemonade-stand" ? (
            <>
              <p className="guide-revenue-calc__section-label">Sales (per drink)</p>
              <FieldNumber label="Servings sold" value={inputs.lemonadeServingsSold ?? 0} resetKey={fieldKey} onChange={(v) => setInput("lemonadeServingsSold", v)} />
              <FieldNumber label="Average price per drink ($)" value={inputs.averageSellingPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("averageSellingPrice", v)} />
              <FieldNumber label="Servings prepared" value={inputs.servingsPrepared ?? 0} resetKey={fieldKey} onChange={(v) => setInput("servingsPrepared", v)} />
              <p className="guide-revenue-calc__section-label">Costs</p>
              <FieldNumber label="Ingredient cost ($)" value={inputs.ingredientCost ?? 0} resetKey={fieldKey} onChange={(v) => setInput("ingredientCost", v)} />
              <FieldNumber label="Ice ($)" value={inputs.iceCost ?? 0} resetKey={fieldKey} onChange={(v) => setInput("iceCost", v)} />
              <FieldNumber label="Cups / lids / straws ($)" value={inputs.cupLidStrawCost ?? 0} resetKey={fieldKey} onChange={(v) => setInput("cupLidStrawCost", v)} />
              <FieldNumber label="Other direct costs ($)" value={inputs.otherDirectCosts ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherDirectCosts", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "airbnb" ? (
            <>
              <p className="guide-revenue-calc__section-label">Booking revenue</p>
              <FieldNumber label="Available nights" value={inputs.availableNights ?? 0} resetKey={fieldKey} onChange={(v) => setInput("availableNights", v)} />
              <FieldNumber label="Booked nights" value={inputs.airbnbHostBookedNights ?? 0} resetKey={fieldKey} onChange={(v) => setInput("airbnbHostBookedNights", v)} />
              <FieldNumber label="Average nightly revenue / ADR ($)" value={inputs.avgNightlyRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("avgNightlyRevenue", v)} />
              <FieldNumber label="Other host revenue ($)" value={inputs.otherHostRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherHostRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Operating expenses</p>
              <FieldNumber label="Mortgage / rent allocation ($)" value={inputs.mortgageRentAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("mortgageRentAllocation", v)} />
              <FieldNumber label="Property tax allocation ($)" value={inputs.propertyTaxAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("propertyTaxAllocation", v)} />
              <FieldNumber label="Insurance ($)" value={inputs.insurance ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insurance", v)} />
              <FieldNumber label="Utilities ($)" value={inputs.utilities ?? 0} resetKey={fieldKey} onChange={(v) => setInput("utilities", v)} />
              <FieldNumber label="Internet ($)" value={inputs.internet ?? 0} resetKey={fieldKey} onChange={(v) => setInput("internet", v)} />
              <FieldNumber label="Cleaning paid by host ($)" value={inputs.cleaningPaidByHost ?? 0} resetKey={fieldKey} onChange={(v) => setInput("cleaningPaidByHost", v)} />
              <FieldNumber label="Laundry ($)" value={inputs.laundry ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laundry", v)} />
              <FieldNumber label="Platform / payment fees ($)" value={inputs.platformFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("platformFees", v)} />
              <FieldNumber label="Guest supplies ($)" value={inputs.guestSupplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("guestSupplies", v)} />
              <FieldNumber label="Restocking ($)" value={inputs.restocking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("restocking", v)} />
              <FieldNumber label="Maintenance reserve ($)" value={inputs.maintenanceReserve ?? 0} resetKey={fieldKey} onChange={(v) => setInput("maintenanceReserve", v)} />
              <FieldNumber label="Permits allocation ($)" value={inputs.permitsAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("permitsAllocation", v)} />
              <FieldNumber label="Software ($)" value={inputs.software ?? 0} resetKey={fieldKey} onChange={(v) => setInput("software", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Parking / HOA ($)" value={inputs.parkingHoa ?? 0} resetKey={fieldKey} onChange={(v) => setInput("parkingHoa", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Housing cash payment ($)" value={inputs.housingCashPayment ?? 0} resetKey={fieldKey} onChange={(v) => setInput("housingCashPayment", v)} />
            </>
          ) : profile.mode === "service" && guideId === "digital-cookbook-creator" ? (
            <>
              <p className="guide-revenue-calc__section-label">Projects</p>
              <FieldNumber label="Mini cookbooks" value={inputs.cookbookMiniProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("cookbookMiniProjects", v)} />
              <FieldNumber label="Mini price ($)" value={inputs.miniPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("miniPrice", v)} />
              <FieldNumber label="Small cookbooks" value={inputs.smallProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("smallProjects", v)} />
              <FieldNumber label="Small price ($)" value={inputs.smallPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("smallPrice", v)} />
              <FieldNumber label="Medium cookbooks" value={inputs.mediumProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("mediumProjects", v)} />
              <FieldNumber label="Medium price ($)" value={inputs.mediumPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("mediumPrice", v)} />
              <FieldNumber label="Transcription add-ons ($)" value={inputs.transcriptionAddOns ?? 0} resetKey={fieldKey} onChange={(v) => setInput("transcriptionAddOns", v)} />
              <FieldNumber label="Photo cleanup ($)" value={inputs.photoCleanupAddOns ?? 0} resetKey={fieldKey} onChange={(v) => setInput("photoCleanupAddOns", v)} />
              <FieldNumber label="Print-ready add-on ($)" value={inputs.printReadyAddOn ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printReadyAddOn", v)} />
              <FieldNumber label="Rush fees ($)" value={inputs.rushFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("rushFees", v)} />
              <FieldNumber label="Extra revision fees ($)" value={inputs.extraRevisionFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("extraRevisionFees", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Software / assets ($)" value={inputs.softwareAssets ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareAssets", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Test printing ($)" value={inputs.testPrinting ?? 0} resetKey={fieldKey} onChange={(v) => setInput("testPrinting", v)} />
              <FieldNumber label="Storage / delivery ($)" value={inputs.storageDelivery ?? 0} resetKey={fieldKey} onChange={(v) => setInput("storageDelivery", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Projects completed" value={inputs.projectsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("projectsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "family-photo-slideshow" ? (
            <>
              <p className="guide-revenue-calc__section-label">Projects</p>
              <FieldNumber label="Basic slideshows" value={inputs.slideshowBasicProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("slideshowBasicProjects", v)} />
              <FieldNumber label="Basic price ($)" value={inputs.basicPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("basicPrice", v)} />
              <FieldNumber label="Large / custom slideshows" value={inputs.largeProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largeProjects", v)} />
              <FieldNumber label="Large price ($)" value={inputs.largePrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largePrice", v)} />
              <FieldNumber label="Scanning add-ons ($)" value={inputs.scanningAddOns ?? 0} resetKey={fieldKey} onChange={(v) => setInput("scanningAddOns", v)} />
              <FieldNumber label="Rush fees ($)" value={inputs.rushFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("rushFees", v)} />
              <FieldNumber label="Extra revision revenue ($)" value={inputs.extraRevisionRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("extraRevisionRevenue", v)} />
              <FieldNumber label="Extra version revenue ($)" value={inputs.extraVersionRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("extraVersionRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Software allocation ($)" value={inputs.softwareAllocation ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareAllocation", v)} />
              <FieldNumber label="Licensed music ($)" value={inputs.licensedMusic ?? 0} resetKey={fieldKey} onChange={(v) => setInput("licensedMusic", v)} />
              <FieldNumber label="Cloud storage ($)" value={inputs.cloudStorage ?? 0} resetKey={fieldKey} onChange={(v) => setInput("cloudStorage", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Scanning / travel ($)" value={inputs.scanningTravel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("scanningTravel", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Projects completed" value={inputs.projectsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("projectsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "local-resource-list-creator" ? (
            <>
              <p className="guide-revenue-calc__section-label">Sales</p>
              <FieldNumber label="Copies sold" value={inputs.resourceListCopiesSold ?? 0} resetKey={fieldKey} onChange={(v) => setInput("resourceListCopiesSold", v)} />
              <FieldNumber label="Copy price ($)" value={inputs.copyPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("copyPrice", v)} />
              <FieldNumber label="Custom projects" value={inputs.customProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("customProjects", v)} />
              <FieldNumber label="Custom price ($)" value={inputs.customPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("customPrice", v)} />
              <FieldNumber label="Update revenue ($)" value={inputs.updateRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("updateRevenue", v)} />
              <FieldNumber label="Add-on revenue ($)" value={inputs.addOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Software / design ($)" value={inputs.softwareDesign ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareDesign", v)} />
              <FieldNumber label="Platform / payment fees ($)" value={inputs.platformPaymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("platformPaymentFees", v)} />
              <FieldNumber label="Printing ($)" value={inputs.printing ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printing", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Travel / research ($)" value={inputs.travelResearch ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelResearch", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "recycling-helper" ? (
            <>
              <p className="guide-revenue-calc__section-label">Visits</p>
              <FieldNumber label="Curb-out visits" value={inputs.recyclingCurbOutVisits ?? 0} resetKey={fieldKey} onChange={(v) => setInput("recyclingCurbOutVisits", v)} />
              <FieldNumber label="Curb-out price ($)" value={inputs.curbOutPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("curbOutPrice", v)} />
              <FieldNumber label="Curb-return visits" value={inputs.curbReturnVisits ?? 0} resetKey={fieldKey} onChange={(v) => setInput("curbReturnVisits", v)} />
              <FieldNumber label="Curb-return price ($)" value={inputs.curbReturnPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("curbReturnPrice", v)} />
              <FieldNumber label="Sorting visits" value={inputs.sortingVisits ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sortingVisits", v)} />
              <FieldNumber label="Sorting price ($)" value={inputs.sortingPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sortingPrice", v)} />
              <FieldNumber label="Monthly package revenue ($)" value={inputs.monthlyPackageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("monthlyPackageRevenue", v)} />
              <FieldNumber label="Add-on revenue ($)" value={inputs.addOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Gloves / consumables ($)" value={inputs.glovesConsumables ?? 0} resetKey={fieldKey} onChange={(v) => setInput("glovesConsumables", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Visits completed" value={inputs.visitsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("visitsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "proofreader" ? (
            <>
              <p className="guide-revenue-calc__section-label">Projects</p>
              <FieldNumber label="Short projects" value={inputs.proofreadingShortProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("proofreadingShortProjects", v)} />
              <FieldNumber label="Short price ($)" value={inputs.shortPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("shortPrice", v)} />
              <FieldNumber label="Standard projects" value={inputs.standardProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardProjects", v)} />
              <FieldNumber label="Standard price ($)" value={inputs.standardPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardPrice", v)} />
              <FieldNumber label="Long projects" value={inputs.longProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("longProjects", v)} />
              <FieldNumber label="Long price ($)" value={inputs.longPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("longPrice", v)} />
              <FieldNumber label="Hourly hours" value={inputs.hourlyHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("hourlyHours", v)} />
              <FieldNumber label="Hourly rate ($)" value={inputs.hourlyRate ?? 0} resetKey={fieldKey} onChange={(v) => setInput("hourlyRate", v)} />
              <FieldNumber label="Rush fees ($)" value={inputs.rushFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("rushFees", v)} />
              <FieldNumber label="Extra revision fees ($)" value={inputs.extraRevisionFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("extraRevisionFees", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Software / tools ($)" value={inputs.softwareTools ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareTools", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Printing ($)" value={inputs.printing ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printing", v)} />
              <FieldNumber label="Subcontracting ($)" value={inputs.subcontracting ?? 0} resetKey={fieldKey} onChange={(v) => setInput("subcontracting", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Projects completed" value={inputs.projectsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("projectsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "toy-organizer" ? (
            <>
              <p className="guide-revenue-calc__section-label">Service revenue</p>
              <FieldNumber label="Small projects" value={inputs.toyOrganizerSmallProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("toyOrganizerSmallProjects", v)} />
              <FieldNumber label="Small price ($)" value={inputs.smallPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("smallPrice", v)} />
              <FieldNumber label="Standard projects" value={inputs.standardProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardProjects", v)} />
              <FieldNumber label="Standard price ($)" value={inputs.standardPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardPrice", v)} />
              <FieldNumber label="Large projects" value={inputs.largeProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largeProjects", v)} />
              <FieldNumber label="Large price ($)" value={inputs.largePrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largePrice", v)} />
              <FieldNumber label="Add-on service revenue ($)" value={inputs.addOnServiceRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnServiceRevenue", v)} />
              <FieldNumber label="Maintenance revenue ($)" value={inputs.maintenanceRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("maintenanceRevenue", v)} />
              <FieldNumber label="Storage reimbursements ($ — not profit)" value={inputs.storageReimbursements ?? 0} resetKey={fieldKey} onChange={(v) => setInput("storageReimbursements", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Consumable supplies ($)" value={inputs.consumableSupplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("consumableSupplies", v)} />
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Projects completed" value={inputs.projectsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("projectsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "trash-can-service" ? (
            <>
              <p className="guide-revenue-calc__section-label">Visits</p>
              <FieldNumber label="Curb-out visits" value={inputs.trashCanCurbOutVisits ?? 0} resetKey={fieldKey} onChange={(v) => setInput("trashCanCurbOutVisits", v)} />
              <FieldNumber label="Curb-out price ($)" value={inputs.curbOutPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("curbOutPrice", v)} />
              <FieldNumber label="Curb-return visits" value={inputs.curbReturnVisits ?? 0} resetKey={fieldKey} onChange={(v) => setInput("curbReturnVisits", v)} />
              <FieldNumber label="Curb-return price ($)" value={inputs.curbReturnPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("curbReturnPrice", v)} />
              <FieldNumber label="Monthly package revenue ($)" value={inputs.monthlyPackageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("monthlyPackageRevenue", v)} />
              <FieldNumber label="Multi-bin add-on ($)" value={inputs.multiBinAddOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("multiBinAddOnRevenue", v)} />
              <FieldNumber label="Vacation coverage ($)" value={inputs.vacationCoverageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("vacationCoverageRevenue", v)} />
              <FieldNumber label="Extra revenue ($)" value={inputs.extraRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("extraRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Gloves / consumables ($)" value={inputs.glovesConsumables ?? 0} resetKey={fieldKey} onChange={(v) => setInput("glovesConsumables", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Visits completed" value={inputs.visitsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("visitsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "homework" ? (
            <>
              <p className="guide-revenue-calc__section-label">Sessions</p>
              <FieldNumber label="30-minute sessions" value={inputs.homeworkHelperSessions30 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("homeworkHelperSessions30", v)} />
              <FieldNumber label="30-minute price ($)" value={inputs.price30 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("price30", v)} />
              <FieldNumber label="45-minute sessions" value={inputs.sessions45 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sessions45", v)} />
              <FieldNumber label="45-minute price ($)" value={inputs.price45 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("price45", v)} />
              <FieldNumber label="60-minute sessions" value={inputs.sessions60 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sessions60", v)} />
              <FieldNumber label="60-minute price ($)" value={inputs.price60 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("price60", v)} />
              <FieldNumber label="Package revenue ($)" value={inputs.packageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("packageRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Materials ($)" value={inputs.materials ?? 0} resetKey={fieldKey} onChange={(v) => setInput("materials", v)} />
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Sessions completed" value={inputs.sessionsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("sessionsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "canva-flyer-creator" ? (
            <>
              <p className="guide-revenue-calc__section-label">Projects</p>
              <FieldNumber label="Simple designs" value={inputs.canvaFlyerSimpleProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("canvaFlyerSimpleProjects", v)} />
              <FieldNumber label="Simple price ($)" value={inputs.simplePrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("simplePrice", v)} />
              <FieldNumber label="Standard flyers" value={inputs.standardProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardProjects", v)} />
              <FieldNumber label="Standard price ($)" value={inputs.standardPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardPrice", v)} />
              <FieldNumber label="Detailed designs" value={inputs.detailedProjects ?? 0} resetKey={fieldKey} onChange={(v) => setInput("detailedProjects", v)} />
              <FieldNumber label="Detailed price ($)" value={inputs.detailedPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("detailedPrice", v)} />
              <FieldNumber label="Flyer + social / pack revenue ($)" value={inputs.socialPackRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("socialPackRevenue", v)} />
              <FieldNumber label="Recurring package revenue ($)" value={inputs.recurringRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("recurringRevenue", v)} />
              <FieldNumber label="Add-ons / rush / extra revisions ($)" value={inputs.addOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Software / assets ($)" value={inputs.softwareAssets ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareAssets", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Printing / proofs ($)" value={inputs.printingProofs ?? 0} resetKey={fieldKey} onChange={(v) => setInput("printingProofs", v)} />
              <FieldNumber label="Contractors ($)" value={inputs.contractors ?? 0} resetKey={fieldKey} onChange={(v) => setInput("contractors", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Projects completed" value={inputs.projectsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("projectsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "car-interior-cleanup" ? (
            <>
              <p className="guide-revenue-calc__section-label">Jobs</p>
              <FieldNumber label="Quick resets" value={inputs.carInteriorQuickJobs ?? 0} resetKey={fieldKey} onChange={(v) => setInput("carInteriorQuickJobs", v)} />
              <FieldNumber label="Quick price ($)" value={inputs.quickPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("quickPrice", v)} />
              <FieldNumber label="Standard cleanups" value={inputs.standardJobs ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardJobs", v)} />
              <FieldNumber label="Standard price ($)" value={inputs.standardPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardPrice", v)} />
              <FieldNumber label="Larger jobs" value={inputs.largerJobs ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largerJobs", v)} />
              <FieldNumber label="Larger price ($)" value={inputs.largerPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largerPrice", v)} />
              <FieldNumber label="Add-on revenue ($)" value={inputs.addOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRevenue", v)} />
              <FieldNumber label="Recurring revenue ($)" value={inputs.recurringRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("recurringRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Supplies ($)" value={inputs.supplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("supplies", v)} />
              <FieldNumber label="Equipment costs ($)" value={inputs.equipmentCosts ?? 0} resetKey={fieldKey} onChange={(v) => setInput("equipmentCosts", v)} />
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Vehicles completed" value={inputs.vehiclesCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("vehiclesCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "dog-walk" ? (
            <>
              <p className="guide-revenue-calc__section-label">Walks</p>
              <FieldNumber label="15–20 min walks" value={inputs.neighborhoodWalks15 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("neighborhoodWalks15", v)} />
              <FieldNumber label="15–20 min price ($)" value={inputs.price15 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("price15", v)} />
              <FieldNumber label="30 min walks" value={inputs.walks30 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("walks30", v)} />
              <FieldNumber label="30 min price ($)" value={inputs.price30 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("price30", v)} />
              <FieldNumber label="45–60 min walks" value={inputs.walks45 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("walks45", v)} />
              <FieldNumber label="45–60 min price ($)" value={inputs.price45 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("price45", v)} />
              <FieldNumber label="Extra-dog fees ($)" value={inputs.extraDogFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("extraDogFees", v)} />
              <FieldNumber label="Add-on revenue ($)" value={inputs.addOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Supplies ($)" value={inputs.supplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("supplies", v)} />
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Insurance / business costs ($)" value={inputs.insuranceBusiness ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insuranceBusiness", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Walks completed" value={inputs.walksCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("walksCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "greeting-card-creator" ? (
            <>
              <p className="guide-revenue-calc__section-label">Physical and digital (keep costs separate)</p>
              <FieldNumber label="Handmade cards sold" value={inputs.greetingCardHandmadeSold ?? 0} resetKey={fieldKey} onChange={(v) => setInput("greetingCardHandmadeSold", v)} />
              <FieldNumber label="Handmade price ($)" value={inputs.handmadePrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("handmadePrice", v)} />
              <FieldNumber label="Personalized handmade sold" value={inputs.personalizedHandmade ?? 0} resetKey={fieldKey} onChange={(v) => setInput("personalizedHandmade", v)} />
              <FieldNumber label="Personalized price ($)" value={inputs.personalizedPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("personalizedPrice", v)} />
              <FieldNumber label="Digital cards sold" value={inputs.digitalSold ?? 0} resetKey={fieldKey} onChange={(v) => setInput("digitalSold", v)} />
              <FieldNumber label="Digital price ($)" value={inputs.digitalPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("digitalPrice", v)} />
              <FieldNumber label="Custom Canva orders" value={inputs.customCanvaOrders ?? 0} resetKey={fieldKey} onChange={(v) => setInput("customCanvaOrders", v)} />
              <FieldNumber label="Custom Canva price ($)" value={inputs.customCanvaPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("customCanvaPrice", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Paper / ink / envelopes ($)" value={inputs.paperInkEnvelopes ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paperInkEnvelopes", v)} />
              <FieldNumber label="Embellishments / packaging ($)" value={inputs.embellishmentsPackaging ?? 0} resetKey={fieldKey} onChange={(v) => setInput("embellishmentsPackaging", v)} />
              <FieldNumber label="Shipping ($)" value={inputs.shipping ?? 0} resetKey={fieldKey} onChange={(v) => setInput("shipping", v)} />
              <FieldNumber label="Software / assets ($)" value={inputs.softwareAssets ?? 0} resetKey={fieldKey} onChange={(v) => setInput("softwareAssets", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Cards completed" value={inputs.cardsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("cardsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "holiday-decorating-helper" ? (
            <>
              <p className="guide-revenue-calc__section-label">Indoor / light sessions</p>
              <FieldNumber label="Quick jobs" value={inputs.holidayDecoratingQuickJobs ?? 0} resetKey={fieldKey} onChange={(v) => setInput("holidayDecoratingQuickJobs", v)} />
              <FieldNumber label="Quick price ($)" value={inputs.quickPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("quickPrice", v)} />
              <FieldNumber label="Standard sessions" value={inputs.standardSessions ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardSessions", v)} />
              <FieldNumber label="Standard price ($)" value={inputs.standardPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardPrice", v)} />
              <FieldNumber label="Larger indoor sessions" value={inputs.largerSessions ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largerSessions", v)} />
              <FieldNumber label="Larger price ($)" value={inputs.largerPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largerPrice", v)} />
              <FieldNumber label="Hourly hours" value={inputs.hourlyHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("hourlyHours", v)} />
              <FieldNumber label="Hourly rate ($)" value={inputs.hourlyRate ?? 0} resetKey={fieldKey} onChange={(v) => setInput("hourlyRate", v)} />
              <FieldNumber label="Take-down revenue ($)" value={inputs.takeDownRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("takeDownRevenue", v)} />
              <FieldNumber label="Package revenue ($)" value={inputs.packageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("packageRevenue", v)} />
              <FieldNumber label="Add-on revenue ($)" value={inputs.addOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Supplies ($)" value={inputs.supplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("supplies", v)} />
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Parking / tolls ($)" value={inputs.parkingTolls ?? 0} resetKey={fieldKey} onChange={(v) => setInput("parkingTolls", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Helper costs ($)" value={inputs.helperCosts ?? 0} resetKey={fieldKey} onChange={(v) => setInput("helperCosts", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Jobs completed" value={inputs.jobsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("jobsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "handyman-light" ? (
            <>
              <p className="guide-revenue-calc__section-label">Labor (materials reimbursement is not profit)</p>
              <FieldNumber label="Billable hours" value={inputs.lightHandymanHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("lightHandymanHours", v)} />
              <FieldNumber label="Hourly rate ($)" value={inputs.hourlyRate ?? 0} resetKey={fieldKey} onChange={(v) => setInput("hourlyRate", v)} />
              <FieldNumber label="Flat-rate revenue ($)" value={inputs.flatRateRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("flatRateRevenue", v)} />
              <FieldNumber label="Package revenue ($)" value={inputs.packageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("packageRevenue", v)} />
              <FieldNumber label="Materials cost ($)" value={inputs.materialsCost ?? 0} resetKey={fieldKey} onChange={(v) => setInput("materialsCost", v)} />
              <FieldNumber label="Materials reimbursed ($)" value={inputs.materialsReimbursed ?? 0} resetKey={fieldKey} onChange={(v) => setInput("materialsReimbursed", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Supplies ($)" value={inputs.supplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("supplies", v)} />
              <FieldNumber label="Fuel / travel ($)" value={inputs.fuelTravel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("fuelTravel", v)} />
              <FieldNumber label="Parking / tolls ($)" value={inputs.parkingTolls ?? 0} resetKey={fieldKey} onChange={(v) => setInput("parkingTolls", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Tool wear ($)" value={inputs.toolWear ?? 0} resetKey={fieldKey} onChange={(v) => setInput("toolWear", v)} />
              <FieldNumber label="Insurance / business costs ($)" value={inputs.insuranceBusiness ?? 0} resetKey={fieldKey} onChange={(v) => setInput("insuranceBusiness", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours (job + travel + admin)" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Jobs completed" value={inputs.jobsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("jobsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "tutoring" ? (
            <>
              <p className="guide-revenue-calc__section-label">Sessions</p>
              <FieldNumber label="1-on-1 sessions" value={inputs.tutoringSessions1on1 ?? 0} resetKey={fieldKey} onChange={(v) => setInput("tutoringSessions1on1", v)} />
              <FieldNumber label="1-on-1 price ($)" value={inputs.oneOnOnePrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("oneOnOnePrice", v)} />
              <FieldNumber label="Group participants" value={inputs.groupParticipants ?? 0} resetKey={fieldKey} onChange={(v) => setInput("groupParticipants", v)} />
              <FieldNumber label="Group price per person ($)" value={inputs.groupPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("groupPrice", v)} />
              <FieldNumber label="Package revenue ($)" value={inputs.packageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("packageRevenue", v)} />
              <FieldNumber label="Other revenue ($)" value={inputs.otherRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Materials ($)" value={inputs.materials ?? 0} resetKey={fieldKey} onChange={(v) => setInput("materials", v)} />
              <FieldNumber label="Software ($)" value={inputs.software ?? 0} resetKey={fieldKey} onChange={(v) => setInput("software", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Travel / parking ($)" value={inputs.travelParking ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travelParking", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Teaching hours" value={inputs.teachingHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("teachingHours", v)} />
              <FieldNumber label="Total hours (prep + teaching + admin)" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
            </>
          ) : profile.mode === "service" && guideId === "vacation-mail-plant-helper" ? (
            <>
              <p className="guide-revenue-calc__section-label">Per visit vs trip total</p>
              <FieldNumber label="Quick visits" value={inputs.vacationPlantQuickVisits ?? 0} resetKey={fieldKey} onChange={(v) => setInput("vacationPlantQuickVisits", v)} />
              <FieldNumber label="Quick visit price ($)" value={inputs.quickPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("quickPrice", v)} />
              <FieldNumber label="Standard visits" value={inputs.standardVisits ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardVisits", v)} />
              <FieldNumber label="Standard visit price ($)" value={inputs.standardPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("standardPrice", v)} />
              <FieldNumber label="Larger visits" value={inputs.largerVisits ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largerVisits", v)} />
              <FieldNumber label="Larger visit price ($)" value={inputs.largerPrice ?? 0} resetKey={fieldKey} onChange={(v) => setInput("largerPrice", v)} />
              <FieldNumber label="Package / trip total ($)" value={inputs.packageRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("packageRevenue", v)} />
              <FieldNumber label="Add-on revenue ($)" value={inputs.addOnRevenue ?? 0} resetKey={fieldKey} onChange={(v) => setInput("addOnRevenue", v)} />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber label="Travel ($)" value={inputs.travel ?? 0} resetKey={fieldKey} onChange={(v) => setInput("travel", v)} />
              <FieldNumber label="Parking / tolls ($)" value={inputs.parkingTolls ?? 0} resetKey={fieldKey} onChange={(v) => setInput("parkingTolls", v)} />
              <FieldNumber label="Supplies ($)" value={inputs.supplies ?? 0} resetKey={fieldKey} onChange={(v) => setInput("supplies", v)} />
              <FieldNumber label="Payment fees ($)" value={inputs.paymentFees ?? 0} resetKey={fieldKey} onChange={(v) => setInput("paymentFees", v)} />
              <FieldNumber label="Advertising ($)" value={inputs.advertising ?? 0} resetKey={fieldKey} onChange={(v) => setInput("advertising", v)} />
              <FieldNumber label="Other expenses ($)" value={inputs.otherExpenses ?? 0} resetKey={fieldKey} onChange={(v) => setInput("otherExpenses", v)} />
              <FieldNumber label="Labor hours" value={inputs.laborHours ?? 0} resetKey={fieldKey} onChange={(v) => setInput("laborHours", v)} />
              <FieldNumber label="Visits completed" value={inputs.visitsCompleted ?? 0} resetKey={fieldKey} onChange={(v) => setInput("visitsCompleted", v)} />
            </>
          ) : profile.mode === "service" && guideId === "ai-agents" ? (
            <>
              <FieldNumber
                label="Starter builds / month"
                value={inputs.starterBuilds ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("starterBuilds", v)}
              />
              <FieldNumber
                label="Average starter price ($)"
                value={inputs.starterPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("starterPrice", v)}
              />
              <FieldNumber
                label="Standard builds / month"
                value={inputs.standardBuilds ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("standardBuilds", v)}
              />
              <FieldNumber
                label="Average standard price ($)"
                value={inputs.standardPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("standardPrice", v)}
              />
              <FieldNumber
                label="Advanced builds / month"
                value={inputs.advancedBuilds ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advancedBuilds", v)}
              />
              <FieldNumber
                label="Average advanced price ($)"
                value={inputs.advancedPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("advancedPrice", v)}
              />
              <FieldNumber
                label="Monthly retainers"
                value={inputs.monthlyRetainers ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyRetainers", v)}
              />
              <FieldNumber
                label="Average retainer ($)"
                value={inputs.retainerPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("retainerPrice", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="AI / API costs ($)"
                value={inputs.aiApiCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("aiApiCosts", v)}
              />
              <FieldNumber
                label="Automation tools ($)"
                value={inputs.automationTools ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("automationTools", v)}
              />
              <FieldNumber
                label="Hosting / database ($)"
                value={inputs.hostingDatabase ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("hostingDatabase", v)}
              />
              <FieldNumber
                label="Contractors ($)"
                value={inputs.contractors ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("contractors", v)}
              />
              <FieldNumber
                label="Software ($)"
                value={inputs.software ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("software", v)}
              />
              <FieldNumber
                label="Payment fees ($)"
                value={inputs.paymentFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentFees", v)}
              />
              <FieldNumber
                label="Marketing ($)"
                value={inputs.marketing ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("marketing", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber
                label="Build hours"
                value={inputs.buildHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("buildHours", v)}
              />
              <FieldNumber
                label="Testing hours"
                value={inputs.testingHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("testingHours", v)}
              />
              <FieldNumber
                label="Support hours"
                value={inputs.supportHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("supportHours", v)}
              />
              <FieldNumber
                label="Sales / admin hours"
                value={inputs.salesAdminHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("salesAdminHours", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "ai-promo-video" ? (
            <>
              <FieldNumber
                label="Quick promos / month"
                value={inputs.quickPromos ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("quickPromos", v)}
              />
              <FieldNumber
                label="Average quick price ($)"
                value={inputs.averageQuickPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageQuickPrice", v)}
              />
              <FieldNumber
                label="Standard promos / month"
                value={inputs.standardPromos ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("standardPromos", v)}
              />
              <FieldNumber
                label="Average standard price ($)"
                value={inputs.averageStandardPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageStandardPrice", v)}
              />
              <FieldNumber
                label="Premium promos / month"
                value={inputs.premiumPromos ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("premiumPromos", v)}
              />
              <FieldNumber
                label="Average premium price ($)"
                value={inputs.averagePremiumPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averagePremiumPrice", v)}
              />
              <FieldNumber
                label="Monthly package revenue ($)"
                value={inputs.monthlyPackageRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyPackageRevenue", v)}
              />
              <FieldNumber
                label="Add-on revenue ($)"
                value={inputs.addOnRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("addOnRevenue", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="AI generation credits ($)"
                value={inputs.aiGenerationCredits ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("aiGenerationCredits", v)}
              />
              <FieldNumber
                label="Stock assets ($)"
                value={inputs.stockAssets ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("stockAssets", v)}
              />
              <FieldNumber
                label="Music / voice ($)"
                value={inputs.musicVoice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("musicVoice", v)}
              />
              <FieldNumber
                label="Software ($)"
                value={inputs.software ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("software", v)}
              />
              <FieldNumber
                label="Payment fees ($)"
                value={inputs.paymentFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentFees", v)}
              />
              <FieldNumber
                label="Marketing ($)"
                value={inputs.marketing ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("marketing", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber
                label="Production hours"
                value={inputs.productionHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("productionHours", v)}
              />
              <FieldNumber
                label="Revision hours"
                value={inputs.revisionHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("revisionHours", v)}
              />
              <FieldNumber
                label="Client / admin hours"
                value={inputs.clientAdminHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("clientAdminHours", v)}
              />
              <FieldNumber
                label="Marketing hours"
                value={inputs.marketingHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("marketingHours", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "ai-timing" ? (
            <>
              <p className="guide-revenue-calc__section-label">Mode A — Playbook business</p>
              <FieldNumber
                label="Snapshots sold"
                value={inputs.snapshotsSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("snapshotsSold", v)}
              />
              <FieldNumber
                label="Average snapshot price ($)"
                value={inputs.averageSnapshotPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageSnapshotPrice", v)}
              />
              <FieldNumber
                label="City playbooks sold"
                value={inputs.cityPlaybooksSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("cityPlaybooksSold", v)}
              />
              <FieldNumber
                label="Average city price ($)"
                value={inputs.averageCityPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageCityPrice", v)}
              />
              <FieldNumber
                label="Custom playbooks sold"
                value={inputs.customPlaybooksSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("customPlaybooksSold", v)}
              />
              <FieldNumber
                label="Average custom price ($)"
                value={inputs.averageCustomPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageCustomPrice", v)}
              />
              <FieldNumber
                label="Updates / subscriptions ($)"
                value={inputs.updatesSubscriptions ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("updatesSubscriptions", v)}
              />
              <p className="guide-revenue-calc__section-label">Playbook expenses</p>
              <FieldNumber
                label="AI / software ($)"
                value={inputs.aiSoftware ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("aiSoftware", v)}
              />
              <FieldNumber
                label="Data / tools ($)"
                value={inputs.dataTools ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("dataTools", v)}
              />
              <FieldNumber
                label="Marketing ($)"
                value={inputs.marketing ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("marketing", v)}
              />
              <FieldNumber
                label="Payment fees ($)"
                value={inputs.paymentFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentFees", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
              <p className="guide-revenue-calc__section-label">Hours</p>
              <FieldNumber
                label="Research hours"
                value={inputs.researchHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("researchHours", v)}
              />
              <FieldNumber
                label="Customization hours"
                value={inputs.customizationHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("customizationHours", v)}
              />
              <FieldNumber
                label="Marketing / admin hours"
                value={inputs.marketingAdminHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("marketingAdminHours", v)}
              />
              <p className="guide-revenue-calc__section-label">Mode B — Driver test</p>
              <FieldNumber
                label="Gross driving revenue ($)"
                value={inputs.grossDrivingRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("grossDrivingRevenue", v)}
              />
              <FieldNumber
                label="Online hours"
                value={inputs.onlineHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("onlineHours", v)}
              />
              <FieldNumber
                label="Miles"
                value={inputs.miles ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("miles", v)}
              />
              <FieldNumber
                label="Fuel / charging ($)"
                value={inputs.fuelCharging ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("fuelCharging", v)}
              />
              <FieldNumber
                label="Tolls / parking ($)"
                value={inputs.tollsParking ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("tollsParking", v)}
              />
              <FieldNumber
                label="Estimated vehicle costs ($)"
                value={inputs.estimatedVehicleCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("estimatedVehicleCosts", v)}
              />
              <FieldNumber
                label="Other driving costs ($)"
                value={inputs.otherDrivingCosts ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherDrivingCosts", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "cleaning-service" ? (
            <>
              <FieldNumber
                label="Standard cleans / week"
                value={inputs.standardCleansPerWeek ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("standardCleansPerWeek", v)}
              />
              <FieldNumber
                label="Average standard price ($)"
                value={inputs.averageStandardPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageStandardPrice", v)}
              />
              <FieldNumber
                label="Deep / move-out / turnovers per month"
                value={inputs.specialtyJobsPerMonth ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("specialtyJobsPerMonth", v)}
              />
              <FieldNumber
                label="Average specialty job price ($)"
                value={inputs.averageSpecialtyPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("averageSpecialtyPrice", v)}
              />
              <FieldNumber
                label="Monthly add-on revenue ($)"
                value={inputs.monthlyAddOnRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyAddOnRevenue", v)}
              />
              <FieldNumber
                label="Tips / other revenue ($)"
                value={inputs.tipsOtherRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("tipsOtherRevenue", v)}
              />
              <FieldNumber
                label="Cleaning hours"
                value={inputs.cleaningHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("cleaningHours", v)}
              />
              <FieldNumber
                label="Travel / admin hours"
                value={inputs.travelAdminHours ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("travelAdminHours", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "str-cohost" ? (
            <>
              <FieldNumber
                label="Available nights / month"
                value={inputs.availableNights ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("availableNights", v)}
              />
              <FieldNumber
                label="Booked nights / month"
                value={inputs.bookedNights ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("bookedNights", v)}
              />
              <FieldNumber
                label="Average nightly revenue ($)"
                value={inputs.avgNightlyRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("avgNightlyRevenue", v)}
              />
              <FieldNumber
                label="Other eligible host revenue ($)"
                value={inputs.otherHostRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherHostRevenue", v)}
              />
              <FieldNumber
                label="Initial setup investment ($)"
                value={inputs.initialSetupInvestment ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("initialSetupInvestment", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "start-gardening-club" ? (
            <>
              <FieldNumber
                label="Paying members"
                value={inputs.payingMembers ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("payingMembers", v)}
              />
              <FieldNumber
                label="Monthly dues ($ / member)"
                value={inputs.monthlyDues ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyDues", v)}
              />
              <FieldNumber
                label="Workshop attendees"
                value={inputs.workshopAttendees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("workshopAttendees", v)}
              />
              <FieldNumber
                label="Workshop price ($)"
                value={inputs.workshopPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("workshopPrice", v)}
              />
              <FieldNumber
                label="Kits sold"
                value={inputs.kitsSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("kitsSold", v)}
              />
              <FieldNumber
                label="Kit price ($)"
                value={inputs.kitPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("kitPrice", v)}
              />
              <FieldNumber
                label="Other revenue ($ / month)"
                value={inputs.otherRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherRevenue", v)}
              />
            </>
          ) : profile.mode === "service" && guideId === "start-book-club" ? (
            <>
              <FieldNumber
                label="Paying members"
                value={inputs.payingMembers ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("payingMembers", v)}
              />
              <FieldNumber
                label="Monthly dues ($)"
                value={inputs.monthlyDues ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("monthlyDues", v)}
              />
              <FieldNumber
                label="Event attendees"
                value={inputs.eventAttendees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("eventAttendees", v)}
              />
              <FieldNumber
                label="Event price ($)"
                value={inputs.eventPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("eventPrice", v)}
              />
              <FieldNumber
                label="Reading kits sold"
                value={inputs.kitsSold ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("kitsSold", v)}
              />
              <FieldNumber
                label="Kit price ($)"
                value={inputs.kitPrice ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("kitPrice", v)}
              />
              <FieldNumber
                label="Workshop revenue ($)"
                value={inputs.workshopRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("workshopRevenue", v)}
              />
              <FieldNumber
                label="Other revenue ($)"
                value={inputs.otherRevenue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherRevenue", v)}
              />
              <p className="guide-revenue-calc__section-label">Expenses</p>
              <FieldNumber
                label="Venue ($)"
                value={inputs.venue ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("venue", v)}
              />
              <FieldNumber
                label="Refreshments ($)"
                value={inputs.refreshments ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("refreshments", v)}
              />
              <FieldNumber
                label="Kit materials ($)"
                value={inputs.kitMaterials ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("kitMaterials", v)}
              />
              <FieldNumber
                label="Author / speaker ($)"
                value={inputs.authorSpeaker ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("authorSpeaker", v)}
              />
              <FieldNumber
                label="Printing ($)"
                value={inputs.printing ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("printing", v)}
              />
              <FieldNumber
                label="Marketing ($)"
                value={inputs.marketing ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("marketing", v)}
              />
              <FieldNumber
                label="Payment fees ($)"
                value={inputs.paymentFees ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("paymentFees", v)}
              />
              <FieldNumber
                label="Other expenses ($)"
                value={inputs.otherExpenses ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("otherExpenses", v)}
              />
            </>
          ) : profile.mode === "service" ? (
            <>
              {guideId !== "junior-games-ai" ? (
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
                                    : guideId === "errand-runner"
                                      ? "Jobs per week"
                                      : guideId === "homework-organizer"
                                        ? "Projects per week"
                                        : guideId === "group-setup-helper"
                                          ? "Projects per week"
                                        : guideId === "house-sitter"
                                          ? "Paid visits per week"
                                        : guideId === "bookkeeping"
                                          ? "Billable hours per week"
                                        : guideId === "closet-cleanout-listing"
                                          ? "Projects per week"
                                        : guideId === "nonprofit-social-helper"
                                          ? "Projects per week"
                                        : guideId === "tech-helper"
                                          ? "Sessions per week"
                                        : guideId === "yard-help"
                                          ? "Yards per week"
                            : "Jobs / clients / customers per month"
                }
                value={inputs.jobsPerMonth ?? 0}
                resetKey={fieldKey}
                onChange={(v) => setInput("jobsPerMonth", v)}
              />
              ) : null}
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
                                    : guideId === "errand-runner"
                                      ? "Average service fee per job ($)"
                                      : guideId === "homework-organizer"
                                        ? "Average project price ($)"
                                        : guideId === "group-setup-helper"
                                          ? "Average project price ($)"
                                        : guideId === "house-sitter"
                                          ? "Average fee per job/visit ($)"
                                        : guideId === "bookkeeping"
                                          ? "Hourly rate ($)"
                                        : guideId === "closet-cleanout-listing"
                                          ? "Average project fee ($)"
                                        : guideId === "nonprofit-social-helper"
                                          ? "Average project fee ($)"
                                        : guideId === "junior-games-ai"
                                          ? "Project fee ($)"
                                        : guideId === "tech-helper"
                                          ? "Average session fee ($)"
                                        : guideId === "yard-help"
                                          ? "Average yard fee ($)"
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
              {guideId === "errand-runner" ? (
                <>
                  <FieldNumber
                    label="Tips / extra approved pay ($ / week)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Hours per job including travel"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                </>
              ) : null}
              {guideId === "homework-organizer" ? (
                <>
                  <FieldNumber
                    label="Recurring check-in revenue ($ / week)"
                    value={inputs.recurringClientRevenue ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("recurringClientRevenue", v)}
                  />
                  <FieldNumber
                    label="Average hours per project"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                </>
              ) : null}
              {guideId === "group-setup-helper" ? (
                <>
                  <FieldNumber
                    label="Add-on revenue ($ / week)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Average hours per project"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                </>
              ) : null}
              {guideId === "house-sitter" ? (
                <>
                  <FieldNumber
                    label="Add-on revenue ($ / week)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Average hours per visit including travel"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                </>
              ) : null}
              {guideId === "bookkeeping" ? (
                <>
                  <FieldNumber
                    label="Monthly retainer revenue ($)"
                    value={inputs.monthlyRetainerRevenue ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("monthlyRetainerRevenue", v)}
                  />
                  <FieldNumber
                    label="Non-billable admin hours per week"
                    value={inputs.nonBillableHoursPerWeek ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("nonBillableHoursPerWeek", v)}
                  />
                </>
              ) : null}
              {guideId === "closet-cleanout-listing" ? (
                <>
                  <FieldNumber
                    label="Add-on revenue ($ / week)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Average hours per project"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                </>
              ) : null}
              {guideId === "nonprofit-social-helper" ? (
                <>
                  <FieldNumber
                    label="Monthly recurring client revenue ($)"
                    value={inputs.monthlyRetainerRevenue ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("monthlyRetainerRevenue", v)}
                  />
                  <FieldNumber
                    label="Add-on revenue ($ / week)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Average hours per project"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                  <FieldNumber
                    label="Recurring client hours per week"
                    value={inputs.nonBillableHoursPerWeek ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("nonBillableHoursPerWeek", v)}
                  />
                </>
              ) : null}
              {guideId === "junior-games-ai" ? (
                <>
                  <FieldNumber
                    label="Add-on revenue ($)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Planning hours"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                  <FieldNumber
                    label="Build hours"
                    value={inputs.editingHoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("editingHoursPerShoot", v)}
                  />
                  <FieldNumber
                    label="Testing/revision hours"
                    value={inputs.testingHoursPerProject ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("testingHoursPerProject", v)}
                  />
                </>
              ) : null}
              {guideId === "tech-helper" ? (
                <>
                  <FieldNumber
                    label="Package/follow-up revenue ($ / week)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Average session hours"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
                  />
                  <FieldNumber
                    label="Average travel/admin hours per session"
                    value={inputs.editingHoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("editingHoursPerShoot", v)}
                  />
                </>
              ) : null}
              {guideId === "yard-help" ? (
                <>
                  <FieldNumber
                    label="Add-on revenue ($ / week)"
                    value={inputs.extraEventPay ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("extraEventPay", v)}
                  />
                  <FieldNumber
                    label="Job hours (weekly total)"
                    value={inputs.hoursWorkedPerWeek ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursWorkedPerWeek", v)}
                  />
                  <FieldNumber
                    label="Travel / admin hours (weekly total)"
                    value={inputs.hoursPerShoot ?? 0}
                    resetKey={fieldKey}
                    onChange={(v) => setInput("hoursPerShoot", v)}
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
          profile.mode === "split" ||
          profile.mode === "savings" ||
          profile.budget.length === 0 ? null : profile.mode !== "product" ? (
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
                            : guideId === "errand-runner"
                              ? "Weekly costs"
                              : guideId === "homework-organizer"
                                ? "Weekly costs"
                                : guideId === "group-setup-helper"
                                  ? "Weekly costs"
                                : guideId === "house-sitter"
                                  ? "Weekly costs"
                                : guideId === "bookkeeping"
                                  ? "Weekly costs"
                                : guideId === "closet-cleanout-listing"
                                  ? "Weekly costs"
                                : guideId === "nonprofit-social-helper"
                                  ? "Weekly costs"
                                : guideId === "tech-helper"
                                  ? "Weekly costs"
                                : guideId === "yard-help"
                                  ? "Weekly costs"
                                : guideId === "junior-games-ai"
                                  ? "Project costs"
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
              <h4>
                {guideId === "book-publishing" || guideId === "digital-products"
                  ? "Monthly costs"
                  : "Other monthly costs"}
              </h4>
              {budget
                .filter((l) =>
                  guideId === "book-publishing" || guideId === "digital-products"
                    ? true
                    : l.id !== "ads",
                )
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
                      : profile.mode === "savings"
                        ? "Weekly savings goal"
                      : guideId === "personal-shopper" ||
                        guideId === "youth-sports-helper" ||
                        guideId === "appointment-setter" ||
                        guideId === "online-research-assistant" ||
                        guideId === "mothers-helper" ||
                        guideId === "babysitting" ||
                        guideId === "tech-helper" ||
                        guideId === "yard-help"
                      ? "Est. weekly profit"
                      : guideId === "junior-games-ai"
                        ? "Est. project profit"
                      : guideId === "str-cohost"
                        ? "Operating profit / month"
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
                : profile.mode === "savings"
                  ? formatGuideCalcMoneyPrecise(result.net)
                : profile.mode === "delivery" || profile.mode === "resale" || profile.mode === "split"
                  ? formatGuideCalcMoneyPrecise(result.net)
                  : formatGuideCalcMoney(result.net)}
          </p>
          {profile.mode === "impact" || profile.mode === "kindness" || profile.mode === "split" || profile.mode === "savings" ? null : (
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
            ) : profile.mode === "savings" ? (
              <>
                <div>
                  <dt>Amount still needed</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics?.stillNeeded ?? result.revenue)}</dd>
                </div>
                <div>
                  <dt>Weekly savings goal</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics?.weeklySavingsGoal ?? result.net)}</dd>
                </div>
                <div>
                  <dt>Estimated weekly earnings</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics?.estimatedWeeklyEarnings ?? 0)}</dd>
                </div>
                <div>
                  <dt>Estimated weekly savings</dt>
                  <dd>{formatGuideCalcMoneyPrecise(result.metrics?.estimatedWeeklySavings ?? 0)}</dd>
                </div>
                <div>
                  <dt>Percent complete</dt>
                  <dd>{(result.metrics?.percentComplete ?? 0).toFixed(0)}%</dd>
                </div>
                <div>
                  <dt>Plan status</dt>
                  <dd>{result.metrics?.savingsStatusLabel || "—"}</dd>
                </div>
              </>
            ) : (
              <>
            <div>
              <dt>
                {guideId === "str-cohost"
                  ? "Gross booking revenue"
                  : profile.mode === "resale"
                    ? "Expected sale"
                    : "Gross earnings"}
              </dt>
              <dd>
                {profile.mode === "delivery" || profile.mode === "resale"
                  ? formatGuideCalcMoneyPrecise(result.revenue)
                  : formatGuideCalcMoney(result.revenue)}
              </dd>
            </div>
            <div>
              <dt>
                {guideId === "str-cohost"
                  ? "Operating expenses"
                  : profile.mode === "delivery"
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
            {guideId === "book-publishing" && result.metrics?.breakEvenUnits != null ? (
              <div>
                <dt>Break-even units</dt>
                <dd>{result.metrics.breakEvenUnits.toFixed(1)}</dd>
              </div>
            ) : null}
            {guideId === "str-cohost" && result.metrics?.occupancyPercent != null ? (
              <div>
                <dt>Occupancy</dt>
                <dd>{result.metrics.occupancyPercent.toFixed(1)}%</dd>
              </div>
            ) : null}
            {guideId === "str-cohost" && result.metrics?.monthsToRecoverSetup != null ? (
              <div>
                <dt>Months to recover setup</dt>
                <dd>{result.metrics.monthsToRecoverSetup.toFixed(1)}</dd>
              </div>
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
                    : guideId === "junior-games-ai" ||
                        guideId === "tech-helper" ||
                        guideId === "yard-help" ||
                        guideId === "cleaning-service" ||
                        guideId === "book-publishing-kids" ||
                        guideId === "ai-peers"
                      ? "Effective profit per hour"
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
