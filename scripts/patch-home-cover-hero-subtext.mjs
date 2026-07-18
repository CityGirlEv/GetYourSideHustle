import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const inputPath = path.join(root, "src", "assets", "home-cover-hero.png");
const backupPath = path.join(root, "src", "assets", "home-cover-hero-before-text-patch.png");

const RIGHT_X = 542;
const RIGHT_W = 538;

async function main() {
  const source = fs.existsSync(backupPath) ? backupPath : inputPath;
  const { width, height } = await sharp(source).metadata();

  // 1) White out all body copy on the right (both sentences).
  const coverTop = 314;
  const coverHeight = 104;
  const textY = 352;
  const textX = Math.round(width * 0.75);

  const textLayer = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${RIGHT_X}" y="${coverTop}" width="${RIGHT_W}" height="${coverHeight}" fill="#ffffff"/>
  <text x="${textX}" y="${textY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="500" fill="#3d3d3d">Part B Optimizer helps you make smarter decisions.</text>
</svg>`;

  let img = sharp(source).composite([{ input: Buffer.from(textLayer), top: 0, left: 0 }]);

  // 2) Shift the right-panel feature list up for even vertical spacing.
  const featuresTop = 404;
  const featuresHeight = 218;
  const shiftUp = 26;

  const base = await img.png().toBuffer();
  const features = await sharp(base)
    .extract({ left: RIGHT_X, top: featuresTop, width: RIGHT_W, height: featuresHeight })
    .toBuffer();

  const tempPath = path.join(root, "src", "assets", ".home-cover-hero-subtext-patched.png");
  await sharp(base)
    .composite([
      {
        input: await sharp({
          create: {
            width: RIGHT_W,
            height: featuresHeight,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          },
        })
          .png()
          .toBuffer(),
        left: RIGHT_X,
        top: featuresTop,
      },
      { input: features, left: RIGHT_X, top: featuresTop - shiftUp },
    ])
    .png()
    .toFile(tempPath);

  fs.copyFileSync(tempPath, inputPath);
  fs.unlinkSync(tempPath);

  console.log(`Patched ${path.relative(root, inputPath)} (${width}x${height})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
