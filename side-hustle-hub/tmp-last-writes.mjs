import fs from "fs";
import path from "path";

const transcript =
  "C:/Users/evely/.cursor/projects/c-Users-evely-Documents-antigravity-eager-hypatia-side-hustle-hub/agent-transcripts/07f77c72-00fe-4029-b691-b624d6712bd8/07f77c72-00fe-4029-b691-b624d6712bd8.jsonl";
const outDir = "c:/Users/evely/Documents/antigravity/eager-hypatia/side-hustle-hub/tmp-restored";

const lines = fs.readFileSync(transcript, "utf8").split("\n");
const lastWrite = {};
for (const line of lines) {
  if (!line.trim()) continue;
  let obj;
  try {
    obj = JSON.parse(line);
  } catch {
    continue;
  }
  const content = obj?.message?.content;
  if (!Array.isArray(content)) continue;
  for (const part of content) {
    if (part?.type !== "tool_use" || part.name !== "Write") continue;
    const p = String(part.input?.path || "").replace(/\\/g, "/");
    if (!p) continue;
    lastWrite[p] = part.input.contents;
  }
}

const keep = Object.keys(lastWrite).filter(
  (p) =>
    /workshop|pending-join-return|pdf-logo|lazy-app-pages/i.test(p),
);
console.log(
  keep.map((p) => `${p} ${lastWrite[p]?.length || 0}`).join("\n"),
);
for (const p of keep) {
  const dest = path.join(outDir, "writes", path.basename(p));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, lastWrite[p]);
}
