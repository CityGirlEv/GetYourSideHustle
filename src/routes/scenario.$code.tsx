import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Pill, MapPin, User, Calendar, DollarSign, FileText, FileDown, Sparkles, CheckCircle2, ExternalLink, AlertCircle, Phone, Mail, Share2, Copy } from "lucide-react";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import { downloadConsumerScenarioPdf } from "@/lib/scenario-pdf";
import { downloadScenarioXlsx } from "@/lib/scenario-xlsx";
import { DrugReport, buildDrugReport } from "@/components/DrugReport";
import { rankedPlanDetails } from "@/lib/plan-details";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getScenarioByCode } from "@/lib/scenario-lookup.functions";
import { ExpertOptInDialog } from "@/components/ExpertOptInDialog";

export const Route = createFileRoute("/scenario/$code")({
  head: () => ({
    meta: [
      { title: "Scenario Summary — The Medicare Optimizer" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScenarioSummary,
});

function ScenarioSummary() {
  const { code } = Route.useParams();
  const [scenario, setScenario] = useState<(ScenarioPdfInput & { county?: string; contactRequests?: Array<{ email: string; phone: string; createdAt: string }> }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchByCode = useServerFn(getScenarioByCode);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Always fetch fresh from DB so links work across devices/sessions.
    fetchByCode({ data: { code } })
      .then((s) => {
        if (cancelled) return;
        setScenario(s as ScenarioPdfInput & { county?: string; contactRequests?: Array<{ email: string; phone: string; createdAt: string }> });
        try { sessionStorage.setItem(`scenario:${code}`, JSON.stringify(s)); } catch { /* ignore */ }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // Fallback to any cached copy in sessionStorage
        try {
          const raw = sessionStorage.getItem(`scenario:${code}`);
          if (raw) { setScenario(JSON.parse(raw)); return; }
        } catch { /* ignore */ }
        const msg = e instanceof Error ? e.message : "Could not load scenario";
        setError(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [code, fetchByCode]);

  const downloadPdf = () => {
    try {
      if (!scenario) { toast.error("PDF not available"); return; }
      downloadConsumerScenarioPdf(scenario);
      toast.success("PDF downloaded");
    } catch (e) { toast.error("Could not generate PDF"); console.error(e); }
  };

  return (
    <AppShell title="Scenario summary" subtitle={`ID ${code}`}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Link to="/scenario/created/$code" params={{ code }}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1.5"/>Back</Button>
        </Link>

        {loading ? (
          <Card className="glass p-6 text-sm text-muted-foreground">Loading scenario…</Card>
        ) : !scenario ? (
          <Card className="glass p-6 text-sm text-muted-foreground">
            We couldn't load this scenario. {error ? <span className="block mt-1 text-xs">({error})</span> : null}
            <div className="mt-2 text-xs">Sign in with a staff account (admin, agent, advisor, qa, editor, or viewer) to view any scenario by ID.</div>
          </Card>
        ) : (
          <>
            <Card className="glass p-6 space-y-4">
              <h2 className="font-display text-xl font-bold">Your information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <Field icon={<Calendar className="h-3 w-3"/>} label="Plan year" value={String(scenario.year)} />
                <Field icon={<User className="h-3 w-3"/>} label="Birth year" value={String(scenario.birthYear)} />
                <Field icon={<MapPin className="h-3 w-3"/>} label="ZIP region" value={`${scenario.zip3}xx${scenario.county ? ` · ${scenario.county}` : ""}`} />
                <Field label="Gender" value={scenario.gender?.replace(/_/g, " ") || "—"} />
                <Field label="Tobacco" value={scenario.tobacco ? "Yes" : "No"} />
                <Field label="Income band" value={scenario.incomeBand || "—"} />
                <Field icon={<DollarSign className="h-3 w-3"/>} label="Cost preference" value={scenario.costPreference === "minimize_monthly" ? "Minimize monthly" : "Predictability"} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Conditions</div>
                <div className="text-sm">{scenario.conditions.length ? scenario.conditions.join(", ") : "None reported"}</div>
              </div>
            </Card>

            <Tabs defaultValue="recommendation" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recommendation">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5"/>1. Recommendation
                </TabsTrigger>
                <TabsTrigger value="drugs">
                  <Pill className="h-3.5 w-3.5 mr-1.5"/>2. Drug tier costs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendation" className="mt-4 space-y-4">
                <RecommendationPanel scenario={scenario} />
                {scenario.contactRequests && scenario.contactRequests.length > 0 && (
                  <ContactRequestsPanel requests={scenario.contactRequests} />
                )}
                <Card className="glass p-6 space-y-3">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2"><Pill className="h-4 w-4 text-primary"/>Medications ({scenario.medications.length})</h2>
                  {scenario.medications.length === 0 ? (
                    <div className="text-sm text-muted-foreground">None listed.</div>
                  ) : (
                    <MedicationsWithTiers medications={scenario.medications} />
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="drugs" className="mt-4">
                {scenario.medications.length > 0 ? (
                  <DrugReport medications={scenario.medications} />
                ) : (
                  <Card className="glass p-6 text-sm text-muted-foreground">No medications were entered for this scenario.</Card>
                )}
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={downloadPdf} variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" /> Download PDF
              </Button>
              <Button onClick={() => {
                if (!scenario) { toast.error("Excel not available"); return; }
                try {
                  downloadScenarioXlsx({ ...scenario, scenarioCode: code });
                  toast.success("Excel workbook downloaded");
                } catch (e) { toast.error("Could not generate workbook"); console.error(e); }
              }} variant="outline" className="w-full">
                <FileDown className="h-4 w-4 mr-2" /> Download Excel
              </Button>
            </div>

            <Disclaimer />
          </>
        )}
      </div>
    </AppShell>
  );
}

function MedicationsWithTiers({ medications }: { medications: ScenarioPdfInput["medications"] }) {
  const rows = buildDrugReport(medications);
  const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
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
                <div className="text-[11px] text-muted-foreground">{[r.strength, r.form, r.frequency].filter(Boolean).join(" · ")}</div>
                {r.resolvedDiagnosis ? (
                  <div className="text-[10px] text-muted-foreground mt-0.5">Condition: {r.resolvedDiagnosis}</div>
                ) : null}
                <div className="text-[10px] text-muted-foreground mt-0.5">Retail: {usd(r.retailMonthly)}/mo</div>
                {r.notes.map((n, j) => (
                  <div key={j} className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-2.5 w-2.5 shrink-0" /> {n}
                  </div>
                ))}
              </td>
              <td className="py-2 px-2">
                <div className="font-semibold">{r.tier}</div>
                <div className="text-[10px] text-muted-foreground">{r.tierRationale}</div>
              </td>
              <td className="py-2 px-2 text-right tabular-nums font-semibold">{usd(r.estPlanMonthly)}</td>
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
        This summary is provided for educational purposes only and is not a complete listing of plans available in
        your area. Estimated drug tiers, copays, and premiums are illustrative and vary by plan formulary,
        effective date, and personal eligibility. Nothing here constitutes insurance, medical, tax, or legal advice.
        Please verify benefits and coverage with the carrier or a licensed agent before enrolling.
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

function ContactRequestsPanel({ requests }: { requests: Array<{ email: string; phone: string; createdAt: string }> }) {
  return (
    <Card className="glass p-6 space-y-3 border-primary/30">
      <div className="flex items-center gap-2">
        <Phone className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Consumer contact info (admin only)</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        This person opted in to be contacted by a licensed Medicare expert. Reach out using the details below.
      </p>
      <div className="space-y-2">
        {requests.map((r, i) => (
          <div key={i} className="rounded-md border border-border bg-card/40 p-3 text-sm space-y-1">
            <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground"/><a href={`mailto:${r.email}`} className="text-primary underline underline-offset-2">{r.email}</a></div>
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground"/><a href={`tel:${r.phone}`} className="text-primary underline underline-offset-2">{r.phone}</a></div>
            <div className="text-[11px] text-muted-foreground">Submitted {new Date(r.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecommendationPanel({ scenario }: { scenario: ScenarioPdfInput & { county?: string } }) {
  const plans = rankedPlanDetails({
    year: scenario.year,
    zip3: scenario.zip3,
    medications: scenario.medications,
  });
  const top = plans[0];
  const runnersUp = plans.slice(1, 3);
  const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const why: string[] = [];
  if (scenario.costPreference === "minimize_monthly") why.push("You prefer to minimize monthly premium — this plan has the lowest projected annual total cost in your area.");
  else why.push("You prefer cost predictability — this plan offers stable copays and a known out-of-pocket maximum.");
  if (scenario.medications.length > 0) why.push(`Drug coverage modeled against your ${scenario.medications.length} medication${scenario.medications.length === 1 ? "" : "s"} using CMS Part D tier guidance.`);
  if (scenario.conditions.length > 0) why.push(`Network and benefits considered for your reported conditions: ${scenario.conditions.slice(0, 3).join(", ")}.`);
  if (!top) {
    return <Card className="glass p-6 text-sm text-muted-foreground">No recommendation available.</Card>;
  }
  return (
    <Card className="glass p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">Personalized recommendation</h2>
      </div>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Best match for {scenario.year}</div>
            <div className="font-display text-lg font-bold">{top.carrier} — {top.plan}</div>
            <div className="text-xs text-muted-foreground">{top.planType} · {top.network}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Est. monthly</div>
            <div className="font-display text-2xl font-bold tabular-nums">{usd(top.monthly)}</div>
            <div className="text-[11px] text-muted-foreground">~{usd(top.annual)} / yr incl. drugs</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <Stat label="PCP / Specialist" value={`${top.pcpCopay} / ${top.specCopay}`} />
          <Stat label="ER" value={top.erCopay} />
          <Stat label="Med MOOP" value={top.moop} />
          <Stat label="Stars / AM Best" value={`${top.stars} · ${top.amBest}`} />
        </div>
        <div className="text-xs text-muted-foreground border-t border-border pt-2">{top.extras}</div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Why this plan</div>
        <ul className="space-y-1.5 text-sm">
          {why.map((w, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5"/>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {runnersUp.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Also consider</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {runnersUp.map((p) => (
              <div key={p.rank} className="rounded-md border border-border p-3 text-xs">
                <div className="font-semibold">{p.carrier}</div>
                <div className="text-muted-foreground">{p.plan}</div>
                <div className="mt-1 tabular-nums">{usd(p.monthly)}/mo · {usd(p.annual)}/yr</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
        Estimates based on CMS 2026 reference data for ZIP {scenario.zip3}xx. Actual premiums and benefits vary by plan and effective date.
      </p>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/50 border border-border p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="font-semibold capitalize">{value}</div>
    </div>
  );
}