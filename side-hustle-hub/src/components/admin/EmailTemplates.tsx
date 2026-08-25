import { useCallback, useEffect, useRef, useState } from "react";
import { List, Mail, RefreshCw, RotateCcw, Save, Send } from "lucide-react";
import { BusyOverlay, WaitIndicator } from "../WaitFeedback";
import { api, ApiError } from "../../lib/api";
import { RichTextEmailEditor } from "./RichTextEmailEditor";

type TemplateContent = {
  subject: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote: string;
};

type TemplateRow = TemplateContent & {
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
  sendCount: number;
  dynamicBody?: boolean;
  updatedAt?: string;
  updatedBy?: string;
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

const EMPTY_DRAFT: TemplateContent = {
  subject: "",
  preheader: "",
  eyebrow: "",
  headline: "",
  subhead: "",
  bodyHtml: "",
  ctaLabel: "",
  ctaUrl: "",
  footerNote: "",
};

/** Sample values so the editor can show real copy instead of raw {{placeholders}}. */
const SAMPLE_VARS: Record<string, string> = {
  name: "Side Hustler",
  email: "sample@example.com",
  message:
    "Name: Side Hustler<br/>Email: sample@example.com<br/>This is sample form submission detail text.",
  ctaUrl: "https://getyoursidehustle.com/?preview=1",
  resetUrl: "https://getyoursidehustle.com/?reset=preview-token",
  consentUrl: "https://getyoursidehustle.com/?consent=preview-token",
  tier: "Free",
  perksHtml: "<ul><li>Open free launch guides</li><li>Run the Match Wizard</li></ul>",
  upgradesHtml: "",
  certHtml: "",
  childName: "Alex",
  audienceLabel: "Kids",
  periodKey: "2026-08-02",
  cadence: "Daily",
  digestBodyHtml: "<p>Sample digest rows appear here in live sends.</p>",
};

function fillSampleVars(input: string): string {
  return String(input || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    if (Object.prototype.hasOwnProperty.call(SAMPLE_VARS, key)) return SAMPLE_VARS[key] ?? "";
    return `{{${key}}}`;
  });
}

function contentFromRow(t: TemplateRow | undefined): TemplateContent {
  if (!t) return { ...EMPTY_DRAFT };
  return {
    subject: t.subject || "",
    preheader: t.preheader || "",
    eyebrow: t.eyebrow || "",
    headline: t.headline || "",
    subhead: t.subhead || "",
    bodyHtml: t.bodyHtml || "",
    ctaLabel: t.ctaLabel || "",
    ctaUrl: t.ctaUrl || "",
    footerNote: t.footerNote || "",
  };
}

function draftsEqual(a: TemplateContent, b: TemplateContent): boolean {
  return (
    a.subject === b.subject &&
    a.preheader === b.preheader &&
    a.eyebrow === b.eyebrow &&
    a.headline === b.headline &&
    a.subhead === b.subhead &&
    a.bodyHtml === b.bodyHtml &&
    a.ctaLabel === b.ctaLabel &&
    a.ctaUrl === b.ctaUrl &&
    a.footerNote === b.footerNote
  );
}

export function EmailTemplates({ focusSlug = null }: { focusSlug?: string | null }) {
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [draft, setDraft] = useState<TemplateContent>(EMPTY_DRAFT);
  const [savedSnapshot, setSavedSnapshot] = useState<TemplateContent>(EMPTY_DRAFT);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsBusy, setLogsBusy] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = draftReady && !draftsEqual(draft, savedSnapshot);
  const selectedRow = templates.find((t) => t.slug === selected);

  const applyRowToDraft = (row: TemplateRow | undefined) => {
    if (!row) {
      setDraftReady(false);
      return;
    }
    const content = contentFromRow(row);
    setDraft(content);
    setSavedSnapshot(content);
    setDraftReady(true);
  };

  const selectSlug = useCallback(
    (slug: string, list: TemplateRow[] = templates) => {
      if (!slug) return;
      setSelected(slug);
      setShowAllLogs(false);
      applyRowToDraft(list.find((t) => t.slug === slug));
    },
    [templates],
  );

  const load = async () => {
    setErr("");
    try {
      const data = await api<{
        emailConfigured: boolean;
        logoUrl: string;
        placeholders?: string[];
        templates: TemplateRow[];
      }>("email/templates");
      setEmailConfigured(data.emailConfigured);
      setLogoUrl(data.logoUrl || "");
      setPlaceholders(data.placeholders || []);
      const list = data.templates || [];
      setTemplates(list);
      const preferred =
        (focusSlug && list.some((t) => t.slug === focusSlug) ? focusSlug : "") ||
        selected ||
        list[0]?.slug ||
        "";
      if (preferred) {
        setSelected(preferred);
        applyRowToDraft(list.find((t) => t.slug === preferred));
      }
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not load email templates.");
    }
  };

  // Deep link / Testing Portal step → select that catalog template.
  useEffect(() => {
    if (!focusSlug || !templates.length) return;
    if (!templates.some((t) => t.slug === focusSlug)) return;
    if (selected === focusSlug) return;
    selectSlug(focusSlug);
  }, [focusSlug, templates, selected, selectSlug]);

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

  // When the selected template changes, reload draft from the list (once row exists).
  const lastHydratedSlug = useRef("");
  useEffect(() => {
    if (!selected) {
      lastHydratedSlug.current = "";
      setDraftReady(false);
      return;
    }
    const row = templates.find((t) => t.slug === selected);
    if (!row) {
      setDraftReady(false);
      return;
    }
    if (lastHydratedSlug.current === selected && draftReady) return;
    lastHydratedSlug.current = selected;
    applyRowToDraft(row);
    setMsg("");
    setErr("");
  }, [selected, templates, draftReady]);

  useEffect(() => {
    if (!selected || !draftReady) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreviewBusy(true);
    previewTimer.current = setTimeout(() => {
      void api<Preview>("email/preview", {
        method: "POST",
        body: { slug: selected, draft: dirty ? draft : undefined },
      })
        .then((p) => setPreview(p))
        .catch((e) => setErr(e instanceof ApiError ? e.message : "Preview failed."))
        .finally(() => setPreviewBusy(false));
    }, dirty ? 350 : 0);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [selected, draft, dirty, draftReady]);

  useEffect(() => {
    if (!selected && !showAllLogs) return;
    void loadLogs(selected, showAllLogs);
  }, [selected, showAllLogs, loadLogs]);

  const setField = <K extends keyof TemplateContent>(key: K, value: TemplateContent[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!selected) return;
    setMsg("");
    setErr("");
    setBusy(true);
    try {
      const data = await api<{
        ok: boolean;
        preview?: Omit<Preview, "slug"> & { slug?: string };
        content?: TemplateContent;
      }>("email/templates", {
        method: "PUT",
        body: { slug: selected, ...draft },
      });
      setMsg(`Saved ${selectedRow?.name || selected}.`);
      if (data.content) {
        setDraft(data.content);
        setSavedSnapshot(data.content);
      } else {
        setSavedSnapshot(draft);
      }
      if (data.preview) setPreview({ ...data.preview, slug: selected });
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  const resetToDefault = async () => {
    if (!selected) return;
    if (!window.confirm(`Reset “${selectedRow?.name || selected}” to the code default?`)) return;
    setMsg("");
    setErr("");
    setBusy(true);
    try {
      const data = await api<{
        ok: boolean;
        content?: TemplateContent;
        preview?: Omit<Preview, "slug"> & { slug?: string };
      }>("email/templates", {
        method: "PUT",
        body: { slug: selected, resetToDefault: true },
      });
      setMsg(`Reset ${selectedRow?.name || selected} to default.`);
      if (data.content) {
        setDraft(data.content);
        setSavedSnapshot(data.content);
      }
      if (data.preview) setPreview({ ...data.preview, slug: selected });
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Reset failed.");
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setMsg("");
    setErr("");
    setBusy(true);
    try {
      if (dirty) {
        await api("email/templates", { method: "PUT", body: { slug: selected, ...draft } });
        setSavedSnapshot(draft);
      }
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
            Edit subject and body for every template, preview with sample placeholders, save to D1, then
            send a Resend test. Live transactional emails use your saved content.
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
        {dirty ? (
          <span className="email-templates-admin__dirty" data-testid="email-template-dirty">
            Unsaved edits
          </span>
        ) : null}
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

      <div className="email-templates-admin__layout email-templates-admin__layout--edit">
        <aside className="email-templates-admin__list" aria-label="Templates">
          {templates.map((t) => (
            <button
              key={t.slug}
              type="button"
              className={`email-templates-admin__item${selected === t.slug && !showAllLogs ? " is-active" : ""}`}
              onClick={() => {
                if (dirty && selected !== t.slug) {
                  if (!window.confirm("Discard unsaved edits for this template?")) return;
                }
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

        <section className="email-templates-admin__editor glass" data-testid="email-template-editor">
          {selectedRow ? (
            <>
              <header className="email-templates-admin__editor-head">
                <div>
                  <h3>{selectedRow.name}</h3>
                  <p>{selectedRow.description}</p>
                  {selectedRow.updatedAt ? (
                    <p className="email-templates-admin__meta">
                      Last saved {new Date(selectedRow.updatedAt).toLocaleString()}
                      {selectedRow.updatedBy ? ` · ${selectedRow.updatedBy}` : ""}
                    </p>
                  ) : null}
                </div>
                <div className="email-templates-admin__editor-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    data-testid="email-template-reset"
                    disabled={busy}
                    onClick={() => void resetToDefault()}
                  >
                    <RotateCcw size={16} /> Reset to default
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-testid="email-template-save"
                    disabled={busy || !dirty}
                    onClick={() => void save()}
                  >
                    <Save size={16} /> Save template
                  </button>
                </div>
              </header>

              {placeholders.length ? (
                <p className="email-templates-admin__placeholders" data-testid="email-template-placeholders">
                  Placeholders: {placeholders.join(" · ")}
                </p>
              ) : null}

              {selectedRow.dynamicBody ? (
                <p className="email-templates-admin__note">
                  This template injects a live-generated body (digest / progress lists). Edit subject,
                  intro fields, and CTA; keep <code>{"{{digestBodyHtml}}"}</code> in the body where the
                  generated content should appear.
                </p>
              ) : null}

              <div className="email-templates-admin__fields">
                <label className="email-templates-admin__field-full">
                  Subject
                  <input
                    className="text-input"
                    data-testid="email-field-subject"
                    value={draft.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                  />
                </label>

                <div
                  className="email-templates-admin__field-full email-templates-admin__message-block"
                  data-testid="email-message-block"
                >
                  <h4 className="email-templates-admin__section-title">Email message (editable)</h4>
                  <p className="email-templates-admin__body-help">
                    This is the content recipients read: eyebrow, headline, subhead, and body. Use{" "}
                    <code>{"{{name}}"}</code>, <code>{"{{message}}"}</code>, etc. for live values.
                    The logo / Facebook / site links in the right preview are shared brand chrome — not
                    edited here.
                  </p>

                  <div
                    className="email-templates-admin__message-sample"
                    data-testid="email-message-sample"
                  >
                    <p className="email-templates-admin__message-sample-label">
                      Sample filled view (placeholders → example text)
                    </p>
                    <p className="email-templates-admin__message-eyebrow">
                      {fillSampleVars(draft.eyebrow) || "—"}
                    </p>
                    <h5 className="email-templates-admin__message-headline">
                      {fillSampleVars(draft.headline) || "Headline"}
                    </h5>
                    <p className="email-templates-admin__message-subhead">
                      {fillSampleVars(draft.subhead)}
                    </p>
                    <div
                      className="email-templates-admin__message-body"
                      dangerouslySetInnerHTML={{
                        __html: fillSampleVars(draft.bodyHtml) || "<p><em>No body yet.</em></p>",
                      }}
                    />
                    {draft.ctaLabel ? (
                      <p className="email-templates-admin__message-cta">
                        Button: {fillSampleVars(draft.ctaLabel)}
                      </p>
                    ) : null}
                  </div>

                  <label>
                    Eyebrow (small label above headline)
                    <input
                      className="text-input"
                      data-testid="email-field-eyebrow"
                      value={draft.eyebrow}
                      onChange={(e) => setField("eyebrow", e.target.value)}
                    />
                  </label>
                  <label>
                    Headline
                    <input
                      className="text-input"
                      data-testid="email-field-headline"
                      value={draft.headline}
                      onChange={(e) => setField("headline", e.target.value)}
                    />
                  </label>
                  <label className="email-templates-admin__field-full">
                    Subhead
                    <input
                      className="text-input"
                      data-testid="email-field-subhead"
                      value={draft.subhead}
                      onChange={(e) => setField("subhead", e.target.value)}
                    />
                  </label>

                  <div className="email-templates-admin__field-full email-templates-admin__body-field">
                    <span className="email-templates-admin__field-label">Body HTML</span>
                    <p className="email-templates-admin__body-help">
                      Edit paragraphs, lists, links, and formatting here. Keep placeholders like{" "}
                      <code>{"{{message}}"}</code> where live data should inject.
                    </p>
                    {draftReady ? (
                      <RichTextEmailEditor
                        key={`email-body-${selected}-${savedSnapshot.bodyHtml.slice(0, 40)}`}
                        value={draft.bodyHtml}
                        onChange={(html) => setField("bodyHtml", html)}
                        disabled={busy}
                        testId="email-field-body"
                        placeholder="Write the email body…"
                        allowSource
                        minHeight={300}
                      />
                    ) : (
                      <WaitIndicator message="Loading body…" style={{ marginTop: 0 }} />
                    )}
                  </div>
                </div>

                <h4 className="email-templates-admin__section-title email-templates-admin__field-full">
                  Chrome &amp; CTA
                </h4>
                <label>
                  Preheader
                  <input
                    className="text-input"
                    data-testid="email-field-preheader"
                    value={draft.preheader}
                    onChange={(e) => setField("preheader", e.target.value)}
                  />
                </label>
                <label>
                  CTA label
                  <input
                    className="text-input"
                    data-testid="email-field-cta-label"
                    value={draft.ctaLabel}
                    onChange={(e) => setField("ctaLabel", e.target.value)}
                  />
                </label>
                <label>
                  CTA URL
                  <input
                    className="text-input"
                    data-testid="email-field-cta-url"
                    value={draft.ctaUrl}
                    onChange={(e) => setField("ctaUrl", e.target.value)}
                  />
                </label>
                <label className="email-templates-admin__field-full">
                  Footer note (above brand chrome)
                  <input
                    className="text-input"
                    data-testid="email-field-footer"
                    value={draft.footerNote}
                    onChange={(e) => setField("footerNote", e.target.value)}
                  />
                </label>
              </div>
            </>
          ) : (
            <p>Select a template to edit.</p>
          )}
        </section>

        <section className="email-templates-admin__preview glass">
          {preview ? (
            <>
              <p className="email-templates-admin__subject">
                <strong>Full email preview:</strong> {preview.subject}
                {previewBusy ? " · updating…" : ""}
              </p>
              <p className="email-templates-admin__preview-note">
                Scroll the preview — message content is near the top. Logo, Facebook button, and site
                links at the bottom are shared brand chrome on every GYSH email.
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
          ) : previewBusy || busy ? (
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
