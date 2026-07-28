/**
 * Idempotent D1 seed for GYSH (remote production or local wrangler D1).
 *
 *   npm run db:migrate && npm run db:seed           # production (remote)
 *   npm run db:setup:local                          # local Pages Functions + D1
 *
 * Seeds T + E + Lyriq portal login accounts and the initial ops task backlog.
 * Safe to re-run (ON CONFLICT upserts users; tasks insert-if-missing).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./lib/password.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);
const isLocal = process.argv.includes("--local");

const now = new Date().toISOString();

const ADMINS = [
  {
    id: "u-tina",
    name: "Tina Marie Barham",
    email: "tinamariebarham@gmail.com",
    role: "admin",
    roles: ["admin", "qa"],
    password: "Admin123",
    notes: "Co-founder — kids / Kevina Starr focus; portal admin + QA Testing Portal",
  },
  {
    id: "u-ev",
    name: "Evelyn Irving",
    email: "evelyn3@cox.net",
    role: "admin",
    roles: ["admin", "qa", "dev"],
    password: "Admin",
    notes: "Co-founder — adult hustles & tech; portal admin + QA + Dev (owns failed tests)",
  },
  {
    id: "u-lyriq",
    name: "Lyriq Gaulden",
    email: "leegaulden1222@icloud.com",
    role: "admin",
    roles: ["admin", "qa"],
    password: "Lyriq123",
    notes: "Portal admin + QA — Kids/Youth side hustle guest speaker",
  },
];

/** Initial ops backlog — written once; never re-injected from the browser. */
const TASKS = [
  ["T-001", "Finalize GYSH brand kit (Antique Gold primary, Soft Ivory backgrounds)", "assets_brand", "P0", "done", "Evelyn", "Both", "07/10/26", "07/16/26", "07/16/26", "Live on getyoursidehustle.com"],
  ["T-002", "Integrate Kevina Starr Stories heavily into Kids Side Hustle Corner", "kids_corner", "P0", "done", "Tina", "Tina", "07/12/26", "07/16/26", "07/16/26", "Bio + embeds shipped"],
  ["T-003", "Create Facebook Page for Get Your Side Hustle", "facebook_social", "P0", "not_started", "Tina", "Tina", "07/16/26", "07/12/26", "", "Brand name + cover using GYSH color system"],
  ["T-004", "Write About page copy — T + E partnership story", "website", "P1", "in_progress", "Evelyn", "Both", "07/15/26", "07/16/26", "", "Include photo placeholders"],
  ["T-005", "Ship Contact page + GYSH inbox routing", "website", "P1", "not_started", "Evelyn", "Evelyn", "07/16/26", "07/22/26", "", ""],
  ["T-006", "Build Testing Portal + role-based Users Area (Admin/QA/Kid/Junior/Adult)", "admin_ops", "P0", "in_progress", "Evelyn", "Evelyn", "07/16/26", "07/16/26", "", "QA tester bubbles + role filters"],
  ["T-007", "Stand up Content Factory for Kevina + adult hustle posts", "content", "P1", "in_progress", "Tina", "Both", "07/16/26", "07/25/26", "", "Weekly batch: YT shorts hooks, FB, newsletter"],
  ["T-008", "Film / schedule 4 Kevina Glow Getter episodes for launch week", "youtube_kevina", "P1", "not_started", "Tina", "Tina", "07/16/26", "07/30/26", "", ""],
  ["T-009", "Adult hustle SEO landing pages (Airbnb, POD, Dropshipping)", "website", "P2", "not_started", "Evelyn", "Evelyn", "07/16/26", "08/05/26", "", ""],
  ["T-010", "Parent safety checklist PDF for Junior hustles", "kids_corner", "P2", "not_started", "Tina", "Tina", "07/16/26", "08/01/26", "", ""],
  ["T-011", "Change layout to brand colors", "assets_brand", "P0", "not_started", "Tina", "Evelyn", "07/16/26", "07/10/26", "", "Antique Gold / Soft Ivory across all views + footer"],
  ["T-012", "Tina: critique current draft site", "website", "P0", "done", "Evelyn", "Tina", "07/14/26", "07/15/26", "07/15/26", "Completed — feedback captured in shared notes"],
  ["T-013", "Tina: create shared Google Drive", "admin_ops", "P0", "done", "Evelyn", "Tina", "07/14/26", "07/15/26", "07/15/26", "GYSH shared drive live for assets + video review"],
  ["T-014", "Evelyn: review the 4 videos", "youtube_kevina", "P1", "not_started", "Tina", "Evelyn", "07/16/26", "07/22/26", "", "Review Kevina launch-week episodes in shared Drive"],
  ["T-015", "Wire task attachments to cloud storage (R2)", "admin_ops", "P1", "not_started", "Evelyn", "Evelyn", "07/16/26", "08/15/26", "", "Phase 2: replace browser IndexedDB blobs with R2"],
  [
    "T-016",
    "Ask our AI sidekicks (ChatGPT and/or Gemini) what they know about T + E — list side hustles we can do or already have knowledge of. Capture results and add strong fits to GYSH hustle catalog + Get Your Side Hustle wizard.",
    "content",
    "P0",
    "not_started",
    "Evelyn",
    "Both",
    "07/16/26",
    "07/25/26",
    "",
    "Example already known: Tina's book publishing (now in catalog). Capture AI brainstorm notes and promote strong fits.",
  ],
  [
    "T-017",
    "Review the side hustle pages and verbiage (all hustle cards, guides, Get Your Side Hustle copy, Kids/Junior where relevant — polish tone and accuracy).",
    "content",
    "P0",
    "not_started",
    "Evelyn",
    "Both",
    "07/16/26",
    "07/28/26",
    "",
    "Pass for tone, accuracy, and consistency with GYSH brand voice.",
  ],
  [
    "T-018",
    "Review workshops and conference dates",
    "workshops",
    "P0",
    "not_started",
    "Evelyn",
    "Both",
    "07/16/26",
    "08/10/26",
    "",
    "Post soft launch (Sprint 3) — confirm titles/blurbs; keep dates TBD until locked. Edit in Content Factory → Workshops.",
  ],
  [
    "T-019",
    "Set up a recurring meeting with Tina and Ev",
    "admin_ops",
    "P1",
    "not_started",
    "Evelyn",
    "Both",
    "07/16/26",
    "07/20/26",
    "",
    "Sprint 0 — weekly Tuesday sync on content calendar (T + E).",
  ],
  [
    "T-SENIOR-PAGE",
    "Review Senior Side Hustles page & verbiage",
    "senior_side_hustles",
    "P1",
    "not_started",
    "Auto-sync",
    "Both",
    "07/16/26",
    "",
    "",
    "page-review:senior-side-hustles",
  ],
  // Launch Guide reviews — keep IDs in sync with src/lib/launch-guides.ts (T-LG-{id})
  ["T-LG-airbnb", "Review Launch Guide: Airbnb Hosting — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:airbnb"],
  ["T-LG-pod", "Review Launch Guide: Print-on-Demand (POD) — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:pod"],
  ["T-LG-dropshipping", "Review Launch Guide: Dropshipping Business — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:dropshipping"],
  ["T-LG-affiliate", "Review Launch Guide: Affiliate Marketing — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:affiliate"],
  ["T-LG-amazon", "Review Launch Guide: Amazon FBA (Fulfillment by Amazon) — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:amazon"],
  ["T-LG-social", "Review Launch Guide: Social Influencer & Creator — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:social"],
  ["T-LG-web-leads", "Review Launch Guide: Local Website Lead Finder — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:web-leads"],
  ["T-LG-ai-assets", "Review Launch Guide: AI Asset Studio — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:ai-assets"],
  ["T-LG-property-mgmt", "Review Launch Guide: Property Management — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:property-mgmt"],
  ["T-LG-handyman", "Review Launch Guide: Handyman Services — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:handyman"],
  ["T-LG-rideshare", "Review Launch Guide: Rideshare (Uber / Lyft) — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:rideshare"],
  ["T-LG-food-delivery", "Review Launch Guide: DoorDash / Uber Eats — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:food-delivery"],
  ["T-LG-ai-timing", "Review Launch Guide: AI Timing Scout — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:ai-timing"],
  ["T-LG-ai-agents", "Review Launch Guide: AI Agents for Hustlers — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:ai-agents"],
  ["T-LG-book-publishing", "Review Launch Guide: Book Publishing — verify steps, costs, and verbiage", "content", "P1", "not_started", "Auto-sync", "Both", "07/16/26", "", "", "guide-review:book-publishing"],
];

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

function runSqlFile(sql) {
  const tmp = path.join(os.tmpdir(), `gysh-seed-${Date.now()}.sql`);
  fs.writeFileSync(tmp, sql, "utf8");
  try {
    const args = [
      "--use-system-ca",
      wrangler,
      "d1",
      "execute",
      "gysh-db",
      isLocal ? "--local" : "--remote",
      "--yes",
      "--file",
      tmp,
    ];
    if (isLocal) {
      args.push("--persist-to", ".wrangler/state");
    }
    const result = spawnSync("node", args, {
      cwd: root,
      encoding: "utf8",
      shell: process.platform === "win32",
    });
    if (result.status !== 0) {
      console.error(result.stdout || "");
      console.error(result.stderr || "");
      process.exit(result.status ?? 1);
    }
    return result.stdout || "";
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

function main() {
  console.log(`Seeding GYSH D1 (${isLocal ? "local" : "remote"})…`);

  const statements = [];

  for (const admin of ADMINS) {
    const { salt, hash } = hashPassword(admin.password);
    const rolesJson = JSON.stringify(admin.roles ?? [admin.role]);
    statements.push(`
INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, created_at, updated_at)
VALUES (
  '${sqlEscape(admin.id)}',
  '${sqlEscape(admin.name)}',
  '${sqlEscape(admin.email)}',
  '${sqlEscape(admin.role)}',
  '${sqlEscape(rolesJson)}',
  'active',
  '2026-07-01',
  '${sqlEscape(admin.notes)}',
  '${hash}',
  '${salt}',
  '${now}',
  '${now}'
)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  roles = excluded.roles,
  status = 'active',
  notes = excluded.notes,
  password_hash = excluded.password_hash,
  password_salt = excluded.password_salt,
  updated_at = excluded.updated_at;
`.trim());
    console.log(`  · preparing user ${admin.email}`);
  }

  statements.push(`DELETE FROM users WHERE email = 'evvelyn3@cox.net';`);
  statements.push(`DELETE FROM users WHERE email = 'leegaulden1222@icloud.com' AND id != 'u-lyriq';`);

  let order = 0;
  for (const t of TASKS) {
    const [id, description, category, priority, status, assignBy, assignedTo, dateAssigned, dueDate, dateCompleted, notes] = t;
    statements.push(`
INSERT INTO tasks (id, description, category, priority, status, assign_by, assigned_to, date_assigned, due_date, date_completed, notes, sort_order, updated_at)
VALUES (
  '${sqlEscape(id)}',
  '${sqlEscape(description)}',
  '${sqlEscape(category)}',
  '${sqlEscape(priority)}',
  '${sqlEscape(status)}',
  '${sqlEscape(assignBy)}',
  '${sqlEscape(assignedTo)}',
  '${sqlEscape(dateAssigned)}',
  '${sqlEscape(dueDate)}',
  '${sqlEscape(dateCompleted)}',
  '${sqlEscape(notes)}',
  ${order},
  '${now}'
)
ON CONFLICT(id) DO NOTHING;
`.trim());
    order += 1;
  }

  // Workshops defaults (dates TBD) — insert-if-missing
  const SPEAKERS = [
    ["tina", "Tina Marie Barham", "GYSH Co-Founder · Kids Glow & Motivation", "IT educator and storyteller behind Kevina Starr Stories. Tina leads family-friendly workshops on confidence, kindness, and teen earning skills.", '["Kids Glow","Storytelling","Teen Hustles","Parent Coaching"]', "#9B2F28", "TB"],
    ["evelyn", "Evelyn Irving", "GYSH Co-Founder · Tech & Adult Side Hustles", "Builds GYSH assets, AI agents, and launch systems. Evelyn hosts workshops on Airbnb ops, Meta+Shopify, apps, and automation pipelines.", '["Airbnb STR","AI Agents","Shopify","App Building"]', "#947D64", "EI"],
    ["kevina-voice", "Kevina Starr (Featured Series)", "Glow Getter Story Sessions", "Bedtime adventures from the Library of Light — paired with parent-led activity prompts after each GYSH kids workshop.", '["Confidence","Kindness","Creativity"]', "#9B2F28", "KS"],
    ["guest-str", "Marcus Hale", "STR Operations Consultant", "Guest speaker on furnishing budgets, dynamic pricing, and guest messaging systems for short-term rental side hustles.", '["Airbnb","Pricing","Ops"]', "#5c4033", "MH"],
    ["guest-ecom", "Priya Nandakumar", "E-Commerce Creative Director", "Runs Meta ad creative tests for Shopify brands. Guest sessions on hook writing, UGC briefs, and kill/hold/scale decisions.", '["Meta Ads","Creative Testing","POD"]', "#6b4f3a", "PN"],
    ["lyriq", "Lyriq Gaulden", "Side Hustle Guest Speaker · Kids & Youth", "Guest speaker for Kids and Youth sessions — confidence, safe first hustles, and encouragement for young Glow Getters and teen earners (with parents nearby).", '["Kids & Youth","Confidence","Safe First Hustles","Teen Motivation"]', "#2E7D5A", "LG"],
  ];

  let spOrder = 0;
  for (const s of SPEAKERS) {
    const [id, name, title, bio, topics, accent, initials] = s;
    statements.push(`
INSERT INTO guest_speakers (id, name, title, bio, topics_json, accent, initials, sort_order, updated_at)
VALUES (
  '${sqlEscape(id)}',
  '${sqlEscape(name)}',
  '${sqlEscape(title)}',
  '${sqlEscape(bio)}',
  '${sqlEscape(topics)}',
  '${sqlEscape(accent)}',
  '${sqlEscape(initials)}',
  ${spOrder},
  '${now}'
)
ON CONFLICT(id) DO NOTHING;
`.trim());
    spOrder += 1;
  }

  const WORKSHOPS = [
    ["glow-getter-launch", "Glow Getter Launch Lab", "Story time + parent playbook: turn Kevina Starr episodes into weekly confidence and teen hustle routines.", "TBD", "6:30 PM EST", "Live Zoom", "family", "upcoming", '["tina","kevina-voice","lyriq"]', '["Kids","Kevina Starr","Parents","Youth"]'],
    ["airbnb-arbitrage-101", "Airbnb Arbitrage 101", "Lease math, furnishing on a budget, and listing optimization — without buying property first.", "TBD", "7:00 PM EST", "Hybrid", "adult", "upcoming", '["evelyn","guest-str"]', '["Airbnb","Real Estate"]'],
    ["agents-with-soul", "Building AI Agents with Soul", "Identity, memory, and plain-English orchestration — the Muntie Ev way, adapted for side hustle operators.", "TBD", "7:00 PM EST", "Live Zoom", "adult", "upcoming", '["evelyn"]', '["AI Agents","Automation"]'],
    ["meta-shopify-clinic", "Meta + Shopify Creative Clinic", "Live ad teardowns: what to kill, hold, or scale against real store P&L.", "TBD", "7:00 PM EST", "Live Zoom", "adult", "waitlist", '["evelyn","guest-ecom"]', '["Meta Ads","Shopify","POD"]'],
    ["junior-earnings-fair", "Teen Earnings Fair (Kids & Teens Session)", "Safe micro-jobs, piggy bank goals, and parent safety checklists — after story time.", "TBD", "5:00 PM EST", "Replay", "kids", "past", '["tina","lyriq"]', '["Teen Hustles","Safety","Youth"]'],
    ["pod-etsy-sprint", "POD → Etsy Listing Sprint", "Niche research, design briefs, and evergreen SEO tags in one focused working session.", "TBD", "7:00 PM EST", "Replay", "adult", "past", '["evelyn","guest-ecom"]', '["POD","Etsy"]'],
  ];

  let wsOrder = 0;
  for (const w of WORKSHOPS) {
    const [id, title, blurb, date, time, format, audience, status, speakerIds, tags] = w;
    statements.push(`
INSERT INTO workshops (id, title, blurb, date, time, format, audience, status, speaker_ids_json, tags_json, sort_order, updated_at)
VALUES (
  '${sqlEscape(id)}',
  '${sqlEscape(title)}',
  '${sqlEscape(blurb)}',
  '${sqlEscape(date)}',
  '${sqlEscape(time)}',
  '${sqlEscape(format)}',
  '${sqlEscape(audience)}',
  '${sqlEscape(status)}',
  '${sqlEscape(speakerIds)}',
  '${sqlEscape(tags)}',
  ${wsOrder},
  '${now}'
)
ON CONFLICT(id) DO NOTHING;
`.trim());
    wsOrder += 1;
  }

  // Force TBD on any previously seeded fake calendar dates
  statements.push(`UPDATE workshops SET date = 'TBD', updated_at = '${now}' WHERE date != 'TBD';`);

  runSqlFile(statements.join("\n"));
  console.log(`  ✓ ${ADMINS.length} partner admins upserted`);
  console.log(`  ✓ ${TASKS.length} tasks (insert-if-missing)`);
  console.log(`  ✓ ${SPEAKERS.length} speakers + ${WORKSHOPS.length} workshops (dates TBD)`);

  console.log("\nSeed complete. Portal logins against D1:");
  console.log("Default passwords (change after first login):");
  console.log("  tinamariebarham@gmail.com / Admin123");
  console.log("  evelyn3@cox.net / Admin");
  console.log("  leegaulden1222@icloud.com / Lyriq123 (Admin + QA)");
}

main();
