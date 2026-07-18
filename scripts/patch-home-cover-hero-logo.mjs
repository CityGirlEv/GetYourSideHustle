/**
 * Replace legacy Get Part B logos on the home cover hero with the current wordmark.
 *
 * Usage:
 *   node scripts/patch-home-cover-hero-logo.mjs [hero-source.png]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const defaultHeroSource = path.join(root, "src", "assets", "home-cover-hero-before-after.png");
const outputPath = path.join(root, "src", "assets", "home-cover-hero.png");
const backupPath = path.join(root, "src", "assets", "home-cover-hero-before-getpartb.png");
const logoPath = path.join(root, "src", "assets", "part-b-optimizer-logo.png");

/** Paint a solid rectangle (used to cover old wordmarks before compositing). */
async function solidPatch(rect, rgb = [255, 255, 255]) {
  const patch = await sharp({
    create: {
      width: rect.width,
      height: rect.height,
      channels: 4,
      background: { r: rgb[0], g: rgb[1], b: rgb[2], alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  return { input: patch, left: rect.left, top: rect.top };
}

/** Regions tuned for the 1024×1024 before/after hero with bottom banner. */
const HERO_1024 = {
  laptopCover: { left: 488, top: 392, width: 248, height: 82 },
  laptopLogoWidth: 220,
  laptopLogoTop: 398,
  bottomCover: { left: 36, top: 728, width: 952, height: 210 },
  bottomLogoWidth: 820,
  bottomLogoTop: 758,
};

/** Wide before/after banner (1024×426) — laptop screen + bottom wordmark. */
const HERO_426 = {
  laptopCover: { left: 556, top: 244, width: 162, height: 60 },
  laptopLogoWidth: 150,
  laptopLogoTop: 246,
  laptopPatchColor: [228, 230, 234],
  bottomCover: { left: 262, top: 320, width: 500, height: 78 },
  bottomLogoWidth: 480,
  bottomLogoTop: 322,
};

/** Regions for the older 1024×748 crop (laptop only). */
const HERO_748 = {
  laptopCover: { left: 488, top: 392, width: 248, height: 82 },
  laptopLogoWidth: 220,
  laptopLogoTop: 398,
  bottomCover: { left: 36, top: 628, width: 952, height: 110 },
  bottomLogoWidth: 820,
  bottomLogoTop: 638,
};

async function patchHero(heroSource) {
  if (!fs.existsSync(heroSource)) {
    throw new Error(`Hero source not found: ${heroSource}`);
  }
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo not found: ${logoPath} — run node scripts/prepare-email-logo.mjs first`);
  }

  const meta = await sharp(heroSource).metadata();
  const layout =
    meta.height >= 1000 ? HERO_1024 : meta.height <= 430 ? HERO_426 : HERO_748;

  const logoMeta = await sharp(logoPath).metadata();
  const logoAspect = logoMeta.height / logoMeta.width;

  const composites = [];

  if (layout.laptopCover) {
    const laptopLogoWidth = layout.laptopLogoWidth;
    const laptopLogoHeight = Math.round(laptopLogoWidth * logoAspect);
    const laptopLogoLeft = Math.round(
      layout.laptopCover.left + (layout.laptopCover.width - laptopLogoWidth) / 2,
    );

    const laptopLogo = await sharp(logoPath)
      .resize(laptopLogoWidth, laptopLogoHeight, { fit: "inside" })
      .png()
      .toBuffer();

    composites.push(
      await solidPatch(layout.laptopCover, layout.laptopPatchColor ?? [255, 255, 255]),
    );
    composites.push({
      input: laptopLogo,
      left: laptopLogoLeft,
      top: layout.laptopLogoTop,
    });
  }

  if (layout.bottomCover) {
    const bottomLogoWidth = layout.bottomLogoWidth;
    const bottomLogoHeight = Math.round(bottomLogoWidth * logoAspect);
    const bottomLogoLeft = Math.round((meta.width - bottomLogoWidth) / 2);
    const bottomLogo = await sharp(logoPath)
      .resize(bottomLogoWidth, bottomLogoHeight, { fit: "inside" })
      .png()
      .toBuffer();

    composites.unshift(await solidPatch(layout.bottomCover));
    composites.push({
      input: bottomLogo,
      left: bottomLogoLeft,
      top: layout.bottomLogoTop,
    });
  }

  if (!fs.existsSync(backupPath) && fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
  }

  const tempPath = path.join(root, "src", "assets", ".home-cover-hero-logo-patched.png");
  await sharp(heroSource).composite(composites).png({ compressionLevel: 9 }).toFile(tempPath);
  fs.copyFileSync(tempPath, outputPath);
  fs.unlinkSync(tempPath);

  console.log(`Patched hero (${meta.width}x${meta.height}) -> ${path.relative(root, outputPath)}`);
}

const heroArg = process.argv.find((arg) => arg.endsWith(".png"));
const heroSource = heroArg ? path.resolve(heroArg) : defaultHeroSource;

await patchHero(heroSource);
