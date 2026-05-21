import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Users, Settings2, Search, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUIDELINES } from "@/lib/medicare-math";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPortal,
});

function AdminPortal() {
  const { user, auditLogs, addCredits, credits, year } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) router.navigate({ to: "/" });
  }, [user, router]);
  if (!user) return null;

  const filtered = useMemo(() => auditLogs.filter((l) =>
    [l.action, l.user_email, l.ip_address].join(" ").toLowerCase().includes(q.toLowerCase())
  ), [auditLogs, q]);

  const g = GUIDELINES[year];

  return (
    <AppShell title="System administration" subtitle="Immutable audit trail · staff management · global Medicare config">
      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="audit"><ScrollText className="h-4 w-4 mr-1.5"/>Audit logs</TabsTrigger>
          <TabsTrigger value="staff"><Users className="h-4 w-4 mr-1.5"/>Staff &amp; credits</TabsTrigger>
          <TabsTrigger value="rules"><Settings2 className="h-4 w-4 mr-1.5"/>Rule adjuster</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-3">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by action, user, or IP" className="pl-9"/>
          </div>
          <Card className="glass overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Details</th></tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-2 text-muted-foreground tabular-nums">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2">{l.user_email}</td>
                    <td className="px-4 py-2 capitalize"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{l.user_role}</span></td>
                    <td className="px-4 py-2 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{l.ip_address}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{l.details ? JSON.stringify(l.details) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card className="glass p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-display font-bold">Jordan Mercer · Advisor</h3>
                <p className="text-xs text-muted-foreground">NPN 9241077 · advisor@demo.health</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm">Balance: <span className="font-bold tabular-nums">{credits}</span></div>
                <Button size="sm" variant="outline" onClick={() => { addCredits(5, "Admin top-up +5"); toast.success("Added 5 credits"); }}><Plus className="h-4 w-4"/>5</Button>
                <Button size="sm" variant="outline" onClick={() => { addCredits(-1, "Admin deduction -1"); }}><Minus className="h-4 w-4"/>1</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card className="glass p-5">
            <h3 className="font-display font-bold mb-3">Active {year} configuration</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {Object.entries(g).map(([k, v]) => (
                <div key={k} className="flex justify-between border border-border rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold tabular-nums">{typeof v === "number" ? `$${v.toLocaleString()}` : v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              These values drive the side-by-side comparison engine across every client dossier.
              Toggle the year using the chip in the header to switch the entire app's calculations.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
