import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, EyeOff, KeyRound, Search, Mic } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { HomeCoverHero } from "@/components/HomeCoverHero";
import { SITE_BRAND_NAME, SITE_TAGLINE, SITE_BRAND_THE } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";
import { VOICE_WIZARD_ENABLED } from "@/lib/feature-flags";

const HOME_URL = canonicalUrl("/");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_BRAND_NAME} — De-identified Plan Comparison` },
      {
        name: "description",
        content:
          "Compare Medicare plans without giving up your personal information. We store only de-identified scenarios you control.",
      },
      { property: "og:title", content: `${SITE_BRAND_NAME} — De-identified Plan Comparison` },
      {
        property: "og:description",
        content:
          "Compare Medicare plans without giving up your personal information. We store only de-identified scenarios you control.",
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
            "Medicare plan comparison tool using de-identified scenarios under live federal rules.",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const router = useRouter();
  const [lookupCode, setLookupCode] = useState("");

  const goToScenario = (e: React.FormEvent) => {
    e.preventDefault();
    const code = lookupCode.trim();
    if (code) router.navigate({ to: "/scenario/$code", params: { code } });
  };

  return (
    <AppShell title="">
      <div className="space-y-3 lg:space-y-4">
        <div className="w-full flex justify-center px-2 sm:px-0">
          <h2 className="font-display text-2xl font-bold text-primary text-center leading-tight text-balance max-w-[17rem] sm:max-w-none">
            <span className="block sm:inline">Comparing Medicare Plans</span>{" "}
            <span className="block sm:inline">Shouldn&apos;t Be Confusing!</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-[7fr_6fr] md:items-stretch md:gap-6">
          <figure className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border shadow-md md:h-full">
            <div className="flex min-h-0 flex-1 items-start overflow-hidden">
              <HomeCoverHero />
            </div>
            <div className="mt-auto shrink-0 bg-primary px-3 py-2 text-primary-foreground sm:px-4 sm:py-2.5">
              <p className="text-xs sm:text-sm leading-snug font-semibold uppercase text-center text-primary-foreground">
                <span className="block">Confused by your Medicare medical plan</span>
                <span className="block">options? You are not alone!</span>
              </p>
            </div>
          </figure>

          <div className="glass flex min-h-[20rem] flex-col overflow-hidden rounded-2xl text-center sm:min-h-[24rem] md:h-full md:min-h-0">
            <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-2">
              <div className="shrink-0 w-full rounded-lg border border-primary/40 bg-primary px-3 py-2.5 text-xs font-semibold leading-snug text-primary-foreground shadow-sm sm:text-sm">
                <div className="flex items-start justify-center gap-2 text-left sm:text-center">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground sm:mx-auto sm:h-4 sm:w-4" />
                  <span className="text-primary-foreground">
                    No phone, no email, no login. Your privacy is 100% protected and completely
                    anonymous unless you opt in.
                  </span>
                </div>
              </div>

              <div className="mt-4 flex w-full min-w-0 shrink-0 flex-col items-center gap-1.5 sm:mt-5">
                <div className="mx-auto w-full min-w-0 max-w-[18rem] space-y-0.5 md:max-w-[22rem]">
                  <h2 className="font-display text-lg font-bold uppercase leading-tight sm:text-xl md:text-2xl">
                    Find the Medicare Plan That Fits A Scenario
                  </h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Build a de-identified scenario in 2 minutes.
                  </p>
                </div>
                <div className="inline-grid grid-cols-1 gap-1.5">
                  <Button
                    onClick={() => router.navigate({ to: "/scenario/new" })}
                    className="compare-plans-cta h-10 w-full justify-center border-0 px-3 py-1 text-[10px] font-bold leading-tight shadow-none sm:h-11 sm:px-4 sm:text-xs"
                  >
                    COMPARE PLANS PRIVATELY →
                  </Button>
                  {VOICE_WIZARD_ENABLED && (
                    <Button
                      onClick={() =>
                        router.navigate({ to: "/scenario/new", search: { mode: "voice" } })
                      }
                      className="compare-plans-cta h-10 w-full justify-center whitespace-normal border-0 px-3 py-1 text-[10px] font-bold leading-tight shadow-none sm:h-11 sm:px-4 sm:text-xs"
                    >
                      <Mic className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="flex flex-col items-center leading-tight text-center">
                        <span>COMPARE PLANS PRIVATELY</span>
                        <span>with VOICE WIZARD →</span>
                      </span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 py-1 sm:py-1.5">
                <p className="whitespace-nowrap text-center font-display text-[9px] font-semibold italic leading-tight tracking-tight text-foreground sm:text-[10px] md:text-xs">
                  {SITE_TAGLINE}
                </p>
              </div>

              <div className="shrink-0 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 gap-2 text-left sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
                  <div className="rounded-lg border border-primary/15 bg-white/50 px-2.5 py-2 text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1.5">
                      <EyeOff className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <strong>De-identified</strong>
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                      Year of birth + ZIP3 only
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/15 bg-white/50 px-2.5 py-2 text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <strong>Your Scenario ID</strong>
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                      You choose who sees it
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/15 bg-white/50 px-2.5 py-2 text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <strong>Educational tool</strong>
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                      Compare before enroll
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={goToScenario}
                className="mx-auto mt-auto w-full max-w-[18rem] shrink-0 space-y-2 pt-4 text-center sm:space-y-2.5 sm:pt-6 md:max-w-[21rem]"
              >
                <div className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Already have a Scenario ID?
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter scenario code"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    className="h-9 min-w-0 flex-1 text-sm"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={!lookupCode.trim()}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4 mr-1" /> Find
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-primary px-4 py-3 text-primary-foreground shadow-sm sm:px-6 sm:py-3.5">
          <p className="text-xs sm:text-sm leading-snug text-center">
            <span className="block">
              {SITE_BRAND_THE} creates a side-by-side comparison of the current Medicare plans
              available using current federal guidelines, so you can
            </span>
            <strong className="mt-0.5 block font-semibold text-primary-foreground">
              UNDERSTAND YOUR OPTIONS AND CHOOSE WITH CONFIDENCE!
            </strong>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
