import { useEffect, useState } from "react";
import { Coins, Trophy } from "lucide-react";
import { api, ApiError } from "../lib/api";
import {
  BETA_RETEST_BONUS,
  scoreForTester,
  type BetaTesterScore,
} from "../lib/beta-tester-points";
import { betaCreditForPriority } from "../lib/beta-tester-credits";

type BetaPointsPageProps = {
  onOpenProgram?: () => void;
};

function formatStatus(status: string): string {
  if (status === "conditional_approval") return "Conditional Pass";
  if (status === "pass") return "Pass";
  if (status === "fail") return "Fail";
  return status.replace(/_/g, " ");
}

export function BetaPointsPage({ onOpenProgram }: BetaPointsPageProps) {
  const [testers, setTesters] = useState<BetaTesterScore[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<{ testers?: BetaTesterScore[] }>("beta-testing/points");
        if (cancelled) return;
        setTesters(data.testers ?? []);
        setError("");
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : "Sign in as a Beta Tester or QA partner to view the points board.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const brenda = scoreForTester(testers, "brenda");

  return (
    <div className="static-page privacy-page beta-credits-page" data-testid="beta-points-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">
          <Trophy size={13} aria-hidden /> Beta Testing Program
        </span>
        <h2>Beta Tester Points</h2>
        <p>
          Points equal Kid Credits. A passed (or documented Fail) case pays the priority amount. A
          required re-test adds +{BETA_RETEST_BONUS}.
        </p>
        {onOpenProgram ? (
          <p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onOpenProgram}
              data-testid="beta-points-open-program"
            >
              Read the program briefing
            </button>
          </p>
        ) : null}
      </section>

      <article className="glass static-page-card privacy-page__body">
        {loading ? <p data-testid="beta-points-loading">Loading points…</p> : null}
        {error ? (
          <p className="beta-credits-page__callout" data-testid="beta-points-error">
            {error}
          </p>
        ) : null}

        {brenda ? (
          <p className="beta-credits-page__callout" data-testid="beta-points-brenda">
            <Coins size={16} aria-hidden /> <strong>Brenda</strong> has{" "}
            <strong>{brenda.totalPoints}</strong> points
            {brenda.testsPassed === 1 ? " from one completed test" : ` from ${brenda.testsPassed} passed tests`}
            {brenda.retests > 0 ? ` (includes ${brenda.retests} re-test bonus${brenda.retests === 1 ? "" : "es"})` : ""}.
          </p>
        ) : null}

        <div className="beta-credits-page__table-wrap">
          <table className="beta-credits-page__table" data-testid="beta-points-table">
            <thead>
              <tr>
                <th scope="col">Tester</th>
                <th scope="col">Passed</th>
                <th scope="col">Re-tests</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {testers.length === 0 && !loading && !error ? (
                <tr>
                  <td colSpan={4}>No scored tests yet.</td>
                </tr>
              ) : (
                testers.map((t) => (
                  <tr key={t.testerId} data-testid={`beta-points-row-${t.testerId}`}>
                    <td>
                      <strong>{t.displayName}</strong>
                    </td>
                    <td>{t.testsPassed}</td>
                    <td>{t.retests}</td>
                    <td className="beta-credits-page__credits">{t.totalPoints}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {testers.map((t) => (
          <section key={`${t.testerId}-detail`} className="privacy-page__section">
            <h3>
              {t.displayName} — {t.totalPoints} points
            </h3>
            <ul>
              {t.cases.map((c) => (
                <li key={c.caseId}>
                  <strong>{c.caseId}</strong> · {formatStatus(c.status)} · {c.priority} (
                  {betaCreditForPriority(c.priority)}
                  {c.retest > 0 ? ` +${c.retest} re-test` : ""}) = {c.total}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </article>
    </div>
  );
}
