import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Lock, Eye, EyeOff, Headset, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — The Medicare Optimizer" },
      { name: "description", content: "Sign in to the Medicare Optimizer staff portal for advisors, agents, QA, and admins." },
      { property: "og:title", content: "Sign In — The Medicare Optimizer" },
      { property: "og:description", content: "Sign in to the Medicare Optimizer staff portal." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "canonical", href: "https://themedicareoptimizer.lovable.app/auth" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"agent" | "qa" | "">("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const dest =
      user.role === "admin" ? "/admin" :
      user.role === "agent" ? "/agent" :
      "/advisor"; // advisor, editor, qa, viewer all land on the advisor workbench
    router.navigate({ to: dest });
  }, [user, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) return toast.error("Select an account type.");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, requested_role: accountType }, emailRedirectTo: window.location.origin + "/auth" },
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

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email above first.");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("If that email exists, a reset link is on its way.");
  };

  return (
    <AppShell title="" subtitle="">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl grad-indigo">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">Sign In</h1>
            <p className="text-sm text-muted-foreground">If you don't have an account, click Register Below</p>
          </div>

          <Card className="glass p-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-3 mt-4">
                  <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                  <div className="relative">
                    <Label>Password</Label>
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} required className="pr-10" />
                    <button type="button" tabIndex={-1} onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="submit" disabled={busy} className="w-full grad-indigo h-11"><Lock className="h-4 w-4 mr-2" />Sign in</Button>
                  <button type="button" onClick={handleForgot} disabled={busy} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 w-full text-center">
                    Forgot password?
                  </button>
                  <div className="text-xs text-center text-muted-foreground pt-1">
                    <Link to="/register" className="underline underline-offset-2 hover:text-foreground">Register Below</Link>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3 mt-4">
                  <div><Label>Full name</Label><Input value={fullName} onChange={(e)=>setFullName(e.target.value)} required /></div>
                  <div><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
                  <div className="relative">
                    <Label>Password (min 12 chars)</Label>
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={12} className="pr-10" />
                    <button type="button" tabIndex={-1} onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="submit" disabled={busy} className="w-full grad-indigo h-11">Create account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
