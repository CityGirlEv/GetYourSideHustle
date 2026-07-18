import { useEffect, useState } from "react";
import { Award, Download, RefreshCw, Save } from "lucide-react";
import { api, ApiError, getSessionToken } from "../../lib/api";

type Template = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  signoff: string;
  footerLine: string;
  updatedAt: string;
  updatedBy: string;
};

type CertRow = {
  id: string;
  userId: string;
  memberName: string;
  memberEmail: string;
  membershipTier: string;
  audience: string;
  issuedAt: string;
  title: string;
  bodyText: string;
  emailSentAt: string | null;
  previewUrl: string;
  downloadUrl: string;
};

export function CertificatesAdmin() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [previewSvg, setPreviewSvg] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const data = await api<{ template: Template; certificates: CertRow[] }>("certificates");
      setTemplate(data.template);
      setCerts(data.certificates || []);
      if (!selectedId && data.certificates?.[0]) setSelectedId(data.certificates[0].id);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not load certificates.");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setPreviewSvg("");
      return;
    }
    let cancelled = false;
    const token = getSessionToken();
    void fetch(`/api/certificates/${selectedId}/svg`, {
      credentials: "include",
      headers: token ? { authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.text();
      })
      .then((svg) => {
        if (!cancelled) setPreviewSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setPreviewSvg("");
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const saveTemplate = async (regenerateAll: boolean) => {
    if (!template) return;
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const data = await api<{ ok: boolean; message?: string; template: Template }>(
        "certificates/template",
        {
          method: "PUT",
          body: {
            title: template.title,
            subtitle: template.subtitle,
            body: template.body,
            signoff: template.signoff,
            footerLine: template.footerLine,
            regenerateAll,
          },
        },
      );
      setTemplate(data.template);
      setMsg(data.message || "Template saved.");
      await load();
      if (selectedId) setSelectedId(selectedId);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  const regenerateOne = async (id: string) => {
    setBusy(true);
    setErr("");
    try {
      await api(`certificates/${id}/regenerate`, { method: "POST", body: {} });
      setMsg("Certificate regenerated.");
      setSelectedId(id);
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Regenerate failed.");
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = (id: string) => {
    const token = getSessionToken();
    const url = `/api/certificates/${id}/pdf`;
    void fetch(url, {
      credentials: "include",
      headers: token ? { authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Download failed");
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `GYSH-Family-Certificate-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => setErr("PDF download failed."));
  };

  return (
    <div className="certificates-admin" data-testid="certificates-admin">
      <header className="certificates-admin__head">
        <div>
          <h2>
            <Award size={20} aria-hidden /> GYSH Family Certificates
          </h2>
          <p>
            Every member gets a Welcome to the GYSH Family certificate (PDF + SVG) attached to their
            membership emails. Edit the wording below, then regenerate as needed.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => void load()} disabled={busy}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {err ? <div className="consent-alert is-error">{err}</div> : null}
      {msg ? <div className="consent-alert is-ok">{msg}</div> : null}

      {template ? (
        <section className="glass certificates-admin__template" aria-label="Certificate template">
          <h3>Certificate template</h3>
          <p className="certificates-admin__hint">
            Use placeholders: <code>{"{{name}}"}</code>, <code>{"{{date}}"}</code>,{" "}
            <code>{"{{tier}}"}</code>, <code>{"{{audience}}"}</code>
          </p>
          <div className="certificates-admin__fields">
            <label>
              Title
              <input
                className="text-input"
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
              />
            </label>
            <label>
              Subtitle
              <input
                className="text-input"
                value={template.subtitle}
                onChange={(e) => setTemplate({ ...template, subtitle: e.target.value })}
              />
            </label>
            <label className="certificates-admin__full">
              Body
              <textarea
                className="text-input"
                rows={3}
                value={template.body}
                onChange={(e) => setTemplate({ ...template, body: e.target.value })}
              />
            </label>
            <label>
              Sign-off
              <input
                className="text-input"
                value={template.signoff}
                onChange={(e) => setTemplate({ ...template, signoff: e.target.value })}
              />
            </label>
            <label>
              Footer line
              <input
                className="text-input"
                value={template.footerLine}
                onChange={(e) => setTemplate({ ...template, footerLine: e.target.value })}
              />
            </label>
          </div>
          <div className="certificates-admin__actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => void saveTemplate(false)}
            >
              <Save size={16} /> Save template
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy}
              onClick={() => void saveTemplate(true)}
            >
              Save &amp; regenerate all
            </button>
          </div>
          <p className="certificates-admin__meta">
            Last updated {template.updatedAt ? new Date(template.updatedAt).toLocaleString() : "—"}
            {template.updatedBy ? ` · ${template.updatedBy}` : ""}
          </p>
        </section>
      ) : null}

      <div className="certificates-admin__layout">
        <aside className="certificates-admin__list" aria-label="Generated certificates">
          <h3>Generated ({certs.length})</h3>
          {certs.length === 0 ? (
            <p className="certificates-admin__empty">
              No certificates yet. They appear when members register or are activated.
            </p>
          ) : (
            certs.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`certificates-admin__item${selectedId === c.id ? " is-active" : ""}`}
                onClick={() => setSelectedId(c.id)}
              >
                <strong>{c.memberName}</strong>
                <span>{c.memberEmail}</span>
                <em>
                  {c.membershipTier} · {c.audience} ·{" "}
                  {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : ""}
                  {c.emailSentAt ? " · emailed" : ""}
                </em>
              </button>
            ))
          )}
        </aside>

        <section className="certificates-admin__preview glass">
          {selectedId ? (
            <>
              <div className="certificates-admin__preview-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={busy}
                  onClick={() => void regenerateOne(selectedId)}
                >
                  <RefreshCw size={16} /> Regenerate
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => downloadPdf(selectedId)}
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
              {previewSvg ? (
                <div
                  className="certificates-admin__svg"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              ) : (
                <p>Loading preview…</p>
              )}
            </>
          ) : (
            <p>Select a certificate to preview.</p>
          )}
        </section>
      </div>
    </div>
  );
}
