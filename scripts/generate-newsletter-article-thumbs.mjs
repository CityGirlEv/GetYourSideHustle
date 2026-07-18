/**
 * Center-crop Learning Center heroes to 3:2 for newsletter email (matches site thumbnails).
 * Writes public/learning-center/{slug}-email.jpg next to each {slug}.jpg.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, "..", "public", "learning-center");
const TARGET_ASPECT = 3 / 2;
const OUTPUT_WIDTH = 504;
const OUTPUT_HEIGHT = 336;

async function centerCrop3x2(inputPath, outputPath) {
  const meta = await sharp(inputPath).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error(`Invalid image: ${inputPath}`);

  let cropW;
  let cropH;
  let left;
  let top;

  if (width / height > TARGET_ASPECT) {
    cropH = height;
    cropW = Math.round(height * TARGET_ASPECT);
    left = Math.round((width - cropW) / 2);
    top = 0;
  } else {
    cropW = width;
    cropH = Math.round(width / TARGET_ASPECT);
    left = 0;
    top = Math.round((height - cropH) / 2);
  }

  await sharp(inputPath)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: "fill" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);
}

async function main() {
  if (!fs.existsSync(inputDir)) {
    console.warn(`No ${inputDir} — skip newsletter thumbs`);
    return;
  }

  const sources = fs
    .readdirSync(inputDir)
    .filter((name) => /\.jpe?g$/i.test(name) && !/-email\.jpe?g$/i.test(name));

  for (const name of sources) {
    const slug = name.replace(/\.jpe?g$/i, "");
    const inputPath = path.join(inputDir, name);
    const outputPath = path.join(inputDir, `${slug}-email.jpg`);
    await centerCrop3x2(inputPath, outputPath);
    const size = fs.statSync(outputPath).size;
    console.log(`  ${slug}-email.jpg (${size.toLocaleString()} bytes)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
