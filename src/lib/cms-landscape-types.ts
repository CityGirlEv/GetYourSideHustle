/** Compact CMS landscape plan record — produced by scripts/ingest-cms-landscape.ts */
export type CmsLandscapePlanRecord = {
  id: string;
  contractId: string;
  planId: string;
  segmentId: string;
  contractPlanId: string;
  contractCategory: string;
  state: string;
  county: string;
  parentOrganization: string;
  marketingName: string;
  planName: string;
  planType: string;
  snpIndicator: boolean;
  snpType: string;
  partDCoverage: boolean;
  partCPremium: number | null;
  partDTotalPremium: number | null;
  consolidatedPremium: number | null;
  partDDeductible: number | null;
  inNetworkMoop: number | null;
  partOopThreshold: number | null;
  overallStarRating: number | null;
  partCStarRating: number | null;
  partDStarRating: number | null;
  sanctioned: boolean;
};

export type CmsLandscapeManifest = {
  contractYear: number;
  sourceUrl: string;
  ingestedAt: string;
  planCount: number;
  countyBucketCount: number;
  disclaimer: string;
};
