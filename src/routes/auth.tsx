import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/app-store";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { roleDestination } from "@/lib/role-destination";
import { safeSignInRedirect } from "@/lib/auth-redirect";
import { SignInForm } from "@/components/auth/SignInForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export type AuthTab = "sign-in" | "register";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => {
    const tab =
      search.tab === "register"
        ? ("register" as const)
        : search.tab === "sign-in"
          ? ("sign-in" as const)
          : undefined;
    const redirect = search.redirect
      ? safeSignInRedirect(search.redirect, undefined)
      : undefined;
    return {
      ...(redirect ? { redirect } : {}),
      ...(tab ? { tab } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Sign In — The Medicare Optimizer" },
      {
        name: "description",
        content: "Sign in or register for the Medicare Optimizer staff portal.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://themedicareoptimizer.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useApp();
  const router = useRouter();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const tab = search.tab ?? "sign-in";

  useEffect(() => {
    if (!user) return;
    const qaOverride = user.roles?.includes("qa") ? "/testing" : null;
    const destination = search.redirect ?? qaOverride ?? roleDestination(user.role);
    router.navigate({ to: destination as "/admin" | "/agent" | "/testing" | "/advisor" | "/tasks" });
  }, [user, router, search.redirect]);

  const setTab = (next: AuthTab) => {
    navigate({ search: (prev) => ({ ...prev, tab: next }) });
  };

  return (
    <AppShell title="" subtitle="">
      <div className="flex-1 flex items-start justify-center px-4 py-10 sm:py-12">
        <div className="w-full max-w-xl space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl grad-indigo">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              {tab === "register" ? "Request Beta Access" : "Sign In"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tab === "register"
                ? "Tell us who you are. After you sign the NDA, an administrator will review and enable your account."
                : "Sign in to the Medicare Optimizer staff portal."}
            </p>
          </div>

          <Card className="glass p-6">
            <Tabs value={tab} onValueChange={(value) => setTab(value as AuthTab)} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 h-10">
                <TabsTrigger value="sign-in" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sign-in" className="mt-0">
                <SignInForm embedded onRegisterClick={() => setTab("register")} />
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <RegisterForm embedded onSignInClick={() => setTab("sign-in")} />
                <p className="text-[11px] text-center text-muted-foreground mt-4">
                  Agent and QA accounts require NDA &amp; admin approval.
                </p>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
