import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resolveSignInErrorMessage } from "@/lib/auth.functions";
import { useApp } from "@/lib/app-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { passwordRecoveryRedirectUrl } from "@/lib/auth-recovery";

type SignInFormProps = {
  embedded?: boolean;
  onRegisterClick?: () => void;
};

export function SignInForm({ embedded, onRegisterClick }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user } = useApp();
  const resolveSignInError = useServerFn(resolveSignInErrorMessage);

  useEffect(() => {
    if (busy && user) setBusy(false);
  }, [busy, user]);

  useEffect(() => {
    if (!busy) return;
    const timeout = window.setTimeout(() => setBusy(false), 15_000);
    return () => window.clearTimeout(timeout);
  }, [busy]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        try {
          const resolved = await resolveSignInError({
            email,
            error_message: error.message,
          });
          toast.error(
            resolved.message === "User is banned" ? "User Needs Admin Approval" : resolved.message,
          );
        } catch {
          toast.error(
            error.message === "User is banned" ? "User Needs Admin Approval" : error.message,
          );
        }
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email above first.");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: passwordRecoveryRedirectUrl(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("If that email exists, a reset link is on its way.");
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-3">
      <div>
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="relative">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
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
      <Button type="submit" disabled={busy} className="w-full grad-indigo h-11">
        <Lock className="h-4 w-4 mr-2" />
        Sign in
      </Button>
      <button
        type="button"
        onClick={handleForgot}
        disabled={busy}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 w-full text-center"
      >
        Forgot / Reset password?
      </button>
      {!embedded && onRegisterClick && (
        <p className="text-xs text-center text-muted-foreground pt-1">
          Need an account?{" "}
          <button
            type="button"
            onClick={onRegisterClick}
            className="underline font-medium text-primary"
          >
            Register here
          </button>
        </p>
      )}
    </form>
  );
}
