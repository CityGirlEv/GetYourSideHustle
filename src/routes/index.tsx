import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck, EyeOff, KeyRound, FileText } from "lucide-react";
import { SecurityBanner } from "@/components/SecurityBanner";
import { CMSFooter } from "@/components/CMSFooter";
import muntieLogo from "@/assets/muntie-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Medicare Optimizer — De-identified Plan Comparison" },
      { name: "description", content: "Compare Medicare plans without giving up your personal information. We store only de-identified scenarios you control." },
    ],
  }),
  component: Index,
});

function Index() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <main className="flex-1 grid lg:grid-cols-2 items-start gap-10 px-6 lg:px-16 py-12 max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-border">
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <img src={muntieLogo} alt="Medicare Optimizer" className="h-20 w-20 object-contain" />
            </div>
            <div className="text-center pl-28 pr-4">
              <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-emerald whitespace-nowrap">The Medicare Optimizer</h1>
              <p className="text-xs md:text-sm italic text-emerald font-semibold mt-1">Getting the Best Bang For Your Medical Needs Because You Deserve It!</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl">
            Side-by-side Original Medicare + Medigap vs. Medicare Advantage modeling under live 2026 &amp; 2027 federal rules — built on a <strong>zero-PII</strong> scenario model. We never collect your name, address, phone, email, Social Security number, Medicare ID, or full date of birth.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-xl">
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
              <h2 className="font-display text-2xl font-bold">I'm comparing my Medicare options</h2>
              <p className="text-sm text-muted-foreground mt-2">Build a de-identified scenario in 2 minutes. You'll get a Scenario ID to share with the agent of <em>your</em> choice. We will never contact you.</p>
            </div>
            <Button onClick={() => router.navigate({ to: "/scenario/new" })} className="grad-indigo w-full h-12 text-base">
              Build a scenario →
            </Button>
            <p className="text-xs text-muted-foreground">No account. No login. No personal information.</p>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => router.navigate({ to: "/auth" })} className="text-sm text-muted-foreground">
              I'm a Medicare agent — sign in
            </Button>
          </div>
        </div>
      </main>
      <CMSFooter />
    </div>
  );
}
