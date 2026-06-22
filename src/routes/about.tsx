import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { MedicareDisclaimers } from "@/components/MedicareDisclaimers";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import {
  GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER,
  SITE_BRAND_NAME,
  SITE_BRAND_THE,
} from "@/lib/medicare-disclaimers";
import { SITE_TAGLINE } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";
import {
  PLAN_COMPARISON_CTA,
  PLAN_COMPARISON_EDUCATIONAL_NOTE,
} from "@/lib/plan-comparison-copy";

const PAGE_URL = canonicalUrl("/about");

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${SITE_BRAND_NAME}` },
      {
        name: "description",
        content: `${SITE_BRAND_THE} is an independent Medicare education platform. ${GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER}`,
      },
      { property: "og:title", content: `About — ${SITE_BRAND_NAME}` },
      {
        property: "og:description",
        content: `Independent Medicare plan comparison and education. ${GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER}`,
      },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell
      title={`About ${SITE_BRAND_NAME}`}
      subtitle="Independent Medicare education — de-identified plan comparisons, no sales pressure."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="glass p-5 border-primary/20 space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {SITE_BRAND_THE} is a Third-Party Marketing Organization (TPMO) and educational
                technology platform. We help people compare sample Medicare plan options using
                de-identified inputs — not personal health records or Social Security numbers.{" "}
                {PLAN_COMPARISON_EDUCATIONAL_NOTE}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            {SITE_TAGLINE} Our tools explain plan types, enrollment timing, and cost concepts in
            plain language so you can prepare questions for a licensed professional or verify details
            on{" "}
            <a
              href="https://www.medicare.gov"
              className="text-primary font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Medicare.gov
            </a>
            .
          </p>
          <p>
            We do not sell insurance, act as your agent of record, or enroll you in coverage through
            the public plan comparison builder. When you request assistance, your information may be shared
            with a licensed agency partner so they can respond — always on your terms.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="grad-indigo">
            <Link to="/scenario/new">
              {PLAN_COMPARISON_CTA} <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/learning-center">Learning Center</Link>
          </Button>
        </div>

        <Card className="glass p-5 border-border/60">
          <h2 className="font-display text-base font-bold mb-3">Important notices</h2>
          <MedicareDisclaimers />
        </Card>
      </div>
    </AppShell>
  );
}
