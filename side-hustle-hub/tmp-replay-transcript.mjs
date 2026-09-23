import fs from "fs";
import path from "path";

const transcript =
  "C:/Users/evely/.cursor/projects/c-Users-evely-Documents-antigravity-eager-hypatia-side-hustle-hub/agent-transcripts/07f77c72-00fe-4029-b691-b624d6712bd8/07f77c72-00fe-4029-b691-b624d6712bd8.jsonl";
const root = "c:/Users/evely/Documents/antigravity/eager-hypatia/side-hustle-hub";

const files = new Map();
const ops = [];

function normalize(p) {
  return String(p || "").replace(/\\/g, "/");
}

function interesting(p) {
  const n = normalize(p).toLowerCase();
  return (
    n.includes("workshop") ||
    n.includes("pending-join-return") ||
    n.includes("pdf-logo") ||
    n.endsWith("/app.tsx") ||
    n.endsWith("/index.css") ||
    n.includes("lazy-app-pages")
  );
}

const lines = fs.readFileSync(transcript, "utf8").split("\n");
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
    if (part?.type !== "tool_use") continue;
    const name = part.name;
    const input = part.input || {};
    const p = input.path || input.target_notebook;
    if (!p || !interesting(p)) continue;
    if (name === "Write") {
      ops.push({ name, path: normalize(p), contents: input.contents });
    } else if (name === "StrReplace") {
      ops.push({
        name,
        path: normalize(p),
        old_string: input.old_string,
        new_string: input.new_string,
        replace_all: Boolean(input.replace_all),
      });
    }
  }
}

console.log("ops", ops.length);
const counts = {};
for (const op of ops) counts[op.path] = (counts[op.path] || 0) + 1;
console.log(counts);

const failed = [];
for (const op of ops) {
  const rel = op.path;
  if (op.name === "Write") {
    files.set(rel, op.contents);
    continue;
  }
  let cur = files.get(rel);
  if (cur == null) {
    const disk = rel.startsWith(root) ? rel : rel;
    if (fs.existsSync(disk)) cur = fs.readFileSync(disk, "utf8");
    else {
      failed.push({ op: "missing", path: rel });
      continue;
    }
  }
  if (!cur.includes(op.old_string)) {
    failed.push({ op: "nomatch", path: rel, snippet: String(op.old_string).slice(0, 80) });
    continue;
  }
  const next = op.replace_all
    ? cur.split(op.old_string).join(op.new_string)
    : cur.replace(op.old_string, op.new_string);
  files.set(rel, next);
}

console.log("failed", failed.length);
console.log(failed.slice(0, 30));
const outDir = path.join(root, "tmp-restored");
fs.mkdirSync(outDir, { recursive: true });
for (const [p, contents] of files) {
  const safe = p.replace(/[:\\/]/g, "_").slice(-120);
  fs.writeFileSync(path.join(outDir, safe), contents);
  console.log("saved", p, contents.length);
}
