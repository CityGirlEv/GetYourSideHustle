import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { getStripeClient, getStripeWebhookSecret, handleStripeWebhookEvent } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = getStripeWebhookSecret();
        if (!secret) {
          console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
        }

        const rawBody = await request.text();
        let event: Stripe.Event;

        try {
          const stripe = getStripeClient();
          event = stripe.webhooks.constructEvent(rawBody, signature, secret);
        } catch (err) {
          console.error("[stripe/webhook] signature verification failed", err);
          return Response.json({ error: "Invalid signature" }, { status: 400 });
        }

        try {
          await handleStripeWebhookEvent(event);
          return Response.json({ received: true });
        } catch (err) {
          console.error("[stripe/webhook] handler error", { type: event.type, err });
          return Response.json({ error: "Webhook handler failed" }, { status: 500 });
        }
      },
    },
  },
});
