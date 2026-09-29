-- stripe_subscription_id may already exist on production from an earlier manual apply.
-- Keep this migration as a no-op so the chain can advance to later files.
SELECT 1;
