/**
 * Downloads the official CMS CY Medicare Advantage / Part D Landscape file,
 * parses it, and writes compact nationwide JSON for the benchmark app.
 *
 * Source: https://www.cms.gov/medicare/coverage/prescription-drug-coverage
 * Default file: CY2026 Landscape (updated monthly by CMS).
 */
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DEFAULT_LANDSCAPE_URL =
  process.env.CMS_LANDSCAPE_URL ??
  "https://www.cms.gov/files/zip/cy2026-landscape-202603.zip";

const CONTRACT_YEAR = Number(process.env.CMS_CONTRACT_YEAR ?? "2026");
const OUT_DIR = path.join(ROOT, "src", "data", "cms-landscape", String(CONTRACT_YEAR));
const TMP_DIR = path.join(ROOT, ".cms-ingest-tmp");

import type { CmsLandscapePlanRecord } from "../src/lib/cms-landscape-types";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseMoney(raw: string | undefined): number | null {
  const t = (raw ?? "").trim();
  if (!t || /not applicable/i.test(t)) return null;
  const neg = t.includes("(");
  const num = Number.parseFloat(t.replace(/[$,()]/g, "").trim());
  if (Number.isNaN(num)) return null;
  return neg ? -num : num;
}

function parseStar(raw: string | undefined): number | null {
  const t = (raw ?? "").trim();
  if (!t || /not applicable/i.test(t)) return null;
  const num = Number.parseFloat(t);
  return Number.isNaN(num) ? null : num;
}

function normalizeCountyKey(county: string): string {
  return county
    .toLowerCase()
    .replace(/\s+(county|parish|borough|census area|municipality|city and borough)\b/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function countyIndexKey(stateAbbr: string, countyName: string): string {
  if (/^all counties$/i.test(countyName.trim())) {
    return `${stateAbbr}:__statewide__`;
  }
  return `${stateAbbr}:${normalizeCountyKey(countyName)}`;
}

function rowToPlan(cols: Record<string, string>): CmsLandscapePlanRecord {
  const contractId = cols["Contract ID"] ?? "";
  const planId = cols["Plan ID"] ?? "";
  const segmentId = cols["Segment ID"] ?? "0";
  const id = cols["ContractPlanSegmentID"] ?? `${contractId}_${planId}_${segmentId}`;

  return {
    id,
    contractId,
    planId,
    segmentId,
    contractPlanId: cols["ContractPlanID"] ?? `${contractId}_${planId}`,
    contractCategory: cols["Contract Category Type"] ?? "",
    state: cols["State Territory Abbreviation"] ?? "",
    county: cols["County Name"] ?? "",
    parentOrganization: cols["Parent Organization Name"] ?? "",
    marketingName: cols["Organization Marketing Name"] ?? "",
    planName: cols["Plan Name"] ?? "",
    planType: cols["Plan Type"] ?? "",
    snpIndicator: /^yes$/i.test(cols["Special Needs Plan (SNP) Indicator"] ?? ""),
    snpType: cols["SNP Type"] ?? "",
    partDCoverage: /^yes$/i.test(cols["Part D Coverage Indicator"] ?? ""),
    partCPremium: parseMoney(cols["Part C Premium"]),
    partDTotalPremium: parseMoney(cols["Part D Total Premium"]),
    consolidatedPremium: parseMoney(cols["Monthly Consolidated Premium (Part C + D)"]),
    partDDeductible: parseMoney(cols["Annual Part D Deductible Amount"]),
    inNetworkMoop: parseMoney(cols["In-Network Maximum Out-of-Pocket (MOOP) Amount"]),
    partOopThreshold: parseMoney(cols["Part D Out-of-Pocket (OOP) Threshold"]),
    overallStarRating: parseStar(cols["Overall Star Rating"]),
    partCStarRating: parseStar(cols["Part C Summary Star Rating"]),
    partDStarRating: parseStar(cols["Part D Summary Star Rating"]),
    sanctioned: /^yes$/i.test(cols["Sanctioned Plan"] ?? ""),
  };
}

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CMS download failed (${res.status}): ${url}`);
  }
  if (!res.body) {
    throw new Error(`CMS download returned no body: ${url}`);
  }
  await pipeline(Readable.fromWeb(res.body as import("node:stream/web").ReadableStream), createWriteStream(dest));
}

async function findLandscapeCsv(extractDir: string): Promise<string> {
  const { readdirSync, statSync } = await import("node:fs");
  const stack = [extractDir];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) stack.push(full);
      else if (/landscape.*\.csv$/i.test(name)) return full;
    }
  }
  throw new Error(`No landscape CSV found under ${extractDir}`);
}

async function extractZip(zipPath: string, destDir: string): Promise<void> {
  if (existsSync(destDir)) rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });
  if (process.platform === "win32") {
    const proc = Bun.spawn(
      [
        "powershell",
        "-NoProfile",
        "-Command",
        `Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force`,
      ],
      { stdout: "inherit", stderr: "inherit" },
    );
    const code = await proc.exited;
    if (code !== 0) throw new Error(`Expand-Archive failed with code ${code}`);
    return;
  }
  const proc = Bun.spawn(["unzip", "-o", zipPath, "-d", destDir], {
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`unzip failed with code ${code}`);
}

async function parseLandscapeCsv(csvPath: string): Promise<{
  plans: Record<string, CmsLandscapePlanRecord>;
  countyIndex: Record<string, string[]>;
  stateCountyKeys: Record<string, string[]>;
}> {
  const plans: Record<string, CmsLandscapePlanRecord> = {};
  const countyIndex: Record<string, string[]> = {};
  const stateCountyKeys: Record<string, string[]> = {};

  const rl = createInterface({
    input: createReadStream(csvPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let headers: string[] | null = null;
  let rowCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (!headers) {
      headers = parseCsvLine(line).map((h, i) => (i === 0 ? h.replace(/^\uFEFF/, "") : h));
      continue;
    }
    const fields = parseCsvLine(line);
    const cols: Record<string, string> = {};
    headers.forEach((h, i) => {
      cols[h] = fields[i] ?? "";
    });

    const year = Number.parseInt(cols["Contract Year"] ?? "", 10);
    if (year !== CONTRACT_YEAR) continue;

    const plan = rowToPlan(cols);
    if (plan.sanctioned) continue;

    if (!plans[plan.id]) {
      plans[plan.id] = plan;
    }

    const state = plan.state;
    const key = countyIndexKey(state, plan.county);
    if (!countyIndex[key]) countyIndex[key] = [];
    if (!countyIndex[key]!.includes(plan.id)) {
      countyIndex[key]!.push(plan.id);
    }

    if (!stateCountyKeys[state]) stateCountyKeys[state] = [];
    if (key !== `${state}:__statewide__` && !stateCountyKeys[state]!.includes(key)) {
      stateCountyKeys[state]!.push(key);
    }

    rowCount++;
  }

  console.log(`Parsed ${rowCount} county-plan rows, ${Object.keys(plans).length} unique plans`);
  return { plans, countyIndex, stateCountyKeys };
}

async function main(): Promise<void> {
  mkdirSync(TMP_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const zipPath = path.join(TMP_DIR, "landscape.zip");
  const extractDir = path.join(TMP_DIR, "extracted");
  const localCsv = process.env.CMS_LANDSCAPE_CSV;

  let csvPath: string;
  if (localCsv && existsSync(localCsv)) {
    console.log(`Using local CSV ${localCsv}`);
    csvPath = localCsv;
  } else {
    if (!existsSync(zipPath)) {
      console.log(`Downloading CMS landscape from ${DEFAULT_LANDSCAPE_URL}`);
      await downloadToFile(DEFAULT_LANDSCAPE_URL, zipPath);
    } else {
      console.log(`Reusing cached ZIP ${zipPath}`);
    }

    console.log("Extracting ZIP…");
    await extractZip(zipPath, extractDir);
    csvPath = await findLandscapeCsv(extractDir);
  }

  console.log(`Parsing ${csvPath}`);

  const { plans, countyIndex, stateCountyKeys } = await parseLandscapeCsv(csvPath);

  const manifest = {
    contractYear: CONTRACT_YEAR,
    sourceUrl: DEFAULT_LANDSCAPE_URL,
    ingestedAt: new Date().toISOString(),
    planCount: Object.keys(plans).length,
    countyBucketCount: Object.keys(countyIndex).length,
    disclaimer:
      "Official CMS Medicare Advantage and Part D Landscape data. Medigap supplements are modeled separately. D-SNP plans require Medicaid eligibility.",
  };

  const { writeFileSync } = await import("node:fs");
  writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  writeFileSync(path.join(OUT_DIR, "plans.json"), JSON.stringify(plans));
  writeFileSync(path.join(OUT_DIR, "county-index.json"), JSON.stringify(countyIndex));
  writeFileSync(path.join(OUT_DIR, "state-counties.json"), JSON.stringify(stateCountyKeys));

  const plansSize = (readFileSync(path.join(OUT_DIR, "plans.json")).length / 1024 / 1024).toFixed(2);
  const indexSize = (readFileSync(path.join(OUT_DIR, "county-index.json")).length / 1024 / 1024).toFixed(2);
  console.log(`Wrote ${OUT_DIR} (plans ${plansSize} MB, county index ${indexSize} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
