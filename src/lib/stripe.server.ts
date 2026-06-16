import Stripe from "stripe";
import { getRuntimeSecret } from "@/lib/env";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  listStripePlanDefinitions,
  planLeadAllowance,
  resolveStripePriceId,
  type StripePlanKey,
} from "@/lib/stripe-products";
import { isActiveSubscriptionStatus } from "@/lib/subscription-access";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  const key = getRuntimeSecret("STRIPE_SECRET_KEY");
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function getStripeWebhookSecret(): string | undefined {
  return getRuntimeSecret("STRIPE_WEBHOOK_SECRET");
}

export async function findUserIdByStripeCustomerId(
  stripeCustomerId: string,
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("agents")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function ensureAgentStripeCustomer(opts: {
  userId: string;
  email: string;
  fullName?: string;
}): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from("agents")
    .select("stripe_customer_id")
    .eq("user_id", opts.userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: opts.email,
    name: opts.fullName || undefined,
    metadata: { user_id: opts.userId },
  });

  await supabaseAdmin.from("agents").upsert({
    user_id: opts.userId,
    stripe_customer_id: customer.id,
    updated_at: new Date().toISOString(),
  });

  return customer.id;
}

async function grantAgentRole(userId: string) {
  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "agent" }, { onConflict: "user_id,role" });
}

async function refreshLeadCreditsForSubscription(userId: string, planKey: string) {
  const allowance = planLeadAllowance(planKey);
  if (allowance <= 0) return;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { data: existing } = await supabaseAdmin
    .from("lead_credits")
    .select("balance, period_start")
    .eq("user_id", userId)
    .maybeSingle();

  const periodStartIso = now.toISOString();
  const periodEndIso = periodEnd.toISOString();

  // Reset monthly allowance at the start of each billing period
  const shouldReset =
    !existing?.period_start ||
    new Date(existing.period_start).getTime() < now.getTime() - 28 * 24 * 60 * 60 * 1000;

  const balance = shouldReset ? allowance : Math.max(existing?.balance ?? 0, allowance);

  await supabaseAdmin.from("lead_credits").upsert({
    user_id: userId,
    balance,
    monthly_allowance: allowance,
    period_start: periodStartIso,
    period_end: periodEndIso,
    updated_at: now.toISOString(),
  });
}

async function addPaygLeadCredits(userId: string, planKey: string) {
  const credits = planLeadAllowance(planKey);
  if (credits <= 0) return;

  const { data: existing } = await supabaseAdmin
    .from("lead_credits")
    .select("balance, monthly_allowance")
    .eq("user_id", userId)
    .maybeSingle();

  await supabaseAdmin.from("lead_credits").upsert({
    user_id: userId,
    balance: (existing?.balance ?? 0) + credits,
    monthly_allowance: existing?.monthly_allowance ?? 0,
    updated_at: new Date().toISOString(),
  });
}

async function upsertSubscriptionRow(opts: {
  userId: string;
  subscription: Stripe.Subscription;
  planKey: string;
}) {
  const sub = opts.subscription;
  const priceId = sub.items.data[0]?.price?.id ?? "";

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: opts.userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: String(sub.customer),
      stripe_price_id: priceId,
      plan_key: opts.planKey,
      status: sub.status,
      cancel_at_period_end: sub.cancel_at_period_end,
      current_period_start: sub.current_period_start
        ? new Date(sub.current_period_start * 1000).toISOString()
        : null,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      trial_start: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (isActiveSubscriptionStatus(sub.status)) {
    await grantAgentRole(opts.userId);
    await refreshLeadCreditsForSubscription(opts.userId, opts.planKey);
  }
}

async function recordPayment(opts: {
  userId: string | null;
  amountCents: number;
  currency: string;
  status: string;
  description?: string;
  stripePaymentIntentId?: string | null;
  stripeInvoiceId?: string | null;
  stripeCheckoutSessionId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const row = {
    user_id: opts.userId,
    amount_cents: opts.amountCents,
    currency: opts.currency,
    status: opts.status,
    description: opts.description ?? null,
    stripe_payment_intent_id: opts.stripePaymentIntentId ?? null,
    stripe_invoice_id: opts.stripeInvoiceId ?? null,
    stripe_checkout_session_id: opts.stripeCheckoutSessionId ?? null,
    metadata: opts.metadata ?? {},
  };

  if (opts.stripePaymentIntentId) {
    await supabaseAdmin.from("payments").upsert(row, {
      onConflict: "stripe_payment_intent_id",
    });
  } else {
    await supabaseAdmin.from("payments").insert(row);
  }
}

async function markWebhookProcessed(eventId: string, eventType: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("stripe_webhook_events").insert({
    event_id: eventId,
    event_type: eventType,
  });
  if (error?.code === "23505") return false;
  if (error) throw error;
  return true;
}

function planKeyFromMetadata(metadata: Stripe.Metadata | null | undefined): string | null {
  const key = metadata?.plan_key?.trim();
  return key || null;
}

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  const isNew = await markWebhookProcessed(event.id, event.type);
  if (!isNew) return;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;
      const planKey = planKeyFromMetadata(session.metadata);
      if (!userId || !planKey) break;

      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (customerId) {
        await supabaseAdmin.from("agents").upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        });
      }

      if (session.mode === "payment" && session.payment_status === "paid") {
        await addPaygLeadCredits(userId, planKey);
        await grantAgentRole(userId);
        await recordPayment({
          userId,
          amountCents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          status: session.payment_status,
          description: `Pay-as-you-go: ${planKey}`,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id,
          stripeCheckoutSessionId: session.id,
          metadata: { plan_key: planKey },
        });
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId =
        subscription.metadata?.user_id ??
        (await findUserIdByStripeCustomerId(String(subscription.customer)));
      const planKey =
        planKeyFromMetadata(subscription.metadata) ??
        planKeyFromPriceId(subscription.items.data[0]?.price?.id);
      if (!userId || !planKey) break;
      await upsertSubscriptionRow({ userId, subscription, planKey });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = invoice.metadata?.user_id
        ? invoice.metadata.user_id
        : await findUserIdByStripeCustomerId(String(invoice.customer));
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

      if (userId && subscriptionId) {
        const { data: subRow } = await supabaseAdmin
          .from("subscriptions")
          .select("plan_key")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();
        if (subRow?.plan_key) {
          await refreshLeadCreditsForSubscription(userId, subRow.plan_key);
        }
      }

      await recordPayment({
        userId,
        amountCents: invoice.amount_paid ?? 0,
        currency: invoice.currency ?? "usd",
        status: invoice.status ?? "paid",
        description: invoice.description ?? "Subscription invoice",
        stripePaymentIntentId:
          typeof invoice.payment_intent === "string"
            ? invoice.payment_intent
            : invoice.payment_intent?.id,
        stripeInvoiceId: invoice.id,
        metadata: { subscription_id: subscriptionId },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = await findUserIdByStripeCustomerId(String(invoice.customer));
      await recordPayment({
        userId,
        amountCents: invoice.amount_due ?? 0,
        currency: invoice.currency ?? "usd",
        status: "failed",
        description: "Subscription payment failed",
        stripeInvoiceId: invoice.id,
      });
      break;
    }

    default:
      break;
  }
}

function planKeyFromPriceId(priceId: string | undefined): string | null {
  if (!priceId) return null;
  for (const plan of listStripePlanDefinitions()) {
    if (resolveStripePriceId(plan.key) === priceId) return plan.key;
  }
  return null;
}

export async function loadUserSubscriptionSnapshot(
  userId: string,
): Promise<import("@/lib/subscription-access").SubscriptionSnapshot | null> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("status, plan_key, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    status: data.status,
    planKey: data.plan_key,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
  };
}

export type { StripePlanKey };
