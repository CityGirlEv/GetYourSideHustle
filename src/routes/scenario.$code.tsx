import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Pill,
  FileText,
  FileDown,
  Sparkles,
  ListOrdered,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Phone,
  Mail,
  Share2,
  Copy,
} from "lucide-react";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import { downloadConsumerScenarioPdf } from "@/lib/scenario-pdf";
import { openScenarioXlsxInNewTab } from "@/lib/scenario-xlsx";
import { DrugReport, buildDrugReport } from "@/components/DrugReport";
import { PlanComparisonRecommendation } from "@/components/PlanComparisonRecommendation";
import { PlanComparisonTopTen } from "@/components/PlanComparisonTopTen";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getPublicScenarioByCode } from "@/lib/scenario-lookup.functions";
import { ExpertOptInDialog } from "@/components/ExpertOptInDialog";
import { CmsPartnerCtaButton } from "@/components/CmsPartnerCtaButton";
import { ScenarioAgentAssign } from "@/components/ScenarioAgentAssign";
import { ScenarioProfileHeader } from "@/components/ScenarioProfileHeader";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  COMPARISON_ID_LABEL,
  PLAN_COMPARISON_EDUCATIONAL_NOTE,
  PLAN_COMPARISON_OPEN_EXCEL,
  PLAN_COMPARISON_XLSX_OPENED,
  YOUR_PLAN_COMPARISON,
} from "@/lib/plan-comparison-copy";
import { BENCHMARK_SCOPE_NOTE } from "@/lib/medicare-disclaimers";

export const Route = createFileRoute("/scenario/$code")({
  head: () => ({
    meta: [
      { title: "Plan Comparison Summary — Part B Optimizer Benchmark Tool" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScenarioSummary,
});

function ScenarioSummary() {
  const { code } = Route.useParams();
  const { user } = useApp();
  const isStaffAdmin = userHasAdminRole(user);
  const [scenario, setScenario] = useState<
    | (ScenarioPdfInput & {
        county?: string;
        contactRequests?: Array<{ email: string; phone: string; createdAt: string }>;
      })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optInOpen, setOptInOpen] = useState(false);
  const fetchByCode = useServerFn(getPublicScenarioByCode);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Always fetch fresh from DB so links work across devices/sessions.
    fetchByCode({ data: { code } })
      .then((s) => {
        if (cancelled) return;
        setScenario(
          s as ScenarioPdfInput & {
            county?: string;
            contactRequests?: Array<{ email: string; phone: string; createdAt: string }>;
          },
        );
        try {
          sessionStorage.setItem(`scenario:${code}`, JSON.stringify(s));
        } catch {
          /* ignore */
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // Fallback to any cached copy in sessionStorage
        try {
          const raw = sessionStorage.getItem(`scenario:${code}`);
          if (raw) {
            setScenario(JSON.parse(raw));
            return;
          }
        } catch {
          /* ignore */
        }
        const msg = e instanceof Error ? e.message : "Could not load plan comparison";
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code, fetchByCode]);

  const downloadPdf = () => {
    try {
      if (!scenario) {
        toast.error("PDF not available");
        return;
      }
      downloadConsumerScenarioPdf(scenario);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error("Could not generate PDF");
      console.error(e);
    }
  };

  const sharePage = async () => {
    const url = `${window.location.origin}/scenario/${code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Medicare Plan Comparison", url });
        return;
      } catch {
        /* fallback */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const scenarioSnapshot = scenario
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
      }
    : undefined;

  return (
    <AppShell title="Plan comparison summary" subtitle={`${COMPARISON_ID_LABEL} ${code}`}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Link to="/scenario/created/$code" params={{ code }}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        </Link>

        {loading ? (
          <Card className="glass p-6 text-sm text-muted-foreground">Loading plan comparison…</Card>
        ) : !scenario ? (
          <Card className="glass p-6 text-sm text-muted-foreground">
            We couldn&apos;t load this plan comparison.{" "}
            {error ? <span className="block mt-1 text-xs">({error})</span> : null}
            <div className="mt-2 text-xs">
              Double-check the {COMPARISON_ID_LABEL}, or create a new comparison if this one has
              expired (comparisons auto-delete after 90 days).
            </div>
            <p className="mt-2 text-xs">{PLAN_COMPARISON_EDUCATIONAL_NOTE}</p>
          </Card>
        ) : (
          <>
            {isStaffAdmin ? (
              <Card className="glass p-4">
                <ScenarioAgentAssign scenarioCode={code} />
              </Card>
            ) : null}

            <Card className="glass p-6 space-y-4">
              <ScenarioProfileHeader scenario={scenario} title="Your information" />
            </Card>

            <Tabs defaultValue="recommendation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recommendation">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Recommendation
                </TabsTrigger>
                <TabsTrigger value="top-ten">
                  <ListOrdered className="h-3.5 w-3.5 mr-1.5" />
                  Top 10 plans
                </TabsTrigger>
                <TabsTrigger value="drugs">
                  <Pill className="h-3.5 w-3.5 mr-1.5" />
                  Drug tiers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendation" className="mt-4 space-y-4">
                <PlanComparisonRecommendation scenario={scenario} />
                {scenario.contactRequests && scenario.contactRequests.length > 0 && (
                  <ContactRequestsPanel requests={scenario.contactRequests} />
                )}
                <Card className="glass p-6 space-y-3">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Medications ({scenario.medications.length})
                  </h2>
                  {scenario.medications.length === 0 ? (
                    <div className="text-sm text-muted-foreground">None listed.</div>
                  ) : (
                    <MedicationsWithTiers medications={scenario.medications} />
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="top-ten" className="mt-4">
                <PlanComparisonTopTen scenario={scenario} />
              </TabsContent>

              <TabsContent value="drugs" className="mt-4">
                {scenario.medications.length > 0 ? (
                  <DrugReport medications={scenario.medications} />
                ) : (
                  <Card className="glass p-6 text-sm text-muted-foreground">
                    No medications were entered for this plan comparison.
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <CmsPartnerCtaButton
              variant="default"
              scenarioCode={code}
              onClick={() => setOptInOpen(true)}
            />

            <Button onClick={sharePage} variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={downloadPdf} variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" /> Download PDF
              </Button>
              <Button
                onClick={async () => {
                  if (!scenario) {
                    toast.error("Excel not available");
                    return;
                  }
                  try {
                    await openScenarioXlsxInNewTab({ ...scenario, scenarioCode: code });
                    toast.success(PLAN_COMPARISON_XLSX_OPENED);
                  } catch (e) {
                    toast.error("Could not open workbook");
                    console.error(e);
                  }
                }}
                variant="outline"
                className="w-full"
              >
                <FileDown className="h-4 w-4 mr-2" /> {PLAN_COMPARISON_OPEN_EXCEL}
              </Button>
            </div>

            <Disclaimer />
          </>
        )}
      </div>
      <ExpertOptInDialog
        open={optInOpen}
        onOpenChange={setOptInOpen}
        scenarioCode={code}
        scenarioSnapshot={scenarioSnapshot}
      />
    </AppShell>
  );
}

function MedicationsWithTiers({ medications }: { medications: ScenarioPdfInput["medications"] }) {
  const rows = buildDrugReport(medications);
  const usd = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-xs border-collapse min-w-[520px]">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 px-2 font-semibold">Medication</th>
            <th className="py-2 px-2 font-semibold">Tier</th>
            <th className="py-2 px-2 font-semibold text-right">Est. /mo</th>
            <th className="py-2 px-2 font-semibold text-right">Est. /yr</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/50 align-top">
              <td className="py-2 px-2">
                <div className="font-semibold">{r.name || "Unnamed medication"}</div>
                <div className="text-xs text-muted-foreground">
                  {[r.strength, r.form, r.frequency].filter(Boolean).join(" · ")}
                </div>
                {r.resolvedDiagnosis ? (
                  <div className="text-micro text-muted-foreground mt-0.5">
                    Condition: {r.resolvedDiagnosis}
                  </div>
                ) : null}
                <div className="text-micro text-muted-foreground mt-0.5">
                  Retail: {usd(r.retailMonthly)}/mo
                </div>
                {r.notes.map((n, j) => (
                  <div
                    key={j}
                    className="text-micro text-muted-foreground flex items-center gap-1 mt-0.5"
                  >
                    <AlertCircle className="h-2.5 w-2.5 shrink-0" /> {n}
                  </div>
                ))}
              </td>
              <td className="py-2 px-2">
                <div className="font-semibold">{r.tier}</div>
                <div className="text-micro text-muted-foreground">{r.tierRationale}</div>
              </td>
              <td className="py-2 px-2 text-right tabular-nums font-semibold">
                {usd(r.estPlanMonthly)}
              </td>
              <td className="py-2 px-2 text-right tabular-nums">{usd(r.estPlanAnnual)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Disclaimer() {
  return (
    <Card className="glass p-4 text-xs text-muted-foreground space-y-2">
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <AlertCircle className="h-4 w-4 text-primary" />
        Important disclaimer
      </div>
      <p>
        {BENCHMARK_SCOPE_NOTE} Estimated drug tiers, copays, and premiums are illustrative and vary
        by formulary, effective date, and personal eligibility. Nothing here constitutes insurance,
        medical, tax, or legal advice. Please verify benefit details with a licensed agent before
        enrolling.
      </p>
      <p>
        For the official program details, refer to the latest{" "}
        <a
          href="https://www.medicare.gov/Pubs/pdf/10050-Medicare-and-You.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary underline underline-offset-2 font-medium"
        >
          Medicare &amp; You handbook <ExternalLink className="h-3 w-3" />
        </a>{" "}
        published by CMS.
      </p>
    </Card>
  );
}

function ContactRequestsPanel({
  requests,
}: {
  requests: Array<{ email: string; phone: string; createdAt: string }>;
}) {
  return (
    <Card className="glass p-6 space-y-3 border-primary/30">
      <div className="flex items-center gap-2">
        <Phone className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Consumer contact info (admin only)</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        This person opted in to be contacted by a licensed Medicare expert. Reach out using the
        details below.
      </p>
      <div className="space-y-2">
        {requests.map((r, i) => (
          <div key={i} className="rounded-md border border-border bg-card/40 p-3 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <a href={`mailto:${r.email}`} className="text-primary underline underline-offset-2">
                {r.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <a href={`tel:${r.phone}`} className="text-primary underline underline-offset-2">
                {r.phone}
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              Submitted {new Date(r.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
