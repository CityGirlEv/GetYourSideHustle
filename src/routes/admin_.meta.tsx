import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import { FacebookAdCampaignOverview } from "@/components/content-factory/FacebookAdCampaignCard";
import {
  FACEBOOK_AD_CAMPAIGNS,
  FACEBOOK_AD_CAMPAIGN_ID,
  getFacebookAdScheduleDates,
  FACEBOOK_AD_LAUNCH_TIME,
  FACEBOOK_AD_PRODUCE_TIME,
} from "@/lib/content-factory/facebook-ad-launch";
import type { EditorialMilestone } from "@/lib/content-factory/weekly-editorial-schedule";
import { formatEditorialTimeLabel } from "@/lib/content-factory/weekly-editorial-schedule";
import { ArrowLeft, CalendarClock, Facebook, Megaphone } from "lucide-react";

export const Route = createFileRoute("/admin_/meta")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { campaign?: string; milestone?: EditorialMilestone } => ({
    campaign: typeof search.campaign === "string" ? search.campaign : undefined,
    milestone:
      search.milestone === "produce" || search.milestone === "launch"
        ? search.milestone
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Meta — Facebook Ads" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MetaAdminPage,
});

function MetaAdminPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const { campaign: campaignId = FACEBOOK_AD_CAMPAIGN_ID, milestone: focusMilestone } =
    Route.useSearch();
  const produceRef = useRef<HTMLDivElement>(null);
  const launchRef = useRef<HTMLDivElement>(null);
  const dates = getFacebookAdScheduleDates();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth", search: { tab: "sign-in" } });
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!focusMilestone) return;
    const el = focusMilestone === "produce" ? produceRef.current : launchRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusMilestone]);

  const visibleCampaigns =
    campaignId && campaignId !== FACEBOOK_AD_CAMPAIGN_ID
      ? FACEBOOK_AD_CAMPAIGNS.filter((c) => c.id === campaignId)
      : FACEBOOK_AD_CAMPAIGNS;

  return (
    <AdminAccessGate>
      <AppShell
        title="Meta"
        subtitle="Paid Facebook & Instagram ads — copy, creative prompts, targeting, and Ads Manager checklists on one page."
      >
        <div className="max-w-3xl mx-auto space-y-4 px-2 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/calendar">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </Link>
            <Link to="/admin/facebook-posts">
              <Button variant="outline" size="sm">
                <Facebook className="h-4 w-4 mr-1" />
                Facebook Posts
              </Button>
            </Link>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <CalendarClock className="h-4 w-4" />
              Active ad schedule
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Tonight ({dates.produceDate})</strong> at{" "}
              {formatEditorialTimeLabel(FACEBOOK_AD_PRODUCE_TIME)} — build creative and save draft in
              Ads Manager.
              <br />
              <strong className="text-foreground">Tomorrow ({dates.launchDate})</strong> at{" "}
              {formatEditorialTimeLabel(FACEBOOK_AD_LAUNCH_TIME)} ET — confirm ad is scheduled or
              live.
            </p>
          </div>

          {visibleCampaigns.map((campaign) => (
            <FacebookAdCampaignOverview
              key={campaign.id}
              campaign={campaign}
              focusMilestone={focusMilestone}
              produceRef={produceRef}
              launchRef={launchRef}
            />
          ))}

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Megaphone className="h-3.5 w-3.5" />
            Calendar prep/launch tasks link here — open from{" "}
            <Link to="/admin/calendar" className="text-primary underline underline-offset-2">
              Content Calendar
            </Link>{" "}
            daily view.
          </p>
        </div>
      </AppShell>
    </AdminAccessGate>
  );
}
