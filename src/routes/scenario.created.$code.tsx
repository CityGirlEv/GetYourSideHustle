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
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  downloadScenarioPdf,
  downloadConsumerScenarioPdf,
  type ScenarioPdfInput,
} from "@/lib/scenario-pdf";
import { openScenarioXlsxInNewTab } from "@/lib/scenario-xlsx";
import { useEffect, useMemo, useState } from "react";
import { ExpertOptInDialog } from "@/components/ExpertOptInDialog";
import { CmsPartnerCtaButton } from "@/components/CmsPartnerCtaButton";
import { LICENSED_AGENT_WILL_CONTACT } from "@/lib/lead-consent";
import { rankedPlanDetails } from "@/lib/plan-details";
import { useCmsLandscapeReady } from "@/hooks/use-cms-landscape-ready";
import { useApp } from "@/lib/app-store";
import { DrugReport } from "@/components/DrugReport";
import { PlanComparisonRecommendation } from "@/components/PlanComparisonRecommendation";
import { ScenarioProfileHeader } from "@/components/ScenarioProfileHeader";
import {
  COMPARISON_ID_COPIED,
  COMPARISON_ID_LABEL,
  COMPARISON_LINK_COPIED,
  COPY_COMPARISON_ID,
  COPY_COMPARISON_LINK,
  PLAN_COMPARISON_EDUCATIONAL_NOTE,
  PLAN_COMPARISON_OPEN_EXCEL,
  PLAN_COMPARISON_XLSX_OPENED,
  VIEW_COMPARISON_SUMMARY,
  VIEW_PLAN_COMPARISON,
  YOUR_PLAN_COMPARISON,
} from "@/lib/plan-comparison-copy";

export const Route = createFileRoute("/scenario/created/$code")({
  head: () => ({
    meta: [
      { title: "Plan Comparison Created — Part B Optimizer Benchmark Tool" },
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

  const landscapeReady = useCmsLandscapeReady();

  const topPlanLabel = useMemo(() => {
    if (!scenario || !landscapeReady) return undefined;
    const top = rankedPlanDetails({
      year: scenario.year,
      zip3: scenario.zip3,
      medications: scenario.medications,
    })[0];
    return top ? `${top.carrier} — ${top.plan}` : undefined;
  }, [scenario, landscapeReady]);

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

  const openXlsx = async () => {
    try {
      if (!scenario) {
        toast.error("Workbook not available — re-open after creating the comparison.");
        return;
      }
      await openScenarioXlsxInNewTab({ ...scenario, county: scenario.county });
      toast.success(PLAN_COMPARISON_XLSX_OPENED);
    } catch (e) {
      toast.error("Could not open workbook");
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
              <Button onClick={openXlsx} variant="outline" className="w-full">
                <FileDown className="h-4 w-4 mr-2" /> {PLAN_COMPARISON_OPEN_EXCEL}
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
            <CmsPartnerCtaButton
              variant="outline"
              scenarioCode={code}
              onClick={() => setOptInOpen(true)}
            />
            <p className="text-xs text-muted-foreground px-1 text-left">
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

          {scenario && (
            <div className="text-left space-y-3">
              <div className="flex flex-col gap-1 shrink-0 sm:flex-row sm:justify-end">
                <Button
                  onClick={downloadPdf}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                >
                  <FileDown className="h-3 w-3 mr-1" /> Download PDF
                </Button>
                <Button
                  onClick={openXlsx}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                >
                  <FileDown className="h-3 w-3 mr-1" /> {PLAN_COMPARISON_OPEN_EXCEL}
                </Button>
              </div>
              <PlanComparisonRecommendation scenario={scenario} className="text-left" />
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
                recommendation: topPlanLabel,
              }
            : undefined
        }
      />
    </AppShell>
  );
}
