import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, EyeOff, KeyRound, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BrandLogo } from "@/components/BrandLogo";
import { useState } from "react";
import homeCoverHero from "@/assets/home-cover-hero.png";
import { SITE_TAGLINE } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";

const HOME_URL = canonicalUrl("/");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Get Part B Optimizer — De-identified Plan Comparison" },
      {
        name: "description",
        content:
          "Compare Medicare plans without giving up your personal information. We store only de-identified scenarios you control.",
      },
      { property: "og:title", content: "Get Part B Optimizer — De-identified Plan Comparison" },
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
          name: "Get Part B Optimizer",
          url: HOME_URL,
          description: "De-identified Medicare plan comparison for 2026 and 2027.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Get Part B Optimizer",
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
        <h2 className="font-display text-2xl font-bold text-primary text-center leading-tight">
          Comparing Medicare Plans Shouldn&apos;t Be Confusing!
        </h2>

        <div className="grid lg:grid-cols-2 items-stretch gap-6 lg:gap-8">
          <div className="flex flex-col min-h-0 h-full">
            <figure className="flex flex-col rounded-2xl border border-border shadow-md overflow-hidden">
              <img
                src={homeCoverHero}
                alt="Before and after: from confusing Medicare plan choices to clarity with Get Part B Optimizer"
                className="block w-full h-auto object-contain object-top bg-muted/30"
              />
              <figcaption className="shrink-0 bg-primary px-3.5 py-2 sm:px-4 sm:py-2.5 text-primary-foreground">
                <p className="text-xs sm:text-sm leading-snug font-semibold uppercase text-center text-yellow-300 sm:hidden">
                  <span className="block">Confused by your Medicare medical</span>
                  <span className="block">plan options? You are not alone!</span>
                </p>
                <p className="hidden sm:block text-xs sm:text-sm leading-snug font-semibold uppercase text-center text-yellow-300">
                  Confused by your Medicare medical plan options?
                </p>
                <p className="hidden sm:block text-xs sm:text-sm leading-snug font-semibold uppercase text-center mt-0.5 text-yellow-300">
                  You are not alone!
                </p>
                <p className="text-xs sm:text-sm leading-snug mt-1.5">
                  Get Part B Optimizer creates a side-by-side comparison of the current Medicare
                  plans available using current federal guidelines, so you can{" "}
                  <strong className="font-semibold text-yellow-300">
                    UNDERSTAND YOUR OPTIONS AND CHOOSE WITH CONFIDENCE!
                  </strong>
                </p>
              </figcaption>
            </figure>
          </div>

          <div className="flex flex-col h-full min-h-0 gap-3">
            <div className="glass rounded-2xl px-4 py-4 sm:px-6 sm:py-5 text-center flex-1 flex flex-col justify-between gap-4 sm:gap-5 min-h-[22rem] lg:min-h-0">
              <div className="w-full text-xs font-semibold text-center leading-relaxed px-3 py-2 rounded-xl border border-sky-400/20 bg-sky-500/5 text-sky-200 shadow-sm flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />
                <span>No phone, no email, no login. Your privacy is 100% protected.</span>
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight uppercase">
                  <span className="block">Find the Medicare Plan</span>
                  <span className="block">That Fits A Scenario</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Build a de-identified scenario in 2 minutes.
                </p>
              </div>
              <Button
                onClick={() => router.navigate({ to: "/scenario/new" })}
                className="grad-indigo h-12 px-10 text-base sm:text-lg font-bold animate-pulse !text-yellow-300 hover:!text-yellow-200 mx-auto w-fit min-w-[16rem]"
              >
                COMPARE PLANS PRIVATELY →
              </Button>

              <BrandLogo
                size="icon"
                className="mx-auto w-full max-w-[11rem] sm:max-w-[13rem] md:max-w-[14rem] bg-transparent"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                <div className="rounded-lg border border-primary/15 bg-white/50 px-3 py-2.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-primary shrink-0" />
                    <strong>De-identified</strong>
                  </div>
                  <div className="text-muted-foreground mt-1 text-[11px] sm:text-xs leading-snug">
                    Year of birth + ZIP3 only
                  </div>
                </div>
                <div className="rounded-lg border border-primary/15 bg-white/50 px-3 py-2.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary shrink-0" />
                    <strong>Your Scenario ID</strong>
                  </div>
                  <div className="text-muted-foreground mt-1 text-[11px] sm:text-xs leading-snug">
                    You choose who sees it
                  </div>
                </div>
                <div className="rounded-lg border border-primary/15 bg-white/50 px-3 py-2.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <strong>Educational tool</strong>
                  </div>
                  <div className="text-muted-foreground mt-1 text-[11px] sm:text-xs leading-snug">
                    Compare before enroll
                  </div>
                </div>
              </div>

              <p className="px-2 text-sm sm:text-base md:text-lg font-display font-semibold italic leading-snug text-primary text-center">
                {SITE_TAGLINE}
              </p>
            </div>

            <form onSubmit={goToScenario} className="glass rounded-2xl p-3 space-y-2">
              <div className="text-sm font-medium text-center">Already have a Scenario ID?</div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter scenario code"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="outline" disabled={!lookupCode.trim()}>
                  <Search className="h-4 w-4 mr-1" /> Find
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
