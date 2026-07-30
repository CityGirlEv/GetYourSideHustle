import { useCallback, useEffect, useState } from "react";
import { List, Mail, RefreshCw, Send } from "lucide-react";
import { BusyOverlay, WaitIndicator } from "../WaitFeedback";
import { api, ApiError } from "../../lib/api";

type TemplateRow = {
  slug: string;
  name: string;
  description: string;
  subject: string;
  enabled: boolean;
  sendCount: number;
};

type Preview = { slug: string; subject: string; html: string; text: string };

type LogEntry = {
  id: string;
  templateSlug: string;
  toEmail: string;
  userId: string | null;
  subject: string;
  status: string;
  providerId: string | null;
  error: string;
  createdAt: string;
};

export function EmailTemplates() {
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsBusy, setLogsBusy] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const load = async () => {
    setErr("");
    try {
      const data = await api<{
        emailConfigured: boolean;
        logoUrl: string;
        templates: TemplateRow[];
      }>("email/templates");
      setEmailConfigured(data.emailConfigured);
      setLogoUrl(data.logoUrl || "");
      setTemplates(data.templates || []);
      if (!selected && data.templates?.[0]) setSelected(data.templates[0].slug);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not load email templates.");
    }
  };

  const loadLogs = useCallback(async (slug: string, all: boolean) => {
    setLogsBusy(true);
    try {
      const qs = all
        ? "email/log?limit=200"
        : `email/log?template=${encodeURIComponent(slug)}&limit=100`;
      const data = await api<{ entries: LogEntry[] }>(qs);
      setLogs(data.entries || []);
    } catch (e) {
      setLogs([]);
      setErr(e instanceof ApiError ? e.message : "Could not load email logs.");
    } finally {
      setLogsBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setBusy(true);
    setErr("");
    void api<Preview>("email/preview", { method: "POST", body: { slug: selected } })
      .then((p) => {
        if (!cancelled) setPreview(p);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof ApiError ? e.message : "Preview failed.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    if (!selected && !showAllLogs) return;
    void loadLogs(selected, showAllLogs);
  }, [selected, showAllLogs, loadLogs]);

  const sendTest = async () => {
    setMsg("");
    setErr("");
    setBusy(true);
    try {
      const data = await api<{ ok: boolean; message?: string }>("email/test-send", {
        method: "POST",
        body: { slug: selected, to: to.trim() || undefined },
      });
      setMsg(data.message || `Test sent for ${selected}.`);
      await load();
      await loadLogs(selected, showAllLogs);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Test send failed.");
    } finally {
      setBusy(false);
    }
  };

  const sendDigests = async (mode: "all" | "evelyn") => {
    setMsg("");
    setErr("");
    setBusy(true);
    try {
      if (mode === "evelyn") {
        const data = await api<{
          ok: boolean;
          sent?: Array<{ email: string; id?: string; skipped?: string }>;
          errors?: Array<{ email: string; error: string }>;
          note?: string;
        }>("email/digest/send-evelyn-test", { method: "POST", body: {} });
        const n = data.sent?.filter((s) => s.id).length ?? 0;
        setMsg(data.note || `Evelyn test digest sent (${n} delivered).`);
      } else {
        const data = await api<{
          ok: boolean;
          chicagoDate?: string;
          timezone?: string;
          sent?: Array<{ email: string; id?: string; skipped?: string }>;
          errors?: Array<{ email: string; error: string }>;
        }>("email/digest/send", {
          method: "POST",
          body: { force: true, allowResend: true },
        });
        const n = data.sent?.filter((s) => s.id).length ?? 0;
        const skipped = data.sent?.filter((s) => s.skipped).length ?? 0;
        const errs = data.errors?.length ?? 0;
        setMsg(
          `Digests (${data.timezone || "America/Chicago"} ${data.chicagoDate || ""}): ${n} sent, ${skipped} skipped, ${errs} errors.`,
        );
      }
      setSelected("daily_admin_digest");
      await load();
      await loadLogs("daily_admin_digest", false);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Digest send failed.");
    } finally {
      setBusy(false);
    }
  };

  const templateName = (slug: string) =>
    templates.find((t) => t.slug === slug)?.name || slug;

  const totalLogged = templates.reduce((n, t) => n + (t.sendCount || 0), 0);

  return (
    <div className="email-templates-admin" data-testid="email-templates-admin">
      <BusyOverlay
        active={busy || logsBusy}
        message={logsBusy ? "Loading email log…" : "Working on email…"}
      />
      <header className="email-templates-admin__head">
        <div>
          <h2>
            <Mail size={20} aria-hidden /> Email templates
          </h2>
          <p className="admin-page-lede">
            GYSH logo header + website / Facebook footer. Preview here, send a Resend test, and check send
            history under each template.
          </p>
        </div>
        <div className="email-templates-admin__head-actions">
          <button
            type="button"
            className="btn btn-outline"
            data-testid="email-digest-evelyn-test"
            disabled={busy || !emailConfigured}
            onClick={() => void sendDigests("evelyn")}
            title="Send live digest to evelyn3@cox.net only"
          >
            <Send size={16} /> Test digest → Evelyn
          </button>
          <button
            type="button"
            className="btn btn-outline"
            data-testid="email-digest-send-all"
            disabled={busy || !emailConfigured}
            onClick={() => void sendDigests("all")}
            title="Force-send digests to all Admin/QA now (America/Chicago date)"
          >
            <Send size={16} /> Send digests now
          </button>
          <button
            type="button"
            className={`btn ${showAllLogs ? "btn-primary" : "btn-outline"}`}
            data-testid="email-logs-show-all"
            aria-pressed={showAllLogs}
            onClick={() => setShowAllLogs((v) => !v)}
          >
            <List size={16} />
            {showAllLogs ? "Showing all emails" : "Show all emails"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              void load();
              void loadLogs(selected, showAllLogs);
            }}
            disabled={busy || logsBusy}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      <div className="email-templates-admin__status" role="status">
        <span>
          Resend:{" "}
          <strong data-testid="email-configured-status">
            {emailConfigured == null ? "…" : emailConfigured ? "configured" : "missing"}
          </strong>
        </span>
        <span>
          Logged sends: <strong data-testid="email-log-total">{totalLogged}</strong>
        </span>
        {logoUrl ? (
          <span className="email-templates-admin__logo-chip">
            Logo:{" "}
            <a href={logoUrl} target="_blank" rel="noreferrer">
              /brand/gysh-logo-rocket.png
            </a>
          </span>
        ) : null}
      </div>

      {err ? <div className="consent-alert is-error">{err}</div> : null}
      {msg ? <div className="consent-alert is-ok">{msg}</div> : null}

      <div className="email-templates-admin__layout">
        <aside className="email-templates-admin__list" aria-label="Templates">
          {templates.map((t) => (
            <button
              key={t.slug}
              type="button"
              className={`email-templates-admin__item${selected === t.slug && !showAllLogs ? " is-active" : ""}`}
              onClick={() => {
                setShowAllLogs(false);
                setSelected(t.slug);
              }}
            >
              <strong>{t.name}</strong>
              <span>{t.description}</span>
              <em data-testid={`email-template-count-${t.slug}`}>{t.sendCount} logged sends</em>
            </button>
          ))}
        </aside>

        <section className="email-templates-admin__preview glass">
          {preview ? (
            <>
              <p className="email-templates-admin__subject">
                <strong>Subject:</strong> {preview.subject}
              </p>
              <div className="email-templates-admin__actions">
                <input
                  type="email"
                  className="text-input"
                  placeholder="Send test to email…"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  autoComplete="email"
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy || !emailConfigured}
                  onClick={() => void sendTest()}
                >
                  <Send size={16} /> Send test
                </button>
              </div>
              <iframe
                title={`Preview ${preview.slug}`}
                className="email-templates-admin__iframe"
                sandbox=""
                srcDoc={preview.html}
              />
            </>
          ) : busy ? (
            <WaitIndicator message="Loading preview…" style={{ marginTop: 0 }} />
          ) : (
            <p>Select a template.</p>
          )}
        </section>
      </div>

      <section
        className="email-templates-admin__logs glass"
        aria-label="Email send log"
        data-testid="email-send-log"
      >
        <header className="email-templates-admin__logs-head">
          <h3>
            {showAllLogs
              ? "All email sends"
              : `Sends for ${templateName(selected) || "template"}`}
          </h3>
          <span>
            {logsBusy ? "Loading…" : `${logs.length} shown`}
            {showAllLogs ? " · all templates" : null}
          </span>
        </header>

        {logs.length === 0 && !logsBusy ? (
          <p className="email-templates-admin__logs-empty">
            No logged sends yet{showAllLogs ? "" : " for this template"}. Test sends and live transactional
            emails (password reset, welcome, contact, etc.) appear here after Resend accepts them.
          </p>
        ) : (
          <div className="email-templates-admin__logs-table-wrap">
            <table className="email-templates-admin__logs-table">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  {showAllLogs ? <th scope="col">Template</th> : null}
                  <th scope="col">To</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Status</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id} data-testid={`email-log-row-${row.id}`}>
                    <td>
                      <time dateTime={row.createdAt}>
                        {new Date(row.createdAt).toLocaleString()}
                      </time>
                    </td>
                    {showAllLogs ? (
                      <td>
                        <code>{row.templateSlug}</code>
                      </td>
                    ) : null}
                    <td>{row.toEmail}</td>
                    <td>{row.subject}</td>
                    <td>
                      <span
                        className={`email-templates-admin__status-pill is-${row.status || "unknown"}`}
                      >
                        {row.status || "—"}
                      </span>
                    </td>
                    <td className="email-templates-admin__logs-detail">
                      {row.error ? (
                        <span className="is-error">{row.error}</span>
                      ) : row.providerId ? (
                        <span title="Resend id">{row.providerId}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
