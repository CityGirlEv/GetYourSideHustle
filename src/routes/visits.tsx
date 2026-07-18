import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/visits")({
  head: () => ({
    meta: [
      { title: "Site Visits — Part B Optimizer Benchmark Tool" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: VisitsPage,
});

interface VisitRow {
  id: string;
  ip_address: string | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  path: string | null;
  referrer: string | null;
  user_agent: string | null;
  user_id: string | null;
  created_at: string;
}

function VisitsPage() {
  const { user } = useApp();
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_visits")
      .select(
        "id, ip_address, country, country_code, region, city, path, referrer, user_agent, user_id, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) setRows(data as VisitRow[]);
    setLoading(false);
  }

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user?.role]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.ip_address, r.country, r.region, r.city, r.path, r.referrer, r.user_agent]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s)),
    );
  }, [rows, q]);

  const uniqueIps = useMemo(
    () => new Set(rows.map((r) => r.ip_address).filter(Boolean)).size,
    [rows],
  );

  if (user?.role !== "admin") {
    return (
      <AppShell title="Site Visits" subtitle="Admin only.">
        <p className="text-sm text-muted-foreground">You don't have access to this page.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Site Visits" subtitle="Recent visitor IP addresses and approximate locations.">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search IP, country, city, path…"
            className="w-72"
          />
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {rows.length} visits · {uniqueIps} unique IPs
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">IP</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Path</th>
                  <th className="px-3 py-2">Referrer</th>
                  <th className="px-3 py-2">User agent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 align-top">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.ip_address ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      {[r.city, r.region, r.country].filter(Boolean).join(", ") || "—"}
                      {r.country_code ? (
                        <span className="ml-1 text-muted-foreground">({r.country_code})</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs break-all max-w-[260px]">
                      {r.path ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs break-all max-w-[220px]">
                      {r.referrer ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs break-all max-w-[260px] text-muted-foreground">
                      {r.user_agent ?? "—"}
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      No visits recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
