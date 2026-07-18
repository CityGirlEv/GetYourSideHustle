import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type SignInFormProps = {
  embedded?: boolean;
  onRegisterClick?: () => void;
};

export default function SignInForm({ embedded, onRegisterClick }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { user } = useApp();

  useEffect(() => {
    if (busy && user) setBusy(false);
  }, [busy, user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        setBusy(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Enter your email above first.");
      return;
    }
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/ELTL/reset-password',
      });
      setBusy(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("If that email exists, a reset link is on its way.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setBusy(false);
    }
  };

  return (
    <div className="glass" style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Sign In</h2>
      
      {errorMsg && (
        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
        <div>
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" disabled={busy}>
          Sign in
        </Button>
        <button
          type="button"
          onClick={handleForgot}
          disabled={busy}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            textDecoration: 'underline',
            fontSize: '0.75rem',
            cursor: 'pointer',
            textAlign: 'center',
            marginTop: '0.5rem'
          }}
        >
          Forgot / Reset password?
        </button>
        {!embedded && onRegisterClick && (
          <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
            Need an account?{" "}
            <button
              type="button"
              onClick={onRegisterClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Register here
            </button>
          </p>
        )}
      </form>
    </div>
  );
}
