import { useEffect, useState } from "react";
import { Copy, Link2 } from "lucide-react";
import { buildReferralUrl, getOrCreateReferralCode } from "../lib/referral";
import { inviteFriendCredits, inviteFriendSteps } from "../lib/invite-friend";

type InviteFriendCardProps = {
  isLoggedIn: boolean;
  testId?: string;
  onJoin?: () => void;
  onLogin?: () => void;
  onOpenDashboard?: () => void;
};

export function InviteFriendCard({
  isLoggedIn,
  testId = "invite-friend-card",
  onJoin,
  onLogin,
  onOpenDashboard,
}: InviteFriendCardProps) {
  const [code, setCode] = useState("");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const credits = inviteFriendCredits();
  const steps = inviteFriendSteps(isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      setCode("");
      setUrl("");
      return;
    }
    const next = getOrCreateReferralCode();
    setCode(next);
    setUrl(buildReferralUrl(next));
  }, [isLoggedIn]);

  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="invite-friend-card" data-testid={testId}>
      <ol className="invite-friend-steps">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {isLoggedIn ? (
        <>
          <div className="user-portal-header-referral-label">
            <Link2 size={16} aria-hidden />
            <span>
              Invite link · <strong>{code || "…"}</strong>
            </span>
          </div>
          <p className="user-portal-header-referral-hint">
            Share for <strong>+{credits} credits</strong>
          </p>
          <div className="user-portal-referral-row">
            <input
              className="flat-input"
              readOnly
              value={url}
              data-testid={`${testId}-link`}
              aria-label="Your invite link"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void copyLink()}
              data-testid={`${testId}-copy`}
            >
              <Copy size={16} aria-hidden /> {copied ? "Copied" : "Copy invite link"}
            </button>
          </div>
          {onOpenDashboard && (
            <div className="manual-actions invite-friend-actions">
              <button type="button" className="btn btn-outline" onClick={onOpenDashboard}>
                Open My Dashboard
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="manual-actions invite-friend-actions">
          {onJoin && (
            <button type="button" className="btn btn-primary" onClick={onJoin}>
              Join free to invite a friend
            </button>
          )}
          {onLogin && (
            <button type="button" className="btn btn-outline" onClick={onLogin}>
              Log in
            </button>
          )}
        </div>
      )}
    </div>
  );
}
