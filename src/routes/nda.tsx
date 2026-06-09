import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";
import { NDA_BODY, NDA_TITLE, NDA_VERSION, buildNdaPdf } from "@/lib/nda";
import { toast } from "sonner";
import { FileSignature, FileCheck2, Download, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/nda")({
  head: () => ({
    meta: [
      { title: "Beta NDA — The Medicare Optimizer" },
      { name: "description", content: "Review and sign the non-disclosure agreement required for Medicare Optimizer beta access." },
      { property: "og:title", content: "Beta NDA — The Medicare Optimizer" },
      { property: "og:description", content: "Review and sign the Medicare Optimizer beta NDA." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/nda" },
    ],
    links: [
      { rel: "canonical", href: "https://themedicareoptimizer.lovable.app/nda" },
    ],
  }),
  component: NdaPage,
});

interface SignedRow {
  id: string;
  full_name: string;
  signed_at: string;
  pdf_path: string;
  agreement_version: string;
}

function NdaPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const [existing, setExisting] = useState<SignedRow | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [accept, setAccept] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.navigate({ to: "/auth" }); return; }
    setFullName(user.full_name || "");
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("nda_signatures")
        .select("id, full_name, signed_at, pdf_path, agreement_version")
        .eq("user_id", user.id)
        .eq("agreement_version", NDA_VERSION)
        .maybeSingle();
      if (cancelled) return;
      setExisting((data as SignedRow | null) ?? null);
      if (data?.pdf_path) {
        const { data: signed } = await supabase.storage
          .from("nda-signatures")
          .createSignedUrl(data.pdf_path, 60 * 60);
        if (!cancelled) setDownloadUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, router]);

  async function handleSign() {
    if (!user) return;
    if (fullName.trim().length < 3) { toast.error("Please type your full legal name."); return; }
    if (!accept) { toast.error("You must check the box to confirm agreement."); return; }
    setSubmitting(true);
    try {
      const signedAt = new Date();
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
      const pdf = buildNdaPdf({
        fullName: fullName.trim(),
        email: user.email,
        signedAt,
        agreementVersion: NDA_VERSION,
        userAgent: ua,
      });
      const blob = pdf.output("blob");
      const path = `${user.id}/${NDA_VERSION}-${signedAt.getTime()}.pdf`;
      const up = await supabase.storage
        .from("nda-signatures")
        .upload(path, blob, { contentType: "application/pdf", upsert: false });
      if (up.error) throw up.error;

      const ins = await supabase.from("nda_signatures").insert({
        user_id: user.id,
        full_name: fullName.trim(),
        email: user.email,
        agreement_version: NDA_VERSION,
        pdf_path: path,
        user_agent: ua,
      }).select("id, full_name, signed_at, pdf_path, agreement_version").single();
      if (ins.error) throw ins.error;

      const { data: signed } = await supabase.storage
        .from("nda-signatures")
        .createSignedUrl(path, 60 * 60);
      setExisting(ins.data as SignedRow);
      setDownloadUrl(signed?.signedUrl ?? null);
      toast.success("NDA signed and stored. You can download a copy below.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not save NDA";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <AppShell title="Non-Disclosure Agreement" subtitle="Sign electronically before accessing the beta">
      {loading ? (
        <Card className="glass p-6 text-sm text-muted-foreground">Loading…</Card>
      ) : existing ? (
        <Card className="glass p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald">
            <FileCheck2 className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold">NDA on file</h2>
          </div>
          <div className="text-sm grid gap-1">
            <div><span className="text-muted-foreground">Signed by:</span> {existing.full_name}</div>
            <div><span className="text-muted-foreground">Date:</span> {new Date(existing.signed_at).toLocaleString()}</div>
            <div><span className="text-muted-foreground">Version:</span> {existing.agreement_version}</div>
          </div>
          {downloadUrl && (
            <div className="flex gap-2">
              <a href={downloadUrl} target="_blank" rel="noreferrer" download>
                <Button size="sm"><Download className="h-4 w-4 mr-1.5" /> Download signed PDF</Button>
              </a>
              <Link to="/agent"><Button size="sm" variant="outline">Continue</Button></Link>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="glass p-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">{NDA_TITLE}</h2>
            </div>
            <div className="max-h-[420px] overflow-y-auto border rounded-md p-4 bg-background/40 text-sm leading-relaxed space-y-2">
              {NDA_BODY.map((p, i) => p === "" ? <div key={i} className="h-2" /> : <p key={i}>{p}</p>)}
            </div>
          </Card>

          <Card className="glass p-6 space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="text-xs text-muted-foreground">Your full legal name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane A. Doe" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <Input value={user.email} disabled />
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} />
              <span>I have read the NDA above and agree to its terms. I understand that typing my name and clicking "I agree and sign" constitutes my legal electronic signature.</span>
            </label>
            <div className="flex gap-2">
              <Button onClick={handleSign} disabled={submitting}>
                <FileSignature className="h-4 w-4 mr-1.5" />
                {submitting ? "Signing…" : "I agree and sign"}
              </Button>
              <Link to="/"><Button variant="outline">Cancel</Button></Link>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}