import { useEffect, useState } from "react";
import { Mail, RefreshCw, Send } from "lucide-react";
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
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Test send failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="email-templates-admin" data-testid="email-templates-admin">
      <header className="email-templates-admin__head">
        <div>
          <h2>
            <Mail size={20} aria-hidden /> Email templates
          </h2>
          <p>
            Every template uses the GYSH logo header plus website / Facebook footer. Preview here, then send a
            test through Resend.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => void load()} disabled={busy}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="email-templates-admin__status" role="status">
        <span>
          Resend:{" "}
          <strong data-testid="email-configured-status">
            {emailConfigured == null ? "…" : emailConfigured ? "configured" : "missing"}
          </strong>
        </span>
        {logoUrl ? (
          <span className="email-templates-admin__logo-chip">
            Logo: <a href={logoUrl} target="_blank" rel="noreferrer">/brand/gysh-logo-rocket.png</a>
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
              className={`email-templates-admin__item${selected === t.slug ? " is-active" : ""}`}
              onClick={() => setSelected(t.slug)}
            >
              <strong>{t.name}</strong>
              <span>{t.description}</span>
              <em>{t.sendCount} logged sends</em>
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
          ) : (
            <p>{busy ? "Loading preview…" : "Select a template."}</p>
          )}
        </section>
      </div>
    </div>
  );
}
