import { createFileRoute } from "@tanstack/react-router";
import { useApp, ADVISOR_ID, ADMIN_ID, type Role } from "@/lib/app-store";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, User, UserCog, Crown, KeyRound, Lock } from "lucide-react";
import { SecurityBanner } from "@/components/SecurityBanner";
import { CMSFooter } from "@/components/CMSFooter";
import muntieLogo from "@/assets/muntie-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
});

const ROLES: { id: Role; label: string; blurb: string; icon: typeof User; userId: string; email: string; name: string; npn?: string }[] = [
  { id: "client", label: "Client", blurb: "View your PHI, meds, and digital SOA", icon: User, userId: "client-1", email: "client@demo.health", name: "Eleanor Whitfield" },
  { id: "advisor", label: "Advisor / Agent", blurb: "Manage roster, audits, and SOAs", icon: UserCog, userId: ADVISOR_ID, email: "advisor@demo.health", name: "Jordan Mercer", npn: "9241077" },
  { id: "admin", label: "Admin", blurb: "Audit logs, staff, global config", icon: Crown, userId: ADMIN_ID, email: "admin@demo.health", name: "Dr. Anika Rao" },
];

function Index() {
  const { setUser, log } = useApp();
  const router = useRouter();
  const [role, setRole] = useState<Role>("advisor");
  const [mfaOpen, setMfaOpen] = useState(false);
  const [code, setCode] = useState("");

  const start = () => setMfaOpen(true);

  const verify = () => {
    if (code.length < 6) return;
    const r = ROLES.find((x) => x.id === role)!;
    setUser({ id: r.userId, email: r.email, full_name: r.name, role: r.id, npn_number: r.npn });
    log("LOGIN", { role: r.id, mfa: "passed" });
    router.navigate({ to: `/${r.id}` });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <main className="flex-1 grid lg:grid-cols-2 items-center gap-10 px-6 lg:px-16 py-12 max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-border">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span
                className="italic font-serif tracking-wider text-blue-600 leading-none text-lg md:text-xl h-20 flex items-center"
                style={{ writingMode: "vertical-rl" }}
              >
                Built By
              </span>
              <img src={muntieLogo} alt="Medicare Optimizer" className="h-20 w-20 object-contain" />
            </div>
            <div className="text-center px-32">
              <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-emerald">The Medicare Optimizer</h1>
              <p className="text-base md:text-lg text-emerald font-semibold mt-1">Getting the Best Bang For Your Medical Needs Because You Deserve It!</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl">
            Side-by-side Original Medicare + Medigap vs. Medicare Advantage modeling under live 2026 &amp; 2027 federal rules.
            Built for HIPAA compliance from the first click — encrypted sessions, immutable audit, and 15-minute idle lockout.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald"/> HIPAA · CMS Marketing Rules · 48-hour SOA enforcement
          </div>
          <div className="glass rounded-2xl p-5 max-w-md">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Quick demo logins</div>
            <div className="text-sm">Pick any role on the right — credentials are pre-filled for the demo.</div>
          </div>
        </div>

        <Card className="glass p-6 lg:p-8">
          {!mfaOpen ? (
            <>
              <div className="space-y-1 mb-5">
                <h2 className="font-display text-2xl font-bold">Secure sign in</h2>
                <p className="text-sm text-muted-foreground">Choose a role to enter the workflow.</p>
              </div>
              <div className="grid gap-3 mb-5">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${active ? "grad-indigo" : "bg-secondary"}`}>
                        <Icon className={`h-5 w-5 ${active ? "text-white" : "text-primary"}`}/>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{r.label}</div>
                        <div className="text-xs text-muted-foreground">{r.blurb}</div>
                      </div>
                      {active && <span className="text-xs font-semibold text-emerald">Selected</span>}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3">
                <div><Label>Email</Label><Input defaultValue={ROLES.find(r=>r.id===role)?.email} /></div>
                <div><Label>Password</Label><Input type="password" defaultValue="••••••••••" /></div>
              </div>
              <Button onClick={start} className="w-full grad-indigo mt-5 h-11"><Lock className="h-4 w-4 mr-2"/>Continue to MFA</Button>
            </>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-xl grad-indigo flex items-center justify-center"><KeyRound className="h-6 w-6 text-white"/></div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Two-factor verification</h2>
                  <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
                </div>
              </div>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="text-center text-2xl tracking-[0.6em] h-14 font-mono"
              />
              <div className="text-xs text-muted-foreground mt-2">Demo: enter any 6 digits.</div>
              <div className="flex gap-2 mt-5">
                <Button variant="outline" onClick={() => setMfaOpen(false)} className="flex-1">Back</Button>
                <Button onClick={verify} className="grad-indigo flex-1 h-11" disabled={code.length < 6}>Verify &amp; enter</Button>
              </div>
            </div>
          )}
        </Card>
      </main>
      <CMSFooter />
    </div>
  );
}
