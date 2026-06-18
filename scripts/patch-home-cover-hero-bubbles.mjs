import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const inputPath = path.join(root, "src", "assets", "home-cover-hero.png");
const backupPath = path.join(root, "src", "assets", "home-cover-hero-before-after.png");

/** Left panel only: gray question marks + black captions (keep headings above). */
const LEFT_MASK = { x0: 0, y0: 108, x1: 498, y1: 282 };
const LEFT_FILL = [152, 153, 157];

async function main() {
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
  }

  const { data, info } = await sharp(backupPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const channels = info.channels;

  let changed = 0;
  for (let y = LEFT_MASK.y0; y <= LEFT_MASK.y1; y++) {
    for (let x = LEFT_MASK.x0; x <= LEFT_MASK.x1; x++) {
      const index = (y * width + x) * channels;
      data[index] = LEFT_FILL[0];
      data[index + 1] = LEFT_FILL[1];
      data[index + 2] = LEFT_FILL[2];
      changed += 1;
    }
  }

  const tempPath = path.join(root, "src", "assets", ".home-cover-hero-patched.png");
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels },
  })
    .jpeg({ quality: 93, mozjpeg: true })
    .toFile(tempPath);

  fs.copyFileSync(tempPath, inputPath);
  fs.unlinkSync(tempPath);

  console.log(`Painted ${changed} pixels in ${path.relative(root, inputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
