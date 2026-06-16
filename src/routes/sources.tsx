import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/AppShell";
import { ExternalLink, Pill, Building2, FileText } from "lucide-react";

export const Route = createFileRoute("/sources")({
  component: SourcesPage,
  head: () => ({
    meta: [
      { title: "Scenario Data Sources | Get Part B Optimizer" },
      {
        name: "description",
        content:
          "Citations for every figure used to build a Get Part B Optimizer scenario result — CMS cost parameters, plan catalogs, and drug pricing inputs.",
      },
    ],
  }),
});

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
    icon: <FileText className="h-5 w-5" />,
    title: "Cost Parameters Used in Scenario Math",
    sources: [
      {
        label: "2026 Medicare Parts A & B Premiums and Deductibles",
        url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles",
        description:
          "Sets the Part B premium ($202.90/mo) and deductible ($283) used in every scenario result.",
        badge: "CMS",
      },
      {
        label: "CY 2026 Part D Redesign Program Instructions",
        url: "https://www.cms.gov/files/document/final-cy-2026-part-d-redesign-program-instruction.pdf",
        description:
          "Defines the $2,100 Part D out-of-pocket cap and deductible rules applied to drug-cost projections.",
        badge: "CMS",
      },
      {
        label: "2026 Medicare Part D Bid & Premium Info",
        url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-bid-information-and-part-d-premium-stabilization-demonstration-parameters",
        description:
          "Baseline Part D bid parameters used to derive plan-level monthly premiums shown in result plans.",
        badge: "CMS",
      },
      {
        label: "Inflation Reduction Act & Medicare",
        url: "https://www.cms.gov/inflation-reduction-act-and-medicare",
        description:
          "IRA provisions enforced in scenario math — $35/mo insulin cap and $0 vaccine cost-sharing.",
        badge: "CMS",
      },
    ],
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: "Plan Catalogs Behind Result Plans",
    sources: [
      {
        label: "CMS Medigap Policies",
        url: "https://www.cms.gov/medicare/health-plans/medigap",
        description:
          "Standardized 2026 Medigap plan letters (A, B, D, G, HDG, K, L, M, N) and benefit tables that drive Medigap result rows.",
        badge: "CMS",
      },
      {
        label: "CMS Medicare Plan Finder",
        url: "https://www.medicare.gov/plan-compare",
        description:
          "Source-of-truth catalog for Medicare Advantage and Part D plan types referenced by scenario results.",
        badge: "CMS",
      },
    ],
  },
  {
    icon: <Pill className="h-5 w-5" />,
    title: "Drug Pricing Inputs to Scenario Results",
    sources: [
      {
        label: "CMS Medicare Part D Spending by Drug",
        url: "https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug",
        description:
          "Average total spending, unit cost, and claim counts per drug — anchors the retail estimates used in scenario drug-cost lines.",
        badge: "CMS",
      },
      {
        label: "Manufacturer WAC / List Prices",
        url: "https://www.medicare.gov/drug-coverage-comparison",
        description:
          "Brand-name WAC pricing cross-checked against Medicare Plan Finder drug files for scenario brand-drug estimates.",
        badge: "Industry",
      },
    ],
  },
];

export default function SourcesPage() {
  return (
    <AppShell
      title="Data Sources & Citations"
      subtitle="Every figure, rate, and catalog entry in Get Part B Optimizer is traceable to an official CMS publication, a manufacturer source, or an established third-party price index."
    >
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
            (Costco Member Prescription, Walmart $4 list, GoodRx coupons). Typical range $4–$15 per
            30-day supply.
          </li>
          <li>
            <strong>Brand-name drugs</strong> — anchored to published WAC (Wholesale Acquisition
            Cost) or manufacturer list price, then validated against CMS Part D spending reports and
            Medicare Plan Finder negotiated-price files.
          </li>
          <li>
            <strong>Insulin</strong> — member cost capped at $35/mo under the Inflation Reduction
            Act (IRA) starting in 2023. Pre-cap retail figures are shown only for context.
          </li>
          <li>
            <strong>DME items (CGMs, pumps, CPAP)</strong> — billed under Medicare Part B, not Part
            D, so they are excluded from Part D drug-cost math but listed for completeness. Pricing
            reflects typical supplier cash rates.
          </li>
        </ul>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          All prices are <strong>estimates for educational comparison only</strong>. They are not
          guaranteed rates, plan-specific copays, or pharmacy quotes. Always verify current pricing
          through{" "}
          <a
            className="underline"
            href="https://www.medicare.gov/plan-compare"
            target="_blank"
            rel="noopener noreferrer"
          >
            Medicare Plan Finder
          </a>{" "}
          or your plan&apos;s formulary.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/"
          className="text-sm underline underline-offset-2 hover:text-primary transition-colors"
        >
          Back to home
        </Link>
      </div>
    </AppShell>
  );
}
