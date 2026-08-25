import { useEffect, useState } from "react";
import { ClipboardCheck, Clock, FileSignature, Trophy } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { BETA_NDA_VERSION } from "../lib/beta-tester-nda";
import {
  emptyBetaTesterStats,
  formatBetaRecordedTime,
  isBetaTestingUnlocked,
  type BetaNdaReceipt,
  type BetaTesterStats,
} from "../lib/beta-tester-dashboard";
import { BetaNdaAcceptancePanel, type BetaNdaAcceptanceValue } from "./BetaNdaAcceptancePanel";
import { betaNdaAcceptanceError, betaNdaTodayDate } from "../lib/beta-tester-nda";

type BetaTesterDashboardProps = {
  preview?: BetaNdaReceipt | null;
  memberName?: string | null;
  memberEmail?: string | null;
  onOpenNda?: () => void;
  onJoin?: () => void;
};

export function BetaTesterDashboard({
  preview = null,
  memberName = "",
  memberEmail = "",
  onOpenNda,
  onJoin,
}: BetaTesterDashboardProps) {
  const [nda, setNda] = useState<BetaNdaReceipt | null>(preview);
  const [stats, setStats] = useState<BetaTesterStats>(emptyBetaTesterStats());
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<BetaNdaAcceptanceValue>({
    legalName: memberName || "",
    email: memberEmail || "",
    signature: "",
    agreed: false,
  });

  const unlocked = isBetaTestingUnlocked(nda, BETA_NDA_VERSION);

  useEffect(() => {
    if (preview) {
      setNda(preview);
      setStats(emptyBetaTesterStats());
      return;
    }
    let cancelled = false;
    void api<{
      testingUnlocked?: boolean;
      nda?: BetaNdaReceipt | null;
      stats?: BetaTesterStats;
    }>("beta-testing/dashboard")
      .then((data) => {
        if (cancelled) return;
        setNda(data.nda ?? null);
        setStats(data.stats ?? emptyBetaTesterStats());
      })
      .catch((e) => {
        if (cancelled) return;
        if (preview) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setLoadError("");
          return;
        }
        setLoadError(e instanceof ApiError ? e.message : "Could not load beta testing status.");
      });
    return () => {
      cancelled = true;
    };
  }, [preview]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = betaNdaAcceptanceError({
      ...form,
      ndaVersion: BETA_NDA_VERSION,
    });
    if (err) {
      setLoadError(err);
      return;
    }
    setBusy(true);
    setLoadError("");
    try {
      const data = await api<{
        testingUnlocked?: boolean;
        nda?: BetaNdaReceipt;
        stats?: BetaTesterStats;
      }>("beta-nda", {
        method: "POST",
        body: { ...form, agreed: true, ndaVersion: BETA_NDA_VERSION },
      });
      setNda(data.nda ?? null);
      setStats(data.stats ?? emptyBetaTesterStats());
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Could not record NDA acceptance.");
    } finally {
      setBusy(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="beta-tester-dash" data-testid="beta-tester-dashboard">
        <section className="glass static-page-hero">
          <span className="flat-label flat-label--accent">
            <FileSignature size={13} aria-hidden /> Beta Testing
          </span>
          <h2>Read and accept the Beta Tester NDA</h2>
          <p>
            Create your tester profile, read {BETA_NDA_VERSION}, type your full legal name, and
            check <strong>I have read and agree</strong>. GYSH records the timestamp, IP, user ID,
            and NDA version, then unlocks testing.
          </p>
        </section>
        <form className="glass static-page-card beta-tester-dash__nda" onSubmit={handleAccept}>
          <BetaNdaAcceptancePanel
            idPrefix="beta-dash-nda"
            value={form}
            acceptedAt={betaNdaTodayDate()}
            onChange={setForm}
            onOpenFullNda={onOpenNda}
          />
          {loadError ? (
            <p className="membership-signup-error" role="alert">
              {loadError}
            </p>
          ) : null}
          {memberEmail ? (
            <button type="submit" className="btn btn-primary" disabled={busy} data-testid="beta-dash-nda-submit">
              {busy ? "Recording acceptance…" : "Accept NDA & unlock testing"}
            </button>
          ) : onJoin ? (
            <button type="button" className="btn btn-primary" onClick={onJoin} data-testid="beta-dash-create-profile">
              Create tester profile
            </button>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className="beta-tester-dash" data-testid="beta-tester-dashboard">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">
          <ClipboardCheck size={13} aria-hidden /> Testing unlocked
        </span>
        <h2>Beta Tester dashboard</h2>
        <p data-testid="beta-dash-nda-version">
          Agreement on file: <strong>{nda?.version ?? BETA_NDA_VERSION}</strong>
        </p>
        {nda?.acceptedAt ? (
          <p className="beta-tester-dash__meta" data-testid="beta-dash-nda-stamp">
            Accepted {nda.acceptedAt.slice(0, 10)}
            {nda.legalName ? ` · ${nda.legalName}` : ""}
            {nda.userId ? ` · ID ${nda.userId}` : ""}
          </p>
        ) : null}
      </section>

      <div className="beta-tester-dash__stats" data-testid="beta-dash-stats">
        <article className="glass static-page-card beta-tester-dash__stat">
          <ClipboardCheck size={22} aria-hidden />
          <p className="beta-tester-dash__stat-label">Tests completed</p>
          <p className="beta-tester-dash__stat-value" data-testid="beta-dash-tests-completed">
            {stats.testsCompleted}
          </p>
        </article>
        <article className="glass static-page-card beta-tester-dash__stat">
          <Clock size={22} aria-hidden />
          <p className="beta-tester-dash__stat-label">Recorded time</p>
          <p className="beta-tester-dash__stat-value" data-testid="beta-dash-recorded-time">
            {formatBetaRecordedTime(stats.recordedMs)}
          </p>
        </article>
        <article className="glass static-page-card beta-tester-dash__stat">
          <Trophy size={22} aria-hidden />
          <p className="beta-tester-dash__stat-label">Current reward level</p>
          <p className="beta-tester-dash__stat-value" data-testid="beta-dash-reward-level">
            {stats.rewardLevel}
          </p>
        </article>
      </div>
    </div>
  );
}
