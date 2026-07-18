import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const CMS_LANDSCAPE_CONTRACT_YEAR = "2026";

const ALLOWED_FILES = new Set([
  "plans.json",
  "county-index.json",
  "manifest.json",
  "state-counties.json",
]);

function projectRoot(): string {
  return process.cwd();
}

/** Resolve CMS landscape JSON on disk (public/ first, then src/data/). */
export function cmsLandscapeDiskPath(year: string, filename: string): string | null {
  if (!ALLOWED_FILES.has(filename)) return null;
  const rel = join("data", "cms-landscape", year, filename);
  const candidates = [
    join(projectRoot(), "public", rel),
    join(projectRoot(), "src", "data", "cms-landscape", year, filename),
  ];
  for (const filePath of candidates) {
    if (existsSync(filePath)) return filePath;
  }
  return null;
}

export function cmsLandscapeFilesAvailable(year = CMS_LANDSCAPE_CONTRACT_YEAR): boolean {
  return (
    cmsLandscapeDiskPath(year, "plans.json") != null &&
    cmsLandscapeDiskPath(year, "county-index.json") != null
  );
}

export async function readCmsLandscapeJsonFile<T>(
  filename: string,
  year = CMS_LANDSCAPE_CONTRACT_YEAR,
): Promise<T | null> {
  const filePath = cmsLandscapeDiskPath(year, filename);
  if (!filePath) return null;
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

/** Match /data/cms-landscape/{year}/{file}.json */
export function parseCmsLandscapeAssetPath(
  pathname: string,
): { year: string; filename: string } | null {
  const match = pathname.match(/^\/data\/cms-landscape\/(\d{4})\/([\w.-]+\.json)$/);
  if (!match) return null;
  const [, year, filename] = match;
  if (!ALLOWED_FILES.has(filename)) return null;
  return { year, filename };
}

const SMALL_PRETTY_FILES = new Set(["manifest.json", "state-counties.json"]);

/** Browser tab navigation — pretty JSON. App fetch keeps compact files. */
function shouldPrettyPrintCmsLandscape(
  request: Request | undefined,
  filename: string,
  searchParams?: URLSearchParams,
): boolean {
  if (searchParams?.get("pretty") === "1") return true;
  if (SMALL_PRETTY_FILES.has(filename)) return true;
  const accept = request?.headers.get("accept") ?? "";
  return /\btext\/html\b/.test(accept);
}

function formatJsonResponseBody(raw: Buffer, pretty: boolean): string {
  if (!pretty) return raw.toString("utf8");
  return `${JSON.stringify(JSON.parse(raw.toString("utf8")), null, 2)}\n`;
}

function cmsLandscapeJsonResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

export async function createCmsLandscapeAssetResponse(
  pathname: string,
  assets?: { fetch: typeof fetch },
  request?: Request,
): Promise<Response | null> {
  const parsed = parseCmsLandscapeAssetPath(pathname);
  if (!parsed) return null;

  const searchParams = request ? new URL(request.url).searchParams : undefined;
  const pretty = shouldPrettyPrintCmsLandscape(request, parsed.filename, searchParams);

  if (assets && request) {
    const assetResponse = await assets.fetch(request);
    if (assetResponse.ok) {
      if (!pretty) return assetResponse;
      const raw = Buffer.from(await assetResponse.arrayBuffer());
      return cmsLandscapeJsonResponse(formatJsonResponseBody(raw, true));
    }
  }

  const filePath = cmsLandscapeDiskPath(parsed.year, parsed.filename);
  if (!filePath) {
    return new Response(
      JSON.stringify(
        {
          error: "CMS landscape file not found on disk",
          path: pathname,
          hint: "Run: npm run ingest:cms-landscape",
        },
        null,
        2,
      ),
      {
        status: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  }

  const body = await readFile(filePath);
  return cmsLandscapeJsonResponse(formatJsonResponseBody(body, pretty));
}
