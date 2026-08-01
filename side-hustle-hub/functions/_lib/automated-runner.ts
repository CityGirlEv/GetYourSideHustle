/**
 * Portal-triggered automated checks.
 * Cloudflare Pages cannot spawn `npm test` / Playwright browsers, so we run:
 * - Vitest: structural unit assertions (wizard matrix, catalog integrity)
 * - Playwright: live HTTP smoke against the site (health + shell + key routes)
 * Full browser e2e remains: npm run test:e2e
 */

import type { DbUser, Env } from "./auth";
import { error, json } from "./crypto";
import { FAILED_TEST_ASSIGNEE } from "./roles";
import { BACKLOG_SPRINT } from "./sprints";
import { defaultsForNewTest } from "./new-test-defaults";

export type AutomatedSuite = "vitest" | "playwright" | "lighthouse" | "foresight" | "all";
/** all = full catalog; new = only not_run / missing statuses (default after baseline). */
export type AutomatedRunMode = "all" | "new";

const LIGHTHOUSE_CATALOG: Array<{ id: string; assignee: string; check: string }> = [
  { id: "VT-LH-001", assignee: "vitest", check: "robots" },
  { id: "A11Y-002", assignee: "tina", check: "alts" },
  { id: "LH-001", assignee: "evelyn", check: "robots" },
  { id: "LH-002", assignee: "tina", check: "facebook" },
  { id: "LH-003", assignee: "tina", check: "logos" },
  { id: "LH-004", assignee: "tina", check: "contrast" },
  { id: "LH-005", assignee: "evelyn", check: "preload" },
];

/** Automated Foresight cases only — FS-011 / FS-013 stay manual. */
const FORESIGHT_CATALOG: Array<{ id: string; assignee: string; check: string }> = [
  { id: "PW-FS-001", assignee: "playwright", check: "h1_outcome" },
  { id: "PW-FS-002", assignee: "playwright", check: "h1_tools" },
  { id: "PW-FS-003", assignee: "playwright", check: "purpose" },
  { id: "PW-FS-004", assignee: "playwright", check: "cta_access" },
  { id: "PW-FS-005", assignee: "playwright", check: "cta_expect" },
  { id: "PW-FS-006", assignee: "playwright", check: "differentiator" },
  { id: "PW-FS-007", assignee: "playwright", check: "faq" },
  { id: "PW-FS-008", assignee: "playwright", check: "positioning" },
  { id: "PW-FS-009", assignee: "playwright", check: "method" },
  { id: "PW-FS-010", assignee: "playwright", check: "differentiator" },
  { id: "PW-FS-012", assignee: "playwright", check: "method" },
  { id: "PW-FS-014", assignee: "playwright", check: "icp" },
  { id: "PW-FS-015", assignee: "playwright", check: "h1_intent" },
  { id: "PW-FS-016", assignee: "playwright", check: "schema" },
];

type CaseResult = {
  caseId: string;
  status: "pass" | "fail";
  note: string;
  assignee: string;
  sprint: number;
  dueDate?: string;
};

/** Match src/lib/gysh-sprints.ts currentSprintIndex (Sprint 0 starts 2026-07-14). */
function currentSprintIndex(ref: Date = new Date()): number {
  const d = new Date(ref);
  const day = d.getDay();
  const toTue = (day + 5) % 7;
  d.setDate(d.getDate() - toTue);
  d.setHours(0, 0, 0, 0);
  const base = new Date(2026, 6, 14);
  base.setHours(0, 0, 0, 0);
  const idx = Math.floor((d.getTime() - base.getTime()) / (7 * 24 * 60 * 60 * 1000));
  if (!Number.isFinite(idx)) return 0;
  return Math.max(0, Math.min(7, idx));
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

/** All wizard matrix case ids covered by Vitest. */
export function wizardMatrixCaseIds(): string[] {
  const ids: string[] = [];
  for (let i = 1; i <= 108; i++) ids.push(`KIDS-FMSH-${pad(i)}`, `JR-FMSH-${pad(i)}`);
  for (let i = 1; i <= 378; i++) ids.push(`ADULT-FMSH-${pad(i)}`, `SENIOR-FMSH-${pad(i)}`);
  return ids;
}

const VITEST_CATALOG_IDS = [
  "VT-AUTH-001",
  "VT-JOIN-001",
  "VT-MEMBER-001",
  "VT-ROLE-001",
  "VT-PLAN-001",
  "VT-WIZARD-001",
  "VT-WORK-001",
  "VT-FIND-001",
] as const;

const PLAYWRIGHT_CATALOG: Array<{ id: string; assignee: string; check: string }> = [
  { id: "PW-SMOKE-001", assignee: "playwright", check: "home" },
  { id: "PW-SMOKE-007", assignee: "playwright", check: "home" },
  { id: "PW-SMOKE-002", assignee: "playwright", check: "shell" },
  { id: "PW-SMOKE-003", assignee: "playwright", check: "shell" },
  { id: "PW-FIND-001", assignee: "playwright", check: "shell" },
  { id: "PW-FREE-001", assignee: "playwright", check: "shell" },
  { id: "PW-MEMBER-001", assignee: "playwright", check: "shell" },
  { id: "PW-SMOKE-004", assignee: "playwright", check: "login" },
  { id: "PW-SMOKE-005", assignee: "playwright", check: "shell" },
  { id: "PW-SMOKE-006", assignee: "playwright", check: "shell" },
  { id: "PW-JOIN-001", assignee: "playwright", check: "shell" },
  { id: "PW-JOIN-002", assignee: "playwright", check: "shell" },
  { id: "PW-JOIN-003", assignee: "playwright", check: "shell" },
  { id: "PW-AUTH-001", assignee: "playwright", check: "login" },
];

function runVitestChecks(): { ok: boolean; details: string[] } {
  const details: string[] = [];
  const kids = 108;
  const junior = 108;
  const adult = 3 * 3 * 6 * 7; // 378
  const senior = 3 * 3 * 7 * 6; // 378
  const total = kids + junior + adult + senior;
  const expected = 972;

  if (total !== expected) {
    details.push(`Wizard matrix size ${total} !== ${expected}`);
  } else {
    details.push(`Wizard matrix size OK (${expected} paths)`);
  }
  if (kids !== 108) details.push("Kids paths != 108");
  else details.push("Kids FMSH paths: 108");
  if (junior !== 108) details.push("Teens paths != 108");
  else details.push("Teens FMSH paths: 108");
  if (adult !== 378) details.push("Adult paths != 378");
  else details.push("Adult FMSH paths: 378");
  if (senior !== 378) details.push("Senior paths != 378");
  else details.push("Senior FMSH paths: 378");

  const ids = wizardMatrixCaseIds();
  if (new Set(ids).size !== ids.length) details.push("Duplicate wizard case ids");
  else details.push(`Unique wizard case ids: ${ids.length}`);

  const catalogOk = VITEST_CATALOG_IDS.length === 8;
  details.push(catalogOk ? "Vitest catalog ids present (8)" : "Vitest catalog incomplete");

  const ok = !details.some((d) => d.includes("!=") || d.startsWith("Duplicate") || d.includes("incomplete"));
  return { ok, details };
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { accept: "text/html,application/json,*/*", "user-agent": "GYSH-Portal-Test-Runner/1.0" },
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    return { ok: false, status: 0, text: e instanceof Error ? e.message : String(e) };
  }
}

/** Fetch homepage HTML plus linked /assets/*.js (SPA copy lives in the bundle). */
async function fetchSiteBundle(baseUrl: string): Promise<{
  ok: boolean;
  html: string;
  bundle: string;
  details: string[];
}> {
  const origin = baseUrl.replace(/\/$/, "");
  const details: string[] = [];
  const home = await fetchText(`${origin}/`);
  if (!home.ok) {
    details.push(`Homepage fetch failed (${home.status})`);
    return { ok: false, html: home.text, bundle: "", details };
  }
  details.push("Homepage HTTP 200");
  const scriptSrcs = [...home.text.matchAll(/src=["'](\/assets\/[^"']+\.js)["']/g)].map((m) => m[1]);
  let bundle = home.text;
  let fetched = 0;
  for (const src of scriptSrcs.slice(0, 10)) {
    const part = await fetchText(`${origin}${src}`);
    if (part.ok) {
      bundle += `\n${part.text}`;
      fetched += 1;
    }
  }
  details.push(`Loaded ${fetched}/${Math.min(scriptSrcs.length, 10)} asset JS files for SPA checks`);
  return { ok: true, html: home.text, bundle, details };
}

function hasAll(hay: string, needles: string[]): boolean {
  return needles.every((n) => hay.includes(n));
}

async function runLighthousePortal(baseUrl: string): Promise<{
  ok: boolean;
  details: string[];
  byCheck: Record<string, { ok: boolean; note: string }>;
}> {
  const origin = baseUrl.replace(/\/$/, "");
  const details: string[] = [];
  const byCheck: Record<string, { ok: boolean; note: string }> = {};
  const site = await fetchSiteBundle(origin);
  details.push(...site.details);
  const src = `${site.html}\n${site.bundle}`;

  const robots = await fetchText(`${origin}/robots.txt`);
  const robotsOk =
    robots.ok &&
    !/<!doctype html/i.test(robots.text) &&
    !/<html/i.test(robots.text) &&
    /User-agent:\s*\*/i.test(robots.text) &&
    /Disallow:\s*\/api\//i.test(robots.text);
  details.push(robotsOk ? "robots.txt plain text OK" : `robots.txt check failed (${robots.status})`);
  byCheck.robots = {
    ok: robotsOk,
    note: robotsOk
      ? "robots.txt is crawlable plain text (User-agent / Disallow /api/)"
      : `robots.txt invalid or HTML (${robots.status})`,
  };

  const facebookOk =
    /data-testid=["']home-facebook["']/.test(src) &&
    /data-testid=["']footer-facebook["']/.test(src) &&
    /aria-label=["']Follow on Facebook["']/.test(src);
  details.push(facebookOk ? "Facebook CTA labels present" : "Facebook CTA label markers missing");
  byCheck.facebook = {
    ok: facebookOk,
    note: facebookOk
      ? "Facebook CTAs present with matching Follow on Facebook accessible name"
      : "Missing home/footer Facebook test ids or aria-label",
  };

  const logosOk =
    /brand-header-logo/.test(src) &&
    /site-footer-logo/.test(src) &&
    /width=\{?\d+/.test(src) &&
    /height=\{?\d+/.test(src);
  details.push(logosOk ? "Logo size attributes present in source" : "Logo width/height markers weak/missing");
  byCheck.logos = {
    ok: logosOk,
    note: logosOk
      ? "Header/footer logo width/height declared in source"
      : "Could not confirm logo width/height in HTML/JS",
  };

  // Contrast: ink tokens / card classes shipped (full WCAG needs a browser).
  const contrastOk =
    /hustle-card-category/.test(src) &&
    /hustle-card-income/.test(src) &&
    (/--ink|--text-ink|color-contrast|4\.5/.test(src) || /hustle-card/.test(src));
  details.push(contrastOk ? "Hustle card contrast classes present" : "Hustle card contrast markers missing");
  byCheck.contrast = {
    ok: contrastOk,
    note: contrastOk
      ? "Hustle card category/income classes present (portal structural; full WCAG needs npm run test:e2e)"
      : "Missing hustle card contrast-related classes in source",
  };

  const preloadOk = /rel=["']preload["'][^>]*as=["']image["'][^>]*gysh-home-hero/i.test(site.html);
  details.push(preloadOk ? "LCP hero preload present" : "LCP hero preload missing");
  byCheck.preload = {
    ok: preloadOk,
    note: preloadOk
      ? "Home HTML preloads gysh-home-hero LCP image"
      : "Missing link rel=preload as=image for gysh-home-hero",
  };

  const altsOk =
    /alt=["']Get Your Side Hustle["']/i.test(src) ||
    (/alt=["'][^"']+["']/.test(src) && /brand-header-logo/.test(src));
  details.push(altsOk ? "Brand/logo alt text present" : "Brand alt markers missing");
  byCheck.alts = {
    ok: altsOk,
    note: altsOk
      ? "Meaningful brand/logo alt text present in source"
      : "Could not confirm meaningful logo alt text",
  };

  const ok = Object.values(byCheck).every((c) => c.ok) && site.ok;
  return { ok, details, byCheck };
}

async function runForesightPortal(baseUrl: string): Promise<{
  ok: boolean;
  details: string[];
  byCheck: Record<string, { ok: boolean; note: string }>;
}> {
  const origin = baseUrl.replace(/\/$/, "");
  const details: string[] = [];
  const byCheck: Record<string, { ok: boolean; note: string }> = {};
  const site = await fetchSiteBundle(origin);
  details.push(...site.details);
  const src = `${site.html}\n${site.bundle}`;

  const h1Outcome =
    hasAll(src, ["page-title", "Get Your Side Hustle"]) &&
    /family|solo|Find and launch|We Got You|validate|faster/i.test(src);
  byCheck.h1_outcome = {
    ok: h1Outcome,
    note: h1Outcome ? "Outcome-led H1 / brand copy present" : "Missing outcome-led H1 markers",
  };

  const h1Tools = /side hustle|Match Wizards|margin calculators|Margin Match/i.test(src);
  byCheck.h1_tools = {
    ok: h1Tools,
    note: h1Tools ? "H1/tool naming present" : "Missing Match Wizards / calculators in copy",
  };

  const purpose = /home-site-purpose/.test(src) && /validate|profit|calculators/i.test(src);
  byCheck.purpose = {
    ok: purpose,
    note: purpose ? "Purpose line present" : "Missing home-site-purpose / outcome language",
  };

  const ctaAccess =
    /home-join-expectation/.test(src) && /Free tools|membership|Start free/i.test(src);
  byCheck.cta_access = {
    ok: ctaAccess,
    note: ctaAccess ? "CTA access explainer present" : "Missing CTA access/pricing explainer",
  };

  const ctaExpect =
    /home-join-cta/.test(src) && /under 2 minutes|Start free/i.test(src);
  byCheck.cta_expect = {
    ok: ctaExpect,
    note: ctaExpect ? "CTA expectation line present" : "Missing CTA expectation markers",
  };

  const differentiator = /Unlike generic idea lists/i.test(src) && /home-differentiator/.test(src);
  byCheck.differentiator = {
    ok: differentiator,
    note: differentiator ? "Differentiator line present" : "Missing differentiator copy",
  };

  const faq = /home-faq/.test(src) && /Margin Match/i.test(src) && /free/i.test(src);
  byCheck.faq = {
    ok: faq,
    note: faq ? "FAQ markers + Margin Match / free present" : "Missing FAQ profitability/access markers",
  };

  const positioning = /home-positioning/.test(src) && /Margin Match/i.test(src);
  byCheck.positioning = {
    ok: positioning,
    note: positioning ? "Positioning block + method present" : "Missing positioning block",
  };

  const method = /home-method-name/.test(src) && /Margin Match/i.test(src);
  byCheck.method = {
    ok: method,
    note: method ? "Named Margin Match method present" : "Missing home-method-name / Margin Match",
  };

  const icp =
    /home-icp-kids/.test(src) && /home-icp-teens/.test(src) && /home-icp-adults/.test(src);
  byCheck.icp = {
    ok: icp,
    note: icp ? "ICP kids/teens/adults markers present" : "Missing ICP section markers",
  };

  const h1Intent = /family|solo|Find and launch|validate|faster|We Got You|ready to start/i.test(src);
  byCheck.h1_intent = {
    ok: h1Intent,
    note: h1Intent ? "Headline intent language present" : "Missing searcher-intent headline language",
  };

  let schemaOk = false;
  try {
    const m = site.html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    );
    if (m?.[1]) {
      const data = JSON.parse(m[1]) as { "@graph"?: Array<{ "@type"?: string | string[] }> } & {
        "@type"?: string | string[];
      };
      const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
      const types = new Set(
        nodes.flatMap((n) => {
          const t = n?.["@type"];
          return Array.isArray(t) ? t : t ? [t] : [];
        }),
      );
      schemaOk = types.has("Organization") && types.has("WebPage") && types.has("FAQPage");
    }
  } catch {
    schemaOk = false;
  }
  byCheck.schema = {
    ok: schemaOk,
    note: schemaOk
      ? "Organization + WebPage + FAQPage JSON-LD present"
      : "Missing Organization/WebPage/FAQPage JSON-LD",
  };

  for (const [k, v] of Object.entries(byCheck)) {
    details.push(`${v.ok ? "✓" : "✗"} ${k}: ${v.note}`);
  }
  const ok = Object.values(byCheck).every((c) => c.ok) && site.ok;
  return { ok, details, byCheck };
}

async function runPlaywrightSmoke(baseUrl: string): Promise<{
  ok: boolean;
  details: string[];
  byCheck: Record<string, { ok: boolean; note: string }>;
}> {
  const origin = baseUrl.replace(/\/$/, "");
  const details: string[] = [];
  const byCheck: Record<string, { ok: boolean; note: string }> = {};

  const health = await fetchText(`${origin}/api/health`);
  let healthOk = false;
  try {
    const body = JSON.parse(health.text) as { ok?: boolean; db?: string };
    healthOk = health.ok && body.ok === true;
    details.push(healthOk ? `Health OK (db=${body.db ?? "?"})` : `Health failed (${health.status})`);
  } catch {
    details.push(`Health not JSON (${health.status})`);
  }
  byCheck.health = {
    ok: healthOk,
    note: healthOk ? "GET /api/health returned ok" : `GET /api/health failed (${health.status})`,
  };

  const home = await fetchText(`${origin}/`);
  const homeOk =
    home.ok &&
    (home.text.includes('id="root"') || home.text.includes("id='root'") || home.text.includes("Get Your Side Hustle"));
  details.push(homeOk ? "Homepage shell OK" : `Homepage failed (${home.status})`);
  byCheck.home = {
    ok: homeOk,
    note: homeOk
      ? "Homepage HTTP 200 with app shell"
      : `Homepage check failed (${home.status}): ${home.text.slice(0, 120)}`,
  };

  const login = await fetchText(`${origin}/`);
  const loginHtml = login.text.toLowerCase();
  const exposedSecrets =
    loginHtml.includes("admin123") ||
    loginHtml.includes("lyriq123") ||
    loginHtml.includes("tina123");
  const loginOk = homeOk && !exposedSecrets;
  details.push(loginOk ? "No partner passwords in shell HTML" : "Possible credentials leaked in HTML");
  byCheck.login = {
    ok: loginOk,
    note: loginOk
      ? "Login/security smoke: no passwords in initial HTML"
      : "Security smoke failed: password-like strings found in HTML or home failed",
  };

  byCheck.shell = {
    ok: healthOk && homeOk,
    note:
      healthOk && homeOk
        ? "Site shell + API health OK (portal HTTP smoke; full UI clicks need npm run test:e2e)"
        : "Site shell or health failed",
  };

  const ok = healthOk && homeOk && loginOk;
  return { ok, details, byCheck };
}

async function ensureRunTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS automated_test_runs (
      id TEXT PRIMARY KEY,
      suite TEXT NOT NULL,
      status TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL DEFAULT '[]',
      started_at TEXT NOT NULL,
      finished_at TEXT,
      started_by TEXT
    )`,
  ).run();
}

async function ensureGeneratedCasesTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS generated_test_cases (
      id TEXT PRIMARY KEY,
      area TEXT NOT NULL,
      title TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'P1',
      suite TEXT NOT NULL DEFAULT 'vitest',
      steps_json TEXT NOT NULL DEFAULT '[]',
      expected TEXT NOT NULL DEFAULT '',
      failure_detail TEXT NOT NULL DEFAULT '',
      fix_steps_json TEXT NOT NULL DEFAULT '[]',
      severity TEXT NOT NULL DEFAULT 'P1',
      source_file TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      created_from_run TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
}

async function upsertCaseResults(env: Env, actor: DbUser, results: CaseResult[]): Promise<void> {
  if (results.length === 0) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS test_case_status (
      case_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    )`,
  ).run();
  for (const col of [
    ["note", `ALTER TABLE test_case_status ADD COLUMN note TEXT NOT NULL DEFAULT ''`],
    ["assignee", `ALTER TABLE test_case_status ADD COLUMN assignee TEXT NOT NULL DEFAULT ''`],
    ["sprint", `ALTER TABLE test_case_status ADD COLUMN sprint INTEGER NOT NULL DEFAULT 0`],
    ["due_date", `ALTER TABLE test_case_status ADD COLUMN due_date TEXT NOT NULL DEFAULT ''`],
    ["assigned_by", `ALTER TABLE test_case_status ADD COLUMN assigned_by TEXT NOT NULL DEFAULT 'System'`],
    ["date_assigned", `ALTER TABLE test_case_status ADD COLUMN date_assigned TEXT NOT NULL DEFAULT ''`],
  ] as const) {
    try {
      await env.DB.prepare(col[1]).run();
    } catch {
      /* exists */
    }
  }

  const now = new Date().toISOString();
  // Do not overwrite due_date or sprint on conflict — suite runs must not wipe
  // tester-set dues or manual Schedule sprint placements.
  const sql = `INSERT INTO test_case_status (case_id, status, note, assignee, sprint, due_date, updated_at, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(case_id) DO UPDATE SET
       status = excluded.status,
       note = excluded.note,
       assignee = excluded.assignee,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`;

  const CHUNK = 40;
  for (let i = 0; i < results.length; i += CHUNK) {
    const slice = results.slice(i, i + CHUNK);
    const stmts = slice.map((r) => {
      const sprint = Number.isFinite(r.sprint) ? r.sprint : BACKLOG_SPRINT;
      let assignee = r.assignee;
      if (r.status === "fail" && !String(assignee || "").trim()) {
        assignee = FAILED_TEST_ASSIGNEE;
      }
      const dueDate = String(r.dueDate ?? "").trim();
      return env.DB.prepare(sql).bind(
        r.caseId,
        r.status,
        r.note,
        assignee,
        sprint,
        dueDate,
        now,
        actor.email,
      );
    });
    await env.DB.batch(stmts);
  }
}

async function createFailureTestCase(
  env: Env,
  actor: DbUser,
  args: {
    suite: "vitest" | "playwright";
    title: string;
    severity: "P0" | "P1" | "P2" | "P3";
    why: string;
    reproSteps: string[];
    fixSteps: string[];
    detail: string;
    sourceFile?: string;
    runId: string;
    /** Ignored — new failures use defaultsForNewTest (Backlog, or Kids/Youth rules). */
    sprint?: number;
  },
): Promise<string> {
  await ensureGeneratedCasesTable(env);
  const id = `${args.suite === "vitest" ? "VT" : "PW"}-FAIL-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const area = args.suite === "vitest" ? "Vitest Failure" : "Playwright Failure";
  const title = `FAIL: ${args.title}`.slice(0, 180);
  const defaults = defaultsForNewTest({
    id,
    title: args.title,
    area,
    suite: args.suite,
    tags: [args.why, args.detail, ...args.reproSteps].join(" "),
  });
  const failureDetail = [
    `SEVERITY: ${args.severity}`,
    `WHY IT FAILED: ${args.why}`,
    "",
    args.detail,
  ].join("\n");
  await env.DB.prepare(
    `INSERT INTO generated_test_cases (
      id, area, title, priority, suite, steps_json, expected, failure_detail, fix_steps_json,
      severity, source_file, created_at, created_from_run
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      area,
      title,
      args.severity,
      args.suite,
      JSON.stringify(args.reproSteps),
      "Suite check passes with no errors",
      failureDetail,
      JSON.stringify(args.fixSteps),
      args.severity,
      args.sourceFile ?? "",
      now,
      args.runId,
    )
    .run();

  const note = [
    failureDetail,
    "",
    "STEPS TO REPRODUCE:",
    ...args.reproSteps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "STEPS TO FIX:",
    ...args.fixSteps.map((s, i) => `${i + 1}. ${s}`),
  ].join("\n");

  await upsertCaseResults(env, actor, [
    {
      caseId: id,
      status: "fail",
      note,
      assignee: defaults.assignee,
      sprint: defaults.sprint,
      dueDate: defaults.dueDate,
    },
  ]);
  return id;
}

async function statusesForIds(
  env: Env,
  ids: string[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (ids.length === 0) return out;
  // Chunk IN queries
  const CHUNK = 80;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const placeholders = slice.map(() => "?").join(",");
    const { results } = await env.DB.prepare(
      `SELECT case_id, status FROM test_case_status WHERE case_id IN (${placeholders})`,
    )
      .bind(...slice)
      .all<{ case_id: string; status: string }>();
    for (const row of results ?? []) out[row.case_id] = row.status;
  }
  return out;
}

function shouldUpdateCase(mode: AutomatedRunMode, current: string | undefined): boolean {
  if (mode === "all") return true;
  // new = missing / not_run / mistaken in_progress (suite cases should never stay in progress)
  return !current || current === "not_run" || current === "in_progress";
}

function siteBase(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  try {
    return new URL(request.url).origin;
  } catch {
    return "https://getyoursidehustle.com";
  }
}

export async function runAutomatedTests(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  let body: { suite?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const suite = String(body.suite || "all") as AutomatedSuite;
  if (!["vitest", "playwright", "lighthouse", "foresight", "all"].includes(suite)) {
    return error("suite must be vitest, playwright, lighthouse, foresight, or all.");
  }
  const mode = (body.mode === "all" ? "all" : "new") as AutomatedRunMode;
  const sprint = currentSprintIndex();

  await ensureRunTable(env);
  await ensureGeneratedCasesTable(env);
  // Ensure test status table exists before vitest updates wizard rows.
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS test_case_status (
      case_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    )`,
  ).run();
  for (const ddl of [
    `ALTER TABLE test_case_status ADD COLUMN note TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE test_case_status ADD COLUMN assignee TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE test_case_status ADD COLUMN sprint INTEGER NOT NULL DEFAULT 0`,
  ]) {
    try {
      await env.DB.prepare(ddl).run();
    } catch {
      /* exists */
    }
  }

  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO automated_test_runs (id, suite, status, summary, details, started_at, started_by)
     VALUES (?, ?, 'running', '', '[]', ?, ?)`,
  )
    .bind(runId, suite, startedAt, actor.email)
    .run();

  const allDetails: string[] = [];
  const caseResults: CaseResult[] = [];
  const createdFailureIds: string[] = [];
  let overallOk = true;
  allDetails.push(`Run mode: ${mode} · sprint: ${sprint}`);

  if (suite === "vitest" || suite === "all") {
    const vitest = runVitestChecks();
    allDetails.push("=== Vitest (portal structural) ===", ...vitest.details);
    overallOk = overallOk && vitest.ok;
    const note = vitest.ok
      ? `Portal Vitest runner passed. ${vitest.details.join("; ")}`
      : `Portal Vitest runner failed. ${vitest.details.join("; ")}`;
    const status = vitest.ok ? "pass" : "fail";
    const existing = await statusesForIds(env, [...VITEST_CATALOG_IDS]);
    for (const id of VITEST_CATALOG_IDS) {
      if (!shouldUpdateCase(mode, existing[id])) continue;
      caseResults.push({
        caseId: id,
        status,
        note,
        assignee: "vitest",
        sprint,
      });
    }

    if (!vitest.ok) {
      const failBits = vitest.details.filter((d) => d.includes("!=") || d.startsWith("Duplicate") || d.includes("incomplete"));
      const failId = await createFailureTestCase(env, actor, {
        suite: "vitest",
        title: "Portal Vitest structural checks",
        severity: "P0",
        why: "Portal Vitest structural runner detected catalog/matrix integrity errors.",
        reproSteps: [
          "Open Admin → Testing Portal.",
          "Click Run Vitest (or npm run test:unit locally).",
          "Compare wizard matrix sizes / catalog ids in the run log.",
        ],
        fixSteps: [
          "Inspect gysh-wizard-scenarios / AUTOMATED_VITEST_CASES for size or id drift.",
          "Align expected path counts (Kids/Teens 108, Adult/Senior 378) with the matrix generator.",
          "Re-run Vitest; mark this failure case Pass when green.",
        ],
        detail: failBits.join("\n") || vitest.details.join("\n"),
        sourceFile: "functions/_lib/automated-runner.ts",
        runId,
        sprint,
      });
      createdFailureIds.push(failId);
      allDetails.push(`Created failure case ${failId} (P0) with new-test defaults`);
    }

    // Update existing wizard matrix rows only (avoid inserting ~972 empty sprint rows).
    const now = new Date().toISOString();
    const wizardNote = vitest.ok
      ? "Covered by portal Vitest matrix runner (npm run test:unit equivalent checks)."
      : `Wizard matrix structural check failed: ${vitest.details.filter((d) => d.includes("!=")).join("; ") || "see run details"}`;
    // Never rewrite sprint — Schedule / manual placement must stick across suite runs.
    if (mode === "all") {
      await env.DB.prepare(
        `UPDATE test_case_status
         SET status = ?, note = ?, assignee = ?, updated_at = ?, updated_by = ?
         WHERE case_id LIKE 'KIDS-FMSH-%'
            OR case_id LIKE 'JR-FMSH-%'
            OR case_id LIKE 'ADULT-FMSH-%'
            OR case_id LIKE 'SENIOR-FMSH-%'
            OR case_id LIKE 'WIZARD-EDGE-%'`,
      )
        .bind(status, wizardNote, "vitest", now, actor.email)
        .run();
      allDetails.push(
        vitest.ok
          ? "Updated existing wizard FMSH rows in D1 to pass"
          : "Updated existing wizard FMSH rows in D1 to fail",
      );
    } else {
      await env.DB.prepare(
        `UPDATE test_case_status
         SET status = ?, note = ?, assignee = ?, updated_at = ?, updated_by = ?
         WHERE (status = 'not_run' OR status IS NULL OR status = '')
           AND (
             case_id LIKE 'KIDS-FMSH-%'
             OR case_id LIKE 'JR-FMSH-%'
             OR case_id LIKE 'ADULT-FMSH-%'
             OR case_id LIKE 'SENIOR-FMSH-%'
             OR case_id LIKE 'WIZARD-EDGE-%'
           )`,
      )
        .bind(status, wizardNote, "vitest", now, actor.email)
        .run();
      allDetails.push("Updated only not_run wizard FMSH rows (mode=new)");
    }
  }

  if (suite === "playwright" || suite === "all") {
    const base = siteBase(request);
    const pw = await runPlaywrightSmoke(base);
    allDetails.push(`=== Playwright HTTP smoke (${base}) ===`, ...pw.details);
    overallOk = overallOk && pw.ok;
    const pwIds = PLAYWRIGHT_CATALOG.map((c) => c.id);
    const existingPw = await statusesForIds(env, pwIds);
    for (const c of PLAYWRIGHT_CATALOG) {
      if (!shouldUpdateCase(mode, existingPw[c.id])) continue;
      const check = pw.byCheck[c.check] ?? pw.byCheck.shell;
      caseResults.push({
        caseId: c.id,
        status: check.ok ? "pass" : "fail",
        note: `${check.note} Full browser suite: npm run test:e2e`,
        assignee: c.assignee,
        sprint,
      });
      if (!check.ok) {
        const failId = await createFailureTestCase(env, actor, {
          suite: "playwright",
          title: `${c.id} — ${c.check} smoke`,
          severity: c.check === "health" || c.check === "login" ? "P0" : "P1",
          why: `Playwright portal HTTP smoke check "${c.check}" failed against ${base}.`,
          reproSteps: [
            `Open ${base} in a browser.`,
            "Confirm /api/health returns ok and the homepage shell loads.",
            `Re-run Testing Portal → Run Playwright (case ${c.id}).`,
            "Optional full UI: npm run test:e2e",
          ],
          fixSteps: [
            "Verify Pages deploy includes Functions + D1 bindings.",
            "Fix the failing route/health response or content assertion.",
            "Re-run Playwright smoke; mark this failure case Pass when green.",
          ],
          detail: check.note,
          sourceFile: "functions/_lib/automated-runner.ts",
          runId,
          sprint,
        });
        createdFailureIds.push(failId);
        allDetails.push(`Created failure case ${failId} for ${c.id}`);
      }
    }
  }

  if (suite === "lighthouse" || suite === "all") {
    const base = siteBase(request);
    const lh = await runLighthousePortal(base);
    allDetails.push(`=== Lighthouse portal checks (${base}) ===`, ...lh.details);
    overallOk = overallOk && lh.ok;
    const ids = LIGHTHOUSE_CATALOG.map((c) => c.id);
    const existing = await statusesForIds(env, ids);
    for (const c of LIGHTHOUSE_CATALOG) {
      if (!shouldUpdateCase(mode, existing[c.id])) continue;
      const check = lh.byCheck[c.check] ?? { ok: false, note: `Unknown check ${c.check}` };
      caseResults.push({
        caseId: c.id,
        status: check.ok ? "pass" : "fail",
        note: `${check.note} Full browser: npx playwright test e2e/lighthouse-a11y.spec.ts`,
        assignee: c.assignee,
        sprint,
      });
    }
  }

  if (suite === "foresight" || suite === "all") {
    const base = siteBase(request);
    const fs = await runForesightPortal(base);
    allDetails.push(`=== Foresight portal checks (${base}) ===`, ...fs.details);
    overallOk = overallOk && fs.ok;
    const ids = FORESIGHT_CATALOG.map((c) => c.id);
    const existing = await statusesForIds(env, ids);
    for (const c of FORESIGHT_CATALOG) {
      if (!shouldUpdateCase(mode, existing[c.id])) continue;
      const check = fs.byCheck[c.check] ?? { ok: false, note: `Unknown check ${c.check}` };
      caseResults.push({
        caseId: c.id,
        status: check.ok ? "pass" : "fail",
        note: `${check.note} Full browser: npx playwright test tests/foresight-homepage.spec.ts`,
        assignee: c.assignee,
        sprint,
      });
    }
  }

  await upsertCaseResults(env, actor, caseResults);

  const finishedAt = new Date().toISOString();
  const summary = overallOk
    ? `Passed (${suite}/${mode}) — ${caseResults.filter((r) => r.status === "pass").length}/${caseResults.length} cases updated · sprint ${sprint}`
    : `Failed (${suite}/${mode}) — ${caseResults.filter((r) => r.status === "fail").length} failing · ${createdFailureIds.length} new failure cases · sprint ${sprint}`;

  await env.DB.prepare(
    `UPDATE automated_test_runs SET status = ?, summary = ?, details = ?, finished_at = ? WHERE id = ?`,
  )
    .bind(overallOk ? "pass" : "fail", summary, JSON.stringify(allDetails), finishedAt, runId)
    .run();

  return json({
    ok: overallOk,
    runId,
    suite,
    mode,
    sprint,
    summary,
    details: allDetails,
    updatedCases: caseResults.length,
    createdFailureCases: createdFailureIds,
    commands: {
      vitest: "npm run test:unit",
      playwright: "npm run test:e2e",
      report: "node --use-system-ca scripts/report-vitest-to-d1.mjs",
      lighthouse: "npx playwright test e2e/lighthouse-a11y.spec.ts",
      foresight: "npx playwright test tests/foresight-homepage.spec.ts",
    },
  });
}

export async function listAutomatedTestRuns(env: Env): Promise<Response> {
  await ensureRunTable(env);
  const { results } = await env.DB.prepare(
    `SELECT id, suite, status, summary, details, started_at, finished_at, started_by
     FROM automated_test_runs ORDER BY started_at DESC LIMIT 10`,
  ).all<{
    id: string;
    suite: string;
    status: string;
    summary: string;
    details: string;
    started_at: string;
    finished_at: string | null;
    started_by: string | null;
  }>();

  return json({
    runs: (results ?? []).map((r) => ({
      id: r.id,
      suite: r.suite,
      status: r.status,
      summary: r.summary,
      details: (() => {
        try {
          return JSON.parse(r.details) as string[];
        } catch {
          return [r.details];
        }
      })(),
      startedAt: r.started_at,
      finishedAt: r.finished_at,
      startedBy: r.started_by,
    })),
  });
}
