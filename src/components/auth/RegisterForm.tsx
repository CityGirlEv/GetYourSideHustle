import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck,
  FileSignature,
  CheckCircle2,
  FlaskConical,
  Headset,
  Eye,
  EyeOff,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { NDA_BODY, NDA_TITLE, NDA_VERSION } from "@/lib/nda";
import { registerWithNda } from "@/lib/registration.functions";

type RegisterFormProps = {
  embedded?: boolean;
  onSignInClick?: () => void;
};

export function RegisterForm({ embedded, onSignInClick }: RegisterFormProps) {
  const router = useRouter();
  const doRegister = useServerFn(registerWithNda);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestedRole, setRequestedRole] = useState<"qa" | "agent" | "">("");
  const [qaDevices, setQaDevices] = useState<string[]>([]);
  const [qaDeviceOther, setQaDeviceOther] = useState("");
  const [ndaOpen, setNdaOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [roleAdded, setRoleAdded] = useState(false);
  const [accountDisabled, setAccountDisabled] = useState(true);
  const [signatureName, setSignatureName] = useState("");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);

  const openNda = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim().length < 1) return toast.error("Enter your first name.");
    if (lastName.trim().length < 1) return toast.error("Enter your last name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Enter a valid email.");
    if (phone.replace(/\D/g, "").length < 7) return toast.error("Enter a valid phone number.");
    if (!password) return toast.error("Enter a password.");
    if (!confirmPassword) return toast.error("Confirm your password.");
    if (password.length < 12) return toast.error("Password must be at least 12 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    if (requestedRole !== "qa" && requestedRole !== "agent")
      return toast.error("Pick the role you're registering for.");
    if (requestedRole === "qa") {
      const extras = qaDeviceOther
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (qaDevices.length === 0 && extras.length === 0) {
        return toast.error("Select at least one device you can test on.");
      }
    }
    setSignatureName(`${firstName.trim()} ${lastName.trim()}`);
    setAccept(false);
    setNdaOpen(true);
  };

  const submit = async () => {
    if (signatureName.trim().length < 3) return toast.error("Type your full legal name to sign.");
    if (!accept) return toast.error("Check the box to agree to the NDA.");
    setBusy(true);
    try {
      const extras = qaDeviceOther
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const devices =
        requestedRole === "qa" ? Array.from(new Set([...qaDevices, ...extras])) : undefined;
      const result = await doRegister({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          signature_name: signatureName.trim(),
          accept_nda: true,
          requested_role: requestedRole as "qa" | "agent",
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          qa_devices: devices,
          password,
          password_confirm: confirmPassword,
        },
      });
      setRoleAdded(!!result?.role_added);
      setAccountDisabled(result?.account_disabled ?? true);
      setNdaOpen(false);
      setDone(true);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Dialog
        open={done}
        onOpenChange={(o) => {
          if (!o) router.navigate({ to: "/" });
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald" />
              Registration submitted — next steps
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              Thanks, <b>{firstName}</b>!
              {roleAdded ? (
                <>
                  {" "}
                  Your NDA is signed and the <b>
                    {requestedRole === "qa" ? "QA tester" : "agent"}
                  </b>{" "}
                  role has been added to your account.
                </>
              ) : (
                <> Your NDA is signed and your account has been created.</>
              )}
            </p>
            {accountDisabled ? (
              <div className="rounded-md border border-amber/40 bg-amber/10 p-3">
                <p className="font-semibold mb-1">Your account is under review.</p>
                <p className="text-muted-foreground">
                  It is <b>disabled</b> until an administrator approves it. You will <b>not</b> be
                  able to sign in yet.
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-emerald/40 bg-emerald/10 p-3">
                <p className="font-semibold mb-1">Your account is active.</p>
                <p className="text-muted-foreground">
                  Sign in with your existing email and password to use your new{" "}
                  {requestedRole === "qa" ? "QA tester" : "agent"} access.
                </p>
              </div>
            )}
            <div>
              <p className="font-semibold mb-1">What happens next</p>
              <ol className="list-decimal ml-5 space-y-1 text-muted-foreground">
                {accountDisabled ? (
                  <>
                    <li>An admin reviews your request (typically within 1 business day).</li>
                    <li>
                      Once approved, you&apos;ll receive an <b>email at {email}</b> letting you know
                      your account is active.
                    </li>
                  </>
                ) : null}
                <li>Return to the sign-in tab and log in with your email and password.</li>
                {requestedRole === "qa" && (
                  <li>
                    After logging in, you&apos;ll land on the Testing Portal. Open the{" "}
                    <b>QA Manual</b> link at the top.
                  </li>
                )}
              </ol>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => router.navigate({ to: "/" })}>
              Return home
            </Button>
            <Button onClick={onSignInClick} className="grad-indigo">
              Go to sign-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <form onSubmit={openNda} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="register-first-name">First name</Label>
            <Input
              id="register-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>
          <div>
            <Label htmlFor="register-last-name">Last name</Label>
            <Input
              id="register-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="register-phone">Phone</Label>
          <Input
            id="register-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            placeholder="(555) 555-1234"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Message and data rates may apply depending on your carrier.
          </p>
        </div>
        <div className="relative">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <p className="text-[11px] text-muted-foreground mt-1">
            Required — at least 12 characters.
          </p>
        </div>
        <div className="relative">
          <Label htmlFor="register-confirm-password">Confirm password</Label>
          <Input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={12}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="space-y-2">
          <Label>I&apos;m registering as</Label>
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
          <p className="text-[11px] text-muted-foreground">
            An administrator will review and enable your account. Already registered as QA or Agent?
            Use the same email here to add another role — your existing password stays the same.
          </p>
        </div>
        {requestedRole === "qa" && (
          <div className="space-y-2 rounded-md border border-border p-3 bg-muted/20">
            <Label>Which devices can you test on?</Label>
            <p className="text-[11px] text-muted-foreground">
              Select all that apply — we use this to assign scenarios that match your hardware.
            </p>
            <div className="space-y-3 pt-1">
              <div>
                <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
                  Computer
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["MacBook", "iMac", "Windows desktop", "Windows laptop", "Linux"].map((d) => {
                    const active = qaDevices.includes(d);
                    return (
                      <label
                        key={d}
                        className={`flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer transition ${active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"}`}
                      >
                        <Checkbox
                          checked={active}
                          onCheckedChange={(v) =>
                            setQaDevices((prev) =>
                              v ? Array.from(new Set([...prev, d])) : prev.filter((x) => x !== d),
                            )
                          }
                        />
                        <span>{d}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
                  Mobile device
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["iPhone", "iPad", "Android phone", "Android tablet"].map((d) => {
                    const active = qaDevices.includes(d);
                    return (
                      <label
                        key={d}
                        className={`flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer transition ${active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"}`}
                      >
                        <Checkbox
                          checked={active}
                          onCheckedChange={(v) =>
                            setQaDevices((prev) =>
                              v ? Array.from(new Set([...prev, d])) : prev.filter((x) => x !== d),
                            )
                          }
                        />
                        <span>{d}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="text-xs">Other (comma-separated)</Label>
                <Input
                  value={qaDeviceOther}
                  onChange={(e) => setQaDeviceOther(e.target.value)}
                  placeholder="e.g. Chromebook, Kindle Fire"
                />
              </div>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full grad-indigo h-11">
          Continue to NDA
        </Button>
        {!embedded && onSignInClick && (
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSignInClick}
              className="underline font-medium text-primary"
            >
              Sign in
            </button>
          </p>
        )}
      </form>

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
          <div className="space-y-3 pt-2 sticky bottom-0 bg-background pb-1">
            <div>
              <Label>Type your full legal name to sign</Label>
              <Input
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Jane A. Doe"
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} />
              <span>
                I have read the NDA above and agree to its terms. I understand that typing my name
                and clicking &quot;Sign &amp; submit&quot; constitutes my legal electronic signature
                under the U.S. E-SIGN Act.
              </span>
            </label>
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setNdaOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={busy}>
                <FileSignature className="h-4 w-4 mr-1.5" />
                {busy ? "Submitting…" : "Sign & submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
