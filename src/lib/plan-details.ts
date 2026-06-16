import {
  GUIDELINES,
  medigapPremiumByZip3,
  partDPremiumByZip3,
  INSULIN_CAP_MONTHLY,
  type Year,
  type Medication,
} from "./medicare-math";
import { CMS_CATALOG } from "@/data/cms-catalog";

export interface PlanDetail {
  rank: number;
  carrier: string;
  plan: string;
  planType: string;
  network: string;
  premiumPartB: number;
  premiumPlan: number;
  premiumRx: number;
  premiumDental: number;
  premiumVision: number;
  premiumExtras: number;
  monthly: number;
  annual: number;
  deductibleMed: number;
  deductibleRx: number;
  pcpCopay: string;
  specCopay: string;
  hospCopay: string;
  erCopay: string;
  moop: string;
  rxTier1: string;
  rxTier2: string;
  rxTier3: string;
  rxOOPCap: number;
  insulinCap: number;
  dentalBenefit: string;
  visionBenefit: string;
  hearingBenefit: string;
  otcBenefit: string;
  stars: string;
  amBest: string;
  extras: string;
}

export interface PlanDetailInput {
  year: Year;
  zip3: string;
  medications: Medication[];
}

export function rankedPlanDetails(input: PlanDetailInput): PlanDetail[] {
  const g = GUIDELINES[input.year];
  const baseG = medigapPremiumByZip3(input.zip3);
  const baseN = baseG * 0.72;
  const basePartD = partDPremiumByZip3(input.zip3);
  const partBMo = g.partBPremiumMonthly;
  const annualDrugEst = Math.min(
    input.medications.reduce((s, m) => s + (m.estimated_monthly_retail ?? 0) * 12, 0),
    g.partDOOPCap,
  );

  const list: PlanDetail[] = [];

  CMS_CATALOG.medigapCarriers.slice(0, 4).forEach((c, i) => {
    const supp = Math.round(baseG * ([1.0, 0.96, 1.02, 0.99][i] ?? 1));
    const pdp = Math.round(basePartD * ([0.95, 1.0, 1.05, 0.9][i] ?? 1));
    const dental = 38,
      vision = 14;
    const extras = 18; // standalone hearing/OTC/wellness add-ons
    const monthly = partBMo + supp + pdp + dental + vision + extras;
    list.push({
      rank: 0,
      carrier: c["Carrier Name"],
      plan: "Medigap Plan G + Part D",
      planType: "Medigap (Supplement) + Standalone PDP",
      network: "Any provider that accepts Medicare (nationwide)",
      premiumPartB: partBMo,
      premiumPlan: supp,
      premiumRx: pdp,
      premiumDental: dental,
      premiumVision: vision,
      premiumExtras: extras,
      monthly,
      annual: Math.round(monthly * 12 + annualDrugEst),
      deductibleMed: g.partBDeductible,
      deductibleRx: 0,
      pcpCopay: "$0",
      specCopay: "$0",
      hospCopay: "$0 after Part A",
      erCopay: "$0",
      moop: `${formatUsd(g.partBDeductible)} med / ${formatUsd(g.partDOOPCap)} Rx`,
      rxTier1: "$0–$4",
      rxTier2: "$10",
      rxTier3: "$45",
      rxOOPCap: g.partDOOPCap,
      insulinCap: INSULIN_CAP_MONTHLY,
      dentalBenefit: "Standalone — $1,500 annual max",
      visionBenefit: "Standalone — $200 frames + exam",
      hearingBenefit: "Discount program only",
      otcBenefit: "Not included",
      stars: ["4.0", "4.5", "4.0", "3.5"][i] + "★",
      amBest: c["A.M. Best Rating"],
      extras: "Maximum freedom; add standalone dental/vision",
    });
  });

  CMS_CATALOG.medigapCarriers.slice(0, 2).forEach((c, i) => {
    const supp = Math.round(baseN * ([1.0, 0.97][i] ?? 1));
    const pdp = Math.round(basePartD * 0.95);
    const dental = 35,
      vision = 12;
    const extras = 15;
    const monthly = partBMo + supp + pdp + dental + vision + extras;
    list.push({
      rank: 0,
      carrier: c["Carrier Name"],
      plan: "Medigap Plan N + Part D",
      planType: "Medigap (Supplement) + Standalone PDP",
      network: "Any provider that accepts Medicare (nationwide)",
      premiumPartB: partBMo,
      premiumPlan: supp,
      premiumRx: pdp,
      premiumDental: dental,
      premiumVision: vision,
      premiumExtras: extras,
      monthly,
      annual: Math.round(monthly * 12 + annualDrugEst),
      deductibleMed: g.partBDeductible,
      deductibleRx: 0,
      pcpCopay: "$20",
      specCopay: "$50",
      hospCopay: "$0 after Part A",
      erCopay: "$50 (waived if admitted)",
      moop: `~${formatUsd(g.partBDeductible + 250)} med / ${formatUsd(g.partDOOPCap)} Rx`,
      rxTier1: "$0–$4",
      rxTier2: "$10",
      rxTier3: "$45",
      rxOOPCap: g.partDOOPCap,
      insulinCap: INSULIN_CAP_MONTHLY,
      dentalBenefit: "Standalone — $1,500 annual max",
      visionBenefit: "Standalone — $200 frames + exam",
      hearingBenefit: "Discount program only",
      otcBenefit: "Not included",
      stars: ["4.0", "4.5"][i] + "★",
      amBest: c["A.M. Best Rating"],
      extras: "Lower premium; small office copays",
    });
  });

  CMS_CATALOG.advantageCarriers.slice(0, 4).forEach((c, i) => {
    const planPrem = [0, 0, 14, 0][i] ?? 0;
    const monthly = partBMo + planPrem; // dental/vision/extras bundled
    list.push({
      rank: 0,
      carrier: c["Carrier Name"],
      plan: "Medicare Advantage HMO",
      planType: "Medicare Advantage (HMO)",
      network: "HMO — referral required for specialists",
      premiumPartB: partBMo,
      premiumPlan: planPrem,
      premiumRx: 0,
      premiumDental: 0,
      premiumVision: 0,
      premiumExtras: 0,
      monthly,
      annual: Math.round(monthly * 12 + annualDrugEst + 800),
      deductibleMed: 0,
      deductibleRx: 0,
      pcpCopay: "$0",
      specCopay: "$35",
      hospCopay: "$295/day days 1–5",
      erCopay: "$120 (waived if admitted)",
      moop: `${formatUsd(g.moopLow)} in-network`,
      rxTier1: "$0",
      rxTier2: "$10",
      rxTier3: "$47",
      rxOOPCap: g.partDOOPCap,
      insulinCap: INSULIN_CAP_MONTHLY,
      dentalBenefit: "Included — $2,500 comprehensive",
      visionBenefit: "Included — $300 eyewear + exam",
      hearingBenefit: "Included — $1,000 hearing aids",
      otcBenefit: "$125/quarter OTC card",
      stars: ["4.5", "4.0", "4.0", "3.5"][i] + "★",
      amBest: c["A.M. Best Rating"],
      extras: "Bundles dental, vision, hearing, fitness, OTC",
    });
  });

  CMS_CATALOG.advantageCarriers.slice(0, 3).forEach((c, i) => {
    const planPrem = [19, 24, 32][i] ?? 20;
    const monthly = partBMo + planPrem; // dental/vision/extras bundled
    list.push({
      rank: 0,
      carrier: c["Carrier Name"],
      plan: "Medicare Advantage PPO",
      planType: "Medicare Advantage (PPO)",
      network: "PPO — in/out-of-network without referral",
      premiumPartB: partBMo,
      premiumPlan: planPrem,
      premiumRx: 0,
      premiumDental: 0,
      premiumVision: 0,
      premiumExtras: 0,
      monthly,
      annual: Math.round(monthly * 12 + annualDrugEst + 1100),
      deductibleMed: 0,
      deductibleRx: 150,
      pcpCopay: "$5",
      specCopay: "$45",
      hospCopay: "$350/day days 1–6",
      erCopay: "$120 (waived if admitted)",
      moop: `${formatUsd(g.moopHigh)} combined`,
      rxTier1: "$2",
      rxTier2: "$12",
      rxTier3: "$47",
      rxOOPCap: g.partDOOPCap,
      insulinCap: INSULIN_CAP_MONTHLY,
      dentalBenefit: "Included — $2,000 comprehensive",
      visionBenefit: "Included — $250 eyewear + exam",
      hearingBenefit: "Included — $750 hearing aids",
      otcBenefit: "$100/quarter OTC card",
      stars: ["4.0", "4.0", "4.5"][i] + "★",
      amBest: c["A.M. Best Rating"],
      extras: "Dental, vision, hearing + PPO flexibility",
    });
  });

  list.sort((a, b) => a.annual - b.annual);
  return list.slice(0, 10).map((r, i) => ({ ...r, rank: i + 1 }));
}

function formatUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
