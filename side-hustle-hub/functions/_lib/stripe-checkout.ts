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
  checkoutReturnOrigin,
  requireStripeSecret,
  retrieveStripeCheckoutSession,
} from "./stripe";

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

export function resolveAlaCarteCheckoutLines(
  rawItems: Array<{ itemId?: string; quantity?: number }> | undefined,
  fallbackItemId?: string,
):
  | {
      ok: true;
      mode: "payment";
      label: string;
      amountUsd: number;
      lines: Array<{ priceId: string; quantity: number; itemId: string; label: string; amountUsd: number }>;
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
  }> = [];
  for (const raw of source) {
    const itemId = String(raw.itemId || "").trim();
    const quantity = Math.max(1, Math.min(99, Math.floor(Number(raw.quantity) || 1)));
    const row = STRIPE_CATALOG.alaCarte[itemId];
    if (!row?.priceId) {
      return { ok: false, error: `A-la-carte item "${itemId || "?"}" is not configured in Stripe.` };
    }
    lines.push({
      priceId: row.priceId,
      quantity,
      itemId,
      label: row.label,
      amountUsd: row.amountUsd * quantity,
    });
  }
  const amountUsd = Math.round(lines.reduce((n, l) => n + l.amountUsd, 0) * 100) / 100;
  const label =
    lines.length === 1
      ? `${lines[0]!.label}${lines[0]!.quantity > 1 ? ` × ${lines[0]!.quantity}` : ""}`
      : `A-la-carte cart (${lines.length} items)`;
  return { ok: true, mode: "payment", label, amountUsd, lines };
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
    /** Browser app origin (e.g. http://localhost:5173) for success/cancel URLs. */
    returnOrigin?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const kind = (body.kind || "membership") as CheckoutKind;
  const email = canonicalizeEmail(String(body.email || ""));
  if (!email.includes("@")) return error("A valid email is required for checkout.");

  let mode: "subscription" | "payment";
  let label: string;
  let amountUsd: number;
  let lineItems: Array<{ priceId: string; quantity: number }>;
  let cartMeta = "";

  if (kind === "alacarte") {
    const cart = resolveAlaCarteCheckoutLines(body.items, body.itemId);
    if (!cart.ok) return error(cart.error, 400);
    mode = cart.mode;
    label = cart.label;
    amountUsd = cart.amountUsd;
    lineItems = cart.lines.map((l) => ({ priceId: l.priceId, quantity: l.quantity }));
    cartMeta = cart.lines.map((l) => `${l.itemId}x${l.quantity}`).join(",");
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
    amountUsd = resolved.amountUsd;
    lineItems = [{ priceId: resolved.priceId, quantity: 1 }];
    cartMeta = String(body.itemId || body.packId || "");
  }

  const user = await getUserByEmail(env.DB, email);
  const origin = checkoutReturnOrigin(request, { preferredOrigin: body.returnOrigin });
  const successUrl = `${origin}/membership?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/membership?checkout=canceled`;

  const metadata: Record<string, string> = {
    gysh_kind: kind,
    gysh_email: email,
    gysh_tier: String(body.tierId || ""),
    gysh_audience: String(body.audience || ""),
    gysh_interval: String(body.interval || "month"),
    gysh_item: cartMeta,
    gysh_previous_tier: String(user?.membership_tier || "free").toLowerCase(),
  };

  const form: Record<string, string | number | undefined | null> = {
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: user?.id || email,
    customer_email: email,
    allow_promotion_codes: "true",
    "metadata[gysh_kind]": metadata.gysh_kind,
    "metadata[gysh_email]": metadata.gysh_email,
    "metadata[gysh_tier]": metadata.gysh_tier,
    "metadata[gysh_audience]": metadata.gysh_audience,
    "metadata[gysh_interval]": metadata.gysh_interval,
    "metadata[gysh_item]": metadata.gysh_item,
    "metadata[gysh_previous_tier]": metadata.gysh_previous_tier,
  };

  lineItems.forEach((line, index) => {
    form[`line_items[${index}][price]`] = line.priceId;
    form[`line_items[${index}][quantity]`] = line.quantity;
  });

  if (mode === "subscription") {
    form["subscription_data[metadata][gysh_email]"] = email;
    form["subscription_data[metadata][gysh_tier]"] = metadata.gysh_tier;
    form["subscription_data[metadata][gysh_audience]"] = metadata.gysh_audience;
  }

  const created = await createStripeCheckoutSession(secret, form);
  if (!created.ok) return error(created.error, 502);

  await appendAudit(
    env.DB,
    "stripe_checkout_create",
    email,
    `${kind}:${label}:${created.session.id}`,
  );

  return json({
    ok: true,
    url: created.session.url,
    sessionId: created.session.id,
    mode,
    label,
    amountUsd,
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

      await appendAudit(
        env.DB,
        "stripe_checkout_paid",
        user.email,
        `${kind}:${sessionId}:${tier}:${audience}`,
      );

      const refreshed = await getUserById(env.DB, user.id);
      updatedUser = publicUser(
        refreshed ?? {
          ...user,
          membership_tier: nextTier || user.membership_tier,
          audience: nextAudience || user.audience,
          notes,
        },
      );

      // Member + admin emails on first successful membership payment for this session.
      if (!alreadyRecorded && nextTier && kind === "membership") {
        try {
          const { sendMembershipSubscriptionEmails } = await import("./email");
          const interval = String(session.metadata?.gysh_interval || "month");
          await sendMembershipSubscriptionEmails(env, {
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              name: updatedUser.name,
              membership_tier: updatedUser.membershipTier,
              audience: updatedUser.audience,
            },
            previousTier,
            source: "stripe",
            amountLabel: interval === "year" ? "Yearly membership (Stripe)" : "Monthly membership (Stripe)",
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
