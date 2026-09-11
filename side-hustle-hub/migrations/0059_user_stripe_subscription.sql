-- Store Stripe subscription id for member self-serve cancel.
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT NOT NULL DEFAULT '';
