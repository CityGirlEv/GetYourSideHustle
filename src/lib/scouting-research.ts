import type { MedicareAd } from "@/types/MedicareAd";
import {
  classifyScoutingAdCategories,
  countAdsByCategory,
  mergeScoutingAdCategories,
} from "@/lib/scouting-ad-categories";
import { buildScoutingAdAngleBundles, scoutingAdPrimaryText } from "@/lib/scouting-ad-angles";
import {
  classifyScoutingSiteProfile,
  scoutingCmsStatusLabel,
  scoutingSitePurposeLabel,
  type ScoutingCmsStatus,
  type ScoutingSitePurpose,
} from "@/lib/scouting-site-profile";
import { SITE_BRAND_THE } from "@/lib/site-brand";
import type {
  ScoutingAdCopyDraft,
  ScoutingAdRecord,
  ScoutingCompetitor,
  ScoutingCompetitorReviews,
  ScoutingReport,
  ScoutingReviewItem,
  ScoutingSourceId,
} from "@/types/scouting-report";

const HOOK_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Turning 65 enrollment window", re: /\bturning\s*65\b/i },
  { label: "Confusion / overwhelm", re: /\bconfus(ed|ing)|overwhelm(ed|ing)|complicated\b/i },
  { label: "Save money / $0 premium", re: /\$0|zero\s+dollar|save\s+\$|lower\s+(your\s+)?cost/i },
  { label: "Deadline / urgency", re: /\bdeadline|ends\s+soon|last\s+chance|before\s+enrollment\b/i },
  { label: "Social proof", re: /\bthousands|millions|trusted|rated|reviews?\b/i },
  { label: "Free comparison / quote", re: /\bfree\s+(comparison|quote|consult)/i },
  { label: "Doctor / drug coverage", re: /\bdoctor|prescription|meds?\s+covered|formulary\b/i },
  { label: "Broker secret / insider", re: /\bbrokers?\s+won't|insider|hidden\b/i },
  { label: "Question hook", re: /\?/ },
];

const PAIN_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Too many plan choices", re: /\btoo\s+many\s+(plans?|choices|options)\b/i },
  { label: "Fear of wrong plan", re: /\bwrong\s+plan|costly\s+mistake|risky\b/i },
  { label: "Missing enrollment window", re: /\bmiss(ed|ing)?\s+(the\s+)?(deadline|window|enrollment)\b/i },
  { label: "High out-of-pocket costs", re: /\boverpay|high\s+cost|deductible|copay\b/i },
  { label: "Losing doctors or drugs", re: /\blose\s+(your\s+)?doctor|not\s+covered\b/i },
];

const TOP_COMPETITOR_LIMIT = 10;

function cmsStatusRank(status: ScoutingCmsStatus): number {
  const order: ScoutingCmsStatus[] = ["official", "cms_compliant", "likely_compliant", "unknown"];
  return order.indexOf(status);
}

function mergeSitePurpose(purposes: ScoutingSitePurpose[]): ScoutingSitePurpose {
  const set = new Set(purposes.filter((p) => p !== "unknown"));
  if (set.has("both") || (set.has("educational") && set.has("tpmo"))) return "both";
  if (set.has("educational")) return "educational";
  if (set.has("tpmo")) return "tpmo";
  if (set.has("sales")) return "sales";
  return "unknown";
}

function mergeCmsStatus(statuses: ScoutingCmsStatus[]): ScoutingCmsStatus {
  return statuses.reduce(
    (best, status) => (cmsStatusRank(status) < cmsStatusRank(best) ? status : best),
    "unknown" as ScoutingCmsStatus,
  );
}

function extractReviewItems(ad: MedicareAd): ScoutingReviewItem[] {
  const fallbackUrl = ad.adUrl || ad.websiteUrl;
  if (ad.reviews?.length) {
    return ad.reviews
      .filter((r) => r.text.trim())
      .map((r) => ({
        snippet: r.text.trim(),
        reviewUrl: r.url || fallbackUrl,
        sourceLabel: r.sourceLabel,
      }));
  }
  return (ad.reviewSnippets ?? [])
    .filter(Boolean)
    .map((snippet) => ({
      snippet: snippet.trim(),
      reviewUrl: fallbackUrl,
      sourceLabel: "Landing page / ad",
    }));
}

function buildReviewsByCompetitor(
  ads: ScoutingAdRecord[],
  competitors: ScoutingCompetitor[],
): ScoutingCompetitorReviews[] {
  const byKey = new Map<string, ScoutingReviewItem[]>();

  for (const ad of ads) {
    const items = extractReviewItems(ad);
    if (!items.length) continue;
    const existing = byKey.get(ad.competitorKey) ?? [];
    byKey.set(ad.competitorKey, [...existing, ...items]);
  }

  return competitors
    .map((c) => {
      const competitorKey = normalizeKey(c.companyName);
      const raw = byKey.get(competitorKey) ?? [];
      const seen = new Set<string>();
      const reviews: ScoutingReviewItem[] = [];
      for (const item of raw) {
        const dedupe = `${item.snippet.toLowerCase()}::${item.reviewUrl}`;
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        reviews.push(item);
      }
      return {
        companyName: c.companyName,
        websiteUrl: c.websiteUrl,
        competitorKey,
        reviews,
      };
    })
    .filter((group) => group.reviews.length > 0);
}

function normalizeKey(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function uniqueStrings(items: string[], limit = 12): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= limit) break;
  }
  return out;
}

function collectFromPatterns(text: string, patterns: { label: string; re: RegExp }[]): string[] {
  const hits: string[] = [];
  for (const { label, re } of patterns) {
    if (re.test(text)) hits.push(label);
  }
  return hits;
}

export function extractHooksFromText(...parts: string[]): string[] {
  const blob = parts.filter(Boolean).join(" ");
  const fromPatterns = collectFromPatterns(blob, HOOK_PATTERNS);
  const sentences = blob
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12 && s.length <= 140);
  return uniqueStrings([...fromPatterns, ...sentences.slice(0, 4)], 8);
}

export function extractPainPointsFromText(...parts: string[]): string[] {
  const blob = parts.filter(Boolean).join(" ");
  return uniqueStrings(collectFromPatterns(blob, PAIN_PATTERNS), 6);
}

export function tagAdPlatform(ad: MedicareAd): ScoutingSourceId | "unknown" {
  if (ad.socialMedia.other.some((tag) => tag === "source:kalodata")) return "kalodata";
  const adUrl = ad.adUrl.toLowerCase();
  const website = ad.websiteUrl.toLowerCase();
  if (adUrl.includes("facebook.com") || website.includes("facebook.com")) return "facebook";
  if (adUrl.includes("tiktok.com") || website.includes("tiktok.com")) return "tiktok";
  if (website && !website.includes("google.com")) return "web";
  return "unknown";
}

export function isBlockedResearchUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.includes("google.com") ||
      host.includes("googleusercontent.com") ||
      host.includes("gstatic.com")
    );
  } catch {
    return true;
  }
}

export function sanitizeAdUrls(ad: MedicareAd): MedicareAd {
  const safeWebsite = isBlockedResearchUrl(ad.websiteUrl) ? "" : ad.websiteUrl;
  const safeAd = isBlockedResearchUrl(ad.adUrl) ? safeWebsite : ad.adUrl;
  return {
    ...ad,
    websiteUrl: safeWebsite,
    adUrl: safeAd || safeWebsite,
  };
}

function pickBestAngle(hooks: string[], painPoints: string[]): string {
  if (hooks.some((h) => /turning\s*65/i.test(h))) return "Turning-65 enrollment clarity";
  if (painPoints.some((p) => /wrong plan|too many/i.test(p))) return "Understand options before deciding";
  if (hooks.some((h) => /\$0|save|cost|premium/i.test(h))) return "Cost & premium education (illustrative)";
  if (hooks.some((h) => /confus/i.test(h))) return "Simplify Medicare research";
  if (hooks.some((h) => /doctor|drug/i.test(h))) return "Doctors & prescriptions research";
  return "Educational comparison — research with clarity";
}

const SCOUTING_SYNTH_HEADLINE_RE = /\b(free|best|#1|guaranteed|all plans)\b/i;

export function synthesizeMetaAdCopy(input: {
  companyName: string;
  hooks: string[];
  painPoints: string[];
  reviewSnippets: string[];
}): ScoutingAdCopyDraft {
  const angle = pickBestAngle(input.hooks, input.painPoints);
  const hookLine =
    input.hooks[0] ??
    "Turning 65 or comparing Medicare options can feel overwhelming.";
  const painLine =
    input.painPoints[0] ?? "Many plan types — not enough plain-language context before next steps.";

  const body = `${hookLine} ${painLine} ${SITE_BRAND_THE} is an educational Part B benchmark — no phone, no email, no login unless you choose. Explore illustrative frameworks privately before speaking with a licensed professional.`;

  let headline =
    angle.includes("Cost") || angle.includes("premium")
      ? "Understand Medicare cost basics"
      : "Medicare clarity before next steps";
  if (SCOUTING_SYNTH_HEADLINE_RE.test(headline)) {
    headline = "Explore Medicare options privately";
  }

  const description = "Educational benchmark — not enrollment advice.";

  return {
    competitorKey: normalizeKey(input.companyName),
    companyName: input.companyName,
    bestAngle: angle,
    primaryText: scoutingAdPrimaryText(body).slice(0, 2000),
    headline: headline.slice(0, 60),
    description: description.slice(0, 125),
    hooksUsed: input.hooks.slice(0, 3),
  };
}

export function buildScoutingReport(
  rawAds: MedicareAd[],
  warnings: string[] = [],
): ScoutingReport {
  const ads: ScoutingAdRecord[] = rawAds
    .map(sanitizeAdUrls)
    .filter((ad) => ad.companyName.trim().length > 0)
    .map((ad) => {
      const enriched = {
        ...ad,
        platform: tagAdPlatform(ad),
        competitorKey: normalizeKey(ad.companyName),
        hooks: ad.hooks?.length
          ? ad.hooks
          : extractHooksFromText(ad.primaryText, ad.headline, ad.description),
        painPoints: ad.painPoints?.length
          ? ad.painPoints
          : extractPainPointsFromText(ad.primaryText, ad.headline, ad.description),
      };
      const adCategories = classifyScoutingAdCategories(enriched);
      const profile = classifyScoutingSiteProfile(enriched);
      return {
        ...enriched,
        adCategories,
        sitePurpose: profile.sitePurpose,
        sitePurposeLabel: profile.sitePurposeLabel,
        cmsStatus: profile.cmsStatus,
        cmsStatusLabel: profile.cmsStatusLabel,
      };
    });

  const byCompetitor = new Map<string, ScoutingAdRecord[]>();
  for (const ad of ads) {
    const bucket = byCompetitor.get(ad.competitorKey) ?? [];
    bucket.push(ad);
    byCompetitor.set(ad.competitorKey, bucket);
  }

  const competitors: ScoutingCompetitor[] = [...byCompetitor.entries()]
    .map(([key, group]) => {
      const hooks = uniqueStrings(group.flatMap((a) => a.hooks ?? []), 6);
      const painPoints = uniqueStrings(group.flatMap((a) => a.painPoints ?? []), 5);
      const reviewSnippets = uniqueStrings(group.flatMap((a) => a.reviewSnippets ?? []), 4);
      const platforms = uniqueStrings(
        group.map((a) => a.platform).filter((p) => p !== "unknown"),
        3,
      );
      const websiteUrl =
        group.find((a) => a.websiteUrl && !isBlockedResearchUrl(a.websiteUrl))?.websiteUrl ?? "";
      const sampleAdUrl =
        group.find((a) => a.adUrl && !isBlockedResearchUrl(a.adUrl))?.adUrl ?? websiteUrl;
      const adCategories = mergeScoutingAdCategories(group.map((a) => a.adCategories));
      const sitePurpose = mergeSitePurpose(group.map((a) => a.sitePurpose));
      const cmsStatus = mergeCmsStatus(group.map((a) => a.cmsStatus));

      return {
        rank: 0,
        companyName: group[0]?.companyName ?? key,
        websiteUrl,
        adCount: group.length,
        platforms,
        topHooks: hooks,
        painPoints,
        reviewSnippets,
        sampleAdUrl,
        adCategories,
        sitePurpose,
        sitePurposeLabel: scoutingSitePurposeLabel(sitePurpose),
        cmsStatus,
        cmsStatusLabel: scoutingCmsStatusLabel(cmsStatus),
      };
    })
    .sort((a, b) => b.adCount - a.adCount || a.companyName.localeCompare(b.companyName))
    .slice(0, TOP_COMPETITOR_LIMIT)
    .map((c, index) => ({ ...c, rank: index + 1 }));

  const adCopies = competitors.map((c) =>
    synthesizeMetaAdCopy({
      companyName: c.companyName,
      hooks: c.topHooks,
      painPoints: c.painPoints,
      reviewSnippets: c.reviewSnippets,
    }),
  );

  const adAngleBundles = buildScoutingAdAngleBundles({ competitors });

  const allHooks = uniqueStrings(
    ads.flatMap((a) => a.hooks ?? []),
    24,
  );

  const allReviews = ads.flatMap((ad) =>
    extractReviewItems(ad).map((item) => ({
      companyName: ad.companyName,
      snippet: item.snippet,
      reviewUrl: item.reviewUrl,
      sourceLabel: item.sourceLabel,
    })),
  );

  const reviewsByCompetitor = buildReviewsByCompetitor(ads, competitors);

  return {
    competitors,
    ads,
    allHooks,
    allReviews,
    reviewsByCompetitor,
    adCopies,
    adAngleBundles,
    categoryCounts: countAdsByCategory(ads),
    warnings,
  };
}
