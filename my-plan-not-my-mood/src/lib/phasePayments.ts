import { formatUsdAmount, PHASE_PAYMENT_SCHEDULE } from './gearSalesPlan';

export const PAY_PAGE_PATH = '/pay';
export const MAKE_PAYMENT_TASK_ID = 't-43';
export const MAKE_PAYMENT_QA_ID = 'pay-qa1';

export const ZELLE_PHONE = '619-507-9568';
export const ZELLE_PHONE_DIGITS = '6195079568';
export const CASH_APP_CASHTAG = 'ChingChicks';
export const VENMO_HANDLE = 'Evelyn-Irving';

export const STRIPE_AVAILABILITY = 'Available Upon Request';
export const STRIPE_PAYMENT_LINKS: Partial<Record<number, string>> = {};

export type PaymentMethodId = 'zelle' | 'cashapp' | 'venmo' | 'stripe';

export interface PhasePayOption {
  id: string;
  label: string;
  amount: number;
  recommended?: boolean;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  preferred: boolean;
  handle: string;
  instructions: string;
}

export function phasePayOptions(
  schedule: readonly { label: string; amount: number }[] = PHASE_PAYMENT_SCHEDULE,
): PhasePayOption[] {
  return schedule.map((row, index) => ({
    id: `phase-${index + 1}`,
    label: row.label.replace(/ payment$/i, ''),
    amount: row.amount,
    recommended: index === 0,
  }));
}

export function defaultPayAmount(options: PhasePayOption[] = phasePayOptions()): number {
  return options.find((option) => option.recommended)?.amount ?? options[0]?.amount ?? 0;
}

export function paymentMethods(): PaymentMethod[] {
  return [
    {
      id: 'zelle',
      label: 'Zelle',
      preferred: true,
      handle: ZELLE_PHONE,
      instructions: `Open your bank app → Zelle → Send to ${ZELLE_PHONE}. Put the phase in the memo.`,
    },
    {
      id: 'cashapp',
      label: 'Cash App',
      preferred: true,
      handle: `$${CASH_APP_CASHTAG}`,
      instructions: `Open Cash App and send to $${CASH_APP_CASHTAG}, or tap Pay Cash App below.`,
    },
    {
      id: 'venmo',
      label: 'Venmo',
      preferred: false,
      handle: `@${VENMO_HANDLE}`,
      instructions: `Open Venmo and send to @${VENMO_HANDLE}, or tap Pay Venmo below.`,
    },
    {
      id: 'stripe',
      label: 'Card (Stripe)',
      preferred: false,
      handle: STRIPE_AVAILABILITY,
      instructions: `Card payments through Stripe are ${STRIPE_AVAILABILITY.toLowerCase()}. Use Zelle or Cash App for the fastest path.`,
    },
  ];
}

export function preferredPaymentMethods(methods: PaymentMethod[] = paymentMethods()): PaymentMethod[] {
  return methods.filter((method) => method.preferred);
}

export function zelleTelHref(phoneDigits = ZELLE_PHONE_DIGITS): string {
  return `tel:+1${phoneDigits}`;
}

export function cashAppPayUrl(cashtag = CASH_APP_CASHTAG, amount?: number): string {
  const tag = cashtag.replace(/^\$/, '');
  const base = `https://cash.app/$${tag}`;
  if (!amount || amount <= 0) return base;
  return `${base}/${amount.toFixed(2)}`;
}

export function venmoPayUrl(handle = VENMO_HANDLE, amount?: number, note?: string): string {
  const user = handle.replace(/^@/, '');
  const params = new URLSearchParams({ txn: 'pay' });
  if (amount && amount > 0) params.set('amount', String(amount));
  if (note) params.set('note', note);
  return `https://venmo.com/${user}?${params.toString()}`;
}

export function paymentMemo(amount: number, phaseLabel: string): string {
  return `${phaseLabel} — ${formatUsdAmount(amount)} — My Plan, Not My Mood`;
}

export function stripePayUrl(
  amount: number,
  links: Partial<Record<number, string>> = STRIPE_PAYMENT_LINKS,
): string | null {
  const href = links[amount]?.trim();
  return href ? href : null;
}

export function methodPayUrl(
  methodId: PaymentMethodId,
  amount: number,
  phaseLabel: string,
): string | null {
  if (methodId === 'zelle') return zelleTelHref();
  if (methodId === 'cashapp') return cashAppPayUrl(CASH_APP_CASHTAG, amount);
  if (methodId === 'venmo') return venmoPayUrl(VENMO_HANDLE, amount, paymentMemo(amount, phaseLabel));
  return stripePayUrl(amount);
}

export function methodCopyValue(methodId: PaymentMethodId): string {
  if (methodId === 'zelle') return ZELLE_PHONE;
  if (methodId === 'cashapp') return `$${CASH_APP_CASHTAG}`;
  if (methodId === 'venmo') return `@${VENMO_HANDLE}`;
  return paymentMemo(defaultPayAmount(), 'Phase 1');
}
