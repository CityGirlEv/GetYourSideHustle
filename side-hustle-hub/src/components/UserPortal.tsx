import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckSquare,
  Bookmark,
  Star,
  Zap,
  Check,
  Coins,
  Copy,
  Link2,
  Sparkles,
} from "lucide-react";
import { WaitIndicator } from "./WaitFeedback";
import {
  CREDIT_EARN_ACTIONS,
  KID_TO_ADULT_CREDIT_RATIO,
  MEMBERSHIP_TIERS,
} from "../lib/membership";
import {
  fetchMemberCredits,
  formatAdultCreditEquivalent,
  formatKidCreditBalance,
  formatLedgerDelta,
  summarizeMemberCredits,
  type MemberCreditsSummary,
} from "../lib/member-credits";
import { buildReferralUrl, getOrCreateReferralCode } from "../lib/referral";

interface Goal {
  id: string;
  title: string;
  done: boolean;
}

interface Badge {
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export const UserPortal: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", title: "Complete the GYSH Match Wizard", done: true },
    { id: "2", title: "Run profit estimates on two side hustles", done: true },
    { id: "3", title: "Select a niche keyword list for POD shirts", done: false },
    { id: "4", title: "Request sample packaging from manufacturer", done: false },
    { id: "5", title: "Verify local city STR/Airbnb permit guidelines", done: false }
  ]);
  const [referralCode, setReferralCode] = useState("GYSHHOME");
  const [referralUrl, setReferralUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [credits, setCredits] = useState<MemberCreditsSummary | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    const code = getOrCreateReferralCode();
    setReferralCode(code);
    setReferralUrl(buildReferralUrl(code));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCreditsLoading(true);
    void fetchMemberCredits()
      .then((payload) => {
        if (cancelled) return;
        setCredits(summarizeMemberCredits(payload));
        setCreditsError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setCredits(null);
        setCreditsError(err instanceof Error ? err.message : "Could not load credits.");
      })
      .finally(() => {
        if (!cancelled) setCreditsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const earnActions = useMemo(
    () => CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes("adult")),
    [],
  );

  const tierLabel = credits
    ? MEMBERSHIP_TIERS.find((t) => t.id === credits.membershipTier)?.name ?? "Free"
    : null;

  const badges: Badge[] = [
    { name: "Scout Apprentice 🏷️", desc: "Searched product databases for profitable margins", icon: "🏷️", unlocked: true },
    { name: "Hustle Rookie 🚀", desc: "Completed your first GYSH Match Wizard questionnaire", icon: "🚀", unlocked: true },
    { name: "Superhost Trainee 🏡", desc: "Calculated Airbnb nightly yields and operating costs", icon: "🏡", unlocked: true },
    { name: "First Sale 🎉", desc: "Receive your first customer purchase confirmation", icon: "🎉", unlocked: false },
    { name: "Ad Manager 📊", desc: "Set up Facebook/TikTok business manager tracking pixels", icon: "📊", unlocked: false }
  ];

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) return { ...g, done: !g.done };
      return g;
    }));
  };

  const copyReferral = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const completedGoalsCount = goals.filter(g => g.done).length;
  const progressPercent = Math.round((completedGoalsCount / goals.length) * 100);

  return (
    <div className="user-portal" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "32px" }}>
      
      {/* Roadmap Goal Tracker */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Welcome */}
        <div className="glass" style={{ padding: "28px", borderRadius: "16px" }}>
          <h2 style={{ fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Welcome back, Guest Pilot!
          </h2>
          <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
            Here is your personalized roadmap tracker. Cross off steps as you build your side business.
          </p>

          {/* Goal progress */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "8px" }}>
              <span>Overall Roadmap Completion</span>
              <span style={{ fontWeight: 700, color: "var(--crimson)" }}>{progressPercent}% Complete</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "rgba(155, 47, 40, 0.08)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ 
                width: `${progressPercent}%`, 
                height: "100%", 
                background: "var(--crimson)",
                borderRadius: "9999px"
              }} />
            </div>
          </div>
        </div>

        <section
          className="glass user-portal-credits"
          data-testid="user-portal-credits"
          aria-labelledby="user-portal-credits-heading"
        >
          <h3 id="user-portal-credits-heading">
            <Coins size={20} aria-hidden /> Your Kid Credits
          </h3>
          {creditsLoading && (
            <WaitIndicator
              className="user-portal-credits-muted"
              data-testid="user-portal-credits-loading"
              message="Loading your credit balance…"
              style={{ marginTop: 0 }}
            />
          )}
          {!creditsLoading && creditsError && (
            <p className="user-portal-credits-error" data-testid="user-portal-credits-error">
              {creditsError}
            </p>
          )}
          {!creditsLoading && credits && (
            <>
              <div className="user-portal-credits-balance-row">
                <div>
                  <p className="user-portal-credits-label">Available balance</p>
                  <p className="user-portal-credits-balance" data-testid="user-portal-credits-balance">
                    {formatKidCreditBalance(credits.balance)}
                  </p>
                  <p className="user-portal-credits-equiv" data-testid="user-portal-credits-adult-equiv">
                    ≈ {formatAdultCreditEquivalent(credits.balance)} for adult workshops &amp; 1-on-1s
                  </p>
                </div>
                <div className="user-portal-credits-meta">
                  <p data-testid="user-portal-credits-tier">
                    Plan: <strong>{tierLabel}</strong>
                  </p>
                  {credits.monthlyAllowance > 0 ? (
                    <p data-testid="user-portal-credits-allowance">
                      Plan includes up to <strong>{credits.monthlyAllowance}</strong> Kid Credits / month
                    </p>
                  ) : (
                    <p data-testid="user-portal-credits-allowance">
                      Earn or purchase Kid Credits anytime — see packs on Join.
                    </p>
                  )}
                  <p className="user-portal-credits-muted">{credits.ratioLabel}</p>
                </div>
              </div>
              <div className="user-portal-credits-history">
                <h4>Recent activity</h4>
                {credits.recent.length === 0 ? (
                  <p className="user-portal-credits-muted" data-testid="user-portal-credits-history-empty">
                    No credit activity yet. Refer a friend or complete earn actions below to grow your balance.
                  </p>
                ) : (
                  <ul data-testid="user-portal-credits-history">
                    {credits.recent.map((entry) => (
                      <li key={entry.id}>
                        <strong className={entry.delta >= 0 ? "is-credit" : "is-debit"}>
                          {formatLedgerDelta(entry.delta)}
                        </strong>
                        <span>{entry.reason}</span>
                        <time dateTime={entry.createdAt}>
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        <div className="glass user-portal-referral" data-testid="user-portal-referral" style={{ padding: "24px 28px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Link2 size={20} aria-hidden /> Your referral link
          </h3>
          <p style={{ color: "#5c4a38", fontSize: "0.95rem", marginBottom: "14px", lineHeight: 1.45 }}>
            Share this link to earn <strong>+40 Kid Credits</strong> when a friend joins. Kid Credits work for
            kids or adults on workshops and 1-on-1s ({KID_TO_ADULT_CREDIT_RATIO} Kid Credits = 1 adult credit).
          </p>
          <label className="flat-label" htmlFor="user-referral-link" style={{ display: "block", marginBottom: "6px" }}>
            Code: <strong>{referralCode}</strong>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <input
              id="user-referral-link"
              className="flat-input"
              readOnly
              value={referralUrl}
              data-testid="user-referral-link"
              style={{ flex: "1 1 220px", minWidth: 0 }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={copyReferral}
              data-testid="user-referral-copy"
            >
              <Copy size={16} aria-hidden /> {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        <div className="glass" data-testid="user-portal-earn-credits" style={{ padding: "24px 28px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Coins size={20} aria-hidden /> Ways to earn Kid Credits
          </h3>
          <p style={{ color: "#5c4a38", fontSize: "0.95rem", marginBottom: "14px", lineHeight: 1.45 }}>
            <Sparkles size={14} aria-hidden style={{ verticalAlign: "middle" }} /> Treat this like an earnings
            checklist — learn, launch, refer, and check in weekly.
          </p>
          <ul className="user-portal-earn-list" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {earnActions.map((a) => (
              <li
                key={a.id}
                data-testid={`user-earn-${a.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px 1fr",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  background: "rgba(255,255,255,0.65)",
                }}
              >
                <strong style={{ color: "var(--crimson)", fontSize: "1.05rem" }}>+{a.credits}</strong>
                <span>
                  <strong style={{ display: "block", color: "var(--charcoal)", marginBottom: "2px" }}>{a.label}</strong>
                  <em style={{ fontStyle: "normal", color: "#5c4a38", fontSize: "0.9rem", lineHeight: 1.4 }}>{a.detail}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Goal List */}
        <div className="glass" style={{ padding: "28px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckSquare size={20} style={{ color: "var(--accent-purple)" }} /> My Active Milestones
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {goals.map(g => (
              <div 
                key={g.id} 
                onClick={() => toggleGoal(g.id)}
                className={`checklist-item ${g.done ? "completed" : ""}`}
                style={{ margin: 0 }}
              >
                <div className="checklist-checkbox">
                  {g.done && <Check size={12} />}
                </div>
                <div className="checklist-text">
                  <span style={{ fontSize: "0.925rem" }}>{g.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookmarked Roadmaps */}
        <div className="glass" style={{ padding: "28px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bookmark size={20} style={{ color: "var(--accent-pink)" }} /> Bookmarked Hustles
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
              <span className="glow-badge pink" style={{ fontSize: "0.9375rem", padding: "2px 8px", marginBottom: "8px" }}>Real Estate</span>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "6px" }}>Airbnb Hosting</h4>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Active guide progress: 33%</p>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
              <span className="glow-badge purple" style={{ fontSize: "0.9375rem", padding: "2px 8px", marginBottom: "8px" }}>E-Commerce</span>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "6px" }}>Print-on-Demand</h4>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Active guide progress: 50%</p>
            </div>
          </div>
        </div>

      </div>

      {/* Badges Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Unlocked Badges */}
        <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={20} style={{ color: "var(--accent-amber)" }} /> Unlocked Badges
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {badges.map((b, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "14px", 
                  opacity: b.unlocked ? 1 : 0.45,
                  background: b.unlocked ? "rgba(124, 58, 237, 0.02)" : "transparent",
                  padding: "10px",
                  borderRadius: "10px",
                  border: b.unlocked ? "1px solid rgba(124, 58, 237, 0.1)" : "1px solid transparent"
                }}
              >
                <div style={{ 
                  width: "42px", 
                  height: "42px", 
                  borderRadius: "10px", 
                  background: b.unlocked ? "var(--grad-amber)" : "rgba(0,0,0,0.05)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  boxShadow: b.unlocked ? "0 4px 10px var(--accent-amber-glow)" : "none"
                }}>
                  {b.unlocked ? <Star size={20} style={{ color: "white", fill: "white" }} /> : <Zap size={20} style={{ color: "var(--text-primary)" }} />}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", color: "var(--text-primary)", fontWeight: 600 }}>{b.name}</h4>
                  <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: "1.3" }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Level Info */}
        <div className="glass" style={{ padding: "20px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--text-primary)", marginBottom: "12px" }}>Hustle Level: 3</h3>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: "12px" }}>
            Earn 120 more XP by completing milestones to unlock "Level 4: Affiliate Expert".
          </p>
          <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.03)", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", background: "var(--grad-pink)", borderRadius: "9999px" }} />
          </div>
        </div>

      </div>

    </div>
  );
};
