import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { hasRecoveryTokensInUrl } from "@/lib/auth-recovery";
import { RecoveryDeviceSetup } from "@/components/auth/RecoveryDeviceSetup";
import {
  confirmPasswordSet,
  getPasswordRecoverySetupStatus,
} from "@/lib/password-recovery.functions";
import { roleDestination } from "@/lib/role-destination";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Part B Optimizer" },
      {
        name: "description",
        content: "Reset the password for your Part B Optimizer staff account.",
      },
      { property: "og:title", content: "Reset Password — Part B Optimizer" },
      {
        property: "og:description",
        content: "Reset your Part B Optimizer staff account password.",
      },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/reset-password" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://themedicareoptimizer.lovable.app/reset-password" }],
  }),
  component: ResetPasswordPage,
});

type SetupPhase = "loading" | "devices" | "password";

function ResetPasswordPage() {
  const router = useRouter();
  const fetchSetupStatus = useServerFn(getPasswordRecoverySetupStatus);
  const markPasswordConfirmedFn = useServerFn(confirmPasswordSet);

  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<SetupPhase>("loading");
  const [initialDevices, setInitialDevices] = useState<string[]>([]);
  const [postLoginRole, setPostLoginRole] = useState<string>("advisor");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && hasRecoveryTokensInUrl()) {
      setReady(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        return;
      }
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        setReady(true);
      }
    });

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) setReady(true);
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
    })();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await fetchSetupStatus();
        if (cancelled) return;
        setInitialDevices(status.qa_devices ?? []);
        setPostLoginRole(status.is_qa ? "qa" : "advisor");
        setPhase(status.needs_device_prefs ? "devices" : "password");
      } catch {
        if (!cancelled) setPhase("password");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, fetchSetupStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) return toast.error("Password must be at least 12 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    try {
      await markPasswordConfirmedFn();
    } catch {
      /* best-effort — password was still updated in auth */
    }
    setBusy(false);
    toast.success("Password updated. You're now signed in.");
    const destination = postLoginRole === "qa" ? "/testing" : roleDestination(postLoginRole);
    router.navigate({ to: destination as "/" | "/testing" | "/advisor" | "/agent" | "/admin" });
  };

  if (ready && phase === "devices") {
    return (
      <AppShell title="" subtitle="">
        <RecoveryDeviceSetup
          initialDevices={initialDevices}
          onComplete={() => setPhase("password")}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="" subtitle="">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl grad-indigo">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">Set a new password</h1>
            <p className="text-sm text-muted-foreground">
              Choose a strong password (12+ characters).
            </p>
          </div>
          <Card className="glass p-6">
            {!ready || phase === "loading" ? (
              <p className="text-sm text-muted-foreground text-center">
                Open this page from the reset link in your email. If the link expired, request a new
                one from the sign-in page.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Label>New password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={12}
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
                </div>
                <div className="relative">
                  <Label>Confirm password</Label>
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={12}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="submit" disabled={busy} className="w-full grad-indigo h-11">
                  Update password
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
