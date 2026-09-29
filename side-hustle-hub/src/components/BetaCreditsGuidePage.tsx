import { useState } from "react";
import { Ban, Coins, Download, FileText, Gift, Trophy, Zap } from "lucide-react";
import {
  BETA_CREDIT_EARN_RULES,
  BETA_CREDIT_PRIORITY_ROWS,
  BETA_CREDIT_SPEND_RULES,
  BETA_CREDIT_ZERO_STATUSES,
  BETA_CREDITS_GUIDE_SUBTITLE,
  BETA_CREDITS_GUIDE_TITLE,
  BETA_REPRO_FAIL_BONUS,
  BETA_REWARD_LEVELS,
} from "../lib/beta-tester-credits";
import { BETA_RETEST_BONUS } from "../lib/beta-tester-points";
import { downloadBetaProgramPdf } from "../lib/beta-program-pdf";
import { downloadBetaProgramWord } from "../lib/beta-program-word";
import { reservePdfTab } from "../lib/open-pdf";
import { MembershipModelExplainer } from "./MembershipModelExplainer";

type BetaCreditsGuidePageProps = {
  onOpenDashboard?: () => void;
  onOpenNda?: () => void;
  onOpenJoin?: () => void;
  onOpenPoints?: () => void;
};

export function BetaCreditsGuidePage({
  onOpenDashboard,
  onOpenNda,
  onOpenJoin,
  onOpenPoints,
}: BetaCreditsGuidePageProps) {
  const [pdfBusy, setPdfBusy] = useState(false);

  const openPdf = () => {
    const tab = reservePdfTab();
    setPdfBusy(true);
    void downloadBetaProgramPdf(tab)
      .catch(() => tab?.close())
      .finally(() => {
        window.setTimeout(() => setPdfBusy(false), 400);
      });
  };

  return (
    <div className="static-page privacy-page beta-credits-page" data-testid="beta-credits-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">
          <Coins size={13} aria-hidden /> Beta Testing Program
        </span>
        <h2>{BETA_CREDITS_GUIDE_TITLE}</h2>
        <p>{BETA_CREDITS_GUIDE_SUBTITLE}</p>
        <p className="beta-nda-page__brand">Get Your Side Hustle (GYSH)</p>
        <div className="beta-nda-page__cta-actions">
          {onOpenDashboard ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenDashboard}
              data-testid="beta-credits-open-dashboard"
            >
              Beta Tester Dashboard
            </button>
          ) : null}
          {onOpenNda ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onOpenNda}
              data-testid="beta-credits-open-nda"
            >
              Read the NDA
            </button>
          ) : null}
          {onOpenPoints ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onOpenPoints}
              data-testid="beta-credits-open-points"
            >
              View points earned
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-outline"
            onClick={openPdf}
            disabled={pdfBusy}
            data-testid="beta-program-pdf"
          >
            <Download size={16} aria-hidden />
            {pdfBusy ? "Opening PDF…" : "Download PDF"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => downloadBetaProgramWord()}
            data-testid="beta-program-word"
          >
            <FileText size={16} aria-hidden />
            Download Word
          </button>
        </div>
      </section>

      <article className="glass static-page-card privacy-page__body">
        <section className="privacy-page__section" aria-labelledby="beta-credits-membership">
          <h3 id="beta-credits-membership">Membership & payment at a glance</h3>
          <p>
            Credits you earn here become Kid Credits on a GYSH member account. Use the comparison
            below to see what Free, Starter, Pro, and Elite each include, what stays locked, how
            credits / packs / consulting fit, and what is Available now vs Coming soon. Lock badges
            and unlock buttons always share the same “or higher” phrase.
          </p>
          <MembershipModelExplainer data-testid="beta-credits-membership-glossary" />
          {onOpenJoin ? (
            <p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onOpenJoin}
                data-testid="beta-credits-open-membership"
              >
                Compare plans, credits, and consulting
              </button>
            </p>
          ) : null}
        </section>

        <section className="privacy-page__section" aria-labelledby="beta-credits-earn">
          <h3 id="beta-credits-earn">
            <Zap size={18} aria-hidden /> How credits are earned
          </h3>
          <p>
            Credits are <strong>Kid Credits</strong> on your GYSH member account. A case must reach an
            eligible status with honest work — no credit for empty checkboxes or copy-paste notes.
          </p>
          <ul>
            {BETA_CREDIT_EARN_RULES.map((rule) => (
              <li key={rule.id}>
                <strong>{rule.title}.</strong> {rule.detail}
              </li>
            ))}
          </ul>
          <p className="beta-credits-page__callout" data-testid="beta-credits-zero-note">
            <Ban size={16} aria-hidden />{" "}
            <strong>{BETA_CREDIT_ZERO_STATUSES.join(" and ")}</strong> earn <strong>0</strong> credits.
          </p>
        </section>

        <section className="privacy-page__section" aria-labelledby="beta-credits-table">
          <h3 id="beta-credits-table">
            <Coins size={18} aria-hidden /> Credit reward table
          </h3>
          <p>Token amount scales with case priority (complexity):</p>
          <div className="beta-credits-page__table-wrap">
            <table className="beta-credits-page__table" data-testid="beta-credits-reward-table">
              <thead>
                <tr>
                  <th scope="col">Priority</th>
                  <th scope="col">Meaning</th>
                  <th scope="col">Kid Credits</th>
                </tr>
              </thead>
              <tbody>
                {BETA_CREDIT_PRIORITY_ROWS.map((row) => (
                  <tr key={row.priority}>
                    <td>
                      <strong>{row.priority}</strong> · {row.label}
                    </td>
                    <td>{row.meaning}</td>
                    <td className="beta-credits-page__credits">{row.credits}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}>
                    <strong>Re-test bonus</strong> (pass after a fail or completed re-test)
                  </td>
                  <td className="beta-credits-page__credits">+{BETA_RETEST_BONUS}</td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <strong>First reproducible Fail bonus</strong>
                  </td>
                  <td className="beta-credits-page__credits">+{BETA_REPRO_FAIL_BONUS}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="privacy-page__section" aria-labelledby="beta-credits-spend">
          <h3 id="beta-credits-spend">
            <Gift size={18} aria-hidden /> How credits are spent
          </h3>
          <ul>
            {BETA_CREDIT_SPEND_RULES.map((rule) => (
              <li key={rule.id}>
                <strong>{rule.title}.</strong> {rule.detail}
              </li>
            ))}
          </ul>
          {onOpenJoin ? (
            <p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onOpenJoin}
                data-testid="beta-credits-open-join"
              >
                View membership &amp; credit options
              </button>
            </p>
          ) : null}
        </section>

        <section className="privacy-page__section" aria-labelledby="beta-credits-levels">
          <h3 id="beta-credits-levels">
            <Trophy size={18} aria-hidden /> Reward levels
          </h3>
          <p>
            Your Beta Tester dashboard shows a reward level based on eligible tests completed. GYSH may
            also announce round-specific membership or consulting rewards under NDA §9.
          </p>
          <ul data-testid="beta-credits-reward-levels">
            {BETA_REWARD_LEVELS.map((level) => (
              <li key={level.id}>
                <strong>{level.label}</strong>
                {level.minTests > 0 ? ` (${level.minTests}+ tests)` : ""} — {level.blurb}
              </li>
            ))}
          </ul>
        </section>

        <section className="privacy-page__section" aria-labelledby="beta-credits-fair">
          <h3 id="beta-credits-fair">Fair play</h3>
          <p>
            Meeting time or test-count thresholds does not excuse fraudulent, incomplete, duplicate,
            automated, or bad-faith testing. GYSH reviews activity and determines final credit and reward
            eligibility.
          </p>
        </section>
      </article>
    </div>
  );
}
