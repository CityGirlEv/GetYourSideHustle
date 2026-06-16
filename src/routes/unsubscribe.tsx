import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const [status, setStatus] = React.useState<
    "loading" | "ready" | "already" | "invalid" | "submitting" | "done" | "error"
  >("loading");
  const [email, setEmail] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const token = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("token");
  }, []);

  React.useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          setStatus("invalid");
          setError(body?.error ?? "Invalid or expired link.");
          return;
        }
        if (body?.alreadyUnsubscribed) {
          setEmail(body?.email ?? null);
          setStatus("already");
        } else {
          setEmail(body?.email ?? null);
          setStatus("ready");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setStatus("submitting");
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!r.ok) throw new Error("Request failed");
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-3">Unsubscribe</h1>
        {status === "loading" && <p className="text-muted-foreground">Checking your link…</p>}
        {status === "ready" && (
          <>
            <p className="text-muted-foreground mb-6">
              Unsubscribe {email ? <strong>{email}</strong> : "this address"} from The Medicare
              Optimizer emails?
            </p>
            <button
              onClick={confirm}
              className="px-5 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Confirm unsubscribe
            </button>
          </>
        )}
        {status === "submitting" && <p className="text-muted-foreground">Unsubscribing…</p>}
        {status === "done" && (
          <p className="text-foreground">
            You've been unsubscribed
            {email ? (
              <>
                {" "}
                (<strong>{email}</strong>)
              </>
            ) : (
              ""
            )}
            . You will no longer receive these emails.
          </p>
        )}
        {status === "already" && (
          <p className="text-foreground">
            {email ? (
              <>
                <strong>{email}</strong> is already unsubscribed.
              </>
            ) : (
              "This address is already unsubscribed."
            )}
          </p>
        )}
        {status === "invalid" && (
          <p className="text-destructive">
            {error ?? "This unsubscribe link is invalid or has expired."}
          </p>
        )}
        {status === "error" && <p className="text-destructive">{error}</p>}
      </div>
    </div>
  );
}
