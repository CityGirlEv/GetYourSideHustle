import { countiesForZip3, type Zip3County } from "@/lib/zip3-county-lookup";
import {
  GUIDELINES,
  medigapPremiumByZip3,
  partDPremiumByZip3,
  type Year,
} from "@/lib/medicare-math";
import { cmsLandscapeIsLoaded } from "@/lib/cms-landscape";
import { areaPlanDetails } from "@/lib/plan-details";
import { CMS_CATALOG, CMS_DATA_REVISION } from "@/data/cms-catalog";

/** Active plan year — matches scenario intake wizards. */
export function currentMedicarePlanYear(): Year {
  return new Date().getFullYear() < 2027 ? 2026 : 2027;
}

export type RegionalPartBBase = {
  year: Year;
  standardMonthlyPremium: number;
  annualDeductible: number;
  coinsurancePercent: number;
  source: string;
};

export type RegionalLocalBenchmarks = {
  medicareAdvantage: {
    label: string;
    premiumRangeMonthly: { low: number; high: number };
    moopRangeAnnual: { low: number; high: number };
    moopSourceNote: string;
    source: string;
  };
  medigap: {
    label: string;
    premiumRangeMonthly: { low: number; high: number };
    source: string;
  };
  partD: {
    label: string;
    premiumRangeMonthly: { low: number; high: number };
    federalOopCap: number;
    source: string;
  };
};

export type RegionalBenchmarkData = {
  year: Year;
  zip3: string;
  counties: Zip3County[];
  partBBase: RegionalPartBBase;
  localBenchmarks: RegionalLocalBenchmarks;
  catalogRevision: string;
};

const PARTD_CARRIER_MULTIPLIERS = [0.9, 0.95, 1.0, 1.05] as const;

function minMax(values: number[]): { low: number; high: number } {
  if (values.length === 0) return { low: 0, high: 0 };
  return { low: Math.min(...values), high: Math.max(...values) };
}

/**
 * Regional benchmark figures derived from CMS federal guidelines, ZIP-prefix PDP
 * region averages, and the CMS carrier catalog — not static report constants.
 */
export function buildRegionalBenchmarksFromZip3(
  zip3: string,
  year: Year = currentMedicarePlanYear(),
): RegionalBenchmarkData {
  const g = GUIDELINES[year];
  const counties = countiesForZip3(zip3);
  const planInput = { year, zip3, medications: [] as const };
  const allPlans = cmsLandscapeIsLoaded() ? areaPlanDetails(planInput) : [];
  const maPlans = allPlans.filter((p) => /medicare advantage/i.test(p.planType));
  const medigapPlans = allPlans.filter((p) => /medigap|medicare supplement/i.test(p.planType));
  const maPremiums = maPlans.map((p) => p.premiumPlan);
  const medigapPremiums =
    medigapPlans.length > 0
      ? medigapPlans.map((p) => p.premiumPlan)
      : [medigapPremiumByZip3(zip3)];

  const partDBase = partDPremiumByZip3(zip3);
  const partDPremiums = PARTD_CARRIER_MULTIPLIERS.map((m) => Math.round(partDBase * m));

  const countyLabel =
    counties.length > 0
      ? counties.map((c) => `${c.county}, ${c.stateCode}`).join("; ")
      : `ZIP prefix ${zip3}xx`;

  return {
    year,
    zip3,
    counties,
    catalogRevision: CMS_DATA_REVISION,
    partBBase: {
      year: g.year,
      standardMonthlyPremium: g.partBPremiumMonthly,
      annualDeductible: g.partBDeductible,
      coinsurancePercent: 20,
      source: `CMS ${year} Part B premium and deductible (national standard)`,
    },
    localBenchmarks: {
      medicareAdvantage: {
        label: "Medicare Advantage (Part C framework)",
        premiumRangeMonthly: minMax(maPremiums),
        moopRangeAnnual: { low: g.moopLow, high: g.moopHigh },
        moopSourceNote: `CMS ${year} Medicare Advantage in-network MOOP limits (${formatUsd(g.moopLow, 0)}–${formatUsd(g.moopHigh, 0)}) for frameworks modeled near ${countyLabel}.`,
        source: `CMS ${year} MOOP limits + ${CMS_CATALOG.advantageCarriers.length} reference Advantage carriers adjusted for ZIP prefix ${zip3}`,
      },
      partD: {
        label: "Prescription Drug Plans (Part D framework)",
        premiumRangeMonthly: minMax(partDPremiums),
        federalOopCap: g.partDOOPCap,
        source: `CMS ${year} Part D region average for ZIP prefix ${zip3} (${formatUsd(partDBase, 0)}/mo base) across carrier filing spread`,
      },
      medigap: {
        label: "Medicare Supplement (Medigap framework)",
        premiumRangeMonthly: minMax(medigapPremiums),
        source:
          medigapPlans.length > 0
            ? `Modeled Medigap letter plans near ${countyLabel} (${medigapPlans.length} supplement options in catalog)`
            : `CMS ${year} regional Medigap premium estimate for ZIP prefix ${zip3} (${formatUsd(medigapPremiumByZip3(zip3), 0)}/mo reference)`,
      },
    },
  };
}

export function formatUsd(amount: number, decimals = 2): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
