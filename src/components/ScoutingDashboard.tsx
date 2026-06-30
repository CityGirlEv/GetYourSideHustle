import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Table2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildScoutingReportAdmin,
  getScoutingSourceAdmin,
} from "@/lib/scouting.functions";
import {
  SCOUTING_AD_CATEGORY_HINTS,
  SCOUTING_AD_CATEGORY_LABELS,
  SCOUTING_AD_CATEGORY_ORDER,
} from "@/lib/scouting-ad-categories";
import {
  SCOUTING_AD_ANGLE_DEMOGRAPHICS,
  SCOUTING_AD_ANGLE_VOICEOVERS,
} from "@/lib/scouting-ad-angles";
import { isBlockedResearchUrl } from "@/lib/scouting-research";
import {
  isCmsCertifiedOrCompliant,
  matchesEducationalTpmoFocus,
  type ScoutingCmsStatus,
  type ScoutingSitePurpose,
} from "@/lib/scouting-site-profile";
import type { MedicareAd } from "@/types/MedicareAd";
import type {
  ScoutingAdCategory,
  ScoutingReport,
  ScoutingSourceId,
  ScoutingSourceStatus,
} from "@/types/scouting-report";
import { cn } from "@/lib/utils";

const SOURCE_ORDER: ScoutingSourceId[] = ["facebook", "tiktok", "web"];

const SOURCE_LABELS: Record<ScoutingSourceId, string> = {
  facebook: "Meta Ad Library",
  tiktok: "TikTok discover",
  web: "Competitor landing pages",
};

const CATEGORY_BADGE_CLASS: Record<ScoutingAdCategory, string> = {
  fmo: "border-violet-300 bg-violet-50 text-violet-900",
  medicare_gov: "border-sky-300 bg-sky-50 text-sky-900",
  tpmo: "border-amber-300 bg-amber-50 text-amber-950",
  agent: "border-emerald-300 bg-emerald-50 text-emerald-900",
};

const CMS_STATUS_BADGE: Record<ScoutingCmsStatus, string> = {
  official: "border-sky-400 bg-sky-100 text-sky-950",
  cms_compliant: "border-emerald-400 bg-emerald-100 text-emerald-950",
  likely_compliant: "border-teal-300 bg-teal-50 text-teal-950",
  unknown: "border-border bg-muted/50 text-muted-foreground",
};

const PURPOSE_BADGE: Record<ScoutingSitePurpose, string> = {
  educational: "border-indigo-300 bg-indigo-50 text-indigo-950",
  tpmo: "border-amber-300 bg-amber-50 text-amber-950",
  both: "border-violet-300 bg-violet-50 text-violet-950",
  sales: "border-rose-300 bg-rose-50 text-rose-950",
  unknown: "border-border bg-muted/50 text-muted-foreground",
};

type AdsViewMode = "table" | "grid";
type PurposeFilter = "educational_tpmo" | "all";

function initialSourceStatuses(): ScoutingSourceStatus[] {
  return SOURCE_ORDER.map((id) => ({
    id,
    label: SOURCE_LABELS[id],
    status: "pending",
  }));
}

function CmsStatusBadge({ status, label }: { status: ScoutingCmsStatus; label: string }) {
  const certified = isCmsCertifiedOrCompliant(status);
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium", CMS_STATUS_BADGE[status])}
      title={
        certified
          ? "Official CMS source or shows CMS-aligned disclaimers"
          : "CMS certification not detected from available copy"
      }
    >
      {certified ? "✓ " : ""}
      {label}
    </Badge>
  );
}

function SitePurposeBadge({ purpose, label }: { purpose: ScoutingSitePurpose; label: string }) {
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", PURPOSE_BADGE[purpose])}>
      {label}
    </Badge>
  );
}

function AdCategoryBadges({
  categories,
  className,
}: {
  categories: ScoutingAdCategory[];
  className?: string;
}) {
  if (!categories.length) {
    return (
      <Badge variant="outline" className={cn("text-[10px] font-normal text-muted-foreground", className)}>
        Unclassified
      </Badge>
    );
  }
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {categories.map((cat) => (
        <Badge
          key={cat}
          variant="outline"
          title={SCOUTING_AD_CATEGORY_HINTS[cat]}
          className={cn("text-[10px] font-medium", CATEGORY_BADGE_CLASS[cat])}
        >
          {SCOUTING_AD_CATEGORY_LABELS[cat]}
        </Badge>
      ))}
    </div>
  );
}

function SourceStatusRow({ source }: { source: ScoutingSourceStatus }) {
  const icon =
    source.status === "running" ? (
      <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
    ) : source.status === "done" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
    ) : source.status === "error" ? (
      <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
    ) : source.status === "skipped" ? (
      <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
    ) : (
      <span className="h-4 w-4 rounded-full border border-border bg-muted" aria-hidden />
    );

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{source.label}</p>
          {typeof source.adCount === "number" ? (
            <Badge variant="secondary" className="text-[10px]">
              {source.adCount} found
            </Badge>
          ) : null}
        </div>
        {source.message ? (
          <p className="text-xs text-muted-foreground leading-relaxed">{source.message}</p>
        ) : source.status === "pending" ? (
          <p className="text-xs text-muted-foreground">Waiting…</p>
        ) : source.status === "running" ? (
          <p className="text-xs text-muted-foreground">Processing…</p>
        ) : null}
      </div>
    </div>
  );
}

function SafeExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (!href || isBlockedResearchUrl(href)) {
    return <span className={className}>{children}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1 text-primary underline", className)}
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
    </a>
  );
}

export function ScoutingDashboard() {
  const fetchSource = useServerFn(getScoutingSourceAdmin);
  const buildReport = useServerFn(buildScoutingReportAdmin);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<ScoutingSourceStatus[]>(initialSourceStatuses);
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ScoutingAdCategory | "all">("all");
  const [purposeFilter, setPurposeFilter] = useState<PurposeFilter>("educational_tpmo");
  const [adsViewMode, setAdsViewMode] = useState<AdsViewMode>("table");

  const runScouting = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    setCategoryFilter("all");
    setPurposeFilter("educational_tpmo");
    setSources(initialSourceStatuses());

    const collected: MedicareAd[] = [];

    try {
      for (const sourceId of SOURCE_ORDER) {
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId ? { ...s, status: "running", message: "Processing…" } : s,
          ),
        );

        const result = await fetchSource({ data: { source: sourceId } });
        collected.push(...(result.ads ?? []));
        setSources((prev) => prev.map((s) => (s.id === sourceId ? result.status : s)));
      }

      const built = await buildReport({ data: { ads: collected } });
      setReport(built);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load competitor scouting data.");
    } finally {
      setLoading(false);
    }
  }, [buildReport, fetchSource]);

  useEffect(() => {
    void runScouting();
  }, [runScouting]);

  const filteredAds = (() => {
    if (!report) return [];
    let ads = report.ads;
    if (purposeFilter === "educational_tpmo") {
      ads = ads.filter((ad) => matchesEducationalTpmoFocus(ad.sitePurpose));
    }
    if (categoryFilter !== "all") {
      ads = ads.filter((ad) => ad.adCategories.includes(categoryFilter));
    }
    return ads;
  })();

  return (
    <Card className="glass p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary shrink-0" aria-hidden />
            <h3 className="font-display font-bold">Competitor scouting</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Meta Ad Library, TikTok, and curated Medicare competitor pages — tagged as FMO, Medicare
            / Gov, TPMO, or Agent (one ad can have several).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void runScouting()}
          disabled={loading}
          className="shrink-0 gap-1.5"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden />
          {loading ? "Refreshing…" : "Refresh scouting"}
        </Button>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4 space-y-3">
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          )}
          <p className="text-sm font-semibold">
            {loading ? "Processing competitor sources…" : "Scouting run complete"}
          </p>
        </div>
        <div className="grid gap-2">
          {sources.map((source) => (
            <SourceStatusRow key={source.id} source={source} />
          ))}
        </div>
      </div>

      {!loading && report ? (
        <div className="rounded-lg border border-border/70 bg-background/50 p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Filters
            </p>
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setPurposeFilter("educational_tpmo")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-medium transition-colors",
                  purposeFilter === "educational_tpmo"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted/50",
                )}
              >
                Educational + TPMO focus
              </button>
              <button
                type="button"
                onClick={() => setPurposeFilter("all")}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-medium border-l border-border transition-colors",
                  purposeFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted/50",
                )}
              >
                All site types
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Default view highlights educational sites and TPMO competitors. CMS status is inferred
            from official domains and disclaimer language — verify on each site before relying on it.
          </p>
          <div className="flex flex-wrap gap-2">
            {SCOUTING_AD_CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter((prev) => (prev === cat ? "all" : cat))}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
                  CATEGORY_BADGE_CLASS[cat],
                  categoryFilter === cat && "ring-2 ring-primary ring-offset-1",
                )}
                title={SCOUTING_AD_CATEGORY_HINTS[cat]}
              >
                <span className="font-semibold">{SCOUTING_AD_CATEGORY_LABELS[cat]}</span>
                <span className="opacity-80">({report.categoryCounts[cat]})</span>
              </button>
            ))}
            {categoryFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className="text-xs text-primary underline px-1"
              >
                Clear filter
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
        <p className="font-semibold">Why Google links showed a CAPTCHA</p>
        <p className="mt-1">
          The old web fetcher scraped{" "}
          <code className="rounded bg-amber-100 px-1">google.com/search?q=medicare+ads</code> from the
          server. Google flags automated traffic (different IP than your browser) and returns a
          &quot;unusual traffic&quot; block. Those URLs were saved as competitor links. We now use
          curated competitor landing pages instead and never surface Google search URLs.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && report ? (
        <Tabs defaultValue="competitors" className="space-y-3">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="competitors">Top 10 competitors</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="hooks">Hooks</TabsTrigger>
            <TabsTrigger value="ads">Their ads</TabsTrigger>
            <TabsTrigger value="ad-copy">Ad copy</TabsTrigger>
          </TabsList>

          <TabsContent value="competitors" className="space-y-2">
            {report.competitors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No competitors yet. Add FACEBOOK_ACCESS_TOKEN for live Meta ads, or refresh to load
                curated web competitors.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Competitor</th>
                      <th className="px-3 py-2">Site type</th>
                      <th className="px-3 py-2">CMS status</th>
                      <th className="px-3 py-2">Marketing type</th>
                      <th className="px-3 py-2">Ads</th>
                      <th className="px-3 py-2">Platforms</th>
                      <th className="px-3 py-2">Top hooks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.competitors.map((c) => (
                      <tr key={c.companyName} className="border-t border-border align-top">
                        <td className="px-3 py-2 text-xs font-mono">{c.rank}</td>
                        <td className="px-3 py-2 text-xs">
                          <SafeExternalLink href={c.websiteUrl}>{c.companyName}</SafeExternalLink>
                        </td>
                        <td className="px-3 py-2 text-xs min-w-[7rem]">
                          <SitePurposeBadge purpose={c.sitePurpose} label={c.sitePurposeLabel} />
                        </td>
                        <td className="px-3 py-2 text-xs min-w-[7rem]">
                          <CmsStatusBadge status={c.cmsStatus} label={c.cmsStatusLabel} />
                        </td>
                        <td className="px-3 py-2 text-xs min-w-[8rem]">
                          <AdCategoryBadges categories={c.adCategories} />
                        </td>
                        <td className="px-3 py-2 text-xs">{c.adCount}</td>
                        <td className="px-3 py-2 text-xs">
                          {c.platforms.length ? c.platforms.join(", ") : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs max-w-[14rem]">
                          {c.topHooks.slice(0, 2).join(" · ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-3">
            {report.reviewsByCompetitor.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No review snippets captured yet. Meta Ad Library comments and landing-page trust
                badges will populate here when available.
              </p>
            ) : (
              report.reviewsByCompetitor.map((group) => (
                <div
                  key={group.competitorKey}
                  className="rounded-lg border border-border/70 bg-background/60 overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-secondary/30 px-3 py-2.5">
                    <div className="min-w-0">
                      <SafeExternalLink href={group.websiteUrl} className="text-sm font-semibold">
                        {group.companyName}
                      </SafeExternalLink>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {group.reviews.length} review snippet{group.reviews.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <ul className="divide-y divide-border/60">
                    {group.reviews.map((review, idx) => (
                      <li key={`${group.competitorKey}-${idx}`} className="px-3 py-2.5 space-y-1">
                        <p className="text-xs leading-relaxed">{review.snippet}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {review.sourceLabel ? (
                            <span className="text-[10px] text-muted-foreground">{review.sourceLabel}</span>
                          ) : null}
                          {review.reviewUrl && !isBlockedResearchUrl(review.reviewUrl) ? (
                            <SafeExternalLink href={review.reviewUrl} className="text-[11px] font-medium">
                              Open review source
                            </SafeExternalLink>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="hooks" className="space-y-2">
            {report.allHooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hooks extracted yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {report.allHooks.map((hook) => (
                  <Badge key={hook} variant="outline" className="text-xs font-normal">
                    {hook}
                  </Badge>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ads" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground space-y-0.5">
                {purposeFilter === "educational_tpmo" ? (
                  <p>Showing educational sites and TPMO competitors only.</p>
                ) : null}
                {categoryFilter !== "all" ? (
                  <p>
                    Marketing type: {SCOUTING_AD_CATEGORY_LABELS[categoryFilter]} —{" "}
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className="text-primary underline"
                    >
                      clear
                    </button>
                  </p>
                ) : null}
                <p>{filteredAds.length} ad{filteredAds.length === 1 ? "" : "s"}</p>
              </div>
              <div className="flex rounded-md border border-border overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setAdsViewMode("table")}
                  aria-pressed={adsViewMode === "table"}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors",
                    adsViewMode === "table"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted/50",
                  )}
                >
                  <Table2 className="h-3.5 w-3.5" aria-hidden />
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setAdsViewMode("grid")}
                  aria-pressed={adsViewMode === "grid"}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border-l border-border transition-colors",
                    adsViewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted/50",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                  Grid
                </button>
              </div>
            </div>

            {filteredAds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ads match this filter.</p>
            ) : adsViewMode === "table" ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Competitor</th>
                      <th className="px-3 py-2">Platform</th>
                      <th className="px-3 py-2">Site type</th>
                      <th className="px-3 py-2">CMS status</th>
                      <th className="px-3 py-2">Marketing type</th>
                      <th className="px-3 py-2">Headline</th>
                      <th className="px-3 py-2">Primary text</th>
                      <th className="px-3 py-2">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAds.map((ad, idx) => (
                      <tr key={`${ad.adUrl}-${idx}`} className="border-t border-border align-top">
                        <td className="px-3 py-2 text-xs font-medium min-w-[7rem]">{ad.companyName}</td>
                        <td className="px-3 py-2 text-xs uppercase">{ad.platform}</td>
                        <td className="px-3 py-2 text-xs min-w-[6.5rem]">
                          <SitePurposeBadge purpose={ad.sitePurpose} label={ad.sitePurposeLabel} />
                        </td>
                        <td className="px-3 py-2 text-xs min-w-[6.5rem]">
                          <CmsStatusBadge status={ad.cmsStatus} label={ad.cmsStatusLabel} />
                        </td>
                        <td className="px-3 py-2 text-xs min-w-[7rem]">
                          <AdCategoryBadges categories={ad.adCategories} />
                        </td>
                        <td className="px-3 py-2 text-xs max-w-[10rem]">{ad.headline || "—"}</td>
                        <td className="px-3 py-2 text-xs max-w-[14rem] leading-relaxed">
                          {ad.primaryText || "—"}
                        </td>
                        <td className="px-3 py-2 text-xs whitespace-nowrap">
                          {ad.adUrl ? (
                            <SafeExternalLink href={ad.adUrl} className="text-xs">
                              View
                            </SafeExternalLink>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredAds.map((ad, idx) => (
                  <div
                    key={`${ad.adUrl}-${idx}`}
                    className="rounded-lg border border-border/70 bg-background/60 p-3 space-y-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{ad.companyName}</p>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {ad.platform}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <SitePurposeBadge purpose={ad.sitePurpose} label={ad.sitePurposeLabel} />
                      <CmsStatusBadge status={ad.cmsStatus} label={ad.cmsStatusLabel} />
                    </div>
                    <AdCategoryBadges categories={ad.adCategories} />
                    <p className="text-xs">
                      <span className="text-muted-foreground">Headline:</span> {ad.headline || "—"}
                    </p>
                    <p className="text-xs leading-relaxed">
                      <span className="text-muted-foreground">Primary:</span> {ad.primaryText || "—"}
                    </p>
                    {ad.adUrl ? (
                      <SafeExternalLink href={ad.adUrl} className="text-xs">
                        View ad / landing page
                      </SafeExternalLink>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ad-copy" className="space-y-4">
            <div className="rounded-lg border border-sky-200/80 bg-sky-50/60 px-3 py-2.5 text-xs leading-relaxed text-sky-950">
              <p className="font-semibold">CMS-compliant Meta ad copy by angle</p>
              <p className="mt-1">
                Each angle includes primary text (with government + Multi-Plan disclaimer),
                headline, description, and separate image/video prompts. Do not burn disclaimers,
                premiums, or carrier names into creatives — add copy only in Ads Manager.
              </p>
            </div>
            {report.adAngleBundles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ad angle bundles yet.</p>
            ) : (
              report.adAngleBundles.map((bundle) => (
                <div
                  key={bundle.angleId}
                  className="rounded-xl border border-primary/20 bg-background/80 p-4 space-y-3"
                >
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                      Angle
                    </Badge>
                    <h4 className="font-display text-base font-bold text-primary">
                      {bundle.angleLabel}
                    </h4>
                    {bundle.competitorExamples.length ? (
                      <p className="text-[11px] text-muted-foreground">
                        Inspired by competitor patterns:{" "}
                        {bundle.competitorExamples.join(", ")}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Meta ad copy (Ads Manager)
                      </p>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">
                        <span className="font-semibold text-foreground">Primary text:</span>
                        {"\n"}
                        {bundle.primaryText}
                      </p>
                      <p className="text-xs">
                        <span className="font-semibold text-muted-foreground">Headline:</span>{" "}
                        {bundle.headline}
                      </p>
                      <p className="text-xs">
                        <span className="font-semibold text-muted-foreground">Description:</span>{" "}
                        {bundle.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-lg border border-violet-200/70 bg-violet-50/50 p-3">
                        <p className="text-xs font-semibold text-violet-900 mb-1.5">
                          Image prompt
                        </p>
                        <p className="text-[11px] leading-relaxed text-violet-950 whitespace-pre-wrap font-mono">
                          {bundle.imagePrompt}
                        </p>
                      </div>
                      <div className="rounded-lg border border-indigo-200/70 bg-indigo-50/50 p-3">
                        <p className="text-xs font-semibold text-indigo-900 mb-1.5">
                          Video prompt
                        </p>
                        <p className="text-[11px] leading-relaxed text-indigo-950 whitespace-pre-wrap font-mono">
                          {bundle.videoPrompt}
                        </p>
                      </div>
                    </div>
                  </div>

                  {bundle.hooksUsed.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {bundle.hooksUsed.map((hook) => (
                        <Badge key={hook} variant="outline" className="text-[10px] font-normal">
                          {hook}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  <details className="text-[11px] text-muted-foreground">
                    <summary className="cursor-pointer font-medium text-foreground">
                      CMS compliance notes
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                      {bundle.cmsComplianceNotes}
                    </p>
                  </details>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      ) : null}
    </Card>
  );
}
