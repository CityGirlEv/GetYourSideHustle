/**
 * Backfill result_pcts_json for older kids/junior Side Hustle Blueprints.
 * Usage: node --use-system-ca scripts/backfill-kids-blueprint-pcts.mjs
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const WRANGLER = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

const HUSTLES = [
  {
    id: "dog-walk",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["animals", "outdoors"],
      place: ["outdoor"],
      time: ["short", "medium"],
    },
  },
  {
    id: "yard-help",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["outdoors", "helping"],
      place: ["outdoor"],
      time: ["medium", "long"],
    },
  },
  {
    id: "crafts",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["young", "mid", "older"],
      interests: ["creative"],
      place: ["indoor", "either"],
      time: ["short", "medium", "long"],
    },
  },
  {
    id: "tech-helper",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["tech", "helping"],
      place: ["indoor", "either"],
      time: ["short", "medium"],
    },
  },
  {
    id: "homework",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["older"],
      interests: ["helping"],
      place: ["indoor", "either"],
      time: ["short", "medium"],
    },
  },
  {
    id: "book-publishing-kids",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["young", "mid", "older"],
      interests: ["creative"],
      place: ["indoor", "either"],
      time: ["medium", "long"],
    },
  },
  {
    id: "create-games-kids",
    audiences: ["kids"],
    tags: {
      ages: ["young", "mid"],
      interests: ["creative", "tech", "ai"],
      place: ["indoor"],
      time: ["short", "medium", "long"],
    },
  },
  {
    id: "create-games-junior",
    audiences: ["junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["creative", "tech", "ai"],
      place: ["indoor"],
      time: ["medium", "long"],
    },
  },
];

function scoreHustle(h, answers) {
  let score = 0;
  const age = String(answers.age || "");
  const interest = String(answers.interest || "");
  const place = String(answers.place || "");
  const time = String(answers.time || "");
  if (age && h.tags.ages.includes(age)) score += 3;
  if (interest && h.tags.interests.includes(interest)) score += 4;
  if (place === "either" || (place && h.tags.place.includes(place)) || h.tags.place.includes("either")) {
    score += 2;
  }
  if (time && h.tags.time.includes(time)) score += 2;
  return score;
}

function kidsResultPcts(ageGroup, answers, resultIds) {
  const mode = ageGroup === "junior" ? "junior" : "kids";
  const ids = resultIds.filter(Boolean).map(String);
  if (!ids.length) return {};
  const hasAnswers = Boolean(answers?.age && answers?.interest);
  if (hasAnswers) {
    const byId = new Map(
      HUSTLES.filter((h) => h.audiences.includes(mode)).map((h) => [h.id, h]),
    );
    const scores = ids.map((id) => {
      const h = byId.get(id);
      return { id, score: h ? scoreHustle(h, answers) : 0 };
    });
    const maxScore = Math.max(...scores.map((s) => s.score), 1);
    return Object.fromEntries(
      scores.map((s) => [s.id, Math.round((s.score / maxScore) * 100)]),
    );
  }
  const n = ids.length;
  return Object.fromEntries(
    ids.map((id, i) => [id, Math.max(40, Math.round(100 - (i * 60) / Math.max(n - 1, 1)))]),
  );
}

function d1Json(command) {
  const out = execFileSync(
    process.execPath,
    ["--use-system-ca", WRANGLER, "d1", "execute", "gysh-db", "--remote", "--json", "--command", command],
    { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out);
  return parsed?.[0]?.results ?? parsed?.results ?? [];
}

function d1Run(command) {
  execFileSync(
    process.execPath,
    ["--use-system-ca", WRANGLER, "d1", "execute", "gysh-db", "--remote", "--command", command],
    { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
}

const rows = d1Json(`
  SELECT id, age_group, answers_json, result_ids_json, result_pcts_json
  FROM side_hustle_blueprints
  WHERE age_group IN ('kids','junior')
`);

let updated = 0;
let skipped = 0;

for (const row of rows) {
  let ids = [];
  let answers = {};
  let existing = {};
  try {
    ids = JSON.parse(row.result_ids_json || "[]");
    answers = JSON.parse(row.answers_json || "{}");
    existing = JSON.parse(row.result_pcts_json || "{}");
  } catch {
    skipped += 1;
    continue;
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    skipped += 1;
    continue;
  }
  const hasPcts =
    existing &&
    typeof existing === "object" &&
    Object.keys(existing).length > 0 &&
    ids.some((id) => typeof existing[id] === "number");
  if (hasPcts) {
    skipped += 1;
    continue;
  }

  const pcts = kidsResultPcts(row.age_group, answers, ids);
  const json = JSON.stringify(pcts).replace(/'/g, "''");
  const id = String(row.id).replace(/'/g, "''");
  d1Run(
    `UPDATE side_hustle_blueprints SET result_pcts_json = '${json}', updated_at = datetime('now') WHERE id = '${id}'`,
  );
  updated += 1;
  console.log(`updated ${row.id} (${row.age_group}) top=${pcts[ids[0]]}%`);
}

console.log(`Done. updated=${updated} skipped=${skipped} total=${rows.length}`);
