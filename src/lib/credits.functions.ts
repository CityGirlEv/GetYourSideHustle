import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Server-side credit purchase. Routes through the service role so the
// underlying `purchase_credits` RPC is no longer client-callable. This is
// the gate where a real payment-provider verification (Stripe payment_intent,
// Paddle transaction, etc.) should be performed before crediting the user.
export const purchaseCreditsServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      amount: z.number().int().min(1).max(500),
      description: z.string().trim().min(1).max(200),
      // Placeholder for a real payment token. Until a payment provider is
      // wired in, callers omit this and the demo checkout grants credits.
      payment_token: z.string().trim().min(1).max(512).optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // TODO: when a payment provider is integrated, verify `data.payment_token`
    // here (e.g. Stripe `paymentIntents.retrieve`) and reject if the charge is
    // not succeeded / does not match `data.amount`. Until then this remains a
    // server-controlled demo grant — but the public RPC has been revoked, so
    // the only callers are this function and admin tooling.

    // Upsert balance.
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("advisor_credits")
      .select("balance")
      .eq("advisor_id", userId)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    const newBalance = (existing?.balance ?? 0) + data.amount;
    const { error: upErr } = await supabaseAdmin
      .from("advisor_credits")
      .upsert({ advisor_id: userId, balance: newBalance, updated_at: new Date().toISOString() });
    if (upErr) throw new Error(upErr.message);

    const { error: txErr } = await supabaseAdmin
      .from("credit_txns")
      .insert({ advisor_id: userId, amount: data.amount, description: data.description });
    if (txErr) throw new Error(txErr.message);

    return { balance: newBalance };
  });