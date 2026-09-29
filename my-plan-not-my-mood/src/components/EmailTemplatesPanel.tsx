import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Mail, Plus, Save, Trash2, RotateCcw, AlertCircle, CheckCircle2, Send, FlaskConical } from 'lucide-react';
import type { UserOrRoleInput } from '../lib/userAuth';
import { getAppUsers } from '../lib/userAuth';
import {
  deleteEmailTemplate,
  getEmailTemplate,
  getEmailTemplates,
  resetEmailTemplate,
  upsertEmailTemplate,
  type ManagedEmailTemplate,
} from '../lib/email/templateStore';
import {
  applyEmailPreviewPlaceholders,
  emailVarsForRecipient,
  renderEmailPreviewHtml,
  renderManagedEmail,
} from '../lib/email/previewTemplate';
import {
  DEFAULT_FROM_EMAIL,
  SIGNUP_CONFIRMATION_TEMPLATE_ID,
  BETA_TESTER_CONFIRMATION_TEMPLATE_ID,
  isValidEmail,
} from '../lib/email/sendPayload';
import {
  getEmailSendSettings,
  updateEmailSendSettings,
} from '../lib/email/sendSettings';
import { sendSignupConfirmationEmail, sendTestEmail } from '../lib/email/notifications';
import {
  emailSendLogDetailFromResult,
  emailSendLogForTemplate,
  emailSendLogStatusFromResult,
  emailSendLogStatusLabel,
  fetchEmailSendLog,
  fetchEmailSendLogHtml,
  formatEmailSendLogWhen,
  readEmailSendLog,
  recordEmailSendLog,
  type EmailSendLogEntry,
} from '../lib/email/sendLog';

interface EmailTemplatesPanelProps {
  actor?: UserOrRoleInput & { name?: string; email?: string };
}

function actorEmail(actor?: EmailTemplatesPanelProps['actor']): string {
  return actor && typeof actor === 'object' && typeof actor.email === 'string' ? actor.email : '';
}

function actorName(actor?: EmailTemplatesPanelProps['actor']): string {
  return actor && typeof actor === 'object' && typeof actor.name === 'string' ? actor.name : 'Admin';
}

export const EmailTemplatesPanel: React.FC<EmailTemplatesPanelProps> = ({ actor }) => {
  const [templates, setTemplates] = useState<ManagedEmailTemplate[]>(() => getEmailTemplates());
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id || '');
  const [name, setName] = useState(templates[0]?.name || '');
  const [subject, setSubject] = useState(templates[0]?.subject || '');
  const [html, setHtml] = useState(templates[0]?.html || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [autoSendSignupConfirmation, setAutoSendSignupConfirmation] = useState(
    () => getEmailSendSettings().autoSendSignupConfirmation,
  );
  const [testTo, setTestTo] = useState(() => actorEmail(actor));
  const [testBusy, setTestBusy] = useState(false);
  const [confirmUserId, setConfirmUserId] = useState('');
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [sendLog, setSendLog] = useState<EmailSendLogEntry[]>(() => readEmailSendLog());
  const [logFilter, setLogFilter] = useState<'all' | 'template'>('all');
  const [expandedLogId, setExpandedLogId] = useState('');
  const users = getAppUsers();

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || null,
    [templates, selectedId],
  );

  const previewSubject = useMemo(() => applyEmailPreviewPlaceholders(subject), [subject]);
  const previewHtml = useMemo(() => renderEmailPreviewHtml(html), [html]);
  const confirmationTemplate = getEmailTemplate(SIGNUP_CONFIRMATION_TEMPLATE_ID);
  const templateLog = emailSendLogForTemplate(sendLog, selectedId);
  const displayedLog = logFilter === 'template' ? templateLog : sendLog;

  useEffect(() => {
    let cancelled = false;
    void fetchEmailSendLog().then((entries) => {
      if (!cancelled) setSendLog(entries);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSendLog = async () => {
    setSendLog(await fetchEmailSendLog());
  };

  const handleExpandLog = async (row: EmailSendLogEntry) => {
    const next = expandedLogId === row.id ? '' : row.id;
    setExpandedLogId(next);
    if (!next || row.html) return;
    const html = await fetchEmailSendLogHtml(row.id);
    if (!html) return;
    setSendLog((current) => current.map((entry) => (entry.id === row.id ? { ...entry, html } : entry)));
  };

  const loadTemplate = (tpl: ManagedEmailTemplate) => {
    setSelectedId(tpl.id);
    setName(tpl.name);
    setSubject(tpl.subject);
    setHtml(tpl.html);
    setError('');
    setSuccess('');
    setShowPreview(true);
  };

  const refresh = (nextId?: string) => {
    const next = getEmailTemplates();
    setTemplates(next);
    const target = next.find((t) => t.id === nextId) || next[0];
    if (target) loadTemplate(target);
  };

  const handleNew = () => {
    setSelectedId('');
    setName('');
    setSubject('');
    setHtml('<p>Hello {{name}},</p>\n<p>Write your email here.</p>');
    setError('');
    setSuccess('');
    setShowPreview(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = upsertEmailTemplate(
      { id: selectedId || undefined, name, subject, html },
      actor,
    );
    if (!res.success || !res.template) {
      setError(res.error || 'Could not save template.');
      return;
    }
    setSuccess(selectedId ? 'Template updated.' : 'Template created.');
    refresh(res.template.id);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    if (!confirm('Delete this email template? This cannot be undone.')) return;
    const res = deleteEmailTemplate(selectedId, actor);
    if (!res.success) {
      setError(res.error || 'Could not delete template.');
      return;
    }
    setSuccess('Template deleted.');
    refresh();
  };

  const handleReset = () => {
    if (!selectedId) return;
    const res = resetEmailTemplate(selectedId, actor);
    if (!res.success || !res.template) {
      setError(res.error || 'Could not reset template.');
      return;
    }
    setSuccess('System template reset to default.');
    refresh(res.template.id);
  };

  const handleAutoSendToggle = (checked: boolean) => {
    const res = updateEmailSendSettings({ autoSendSignupConfirmation: checked }, actor);
    if (!res.success || !res.settings) {
      setError(res.error || 'Could not update send settings.');
      return;
    }
    setAutoSendSignupConfirmation(res.settings.autoSendSignupConfirmation);
    setSuccess(
      res.settings.autoSendSignupConfirmation
        ? 'Signup confirmation will send automatically after new signups.'
        : 'Signup confirmation will not send until you turn this on or send it yourself.',
    );
  };

  const handleTestSend = async (
    e?: React.FormEvent | React.MouseEvent,
    template?: { id?: string; name?: string; subject: string; html: string },
  ) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    if (!isValidEmail(testTo)) {
      setError('Enter a valid test recipient email in Test send this template.');
      return;
    }
    const rendered = renderManagedEmail(
      template ?? { subject, html },
      emailVarsForRecipient({
        name: actorName(actor),
        email: testTo.trim(),
        wantsBeta: true,
      }),
    );
    const templateId = template?.id || selectedId || 'unsaved';
    const templateName = template?.name || name || 'Untitled template';
    setTestBusy(true);
    const result = await sendTestEmail({
      to: testTo.trim(),
      subject: rendered.subject,
      html: rendered.html,
      templateId,
      templateName,
    });
    setTestBusy(false);
    recordEmailSendLog({
      templateId,
      templateName,
      to: testTo.trim(),
      subject: rendered.subject,
      status: emailSendLogStatusFromResult(result),
      detail: emailSendLogDetailFromResult(result),
      test: true,
      html: rendered.html,
    });
    await refreshSendLog();
    if (!result.ok) {
      setError(result.error || 'Test email failed.');
      return;
    }
    setSuccess(
      result.skipped
        ? 'Resend is not configured on the API (503). Add RESEND_API_KEY to Cloudflare or .dev.vars for local dev:api.'
        : `Test email sent to ${testTo.trim()}. Subject is prefixed with [TEST].`,
    );
  };

  const handleSendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const user = users.find((u) => u.id === confirmUserId);
    if (!user) {
      setError('Pick a person from the user list first.');
      return;
    }
    setConfirmBusy(true);
    const result = await sendSignupConfirmationEmail(user);
    setConfirmBusy(false);
    const confirmationId = user.wantsBeta ? BETA_TESTER_CONFIRMATION_TEMPLATE_ID : SIGNUP_CONFIRMATION_TEMPLATE_ID;
    const confirmationName = user.wantsBeta
      ? getEmailTemplate(BETA_TESTER_CONFIRMATION_TEMPLATE_ID)?.name || 'Beta Tester confirmation'
      : confirmationTemplate?.name || 'Signup confirmation';
    recordEmailSendLog({
      templateId: confirmationId,
      templateName: confirmationName,
      to: user.email,
      subject: user.wantsBeta ? 'Stand by, Beta Tester — your assignments are coming' : 'Signup confirmation',
      status: emailSendLogStatusFromResult(result),
      detail: emailSendLogDetailFromResult(result),
      test: false,
    });
    await refreshSendLog();
    if (!result.ok) {
      setError(result.error || 'Could not send confirmation.');
      return;
    }
    setSuccess(
      result.skipped
        ? `Confirmation prepared for ${user.email}, but Resend is not configured on the API. Set RESEND_API_KEY in Cloudflare or .dev.vars.`
        : `Signup confirmation sent to ${user.name} (${user.email}).`,
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="email-templates-panel">
      <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 sm:p-8 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" /> Emails
        </div>
        <h3 className="text-2xl font-black text-[#1F1917] uppercase tracking-tight font-serif">
          Manage and test emails
        </h3>
        <p className="text-xs text-[#3F3832] font-medium">
          From address: <span className="font-mono font-bold text-[#1F1917]">{DEFAULT_FROM_EMAIL}</span>.
          Signup confirmation is ready, but it stays off until you turn auto-send on or send it yourself.
          Local preview does not send. Dev sends use the proxied `/api` (production by default, or local Wrangler with `VITE_API_PROXY`).
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      <section
        className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 shadow-xl space-y-4"
        data-testid="email-send-settings"
      >
        <h4 className="text-sm font-black uppercase tracking-tight text-[#1F1917]">Send settings</h4>
        <label className="flex items-start gap-3 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            checked={autoSendSignupConfirmation}
            onChange={(e) => handleAutoSendToggle(e.target.checked)}
            className="mt-1 w-5 h-5 accent-[#C2410C] cursor-pointer"
            data-testid="email-auto-confirm-toggle"
          />
          <span className="text-xs font-medium text-[#3F3832]">
            <span className="font-black text-[#1F1917] uppercase">Automatically send signup confirmation</span>
            <span className="block mt-1">
              Off by default. When you are ready, turn this on so testers and anyone who signs up get the confirmation email.
              Until then, use Test send or Send confirmation below.
            </span>
          </span>
        </label>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleTestSend}
          className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 shadow-xl space-y-3"
          data-testid="email-test-send"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" /> Test send
          </div>
          <p className="text-xs text-[#3F3832] font-medium">
            Sends the template currently open in the editor to one inbox, with <span className="font-mono">[TEST]</span> on the subject.
          </p>
          <label className="block text-xs font-mono font-bold text-[#1F1917]" htmlFor="email-test-to">
            Send test to
          </label>
          <input
            id="email-test-to"
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            className="w-full min-h-[44px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
            placeholder="you@example.com"
            data-testid="email-test-to"
            required
          />
          <button
            type="submit"
            disabled={testBusy}
            className="min-h-[44px] px-4 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-black text-xs uppercase rounded-xl border border-[#1F1917] flex items-center gap-1.5 cursor-pointer"
            data-testid="email-test-submit"
          >
            <Send className="w-4 h-4" /> {testBusy ? 'Sending…' : 'Send test'}
          </button>
        </form>

        <form
          onSubmit={handleSendConfirmation}
          className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 shadow-xl space-y-3"
          data-testid="email-send-confirmation"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider">
            <Send className="w-3.5 h-3.5" /> Send confirmation
          </div>
          <p className="text-xs text-[#3F3832] font-medium">
            Trigger the signup confirmation for one person now. Does not wait for the auto-send toggle.
            {confirmationTemplate ? '' : ' Save the signup confirmation template first.'}
          </p>
          <label className="block text-xs font-mono font-bold text-[#1F1917]" htmlFor="email-confirm-user">
            Person
          </label>
          <select
            id="email-confirm-user"
            value={confirmUserId}
            onChange={(e) => setConfirmUserId(e.target.value)}
            className="w-full min-h-[44px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
            data-testid="email-confirm-user"
          >
            <option value="">Select a user…</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} · {user.email} · {user.status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={confirmBusy}
            className="min-h-[44px] px-4 py-2.5 bg-white text-[#1F1917] font-black text-xs uppercase rounded-xl border-2 border-[#1F1917] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            data-testid="email-confirm-submit"
          >
            <Send className="w-4 h-4" /> {confirmBusy ? 'Sending…' : 'Send confirmation now'}
          </button>
        </form>
      </div>

      <section
        className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 shadow-xl space-y-3"
        data-testid="email-send-log"
        aria-label="Email send log"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight text-[#1F1917]">Send log</h4>
            <p className="text-xs text-[#3F3832] font-medium mt-1">
              Live sends from this site, including tests. Shared across browsers after deploy.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLogFilter('all')}
              className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase cursor-pointer ${
                logFilter === 'all'
                  ? 'bg-[#C2410C] text-white border-[#1F1917]'
                  : 'bg-white text-[#1F1917] border-[#1F1917]'
              }`}
              data-testid="email-send-log-filter-all"
            >
              All ({sendLog.length})
            </button>
            <button
              type="button"
              onClick={() => setLogFilter('template')}
              disabled={!selectedId}
              className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase cursor-pointer disabled:opacity-50 ${
                logFilter === 'template'
                  ? 'bg-[#C2410C] text-white border-[#1F1917]'
                  : 'bg-white text-[#1F1917] border-[#1F1917]'
              }`}
              data-testid="email-send-log-filter-template"
            >
              This template ({templateLog.length})
            </button>
          </div>
        </div>
        {displayedLog.length === 0 ? (
          <p className="text-xs text-[#3F3832] font-medium" data-testid="email-send-log-empty">
            {logFilter === 'template'
              ? 'No sends yet for this template. Open it and click Send test.'
              : 'No sent emails yet. Click Send test on a template, or wait for a live send to appear here.'}
          </p>
        ) : (
          <ul className="space-y-2" data-testid="email-send-log-list">
            {displayedLog.map((row) => (
              <li
                key={row.id}
                data-testid={`email-send-log-row-${row.id}`}
                className="rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-black uppercase text-[#C2410C]">
                    {emailSendLogStatusLabel(row.status)}
                    {row.test ? ' · Test' : ''}
                    {row.templateName ? ` · ${row.templateName}` : row.templateId ? ` · ${row.templateId}` : ''}
                  </span>
                  <time className="text-[10px] font-mono text-[#3F3832]" dateTime={row.createdAt}>
                    {formatEmailSendLogWhen(row.createdAt)}
                  </time>
                </div>
                <div className="text-xs font-bold text-[#1F1917] mt-1 break-all">{row.to}</div>
                <div className="text-[11px] font-medium text-[#3F3832] mt-0.5">{row.subject}</div>
                {row.detail ? (
                  <div className="text-[10px] font-mono text-[#6B3A2C] mt-1">{row.detail}</div>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleExpandLog(row)}
                  className="mt-2 min-h-[44px] px-3 py-2 rounded-xl border-2 border-[#1F1917] bg-white text-[10px] font-black uppercase cursor-pointer"
                  data-testid={`email-send-log-view-${row.id}`}
                >
                  {expandedLogId === row.id ? 'Hide email' : 'View email'}
                </button>
                {expandedLogId === row.id ? (
                  row.html ? (
                    <iframe
                      title={`Sent email ${row.subject}`}
                      srcDoc={row.html}
                      sandbox=""
                      className="mt-2 w-full min-h-[240px] rounded-xl border-2 border-[#1F1917] bg-white"
                    />
                  ) : (
                    <p className="mt-2 text-xs text-[#3F3832] font-medium">Email body is not stored for this row.</p>
                  )
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 bg-white border-2 border-[#1F1917] rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-mono font-black uppercase text-[#1F1917]">Email list</h4>
            <button
              type="button"
              onClick={handleNew}
              className="min-h-[44px] px-2.5 py-1.5 bg-[#C2410C] text-white text-[10px] font-black uppercase rounded-lg border border-[#1F1917] flex items-center gap-1 cursor-pointer"
              data-testid="email-template-new"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          <ul className="space-y-1.5" data-testid="email-template-list">
            {templates.map((tpl) => {
              const logged = emailSendLogForTemplate(sendLog, tpl.id).length;
              return (
              <li key={tpl.id}>
                <button
                  type="button"
                  onClick={() => loadTemplate(tpl)}
                  className={`w-full min-h-[44px] text-left px-3 py-2.5 rounded-xl border cursor-pointer ${
                    selectedId === tpl.id
                      ? 'bg-[#FFEDD5] border-[#C2410C] text-[#1F1917]'
                      : 'bg-[#FAF8F5] border-[#E5DFD3] text-[#3F3832] hover:border-[#C2410C]'
                  }`}
                >
                  <div className="text-xs font-black">{tpl.name}</div>
                  <div className="text-[11px] font-medium text-[#1F1917] mt-0.5 truncate">{tpl.subject}</div>
                  <div className="text-[10px] font-mono uppercase mt-1">
                    {tpl.isSystem ? 'System' : 'Custom'}
                    {logged > 0 ? ` · ${logged} logged` : ''}
                  </div>
                </button>
              </li>
              );
            })}
          </ul>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Template name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full min-h-[44px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">HTML body</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={10}
                className="w-full bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-mono focus:border-[#C2410C] focus:outline-none"
                required
              />
            </div>

            <div className="rounded-2xl border-2 border-[#C2410C] bg-[#FFEDD5] p-4 space-y-3" data-testid="email-template-test-box">
              <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
                Test send this template
              </div>
              <label className="block text-xs font-mono font-bold text-[#1F1917]" htmlFor="email-template-test-to">
                Send test to
              </label>
              <input
                id="email-template-test-to"
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                className="w-full min-h-[44px] bg-white border-2 border-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none"
                placeholder="you@example.com"
                data-testid="email-template-test-to"
              />
              <button
                type="button"
                onClick={(event) => void handleTestSend(event)}
                disabled={testBusy}
                className="min-h-[44px] px-4 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-black text-xs uppercase rounded-xl border border-[#1F1917] flex items-center gap-1.5 cursor-pointer"
                data-testid="email-template-test-submit"
              >
                <Send className="w-4 h-4" /> {testBusy ? 'Sending…' : 'Send test'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase rounded-xl border border-[#1F1917] flex items-center gap-1.5 cursor-pointer"
                data-testid="email-template-save"
              >
                <Save className="w-4 h-4" /> Save Template
              </button>
              <button
                type="button"
                onClick={() => setShowPreview((open) => !open)}
                className="min-h-[44px] px-4 py-2.5 bg-white text-[#1F1917] font-black text-xs uppercase rounded-xl border-2 border-[#1F1917] flex items-center gap-1.5 cursor-pointer"
                data-testid="email-template-preview-toggle"
              >
                <Eye className="w-4 h-4" /> {showPreview ? 'Hide Preview' : 'Preview Email'}
              </button>
              {selected?.isSystem && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[44px] px-4 py-2.5 bg-white text-[#1F1917] font-black text-xs uppercase rounded-xl border-2 border-[#1F1917] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Default
                </button>
              )}
              {selected && !selected.isSystem && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="min-h-[44px] px-4 py-2.5 bg-red-600 hover:bg-red-800 text-white font-black text-xs uppercase rounded-xl border border-[#1F1917] flex items-center gap-1.5 cursor-pointer"
                  data-testid="email-template-delete"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          </form>

          {showPreview && (
            <section
              className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 shadow-xl space-y-4"
              data-testid="email-template-preview"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" /> Email preview
                </div>
                <span className="text-[10px] font-mono text-[#3F3832] uppercase">Sample data · not sent</span>
              </div>
              <div className="rounded-2xl border-2 border-[#E5DFD3] bg-[#FAF8F5] p-4 space-y-1">
                <div className="text-[10px] font-mono font-black uppercase text-[#3F3832]">Subject</div>
                <div className="text-sm font-black text-[#1F1917]">{previewSubject || 'No subject yet'}</div>
              </div>
              <iframe
                title="Email template preview"
                srcDoc={previewHtml || '<p style="font-family:sans-serif;color:#3F3832;">Nothing to preview yet.</p>'}
                sandbox=""
                className="w-full min-h-[320px] rounded-2xl border-2 border-[#1F1917] bg-white"
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
