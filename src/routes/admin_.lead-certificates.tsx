import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { Button } from "@/components/ui/button";
import {
  LeadCertificateAuditTable,
  type LeadCertificateAuditRow,
} from "@/components/LeadCertificateAuditTable";
import { useApp } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin_/lead-certificates")({
  head: () => ({
    meta: [
      { title: "Lead Certificates — Admin" },
      {
        name: "description",
        content:
          "Immutable consent audit trail for lead certificates submitted through the expert opt-in form.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LeadCertificatesAdminPage,
});

function LeadCertificatesAdminPage() {
  const { user } = useApp();
  const [certificates, setCertificates] = useState<LeadCertificateAuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("lead_certificates")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(500);
      if (cancelled) return;
      if (error) console.error("lead certificates load", error);
      setCertificates((data ?? []) as LeadCertificateAuditRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#lead-certificates") return;
    const scrollToSection = () => {
      document.getElementById("lead-certificates")?.scrollIntoView({ behavior: "smooth" });
    };
    const timer = window.setTimeout(scrollToSection, loading ? 400 : 0);
    return () => window.clearTimeout(timer);
  }, [loading, certificates.length]);

  return (
    <AdminAccessGate>
      <AppShell
        title="Lead certificates"
        subtitle="Immutable consent audit trail for expert opt-in submissions."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
            <Link to="/admin/pbo-scenarios">
              <Button variant="outline" size="sm">
                PBO scenarios
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground px-1">Loading lead certificates…</p>
          ) : null}

          <LeadCertificateAuditTable certificates={certificates} />
        </div>
      </AppShell>
    </AdminAccessGate>
  );
}
