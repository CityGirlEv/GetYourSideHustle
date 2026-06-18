/**
 * Extract photorealistic article hero crops from user-provided screenshot grids.
 * Saves to public/learning-center/{slug}.jpg (photo only — no badges or titles).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor/projects/c-Users-evely/assets",
);
const outputDir = path.join(root, "public", "learning-center");

const ENROLLMENT_GRID = path.join(
  assetsDir,
  "c__Users_evely_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_a2ac3dc0-2677-41b8-8e76-0a9f4931c9b5-7f196e26-b5ee-494e-a734-2d238a2b1adc.png",
);
const COMPARING_GRID = path.join(
  assetsDir,
  "c__Users_evely_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_fddd93d8-3122-4c5d-ba6f-297ccd03c28c-ae6b5e94-a6f9-41e8-bb2d-1483fc63a8d4.png",
);

const INLINE_MAX_WIDTH = 960;

/** Photo-only regions inside the 1024×682 enrollment card screenshot. */
const ENROLLMENT_CROPS = [
  { slug: "medicare-at-65-action-plan", left: 10, top: 38, width: 494, height: 112 },
  { slug: "medicare-enrollment-timeline", left: 520, top: 38, width: 494, height: 112 },
  { slug: "turning-65-and-still-working", left: 10, top: 292, width: 494, height: 112 },
  { slug: "medicare-initial-enrollment-period", left: 520, top: 292, width: 494, height: 112 },
  { slug: "is-medicare-automatic-at-65", left: 10, top: 546, width: 494, height: 72 },
  { slug: "medicare-special-enrollment-period", left: 520, top: 546, width: 494, height: 72 },
];

/** Photo-only regions inside the 1024×512 comparing-plans screenshot. */
const COMPARING_CROPS = [
  {
    slug: "how-to-compare-medicare-plans-educationally",
    left: 10,
    top: 38,
    width: 494,
    height: 210,
  },
  {
    slug: "what-is-medicare-prior-authorization",
    left: 520,
    top: 38,
    width: 494,
    height: 210,
  },
];

async function saveCrop(source, slug, region) {
  const outPath = path.join(outputDir, `${slug}.jpg`);
  await sharp(source)
    .extract(region)
    .resize(INLINE_MAX_WIDTH, null, { withoutEnlargement: true, fit: "inside" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath);
  const size = fs.statSync(outPath).size;
  console.log(`  ${slug}.jpg (${size.toLocaleString()} bytes)`);
}

async function main() {
  if (!fs.existsSync(ENROLLMENT_GRID)) {
    throw new Error(`Missing enrollment screenshot: ${ENROLLMENT_GRID}`);
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("Enrollment grid → 6 articles");
  for (const crop of ENROLLMENT_CROPS) {
    await saveCrop(ENROLLMENT_GRID, crop.slug, crop);
  }

  console.log("Comparing plans grid → 2 articles");
  for (const crop of COMPARING_CROPS) {
    await saveCrop(COMPARING_GRID, crop.slug, crop);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
