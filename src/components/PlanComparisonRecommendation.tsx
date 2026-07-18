import { Card } from "@/components/ui/card";

import { Sparkles } from "lucide-react";

import { potentialTop3PlanDetails } from "@/lib/plan-details";
import { useCmsLandscapeReady } from "@/hooks/use-cms-landscape-ready";
import { PlansLoadingScreen } from "@/components/PlansLoadingScreen";
import { CMS_LANDSCAPE_LOADING_LABEL } from "@/lib/plan-filter-loading";

import { PlanChoiceCard } from "@/components/PlanComparisonPlanCard";

import { WhyThisPlanSection } from "@/components/WhyThisPlanSection";

import type { ScenarioPdfInput } from "@/lib/scenario-pdf";



export function PlanComparisonRecommendation({

  scenario,

  className,

}: {

  scenario: ScenarioPdfInput & { county?: string };

  className?: string;

}) {

  const landscapeReady = useCmsLandscapeReady();

  const plans = landscapeReady
    ? potentialTop3PlanDetails({
        year: scenario.year,
        zip3: scenario.zip3,
        county: scenario.county,
        medications: scenario.medications,
      })
    : [];

  const top = plans[0];

  const runnersUp = plans.slice(1, 3);



  if (!landscapeReady) {
    return (
      <Card className={`glass ${className ?? ""}`}>
        <PlansLoadingScreen message={CMS_LANDSCAPE_LOADING_LABEL} />
      </Card>
    );
  }

  if (!top) {

    return (

      <Card className={`glass p-6 text-sm text-muted-foreground ${className ?? ""}`}>

        No recommendation available.

      </Card>

    );

  }



  return (

    <Card className={`glass p-6 space-y-4 ${className ?? ""}`}>

      <div className="flex items-center gap-2">

        <Sparkles className="h-5 w-5 text-primary" />

        <h2 className="font-display text-xl font-bold">Personalized recommendation</h2>

      </div>



      <WhyThisPlanSection
        scenario={scenario}
        top={top}
        runnersUp={runnersUp}
        planPanel="why-this-plan"
        showHeading={false}
      />



      {runnersUp.length > 0 && (

        <div className="space-y-3">

          <div className="text-xs uppercase tracking-wide text-muted-foreground">

            Runners-up — full comparison data

          </div>

          {runnersUp.map((p) => (

            <PlanChoiceCard key={p.rank} plan={p} year={scenario.year} zip3={scenario.zip3} />

          ))}

        </div>

      )}



      <p className="text-micro text-muted-foreground border-t border-border pt-2">

        Estimates from CMS {scenario.year} reference data and carrier catalog for ZIP {scenario.zip3}

        xx{scenario.county ? ` (${scenario.county})` : ""}. Premiums, networks, and benefits vary by

        contract — verify on Medicare.gov Plan Finder before enrolling.

      </p>

    </Card>

  );

}

