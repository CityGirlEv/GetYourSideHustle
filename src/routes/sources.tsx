import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/AppShell";
import { ExternalLink, BookOpen, Pill, Building2, FileText } from "lucide-react";

interface SourceEntry {
  label: string;
  url: string;
  description: string;
  badge?: string;
}

interface SourceSection {
  icon: React.ReactNode;
  title: string;
  sources: SourceEntry[];
}

const SECTIONS: SourceSection[] = [
  {
    icon: <Pill className="h-5 w-5" />,
    title: "Drug Pricing Data",
    sources: [
      {
        label: "CMS Medicare Part D Spending by Drug",
        url: "https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug",
        description: "CMS-reported average total spending, unit cost, and claim counts per drug — used to anchor retail estimates to real program data.",
        badge: "CMS",
      },
      {
        label: "CMS Drug Spending Main",
        url: "https://www.cms.gov/Research-Statistics-Data-and-Systems/Statistics-Trends-and-Reports/Information-on-Prescription-Drugs",
        description: "Portal to all CMS drug-spending transparency products (Part B, Part D, and Medicaid).",
        badge: "CMS",
      },
      {
        label: "GoodRx National Averages",
        url: "https://www.goodrx.com",
        description: "Cash-discount pharmacy prices used to validate uninsured retail costs, especially for generics.",
        badge: "Third-party",
      },
      {
        label: "Manufacturer WAC / List Prices",
        url: "https://www.medicare.gov/drug-coverage-comparison",
        description: "Brand-name WAC (Wholesale Acquisition Cost) and list prices are sourced from manufacturer-published pricing and cross-checked against Medicare Plan Finder drug files.",
        badge: "Industry",
      },
    ],
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Medicare Guidelines & Cost Parameters",
    sources: [
      {
        label: "2026 Medicare Parts A & B Premiums and Deductibles",
        url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles",
        description: "Official CMS fact sheet (Nov 2025) — sets the 2026 Part B premium ($202.90/mo) and deductible ($283).",
        badge: "CMS",
      },
      {
        label: "2026 Medicare Part D Bid & Premium Info",
        url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-bid-information-and-part-d-premium-stabilization-demonstration-parameters",
        description: "CMS preliminary Part D bid parameters and premium stabilization demo for CY 2026.",
        badge: "CMS",
      },
      {
        label: "CY 2026 Part D Redesign Program Instructions",
        url: "https://www.cms.gov/files/document/final-cy-2026-part-d-redesign-program-instruction.pdf",
        description: "Final IRA implementation guidance for 2026 — defines the $2,100 Part D out-of-pocket cap and deductible rules.",
        badge: "CMS",
      },
      {
        label: "Inflation Reduction Act & Medicare",
        url: "https://www.cms.gov/inflation-reduction-act-and-medicare",
        description: "CMS hub for IRA provisions including the $35/month insulin cap and vaccine cost-sharing limits.",
        badge: "CMS",
      },
      {
        label: "Medicare Cost Basics",
        url: "https://www.medicare.gov/basics/costs/medicare-costs",
        description: "Consumer-facing summary of Part A, B, and D cost structures used to sanity-check scenario outputs.",
        badge: "Medicare.gov",
      },
    ],
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: "Plan Catalogs & Carrier Data",
    sources: [
      {
        label: "CMS Medicare Plan Finder",
        url: "https://www.medicare.gov/plan-compare",
        description: "Official CMS tool for comparing Medigap, Advantage, and Part D plans by ZIP code.",
        badge: "CMS",
      },
      {
        label: "CMS Medigap Policies",
        url: "https://www.cms.gov/medicare/health-plans/medigap",
        description: "Standardized Medigap plan benefits (A, B, D, G, HDG, K, L, M, N) as approved by CMS for 2026.",
        badge: "CMS",
      },
      {
        label: "CY 2026 Announcement (MA Capitation Rates)",
        url: "https://www.cms.gov/files/document/2026-announcement.pdf",
        description: "CMS ratebook PDF — establishes MA payment benchmarks and regional factors used in plan availability logic.",
        badge: "CMS",
      },
    ],
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Drug Vocabulary & Formularies",
    sources: [
      {
        label: "RxNorm API (NLM)",
        url: "https://rxnav.nlm.nih.gov",
        description: "NIH/NLM REST API used for medication name suggestions and generic-equivalent lookups. Free, no auth, CORS-enabled.",
        badge: "NIH",
      },
      {
        label: "FDA Orange Book",
        url: "https://www.accessdata.fda.gov/scripts/cder/ob/index.cfm",
        description: "Reference for generic-versus-brand status and therapeutic equivalence codes.",
        badge: "FDA",
      },
    ],
  },
];

export default function SourcesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Data Sources & Citations</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Every figure, rate, and catalog entry in the Medicare Optimizer is traceable to an official
          CMS publication, a manufacturer source, or an established third-party price index. This page
          lists the primary references behind the numbers you see in scenario results.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="text-primary">{section.icon}</div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.sources.map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold underline underline-offset-2 hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {s.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {s.badge && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {s.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-secondary/40 border border-border rounded-lg p-5 space-y-3">
        <h2 className="font-display text-lg font-bold">How retail drug prices are estimated</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>
            <strong>Generic drugs</strong> — priced against national pharmacy discount programs
            (Costco Member Prescription, Walmart $4 list, GoodRx coupons). Typical range $4–$15
            per 30-day supply.
          </li>
          <li>
            <strong>Brand-name drugs</strong> — anchored to published WAC (Wholesale Acquisition Cost)
            or manufacturer list price, then validated against CMS Part D spending reports and
            Medicare Plan Finder negotiated-price files.
          </li>
          <li>
            <strong>Insulin</strong> — member cost capped at $35/mo under the Inflation Reduction Act
            (IRA) starting in 2023. Pre-cap retail figures are shown only for context.
          </li>
          <li>
            <strong>DME items (CGMs, pumps, CPAP)</strong> — billed under Medicare Part B, not Part D,
            so they are excluded from Part D drug-cost math but listed for completeness. Pricing
            reflects typical supplier cash rates.
          </li>
        </ul>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          All prices are <strong>estimates for educational comparison only</strong>. They are not
          guaranteed rates, plan-specific copays, or pharmacy quotes. Always verify current pricing
          through{" "}
          <a className="underline" href="https://www.medicare.gov/plan-compare" target="_blank" rel="noopener noreferrer">
            Medicare Plan Finder
          </a>{" "}
          or your plan&apos;s formulary.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link to="/" className="text-sm underline underline-offset-2 hover:text-primary transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}
