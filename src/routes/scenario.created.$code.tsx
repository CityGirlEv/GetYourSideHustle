import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import {
  CheckCircle2,
  Copy,
  ShieldCheck,
  FileDown,
  FileText,
  Phone,
  Sparkles,
  Building2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  downloadScenarioPdf,
  downloadConsumerScenarioPdf,
  type ScenarioPdfInput,
} from "@/lib/scenario-pdf";
import { downloadScenarioXlsx } from "@/lib/scenario-xlsx";
import { useEffect, useMemo, useState } from "react";
import { ExpertOptInDialog } from "@/components/ExpertOptInDialog";
import { CMS_PARTNER_CTA, LICENSED_AGENT_WILL_CONTACT } from "@/lib/lead-consent";
import { recommendPlans, usd, type PersonalizedRecommendation } from "@/lib/medicare-math";
import { useApp } from "@/lib/app-store";
import { DrugReport } from "@/components/DrugReport";
import { ScenarioProfileHeader } from "@/components/ScenarioProfileHeader";
import {
  COMPARISON_ID_COPIED,
  COMPARISON_ID_LABEL,
  COMPARISON_LINK_COPIED,
  COPY_COMPARISON_ID,
  COPY_COMPARISON_LINK,
  PLAN_COMPARISON_EDUCATIONAL_NOTE,
  VIEW_COMPARISON_SUMMARY,
  VIEW_PLAN_COMPARISON,
  YOUR_PLAN_COMPARISON,
} from "@/lib/plan-comparison-copy";

export const Route = createFileRoute("/scenario/created/$code")({
  head: () => ({
    meta: [
      { title: "Plan Comparison Created — Part B Optimizer" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScenarioCreated,
});

function ScenarioCreated() {
  const { code } = Route.useParams();
  const { user } = useApp();
  const isSignedIn = !!user;
  const [optInOpen, setOptInOpen] = useState(false);
  const [scenario, setScenario] = useState<
    (ScenarioPdfInput & { county?: string; requestExpertContact?: boolean }) | null
  >(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`scenario:${code}`);
      if (raw) setScenario(JSON.parse(raw));
    } catch {
      /* ignore */
    }
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
        try {
          const raw = sessionStorage.getItem(`scenario:${code}`);
          if (raw && JSON.parse(raw).requestExpertContact) {
            toast.info(
              "Enter your contact info below — you asked to speak with an agent about your medications.",
            );
          }
        } catch {
          /* ignore */
        }
      }, 800);
      return () => clearTimeout(t);
    }
  }, [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(COMPARISON_ID_COPIED);
    } catch {
      toast.error("Copy failed — please write it down");
    }
  };

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/scenario/${code}`;
      await navigator.clipboard.writeText(url);
      toast.success(COMPARISON_LINK_COPIED);
    } catch {
      toast.error("Copy failed — please write the link down");
    }
  };

  const downloadPdf = () => {
    try {
      if (!scenario) {
        toast.error("PDF not available — re-open after creating the comparison.");
        return;
      }
      if (isSignedIn) {
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
      if (!scenario) {
        toast.error("Workbook not available — re-open after creating the comparison.");
        return;
      }
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
          <h1 className="font-display text-3xl font-bold tracking-tight">{VIEW_PLAN_COMPARISON}</h1>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald mx-auto">
            <CheckCircle2 className="h-7 w-7 text-emerald-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">Your {COMPARISON_ID_LABEL}</h2>
            <p className="text-sm text-muted-foreground">
              Write this down or copy it.{" "}
              <strong>Without it, even we cannot find your plan comparison.</strong>
            </p>
            <p className="text-xs text-muted-foreground">{PLAN_COMPARISON_EDUCATIONAL_NOTE}</p>
          </div>

          <div className="bg-background border-2 border-primary rounded-xl p-5 font-mono text-2xl tracking-wider break-all select-all">
            {code}
          </div>

          <Button onClick={copy} variant="outline" className="w-full">
            <Copy className="h-4 w-4 mr-2" /> {COPY_COMPARISON_ID}
          </Button>

          <Button onClick={copyLink} variant="outline" className="w-full">
            <Copy className="h-4 w-4 mr-2" /> {COPY_COMPARISON_LINK}
          </Button>

          {scenario && (
            <div className="text-left border border-border rounded-xl p-4 bg-background/60">
              <ScenarioProfileHeader scenario={scenario} title={YOUR_PLAN_COMPARISON} />
            </div>
          )}

          <Link to="/scenario/$code" params={{ code }} className="block">
            <Button variant="default" className="w-full">
              {VIEW_COMPARISON_SUMMARY}
            </Button>
          </Link>

          {scenario && (
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={downloadPdf} variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" /> Download PDF
              </Button>
              <Button onClick={downloadXlsx} variant="outline" className="w-full">
                <FileDown className="h-4 w-4 mr-2" /> Download Excel
              </Button>
            </div>
          )}

          {scenario?.requestExpertContact && (
            <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-md px-3 py-2 text-left">
              You asked to speak with an agent about your medications. {LICENSED_AGENT_WILL_CONTACT}{" "}
              once you submit the form below.
            </p>
          )}

          <div className="space-y-1">
            <Button onClick={() => setOptInOpen(true)} variant="outline" className="w-full">
              <Phone className="h-4 w-4 mr-2" /> {CMS_PARTNER_CTA}
            </Button>
            <p className="text-[11px] text-muted-foreground px-1 text-left">
              Optional — share your email and phone only if you want personalized guidance. We never
              contact you unless you opt in and authorize contact.
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
                  <Button
                    onClick={downloadPdf}
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px]"
                  >
                    <FileDown className="h-3 w-3 mr-1" /> PDF
                  </Button>
                  <Button
                    onClick={downloadXlsx}
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px]"
                  >
                    <FileDown className="h-3 w-3 mr-1" /> Excel
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Best fit for your priorities
                </div>
                <div className="font-bold text-base">{recommendation.primary.planName}</div>
                <div className="text-xs text-muted-foreground">
                  {recommendation.primary.pathwayLabel}
                </div>
                <p className="text-xs mt-1">{recommendation.primary.planDescription}</p>
                <p className="text-xs mt-1 italic">{recommendation.primary.rationale}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Est. monthly:</span>{" "}
                    <strong>{usd(recommendation.primary.estMonthlyPremium)}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Est. annual:</span>{" "}
                    <strong>{usd(recommendation.primary.estAnnualTotal)}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Worst-case:</span>{" "}
                    <strong>{usd(recommendation.primary.estWorstCase)}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Carriers offering this in your area
                </div>
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
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Also consider
                </div>
                <div className="text-sm font-semibold">{recommendation.alternate.planName}</div>
                <div className="text-xs text-muted-foreground">
                  {recommendation.alternate.pathwayLabel} · est.{" "}
                  {usd(recommendation.alternate.estAnnualTotal)} / yr
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground pt-2 border-t border-emerald/20">
                Source: {recommendation.primary.source}. Reviewed against all open standardized
                Medigap letters, all CMS-approved MA plan types, and all PDP tiers in the catalog.
                Premium figures are regional estimates — not a binding rate quote.
              </p>
            </div>
          )}
          {scenario?.medications?.length ? <DrugReport medications={scenario.medications} /> : null}

          <div className="text-left bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 text-sm">
            <div className="font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> What happens next
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>
                Contact the Medicare agent of <em>your</em> choice — by phone, email, or in person.
              </li>
              <li>Give them this {COMPARISON_ID_LABEL}.</li>
              <li>
                They'll log in and review your de-identified plan comparison, then walk you through
                the options.
              </li>
            </ol>
            <p className="text-xs pt-2">
              <strong>We will never contact you.</strong> Your comparison auto-deletes after 90 days.
            </p>
          </div>

          <Link to="/" className="block">
            <Button variant="ghost" className="w-full">
              Done
            </Button>
          </Link>
        </Card>
      </div>
      <ExpertOptInDialog
        open={optInOpen}
        onOpenChange={setOptInOpen}
        scenarioCode={code}
        fromMedicationStep={!!scenario?.requestExpertContact}
        scenarioSnapshot={
          scenario
            ? {
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
              }
            : undefined
        }
      />
    </AppShell>
  );
}
