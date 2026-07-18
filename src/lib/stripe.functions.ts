import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { publicSiteUrl } from "@/lib/site-url";
import {
  ensureAgentStripeCustomer,
  getStripeClient,
  loadUserSubscriptionSnapshot,
} from "@/lib/stripe.server";
import {
  getStripePlanDefinition,
  resolveStripePriceId,
  type StripePlanKey,
} from "@/lib/stripe-products";
import { hasAgentDashboardAccess } from "@/lib/subscription-access";
import { buildNdaPdf, NDA_VERSION } from "@/lib/nda";
import { markPasswordConfirmed } from "@/lib/password-status.server";

const planKeySchema = z.enum([
  "subscription_intro",
  "subscription_regular",
  "payg_1",
  "payg_2",
  "payg_3",
]);

function siteBaseUrl(): string {
  return publicSiteUrl().replace(/\/$/, "");
}

async function createCheckoutForUser(opts: {
  userId: string;
  email: string;
  fullName?: string;
  planKey: StripePlanKey;
}): Promise<string> {
  const plan = getStripePlanDefinition(opts.planKey);
  const priceId = resolveStripePriceId(opts.planKey);
  if (!plan || !priceId) {
    throw new Error(
      `Plan "${opts.planKey}" is not configured. Set ${plan?.priceEnvVar ?? "STRIPE_PRICE_*"} in your environment.`,
    );
  }

  const stripe = getStripeClient();
  const customerId = await ensureAgentStripeCustomer({
    userId: opts.userId,
    email: opts.email,
    fullName: opts.fullName,
  });

  const base = siteBaseUrl();
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: opts.userId,
    mode: plan.mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/agent?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/features?tab=agents&checkout=canceled#agent-pricing`,
    metadata: {
      user_id: opts.userId,
      plan_key: opts.planKey,
    },
    subscription_data:
      plan.mode === "subscription"
        ? {
            metadata: {
              user_id: opts.userId,
              plan_key: opts.planKey,
            },
          }
        : undefined,
    allow_promotion_codes: true,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/** Authenticated user starts Stripe Checkout for a plan. */
export const createStripeCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ planKey: planKeySchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const email = authUser.user?.email;
    if (!email) throw new Error("Account email not found");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", context.userId)
      .maybeSingle();

    const url = await createCheckoutForUser({
      userId: context.userId,
      email,
      fullName: profile?.full_name ?? undefined,
      planKey: data.planKey,
    });

    return { url };
  });

/** Authenticated user opens Stripe Customer Portal for billing management. */
export const createStripeCustomerPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: agent } = await supabaseAdmin
      .from("agents")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!agent?.stripe_customer_id) {
      throw new Error("No billing account found. Subscribe to a plan first.");
    }

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: agent.stripe_customer_id,
      return_url: `${siteBaseUrl()}/agent?tab=billing`,
    });

    return { url: session.url };
  });

/** Billing + access snapshot for the signed-in user. */
export const getBillingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: roles }, subscription, { data: leadCredits }, { data: agent }] =
      await Promise.all([
        supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId),
        loadUserSubscriptionSnapshot(context.userId),
        supabaseAdmin
          .from("lead_credits")
          .select("balance, monthly_allowance, period_end")
          .eq("user_id", context.userId)
          .maybeSingle(),
        supabaseAdmin
          .from("agents")
          .select("stripe_customer_id")
          .eq("user_id", context.userId)
          .maybeSingle(),
      ]);

    const roleList = (roles ?? []).map((r) => r.role);
    return {
      roles: roleList,
      subscription,
      leadCredits: leadCredits ?? null,
      hasStripeCustomer: !!agent?.stripe_customer_id,
      agentDashboardAccess: hasAgentDashboardAccess({
        roles: roleList,
        subscription,
      }),
    };
  });

/** Public signup + immediate Stripe Checkout (customer role, account enabled). */
export const registerCustomerAndCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        first_name: z.string().trim().min(1).max(100),
        last_name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().min(7).max(40),
        password: z.string().min(12).max(128),
        password_confirm: z.string().min(12).max(128),
        signature_name: z.string().trim().min(3).max(200),
        accept_nda: z.literal(true),
        planKey: planKeySchema,
        user_agent: z.string().max(500).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (data.password !== data.password_confirm) {
      throw new Error("Passwords do not match.");
    }

    const fullName = `${data.first_name.trim()} ${data.last_name.trim()}`;
    const email = data.email.trim().toLowerCase();

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = (existingUsers?.users ?? []).find(
      (u) => u.email?.toLowerCase() === email,
    );
    if (existing) {
      throw new Error("An account with this email already exists. Sign in to subscribe.");
    }

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone: data.phone.trim() },
      app_metadata: { account_status: "active", signup_source: "pricing_checkout" },
    });
    if (createErr || !created.user) {
      throw new Error(createErr?.message ?? "Failed to create account");
    }

    const userId = created.user.id;

    try {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        phone: data.phone.trim(),
      });

      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "customer" });
      await markPasswordConfirmed(userId);

      const signedAt = new Date();
      const pdf = buildNdaPdf({
        fullName: data.signature_name.trim(),
        email,
        signedAt,
        agreementVersion: NDA_VERSION,
        userAgent: data.user_agent ?? null,
      });
      const bytes = new Uint8Array(pdf.output("arraybuffer"));
      const path = `${userId}/${NDA_VERSION}-${signedAt.getTime()}.pdf`;
      await supabaseAdmin.storage
        .from("nda-signatures")
        .upload(path, bytes, { contentType: "application/pdf", upsert: false });
      await supabaseAdmin.from("nda_signatures").insert({
        user_id: userId,
        full_name: data.signature_name.trim(),
        email,
        agreement_version: NDA_VERSION,
        pdf_path: path,
        user_agent: data.user_agent ?? null,
      });

      const checkoutUrl = await createCheckoutForUser({
        userId,
        email,
        fullName,
        planKey: data.planKey,
      });

      return { checkoutUrl, email };
    } catch (e) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      throw e instanceof Error ? e : new Error("Registration failed");
    }
  });

export const listPublicStripePlans = createServerFn({ method: "POST" }).handler(async () => {
  const { listStripePlanDefinitions } = await import("@/lib/stripe-products");
  return listStripePlanDefinitions().map((plan) => ({
    ...plan,
    priceConfigured: !!resolveStripePriceId(plan.key),
  }));
});
