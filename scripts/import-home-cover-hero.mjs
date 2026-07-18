/**
 * Import the user-provided hero image as the homepage cover (preserves transparency).
 *
 * Usage:
 *   node scripts/import-home-cover-hero.mjs [source-image]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const defaultSource = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor",
  "projects",
  "c-Users-evely",
  "assets",
  "c__Users_evely_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_CoverFinal-6d33b676-fb35-4b80-be1a-6dc82c8ce113.png",
);
const outputPath = path.join(root, "src", "assets", "home-cover-hero.png");

async function main() {
  const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultSource;
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Hero source not found: ${sourcePath}`);
  }

  const { width, height, hasAlpha } = await sharp(sourcePath)
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Wrote ${path.relative(root, outputPath)} (${width}x${height}, alpha=${hasAlpha})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
