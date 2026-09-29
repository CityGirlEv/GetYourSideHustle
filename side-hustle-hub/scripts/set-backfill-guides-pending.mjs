/**
 * Set backfilled guides to Pending / Needs Further Review in remote D1.
 * published code 2 = pending.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/** Keep in sync with GUIDES_PENDING_AFTER_PREP_TAB_BACKFILL in guide-marketing-plan.ts */
const IDS = [
  "airbnb",
  "food-delivery",
  "property-mgmt",
  "book-publishing",
  "bookkeeping",
  "etsy-store",
  "nonprofit-social-helper",
  "community-newsletter-creator",
  "teaching",
  "review-response-assistant",
  "google-business-helper",
  "notary",
  "resume-linkedin-helper",
  "rideshare",
  "short-form-video-editor",
  "social",
  "ugc-creator",
  "virtual-assistant",
  "virtual-receptionist",
  "affiliate",
  "ai-agents",
  "ai-timing",
  "amazon",
  "digital-products",
  "dropshipping",
  "web-leads",
  "pod",
  "str-cohost",
  "airbnb-cohost",
  "virtual-call-assistant",
  "flipping-properties",
  "lien-tax-sales",
  "foreclosure-properties",
  "fb-marketplace-helper",
  "online-research-assistant",
  "digital-organizer",
  "transcription-notes-helper",
  "family-history-organizer",
  "digital-photo-organizer",
  "local-content-photographer",
  "local-event-content-creator",
  "travel-research-assistant",
  "online-community-moderator",
  "group-setup-helper",
  "website-tester",
  "digital-product-formatter",
  "appointment-setter",
  "lead-followup-assistant",
  "house-sitter",
  "porch-package-helper",
  "closet-organizer",
  "estate-sale-listing-helper",
  "personal-shopper",
  "airbnb-turnover-checker",
  "youth-sports-helper",
  "birthday-party-helper",
  "kids-party-game-host",
  "closet-cleanout-listing",
  "local-resource-list-creator",
  "start-gardening-club",
  "start-book-club",
  "book-publishing-kids",
  "create-games-junior",
  "babysitting",
  "mailbox-cleaning",
  "custom-bookmark-creator",
  "mothers-helper",
  "homework-organizer",
  "junior-savings-ceo",
  "junior-give-back-teach",
  "junior-games-ai",
  "junior-reinvest-ceo",
  "junior-content-create",
  "create-games-kids",
  "kids-piggy-first-goal",
  "kids-kindness-share",
  "kids-games-ai",
  "kids-reinvest-jar",
  "kids-craft-hustle",
  "cleaning-service",
  "consulting",
  "ai-assets",
  "ai-social-helper",
  "ai-promo-video",
  "ai-prompt-helper",
  "ai-peers",
  "local-business-ai-setup",
];

const now = new Date().toISOString();
const by = "system:prep-tab-backfill";
const values = IDS.map(
  (id) => `('${id.replace(/'/g, "''")}', 2, 0, 0, '{}', '${now}', '${by}')`,
).join(",\n");

const sql = `INSERT INTO guide_catalog_state
  (guide_id, published, deleted, custom, patch_json, updated_at, updated_by)
VALUES
${values}
ON CONFLICT(guide_id) DO UPDATE SET
  published = 2,
  deleted = 0,
  updated_at = excluded.updated_at,
  updated_by = excluded.updated_by
WHERE guide_catalog_state.published = 1 OR guide_catalog_state.published IS NULL;
`;

const file = join(tmpdir(), `gysh-pending-backfill-${Date.now()}.sql`);
writeFileSync(file, sql, "utf8");
console.log(`Setting ${IDS.length} guides to Pending (Active→Pending only) via ${file}`);

const result = spawnSync(
  "npx",
  ["wrangler", "d1", "execute", "gysh-db", "--remote", "--file", file],
  {
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: "--use-system-ca" },
    encoding: "utf8",
    shell: true,
  },
);
console.log(result.stdout || "");
if (result.stderr) console.error(result.stderr);
try {
  unlinkSync(file);
} catch {
  /* ignore */
}
process.exit(result.status ?? 1);
