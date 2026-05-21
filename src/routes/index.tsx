import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, FileLock2 } from "lucide-react";
import { SecurityBanner } from "@/components/SecurityBanner";
import { CMSFooter } from "@/components/CMSFooter";
import muntieLogo from "@/assets/muntie-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, lockState } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (lockState === "unlocked" && user) router.navigate({ to: `/${user.role}` });
  }, [lockState, user, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <main className="flex-1 grid lg:grid-cols-2 items-center gap-10 px-6 lg:px-16 py-12 max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-border">
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <img src={muntieLogo} alt="Medicare Optimizer" className="h-20 w-20 object-contain" />
            </div>
            <div className="text-center px-32">
              <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-emerald">The Medicare Optimizer</h1>
              <p className="text-xs md:text-sm italic text-emerald font-semibold mt-1">Getting the Best Bang For Your Medical Needs Because You Deserve It!</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl">
            Side-by-side Original Medicare + Medigap vs. Medicare Advantage modeling under live 2026 &amp; 2027 federal rules,
            built on a zero-knowledge encrypted vault: client PHI is encrypted in your browser before it ever reaches our servers.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-xl">
            <div className="glass rounded-xl p-3 text-xs"><Lock className="h-4 w-4 text-primary mb-1" /><strong>AES-256-GCM</strong><br />in-browser encryption</div>
            <div className="glass rounded-xl p-3 text-xs"><FileLock2 className="h-4 w-4 text-primary mb-1" /><strong>Append-only</strong><br />audit log of every access</div>
            <div className="glass rounded-xl p-3 text-xs"><ShieldCheck className="h-4 w-4 text-primary mb-1" /><strong>15-min auto-lock</strong><br />on idle</div>
          </div>
        </div>

        <div className="glass rounded-2xl p-8 text-center space-y-5">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl grad-indigo">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Advisor portal</h2>
            <p className="text-sm text-muted-foreground mt-2">Create an account or sign in to access your encrypted client vault.</p>
          </div>
          <Button onClick={() => router.navigate({ to: "/auth" })} className="grad-indigo w-full h-12">
            Sign in / Create account
          </Button>
          <p className="text-xs text-muted-foreground">
            Strong technical safeguards in place. Full HIPAA compliance also requires BAAs and policies at your organization — do not enter real patient data until those are in place.
          </p>
        </div>
      </main>
      <CMSFooter />
    </div>
  );
}
