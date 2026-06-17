import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricingPlans } from "@/components/PricingPlans";
import { useApp } from "@/lib/app-store";
import { canonicalUrl } from "@/lib/site-url";
import { NDA_BODY, NDA_TITLE, NDA_VERSION } from "@/lib/nda";
import {
  createStripeCheckoutSession,
  listPublicStripePlans,
  registerCustomerAndCheckout,
} from "@/lib/stripe.functions";
import type { StripePlanKey } from "@/lib/stripe-products";
import { toast } from "sonner";
import { FileSignature, Loader2, ShieldCheck } from "lucide-react";

const PRICING_URL = canonicalUrl("/pricing");

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Agent Plans & Pricing — Get Part B Optimizer" },
      {
        name: "description",
        content:
          "Subscribe to Get Part B Optimizer agent plans with exclusive leads, CRM access, and scenario tools.",
      },
      { property: "og:title", content: "Agent Plans & Pricing — Get Part B Optimizer" },
      { property: "og:url", content: PRICING_URL },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: PRICING_URL }],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const fetchPlans = useServerFn(listPublicStripePlans);
  const startCheckout = useServerFn(createStripeCheckoutSession);
  const registerAndCheckout = useServerFn(registerCustomerAndCheckout);

  const [configuredPlans, setConfiguredPlans] = useState<Record<string, boolean>>({});
  const [selectedPlan, setSelectedPlan] = useState<StripePlanKey | null>("subscription_intro");
  const [signupOpen, setSignupOpen] = useState(false);
  const [ndaOpen, setNdaOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [acceptNda, setAcceptNda] = useState(false);

  useEffect(() => {
    fetchPlans()
      .then((plans) => {
        const map: Record<string, boolean> = {};
        for (const p of plans) map[p.key] = p.priceConfigured;
        setConfiguredPlans(map);
      })
      .catch(() => {});
  }, [fetchPlans]);

  if (authLoading) return null;

  const handleSelectPlan = async (planKey: StripePlanKey) => {
    setSelectedPlan(planKey);
    if (authLoading) return;

    if (user) {
      setBusy(true);
      try {
        const { url } = await startCheckout({ data: { planKey } });
        window.location.href = url;
      } catch (e) {
        toast.error((e as Error).message ?? "Could not start checkout");
      } finally {
        setBusy(false);
      }
      return;
    }

    setSignupOpen(true);
  };

  const openNdaStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return toast.error("Select a plan first.");
    if (firstName.trim().length < 1) return toast.error("Enter your first name.");
    if (lastName.trim().length < 1) return toast.error("Enter your last name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Enter a valid email.");
    if (phone.replace(/\D/g, "").length < 7) return toast.error("Enter a valid phone number.");
    if (password.length < 12) return toast.error("Password must be at least 12 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    setSignatureName(`${firstName.trim()} ${lastName.trim()}`);
    setAcceptNda(false);
    setNdaOpen(true);
  };

  const submitSignupAndCheckout = async () => {
    if (!selectedPlan) return;
    if (signatureName.trim().length < 3) return toast.error("Type your full legal name to sign.");
    if (!acceptNda) return toast.error("Accept the NDA to continue.");
    setBusy(true);
    try {
      const { checkoutUrl } = await registerAndCheckout({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          password_confirm: confirmPassword,
          signature_name: signatureName.trim(),
          accept_nda: true,
          planKey: selectedPlan,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      });
      window.location.href = checkoutUrl;
    } catch (e) {
      toast.error((e as Error).message ?? "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      title="Agent plans & pricing"
      subtitle="Subscribe for exclusive Medicare leads and agent tools"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="glass p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Licensed Medicare agents — secure checkout powered by Stripe (test mode).
          </p>
          <div className="flex gap-2">
            {user ? (
              <Link to="/agent">
                <Button variant="outline" size="sm">
                  Agent dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth" search={{ tab: "sign-in" }}>
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </Card>

        <PricingPlans
          onSelectPlan={handleSelectPlan}
          selectedPlanKey={selectedPlan}
          configuredPlans={configuredPlans}
        />

        {busy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to secure checkout…
            </div>
          </div>
        )}
      </div>

      <Dialog open={signupOpen} onOpenChange={(o) => !busy && setSignupOpen(o)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create your account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Sign up, sign the NDA, and continue to Stripe Checkout for your selected plan.
          </p>
          <form onSubmit={openNdaStep} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pricing-first">First name</Label>
                <Input id="pricing-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="pricing-last">Last name</Label>
                <Input id="pricing-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="pricing-email">Email</Label>
              <Input id="pricing-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="pricing-phone">Phone</Label>
              <Input id="pricing-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="pricing-password">Password</Label>
              <Input
                id="pricing-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={12}
                required
              />
            </div>
            <div>
              <Label htmlFor="pricing-confirm">Confirm password</Label>
              <Input
                id="pricing-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={12}
                required
              />
            </div>
            <Button type="submit" className="w-full grad-indigo" disabled={busy}>
              Continue to NDA
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={ndaOpen} onOpenChange={(o) => !busy && setNdaOpen(o)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> {NDA_TITLE}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[40vh] overflow-y-auto border rounded-md p-4 bg-background/40 text-sm leading-relaxed space-y-2">
            {NDA_BODY.map((p, i) =>
              p === "" ? <div key={i} className="h-2" /> : <p key={i}>{p}</p>,
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">Agreement version: {NDA_VERSION}</p>
          <div className="space-y-3">
            <div>
              <Label>Type your full legal name to sign</Label>
              <Input value={signatureName} onChange={(e) => setSignatureName(e.target.value)} />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={acceptNda} onCheckedChange={(v) => setAcceptNda(!!v)} />
              <span>I agree to the NDA and authorize electronic signature.</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNdaOpen(false)} disabled={busy}>
                Back
              </Button>
              <Button onClick={submitSignupAndCheckout} disabled={busy}>
                <FileSignature className="h-4 w-4 mr-1.5" />
                {busy ? "Processing…" : "Sign & pay with Stripe"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
