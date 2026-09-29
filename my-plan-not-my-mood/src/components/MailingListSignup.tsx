import React, { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import {
  JOIN_THE_MOVEMENT_LABEL,
  MAILING_LIST_HYPE,
  MAILING_LIST_NOT_MEMBERSHIP_NOTE,
  subscribeToMailingList,
} from '../lib/mailingList';
import { HearAboutUsField } from './HearAboutUsField';

interface MailingListSignupProps {
  heading?: string;
  compact?: boolean;
}

const fieldClass =
  'w-full min-h-[44px] rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] px-3 text-sm font-medium text-[#1F1917]';

export const MailingListSignup: React.FC<MailingListSignupProps> = ({
  heading = JOIN_THE_MOVEMENT_LABEL,
  compact = false,
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [heardAbout, setHeardAbout] = useState('');
  const [error, setError] = useState('');
  const [successEmail, setSuccessEmail] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = subscribeToMailingList({ email, firstName, lastName, phone, heardAbout });
    if (!result.ok) {
      setSuccessEmail('');
      setError(result.error);
      return;
    }
    setError('');
    setSuccessEmail(result.signup.email);
    setEmail('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setHeardAbout('');
  };

  return (
    <div
      id="mailing-list"
      data-testid="mailing-list-signup"
      className={`bg-white border-2 border-[#1F1917] rounded-3xl ${compact ? 'p-5' : 'p-6 sm:p-8'} space-y-4`}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] border border-[#C2410C]/30 text-[10px] font-mono font-black uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" /> {JOIN_THE_MOVEMENT_LABEL}
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-tight text-[#1F1917]">
          {heading}
        </h2>
        <p className="text-base sm:text-lg font-semibold leading-relaxed text-[#C2410C]" data-testid="mailing-list-hype">
          {MAILING_LIST_HYPE}
        </p>
        <p className="text-sm text-[#3F3832] font-medium leading-relaxed" data-testid="mailing-list-not-membership">
          {MAILING_LIST_NOT_MEMBERSHIP_NOTE}
        </p>
      </div>

      {successEmail ? (
        <p
          className="flex items-start gap-2 text-sm font-semibold text-[#166534] bg-[#DCFCE7] border border-[#166534]/20 rounded-2xl px-4 py-3"
          data-testid="mailing-list-success"
          role="status"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          You are on the list as {successEmail}. This did not create a membership.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3" data-testid="mailing-list-form" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">First name (optional)</span>
            <input
              type="text"
              name="mailing-list-first-name"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={fieldClass}
              data-testid="mailing-list-first-name"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">Last name (optional)</span>
            <input
              type="text"
              name="mailing-list-last-name"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={fieldClass}
              data-testid="mailing-list-last-name"
            />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">Email</span>
          <input
            type="email"
            name="mailing-list-email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            data-testid="mailing-list-email"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">Phone (optional)</span>
          <input
            type="tel"
            name="mailing-list-phone"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
            data-testid="mailing-list-phone"
            aria-describedby="mailing-list-phone-hint"
          />
          <span id="mailing-list-phone-hint" className="block text-xs text-[#6B5344]">
            Optional. US number only if you want a text or call about drops.
          </span>
        </label>
        <HearAboutUsField
          id="mailing-list-heard-about"
          name="mailing-list-heard-about"
          value={heardAbout}
          onChange={setHeardAbout}
          testId="mailing-list-heard-about"
        />
        {error ? (
          <p className="text-sm font-semibold text-[#9A3412]" data-testid="mailing-list-error" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="min-h-[44px] w-full sm:w-auto px-5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
          data-testid="mailing-list-submit"
        >
          {JOIN_THE_MOVEMENT_LABEL}
        </button>
      </form>
    </div>
  );
};
