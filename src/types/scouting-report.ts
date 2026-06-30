import type { MedicareAd } from "@/types/MedicareAd";
import type { ScoutingCmsStatus, ScoutingSitePurpose } from "@/lib/scouting-site-profile";

export type ScoutingSourceId = "facebook" | "tiktok" | "web";

/** Medicare marketing entity type — an ad may match several. */
export type ScoutingAdCategory = "fmo" | "medicare_gov" | "tpmo" | "agent";

export type ScoutingSourceStatus = {
  id: ScoutingSourceId;
  label: string;
  status: "pending" | "running" | "done" | "error" | "skipped";
  message?: string;
  adCount?: number;
};

export type ScoutingCompetitor = {
  rank: number;
  companyName: string;
  websiteUrl: string;
  adCount: number;
  platforms: string[];
  topHooks: string[];
  painPoints: string[];
  reviewSnippets: string[];
  sampleAdUrl: string;
  adCategories: ScoutingAdCategory[];
  sitePurpose: ScoutingSitePurpose;
  sitePurposeLabel: string;
  cmsStatus: ScoutingCmsStatus;
  cmsStatusLabel: string;
};

export type ScoutingReviewItem = {
  snippet: string;
  reviewUrl: string;
  sourceLabel?: string;
};

export type ScoutingCompetitorReviews = {
  companyName: string;
  websiteUrl: string;
  competitorKey: string;
  reviews: ScoutingReviewItem[];
};

export type ScoutingAdRecord = MedicareAd & {
  platform: ScoutingSourceId | "unknown";
  competitorKey: string;
  adCategories: ScoutingAdCategory[];
  sitePurpose: ScoutingSitePurpose;
  sitePurposeLabel: string;
  cmsStatus: ScoutingCmsStatus;
  cmsStatusLabel: string;
};

export type ScoutingAdCopyDraft = {
  competitorKey: string;
  companyName: string;
  bestAngle: string;
  primaryText: string;
  headline: string;
  description: string;
  hooksUsed: string[];
};

export type ScoutingAdAngleId =
  | "turning_65"
  | "avoid_mistakes"
  | "cost_education"
  | "simplify_confusion"
  | "doctors_meds"
  | "confidence_education";

/** CMS-compliant Meta ad bundle organized by marketing angle. */
export type ScoutingAdAngleBundle = {
  angleId: ScoutingAdAngleId;
  angleLabel: string;
  primaryText: string;
  headline: string;
  description: string;
  imagePrompt: string;
  videoPrompt: string;
  cmsComplianceNotes: string;
  hooksUsed: string[];
  competitorExamples: string[];
};

export type ScoutingReport = {
  competitors: ScoutingCompetitor[];
  ads: ScoutingAdRecord[];
  allHooks: string[];
  allReviews: { companyName: string; snippet: string; reviewUrl: string; sourceLabel?: string }[];
  reviewsByCompetitor: ScoutingCompetitorReviews[];
  adCopies: ScoutingAdCopyDraft[];
  /** Primary ad-copy tab data — one bundle per angle with image + video prompts. */
  adAngleBundles: ScoutingAdAngleBundle[];
  categoryCounts: Record<ScoutingAdCategory, number>;
  warnings: string[];
};
