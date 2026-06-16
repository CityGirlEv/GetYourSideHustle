import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const rawLogoSource = path.join(root, "src", "assets", "get-part-b-optimizer-logo-raw.png");
const processedLogoPath = path.join(root, "src", "assets", "get-part-b-optimizer-logo.png");
const rawIconSource = path.join(root, "src", "assets", "get-part-b-optimizer-icon-raw.png");
const processedIconPath = path.join(root, "src", "assets", "get-part-b-optimizer-icon.png");

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

async function main() {
  const source = process.argv[2] ?? rawLogoSource;
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
  const { width, height } = await processLogo(source, tempOut);
  fs.renameSync(tempOut, processedLogoPath);
  console.log(`Processed logo (${width}x${height}, tight bottom crop): ${processedLogoPath}`);

  for (const outName of emailOutputs) {
    const outPath = path.join(root, "public", outName);
    fs.copyFileSync(processedLogoPath, outPath);
    console.log(`Copied -> ${outPath}`);
  }

  if (fs.existsSync(rawIconSource)) {
    const iconTemp = path.join(root, "src", "assets", ".icon-processed.tmp.png");
    const iconPadding = { top: 4, right: 4, bottom: 4, left: 4 };
    const iconDims = await processLogo(
      rawIconSource,
      iconTemp,
      makeBackgroundTransparent,
      iconPadding,
    );
    fs.renameSync(iconTemp, processedIconPath);
    console.log(`Processed icon (${iconDims.width}x${iconDims.height}): ${processedIconPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
