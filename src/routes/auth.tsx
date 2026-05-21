import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, KeyRound, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SecurityBanner } from "@/components/SecurityBanner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, lockState, setupPassphrase, unlock } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [passphrase2, setPassphrase2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (lockState === "unlocked" && user) router.navigate({ to: `/${user.role}` });
  }, [lockState, user, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + "/auth" },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to verify, then sign in.");
    setTab("signin");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase !== passphrase2) return toast.error("Passphrases do not match");
    if (passphrase.length < 12) return toast.error("Passphrase must be at least 12 characters");
    setBusy(true);
    try {
      await setupPassphrase(passphrase);
      toast.success("Encryption key created. Vault unlocked.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await unlock(passphrase);
    setBusy(false);
    if (!ok) toast.error("Incorrect passphrase");
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
            <h1 className="font-display text-2xl font-bold">Secure advisor sign in</h1>
            <p className="text-sm text-muted-foreground">All PHI is encrypted on this device before it leaves your browser.</p>
          </div>

          {lockState === "needs-setup" ? (
            <Card className="glass p-6 space-y-4">
              <div className="flex items-start gap-3">
                <KeyRound className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h2 className="font-semibold">Create your encryption passphrase</h2>
                  <p className="text-xs text-muted-foreground mt-1">This passphrase protects every piece of client PHI. <strong>It is never sent to our servers.</strong> If you lose it, the encrypted data cannot be recovered — by anyone, including us.</p>
                </div>
              </div>
              <form onSubmit={handleSetup} className="space-y-3">
                <div><Label>Passphrase (min 12 chars)</Label><Input type="password" value={passphrase} onChange={(e)=>setPassphrase(e.target.value)} required minLength={12} /></div>
                <div><Label>Confirm</Label><Input type="password" value={passphrase2} onChange={(e)=>setPassphrase2(e.target.value)} required /></div>
                <Button type="submit" disabled={busy} className="w-full grad-indigo">Create &amp; unlock vault</Button>
              </form>
              <div className="text-xs text-muted-foreground flex gap-2 bg-warning/10 border border-warning/30 rounded-md p-3">
                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" /> Write this down somewhere safe. There is no reset.
              </div>
            </Card>
          ) : lockState === "locked" ? (
            <Card className="glass p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h2 className="font-semibold">Unlock encrypted vault</h2>
                  <p className="text-xs text-muted-foreground mt-1">Enter your passphrase to decrypt client PHI locally.</p>
                </div>
              </div>
              <form onSubmit={handleUnlock} className="space-y-3">
                <Input type="password" placeholder="Passphrase" value={passphrase} onChange={(e)=>setPassphrase(e.target.value)} required autoFocus />
                <Button type="submit" disabled={busy} className="w-full grad-indigo">Unlock</Button>
              </form>
            </Card>
          ) : (
            <Card className="glass p-6">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-3 mt-4">
                    <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                    <div><Label>Password</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
                    <Button type="submit" disabled={busy} className="w-full grad-indigo h-11"><Lock className="h-4 w-4 mr-2" />Sign in</Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-3 mt-4">
                    <div><Label>Full name</Label><Input value={fullName} onChange={(e)=>setFullName(e.target.value)} required /></div>
                    <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                    <div><Label>Password (min 12 chars)</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={12} /></div>
                    <Button type="submit" disabled={busy} className="w-full grad-indigo h-11">Create account</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
