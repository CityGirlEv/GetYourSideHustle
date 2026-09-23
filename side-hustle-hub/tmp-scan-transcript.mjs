import fs from "fs";

const p =
  "C:/Users/evely/.cursor/projects/c-Users-evely-Documents-antigravity-eager-hypatia-side-hustle-hub/agent-transcripts/07f77c72-00fe-4029-b691-b624d6712bd8/07f77c72-00fe-4029-b691-b624d6712bd8.jsonl";
const lines = fs.readFileSync(p, "utf8").split("\n");
const wanted = [
  "WorkshopsHub.tsx",
  "workshop-member-gate.ts",
  "workshop-playbooks.ts",
  "workshop-sneak-peek-pdf.ts",
  "pending-join-return.ts",
  "workshops.ts",
];
const last = {};
for (const line of lines) {
  if (!line.includes("\"Write\"") && !line.includes("\"StrReplace\"")) continue;
  for (const w of wanted) {
    if (line.includes(w.replace(/\\/g, "/")) || line.includes(w)) {
      last[w] = (last[w] || 0) + 1;
    }
  }
}
console.log(last);
console.log("lines", lines.length);
