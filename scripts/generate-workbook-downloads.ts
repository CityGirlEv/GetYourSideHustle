/**
 * Write the latest workbook PDF (+ Facebook teaser JPG) to public/downloads/
 * before Cloudflare Pages / Worker deploy.
 *
 * Usage: bun run scripts/generate-workbook-downloads.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "../src/lib/content-factory/workbook-lead-magnet-seed";
import { DEFAULT_WORKBOOK_SLUG } from "../src/lib/content-factory/lead-magnet-paths";
import {
  buildLeadMagnetWorkbookPdf,
  LEAD_MAGNET_PDF_LAYOUT_VERSION,
} from "../src/lib/lead-magnet-pdf";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const downloadsDir = path.join(root, "public", "downloads");
const slug = DEFAULT_WORKBOOK_SLUG;

function loadLogoDataUrl(): string | null {
  const candidates = [
    path.join(root, "public", "email-header-logo.png"),
    path.join(root, "src", "assets", "part-b-optimizer-logo.png"),
  ];
  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const base64 = fs.readFileSync(filePath).toString("base64");
    return `data:image/png;base64,${base64}`;
  }
  return null;
}

async function main(): Promise<void> {
  const source = {
    title: DEFAULT_WORKBOOK_LEAD_MAGNET.title,
    excerpt: DEFAULT_WORKBOOK_LEAD_MAGNET.excerpt,
    body: DEFAULT_WORKBOOK_LEAD_MAGNET.body,
  };
  const assets = { logoDataUrl: loadLogoDataUrl() };

  const doc = buildLeadMagnetWorkbookPdf(source, assets);
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  fs.mkdirSync(downloadsDir, { recursive: true });
  const pdfPath = path.join(downloadsDir, `${slug}.pdf`);
  const versionPath = path.join(downloadsDir, "version.json");

  fs.writeFileSync(pdfPath, pdfBuffer);
  fs.writeFileSync(
    versionPath,
    `${JSON.stringify(
      {
        slug,
        layoutVersion: LEAD_MAGNET_PDF_LAYOUT_VERSION,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Wrote ${pdfPath} (${pdfBuffer.length} bytes)`);
  console.log(`Layout version: ${LEAD_MAGNET_PDF_LAYOUT_VERSION}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
