import { useState } from "react";
import { ArrowLeft, Download, FlaskConical, BookOpen, GitBranch } from "lucide-react";
import {
  QA_TESTING_MANUAL,
  type FlowchartNode,
  type ManualFlowchart,
} from "../../lib/qa-testing-manual";
import { reservePdfTab } from "../../lib/open-pdf";
import { downloadQaTestingManualPdf } from "../../lib/qa-testing-manual-pdf";

type QaTestingManualPageProps = {
  onBack?: () => void;
};

const KIND_LABEL: Record<string, string> = {
  process: "Step",
  decision: "Decision",
  status: "Status",
  end: "End",
};

const TONE_LABEL: Record<string, string> = {
  pass: "Pass",
  cond: "Cond. Pass",
  fail: "Fail",
  blocked: "Blocked",
  fixed: "Fixed/Re-Test",
  cursor: "Fixed/Cursor",
  retest: "Failed/Re-Test",
  muted: "Info",
};

function chartDisplayTitle(title: string): string {
  return title.replace(/^Flowchart\s*[—–-]\s*/i, "").trim();
}

function FlowInfoChip({ node }: { node: FlowchartNode }) {
  const kind = node.kind ?? "process";
  const tone = node.tone;
  return (
    <article
      className={`qa-info-card qa-info-card--${kind}${tone ? ` qa-info-card--tone-${tone}` : ""}`}
      data-kind={kind}
      data-tone={tone || undefined}
    >
      <header className="qa-info-card__head">
        <div className="qa-info-card__titles">
          <strong>{node.label}</strong>
          <span className={`qa-info-badge qa-info-badge--${kind}`}>
            {KIND_LABEL[kind] ?? "Step"}
          </span>
          {tone && TONE_LABEL[tone] && kind === "status" && (
            <span className={`qa-info-badge qa-info-badge--tone-${tone}`}>{TONE_LABEL[tone]}</span>
          )}
        </div>
      </header>
    </article>
  );
}

function FlowInfoArrow({ label }: { label?: string }) {
  return (
    <div className="qa-info-arrow" aria-hidden>
      {label ? <p className="qa-info-flow-label">{label}</p> : null}
      <span />
    </div>
  );
}

/** Site Map–style infographic (tiers, arrows, card grid) for each testing path. */
function ManualFlowInfographic({ chart }: { chart: ManualFlowchart }) {
  const title = chartDisplayTitle(chart.title);
  let stepNum = 0;

  return (
    <article
      className="qa-info"
      id={`qa-flow-${chart.id}`}
      data-testid={`qa-flowchart-${chart.id}`}
    >
      <header className="qa-info__head">
        <div className="qa-info-banner">
          <GitBranch size={20} aria-hidden />
          <div>
            <strong>{title}</strong>
            {chart.caption ? <span>{chart.caption}</span> : null}
          </div>
        </div>
      </header>

      <div className="qa-info-legend" aria-label="Legend">
        <span className="qa-info-legend__item">
          <span className="qa-info-swatch qa-info-swatch--process" /> Step
        </span>
        <span className="qa-info-legend__item">
          <span className="qa-info-swatch qa-info-swatch--decision" /> Decision
        </span>
        <span className="qa-info-legend__item">
          <span className="qa-info-swatch qa-info-swatch--pass" /> Pass
        </span>
        <span className="qa-info-legend__item">
          <span className="qa-info-swatch qa-info-swatch--cond" /> Cond. Pass
        </span>
        <span className="qa-info-legend__item">
          <span className="qa-info-swatch qa-info-swatch--fail" /> Fail
        </span>
        <span className="qa-info-legend__item">
          <span className="qa-info-swatch qa-info-swatch--cursor" /> Fixed/Cursor
        </span>
      </div>

      <div className="qa-info-body" role="img" aria-label={title}>
        {chart.rows.map((row, idx) => {
          if (row.type === "note") {
            return (
              <aside key={`note-${idx}`} className="qa-info-note">
                {row.text}
              </aside>
            );
          }

          if (row.type === "branch") {
            return (
              <div key={`branch-${idx}`} className="qa-info-tier">
                {idx > 0 ? <FlowInfoArrow /> : null}
                {row.label ? <p className="qa-info-flow-label">{row.label}</p> : null}
                <div className="qa-info-grid" role="list">
                  {row.nodes.map((node, i) => (
                    <div key={`${node.label}-${i}`} className="qa-info-grid__item" role="listitem">
                      <span className="qa-info-card__num" aria-hidden>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <FlowInfoChip node={node} />
                    </div>
                  ))}
                </div>
                {row.joinLabel ? (
                  <>
                    <FlowInfoArrow label="Then" />
                    <div className="qa-info-join">
                      <strong>{row.joinLabel}</strong>
                    </div>
                  </>
                ) : null}
              </div>
            );
          }

          const kind = row.node.kind ?? "process";
          const isDecision = kind === "decision";
          const isEnd = kind === "end";
          if (!isDecision && !isEnd) stepNum += 1;
          const num = stepNum;

          return (
            <div
              key={`node-${idx}`}
              className={`qa-info-tier${isDecision ? " qa-info-tier--decision" : ""}${isEnd ? " qa-info-tier--end" : ""}`}
            >
              {idx > 0 ? <FlowInfoArrow label={row.arrow} /> : null}
              {isDecision || isEnd ? (
                <div
                  className={`qa-info-decision${isEnd ? " qa-info-decision--end" : ""}${row.node.tone ? ` qa-info-decision--${row.node.tone}` : ""}`}
                >
                  <strong>{row.node.label}</strong>
                  <span className={`qa-info-badge qa-info-badge--${kind}`}>
                    {KIND_LABEL[kind]}
                  </span>
                </div>
              ) : (
                <div className="qa-info-step">
                  <span className="qa-info-card__num" aria-hidden>
                    {num}
                  </span>
                  <FlowInfoChip node={row.node} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function QaTestingManualPage({ onBack }: QaTestingManualPageProps) {
  const m = QA_TESTING_MANUAL;
  const [pdfBusy, setPdfBusy] = useState(false);

  const downloadPdf = () => {
    const tab = reservePdfTab();
    setPdfBusy(true);
    void downloadQaTestingManualPdf(tab)
      .catch(() => tab?.close())
      .finally(() => {
        window.setTimeout(() => setPdfBusy(false), 400);
      });
  };

  return (
    <div className="qa-manual glass" data-testid="qa-testing-manual">
      <header className="qa-manual__hero">
        <div className="qa-manual__hero-top">
          {onBack && (
            <button type="button" className="btn btn-outline qa-manual__back" onClick={onBack}>
              <ArrowLeft size={16} /> Back to Testing Portal
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary qa-manual__pdf"
            onClick={downloadPdf}
            disabled={pdfBusy}
            data-testid="qa-testing-manual-pdf"
          >
            <Download size={16} />
            {pdfBusy ? "Opening PDF…" : "Open PDF"}
          </button>
        </div>
        <p className="qa-manual__eyebrow">
          <FlaskConical size={16} aria-hidden /> QA · Testing Portal
        </p>
        <h1 className="qa-manual__title">{m.title}</h1>
        <p className="qa-manual__subtitle">{m.subtitle}</p>
        <p className="qa-manual__lead">{m.lead}</p>
        <p className="qa-manual__where">
          <BookOpen size={15} aria-hidden /> {m.where}
        </p>
      </header>

      <nav className="qa-manual__toc" aria-label="Manual sections">
        <strong>On this page</strong>
        <ol>
          <li>
            <a href="#qa-manual-quick">Quick start</a>
          </li>
          <li>
            <a href="#qa-manual-flowcharts">Testing paths</a>
          </li>
          <li>
            <a href="#qa-manual-statuses">Status definitions</a>
          </li>
          <li>
            <a href="#qa-manual-outcomes">Outcomes</a>
          </li>
          <li>
            <a href="#qa-manual-cursor">Fixed/Cursor notes</a>
          </li>
          <li>
            <a href="#qa-manual-progress">Progress counts</a>
          </li>
          <li>
            <a href="#qa-manual-checklist">Checklist</a>
          </li>
        </ol>
      </nav>

      <section id="qa-manual-quick" className="qa-manual__section">
        <h2>Quick start</h2>
        <ol className="qa-manual__steps">
          {m.quickStart.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section id="qa-manual-flowcharts" className="qa-manual__section">
        <h2>Testing paths</h2>
        <p className="qa-manual__muted">
          Infographic view (same style as Site Map → Diagram) for daily testing, Fail triage, and
          Conditional Pass follow-up.
        </p>
        <div className="qa-manual__flowchart-list">
          {m.flowcharts.map((chart) => (
            <ManualFlowInfographic key={chart.id} chart={chart} />
          ))}
        </div>
      </section>

      <section id="qa-manual-statuses" className="qa-manual__section">
        <h2>Status definitions</h2>
        <div className="qa-manual__status-grid">
          {m.statuses.map((s) => (
            <article key={s.status} className="qa-manual__status-card">
              <header>
                <span className="qa-manual__status-dot" style={{ background: s.color }} />
                <h3>{s.status}</h3>
              </header>
              <p>{s.meaning}</p>
              <dl>
                <div>
                  <dt>Who sets it</dt>
                  <dd>{s.who}</dd>
                </div>
                <div>
                  <dt>Note</dt>
                  <dd>{s.note}</dd>
                </div>
                <div>
                  <dt>Resolved?</dt>
                  <dd>{s.done}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <aside className="qa-manual__callout">{m.statusCallout}</aside>
      </section>

      <section id="qa-manual-outcomes" className="qa-manual__section">
        <h2>What to do for each outcome</h2>
        <div className="qa-manual__outcome-grid">
          {m.outcomes.map((o) => (
            <article key={o.title} className="qa-manual__outcome">
              <h3>{o.title}</h3>
              <ul>
                {o.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="qa-manual-cursor" className="qa-manual__section">
        <h2>{m.fixedCursor.title}</h2>
        <p>{m.fixedCursor.intro}</p>
        <ul>
          {m.fixedCursor.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="qa-manual__formats">
          <div>
            <h3>Was a Fail</h3>
            <pre>{m.fixedCursor.failFormat}</pre>
          </div>
          <div>
            <h3>Was a Conditional Pass</h3>
            <pre>{m.fixedCursor.condFormat}</pre>
          </div>
        </div>
        <h3>Your job when you see Fixed/Cursor</h3>
        <ol>
          {m.fixedCursor.job.map((j) => (
            <li key={j}>{j}</li>
          ))}
        </ol>

        <h3>Fixed/Re-Test vs Failed/Re-Test vs Fixed/Cursor</h3>
        <div className="qa-manual__table-wrap">
          <table className="qa-manual__table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Meaning</th>
                <th>After you re-test</th>
              </tr>
            </thead>
            <tbody>
              {m.retestCompare.map((r) => (
                <tr key={r.status}>
                  <td>{r.status}</td>
                  <td>{r.meaning}</td>
                  <td>{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="qa-manual-progress" className="qa-manual__section">
        <h2>Progress counts (Tina chip)</h2>
        <ul className="qa-manual__legend">
          {m.progressColors.map((c) => {
            const emphasize = "emphasize" in c && Boolean(c.emphasize);
            return (
              <li key={c.label} className={emphasize ? "is-emphasis" : undefined}>
                <span style={{ background: c.color }} />
                {c.label}
                {emphasize ? " — all system fixes land here" : ""}
              </li>
            );
          })}
        </ul>
        <p className="qa-manual__muted">{m.progressNote}</p>

        <h3>Notes rules</h3>
        <div className="qa-manual__table-wrap">
          <table className="qa-manual__table">
            <thead>
              <tr>
                <th>Situation</th>
                <th>Note?</th>
              </tr>
            </thead>
            <tbody>
              {m.noteRules.map((r) => (
                <tr key={r.situation}>
                  <td>{r.situation}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul>
          {m.noteTips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <h3>Sprint Board vs Testing Portal</h3>
        <ul>
          {m.boardVsPortal.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section id="qa-manual-checklist" className="qa-manual__section">
        <h2>Checklist for Tina</h2>
        <ul className="qa-manual__checklist">
          {m.checklist.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="qa-manual__footer">{m.footer}</p>
        <div className="qa-manual__pdf-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadPdf}
            disabled={pdfBusy}
          >
            <Download size={16} />
            {pdfBusy ? "Opening PDF…" : "Open PDF"}
          </button>
        </div>
      </section>
    </div>
  );
}
