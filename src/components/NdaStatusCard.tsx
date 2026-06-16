import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";
import { NDA_VERSION } from "@/lib/nda";
import { FileCheck2, FileSignature, Download } from "lucide-react";

export function NdaStatusCard() {
  const { user } = useApp();
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("nda_signatures")
        .select("signed_at, pdf_path")
        .eq("user_id", user.id)
        .eq("agreement_version", NDA_VERSION)
        .maybeSingle();
      if (cancelled) return;
      if (data?.pdf_path) {
        setSignedAt(data.signed_at);
        const { data: signed } = await supabase.storage
          .from("nda-signatures")
          .createSignedUrl(data.pdf_path, 60 * 60);
        if (!cancelled) setUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || loading) return null;

  if (signedAt && url) {
    return (
      <Card className="glass p-3 flex flex-wrap items-center gap-3 text-sm border-emerald/40">
        <FileCheck2 className="h-4 w-4 text-emerald" />
        <span>NDA on file — signed {new Date(signedAt).toLocaleDateString()}.</span>
        <a href={url} target="_blank" rel="noreferrer" className="ml-auto">
          <Button size="sm" variant="outline">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download signed NDA
          </Button>
        </a>
      </Card>
    );
  }

  return (
    <Card className="glass p-3 flex flex-wrap items-center gap-3 text-sm border-amber-500/40">
      <FileSignature className="h-4 w-4 text-amber-500" />
      <span>Action required: you must sign the beta NDA before accessing beta features.</span>
      <Link to="/nda" className="ml-auto">
        <Button size="sm">Sign NDA</Button>
      </Link>
    </Card>
  );
}
