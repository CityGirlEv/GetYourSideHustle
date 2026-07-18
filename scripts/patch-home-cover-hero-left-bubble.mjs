/**
 * Nudge the leftmost thought bubble inward so it is not clipped by the hero frame.
 *
 * Usage: node scripts/patch-home-cover-hero-left-bubble.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const heroPath = path.join(root, "src", "assets", "home-cover-hero.png");
const referencePath = path.join(root, "src", "assets", "home-cover-hero-before-getpartb.png");
const backupPath = path.join(root, "src", "assets", "home-cover-hero-before-left-bubble-patch.png");

/** Full bubble crop from the reference art (complete left edge). */
const BUBBLE_REF = { left: 6, top: 104, width: 198, height: 58 };
/** Cover the clipped original bubble with matched panel gray. */
const COVER = { left: 0, top: 110, width: 102, height: 54 };
/** Destination for the repaired bubble on the current hero. */
const PLACE = { left: 94, top: 110 };

async function samplePanelGray(imagePath) {
  const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const points = [
    [150, 255],
    [190, 270],
    [230, 285],
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

async function makePanelGrayTransparent(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    if (max <= 40) {
      data[i + 3] = 0;
      continue;
    }
    if (max - min <= 18 && min >= 130 && max <= 185) {
      data[i + 3] = 0;
    } else if (max - min <= 14 && min >= 118 && max <= 175) {
      data[i + 3] = Math.round(((175 - min) / 45) * 255);
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

async function main() {
  if (!fs.existsSync(heroPath)) {
    throw new Error(`Missing hero image: ${heroPath}`);
  }
  if (!fs.existsSync(referencePath)) {
    throw new Error(`Missing reference hero: ${referencePath}`);
  }

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(heroPath, backupPath);
  }

  const panelGray = await samplePanelGray(heroPath);
  const bubbleRaw = await sharp(referencePath)
    .extract({
      left: BUBBLE_REF.left,
      top: BUBBLE_REF.top,
      width: BUBBLE_REF.width,
      height: BUBBLE_REF.height,
    })
    .png()
    .toBuffer();
  const bubble = await makePanelGrayTransparent(bubbleRaw).then((img) => img.toBuffer());
  const coverPatch = await sharp({
    create: {
      width: COVER.width,
      height: COVER.height,
      channels: 4,
      background: { ...panelGray, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const tempPath = path.join(root, "src", "assets", ".home-cover-hero-left-bubble-patched.png");
  await sharp(heroPath)
    .composite([
      { input: coverPatch, left: COVER.left, top: COVER.top },
      { input: bubble, left: PLACE.left, top: PLACE.top },
    ])
    .png({ compressionLevel: 9 })
    .toFile(tempPath);

  fs.copyFileSync(tempPath, heroPath);
  fs.unlinkSync(tempPath);

  const webpPath = path.join(root, "src", "assets", "home-cover-hero.webp");
  await sharp(heroPath).webp({ quality: 82 }).toFile(webpPath);

  console.log(`Patched left bubble in ${path.relative(root, heroPath)}`);
  console.log(`Regenerated ${path.relative(root, webpPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
