import type { MedicareAd } from "@/types/MedicareAd";

/** How the site positions itself — educational content, TPMO lead-gen, or both. */
export type ScoutingSitePurpose = "educational" | "tpmo" | "both" | "sales" | "unknown";

/** CMS alignment — official gov source vs marketing compliance signals. */
export type ScoutingCmsStatus = "official" | "cms_compliant" | "likely_compliant" | "unknown";

export type ScoutingSiteProfile = {
  sitePurpose: ScoutingSitePurpose;
  cmsStatus: ScoutingCmsStatus;
  cmsStatusLabel: string;
  sitePurposeLabel: string;
};

const OFFICIAL_HOST =
  /(^|\.)((www\.)?medicare\.gov|cms\.gov|ssa\.gov|hhs\.gov|healthcare\.gov|shiphelp\.org)(\/|$)/i;

const EDUCATIONAL_TEXT =
  /\b(educational|learn about|guide to|workbook|benchmark|understand your options|compare options|not enrollment advice|for information only|resources|explore medicare basics|turning 65 guide|what is medicare|official medicare website|public education)\b/i;

const TPMO_TEXT =
  /\b(do not offer every plan|don't offer every plan|not offer all plans|we represent|represents? medicare|third[- ]party|tpmo|not affiliated with (the )?u\.?s\.? government|not connected with medicare|multiple carriers|plans in your area|licensed (insurance )?agent|speak with (a |an )?agent|call (today|now|us))\b/i;

const SALES_TEXT =
  /\b(enroll now|apply now|sign up|get started today|shop plans|buy now|limited time|act now|call now for)\b/i;

const CMS_COMPLIANT_TEXT =
  /\b(do not offer every plan|don't offer every plan|not affiliated with (the )?u\.?s\.? government|medicare\.gov|1-800-medicare|multi-plan disclaimer|not connected with medicare|cms\b|centers for medicare|ship\b|state health insurance assistance)\b/i;

const CARRIER_HOST =
  /\b(humana|uhc|unitedhealth|aetna|cigna|anthem|bcbs|bluecross|wellcare|molina|devoted|alignment)\b/i;

function textBlob(ad: MedicareAd): string {
  return [
    ad.companyName,
    ad.websiteUrl,
    ad.adUrl,
    ad.primaryText,
    ad.description,
    ad.headline,
    ...(ad.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

const PURPOSE_LABELS: Record<ScoutingSitePurpose, string> = {
  educational: "Educational",
  tpmo: "TPMO",
  both: "Educational + TPMO",
  sales: "Sales / enrollment",
  unknown: "Unknown",
};

const CMS_LABELS: Record<ScoutingCmsStatus, string> = {
  official: "CMS official",
  cms_compliant: "CMS compliant",
  likely_compliant: "Likely compliant",
  unknown: "Not verified",
};

export function scoutingSitePurposeLabel(purpose: ScoutingSitePurpose): string {
  return PURPOSE_LABELS[purpose];
}

export function scoutingCmsStatusLabel(status: ScoutingCmsStatus): string {
  return CMS_LABELS[status];
}

export function classifyScoutingSiteProfile(ad: MedicareAd): ScoutingSiteProfile {
  const blob = textBlob(ad);
  const hosts = [hostFromUrl(ad.websiteUrl), hostFromUrl(ad.adUrl)].filter(Boolean);
  const isOfficial = hosts.some((h) => OFFICIAL_HOST.test(h));

  let cmsStatus: ScoutingCmsStatus = "unknown";
  if (isOfficial) {
    cmsStatus = "official";
  } else if (CMS_COMPLIANT_TEXT.test(blob)) {
    cmsStatus = "cms_compliant";
  } else if (EDUCATIONAL_TEXT.test(blob) && !SALES_TEXT.test(blob)) {
    cmsStatus = "likely_compliant";
  }

  const hasEducational = EDUCATIONAL_TEXT.test(blob) || isOfficial;
  const hasTpmo = TPMO_TEXT.test(blob);
  const hasSales = SALES_TEXT.test(blob) || CARRIER_HOST.test(blob);

  let sitePurpose: ScoutingSitePurpose = "unknown";
  if (hasEducational && hasTpmo) {
    sitePurpose = "both";
  } else if (hasTpmo) {
    sitePurpose = "tpmo";
  } else if (hasEducational) {
    sitePurpose = "educational";
  } else if (hasSales) {
    sitePurpose = "sales";
  } else if (isOfficial) {
    sitePurpose = "educational";
  }

  return {
    sitePurpose,
    cmsStatus,
    sitePurposeLabel: PURPOSE_LABELS[sitePurpose],
    cmsStatusLabel: CMS_LABELS[cmsStatus],
  };
}

/** Default scouting focus — educational properties and TPMO competitors. */
export function matchesEducationalTpmoFocus(purpose: ScoutingSitePurpose): boolean {
  return purpose === "educational" || purpose === "tpmo" || purpose === "both";
}

export function isCmsCertifiedOrCompliant(status: ScoutingCmsStatus): boolean {
  return status === "official" || status === "cms_compliant" || status === "likely_compliant";
}
