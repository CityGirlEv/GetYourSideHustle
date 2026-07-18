/**
 * Lossless-ish recompression for shipped site images (build step).
 * Skips *-raw, backup, and design-source PNGs in src/assets.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const LEARNING_CENTER_MAX_WIDTH = 960;
const LEARNING_CENTER_JPEG_QUALITY = 82;
const EMAIL_VARIANT_MAX_WIDTH = 640;
const EMAIL_VARIANT_JPEG_QUALITY = 76;
const WEB_LOGO_MAX_WIDTH = 640;
const EMAIL_LOGO_MAX_WIDTH = 480;
const ICON_MAX_WIDTH = 192;
const HERO_WEBP_QUALITY = 82;

const SOURCE_SKIP = /(?:-raw|-source|-before|-main|-square|-banner|before-after|\.bak)(?:\.|$)/i;

/** PNGs bundled by Vite — only these + their WebP companions are touched in src/assets. */
const BUNDLED_ASSET_NAMES = new Set([
  "home-cover-hero.png",
  "part-b-optimizer-logo.png",
  "part-b-optimizer-icon.png",
  "footer-mini-logo.png",
]);

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

function shouldSkipAssetFile(name) {
  if (SOURCE_SKIP.test(name)) return true;
  if (name.startsWith(".")) return true;
  return !BUNDLED_ASSET_NAMES.has(name);
}

async function writeIfSmaller(outPath, buffer, beforeBytes) {
  if (buffer.length >= beforeBytes) {
    return { wrote: false, beforeBytes, afterBytes: beforeBytes };
  }
  const tempPath = `${outPath}.compress.tmp`;
  await fs.promises.writeFile(tempPath, buffer);
  await fs.promises.rename(tempPath, outPath);
  return { wrote: true, beforeBytes, afterBytes: buffer.length };
}

async function compressPng(filePath, { maxWidth } = {}) {
  const beforeBytes = fs.statSync(filePath).size;
  let img = sharp(filePath);
  const meta = await img.metadata();
  if (maxWidth && meta.width && meta.width > maxWidth) {
    img = img.resize(maxWidth, null, { withoutEnlargement: true, fit: "inside" });
  }
  const buffer = await img
    .png({ compressionLevel: 9, effort: 10, adaptiveFiltering: true })
    .toBuffer();
  return writeIfSmaller(filePath, buffer, beforeBytes);
}

async function compressJpeg(filePath, { maxWidth, quality }) {
  const beforeBytes = fs.statSync(filePath).size;
  let img = sharp(filePath).rotate();
  const meta = await img.metadata();
  if (maxWidth && meta.width && meta.width > maxWidth) {
    img = img.resize(maxWidth, null, { withoutEnlargement: true, fit: "inside" });
  }
  const buffer = await img.jpeg({ quality, mozjpeg: true }).toBuffer();
  return writeIfSmaller(filePath, buffer, beforeBytes);
}

async function writeWebpFromPng(pngPath, webpPath, quality) {
  const beforeBytes = fs.existsSync(webpPath) ? fs.statSync(webpPath).size : 0;
  const buffer = await sharp(pngPath).webp({ quality, effort: 6 }).toBuffer();
  await fs.promises.writeFile(webpPath, buffer);
  return { path: webpPath, bytes: buffer.length, replaced: beforeBytes };
}

async function compressBundledAssets() {
  const assetsDir = path.join(root, "src", "assets");
  const results = [];

  for (const name of fs.readdirSync(assetsDir)) {
    if (!name.endsWith(".png") || shouldSkipAssetFile(name)) continue;
    const filePath = path.join(assetsDir, name);
    const maxWidth =
      name === "part-b-optimizer-logo.png"
        ? WEB_LOGO_MAX_WIDTH
        : name.includes("icon") || name.includes("footer-mini")
          ? ICON_MAX_WIDTH
          : undefined;
    const result = await compressPng(filePath, { maxWidth });
    results.push({ file: `src/assets/${name}`, ...result });

    if (name === "home-cover-hero.png") {
      const webpPath = path.join(assetsDir, "home-cover-hero.webp");
      const webp = await writeWebpFromPng(filePath, webpPath, HERO_WEBP_QUALITY);
      results.push({
        file: "src/assets/home-cover-hero.webp",
        wrote: true,
        beforeBytes: webp.replaced,
        afterBytes: webp.bytes,
      });
    }
  }

  return results;
}

async function compressPublicRoot() {
  const results = [];
  const publicDir = path.join(root, "public");

  for (const name of ["favicon.png", "email-logo.png", "email-header-logo.png", "email-footer-logo.png"]) {
    const filePath = path.join(publicDir, name);
    if (!fs.existsSync(filePath)) continue;
    const maxWidth = name === "favicon.png" ? ICON_MAX_WIDTH : EMAIL_LOGO_MAX_WIDTH;
    results.push({
      file: `public/${name}`,
      ...(await compressPng(filePath, { maxWidth })),
    });
  }

  return results;
}

async function compressLearningCenter() {
  const dir = path.join(root, "public", "learning-center");
  if (!fs.existsSync(dir)) return [];

  const results = [];
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".jpg") || f.endsWith(".jpeg"))) {
    const filePath = path.join(dir, name);
    const isEmailVariant = name.includes("-email.");
    results.push({
      file: `public/learning-center/${name}`,
      ...(await compressJpeg(filePath, {
        maxWidth: isEmailVariant ? EMAIL_VARIANT_MAX_WIDTH : LEARNING_CENTER_MAX_WIDTH,
        quality: isEmailVariant ? EMAIL_VARIANT_JPEG_QUALITY : LEARNING_CENTER_JPEG_QUALITY,
      })),
    });
  }
  return results;
}

function logResults(label, results) {
  let saved = 0;
  for (const row of results) {
    if (!row.wrote && row.beforeBytes === row.afterBytes) {
      console.log(`  skip ${row.file} (already optimal)`);
      continue;
    }
    const delta = row.beforeBytes - row.afterBytes;
    saved += Math.max(0, delta);
    console.log(
      `  ${row.wrote ? "ok" : "skip"} ${row.file}: ${formatKb(row.beforeBytes)} -> ${formatKb(row.afterBytes)}`,
    );
  }
  if (saved > 0) console.log(`${label}: saved ${formatKb(saved)}`);
}

async function main() {
  console.log("Compressing shipped images…");
  logResults("Bundled assets", await compressBundledAssets());
  logResults("Public root", await compressPublicRoot());
  logResults("Learning Center", await compressLearningCenter());
  console.log("Image compression complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
