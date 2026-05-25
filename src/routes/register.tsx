import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, FileSignature, CheckCircle2, FlaskConical, Headset } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { NDA_BODY, NDA_TITLE, NDA_VERSION } from "@/lib/nda";
import { registerWithNda } from "@/lib/registration.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — The Medicare Optimizer" },
      { name: "description", content: "Request Beta Access. Sign the NDA and we'll review your account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const doRegister = useServerFn(registerWithNda);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestedRole, setRequestedRole] = useState<"qa" | "agent" | "">("");
  const [ndaOpen, setNdaOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);

  const openNda = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim().length < 1) return toast.error("Enter your first name.");
    if (lastName.trim().length < 1) return toast.error("Enter your last name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Enter a valid email.");
    if (phone.replace(/\D/g, "").length < 7) return toast.error("Enter a valid phone number.");
    if (requestedRole !== "qa" && requestedRole !== "agent") return toast.error("Pick the role you're registering for.");
    setSignatureName(`${firstName.trim()} ${lastName.trim()}`);
    setAccept(false);
    setNdaOpen(true);
  };

  const submit = async () => {
    if (signatureName.trim().length < 3) return toast.error("Type your full legal name to sign.");
    if (!accept) return toast.error("Check the box to agree to the NDA.");
    setBusy(true);
    try {
      await doRegister({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          signature_name: signatureName.trim(),
          accept_nda: true,
          requested_role: requestedRole as "qa" | "agent",
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      });
      setNdaOpen(false);
      setDone(true);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="" subtitle="">
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl grad-indigo">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">Request Beta Access</h1>
            <p className="text-sm text-muted-foreground">
              Tell us who you are. After you sign the NDA, an administrator will review and enable your account.
            </p>
          </div>

          {!done && (
            <Card className="glass p-6">
              <form onSubmit={openNda} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First name</Label><Input value={firstName} onChange={(e)=>setFirstName(e.target.value)} required autoComplete="given-name" /></div>
                  <div><Label>Last name</Label><Input value={lastName} onChange={(e)=>setLastName(e.target.value)} required autoComplete="family-name" /></div>
                </div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" /></div>
                <div><Label>Phone</Label><Input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} required autoComplete="tel" placeholder="(555) 555-1234" /></div>
                <div className="space-y-2">
                  <Label>I'm registering as</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRequestedRole("agent")}
                      className={`flex items-center gap-2 rounded-md border p-3 text-sm transition ${requestedRole === "agent" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-muted/40"}`}
                    >
                      <Headset className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Agent</div>
                        <div className="text-[11px] text-muted-foreground">Licensed insurance agent</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestedRole("qa")}
                      className={`flex items-center gap-2 rounded-md border p-3 text-sm transition ${requestedRole === "qa" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-muted/40"}`}
                    >
                      <FlaskConical className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">QA Tester</div>
                        <div className="text-[11px] text-muted-foreground">Beta testing & feedback</div>
                      </div>
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">An administrator will review and enable your account.</p>
                </div>
                <Button type="submit" className="w-full grad-indigo h-11">Submit</Button>
                <p className="text-xs text-center text-muted-foreground">
                  Already have an account? <Link to="/auth" className="underline">Sign in</Link>
                </p>
              </form>
            </Card>
          )}

          {done && (
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

      <Dialog open={ndaOpen} onOpenChange={(o) => !busy && setNdaOpen(o)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> {NDA_TITLE}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto border rounded-md p-4 bg-background/40 text-sm leading-relaxed space-y-2">
            {NDA_BODY.map((p, i) => p === "" ? <div key={i} className="h-2" /> : <p key={i}>{p}</p>)}
          </div>
          <p className="text-[11px] text-muted-foreground">Agreement version: {NDA_VERSION}</p>
          <div className="space-y-3 pt-2">
            <div>
              <Label>Type your full legal name to sign</Label>
              <Input value={signatureName} onChange={(e)=>setSignatureName(e.target.value)} placeholder="Jane A. Doe" />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} />
              <span>I have read the NDA above and agree to its terms. I understand that typing my name and clicking "Sign &amp; submit" constitutes my legal electronic signature under the U.S. E-SIGN Act.</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNdaOpen(false)} disabled={busy}>Cancel</Button>
              <Button onClick={submit} disabled={busy}>
                <FileSignature className="h-4 w-4 mr-1.5" />
                {busy ? "Submitting…" : "Sign & submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}