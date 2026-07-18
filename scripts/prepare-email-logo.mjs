import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const rawLogoSource = path.join(root, "src", "assets", "part-b-optimizer-logo-raw.png");
const processedLogoPath = path.join(root, "src", "assets", "part-b-optimizer-logo.png");
const processedIconPath = path.join(root, "src", "assets", "part-b-optimizer-icon.png");
const footerMiniLogoPath = path.join(root, "src", "assets", "footer-mini-logo.png");
const footerMiniRawSource = path.join(root, "src", "assets", "footer-mini-logo-raw.png");

const emailOutputs = ["email-logo.png", "email-header-logo.png", "email-footer-logo.png"];

/** Padding around detected logo art after transparency trim (px). Bottom kept tight. */
const CROP_PADDING = { top: 6, right: 6, bottom: 0, left: 6 };

/** Make near-white and near-black pixels transparent (icon uploads often have letterboxing). */
async function makeBackgroundTransparent(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max <= 32) {
      data[i + 3] = 0;
    } else if (max <= 64 && min <= 64) {
      data[i + 3] = Math.round(((max - 32) / 32) * 255);
    } else if (min >= 240) {
      data[i + 3] = 0;
    } else if (min >= 220 && max - min <= 24) {
      data[i + 3] = Math.round(((240 - min) / 20) * 255);
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

/** Make near-black pixels transparent while preserving blue logo art. */
async function makeBlackTransparent(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    if (max <= 32) {
      data[i + 3] = 0;
    } else if (max <= 64 && r <= 64 && g <= 64 && b <= 64) {
      data[i + 3] = Math.round(((max - 32) / 32) * 255);
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

/** Crop to visible pixels; minimal padding on the bottom edge. */
async function cropToContent(pngBuffer, padding = CROP_PADDING) {
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { buffer: pngBuffer, width: info.width, height: info.height };
  }

  const left = Math.max(0, minX - padding.left);
  const top = Math.max(0, minY - padding.top);
  const right = Math.min(info.width - 1, maxX + padding.right);
  const bottom = Math.min(info.height - 1, maxY + padding.bottom);
  const width = right - left + 1;
  const height = bottom - top + 1;

  const croppedBuffer = await sharp(pngBuffer).extract({ left, top, width, height }).png().toBuffer();
  return { buffer: croppedBuffer, width, height };
}

async function processLogo(inputPath, outputPath, transparentFn = makeBlackTransparent, padding = CROP_PADDING) {
  const inputBuffer = fs.readFileSync(inputPath);
  const transparent = await transparentFn(inputBuffer);
  const pngBuffer = await transparent.png().toBuffer();
  const { buffer, width, height } = await cropToContent(pngBuffer, padding);
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(outputPath);
  return { width, height };
}

/** Crop the PB monogram from the left edge of the processed wordmark. */
async function extractIconFromWordmark(pngBuffer) {
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const contentWidth = maxX - minX + 1;
  const iconWidth = Math.max(64, Math.round(contentWidth * 0.24));
  const iconHeight = info.height;
  const extractWidth = Math.min(iconWidth, info.width);
  const iconBuffer = await sharp(pngBuffer)
    .extract({ left: 0, top: 0, width: extractWidth, height: iconHeight })
    .png()
    .toBuffer();
  const iconPadding = { top: 4, right: 4, bottom: 4, left: 4 };
  const { buffer } = await cropToContent(iconBuffer, iconPadding);
  return buffer;
}

async function main() {
  const keepMini = process.argv.includes("--keep-mini");
  const source = process.argv.find((arg) => !arg.startsWith("-") && arg.endsWith(".png")) ?? rawLogoSource;
  if (!fs.existsSync(source)) {
    if (fs.existsSync(processedLogoPath)) {
      console.warn("Raw logo missing; syncing existing processed logo to public/");
      for (const outName of emailOutputs) {
        fs.copyFileSync(processedLogoPath, path.join(root, "public", outName));
      }
      return;
    }
    console.error("Logo source not found:", source);
    process.exit(1);
  }

  const tempOut = path.join(root, "src", "assets", ".logo-processed.tmp.png");
  const { width, height } = await processLogo(source, tempOut, makeBackgroundTransparent);
  fs.renameSync(tempOut, processedLogoPath);
  console.log(`Processed logo (${width}x${height}, tight bottom crop): ${processedLogoPath}`);

  const logoBuffer = fs.readFileSync(processedLogoPath);

  if (keepMini) {
    console.log("Keeping existing part-b-optimizer-icon.png and footer-mini-logo.png");
  } else {
    const iconBuffer = await extractIconFromWordmark(logoBuffer);
    await sharp(iconBuffer).png({ compressionLevel: 9 }).toFile(processedIconPath);

    if (fs.existsSync(footerMiniRawSource)) {
      const footerTemp = path.join(root, "src", "assets", ".footer-mini.tmp.png");
      const footerPadding = { top: 6, right: 6, bottom: 6, left: 6 };
      const footerDims = await processLogo(
        footerMiniRawSource,
        footerTemp,
        makeBlackTransparent,
        footerPadding,
      );
      fs.renameSync(footerTemp, footerMiniLogoPath);
      console.log(`Footer mini logo (${footerDims.width}x${footerDims.height}) -> ${footerMiniLogoPath}`);
    } else {
      await sharp(iconBuffer).png({ compressionLevel: 9 }).toFile(footerMiniLogoPath);
      console.log(`Footer mini logo (from wordmark) -> ${footerMiniLogoPath}`);
    }

    const faviconSource = fs.existsSync(footerMiniLogoPath)
      ? footerMiniLogoPath
      : processedIconPath;
    const faviconPath = path.join(root, "public", "favicon.png");
    await sharp(faviconSource)
      .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(faviconPath);
    console.log(`Processed icon -> ${processedIconPath}`);
    console.log(`Favicon -> ${faviconPath}`);
  }

  for (const outName of ["email-logo.png", "email-header-logo.png"]) {
    const outPath = path.join(root, "public", outName);
    fs.copyFileSync(processedLogoPath, outPath);
    console.log(`Copied -> ${outPath}`);
  }

  const footerLogoSource = fs.existsSync(footerMiniLogoPath)
    ? footerMiniLogoPath
    : processedIconPath;
  const footerOutPath = path.join(root, "public", "email-footer-logo.png");
  fs.copyFileSync(footerLogoSource, footerOutPath);
  console.log(`Footer mini logo -> ${footerOutPath}`);

  const logoHash = crypto
    .createHash("md5")
    .update(fs.readFileSync(processedLogoPath))
    .update(fs.readFileSync(footerLogoSource))
    .digest("hex")
    .slice(0, 10);
  const versionTsPath = path.join(root, "src", "lib", "email-logo-version.ts");
  fs.writeFileSync(
    versionTsPath,
    `/** Auto-generated by scripts/prepare-email-logo.mjs — do not edit */\nexport const EMAIL_LOGO_CACHE_VERSION = "${logoHash}";\n`,
  );
  console.log(`Logo cache version -> ${logoHash}`);

  const distDir = path.join(root, "dist");
  if (fs.existsSync(distDir)) {
    for (const fileName of ["email-logo.png", "email-header-logo.png", "email-footer-logo.png", "favicon.png"]) {
      const src = path.join(root, "public", fileName);
      if (!fs.existsSync(src)) continue;
      fs.copyFileSync(src, path.join(distDir, fileName));
    }
    console.log("Synced email logos + favicon to dist/");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
