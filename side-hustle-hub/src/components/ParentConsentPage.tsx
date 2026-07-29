import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, ShieldCheck, ShieldAlert } from "lucide-react";
import { BusyOverlay, WaitIndicator, WaitLabel } from "./WaitFeedback";
import { PasswordField } from "./PasswordField";
import { SITE_NAME } from "../lib/site-config";
import {
  fetchConsent,
  submitParentConsent,
  type ConsentSignup,
} from "../lib/junior-signup";

type ParentConsentPageProps = {
  token: string;
  onClose: () => void;
};

export function ParentConsentPage({ token, onClose }: ParentConsentPageProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [signup, setSignup] = useState<ConsentSignup | null>(null);

  const [parentName, setParentName] = useState("");
  const [parentRelationship, setParentRelationship] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentAddress, setParentAddress] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentPasswordConfirm, setParentPasswordConfirm] = useState("");
  const [kidPassword, setKidPassword] = useState("");
  const [kidPasswordConfirm, setKidPasswordConfirm] = useState("");
  const [approved, setApproved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await fetchConsent(token);
        if (!cancelled) setSignup(data.signup);
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "This consent link is invalid.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleApprove = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    if (parentPassword || parentPasswordConfirm) {
      if (parentPassword !== parentPasswordConfirm) {
        setResult({ kind: "error", message: "Parent passwords do not match." });
        setSubmitting(false);
        return;
      }
    }
    if (!kidPassword.trim()) {
      setResult({ kind: "error", message: "Create a kid login password so they can sign in." });
      setSubmitting(false);
      return;
    }
    if (kidPassword !== kidPasswordConfirm) {
      setResult({ kind: "error", message: "Kid passwords do not match." });
      setSubmitting(false);
      return;
    }
    try {
      const res = await submitParentConsent(token, {
        decision: "approve",
        approved,
        parentName,
        parentRelationship,
        parentPhone,
        parentAddress,
        parentPassword: parentPassword || undefined,
        kidPassword,
      });
      setResult({ kind: "success", message: res.message });
      setSignup((prev) => (prev ? { ...prev, status: "active" } : prev));
    } catch (err) {
      setResult({ kind: "error", message: err instanceof Error ? err.message : "Could not submit consent." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await submitParentConsent(token, { decision: "decline" });
      setResult({ kind: "success", message: res.message });
      setSignup((prev) => (prev ? { ...prev, status: "declined" } : prev));
    } catch (err) {
      setResult({ kind: "error", message: err instanceof Error ? err.message : "Could not submit." });
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyResolved = signup && (signup.status === "active" || signup.status === "declined");

  return (
    <div className="consent-page">
      <BusyOverlay
        active={loading || submitting}
        message={loading ? "Loading request…" : "Submitting consent…"}
      />
      <div className="consent-card glass">
        <span className="flat-label flat-label--accent">{SITE_NAME} · Parental Consent</span>

        {loading && (
          <WaitIndicator className="consent-loading" message="Loading request…" style={{ marginTop: 0 }} />
        )}

        {!loading && loadError && (
          <>
            <h2>
              <ShieldAlert size={22} style={{ color: "var(--crimson)" }} /> Link not valid
            </h2>
            <p>{loadError}</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Go to {SITE_NAME}
            </button>
          </>
        )}

        {!loading && !loadError && signup && (
          <>
            <h2>
              <ShieldCheck size={22} style={{ color: "var(--accent-emerald)" }} /> Parental permission
            </h2>
            <p className="consent-intro">
              <strong>{signup.childName}</strong> asked to join the <strong>{signup.teamLabel}</strong> on{" "}
              {SITE_NAME}. Parental consent is required through age 12 — please approve and complete
              registration before the Kids account is activated.
            </p>

            <div className="consent-safety">
              <ShieldAlert size={18} />
              <span>
                We never ask children for their address or phone number. That information is collected
                only from you, the parent/guardian, below. Children are always reminded never to share
                personal details online.
              </span>
            </div>

            {result && (
              <div className={`consent-alert is-${result.kind}`}>{result.message}</div>
            )}

            {signup.status === "active" && (
              <div className="consent-status-done">
                <BadgeCheck size={20} /> This account is active. Thank you!
              </div>
            )}
            {signup.status === "declined" && (
              <div className="consent-status-declined">
                This request was declined. The account will not be activated.
              </div>
            )}

            {!alreadyResolved && (
              <form className="consent-form" onSubmit={(e) => void handleApprove(e)}>
                <div className="form-group">
                  <label className="form-label">Parent / guardian full name</label>
                  <input className="text-input" required value={parentName} onChange={(e) => setParentName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship to child</label>
                  <input
                    className="text-input"
                    placeholder="Parent, guardian, grandparent…"
                    value={parentRelationship}
                    onChange={(e) => setParentRelationship(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact phone</label>
                  <input className="text-input" required value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mailing address (optional)</label>
                  <textarea
                    className="text-input"
                    rows={2}
                    value={parentAddress}
                    onChange={(e) => setParentAddress(e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div className="consent-account-block" data-testid="consent-parent-login">
                  <p className="consent-account-lead">
                    Parent login for <strong>{signup.parentEmail}</strong>. If you do not already have a
                    GYSH account, create a password below so this kid profile links to you.
                  </p>
                  <PasswordField
                    label="Parent password (required if you are new)"
                    autoComplete="new-password"
                    value={parentPassword}
                    onChange={setParentPassword}
                    showStrength
                    data-testid="consent-parent-password"
                  />
                  <PasswordField
                    label="Confirm parent password"
                    autoComplete="new-password"
                    value={parentPasswordConfirm}
                    onChange={setParentPasswordConfirm}
                    data-testid="consent-parent-password-confirm"
                  />
                  <PasswordField
                    label={`Kid login password (required — ${signup.childName} signs in with this)`}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={kidPassword}
                    onChange={setKidPassword}
                    placeholder="At least 8 characters"
                    showStrength
                    data-testid="consent-kid-password"
                  />
                  <PasswordField
                    label="Confirm kid login password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={kidPasswordConfirm}
                    onChange={setKidPasswordConfirm}
                    data-testid="consent-kid-password-confirm"
                  />
                  <p className="consent-account-lead" style={{ marginTop: 6 }}>
                    Login email: <strong>{signup.childEmail}</strong>. We&apos;ll email both of you
                    when {signup.childName} can sign in.
                  </p>
                </div>
                <label className="consent-check">
                  <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
                  <span>
                    I am {signup.childName}&apos;s parent or legal guardian and I grant permission for them
                    to join the {signup.teamLabel}.
                  </span>
                </label>
                <div className="consent-actions">
                  <button type="button" className="btn btn-outline" disabled={submitting} onClick={() => void handleDecline()}>
                    Decline
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || !approved}>
                    {submitting ? <WaitLabel>Submitting…</WaitLabel> : "Grant permission & activate"}
                  </button>
                </div>
              </form>
            )}

            {alreadyResolved && (
              <button type="button" className="btn btn-primary" onClick={onClose} style={{ marginTop: 12 }}>
                Go to {SITE_NAME}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
