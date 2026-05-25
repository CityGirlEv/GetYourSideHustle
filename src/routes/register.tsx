import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, FileSignature, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { NDA_BODY, NDA_TITLE, NDA_VERSION } from "@/lib/nda";
import { registerWithNda } from "@/lib/registration.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — The Medicare Optimizer" },
      { name: "description", content: "Request beta access. Sign the NDA and we'll review your account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const doRegister = useServerFn(registerWithNda);

  const [step, setStep] = useState<"form" | "nda" | "done">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);

  const goToNda = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) return toast.error("Enter your full name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Enter a valid email.");
    if (password.length < 12) return toast.error("Password must be at least 12 characters.");
    setSignatureName(fullName.trim());
    setStep("nda");
  };

  const submit = async () => {
    if (signatureName.trim().length < 3) return toast.error("Type your full legal name to sign.");
    if (!accept) return toast.error("Check the box to agree to the NDA.");
    setBusy(true);
    try {
      await doRegister({
        data: {
          email,
          password,
          full_name: fullName.trim(),
          signature_name: signatureName.trim(),
          accept_nda: true,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      });
      setStep("done");
    } catch (e) {
      toast.error((e as Error)?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="" subtitle="">
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl grad-indigo">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">Request beta access</h1>
            <p className="text-sm text-muted-foreground">
              Step {step === "form" ? "1" : step === "nda" ? "2" : "3"} of 3 ·{" "}
              {step === "form" ? "Account details" : step === "nda" ? "Sign the NDA" : "Pending approval"}
            </p>
          </div>

          {step === "form" && (
            <Card className="glass p-6">
              <form onSubmit={goToNda} className="space-y-3">
                <div><Label>Full name</Label><Input value={fullName} onChange={(e)=>setFullName(e.target.value)} required /></div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                <div className="relative">
                  <Label>Password (min 12 chars)</Label>
                  <Input type={showPw ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={12} className="pr-10" />
                  <button type="button" tabIndex={-1} onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="submit" className="w-full grad-indigo h-11">Continue to NDA</Button>
                <p className="text-xs text-center text-muted-foreground">
                  Already have an account? <Link to="/auth" className="underline">Sign in</Link>
                </p>
              </form>
            </Card>
          )}

          {step === "nda" && (
            <div className="space-y-4">
              <Card className="glass p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-bold">{NDA_TITLE}</h2>
                </div>
                <div className="max-h-[360px] overflow-y-auto border rounded-md p-4 bg-background/40 text-sm leading-relaxed space-y-2">
                  {NDA_BODY.map((p, i) => p === "" ? <div key={i} className="h-2" /> : <p key={i}>{p}</p>)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">Agreement version: {NDA_VERSION}</p>
              </Card>
              <Card className="glass p-6 space-y-4">
                <div>
                  <Label>Type your full legal name to sign</Label>
                  <Input value={signatureName} onChange={(e)=>setSignatureName(e.target.value)} placeholder="Jane A. Doe" />
                </div>
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} />
                  <span>I have read the NDA above and agree to its terms. I understand that typing my name and clicking "Sign &amp; submit" constitutes my legal electronic signature under the U.S. E-SIGN Act.</span>
                </label>
                <div className="flex gap-2">
                  <Button onClick={submit} disabled={busy}>
                    <FileSignature className="h-4 w-4 mr-1.5" />
                    {busy ? "Submitting…" : "Sign & submit"}
                  </Button>
                  <Button variant="outline" onClick={() => setStep("form")} disabled={busy}>Back</Button>
                </div>
              </Card>
            </div>
          )}

          {step === "done" && (
            <Card className="glass p-6 space-y-3 text-center">
              <div className="inline-flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald/15 text-emerald">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-display text-lg font-bold">Registration submitted</h2>
              <p className="text-sm text-muted-foreground">
                Your NDA has been signed and your account has been created. An administrator will review and enable your account shortly. You'll be able to sign in once it's approved.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => router.navigate({ to: "/" })}>Return home</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}