import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { CheckCircle2, Copy, ShieldCheck, FileDown, Phone, Sparkles, Building2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { downloadScenarioPdf, downloadConsumerScenarioPdf, type ScenarioPdfInput } from "@/lib/scenario-pdf";
import { downloadScenarioXlsx } from "@/lib/scenario-xlsx";
import { useEffect, useMemo, useState } from "react";
import { ExpertOptInDialog } from "@/components/ExpertOptInDialog";
import { recommendPlans, usd, type PersonalizedRecommendation } from "@/lib/medicare-math";
import { useApp } from "@/lib/app-store";
import { DrugReport } from "@/components/DrugReport";

export const Route = createFileRoute("/scenario/created/$code")({
  head: () => ({
    meta: [
      { title: "Scenario Created — The Medicare Optimizer" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScenarioCreated,
});

function ScenarioCreated() {
  const { code } = Route.useParams();
  const { user } = useApp();
  const isAgent = !!user;
  const [optInOpen, setOptInOpen] = useState(false);
  const [scenario, setScenario] = useState<ScenarioPdfInput & { county?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`scenario:${code}`);
      if (raw) setScenario(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [code]);

  const recommendation: PersonalizedRecommendation | null = useMemo(() => {
    if (!scenario) return null;
    return recommendPlans({
      year: scenario.year,
      zip3: scenario.zip3,
      county: scenario.county,
      meds: scenario.medications,
      conditions: scenario.conditions,
      costPreference: scenario.costPreference,
    });
  }, [scenario]);

  useEffect(() => {
    const seen = sessionStorage.getItem(`expert-optin-shown:${code}`);
    if (!seen) {
      const t = setTimeout(() => {
        setOptInOpen(true);
        sessionStorage.setItem(`expert-optin-shown:${code}`, "1");
      }, 800);
      return () => clearTimeout(t);
    }
  }, [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Scenario ID copied");
    } catch { toast.error("Copy failed — please write it down"); }
  };

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/scenario/${code}`;
      await navigator.clipboard.writeText(url);
      toast.success("Scenario link copied");
    } catch { toast.error("Copy failed — please write the link down"); }
  };

  const downloadPdf = () => {
    try {
      if (!scenario) { toast.error("PDF not available — re-open after creating the scenario."); return; }
      if (isAgent) {
        downloadScenarioPdf(scenario);
      } else {
        downloadConsumerScenarioPdf(scenario);
      }
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error("Could not generate PDF");
      console.error(e);
    }
  };

  const downloadXlsx = () => {
    try {
      if (!scenario) { toast.error("Workbook not available — re-open after creating the scenario."); return; }
      downloadScenarioXlsx({ ...scenario, county: scenario.county });
      toast.success("Excel workbook downloaded");
    } catch (e) {
      toast.error("Could not generate workbook");
      console.error(e);
    }
  };

  return (
    <AppShell title="" subtitle="">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="glass p-8 max-w-xl w-full space-y-6 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">View My Scenario</h1>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald mx-auto">
            <CheckCircle2 className="h-7 w-7 text-emerald-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">Your Scenario ID</h2>
            <p className="text-sm text-muted-foreground">Write this down or copy it. <strong>Without it, even we cannot find your scenario.</strong></p>
          </div>

          <div className="bg-background border-2 border-primary rounded-xl p-5 font-mono text-2xl tracking-wider break-all select-all">
            {code}
          </div>

          <Button onClick={copy} variant="outline" className="w-full">
            <Copy className="h-4 w-4 mr-2" /> Copy Scenario ID
          </Button>

          <Button onClick={copyLink} variant="outline" className="w-full">
            <Copy className="h-4 w-4 mr-2" /> Copy scenario link
          </Button>

          <Link to="/scenario/$code" params={{ code }} className="block">
            <Button variant="default" className="w-full">
              View scenario summary
            </Button>
          </Link>

          <div className="space-y-1">
            <Button onClick={() => setOptInOpen(true)} variant="outline" className="w-full">
              <Phone className="h-4 w-4 mr-2" /> Have a licensed expert contact me
            </Button>
            <p className="text-[11px] text-muted-foreground px-1 text-left">
              Opens a short form to share just your email and phone so a licensed Medicare expert can reach out about this scenario. Entirely optional — we never contact you unless you opt in here.
            </p>
          </div>

          <a
            href="https://www.medicare.gov/Pubs/pdf/10050-Medicare-and-You.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="Medicare-and-You.pdf"
            className="block"
          >
            <Button variant="outline" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" /> Download "Medicare &amp; You" Handbook (PDF)
            </Button>
          </a>

          {recommendation && (
            <div className="text-left bg-emerald/5 border border-emerald/30 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold flex items-center gap-2 text-emerald">
                  <Sparkles className="h-4 w-4" /> Personalized recommendation
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button onClick={downloadPdf} size="sm" variant="outline" className="h-7 px-2 text-[11px]">
                    <FileDown className="h-3 w-3 mr-1" /> PDF
                  </Button>
                  {isAgent && (
                    <Button onClick={downloadXlsx} size="sm" variant="outline" className="h-7 px-2 text-[11px]">
                      <FileDown className="h-3 w-3 mr-1" /> Excel
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Best fit for your priorities</div>
                <div className="font-bold text-base">{recommendation.primary.planName}</div>
                <div className="text-xs text-muted-foreground">{recommendation.primary.pathwayLabel}</div>
                <p className="text-xs mt-1">{recommendation.primary.planDescription}</p>
                <p className="text-xs mt-1 italic">{recommendation.primary.rationale}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div><span className="text-muted-foreground">Est. monthly:</span> <strong>{usd(recommendation.primary.estMonthlyPremium)}</strong></div>
                  <div><span className="text-muted-foreground">Est. annual:</span> <strong>{usd(recommendation.primary.estAnnualTotal)}</strong></div>
                  <div><span className="text-muted-foreground">Worst-case:</span> <strong>{usd(recommendation.primary.estWorstCase)}</strong></div>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Carriers offering this in your area</div>
                <ul className="mt-1 space-y-1">
                  {recommendation.primary.carriers.slice(0, 6).map((c) => (
                    <li key={c["Carrier Name"]} className="text-xs">
                      <strong>{c["Carrier Name"]}</strong>
                      <span className="text-muted-foreground"> — {c["A.M. Best Rating"]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-emerald/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Also consider</div>
                <div className="text-sm font-semibold">{recommendation.alternate.planName}</div>
                <div className="text-xs text-muted-foreground">{recommendation.alternate.pathwayLabel} · est. {usd(recommendation.alternate.estAnnualTotal)} / yr</div>
              </div>

              <p className="text-[10px] text-muted-foreground pt-2 border-t border-emerald/20">
                Source: {recommendation.primary.source}. Reviewed against all open standardized Medigap letters, all CMS-approved MA plan types, and all PDP tiers in the catalog. Premium figures are regional estimates — not a binding rate quote.
              </p>
            </div>
          )}
          {!isAgent && (
            <div className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg p-3 text-left">
              The Excel workbook with full carrier breakdowns is available to licensed agents only. Share your Scenario ID with your agent — they can log in and download it for you.
            </div>
          )}

          {scenario?.medications?.length ? (
            <DrugReport medications={scenario.medications} />
          ) : null}

          <div className="text-left bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 text-sm">
            <div className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> What happens next</div>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Contact the Medicare agent of <em>your</em> choice — by phone, email, or in person.</li>
              <li>Give them this Scenario ID.</li>
              <li>They'll log in and review your de-identified scenario, then walk you through the comparison.</li>
            </ol>
            <p className="text-xs pt-2"><strong>We will never contact you.</strong> Your scenario auto-deletes after 90 days.</p>
          </div>

          <Link to="/" className="block"><Button variant="ghost" className="w-full">Done</Button></Link>
        </Card>
      </div>
      <ExpertOptInDialog
        open={optInOpen}
        onOpenChange={setOptInOpen}
        scenarioCode={code}
        scenarioSnapshot={scenario ? {
          year: scenario.year,
          birthYear: scenario.birthYear,
          zip3: scenario.zip3,
          county: scenario.county,
          gender: scenario.gender,
          tobacco: scenario.tobacco,
          incomeBand: scenario.incomeBand,
          costPreference: scenario.costPreference,
          conditions: scenario.conditions,
          medications: scenario.medications,
          recommendation: recommendation?.primary?.planName,
        } : undefined}
      />
    </AppShell>
  );
}
