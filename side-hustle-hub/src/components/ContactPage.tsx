import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { ADMIN_EMAIL, SITE_NAME } from "../lib/site-config";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api<{ ok: boolean }>("contact", {
        method: "POST",
        body: { name, email, message },
        auth: false,
      });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setSent(false);
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send your message. Please try again or email us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="static-page" data-testid="contact-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">Contact Us</span>
        <h2>Reach T + E</h2>
        <p>
          Questions about workshops, partnerships, or the {SITE_NAME} platform? Send a note — we read every
          message routed to our GYSH inbox.
        </p>
      </section>

      <div className="static-page-split">
        <div className="glass static-page-card">
          <div className="static-page-icon" style={{ background: "var(--grad-primary)" }}>
            <Mail size={20} color="var(--charcoal)" />
          </div>
          <h3>Email</h3>
          <p style={{ marginBottom: 12 }}>
            Prefer email? Write us directly:
          </p>
          <a href={`mailto:${ADMIN_EMAIL}`} className="contact-email-link">
            {ADMIN_EMAIL}
          </a>
          <p style={{ marginTop: 16, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Typical response within 2–3 business days.
          </p>
        </div>

        <form className="glass static-page-card contact-form" onSubmit={handleSubmit} data-testid="contact-form">
          <h3>Send a message</h3>
          {sent && (
            <p className="contact-sent-banner" role="status">
              Thanks — your message was sent to the GYSH inbox.
            </p>
          )}
          {error && (
            <p className="contact-sent-banner" role="alert" style={{ color: "var(--danger, #b42318)" }}>
              {error}
            </p>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="contact-name">Name</label>
            <input id="contact-name" className="text-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-email">Email</label>
            <input id="contact-email" type="email" className="text-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              className="text-input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ resize: "vertical", minHeight: 120 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <Send size={14} /> {submitting ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
