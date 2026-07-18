/**
 * Erase the baked-in left headline on the wide hero so CSS can render it
 * with a transparent background.
 *
 * Usage: node scripts/prepare-home-cover-hero-reference.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "src", "assets", "home-cover-hero-before-getpartb.png");
const outputPath = path.join(root, "src", "assets", "home-cover-hero.png");

/** Erase legacy left headline pixels without overlapping the center arrow. */
const ERASE = { left: 16, top: 18, width: 432, height: 132 };

async function sampleLeftPanelGray(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const points = [
    [90, 170],
    [140, 210],
    [200, 250],
  ];
  let r = 0;
  let g = 0;
  let b = 0;

  for (const [x, y] of points) {
    const i = (y * info.width + x) * info.channels;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  return {
    r: Math.round(r / points.length),
    g: Math.round(g / points.length),
    b: Math.round(b / points.length),
  };
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source hero: ${sourcePath}`);
  }

  const meta = await sharp(sourcePath).metadata();
  const panelGray = await sampleLeftPanelGray(sourcePath);

  const erasePatch = await sharp({
    create: {
      width: ERASE.width,
      height: ERASE.height,
      channels: 4,
      background: { ...panelGray, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const tempPath = path.join(root, "src", "assets", ".home-cover-hero-reference.png");
  await sharp(sourcePath)
    .composite([{ input: erasePatch, left: ERASE.left, top: ERASE.top }])
    .png({ compressionLevel: 9 })
    .toFile(tempPath);

  fs.copyFileSync(tempPath, outputPath);
  fs.unlinkSync(tempPath);

  console.log(
    `Erased left headline on ${path.relative(root, outputPath)} (${meta.width}x${meta.height})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
