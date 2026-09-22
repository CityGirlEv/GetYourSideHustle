/**
 * Sync GYSH memberships, a-la-carte items, and credit packs to Stripe (test or live).
 *
 * Membership lookup keys ending in `_month` are billed every 3 months
 * (`recurring.interval_count: 3`) at 3× the monthly sticker — not monthly.
 * Yearly prices stay yearly. Existing monthly subscriptions are moved onto the
 * new quarterly Price with no immediate proration.
 *
 * Usage:
 *   node --use-system-ca scripts/sync-stripe-catalog.mjs
 *
 * Reads STRIPE_SECRET_KEY from .dev.vars or the environment.
 * Writes src/lib/stripe-catalog.generated.ts with Price IDs.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function loadDotEnvVars(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnvVars(join(root, ".dev.vars"));
loadDotEnvVars(join(root, ".env"));

const secret = process.env.STRIPE_SECRET_KEY?.trim();
if (!secret) {
  console.error("Missing STRIPE_SECRET_KEY in .dev.vars or environment.");
  process.exit(1);
}
if (!secret.startsWith("sk_test_") && !secret.startsWith("sk_live_")) {
  console.error("STRIPE_SECRET_KEY does not look like a Stripe secret key.");
  process.exit(1);
}

/** Prefer local, then parent mypartb install. */
function loadStripe() {
  try {
    return require("stripe");
  } catch {
    return require(join(root, "..", "node_modules", "stripe"));
  }
}

const Stripe = loadStripe();
const stripe = new Stripe(secret, { apiVersion: "2025-07-30.basil" });

const MEMBERSHIP_TIERS = [
  {
    id: "starter",
    name: "Starter",
    priceMonthlyUsd: 39,
    priceYearlyUsd: 390,
    priceMonthlyUsdSenior: 34,
    priceYearlyUsdSenior: 340,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthlyUsd: 69,
    priceYearlyUsd: 690,
    priceMonthlyUsdSenior: 57,
    priceYearlyUsdSenior: 570,
  },
  {
    id: "elite",
    name: "Elite",
    priceMonthlyUsd: 119,
    priceYearlyUsd: 1190,
    priceMonthlyUsdSenior: 94,
    priceYearlyUsdSenior: 940,
  },
];

const ALA_CARTE = [
  { id: "story-time", name: "Kevina Starr Story Time (1 session)", priceUsd: 15 },
  { id: "junior-lab", name: "Teens Glow Lab seat", priceUsd: 25 },
  { id: "workshop-general", name: "Workshops (Starter & Above Workshops Free)", priceUsd: 40 },
  { id: "training-group", name: "Group training session", priceUsd: 45 },
  { id: "consult-30", name: "1-on-1 consulting (30 min)", priceUsd: 45 },
  { id: "consult-60", name: "1-on-1 consulting (60 min)", priceUsd: 65 },
  { id: "consult-90", name: "1-on-1 consulting (90 min)", priceUsd: 75 },
  { id: "consult-120", name: "1-on-1 consulting (2 hours)", priceUsd: 145 },
  { id: "progress-pdf", name: "Progress report PDF (one-off)", priceUsd: 12 },
  { id: "zip-timing", name: "Best-times ZipCode scout (month)", priceUsd: 29 },
];

const CREDIT_PACKS = [
  { id: "boost", name: "Boost Pack (5 credits)", priceUsd: 5 },
  { id: "builder", name: "Builder Pack (10 credits)", priceUsd: 10 },
  { id: "launcher", name: "Launcher Pack (20 credits)", priceUsd: 20 },
  { id: "family", name: "Family Pack (40 credits)", priceUsd: 40 },
];

function dollarsToCents(n) {
  return Math.round(Number(n) * 100);
}

async function findProductByLookup(lookupKey) {
  const existing = await stripe.products.search({
    query: `metadata["gysh_lookup"]:"${lookupKey}"`,
    limit: 1,
  });
  return existing.data[0] || null;
}

async function ensureProduct({ lookupKey, name, description, metadata }) {
  const found = await findProductByLookup(lookupKey);
  if (found) {
    const updated = await stripe.products.update(found.id, {
      name,
      description: description || undefined,
      metadata: { ...found.metadata, ...metadata, gysh_lookup: lookupKey },
      active: true,
    });
    return updated;
  }
  return stripe.products.create({
    name,
    description: description || undefined,
    metadata: { ...metadata, gysh_lookup: lookupKey },
  });
}

async function ensurePrice({
  productId,
  lookupKey,
  unitAmountCents,
  recurring,
  metadata,
}) {
  let previousPriceId = null;
  try {
    const byKey = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1, expand: ["data.product"] });
    const existing = byKey.data[0];
    if (existing) {
      const sameAmount = existing.unit_amount === unitAmountCents && existing.active;
      const existingCount = existing.recurring?.interval_count || 1;
      const wantCount = recurring?.interval_count || 1;
      const sameRecurring =
        !recurring ||
        (existing.recurring?.interval === recurring.interval && existingCount === wantCount);
      if (sameAmount && sameRecurring) {
        return { price: existing, previousPriceId: null };
      }
      // Stripe prices are immutable for amount/interval — deactivate and create a new one with same lookup_key.
      previousPriceId = existing.id;
      await stripe.prices.update(existing.id, { active: false, lookup_key: null });
    }
  } catch {
    // fall through to create
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: unitAmountCents,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    ...(recurring ? { recurring } : {}),
    metadata,
  });
  return { price, previousPriceId };
}

/** Move active monthly subscriptions onto the new every-3-months Price (no immediate proration). */
async function migrateSubscriptionsToQuarterlyPrice(oldPriceId, newPriceId) {
  if (!oldPriceId || !newPriceId || oldPriceId === newPriceId) return;
  let startingAfter;
  let moved = 0;
  for (;;) {
    const page = await stripe.subscriptions.list({
      price: oldPriceId,
      status: "all",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    for (const sub of page.data) {
      if (!["active", "trialing", "past_due"].includes(sub.status)) continue;
      const item = sub.items?.data?.[0];
      if (!item?.id) continue;
      const rec = item.price?.recurring;
      if (rec?.interval === "month" && rec.interval_count === 3) continue;
      try {
        await stripe.subscriptions.update(sub.id, {
          items: [{ id: item.id, price: newPriceId }],
          proration_behavior: "none",
          metadata: {
            ...(sub.metadata || {}),
            gysh_interval: "quarter",
            gysh_commitment_months: "3",
          },
        });
        moved += 1;
        console.log(`  ↻ subscription ${sub.id} → every 3 months (${newPriceId})`);
      } catch (err) {
        console.warn(`  ! could not migrate ${sub.id}: ${err?.message || err}`);
      }
    }
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1].id;
  }
  if (moved) console.log(`  migrated ${moved} subscription(s) off ${oldPriceId}`);
}

const catalog = {
  mode: secret.startsWith("sk_live_") ? "live" : "test",
  syncedAt: new Date().toISOString(),
  memberships: {},
  alaCarte: {},
  creditPacks: {},
};

console.log(`Syncing GYSH Stripe catalog (${catalog.mode})…`);

for (const tier of MEMBERSHIP_TIERS) {
  catalog.memberships[tier.id] = {};
  for (const audience of ["adult", "senior"]) {
    catalog.memberships[tier.id][audience] = {};
    for (const interval of ["month", "year"]) {
      const monthly =
        audience === "senior" ? tier.priceMonthlyUsdSenior : tier.priceMonthlyUsd;
      const yearly =
        audience === "senior" ? tier.priceYearlyUsdSenior : tier.priceYearlyUsd;
      const usd = interval === "month" ? Math.round(monthly * 3 * 100) / 100 : yearly;
      const audienceLabel = audience === "senior" ? "Seniors (50+)" : "Adults";
      const intervalLabel = interval === "month" ? "Every 3 months" : "Yearly";
      const productLookup = `gysh_membership_${tier.id}_${audience}`;
      const priceLookup = `gysh_membership_${tier.id}_${audience}_${interval}`;
      const product = await ensureProduct({
        lookupKey: productLookup,
        name: `GYSH ${tier.name} — ${audienceLabel}`,
        description: `${tier.name} membership for ${audienceLabel}. Billed every 3 months (or yearly).`,
        metadata: {
          gysh_kind: "membership",
          gysh_tier: tier.id,
          gysh_audience: audience,
        },
      });
      const { price, previousPriceId } = await ensurePrice({
        productId: product.id,
        lookupKey: priceLookup,
        unitAmountCents: dollarsToCents(usd),
        recurring:
          interval === "year"
            ? { interval: "year" }
            : { interval: "month", interval_count: 3 },
        metadata: {
          gysh_kind: "membership",
          gysh_tier: tier.id,
          gysh_audience: audience,
          gysh_interval: interval === "month" ? "quarter" : interval,
        },
      });
      if (interval === "month") {
        await migrateSubscriptionsToQuarterlyPrice(previousPriceId, price.id);
      }
      catalog.memberships[tier.id][audience][interval] = {
        productId: product.id,
        priceId: price.id,
        amountUsd: usd,
        label: `${tier.name} ${audienceLabel} ${intervalLabel}`,
      };
      console.log(`  ✓ ${priceLookup} → ${price.id} ($${usd} / ${interval === "month" ? "3 months" : "year"})`);
    }
  }
}

for (const item of ALA_CARTE) {
  const productLookup = `gysh_alacarte_${item.id}`;
  const priceLookup = `gysh_alacarte_${item.id}_once`;
  const product = await ensureProduct({
    lookupKey: productLookup,
    name: `GYSH ${item.name}`,
    description: "A-la-carte GYSH purchase",
    metadata: { gysh_kind: "alacarte", gysh_id: item.id },
  });
  const { price } = await ensurePrice({
    productId: product.id,
    lookupKey: priceLookup,
    unitAmountCents: dollarsToCents(item.priceUsd),
    recurring: null,
    metadata: { gysh_kind: "alacarte", gysh_id: item.id },
  });
  catalog.alaCarte[item.id] = {
    productId: product.id,
    priceId: price.id,
    amountUsd: item.priceUsd,
    label: item.name,
  };
  console.log(`  ✓ ${priceLookup} → ${price.id} ($${item.priceUsd})`);
}

for (const pack of CREDIT_PACKS) {
  const productLookup = `gysh_credits_${pack.id}`;
  const priceLookup = `gysh_credits_${pack.id}_once`;
  const product = await ensureProduct({
    lookupKey: productLookup,
    name: `GYSH ${pack.name}`,
    description: "Kid / Teen credit top-up pack",
    metadata: { gysh_kind: "credit_pack", gysh_id: pack.id },
  });
  const { price } = await ensurePrice({
    productId: product.id,
    lookupKey: priceLookup,
    unitAmountCents: dollarsToCents(pack.priceUsd),
    recurring: null,
    metadata: { gysh_kind: "credit_pack", gysh_id: pack.id },
  });
  catalog.creditPacks[pack.id] = {
    productId: product.id,
    priceId: price.id,
    amountUsd: pack.priceUsd,
    label: pack.name,
  };
  console.log(`  ✓ ${priceLookup} → ${price.id} ($${pack.priceUsd})`);
}

const outPath = join(root, "src", "lib", "stripe-catalog.generated.ts");
const body = `/* AUTO-GENERATED by scripts/sync-stripe-catalog.mjs — do not edit by hand. */
/* mode: ${catalog.mode} | syncedAt: ${catalog.syncedAt} */

export type StripeCatalogPrice = {
  productId: string;
  priceId: string;
  amountUsd: number;
  label: string;
};

export type StripeCatalog = {
  mode: "test" | "live";
  syncedAt: string;
  memberships: Record<
    string,
    Record<string, Partial<Record<"month" | "year", StripeCatalogPrice>>>
  >;
  alaCarte: Record<string, StripeCatalogPrice>;
  creditPacks: Record<string, StripeCatalogPrice>;
};

export const STRIPE_CATALOG: StripeCatalog = ${JSON.stringify(catalog, null, 2)} as const;
`;

writeFileSync(outPath, body, "utf8");
writeFileSync(join(root, "functions", "_lib", "stripe-catalog.generated.ts"), body, "utf8");
writeFileSync(join(root, "scripts", "stripe-catalog.last.json"), JSON.stringify(catalog, null, 2), "utf8");

console.log(`\nWrote ${outPath}`);
console.log("Wrote functions/_lib/stripe-catalog.generated.ts");
console.log("Done.");
