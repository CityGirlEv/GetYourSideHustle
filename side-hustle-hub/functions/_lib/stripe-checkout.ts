/**
 * GYSH Stripe Checkout — memberships, a-la-carte, credit packs.
 */
import {
  appendAudit,
  canonicalizeEmail,
  error,
  getUserByEmail,
  getUserById,
  json,
  publicUser,
  requireSession,
  type DbUser,
  type Env,
} from "./auth";
import { STRIPE_CATALOG } from "./stripe-catalog.generated";
import {
  createStripeCheckoutSession,
  createStripeOnceCoupon,
  checkoutReturnOrigin,
  requireStripeSecret,
  retrieveStripeCheckoutSession,
  stripeSubscriptionIdFromSession,
} from "./stripe";
import { setUserStripeSubscriptionId } from "./membership-cancel";
import { joinCartCatalogItem } from "../../src/lib/alacarte-cart";
import {
  quoteMixedCartPayment,
  quoteMixedUsdPayment,
  usdToCents,
  type MixedCartLine,
} from "../../src/lib/credit-checkout";
import {
  merchChoicesError,
  merchItemCount,
  mergeMerchNote,
  parseMerchChoices,
  parseMerchTshirtSizes,
  type TierId,
} from "../../src/lib/membership";
import {
  MEMBERSHIP_COMMITMENT_MONTHS,
  membershipCommitmentLineItemName,
  membershipDueNowUsd,
  membershipRecurringTrialEndUnix,
} from "../../src/lib/membership-commitment-billing";

export type CheckoutKind = "membership" | "alacarte" | "credit_pack";

export function resolveCheckoutPrice(input: {
  kind: CheckoutKind;
  tierId?: string;
  audience?: string;
  interval?: "month" | "year";
  itemId?: string;
  packId?: string;
}):
  | { ok: true; priceId: string; mode: "subscription" | "payment"; label: string; amountUsd: number }
  | { ok: false; error: string } {
  if (input.kind === "membership") {
    const tierId = String(input.tierId || "").toLowerCase();
    const audience = String(input.audience || "").toLowerCase();
    const interval = input.interval === "year" ? "year" : "month";
    if (!["starter", "pro", "elite"].includes(tierId)) {
      return { ok: false, error: "Choose Starter, Pro, or Elite for paid membership checkout." };
    }
    if (audience !== "adult" && audience !== "senior") {
      return {
        ok: false,
        error: "USD membership checkout is for Adults and Seniors. Kids/Teens use credit packs.",
      };
    }
    const row = STRIPE_CATALOG.memberships[tierId]?.[audience]?.[interval];
    if (!row?.priceId) return { ok: false, error: "Membership price is not configured in Stripe." };
    return {
      ok: true,
      priceId: row.priceId,
      mode: "subscription",
      label: row.label,
      amountUsd: row.amountUsd,
    };
  }
  if (input.kind === "alacarte") {
    const itemId = String(input.itemId || "").trim();
    const row = STRIPE_CATALOG.alaCarte[itemId];
    if (!row?.priceId) return { ok: false, error: "A-la-carte item is not configured in Stripe." };
    return {
      ok: true,
      priceId: row.priceId,
      mode: "payment",
      label: row.label,
      amountUsd: row.amountUsd,
    };
  }
  if (input.kind === "credit_pack") {
    const packId = String(input.packId || "").trim();
    const row = STRIPE_CATALOG.creditPacks[packId];
    if (!row?.priceId) return { ok: false, error: "Credit pack is not configured in Stripe." };
    return {
      ok: true,
      priceId: row.priceId,
      mode: "payment",
      label: row.label,
      amountUsd: row.amountUsd,
    };
  }
  return { ok: false, error: "Unknown checkout kind." };
}

function lookupJoinCartSku(itemId: string): {
  priceId: string;
  label: string;
  amountUsd: number;
  skuKind: "alacarte" | "credit_pack";
} | null {
  const ala = STRIPE_CATALOG.alaCarte[itemId];
  if (ala?.priceId) {
    return {
      priceId: ala.priceId,
      label: ala.label,
      amountUsd: ala.amountUsd,
      skuKind: "alacarte",
    };
  }
  const pack = STRIPE_CATALOG.creditPacks[itemId];
  if (pack?.priceId) {
    return {
      priceId: pack.priceId,
      label: pack.label,
      amountUsd: pack.amountUsd,
      skuKind: "credit_pack",
    };
  }
  return null;
}

export function resolveAlaCarteCheckoutLines(
  rawItems: Array<{ itemId?: string; quantity?: number }> | undefined,
  fallbackItemId?: string,
):
  | {
      ok: true;
      mode: "payment";
      label: string;
      amountUsd: number;
      checkoutKind: "alacarte" | "credit_pack";
      lines: Array<{
        priceId: string;
        quantity: number;
        itemId: string;
        label: string;
        amountUsd: number;
        skuKind: "alacarte" | "credit_pack";
      }>;
    }
  | { ok: false; error: string } {
  const source =
    rawItems && rawItems.length > 0
      ? rawItems
      : fallbackItemId
        ? [{ itemId: fallbackItemId, quantity: 1 }]
        : [];
  if (source.length === 0) {
    return { ok: false, error: "Add at least one a-la-carte item to checkout." };
  }
  const lines: Array<{
    priceId: string;
    quantity: number;
    itemId: string;
    label: string;
    amountUsd: number;
    skuKind: "alacarte" | "credit_pack";
  }> = [];
  for (const raw of source) {
    const itemId = String(raw.itemId || "").trim();
    const quantity = Math.max(1, Math.min(99, Math.floor(Number(raw.quantity) || 1)));
    const row = lookupJoinCartSku(itemId);
    if (!row) {
      return { ok: false, error: `Item "${itemId || "?"}" is not configured in Stripe.` };
    }
    lines.push({
      priceId: row.priceId,
      quantity,
      itemId,
      label: row.label,
      amountUsd: row.amountUsd * quantity,
      skuKind: row.skuKind,
    });
  }
  const amountUsd = Math.round(lines.reduce((n, l) => n + l.amountUsd, 0) * 100) / 100;
  const allPacks = lines.every((l) => l.skuKind === "credit_pack");
  const checkoutKind = allPacks ? "credit_pack" : "alacarte";
  const label =
    lines.length === 1
      ? `${lines[0]!.label}${lines[0]!.quantity > 1 ? ` × ${lines[0]!.quantity}` : ""}`
      : allPacks
        ? `Credit pack cart (${lines.length} items)`
        : `A-la-carte cart (${lines.length} items)`;
  return { ok: true, mode: "payment", label, amountUsd, checkoutKind, lines };
}

function mixedLinesFromCartSku(
  lines: Array<{ itemId: string; quantity: number; label: string; amountUsd: number; skuKind: "alacarte" | "credit_pack" }>,
): MixedCartLine[] {
  return lines.map((line) => {
    const catalog = joinCartCatalogItem(line.itemId);
    return {
      itemId: line.itemId,
      name: catalog?.name || line.label,
      quantity: line.quantity,
      priceUsd: catalog?.priceUsd ?? line.amountUsd / Math.max(1, line.quantity),
      kind: line.skuKind,
      credits: line.skuKind === "credit_pack" ? null : catalog?.credits ?? null,
    };
  });
}

function writeStripeLineItems(
  form: Record<string, string | number | undefined | null>,
  lines: Array<{ priceId?: string; quantity: number; unitAmountCents?: number; name?: string }>,
) {
  lines.forEach((line, index) => {
    form[`line_items[${index}][quantity]`] = line.quantity;
    if (line.unitAmountCents != null) {
      form[`line_items[${index}][price_data][currency]`] = "usd";
      form[`line_items[${index}][price_data][unit_amount]`] = line.unitAmountCents;
      form[`line_items[${index}][price_data][product_data][name]`] = line.name || "GYSH checkout";
    } else if (line.priceId) {
      form[`line_items[${index}][price]`] = line.priceId;
    }
  });
}

/** True when Adult/Senior paid tier can use Stripe membership Checkout. */
export function supportsMembershipStripeCheckout(
  tierId: string,
  audience: string,
): boolean {
  const t = String(tierId || "").toLowerCase();
  const a = String(audience || "").toLowerCase();
  return (
    ["starter", "pro", "elite"].includes(t) &&
    (a === "adult" || a === "senior") &&
    Boolean(STRIPE_CATALOG.memberships[t]?.[a]?.month?.priceId)
  );
}

export async function handleStripeCheckoutCreate(
  env: Env,
  request: Request,
): Promise<Response> {
  const secret = requireStripeSecret(env);
  if (secret instanceof Response) return secret;

  let body: {
    kind?: CheckoutKind;
    email?: string;
    name?: string;
    tierId?: string;
    audience?: string;
    interval?: "month" | "year";
    itemId?: string;
    packId?: string;
    /** Multi-item a-la-carte cart. */
    items?: Array<{ itemId?: string; quantity?: number }>;
    /** Kid Credits to apply toward this charge (logged-in members). */
    creditsToApply?: number;
    merchChoices?: unknown;
    merchTshirtSizes?: unknown;
    /** Browser app origin (e.g. http://localhost:5173) for success/cancel URLs. */
    returnOrigin?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  let kind = (body.kind || "membership") as CheckoutKind;
  const email = canonicalizeEmail(String(body.email || ""));
  if (!email.includes("@")) return error("A valid email is required for checkout.");

  let mode: "subscription" | "payment";
  let label: string;
  let amountUsd: number;
  let catalogLineItems: Array<{ priceId: string; quantity: number }>;
  let cartMeta = "";
  let mixedLines: MixedCartLine[] = [];
  /** Monthly membership: prepaid commitment + delayed recurring. */
  let membershipCommitment: {
    recurringPriceId: string;
    monthlyUsd: number;
    dueNowUsd: number;
    trialEndUnix: number;
  } | null = null;

  if (kind === "alacarte") {
    const cart = resolveAlaCarteCheckoutLines(body.items, body.itemId);
    if (!cart.ok) return error(cart.error, 400);
    mode = cart.mode;
    label = cart.label;
    amountUsd = cart.amountUsd;
    catalogLineItems = cart.lines.map((l) => ({ priceId: l.priceId, quantity: l.quantity }));
    cartMeta = cart.lines.map((l) => `${l.itemId}x${l.quantity}`).join(",");
    kind = cart.checkoutKind;
    mixedLines = mixedLinesFromCartSku(cart.lines);
  } else {
    const resolved = resolveCheckoutPrice({
      kind,
      tierId: body.tierId,
      audience: body.audience,
      interval: body.interval,
      itemId: body.itemId,
      packId: body.packId,
    });
    if (!resolved.ok) return error(resolved.error, 400);
    mode = resolved.mode;
    label = resolved.label;
    const interval = body.interval === "year" ? "year" : "month";
    if (kind === "membership" && mode === "subscription" && interval === "month") {
      const dueNowUsd = membershipDueNowUsd("month", resolved.amountUsd);
      membershipCommitment = {
        recurringPriceId: resolved.priceId,
        monthlyUsd: resolved.amountUsd,
        dueNowUsd,
        trialEndUnix: membershipRecurringTrialEndUnix(),
      };
      amountUsd = dueNowUsd;
      catalogLineItems = [{ priceId: resolved.priceId, quantity: 1 }];
    } else {
      amountUsd = resolved.amountUsd;
      catalogLineItems = [{ priceId: resolved.priceId, quantity: 1 }];
    }
    cartMeta = String(body.itemId || body.packId || "");
    if (kind === "credit_pack") {
      mixedLines = mixedLinesFromCartSku([
        {
          itemId: String(body.packId || ""),
          quantity: 1,
          label: resolved.label,
          amountUsd: resolved.amountUsd,
          skuKind: "credit_pack",
        },
      ]);
    }
  }

  const sessionAuth = await requireSession(env, request);
  const loggedIn = sessionAuth instanceof Response ? null : sessionAuth.user;
  let user = await getUserByEmail(env.DB, email);
  if (loggedIn && canonicalizeEmail(loggedIn.email) === email) {
    user = (await getUserById(env.DB, loggedIn.id)) ?? loggedIn;
  }

  let creditBalance = 0;
  if (loggedIn && canonicalizeEmail(loggedIn.email) === email) {
    try {
      const { reconcileWalletToLedger } = await import("./member-credits");
      const wallet = await reconcileWalletToLedger(env, loggedIn.id);
      creditBalance = wallet.balance;
    } catch {
      creditBalance = 0;
    }
  }

  const quote =
    mode === "subscription"
      ? quoteMixedUsdPayment({
          amountUsd,
          balance: creditBalance,
          creditsToApply: body.creditsToApply,
        })
      : quoteMixedCartPayment({
          lines: mixedLines,
          balance: creditBalance,
          creditsToApply: body.creditsToApply,
        });

  if (quote.creditsApplied > 0 && (!loggedIn || canonicalizeEmail(loggedIn.email) !== email)) {
    return error("Sign in with this email to apply Kid Credits.", 401);
  }

  // Credits can pay anything except credit packs (packs stay cash-only in the quote).
  // Membership + a-la-carte: when cash due is $0, finish here — never send the member to Stripe.
  if (quote.cashDueCents === 0 && quote.creditsApplied > 0) {
    if (!user) return error("Sign in to pay with Kid Credits.", 401);
    if (kind === "credit_pack") {
      return error("Credit packs must be purchased with a card — credits cannot buy more credits.", 400);
    }

    let merchChoicesPaid: string[] = [];
    let merchTshirtSizesPaid: string[] = [];
    if (kind === "membership") {
      const merchTier = String(body.tierId || "").toLowerCase() as TierId;
      const merchErr = merchChoicesError(merchTier, body.merchChoices, body.merchTshirtSizes);
      if (merchErr) return error(merchErr, 400);
      merchChoicesPaid = parseMerchChoices(body.merchChoices, merchItemCount(merchTier)) ?? [];
      merchTshirtSizesPaid = parseMerchTshirtSizes(
        merchChoicesPaid as ("tshirt" | "hat")[],
        body.merchTshirtSizes,
      );
    }

    const creditSessionId = `cred-${user.id}-${Date.now().toString(36)}`;
    try {
      const { spendCheckoutCredits } = await import("./member-credits");
      await spendCheckoutCredits(
        env,
        user.id,
        quote.creditsApplied,
        `${label} · ${quote.creditsApplied} Kid Credits · ${creditSessionId}`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not apply Kid Credits.";
      return error(msg, 402);
    }

    const { publicUser: toPublic, getUserById } = await import("./auth");
    let paidUser = user;
    const now = new Date().toISOString();
    let membershipTierPaid: string | undefined;
    let membershipAudiencePaid: string | undefined;

    if (kind === "membership") {
      const tier = String(body.tierId || "").toLowerCase();
      const audience = String(body.audience || "").toLowerCase();
      membershipTierPaid = ["starter", "pro", "elite"].includes(tier) ? tier : undefined;
      membershipAudiencePaid = ["kids", "junior", "adult", "senior"].includes(audience)
        ? audience
        : undefined;
      const prevNotes = String(user.notes || "");
      const stamp = `Credit checkout ${tier || "plan"} (${audience || "audience"}) ${now}`;
      let notes = `${prevNotes}${prevNotes ? " · " : ""}${stamp}`.slice(0, 1900);
      if (merchChoicesPaid.length) {
        notes = mergeMerchNote(notes, merchChoicesPaid as ("tshirt" | "hat")[], merchTshirtSizesPaid);
      }
      if (membershipTierPaid && membershipAudiencePaid) {
        await env.DB.prepare(
          `UPDATE users SET membership_tier = ?, audience = ?, notes = ?, updated_at = ? WHERE id = ?`,
        )
          .bind(membershipTierPaid, membershipAudiencePaid, notes, now, user.id)
          .run();
      } else if (membershipTierPaid) {
        await env.DB.prepare(
          `UPDATE users SET membership_tier = ?, notes = ?, updated_at = ? WHERE id = ?`,
        )
          .bind(membershipTierPaid, notes, now, user.id)
          .run();
      } else {
        await env.DB.prepare(`UPDATE users SET notes = ?, updated_at = ? WHERE id = ?`)
          .bind(notes, now, user.id)
          .run();
      }
      const refreshed = await getUserById(env.DB, user.id);
      if (refreshed) paidUser = refreshed;
      await appendAudit(
        env.DB,
        "membership_plan_update",
        paidUser.email,
        `${membershipTierPaid || tier}:${membershipAudiencePaid || audience} paid with ${quote.creditsApplied} Kid Credits · ${creditSessionId}`,
      );
      try {
        const { sendMembershipSubscriptionEmails } = await import("./email");
        await sendMembershipSubscriptionEmails(env, {
          user: {
            id: paidUser.id,
            email: paidUser.email,
            name: paidUser.name,
            membership_tier: membershipTierPaid || String(paidUser.membership_tier || ""),
            audience: membershipAudiencePaid || String(paidUser.audience || ""),
          },
          previousTier: String(user.membership_tier || "free"),
          source: "credits",
          amountLabel: `${quote.creditsApplied} Kid Credits`,
          creditsApplied: quote.creditsApplied,
          amountCents: 0,
        });
      } catch {
        /* email optional */
      }
    } else {
      try {
        const { upsertGyshPayment } = await import("./stripe-payments");
        await upsertGyshPayment(env, {
          sessionId: creditSessionId,
          email: user.email,
          userId: user.id,
          kind,
          item: cartMeta,
          amountCents: 0,
          paidAt: now,
          source: "credits",
          memberName: user.name,
        });
      } catch {
        /* ledger optional */
      }
      await appendAudit(
        env.DB,
        "purchase_alacarte",
        user.email,
        `${label} · ${quote.creditsApplied} Kid Credits · ${creditSessionId}`,
      );
      try {
        const { sendAlaCartePurchaseEmails } = await import("./email");
        await sendAlaCartePurchaseEmails(env, {
          email: user.email,
          name: user.name,
          userId: user.id,
          itemMeta: cartMeta,
          amountCents: 0,
          sessionId: creditSessionId,
          kind,
          source: "credits",
          creditsApplied: quote.creditsApplied,
        });
      } catch {
        /* email optional */
      }
    }

    try {
      const { upsertGyshPayment } = await import("./stripe-payments");
      if (kind === "membership") {
        await upsertGyshPayment(env, {
          sessionId: creditSessionId,
          email: paidUser.email,
          userId: paidUser.id,
          kind: "membership",
          tier: membershipTierPaid || String(body.tierId || ""),
          audience: membershipAudiencePaid || String(body.audience || ""),
          interval: body.interval === "year" ? "year" : "month",
          amountCents: 0,
          paidAt: now,
          source: "credits",
          memberName: paidUser.name,
        });
      }
    } catch {
      /* ledger optional */
    }

    return json({
      ok: true,
      paid: true,
      url: null,
      sessionId: creditSessionId,
      mode,
      label,
      amountUsd: 0,
      creditsApplied: quote.creditsApplied,
      cashDueUsd: 0,
      catalogMode: STRIPE_CATALOG.mode,
      user: toPublic(paidUser),
    });
  }

  const origin = checkoutReturnOrigin(request, { preferredOrigin: body.returnOrigin });
  const successUrl = `${origin}/membership?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/membership?checkout=canceled`;

  const merchTier = String(body.tierId || "").toLowerCase() as TierId;
  let merchChoices: string[] = [];
  let merchTshirtSizes: string[] = [];
  if (kind === "membership") {
    const merchErr = merchChoicesError(merchTier, body.merchChoices, body.merchTshirtSizes);
    if (merchErr) return error(merchErr, 400);
    merchChoices = parseMerchChoices(body.merchChoices, merchItemCount(merchTier)) ?? [];
    merchTshirtSizes = parseMerchTshirtSizes(merchChoices as ("tshirt" | "hat")[], body.merchTshirtSizes);
    if (user && merchChoices.length) {
      const now = new Date().toISOString();
      const notes = mergeMerchNote(
        String(user.notes || ""),
        merchChoices as ("tshirt" | "hat")[],
        merchTshirtSizes,
      );
      try {
        await env.DB.prepare(`UPDATE users SET notes = ?, updated_at = ? WHERE id = ?`)
          .bind(notes, now, user.id)
          .run();
      } catch {
        /* notes are best-effort for merch fulfillment */
      }
    }
  }

  const metadata: Record<string, string> = {
    gysh_kind: kind,
    gysh_email: email,
    gysh_tier: String(body.tierId || ""),
    gysh_audience: String(body.audience || ""),
    gysh_interval: String(body.interval || "month"),
    gysh_item: cartMeta,
    gysh_previous_tier: String(user?.membership_tier || "free").toLowerCase(),
    gysh_credits_applied: String(quote.creditsApplied),
    gysh_merch: merchChoices
      .map((id, i) =>
        id === "tshirt" && merchTshirtSizes[i] ? `tshirt:${merchTshirtSizes[i]}` : id,
      )
      .join(","),
  };

  const form: Record<string, string | number | undefined | null> = {
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: user?.id || email,
    customer_email: email,
    "metadata[gysh_kind]": metadata.gysh_kind,
    "metadata[gysh_email]": metadata.gysh_email,
    "metadata[gysh_tier]": metadata.gysh_tier,
    "metadata[gysh_audience]": metadata.gysh_audience,
    "metadata[gysh_interval]": metadata.gysh_interval,
    "metadata[gysh_item]": metadata.gysh_item,
    "metadata[gysh_previous_tier]": metadata.gysh_previous_tier,
    "metadata[gysh_credits_applied]": metadata.gysh_credits_applied,
    "metadata[gysh_merch]": metadata.gysh_merch,
  };

  if (quote.creditsApplied > 0) {
    form.allow_promotion_codes = undefined;
  } else {
    form.allow_promotion_codes = "true";
  }

  if (mode === "payment" && quote.creditsApplied > 0 && quote.cashDueCents > 0) {
    writeStripeLineItems(form, [
      {
        quantity: 1,
        unitAmountCents: quote.cashDueCents,
        name: `${label} (after ${quote.creditsApplied} Kid Credits)`,
      },
    ]);
    amountUsd = quote.cashDueUsd;
  } else if (membershipCommitment) {
    // Recurring monthly (first bill after trial / month 4) + prepaid 3-month commitment.
    writeStripeLineItems(form, [
      { priceId: membershipCommitment.recurringPriceId, quantity: 1 },
      {
        quantity: 1,
        unitAmountCents: usdToCents(membershipCommitment.dueNowUsd),
        name: membershipCommitmentLineItemName(label),
      },
    ]);
    form["subscription_data[trial_end]"] = membershipCommitment.trialEndUnix;
    form["subscription_data[metadata][gysh_commitment_months]"] = String(
      MEMBERSHIP_COMMITMENT_MONTHS,
    );
    form["metadata[gysh_commitment_months]"] = String(MEMBERSHIP_COMMITMENT_MONTHS);
    if (quote.creditsApplied > 0 && quote.creditValueUsd > 0) {
      const coupon = await createStripeOnceCoupon(secret, {
        amountOffCents: usdToCents(quote.creditValueUsd),
        name: `${quote.creditsApplied} Kid Credits`,
      });
      if (!coupon.ok) return error(coupon.error, 502);
      form["discounts[0][coupon]"] = coupon.id;
    }
    amountUsd = quote.creditsApplied > 0 ? quote.cashDueUsd : membershipCommitment.dueNowUsd;
  } else {
    writeStripeLineItems(form, catalogLineItems);
    if (mode === "subscription" && quote.creditsApplied > 0 && quote.creditValueUsd > 0) {
      const coupon = await createStripeOnceCoupon(secret, {
        amountOffCents: usdToCents(quote.creditValueUsd),
        name: `${quote.creditsApplied} Kid Credits`,
      });
      if (!coupon.ok) return error(coupon.error, 502);
      form["discounts[0][coupon]"] = coupon.id;
      amountUsd = quote.cashDueUsd;
    }
  }

  if (mode === "subscription") {
    form["subscription_data[metadata][gysh_email]"] = email;
    form["subscription_data[metadata][gysh_tier]"] = metadata.gysh_tier;
    form["subscription_data[metadata][gysh_audience]"] = metadata.gysh_audience;
    form["subscription_data[metadata][gysh_credits_applied]"] = metadata.gysh_credits_applied;
    form["subscription_data[metadata][gysh_merch]"] = metadata.gysh_merch;
  }

  const created = await createStripeCheckoutSession(secret, form);
  if (!created.ok) return error(created.error, 502);

  await appendAudit(
    env.DB,
    "stripe_checkout_create",
    email,
    `${kind}:${label}:${created.session.id}${quote.creditsApplied ? `:${quote.creditsApplied}cr` : ""}`,
  );

  return json({
    ok: true,
    paid: false,
    url: created.session.url,
    sessionId: created.session.id,
    mode,
    label,
    amountUsd,
    creditsApplied: quote.creditsApplied,
    cashDueUsd: quote.cashDueUsd,
    catalogMode: STRIPE_CATALOG.mode,
  });
}

export async function handleStripeCheckoutConfirm(
  env: Env,
  request: Request,
): Promise<Response> {
  const secret = requireStripeSecret(env);
  if (secret instanceof Response) return secret;

  let body: { sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const sessionId = String(body.sessionId || "").trim();
  if (!sessionId.startsWith("cs_")) return error("sessionId is required.");

  const retrieved = await retrieveStripeCheckoutSession(secret, sessionId);
  if (!retrieved.ok) return error(retrieved.error, 502);
  const session = retrieved.session;
  const paid =
    session.payment_status === "paid" ||
    session.status === "complete" ||
    session.payment_status === "no_payment_required";

  const email = canonicalizeEmail(
    session.metadata?.gysh_email || session.customer_email || "",
  );
  const tier = String(session.metadata?.gysh_tier || "").toLowerCase();
  const audience = String(session.metadata?.gysh_audience || "").toLowerCase();
  const kind = String(session.metadata?.gysh_kind || "membership");

  let updatedUser: ReturnType<typeof publicUser> | null = null;

  if (paid) {
    const sessionAuth = await requireSession(env, request);
    const loggedIn = sessionAuth instanceof Response ? null : sessionAuth.user;

    let user: DbUser | null = email.includes("@") ? await getUserByEmail(env.DB, email) : null;
    const ref = String(session.client_reference_id || "").trim();
    if (!user && ref.startsWith("u-")) {
      user = await getUserById(env.DB, ref);
    }
    // Prefer the logged-in profile when the checkout email matches (or Stripe email missing).
    if (loggedIn) {
      const loginEmail = canonicalizeEmail(loggedIn.email);
      if (!user || (email.includes("@") && loginEmail === email) || !email.includes("@")) {
        user = (await getUserById(env.DB, loggedIn.id)) ?? loggedIn;
      }
    }

    if (user) {
      const stamp = `Stripe ${kind} paid ${sessionId} · ${new Date().toISOString()}`;
      const prevNotes = String(user.notes || "");
      const alreadyRecorded = prevNotes.includes(sessionId);
      const previousTier = String(
        session.metadata?.gysh_previous_tier || user.membership_tier || "free",
      ).toLowerCase();
      const notes = alreadyRecorded
        ? prevNotes
        : `${prevNotes}${prevNotes ? " · " : ""}${stamp}`.slice(0, 1900);
      const nextTier =
        kind === "membership" && ["starter", "pro", "elite"].includes(tier) ? tier : undefined;
      const nextAudience = ["kids", "junior", "adult", "senior"].includes(audience)
        ? audience
        : undefined;
      const now = new Date().toISOString();

      if (nextTier && nextAudience) {
        await env.DB.prepare(
          `UPDATE users SET membership_tier = ?, audience = ?, notes = ?, updated_at = ? WHERE id = ?`,
        )
          .bind(nextTier, nextAudience, notes, now, user.id)
          .run();
      } else if (nextTier) {
        await env.DB.prepare(
          `UPDATE users SET membership_tier = ?, notes = ?, updated_at = ? WHERE id = ?`,
        )
          .bind(nextTier, notes, now, user.id)
          .run();
      } else {
        await env.DB.prepare(`UPDATE users SET notes = ?, updated_at = ? WHERE id = ?`)
          .bind(notes, now, user.id)
          .run();
      }

      const subscriptionId = stripeSubscriptionIdFromSession(session);
      if (subscriptionId && kind === "membership") {
        try {
          await setUserStripeSubscriptionId(env, user.id, subscriptionId);
        } catch {
          /* column may be missing until migration — best-effort */
        }
      }

      await appendAudit(
        env.DB,
        (await import("../../src/lib/credit-pack-purchase")).purchaseAuditAction(kind),
        user.email,
        (await import("../../src/lib/credit-pack-purchase")).purchaseAuditDetail({
          kind,
          itemMeta: String(session.metadata?.gysh_item || ""),
          amountCents: Number(session.amount_total || 0),
          sessionId,
        }),
      );

      try {
        const { grantCreditPackPurchase, spendCheckoutCredits } = await import("./member-credits");
        const paidAt = session.created
          ? new Date(session.created * 1000).toISOString()
          : new Date().toISOString();
        const pack = await grantCreditPackPurchase(env, {
          userId: user.id,
          sessionId,
          itemMeta: String(session.metadata?.gysh_item || ""),
          paidAt,
        });
        if (pack.granted > 0) {
          await appendAudit(
            env.DB,
            "credits_granted",
            user.email,
            `+${pack.granted} Kid Credits · ${sessionId}`,
          );
        }
        const creditsApplied = Math.max(
          0,
          Math.floor(Number(session.metadata?.gysh_credits_applied) || 0),
        );
        if (creditsApplied > 0 && !alreadyRecorded) {
          await spendCheckoutCredits(
            env,
            user.id,
            creditsApplied,
            `Checkout · ${creditsApplied} Kid Credits · ${sessionId}`,
            paidAt,
          );
        }
      } catch {
        /* credit wallet optional */
      }

      const refreshed = await getUserById(env.DB, user.id);
      updatedUser = publicUser(
        refreshed ?? {
          ...user,
          membership_tier: nextTier || user.membership_tier,
          audience: nextAudience || user.audience,
          notes,
        },
      );

      if (
        !alreadyRecorded &&
        (kind === "alacarte" || kind === "credit_pack") &&
        (updatedUser.email || email).includes("@")
      ) {
        try {
          const { sendAlaCartePurchaseEmails } = await import("./email");
          await sendAlaCartePurchaseEmails(env, {
            email: updatedUser.email || email,
            name: updatedUser.name,
            userId: updatedUser.id,
            itemMeta: String(session.metadata?.gysh_item || ""),
            amountCents: Number(session.amount_total || 0),
            sessionId,
            kind,
            source: "stripe",
            creditsApplied: Math.max(
              0,
              Math.floor(Number(session.metadata?.gysh_credits_applied) || 0),
            ),
          });
        } catch {
          /* email is best-effort */
        }
      }

      // Member + admin emails on first successful membership payment for this session.
      if (!alreadyRecorded && nextTier && kind === "membership") {
        try {
          const { sendMembershipSubscriptionEmails } = await import("./email");
          const interval = String(session.metadata?.gysh_interval || "month");
          const creditsApplied = Math.max(
            0,
            Math.floor(Number(session.metadata?.gysh_credits_applied) || 0),
          );
          await sendMembershipSubscriptionEmails(env, {
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              name: updatedUser.name,
              membership_tier: updatedUser.membershipTier,
              audience: updatedUser.audience,
            },
            previousTier,
            source: creditsApplied > 0 && Number(session.amount_total || 0) === 0 ? "credits" : "stripe",
            amountCents: Number(session.amount_total || 0),
            creditsApplied,
            sessionId,
            amountLabel:
              interval === "year" ? "Yearly membership" : "Monthly membership",
          });
        } catch {
          /* email is best-effort */
        }

        try {
          const { grantMembershipPlanCredits } = await import("./member-credits");
          await grantMembershipPlanCredits(
            env,
            user.id,
            nextTier,
            nextAudience || String(user.audience || "adult"),
          );
        } catch {
          /* credits best-effort */
        }
      }

      // Financials ledger (all paid checkout kinds).
      if (!alreadyRecorded) {
        try {
          const { upsertGyshPayment } = await import("./stripe-payments");
          await upsertGyshPayment(env, {
            sessionId,
            paymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            email: updatedUser.email,
            userId: updatedUser.id,
            kind,
            tier: nextTier || String(session.metadata?.gysh_tier || ""),
            audience: nextAudience || String(session.metadata?.gysh_audience || ""),
            interval: String(session.metadata?.gysh_interval || ""),
            item: String(session.metadata?.gysh_item || ""),
            amountCents: Number(session.amount_total || 0),
            currency: String(session.currency || "usd"),
            paidAt: session.created
              ? new Date(session.created * 1000).toISOString()
              : new Date().toISOString(),
            source: "stripe",
          });
        } catch {
          /* ledger is best-effort */
        }
      }
    } else if (email.includes("@")) {
      let guestAlreadyRecorded = false;
      try {
        const { gyshPaymentExistsForSession } = await import("./stripe-payments");
        guestAlreadyRecorded = await gyshPaymentExistsForSession(env, sessionId);
      } catch {
        guestAlreadyRecorded = false;
      }
      try {
        const { upsertGyshPayment } = await import("./stripe-payments");
        await upsertGyshPayment(env, {
          sessionId,
          paymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          email,
          kind,
          tier,
          audience,
          interval: String(session.metadata?.gysh_interval || ""),
          item: String(session.metadata?.gysh_item || ""),
          amountCents: Number(session.amount_total || 0),
          currency: String(session.currency || "usd"),
          paidAt: session.created
            ? new Date(session.created * 1000).toISOString()
            : new Date().toISOString(),
          source: "stripe",
        });
      } catch {
        /* ledger is best-effort */
      }
      try {
        const { purchaseAuditAction, purchaseAuditDetail } = await import(
          "../../src/lib/credit-pack-purchase"
        );
        await appendAudit(
          env.DB,
          purchaseAuditAction(kind),
          email,
          purchaseAuditDetail({
            kind,
            itemMeta: String(session.metadata?.gysh_item || ""),
            amountCents: Number(session.amount_total || 0),
            sessionId,
          }),
        );
      } catch {
        /* audit is best-effort */
      }
      if (!guestAlreadyRecorded && (kind === "alacarte" || kind === "credit_pack")) {
        try {
          const { sendAlaCartePurchaseEmails } = await import("./email");
          await sendAlaCartePurchaseEmails(env, {
            email,
            itemMeta: String(session.metadata?.gysh_item || ""),
            amountCents: Number(session.amount_total || 0),
            sessionId,
            kind,
            source: "stripe",
            creditsApplied: Math.max(
              0,
              Math.floor(Number(session.metadata?.gysh_credits_applied) || 0),
            ),
          });
        } catch {
          /* email is best-effort */
        }
      }
    }
  }

  return json({
    ok: true,
    paid,
    sessionId: session.id,
    email: email || updatedUser?.email || null,
    tier: (updatedUser?.membershipTier as string) || tier || null,
    audience: (updatedUser?.audience as string) || audience || null,
    kind,
    paymentStatus: session.payment_status || null,
    user: updatedUser,
  });
}
