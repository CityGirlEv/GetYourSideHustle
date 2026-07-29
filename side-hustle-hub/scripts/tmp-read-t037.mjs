import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

function fetchAttachment(id) {
  const out = spawnSync(
    process.execPath,
    [
      "--use-system-ca",
      wrangler,
      "d1",
      "execute",
      "gysh-db",
      "--remote",
      "--json",
      "--command",
      `SELECT name, content_base64 FROM task_attachments WHERE id = '${id}'`,
    ],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024, cwd: root },
  );
  if (out.status !== 0) {
    console.error(out.stderr || out.stdout);
    process.exit(1);
  }
  const parsed = JSON.parse(out.stdout);
  const row = parsed?.[0]?.results?.[0];
  if (!row?.content_base64) {
    console.error("No attachment row for", id);
    process.exit(1);
  }
  return row;
}

const id = process.argv[2] || "f-ms5ij8fq-66w05s";
const row = fetchAttachment(id);
const buf = Buffer.from(row.content_base64, "base64");
const destDir = path.join(root, ".tmp");
mkdirSync(destDir, { recursive: true });
const dest = path.join(destDir, row.name || "t037.xlsx");
writeFileSync(dest, buf);
console.log("Wrote", dest, buf.length);

const wb = XLSX.read(buf, { type: "buffer" });
for (const sheetName of wb.SheetNames) {
  console.log("\n===== SHEET:", sheetName, "=====");
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  console.log("rows:", rows.length);
  if (rows.length === 0) {
    const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    console.log(JSON.stringify(aoa.slice(0, 40), null, 2));
    continue;
  }
  console.log("columns:", Object.keys(rows[0] || {}));
  // Print condensed competitor freemium-relevant fields
  for (const r of rows.slice(0, 80)) {
    const keys = Object.keys(r);
    const line = keys
      .map((k) => `${k}: ${String(r[k]).replace(/\s+/g, " ").slice(0, 120)}`)
      .join(" | ");
    console.log("-", line.slice(0, 500));
  }
}
