import {
  CMS_CATALOG,
  catalogAdvantageTypes,
  catalogMedigapLetters,
  openMedigapLetters,
  type AdvantageTypeRow,
  type CarrierRow,
} from "@/data/cms-catalog";
import {
  GUIDELINES,
  INSULIN_CAP_MONTHLY,
  MEDIGAP_EXPECTED_OOP,
  MEDIGAP_PREMIUM_FACTOR,
  medigapKey,
  medigapPremiumByZip3,
  partDPremiumByZip3,
  type Medication,
  type Year,
} from "@/lib/medicare-math";
import type { PlanDetail } from "@/lib/plan-details";
import { countiesForZip3, normalizeCountyName } from "@/lib/zip3-county-lookup";
import {
  areaCatalogCacheKey,
  fullCatalogCacheKey,
  getCachedAreaCatalog,
  getCachedFullCatalog,
  setCachedAreaCatalog,
  setCachedFullCatalog,
} from "@/lib/plan-catalog-cache";
import {
  cmsLandscapeIsLoaded,
  cmsLandscapeNationalPlans,
  cmsLandscapePlansForZip3,
} from "@/lib/cms-landscape";

const CARRIER_RATE_MULT = [1.0, 0.96, 1.02, 0.99, 1.04, 0.94, 1.01, 0.98, 1.03] as const;
const PDP_RATE_MULT = [0.95, 1.0, 1.05, 0.9, 0.97, 1.02, 0.92, 1.04, 0.98] as const;

/** Open Part C plan types modeled for a member's county/ZIP area. */
export function openAreaAdvantageTypes(): AdvantageTypeRow[] {
  return CMS_CATALOG.advantageTypes.filter((row) => {
    const status = row["Enrollment Status"] ?? "";
    // Include D-SNP / C-SNP (Restricted Eligibility) — valid area plans for qualifying members.
    return !/closed/i.test(status);
  });
}

function carrierMultiplier(index: number): number {
  return CARRIER_RATE_MULT[index % CARRIER_RATE_MULT.length] ?? 1;
}

function pdpMultiplier(index: number): number {
  return PDP_RATE_MULT[index % PDP_RATE_MULT.length] ?? 1;
}

function parseStarRating(text: string | undefined, fallback = 4.0): string {
  const match = text?.match(/(\d\.\d)/);
  const value = match ? parseFloat(match[1]) : fallback;
  return `${value.toFixed(1)}★`;
}

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function annualDrugEstimate(medications: Medication[], cap: number): number {
  return Math.min(
    medications.reduce((sum, med) => sum + (med.estimated_monthly_retail ?? 0) * 12, 0),
    cap,
  );
}

function medigapCopays(letterKey: string): { pcp: string; spec: string; er: string } {
  if (letterKey === "N") {
    return { pcp: "$20", spec: "$50", er: "$50 (waived if admitted)" };
  }
  if (letterKey === "K" || letterKey === "L") {
    return { pcp: "50% coinsurance", spec: "50% coinsurance", er: "50% coinsurance" };
  }
  return { pcp: "$0", spec: "$0", er: "$0" };
}

function maPremiumForType(planType: string, carrierIndex: number): number {
  const mult = carrierMultiplier(carrierIndex);
  if (planType === "HMO") return Math.round([0, 0, 14, 0, 9, 18, 0, 12, 6][carrierIndex]! * mult);
  if (planType === "PPO") return Math.round([19, 24, 32, 21, 28, 35, 17, 26, 30][carrierIndex]! * mult);
  if (planType === "HMO-POS") return Math.round([8, 12, 16, 10, 14, 18, 7, 11, 15][carrierIndex]! * mult);
  if (planType === "PFFS") return Math.round([25, 30, 35, 28, 32, 38, 22, 29, 33][carrierIndex]! * mult);
  if (planType === "MSA") return Math.round([0, 0, 0, 0, 0, 0, 0, 0, 0][carrierIndex]!);
  if (planType === "D-SNP") return Math.round([0, 0, 0, 0, 0, 0, 0, 0, 0][carrierIndex]!);
  if (planType === "C-SNP") return Math.round([12, 15, 18, 14, 16, 20, 10, 13, 17][carrierIndex]! * mult);
  return Math.round(12 * mult);
}

function maExpectedOop(planType: string): number {
  if (planType === "PPO" || planType === "PFFS") return 1100;
  if (planType === "MSA") return 1800;
  return 800;
}

function maBenefitProfile(planType: string, carrierIndex: number): {
  network: string;
  pcpCopay: string;
  specCopay: string;
  hospCopay: string;
  erCopay: string;
  moop: string;
  dentalBenefit: string;
  visionBenefit: string;
  hearingBenefit: string;
  otcBenefit: string;
  extras: string;
  deductibleRx: number;
} {
  const tier = carrierIndex % 3;
  if (planType === "PPO") {
    return {
      network: "PPO — in/out-of-network without referral",
      pcpCopay: ["$5", "$10", "$0"][tier]!,
      specCopay: ["$45", "$50", "$55"][tier]!,
      hospCopay: ["$350/day days 1–6", "$395/day days 1–6", "$325/day days 1–5"][tier]!,
      erCopay: "$120 (waived if admitted)",
      moop: "combined in/out-of-network MOOP",
      dentalBenefit: "Included — $2,000 comprehensive",
      visionBenefit: "Included — $250 eyewear + exam",
      hearingBenefit: "Included — $750 hearing aids",
      otcBenefit: "$100/quarter OTC card",
      extras: "Dental, vision, hearing + PPO flexibility",
      deductibleRx: 150,
    };
  }
  if (planType === "HMO-POS") {
    return {
      network: "HMO with limited out-of-network POS option",
      pcpCopay: "$0",
      specCopay: "$40",
      hospCopay: "$310/day days 1–5",
      erCopay: "$120 (waived if admitted)",
      moop: "in-network MOOP",
      dentalBenefit: "Included — $2,200 comprehensive",
      visionBenefit: "Included — $275 eyewear + exam",
      hearingBenefit: "Included — $850 hearing aids",
      otcBenefit: "$110/quarter OTC card",
      extras: "HMO savings with POS specialist access",
      deductibleRx: 0,
    };
  }
  if (planType === "PFFS") {
    return {
      network: "PFFS — provider must accept plan terms",
      pcpCopay: "$15",
      specCopay: "$55",
      hospCopay: "$375/day days 1–6",
      erCopay: "$130 (waived if admitted)",
      moop: "combined MOOP",
      dentalBenefit: "Included — $1,800 comprehensive",
      visionBenefit: "Included — $225 eyewear + exam",
      hearingBenefit: "Included — $650 hearing aids",
      otcBenefit: "$75/quarter OTC card",
      extras: "Flexible provider choice when accepted",
      deductibleRx: 200,
    };
  }
  if (planType === "MSA") {
    return {
      network: "Any provider that accepts Medicare",
      pcpCopay: "After MSA deductible",
      specCopay: "After MSA deductible",
      hospCopay: "After MSA deductible",
      erCopay: "After MSA deductible",
      moop: "High-deductible MSA framework",
      dentalBenefit: "Not included — add standalone",
      visionBenefit: "Not included — add standalone",
      hearingBenefit: "Not included",
      otcBenefit: "Not included",
      extras: "Medicare deposits into member savings account",
      deductibleRx: 0,
    };
  }
  if (planType === "D-SNP") {
    return {
      network: "D-SNP — dual-eligible Medicaid + Medicare coordination",
      pcpCopay: "$0",
      specCopay: "$0",
      hospCopay: "$0",
      erCopay: "$0",
      moop: "in-network MOOP (Medicaid cost-sharing may apply)",
      dentalBenefit: "Included — enhanced dental for dual-eligible",
      visionBenefit: "Included — vision + exam",
      hearingBenefit: "Included — hearing aids",
      otcBenefit: "$150/quarter OTC + healthy food",
      extras: "Dual-eligible benefits aligned with state Medicaid",
      deductibleRx: 0,
    };
  }
  if (planType === "C-SNP") {
    return {
      network: "C-SNP — chronic-condition specialist network",
      pcpCopay: "$0",
      specCopay: "$35",
      hospCopay: "$275/day days 1–5",
      erCopay: "$120 (waived if admitted)",
      moop: "in-network MOOP",
      dentalBenefit: "Included — $1,500 comprehensive",
      visionBenefit: "Included — $200 eyewear + exam",
      hearingBenefit: "Included — $600 hearing aids",
      otcBenefit: "$90/quarter OTC card",
      extras: "Disease-specific care management and pharmacy support",
      deductibleRx: 0,
    };
  }
  return {
    network: "HMO — referral required for specialists",
    pcpCopay: "$0",
    specCopay: ["$35", "$40", "$45"][tier]!,
    hospCopay: ["$295/day days 1–5", "$325/day days 1–5", "$350/day days 1–5"][tier]!,
    erCopay: "$120 (waived if admitted)",
    moop: "in-network MOOP",
    dentalBenefit: "Included — $2,500 comprehensive",
    visionBenefit: "Included — $300 eyewear + exam",
    hearingBenefit: "Included — $1,000 hearing aids",
    otcBenefit: "$125/quarter OTC card",
    extras: "Bundles dental, vision, hearing, fitness, OTC",
    deductibleRx: 0,
  };
}

function buildMedigapPlan(
  carrier: CarrierRow,
  carrierIndex: number,
  letter: string,
  letterKey: string,
  partBMo: number,
  baseG: number,
  basePartD: number,
  annualDrugEst: number,
  g: (typeof GUIDELINES)[Year],
): PlanDetail {
  const factor = MEDIGAP_PREMIUM_FACTOR[letterKey] ?? 1;
  const expectedOop = MEDIGAP_EXPECTED_OOP[letterKey] ?? 600;
  const supp = Math.round(baseG * factor * carrierMultiplier(carrierIndex));
  const pdp = Math.round(basePartD * pdpMultiplier(carrierIndex));
  const dental = 35 + (carrierIndex % 4) * 2;
  const vision = 12 + (carrierIndex % 3) * 2;
  const extras = 15 + (carrierIndex % 2) * 3;
  const monthly = partBMo + supp + pdp + dental + vision + extras;
  const copays = medigapCopays(letterKey);

  return {
    rank: 0,
    carrier: carrier["Carrier Name"],
    plan: `Medigap ${letter} + Part D`,
    planType: "Medigap (Supplement) + Standalone PDP",
    network: "Any provider that accepts Medicare (nationwide)",
    premiumPartB: partBMo,
    premiumPlan: supp,
    premiumRx: pdp,
    premiumDental: dental,
    premiumVision: vision,
    premiumExtras: extras,
    monthly,
    annual: Math.round(monthly * 12 + annualDrugEst + expectedOop),
    deductibleMed: g.partBDeductible,
    deductibleRx: 0,
    pcpCopay: copays.pcp,
    specCopay: copays.spec,
    hospCopay: "$0 after Part A",
    erCopay: copays.er,
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
    stars: `${(4.5 + (carrierIndex % 4) * 0.1).toFixed(1)}★`,
    amBest: carrier["A.M. Best Rating"],
    extras: "Original Medicare supplement + standalone Rx",
  };
}

function buildMaPlan(
  carrier: CarrierRow,
  carrierIndex: number,
  maType: AdvantageTypeRow,
  partBMo: number,
  annualDrugEst: number,
  g: (typeof GUIDELINES)[Year],
): PlanDetail {
  const planTypeCode = maType["Plan Type"];
  const planPrem = maPremiumForType(planTypeCode, carrierIndex);
  const monthly = partBMo + planPrem;
  const benefits = maBenefitProfile(planTypeCode, carrierIndex);
  const moopValue =
    planTypeCode === "PPO" || planTypeCode === "PFFS"
      ? `${formatUsd(g.moopHigh)} ${benefits.moop}`
      : `${formatUsd(g.moopLow)} ${benefits.moop}`;

  return {
    rank: 0,
    carrier: carrier["Carrier Name"],
    plan: `Medicare Advantage ${planTypeCode}`,
    planType: `Medicare Advantage (${planTypeCode})`,
    network: benefits.network,
    premiumPartB: partBMo,
    premiumPlan: planPrem,
    premiumRx: 0,
    premiumDental: 0,
    premiumVision: 0,
    premiumExtras: 0,
    monthly,
    annual: Math.round(monthly * 12 + annualDrugEst + maExpectedOop(planTypeCode)),
    deductibleMed: 0,
    deductibleRx: benefits.deductibleRx,
    pcpCopay: benefits.pcpCopay,
    specCopay: benefits.specCopay,
    hospCopay: benefits.hospCopay,
    erCopay: benefits.erCopay,
    moop: moopValue,
    rxTier1: planTypeCode === "PPO" ? "$2" : "$0",
    rxTier2: "$10",
    rxTier3: "$47",
    rxOOPCap: g.partDOOPCap,
    insulinCap: INSULIN_CAP_MONTHLY,
    dentalBenefit: benefits.dentalBenefit,
    visionBenefit: benefits.visionBenefit,
    hearingBenefit: benefits.hearingBenefit,
    otcBenefit: benefits.otcBenefit,
    stars: parseStarRating(
      (carrier as { "Average Star Rating"?: string })["Average Star Rating"],
      4.0,
    ),
    amBest: "CMS carrier reference",
    extras: benefits.extras,
  };
}

function buildStandalonePartDPlan(
  carrier: CarrierRow,
  carrierIndex: number,
  tierLabel: string,
  tierIndex: number,
  partBMo: number,
  basePartD: number,
  annualDrugEst: number,
  g: (typeof GUIDELINES)[Year],
): PlanDetail {
  const tierPremMult = [0.72, 1.0, 1.38][tierIndex] ?? 1;
  const pdp = Math.round(basePartD * pdpMultiplier(carrierIndex) * tierPremMult);
  const monthly = partBMo + pdp;

  return {
    rank: 0,
    carrier: carrier["Carrier Name"],
    plan: `Part D — ${tierLabel}`,
    planType: "Medicare Part D (PDP)",
    network: "National pharmacy network (retail + mail order)",
    premiumPartB: partBMo,
    premiumPlan: 0,
    premiumRx: pdp,
    premiumDental: 0,
    premiumVision: 0,
    premiumExtras: 0,
    monthly,
    annual: Math.round(monthly * 12 + annualDrugEst),
    deductibleMed: 0,
    deductibleRx: tierIndex === 0 ? 590 : tierIndex === 1 ? 350 : 0,
    pcpCopay: "N/A — drug plan only",
    specCopay: "N/A — drug plan only",
    hospCopay: "N/A — drug plan only",
    erCopay: "N/A — drug plan only",
    moop: `${formatUsd(g.partDOOPCap)} Rx OOP cap`,
    rxTier1: tierIndex === 0 ? "$0–$5" : "$0–$4",
    rxTier2: tierIndex === 2 ? "$8" : "$10",
    rxTier3: tierIndex === 2 ? "$42" : "$47",
    rxOOPCap: g.partDOOPCap,
    insulinCap: INSULIN_CAP_MONTHLY,
    dentalBenefit: "Not included",
    visionBenefit: "Not included",
    hearingBenefit: "Not included",
    otcBenefit: "Not included",
    stars: `${(3.5 + (carrierIndex % 4) * 0.2).toFixed(1)}★`,
    amBest: "CMS carrier reference",
    extras: "Standalone PDP — pair with Original Medicare or Medigap",
  };
}

export type AreaPlanCatalogInput = {
  year: Year;
  zip3: string;
  county?: string;
  medications: Medication[];
};

export type FullPlanCatalogInput = {
  year: Year;
  medications: Medication[];
};

/** National Medigap/Part D premium references — not ZIP-localized. */
const NATIONAL_MEDIGAP_PREMIUM = 155;
const NATIONAL_PART_D_PREMIUM = 40;

/** Strip optional ", ST" suffix before normalizing parish/county names. */
function normalizeCountyInput(county: string): string {
  const withoutState = county.replace(/,\s*[A-Z]{2}\s*$/i, "").trim();
  return normalizeCountyName(withoutState);
}

/**
 * Medicare Advantage contracts are county-specific. When a ZIP prefix spans multiple
 * parishes/counties, assign each carrier×plan-type to exactly one county via a stable hash.
 */
export function maPlanAvailableInCounty(
  carrier: string,
  planType: string,
  zip3: string,
  county: string,
): boolean {
  const counties = countiesForZip3(zip3);
  if (counties.length <= 1) return true;

  const target = normalizeCountyInput(county);
  const targetIndex = counties.findIndex(
    (c) => normalizeCountyName(c.county) === target,
  );
  // Unrecognized parish/county within a multi-county ZIP — no MA contracts modeled here.
  if (targetIndex < 0) return false;

  const key = `${carrier}::${planType}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % counties.length === targetIndex;
}

/**
 * Medigap and standalone Part D carriers modeled per ZIP prefix — not every national
 * carrier files in every region. Stable hash keeps availability consistent per zip3.
 */
export function medigapOrPartDCarrierAvailableInZip3(
  carrier: string,
  zip3: string,
): boolean {
  const key = `${carrier}::${zip3}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % 4 !== 0;
}

/**
 * Medicare Advantage carriers modeled per ZIP prefix — not every national MA carrier
 * contracts in every region. Stable hash keeps availability consistent per zip3.
 */
export function maCarrierAvailableInZip3(carrier: string, zip3: string): boolean {
  const key = `${carrier}::ma::${zip3}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % 4 !== 0;
}

function planAvailableInMemberRegion(
  plan: PlanDetail,
  zip3: string,
  county?: string,
): boolean {
  if (/medicare advantage/i.test(plan.planType)) {
    if (!maCarrierAvailableInZip3(plan.carrier, zip3)) return false;
    if (!county?.trim()) return true;
    const maType = plan.planType.match(/\(([^)]+)\)/)?.[1] ?? "";
    return maPlanAvailableInCounty(plan.carrier, maType, zip3, county.trim());
  }
  if (/medigap|supplement/i.test(plan.planType) || /^Medicare Part D/i.test(plan.planType)) {
    return medigapOrPartDCarrierAvailableInZip3(plan.carrier, zip3);
  }
  return true;
}

type PlanCatalogProfile = "national" | "regional";

function buildPlanCatalogList(
  year: Year,
  medications: Medication[],
  premiums: { baseG: number; basePartD: number },
  profile: PlanCatalogProfile,
): PlanDetail[] {
  const g = GUIDELINES[year];
  const partBMo = g.partBPremiumMonthly;
  const annualDrugEst = annualDrugEstimate(medications, g.partDOOPCap);
  const medigapLetters =
    profile === "national" ? catalogMedigapLetters() : openMedigapLetters();
  const advantageTypes =
    profile === "national" ? catalogAdvantageTypes() : openAreaAdvantageTypes();

  const list: PlanDetail[] = [];

  medigapLetters.forEach((row) => {
    const letter = row["Plan Letter"];
    const letterKey = medigapKey(letter);
    CMS_CATALOG.medigapCarriers.forEach((carrier, carrierIndex) => {
      list.push(
        buildMedigapPlan(
          carrier,
          carrierIndex,
          letter,
          letterKey,
          partBMo,
          premiums.baseG,
          premiums.basePartD,
          annualDrugEst,
          g,
        ),
      );
    });
  });

  advantageTypes.forEach((maType) => {
    CMS_CATALOG.advantageCarriers.forEach((carrier, carrierIndex) => {
      list.push(buildMaPlan(carrier, carrierIndex, maType, partBMo, annualDrugEst, g));
    });
  });

  CMS_CATALOG.partDPlans.forEach((tier, tierIndex) => {
    const tierLabel = String(tier["Plan Tier Level"] ?? `Tier ${tierIndex + 1}`);
    CMS_CATALOG.partDCarriers.forEach((carrier, carrierIndex) => {
      list.push(
        buildStandalonePartDPlan(
          carrier,
          carrierIndex,
          tierLabel,
          tierIndex,
          partBMo,
          premiums.basePartD,
          annualDrugEst,
          g,
        ),
      );
    });
  });

  return list;
}

function buildMedigapCatalogList(
  year: Year,
  medications: Medication[],
  premiums: { baseG: number; basePartD: number },
  profile: PlanCatalogProfile,
): PlanDetail[] {
  const g = GUIDELINES[year];
  const partBMo = g.partBPremiumMonthly;
  const annualDrugEst = annualDrugEstimate(medications, g.partDOOPCap);
  const medigapLetters =
    profile === "national" ? catalogMedigapLetters() : openMedigapLetters();
  const list: PlanDetail[] = [];

  medigapLetters.forEach((row) => {
    const letter = row["Plan Letter"];
    const letterKey = medigapKey(letter);
    CMS_CATALOG.medigapCarriers.forEach((carrier, carrierIndex) => {
      list.push(
        buildMedigapPlan(
          carrier,
          carrierIndex,
          letter,
          letterKey,
          partBMo,
          premiums.baseG,
          premiums.basePartD,
          annualDrugEst,
          g,
        ),
      );
    });
  });

  return list;
}

/** Expected plan counts for the full national CMS catalog (all letters, types, carriers). */
export function fullCatalogPlanCounts(): {
  medigap: number;
  medicareAdvantage: number;
  partD: number;
  total: number;
} {
  const medigap = CMS_CATALOG.medigapPlans.length * CMS_CATALOG.medigapCarriers.length;
  if (!cmsLandscapeIsLoaded()) {
    return { medigap, medicareAdvantage: 0, partD: 0, total: medigap };
  }
  const national = cmsLandscapeNationalPlans(2026, []);
  const medicareAdvantage = national.filter((p) => /medicare advantage/i.test(p.planType)).length;
  const partD = national.filter((p) => /^Medicare Part D/i.test(p.planType)).length;
  return { medigap, medicareAdvantage, partD, total: medigap + medicareAdvantage + partD };
}

/**
 * Every Medigap, Medicare Advantage, and Part D option in the national CMS catalog.
 * Premiums use national reference rates — not ZIP-prefix localization; no parish/county MA scoping.
 */
export function buildFullPlanCatalog(input: FullPlanCatalogInput): PlanDetail[] {
  const cacheKey = fullCatalogCacheKey(input.year, input.medications);
  const cached = getCachedFullCatalog(cacheKey);
  if (cached) return cached;

  const medigap = buildMedigapCatalogList(
    input.year,
    input.medications,
    { baseG: NATIONAL_MEDIGAP_PREMIUM, basePartD: NATIONAL_PART_D_PREMIUM },
    "national",
  );
  if (!cmsLandscapeIsLoaded()) {
    const list = [...medigap];
    list.sort((a, b) => a.annual - b.annual);
    return list.map((plan, index) => ({ ...plan, rank: index + 1 }));
  }
  const maPartD = cmsLandscapeNationalPlans(input.year, input.medications);
  const list = [...maPartD, ...medigap];
  list.sort((a, b) => a.annual - b.annual);
  return setCachedFullCatalog(
    cacheKey,
    list.map((plan, index) => ({ ...plan, rank: index + 1 })),
  );
}

/**
 * Member regional catalog — zip3 premiums for Medigap/Part D, zip3 carrier availability,
 * and parish/county MA scoping when county is set.
 */
export function buildAreaPlanCatalog(input: AreaPlanCatalogInput): PlanDetail[] {
  const cacheKey = areaCatalogCacheKey(
    input.year,
    input.zip3,
    input.county,
    input.medications,
  );
  const cached = getCachedAreaCatalog(cacheKey);
  if (cached) return cached;

  const premiums = {
    baseG: medigapPremiumByZip3(input.zip3),
    basePartD: partDPremiumByZip3(input.zip3),
  };
  const medigap = buildMedigapCatalogList(input.year, input.medications, premiums, "regional").filter(
    (plan) => planAvailableInMemberRegion(plan, input.zip3, input.county),
  );

  if (!cmsLandscapeIsLoaded()) {
    const list = [...medigap];
    list.sort((a, b) => a.annual - b.annual);
    return list.map((plan, index) => ({ ...plan, rank: index + 1 }));
  }

  const maPartD = cmsLandscapePlansForZip3(
    input.zip3,
    input.year,
    input.medications,
    input.county,
  );

  const list = [...maPartD, ...medigap];
  list.sort((a, b) => a.annual - b.annual);
  return setCachedAreaCatalog(
    cacheKey,
    list.map((plan, index) => ({ ...plan, rank: index + 1 })),
  );
}
