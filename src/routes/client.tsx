import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { StrategyScorecard } from "@/components/StrategyScorecard";
import { SignaturePad } from "@/components/SignaturePad";
import { Pill, FileSignature, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/client")({
  component: ClientPortal,
});

function ClientPortal() {
  const { user, clients, soas, addSOA, log } = useApp();
  const router = useRouter();
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!user) router.navigate({ to: "/" });
  }, [user, router]);

  if (!user) return null;
  // Demo: client portal shows the first client record
  const client = clients[0];
  const soa = soas.find((s) => s.client_id === client.id && s.status === "active");

  const onSign = (sig: string) => {
    addSOA({
      client_id: client.id,
      signed_signature_data: sig,
      signature_hash: btoa(sig).slice(0, 24),
      signed_at: new Date().toISOString(),
      ip_address: "10.0.0." + Math.floor(Math.random() * 250),
      status: "active",
    });
    setSigned(true);
    toast.success("Scope of Appointment signed and stored");
  };

  return (
    <AppShell title={`Welcome, ${client.first_name}`} subtitle={`${client.county} County · ZIP ${client.zip_code}`}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="font-display text-xl font-bold mb-3">Financial strategy scorecard</h2>
            <StrategyScorecard client={client} />
          </section>

          <Card className="glass p-5">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Pill className="h-4 w-4 text-primary"/>Your medications</h3>
            <div className="divide-y divide-border">
              {client.meds.map((m) => (
                <div key={m.id} className="py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <div className="font-semibold">{m.medication_name} <span className="text-muted-foreground font-normal">· {m.strength} · {m.dosage_form}</span></div>
                    <div className="text-xs text-muted-foreground">{m.frequency} · {m.resolved_diagnosis ?? "Unmapped"}</div>
                  </div>
                  <div className="font-medium tabular-nums">${m.estimated_monthly_retail}/mo</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass p-5">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2"><FileSignature className="h-4 w-4 text-primary"/>Scope of Appointment</h3>
            {soa || signed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-emerald font-semibold">
                  <ShieldCheck className="h-4 w-4"/> Signed &amp; on file
                </div>
                {soa && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Signed at: {new Date(soa.signed_at).toLocaleString()}</div>
                    <div>IP: {soa.ip_address}</div>
                    <div>Hash: <code>{soa.signature_hash}</code></div>
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => { log("EXPORT_SOA"); toast.success("Dossier PDF queued for download"); }}>
                  <Download className="h-4 w-4 mr-2"/>Download dossier PDF
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  Sign now to authorize your advisor to discuss Medicare Advantage, Part D, and Medigap options.
                </p>
                <SignaturePad onSign={onSign} />
              </>
            )}
          </Card>

          <Card className="glass p-5 bg-primary/5 border-primary/20">
            <h3 className="font-display font-bold mb-2">Why this matters</h3>
            <p className="text-sm text-muted-foreground">
              CMS requires a Scope of Appointment on file at least <strong>48 hours</strong> before any sales discussion.
              Your advisor is automatically blocked from showing plan recommendations until this is signed.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
