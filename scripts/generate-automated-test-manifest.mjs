/**
 * Build-time scan of Vitest/Playwright sources → compact manifest JSON.
 * Avoids bundling every *.test.ts source into the worker via import.meta.glob.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, pattern) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, pattern));
    else if (pattern.test(entry.name)) out.push(full);
  }
  return out;
}

function parseTestFile(src) {
  const describes = [];
  const tests = [];
  const reDescribe = /\bdescribe(?:\.\w+)?\s*\(\s*(['"`])([^'"`]+?)\1/g;
  const reTest = /\b(?:it|test)(?:\.\w+)?\s*\(\s*(['"`])([^'"`]+?)\1/g;
  let m;
  while ((m = reDescribe.exec(src))) describes.push(m[2]);
  while ((m = reTest.exec(src))) tests.push(m[2]);
  return { describes, tests };
}

function shortFile(filePath) {
  return path.basename(filePath);
}

function idSlug(s) {
  return s
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .toUpperCase();
}

function buildEntries(files, area, idPrefix) {
  const owner = idPrefix === "UNIT" ? "Vitest" : "Playwright";
  const entries = [];
  for (const filePath of files) {
    const src = fs.readFileSync(filePath, "utf8");
    const file = shortFile(filePath);
    const rel = path.relative(root, filePath).replace(/\\/g, "/");
    const { describes, tests } = parseTestFile(src);
    const suite = describes[0] || file.replace(/\.(test|spec)\.tsx?$/, "");
    tests.forEach((title, i) => {
      const id = `${idPrefix}-${idSlug(file)}-${String(i + 1).padStart(2, "0")}`;
      entries.push({
        id,
        area,
        title: `${suite}: ${title}`,
        priority: "P2",
        preconditions: `Automated — runs via ${idPrefix === "UNIT" ? "vitest" : "playwright"} in ${file}`,
        steps: [
          idPrefix === "UNIT"
            ? `Run: bunx vitest run ${rel}`
            : `Run: bunx playwright test ${rel}`,
        ],
        expected: "Test passes in CI",
        assignee: owner,
      });
    });
  }
  entries.sort((a, b) => a.id.localeCompare(b.id));
  return entries;
}

const unitFiles = walk(path.join(root, "src"), /\.test\.tsx?$/);
const e2eFiles = walk(path.join(root, "e2e"), /\.spec\.tsx?$/);

const manifest = {
  generatedAt: new Date().toISOString(),
  unit: buildEntries(unitFiles, "Unit (Vitest)", "UNIT"),
  e2e: buildEntries(e2eFiles, "E2E (Playwright)", "E2E"),
};

const outPath = path.join(root, "src", "lib", "automated-test-manifest.json");
fs.writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Wrote ${outPath} (${manifest.unit.length} unit + ${manifest.e2e.length} e2e cases)`,
);
