import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

type State =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "already" }
  | { status: "invalid"; message: string }
  | { status: "confirming" }
  | { status: "done" }
  | { status: "error"; message: string };

export const Route = createFileRoute("/email-unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Unsubscribe — The Medicare Optimizer" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = useSearch({ from: "/email-unsubscribe" });
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setState({ status: "invalid", message: "Missing unsubscribe token." });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "invalid", message: data?.error ?? "Invalid or expired link." });
          return;
        }
        if (data?.valid === false && data?.reason === "already_unsubscribed") {
          setState({ status: "already" });
          return;
        }
        if (data?.valid) {
          setState({ status: "ready" });
          return;
        }
        setState({ status: "invalid", message: "Invalid or expired link." });
      } catch {
        if (!cancelled) setState({ status: "invalid", message: "Network error." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const confirm = async () => {
    setState({ status: "confirming" });
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", message: data?.error ?? "Could not unsubscribe." });
        return;
      }
      if (data?.success || data?.reason === "already_unsubscribed") {
        setState({ status: "done" });
      } else {
        setState({ status: "error", message: "Could not unsubscribe." });
      }
    } catch {
      setState({ status: "error", message: "Network error." });
    }
  };

  return (
    <AppShell title="" subtitle="">
      <div className="flex-1 flex items-start justify-center px-4 py-16">
        <Card className="glass p-8 max-w-md w-full text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Email preferences</h1>
          {state.status === "loading" && (
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking your link…
            </p>
          )}
          {state.status === "ready" && (
            <>
              <p className="text-sm text-muted-foreground">
                Click below to unsubscribe from these emails.
              </p>
              <Button onClick={confirm} className="grad-indigo w-full">Confirm unsubscribe</Button>
            </>
          )}
          {state.status === "confirming" && (
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Unsubscribing…
            </p>
          )}
          {state.status === "done" && (
            <p className="text-sm text-emerald-600 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> You've been unsubscribed.
            </p>
          )}
          {state.status === "already" && (
            <p className="text-sm text-muted-foreground">You're already unsubscribed.</p>
          )}
          {(state.status === "invalid" || state.status === "error") && (
            <p className="text-sm text-destructive flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {state.message}
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
