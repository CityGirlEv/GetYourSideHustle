import React, { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import {
  CONTACT_INBOX_EMAIL,
  buildContactMailto,
  validateContactForm,
  type ContactFormValues,
} from '../lib/contactForm';
import { sendContactFormEmail } from '../lib/email/notifications';

const fieldClass =
  'w-full min-h-[44px] rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] px-3 text-sm font-medium text-[#1F1917]';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<ContactFormValues | null>(null);
  const [mailtoFallback, setMailtoFallback] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = validateContactForm({ name, email, subject, message });
    if (!result.ok) {
      setSuccess(null);
      setMailtoFallback(false);
      setError(result.error);
      return;
    }

    setError('');
    setSending(true);
    const sent = await sendContactFormEmail(result.values);
    setSending(false);

    if (!sent.ok) {
      setSuccess(result.values);
      setMailtoFallback(true);
      setError(sent.error || 'Could not send your note.');
      return;
    }

    setMailtoFallback(false);
    setSuccess(result.values);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div
      className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-4 w-full max-w-lg"
      data-testid="contact-form-card"
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] border border-[#C2410C]/30 text-[10px] font-mono font-black uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" /> Write us
        </div>
        <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917]">Send a note</h2>
        <p className="text-sm text-[#3F3832] font-medium leading-relaxed">
          Brand and website questions come here. Order, size, and shipping stay with the shop.
        </p>
      </div>

      {success && !mailtoFallback ? (
        <div
          className="text-sm font-semibold text-[#166534] bg-[#DCFCE7] border border-[#166534]/20 rounded-2xl px-4 py-3"
          data-testid="contact-form-success"
          role="status"
        >
          <p className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            We received your note. We will reply at {success.email}.
          </p>
        </div>
      ) : null}

      {success && mailtoFallback ? (
        <div
          className="text-sm font-semibold text-[#9A3412] bg-[#FFEDD5] border border-[#C2410C]/30 rounded-2xl px-4 py-3 space-y-3"
          data-testid="contact-form-fallback"
          role="status"
        >
          <p>{error || 'The site could not send your note from here.'} Open your email app to send it to {CONTACT_INBOX_EMAIL}.</p>
          <a
            href={buildContactMailto(success)}
            className="inline-flex min-h-[44px] items-center px-5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-black uppercase tracking-wider"
            data-testid="contact-form-mailto"
          >
            Open email app
          </a>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3" data-testid="contact-form" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">Name</span>
          <input
            type="text"
            name="contact-name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
            data-testid="contact-name"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">Email</span>
          <input
            type="email"
            name="contact-email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            data-testid="contact-email"
          />
        </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">Subject</span>
          <input
            type="text"
            name="contact-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className={fieldClass}
            data-testid="contact-subject"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">Message</span>
          <textarea
            name="contact-message"
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className={`${fieldClass} min-h-[120px] py-3`}
            data-testid="contact-message"
          />
        </label>
        {error && !mailtoFallback ? (
          <p className="text-sm font-semibold text-[#9A3412]" data-testid="contact-form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={sending}
          className="min-h-[44px] w-full sm:w-auto px-5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
          data-testid="contact-form-submit"
        >
          {sending ? 'Sending…' : 'Submit'}
        </button>
      </form>
    </div>
  );
};
