/**
 * Install the PB+ circular mini logo for footer, icon slots, and favicon.
 *
 * Usage: node scripts/install-mini-logo.mjs [source.png]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assets = path.join(root, "src", "assets");
const publicDir = path.join(root, "public");

const defaultSource = path.join(
  path.dirname(root),
  "..",
  ".cursor",
  "projects",
  "c-Users-evely",
  "assets",
  "c__Users_evely_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_2-84f53269-dd88-4fa0-81df-87d6d32e3872.png",
);

const source = process.argv[2] ? path.resolve(process.argv[2]) : defaultSource;

async function makeWhiteTransparent(inputBuffer) {
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
    if (min >= 245) {
      data[i + 3] = 0;
    } else if (min >= 230 && max - min <= 20) {
      data[i + 3] = Math.round(((245 - min) / 15) * 255);
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

async function main() {
  if (!fs.existsSync(source)) {
    throw new Error(`Mini logo source not found: ${source}`);
  }

  const rawOut = path.join(assets, "footer-mini-logo-raw.png");
  fs.copyFileSync(source, rawOut);

  const transparent = await makeWhiteTransparent(fs.readFileSync(source));
  const png = await transparent.png().toBuffer();
  const mini = await sharp(png)
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  for (const name of ["footer-mini-logo.png", "part-b-optimizer-icon.png"]) {
    fs.writeFileSync(path.join(assets, name), mini);
  }

  fs.writeFileSync(
    path.join(publicDir, "favicon.png"),
    await sharp(mini)
      .resize(192, 192, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  const meta = await sharp(mini).metadata();
  console.log(`Installed mini logo (${meta.width}x${meta.height}) from ${source}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
