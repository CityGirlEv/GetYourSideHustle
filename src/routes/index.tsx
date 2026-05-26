import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck, EyeOff, KeyRound, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Medicare Optimizer — De-identified Plan Comparison" },
      { name: "description", content: "Compare Medicare plans without giving up your personal information. We store only de-identified scenarios you control." },
      { property: "og:title", content: "The Medicare Optimizer — De-identified Plan Comparison" },
      { property: "og:description", content: "Compare Medicare plans without giving up your personal information. We store only de-identified scenarios you control." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://themedicareoptimizer.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "The Medicare Optimizer",
          url: "https://themedicareoptimizer.lovable.app/",
          description: "De-identified Medicare plan comparison for 2026 and 2027.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "The Medicare Optimizer",
          url: "https://themedicareoptimizer.lovable.app/",
          description: "AI-powered Medicare plan optimizer using zero-PII scenarios under live federal rules.",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const router = useRouter();

  return (
    <AppShell title="">
      <div className="grid lg:grid-cols-2 items-start gap-10">
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground max-w-none">
            Side-by-side Original Medicare + Medigap vs. Medicare Advantage modeling under live 2026 &amp; 2027 federal rules — built on a <strong>zero-PII</strong> scenario model. We never collect your name, address, phone, email, Social Security number, Medicare ID, or full date of birth.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-none">
            <div className="glass rounded-xl p-3 text-xs"><EyeOff className="h-4 w-4 text-primary mb-1" /><strong>No PII collected</strong><br />Year of birth + ZIP3 only</div>
            <div className="glass rounded-xl p-3 text-xs"><KeyRound className="h-4 w-4 text-primary mb-1" /><strong>Scenario ID</strong><br />You decide who sees it</div>
            <div className="glass rounded-xl p-3 text-xs"><ShieldCheck className="h-4 w-4 text-primary mb-1" /><strong>90-day auto-delete</strong><br />Nothing kept forever</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-8 text-center space-y-5">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl grad-indigo">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase">Give me the best Medicare Plan based upon my scenario</h2>
              <p className="text-sm text-muted-foreground mt-2">Build a de-identified scenario in 2 minutes. You'll get a Scenario ID to share with the agent of <em>your</em> choice. We will never contact you without your explicit permission.</p>
            </div>
            <Button onClick={() => router.navigate({ to: "/scenario/new" })} className="grad-indigo w-full h-12 text-base animate-pulse">
              BUILD MY SCENARIO →
            </Button>
            <p className="text-xs text-muted-foreground">No account. No login. No personal information.</p>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => router.navigate({ to: "/auth" })} className="text-sm text-muted-foreground">
              I'm a Medicare agent — sign in
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-10 px-6 py-4 text-xs text-muted-foreground border-t border-border bg-secondary/30 text-center max-w-4xl mx-auto">
        <p className="leading-relaxed">
          Disclaimer: The Medicare Optimizer is an educational and comparison tool only. We do not sell insurance, act as a licensed agent, or provide personalized legal, tax, or medical advice. Plan names, premiums, and benefits shown are estimated based on publicly available CMS data and may differ from actual carrier offerings in your area. Always verify details with a licensed insurance agent or by visiting <a href="https://www.medicare.gov" className="underline" target="_blank" rel="noopener noreferrer">Medicare.gov</a> before enrolling.
        </p>
      </div>
    </AppShell>
  );
}
