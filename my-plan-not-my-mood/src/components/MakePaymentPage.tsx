import React, { useMemo, useState } from 'react';
import { Banknote, Check, Copy, ExternalLink, Phone, ShieldCheck, Star } from 'lucide-react';
import { HEADER_CONTENT_OFFSET } from '../lib/headerClearance';
import { formatUsdAmount } from '../lib/gearSalesPlan';
import { FLAT_RATE_OFFER_DETAIL, FLAT_RATE_OFFER_HEADLINE } from '../lib/planIntro';
import {
  ZELLE_PHONE,
  defaultPayAmount,
  methodCopyValue,
  methodPayUrl,
  paymentMemo,
  paymentMethods,
  phasePayOptions,
  type PaymentMethod,
  type PaymentMethodId,
} from '../lib/phasePayments';

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export const MakePaymentPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const options = useMemo(() => phasePayOptions(), []);
  const methods = useMemo(() => paymentMethods(), []);
  const [selectedId, setSelectedId] = useState(options.find((option) => option.recommended)?.id ?? options[0]?.id ?? '');
  const [copied, setCopied] = useState<string | null>(null);
  const selected = options.find((option) => option.id === selectedId) ?? options[0];
  const amount = selected?.amount ?? defaultPayAmount(options);
  const phaseLabel = selected?.label ?? 'Phase 1';
  const memo = paymentMemo(amount, phaseLabel);

  const markCopied = (key: string) => {
    setCopied(key);
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1800);
  };

  const handleCopy = async (key: string, value: string) => {
    const ok = await copyText(value);
    if (ok) markCopied(key);
  };

  return (
    <div
      className={`bg-[#FAF8F5] ${embedded ? 'min-h-0' : `min-h-[60vh] ${HEADER_CONTENT_OFFSET}`}`}
      id="pay-page"
      data-testid="pay-page"
    >
      <section className={`bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] text-[#9A3412] border-b-4 border-[#EA580C] ${embedded ? 'py-5 sm:py-6' : 'py-8 sm:py-10'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(234,88,12,0.28)]">
              <Banknote className="w-3.5 h-3.5" /> Angela · Make Payment
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black uppercase tracking-tight leading-tight text-[#9A3412]">
              Pay for <span className="text-[#C2410C] italic">Phase work</span>
            </h1>
            <p className="text-sm sm:text-base text-[#9A3412] font-semibold max-w-3xl leading-relaxed" data-testid="pay-flat-rate-offer">
              {FLAT_RATE_OFFER_HEADLINE} {FLAT_RATE_OFFER_DETAIL}
            </p>
            <p className="text-sm sm:text-base text-[#C2410C] font-medium max-w-3xl leading-relaxed">
              Zelle and Cash App are preferred. Pick an amount, then pay Evelyn with the option that is easiest for you.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div>
          <h2 className="text-lg font-serif font-semibold text-[#9A3412] mb-3">Choose the payment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {options.map((option) => {
              const active = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className={`min-h-[44px] rounded-2xl border-2 px-4 py-3 text-left cursor-pointer ${
                    active
                      ? 'border-[#EA580C] bg-[#FFF7ED] shadow-[0_4px_12px_rgba(234,88,12,0.18)]'
                      : 'border-[#FED7AA] bg-white hover:border-[#EA580C]'
                  }`}
                  aria-pressed={active}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
                      {option.label}
                    </span>
                    {option.paid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#047857]">
                        Paid
                      </span>
                    ) : option.recommended ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#EA580C]">
                        <Star className="w-3 h-3 fill-current" /> Due Sprint 1
                      </span>
                    ) : null}
                  </div>
                  <div className="text-2xl font-black font-mono text-[#9A3412] mt-1">
                    {formatUsdAmount(option.amount)}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[#9A3412] font-medium">
            Memo: <span className="font-mono font-bold">{memo}</span>
            <button
              type="button"
              onClick={() => handleCopy('memo', memo)}
              className="ml-2 inline-flex items-center gap-1 min-h-[44px] px-3 rounded-xl border border-[#FED7AA] bg-white text-[#C2410C] text-[10px] font-black uppercase cursor-pointer"
            >
              {copied === 'memo' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'memo' ? 'Copied' : 'Copy memo'}
            </button>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-serif font-semibold text-[#9A3412] mb-3">How to pay</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                amount={amount}
                phaseLabel={phaseLabel}
                copied={copied}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

function PaymentMethodCard({
  method,
  amount,
  phaseLabel,
  copied,
  onCopy,
}: {
  method: PaymentMethod;
  amount: number;
  phaseLabel: string;
  copied: string | null;
  onCopy: (key: string, value: string) => void;
}) {
  const href = methodPayUrl(method.id, amount, phaseLabel);
  const copyValue = method.id === 'stripe' ? paymentMemo(amount, phaseLabel) : methodCopyValue(method.id);
  const copyKey = `copy-${method.id}`;
  const payLabel = payButtonLabel(method.id, Boolean(href));

  return (
    <article
      data-testid={`pay-method-${method.id}`}
      className={`rounded-2xl border-2 bg-white p-5 space-y-3 ${
        method.preferred ? 'border-[#EA580C] shadow-[0_8px_20px_rgba(234,88,12,0.12)]' : 'border-[#FED7AA]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-serif font-bold text-[#9A3412]">{method.label}</h3>
          <p className="font-mono font-black text-sm text-[#C2410C] mt-0.5">{method.handle}</p>
        </div>
        {method.preferred && (
          <span className="inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-black uppercase tracking-wider">
            <Star className="w-3 h-3 fill-current" /> Preferred
          </span>
        )}
      </div>
      <p className="text-sm text-[#9A3412] leading-relaxed">{method.instructions}</p>
      <div className="flex flex-wrap gap-2">
        {href ? (
          <a
            href={href}
            target={method.id === 'zelle' ? undefined : '_blank'}
            rel={method.id === 'zelle' ? undefined : 'noopener noreferrer'}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[#EA580C] text-white text-xs font-black uppercase tracking-wide shadow-[0_4px_12px_rgba(234,88,12,0.28)]"
          >
            {method.id === 'zelle' ? <Phone className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
            {payLabel}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[#FFEDD5] text-[#9A3412] text-xs font-black uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" /> Available Upon Request
          </span>
        )}
        <button
          type="button"
          onClick={() => onCopy(copyKey, copyValue)}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl border-2 border-[#EA580C] bg-white text-[#C2410C] text-xs font-black uppercase tracking-wide cursor-pointer"
        >
          {copied === copyKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied === copyKey ? 'Copied' : copyButtonLabel(method.id)}
        </button>
      </div>
    </article>
  );
}

function payButtonLabel(id: PaymentMethodId, hasHref: boolean): string {
  if (id === 'zelle') return `Zelle ${ZELLE_PHONE}`;
  if (id === 'cashapp') return 'Pay Cash App';
  if (id === 'venmo') return 'Pay Venmo';
  return hasHref ? 'Pay with Stripe' : 'Available Upon Request';
}

function copyButtonLabel(id: PaymentMethodId): string {
  if (id === 'zelle') return 'Copy Zelle number';
  if (id === 'cashapp') return 'Copy $ChingChicks';
  if (id === 'venmo') return 'Copy @Evelyn-Irving';
  return 'Copy memo for card';
}
