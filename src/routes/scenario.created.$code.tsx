import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SecurityBanner } from "@/components/SecurityBanner";
import { CMSFooter } from "@/components/CMSFooter";
import { CheckCircle2, Copy, ShieldCheck, FileDown, Phone } from "lucide-react";
import { toast } from "sonner";
import { downloadScenarioPdf, type ScenarioPdfInput } from "@/lib/scenario-pdf";
import { useEffect, useState } from "react";
import { ExpertOptInDialog } from "@/components/ExpertOptInDialog";

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
  const [optInOpen, setOptInOpen] = useState(false);

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

  const downloadPdf = () => {
    try {
      const raw = sessionStorage.getItem(`scenario:${code}`);
      if (!raw) { toast.error("PDF not available — re-open after creating the scenario."); return; }
      const input = JSON.parse(raw) as ScenarioPdfInput;
      downloadScenarioPdf(input);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error("Could not generate PDF");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="glass p-8 max-w-xl w-full space-y-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald mx-auto">
            <CheckCircle2 className="h-7 w-7 text-emerald-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold">Your Scenario ID</h1>
            <p className="text-sm text-muted-foreground">Write this down or copy it. <strong>Without it, even we cannot find your scenario.</strong></p>
          </div>

          <div className="bg-background border-2 border-primary rounded-xl p-5 font-mono text-2xl tracking-wider break-all select-all">
            {code}
          </div>

          <Button onClick={copy} variant="outline" className="w-full">
            <Copy className="h-4 w-4 mr-2" /> Copy Scenario ID
          </Button>

          <Button onClick={downloadPdf} className="w-full grad-indigo">
            <FileDown className="h-4 w-4 mr-2" /> Download plan comparison PDF
          </Button>

          <Button onClick={() => setOptInOpen(true)} variant="outline" className="w-full">
            <Phone className="h-4 w-4 mr-2" /> Have a licensed expert contact me
          </Button>

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
      </main>
      <CMSFooter />
      <ExpertOptInDialog open={optInOpen} onOpenChange={setOptInOpen} />
    </div>
  );
}
