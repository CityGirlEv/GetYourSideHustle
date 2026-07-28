import fs from "node:fs";

const p =
  "C:/Users/evely/.cursor/projects/c-Users-evely-Documents-antigravity-muntie-ev-ai-studio-main/agent-transcripts/74ac80ec-d15f-4587-a9f9-22881c9f4c11/74ac80ec-d15f-4587-a9f9-22881c9f4c11.jsonl";
const lines = fs.readFileSync(p, "utf8").split(/\n/);
const cases = [
  "PROOF-025-TINA",
  "PROOF-030-TINA",
  "NAV-002",
  "PROOF-019-TINA",
  "PROOF-036-TINA",
];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (!cases.some((c) => l.includes(c))) continue;
  if (!l.includes('"note"') && !l.includes("note_preview") && !l.includes("Should be")) continue;
  for (const c of cases) {
    const idx = l.indexOf(c);
    if (idx < 0) continue;
    console.log(`\n=== line ${i + 1} ${c} ===`);
    console.log(l.slice(Math.max(0, idx - 80), Math.min(l.length, idx + 900)));
  }
}
