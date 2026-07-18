/**
 * Copy CMS landscape JSON to public/ so it is served as a static asset
 * (not bundled into worker/client JS).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const year = process.env.CMS_CONTRACT_YEAR ?? "2026";
const srcDir = path.join(root, "src", "data", "cms-landscape", year);
const destDir = path.join(root, "public", "data", "cms-landscape", year);

if (!fs.existsSync(srcDir)) {
  console.error(
    `copy-cms-landscape-public: missing ${srcDir}\n` +
      "Run: npm run ingest:cms-landscape",
  );
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
for (const name of ["plans.json", "county-index.json", "manifest.json", "state-counties.json"]) {
  const src = path.join(srcDir, name);
  if (!fs.existsSync(src)) continue;
  const dest = path.join(destDir, name);
  fs.copyFileSync(src, dest);
  const mb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
  console.log(`Copied ${name} (${mb} MB) -> public/data/cms-landscape/${year}/`);
}
