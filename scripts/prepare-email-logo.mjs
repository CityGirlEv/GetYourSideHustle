import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor",
  "projects",
  "c-Users-evely",
  "assets",
);

const defaultHeaderSource = path.join(
  assetsDir,
  "c__Users_evely_AppData_Roaming_Cursor_User_workspaceStorage_5286a9d7d7784363e45f51b55b902cd0_images_MEFullLogo-cebd7a03-54d1-4a02-b43a-c13f2424c536.png",
);
const defaultFooterSource = path.join(
  assetsDir,
  "c__Users_evely_AppData_Roaming_Cursor_User_workspaceStorage_5286a9d7d7784363e45f51b55b902cd0_images_MELogo-de78ea03-2a3b-4562-b313-83a8625ee82b.png",
);

/** Make near-black pixels transparent while preserving blue logo art. */
async function makeBlackTransparent(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
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

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  return { width: info.width, height: info.height };
}

async function prepareLogo(source, outName) {
  const outPath = path.join(root, "public", outName);
  if (!fs.existsSync(source)) {
    if (fs.existsSync(outPath)) {
      console.warn(`Source logo not found for ${outName}, but output already exists in public/. Skipping regeneration.`);
      return;
    }
    console.error("Source logo not found:", source);
    process.exit(1);
  }
  const { width, height } = await makeBlackTransparent(source, outPath);
  console.log(`Wrote ${outPath} (${width}x${height}, transparent background)`);
}

const headerSource = process.argv[2] ?? defaultHeaderSource;
const footerSource = process.argv[3] ?? defaultFooterSource;

await prepareLogo(headerSource, "email-logo.png");
await prepareLogo(footerSource, "email-footer-logo.png");
