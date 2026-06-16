import catalog from "./cms-catalog-2026.json";

export interface MedigapPlanRow {
  "Plan Letter": string;
  "Enrollment Status": string;
  "General Summary": string;
  "Part A Coinsurance": string;
  "Part B Coinsurance": string;
  "Blood (First 3 Pints)": string;
  "Part A Hospice Coinsurance": string;
  "Skilled Nursing Coinsurance": string;
  "Part A Deductible": string;
  "Part B Deductible": string;
  "Part B Excess Charges": string;
  "Foreign Travel Emergency": string;
}

export interface CarrierRow {
  "Carrier Name": string;
  "National Footprint": string;
  "Market Share Tier": string;
  "A.M. Best Rating": string;
  "Key Characteristics": string;
  "Carrier Portal"?: string;
}

export interface AdvantageTypeRow {
  "Plan Type": string;
  "Full Name": string;
  "Enrollment Status": string;
  Description: string;
  "Pros / Advantages": string;
  "Cons / Trade-offs": string;
}

export interface PartDTierRow {
  [k: string]: string | number | null | undefined;
}

export interface CmsCatalog {
  year: 2026;
  medigapPlans: MedigapPlanRow[];
  medigapCarriers: CarrierRow[];
  advantageTypes: AdvantageTypeRow[];
  advantageCarriers: CarrierRow[];
  partDPlans: PartDTierRow[];
  partDCarriers: CarrierRow[];
}

const raw = catalog as Record<string, unknown[]>;

export const CMS_CATALOG: CmsCatalog = {
  year: 2026,
  medigapPlans: (raw["Medigap Plans"] ?? []) as MedigapPlanRow[],
  medigapCarriers: (raw["Medigap Carriers"] ?? []) as CarrierRow[],
  advantageTypes: (raw["Advantage Plan Types"] ?? []) as AdvantageTypeRow[],
  advantageCarriers: (raw["Advantage Carriers"] ?? []) as CarrierRow[],
  partDPlans: (raw["Part D Rx Plans"] ?? []) as PartDTierRow[],
  partDCarriers: (raw["Part D Carriers"] ?? []) as CarrierRow[],
};

export function openMedigapLetters(): MedigapPlanRow[] {
  return CMS_CATALOG.medigapPlans.filter((p) => !/closed/i.test(p["Enrollment Status"] ?? ""));
}

export function openAdvantageTypes(): AdvantageTypeRow[] {
  return CMS_CATALOG.advantageTypes.filter((p) => !/closed/i.test(p["Enrollment Status"] ?? ""));
}

export const CMS_DATA_REVISION = "CMS-approved reference catalog, plan year 2026";
// Plan benefit data sourced from CMS standardized Medigap policies
// (https://www.cms.gov/medicare/health-plans/medigap) and Medicare Plan Finder
// landscape files (https://www.medicare.gov/plan-compare).
