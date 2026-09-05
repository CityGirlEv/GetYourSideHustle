import { readFileSync } from "node:fs";

const p =
  "C:/Users/evely/.cursor/projects/c-Users-evely-Documents-antigravity-eager-hypatia-side-hustle-hub/agent-tools/23801a3c-1535-490e-9eff-e346edd9c74e.txt";
const j = JSON.parse(readFileSync(p, "utf8"));
console.log("status", j.status);
for (const c of j.components || []) {
  if (c.status !== "operational") console.log(c.name, c.status);
}
for (const i of j.incidents || []) {
  if (i.status !== "resolved") {
    console.log("OPEN", i.name, i.status, i.impact);
    console.log((i.incident_updates?.[0]?.body || "").slice(0, 400));
  }
}
