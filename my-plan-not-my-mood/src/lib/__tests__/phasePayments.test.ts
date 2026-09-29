import { describe, expect, it } from 'vitest';
import { formatUsdAmount } from '../gearSalesPlan';
import {
  CASH_APP_CASHTAG,
  MAKE_PAYMENT_QA_ID,
  MAKE_PAYMENT_TASK_ID,
  PAY_PAGE_PATH,
  VENMO_HANDLE,
  ZELLE_PHONE,
  cashAppPayUrl,
  defaultPayAmount,
  methodCopyValue,
  methodPayUrl,
  paymentMemo,
  paymentMethods,
  phasePayOptions,
  preferredPaymentMethods,
  stripePayUrl,
  venmoPayUrl,
  zelleTelHref,
} from '../phasePayments';

describe('phasePayments', () => {
  it('prices Payment 3 as the recommended $3,000 Sprint 3 installment after Payment 2 posted', () => {
    const options = phasePayOptions();
    expect(options).toHaveLength(3);
    expect(options[0]).toMatchObject({ label: 'Payment 1', amount: 3_500, paid: true, recommended: false });
    expect(options[1]).toMatchObject({ label: 'Payment 2', amount: 3_500, paid: true, recommended: false });
    expect(options[2]).toMatchObject({
      label: 'Payment 3',
      amount: 3_000,
      recommended: true,
      paid: false,
      dueHint: 'Due Sprint 3',
    });
    expect(defaultPayAmount()).toBe(3_000);
    expect(formatUsdAmount(defaultPayAmount())).toBe('$3,000');
  });

  it('lists Zelle and Cash App as preferred, then Venmo and Stripe', () => {
    const methods = paymentMethods();
    expect(methods.map((method) => method.id)).toEqual(['zelle', 'cashapp', 'venmo', 'stripe']);
    expect(preferredPaymentMethods().map((method) => method.id)).toEqual(['zelle', 'cashapp']);
    expect(methods.find((method) => method.id === 'zelle')?.handle).toBe(ZELLE_PHONE);
    expect(methods.find((method) => method.id === 'cashapp')?.handle).toBe(`$${CASH_APP_CASHTAG}`);
    expect(methods.find((method) => method.id === 'venmo')?.handle).toBe(`@${VENMO_HANDLE}`);
    expect(methods.find((method) => method.id === 'stripe')?.handle).toBe('Available Upon Request');
  });

  it('builds Zelle, Cash App, Venmo, and Stripe pay links', () => {
    expect(zelleTelHref()).toBe('tel:+16195079568');
    expect(cashAppPayUrl()).toBe('https://cash.app/$ChingChicks');
    expect(cashAppPayUrl(CASH_APP_CASHTAG, 4_000)).toBe('https://cash.app/$ChingChicks/4000.00');
    expect(venmoPayUrl(VENMO_HANDLE, 4_000, 'Phase 1')).toBe(
      'https://venmo.com/Evelyn-Irving?txn=pay&amount=4000&note=Phase+1',
    );
    expect(stripePayUrl(4_000)).toBeNull();
    expect(stripePayUrl(4_000, { 4000: 'https://buy.stripe.com/test_phase1' })).toBe(
      'https://buy.stripe.com/test_phase1',
    );
    expect(methodPayUrl('zelle', 4_000, 'Phase 1')).toBe('tel:+16195079568');
    expect(methodPayUrl('cashapp', 4_000, 'Phase 1')).toBe('https://cash.app/$ChingChicks/4000.00');
    expect(methodPayUrl('stripe', 4_000, 'Phase 1')).toBeNull();
    expect(methodCopyValue('zelle')).toBe('619-507-9568');
    expect(methodCopyValue('cashapp')).toBe('$ChingChicks');
    expect(methodCopyValue('venmo')).toBe('@Evelyn-Irving');
    expect(paymentMemo(3_500, 'Payment 2')).toBe('Payment 2 — $3,500 — My Plan, Not My Mood');
  });

  it('keeps the public pay path and Angela task ids stable', () => {
    expect(PAY_PAGE_PATH).toBe('/pay');
    expect(MAKE_PAYMENT_TASK_ID).toBe('t-43');
    expect(MAKE_PAYMENT_QA_ID).toBe('pay-qa1');
  });
});
