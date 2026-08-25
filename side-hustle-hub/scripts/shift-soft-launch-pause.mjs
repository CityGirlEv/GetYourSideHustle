/**
 * One-shot: shift Soft Launch calendar days for Sprint 3+ by +14 days
 * after the Aug 4–17 pause. Keeps Sprint 2 Soft Launch day (2026-08-03).
 */
import fs from "node:fs";

const path = new URL("../src/lib/gysh-soft-launch-rollout.ts", import.meta.url);
let s = fs.readFileSync(path, "utf8");

function addDaysIso(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

const dayRe = /day: "(2026-08-\d{2})"/g;
const days = new Set();
for (const m of s.matchAll(dayRe)) days.add(m[1]);
const toShift = [...days].filter((d) => d > "2026-08-03").sort().reverse();
console.log("Shifting days:", toShift.join(", "));
for (const d of toShift) {
  const next = addDaysIso(d, 14);
  s = s.split(`day: "${d}"`).join(`day: "${next}"`);
  console.log(d, "->", next);
}

s = s.replace('rangeLabel: "8/18/26–8/24/26"', 'rangeLabel: "9/1/26–9/7/26"');
s = s.replace('rangeLabel: "8/11/26–8/17/26"', 'rangeLabel: "8/25/26–8/31/26"');
s = s.replace('rangeLabel: "8/4/26–8/10/26"', 'rangeLabel: "8/18/26–8/24/26"');

s = s.replace(
  "Sprint 3 — Polish + daily cadence (Aug 4–10)",
  "Sprint 3 — Polish + daily cadence (Aug 18–24)",
);
s = s.replace(
  "Sprint 4 — Growth + first ads (Aug 11–17)",
  "Sprint 4 — Growth + first ads (Aug 25–31)",
);
s = s.replace(
  "Sprint 5 — Scale & systems (Aug 18–24)",
  "Sprint 5 — Scale & systems (Sep 1–7)",
);
s = s.replace(
  "polish + daily cadence (8/4–8/10)",
  "polish + daily cadence (8/18–8/24)",
);
s = s.replace("Kill/scale note by Fri Aug 15", "Kill/scale note by Fri Aug 29");
s = s.replace(
  "from 8/3–8/10 not yet shared personally",
  "from 8/3 and Sprint 3 (8/18–8/24) not yet shared personally",
);

fs.writeFileSync(path, s);
console.log("Updated", path.pathname);
