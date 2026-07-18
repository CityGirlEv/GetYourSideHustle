import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck, EyeOff, KeyRound, Mic } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { HomeCoverHero, HOME_COVER_HERO_ASPECT_CLASS } from "@/components/HomeCoverHero";
import { HomeHowItWorksVideo } from "@/components/HomeHowItWorksVideo";
import { SITE_BRAND_NAME, SITE_TAGLINE, SITE_BRAND_THE } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";
import { isVoiceWizardAvailable } from "@/lib/feature-flags";
import { useApp } from "@/lib/app-store";
import {
  BUILD_COMPARISON_HEADLINE,
  BUILD_COMPARISON_SUBTITLE,
  BENCHMARK_TOOL_CTA,
  HOME_BENCHMARK_BANNER_EMPHASIS,
  HOME_BENCHMARK_BANNER_LEAD,
  NO_PHI_PII_COLLECTION_NOTE_LINE_1,
  NO_PHI_PII_COLLECTION_NOTE_LINE_2,
} from "@/lib/plan-comparison-copy";

const HOME_URL = canonicalUrl("/");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_BRAND_NAME} — De-identified Plan Comparison` },
      {
        name: "description",
        content:
          "Use the Part B Optimizer Benchmark Tool without giving up your personal information. De-identified educational comparisons you control.",
      },
      { property: "og:title", content: `${SITE_BRAND_NAME} — De-identified Plan Comparison` },
      {
        property: "og:description",
        content:
          "Use the Part B Optimizer Benchmark Tool without giving up your personal information. De-identified educational comparisons you control.",
      },
      { property: "og:url", content: HOME_URL },
    ],
    links: [{ rel: "canonical", href: HOME_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_BRAND_NAME,
          url: HOME_URL,
          description: "De-identified Medicare plan comparison for 2026 and 2027.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_BRAND_NAME,
          url: HOME_URL,
          description:
            "Medicare plan comparison tool using de-identified sample comparisons under live federal rules.",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useApp();
  const voiceWizardAvailable = isVoiceWizardAvailable(user);

  return (
    <AppShell title="">
      <div className="space-y-3 lg:space-y-4">
        <div className="flex w-full justify-center px-2 sm:px-0">
          <h2 className="max-w-[17rem] text-balance text-center font-display text-2xl font-bold leading-tight text-primary sm:max-w-none">
            <span className="block sm:inline">Picking a Medicare Plan</span>{" "}
            <span className="block sm:inline">Shouldn&apos;t Be This Confusing!</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-4">
          <div className={`overflow-hidden rounded-2xl ${HOME_COVER_HERO_ASPECT_CLASS}`}>
            <HomeCoverHero className="h-full w-full" fillHeight />
          </div>

          <div
            className={`glass flex min-h-0 flex-col overflow-hidden rounded-2xl text-center ${HOME_COVER_HERO_ASPECT_CLASS}`}
          >
            <div className="flex h-full flex-1 flex-col justify-between gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5">
              <div className="w-full shrink-0 rounded-lg border border-primary/40 bg-primary px-2.5 py-2 text-[11px] font-semibold leading-snug text-primary-foreground shadow-sm sm:text-xs">
                <div className="flex items-start justify-center gap-1.5 text-left sm:text-center">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-foreground sm:mx-auto sm:h-4 sm:w-4" />
                  <span className="text-primary-foreground">
                    No phone, no email, no login. Your privacy is protected and completely anonymous
                    unless you opt in.
                  </span>
                </div>
              </div>

              <div className="flex w-full min-w-0 shrink-0 flex-col items-center gap-2">
                <div className="mx-auto w-full min-w-0 max-w-md space-y-1">
                  <h2 className="font-display text-base font-bold uppercase leading-tight sm:text-lg md:text-xl">
                    {BUILD_COMPARISON_HEADLINE}
                  </h2>
                  <p className="text-xs leading-snug text-muted-foreground sm:text-sm">
                    {BUILD_COMPARISON_SUBTITLE}
                  </p>
                </div>
                <div className="inline-grid w-full max-w-md grid-cols-1 gap-2">
                  <Button
                    onClick={() => {
                      window.location.assign("/scenario/new");
                    }}
                    className="compare-plans-cta h-10 w-full justify-center whitespace-normal border-0 px-3 py-1.5 text-[11px] font-bold leading-snug shadow-none sm:h-10 sm:text-xs"
                  >
                    <span className="flex flex-col items-center gap-0.5 text-center leading-snug">
                      <span>{BENCHMARK_TOOL_CTA.toUpperCase()} →</span>
                    </span>
                  </Button>
                  {voiceWizardAvailable && (
                    <Button
                      onClick={() => {
                        window.location.assign("/scenario/old?mode=voice");
                      }}
                      className="compare-plans-cta flex h-10 w-full flex-col justify-center whitespace-normal border-0 px-3 py-1.5 text-[11px] font-bold leading-snug shadow-none sm:text-xs"
                    >
                      <span className="flex flex-col items-center gap-0.5 text-center leading-snug">
                        <span>{BENCHMARK_TOOL_CTA.toUpperCase()} —</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Mic className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                          WITH VOICE WIZARD →
                        </span>
                      </span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="shrink-0 space-y-1 text-center">
                <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
                  <span className="block">{NO_PHI_PII_COLLECTION_NOTE_LINE_1}</span>
                  <span className="block">{NO_PHI_PII_COLLECTION_NOTE_LINE_2}</span>
                </p>
                <p className="font-display text-[11px] font-semibold italic leading-snug tracking-tight text-foreground sm:text-xs">
                  {SITE_TAGLINE}
                </p>
              </div>

              <div className="shrink-0">
                <div className="grid grid-cols-1 gap-1.5 text-left sm:grid-cols-3 sm:gap-2">
                  <div className="rounded-lg border border-primary/15 bg-white/50 px-2 py-2 text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1">
                      <EyeOff className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                      <strong className="leading-snug">De-identified</strong>
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                      Year of birth + ZIP3 only
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/15 bg-white/50 px-2 py-2 text-left sm:px-2.5 sm:py-2">
                    <div className="flex items-start gap-1">
                      <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <div className="min-w-0 text-[10px] leading-[1.25] sm:text-[11px]">
                        <strong className="block">Your Benchmark</strong>
                        <strong className="block">Tool ID</strong>
                        <span className="block text-muted-foreground">You choose who sees it</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/15 bg-white/50 px-2 py-2 text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                      <strong className="leading-snug">Educational tool</strong>
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                      Compare before enroll
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HomeHowItWorksVideo className="!mt-6" />

        <div className="rounded-2xl border border-border bg-primary px-4 py-3 text-primary-foreground shadow-sm sm:px-6 sm:py-3.5">
          <p className="text-center text-xs leading-snug sm:text-sm">
            <span className="block">
              {SITE_BRAND_THE} {HOME_BENCHMARK_BANNER_LEAD}
            </span>
            <strong className="mt-0.5 block font-semibold text-primary-foreground">
              {HOME_BENCHMARK_BANNER_EMPHASIS}
            </strong>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
