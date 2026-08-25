import { useEffect, useState } from "react";
import { Lock, LogIn, Mail, Newspaper, UserPlus } from "lucide-react";
import { MembershipLockBadge } from "./MembershipLockBadge";
import { canAccessNewsletter } from "../lib/membership";
import type { TierId } from "../lib/membership";
import {
  NEWSLETTER_CADENCE_LABEL,
  NEWSLETTER_SEND_DAY,
  fetchPublishedNewsletters,
  mergeMemberNewsletterIssues,
  softLaunchNewsletterIssues,
  type MemberNewsletterIssue,
} from "../lib/member-newsletters";

const FALLBACK_ISSUES = softLaunchNewsletterIssues();

type NewsletterPageProps = {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  membershipTier: TierId | null;
  onLogin: () => void;
  onJoin: () => void;
};

function formatIssueDate(value: string): string {
  if (!value) return "";
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export function NewsletterPage({
  isLoggedIn,
  isAdmin = false,
  membershipTier,
  onLogin,
  onJoin,
}: NewsletterPageProps) {
  const unlocked = canAccessNewsletter(membershipTier, { isAdmin });
  const [issues, setIssues] = useState<MemberNewsletterIssue[]>(FALLBACK_ISSUES);
  const [openId, setOpenId] = useState<string | null>(FALLBACK_ISSUES[0]?.id ?? null);

  useEffect(() => {
    if (!isLoggedIn) {
      setIssues(FALLBACK_ISSUES);
      return;
    }
    let cancelled = false;
    void fetchPublishedNewsletters()
      .then((published) => {
        if (cancelled) return;
        setIssues(mergeMemberNewsletterIssues(published, FALLBACK_ISSUES));
      })
      .catch(() => {
        if (!cancelled) setIssues(FALLBACK_ISSUES);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  return (
    <div className="static-page newsletter-page" data-testid="newsletter-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">
          <Newspaper size={13} aria-hidden /> {NEWSLETTER_CADENCE_LABEL}
        </span>
        <h2>GYSH Weekly Newsletter</h2>
        <p>
          A {NEWSLETTER_SEND_DAY} issue for the whole family — kids glow story on one side, adult hustle tip
          on the other. Content Factory drafts go live here once they are marked Published.
        </p>
        <MembershipLockBadge minTier="starter" unlocked={unlocked} data-testid="newsletter-lock-badge" />
      </section>

      {!unlocked ? (
        <section className="glass static-page-card newsletter-page__lock" data-testid="newsletter-lock">
          <p>
            <Lock size={16} aria-hidden /> The archive and inbox send are a Starter+ membership perk.
            {!isLoggedIn ? " Sign in if you already subscribe, or join to unlock." : " Upgrade to Starter to read every issue."}
          </p>
          <div className="newsletter-page__actions">
            {!isLoggedIn ? (
              <button type="button" className="btn btn-outline" onClick={onLogin} data-testid="newsletter-login">
                <LogIn size={16} aria-hidden /> Sign in
              </button>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={onJoin} data-testid="newsletter-join">
              <UserPlus size={16} aria-hidden /> {isLoggedIn ? "See memberships" : "Join GYSH"}
            </button>
          </div>
        </section>
      ) : null}

      <div className="newsletter-page__list" data-testid="newsletter-archive">
        {issues.map((issue) => {
          const open = unlocked && openId === issue.id;
          return (
            <article
              key={issue.id}
              className={`glass static-page-card newsletter-page__issue${open ? " is-open" : ""}`}
              data-testid={`newsletter-issue-${issue.id}`}
            >
              <button
                type="button"
                className="newsletter-page__issue-toggle"
                aria-expanded={open}
                onClick={() => setOpenId((current) => (current === issue.id ? null : issue.id))}
                disabled={!unlocked}
              >
                <span className="newsletter-page__issue-meta">
                  {formatIssueDate(issue.publishedAt)}
                  {unlocked ? "" : " · Members only"}
                </span>
                <h3>{issue.title}</h3>
                <p>{issue.excerpt}</p>
              </button>
              {open ? (
                <pre className="newsletter-page__body" data-testid={`newsletter-body-${issue.id}`}>
                  {issue.body}
                </pre>
              ) : null}
            </article>
          );
        })}
      </div>

      <p className="newsletter-page__footnote">
        <Mail size={14} aria-hidden />         Issues send on {NEWSLETTER_SEND_DAY}s. Unsubscribe anytime from the email
        footer.
      </p>
    </div>
  );
}
