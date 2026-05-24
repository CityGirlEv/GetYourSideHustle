import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SecurityBanner } from "@/components/SecurityBanner";

export const Route = createFileRoute("/reset-password")({ component: ResetPasswordPage });

function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase places the recovery session in the URL hash and signs the user in.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) return toast.error("Password must be at least 12 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're now signed in.");
    router.navigate({ to: "/advisor" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl grad-indigo">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">Set a new password</h1>
            <p className="text-sm text-muted-foreground">Choose a strong password (12+ characters).</p>
          </div>
          <Card className="glass p-6">
            {!ready ? (
              <p className="text-sm text-muted-foreground text-center">
                Open this page from the reset link in your email. If the link expired, request a new one from the sign-in page.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><Label>New password</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={12} /></div>
                <div><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required minLength={12} /></div>
                <Button type="submit" disabled={busy} className="w-full grad-indigo h-11">Update password</Button>
              </form>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}