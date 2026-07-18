/**
 * Restore wide hero from source without laptop lid inpainting.
 * The blur-patch approach left a visible mask; use the clean source instead.
 *
 * Usage:
 *   node scripts/patch-home-cover-hero-laptop-logo.mjs [hero-source.png]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const defaultSource = path.join(root, "src", "assets", "home-cover-hero-before-after.png");
const outputPath = path.join(root, "src", "assets", "home-cover-hero.png");

async function main() {
  const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultSource;
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Hero source not found: ${sourcePath}`);
  }

  const meta = await sharp(sourcePath).metadata();
  if (meta.height > 430) {
    throw new Error(`Expected wide banner (<=430px tall), got ${meta.width}x${meta.height}`);
  }

  await sharp(sourcePath).png({ compressionLevel: 9 }).toFile(outputPath);

  console.log(
    `Restored hero without laptop mask -> ${path.relative(root, outputPath)} (${meta.width}x${meta.height})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
