/**
 * Learning Center inline article photos — photorealistic DALL-E 3 only.
 *
 * Usage:
 *   node scripts/generate-learning-center-images.mjs           # missing images only
 *   node scripts/generate-learning-center-images.mjs --force   # regenerate all
 *   node scripts/generate-learning-center-images.mjs my-slug   # one article
 *
 * Requires OPENAI_API_KEY in .env (or environment).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { buildFeaturedImagePrompt } from "./learning-center-image-prompts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const articlesDir = path.join(root, "articles");
const outputDir = path.join(root, "public", "learning-center");

const INLINE_MAX_WIDTH = 960;
const INLINE_JPEG_QUALITY = 86;

/** DALL-E JPGs are typically 60KB+; skip only when a real photo already exists. */
const MIN_PHOTO_BYTES = 40_000;

const args = process.argv.slice(2);
const force = args.includes("--force");
const slugFilter = args.find((a) => !a.startsWith("--")) ?? null;

loadEnvFile(path.join(root, ".env"));

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }
  return fields;
}

function setFeaturedImage(raw, imagePath) {
  if (/^featuredImage:\s*[^\n]+/m.test(raw)) {
    return raw.replace(/^featuredImage:\s*[^\n]*/m, `featuredImage: ${imagePath}`);
  }
  return raw.replace(/^(---\r?\n[\s\S]*?\n)(---)/m, `$1featuredImage: ${imagePath}\n$2`);
}

async function optimizeInlinePhoto(buffer) {
  return sharp(buffer)
    .rotate()
    .resize(INLINE_MAX_WIDTH, null, { withoutEnlargement: true, fit: "inside" })
    .jpeg({ quality: INLINE_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

async function generateAiPhoto({ title, excerpt, category, slug }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required. Add it to .env and rerun.");
  }

  const prompt = buildFeaturedImagePrompt({ title, excerpt, category, slug });
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
      n: 1,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI image failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const json = await response.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data");
  return optimizeInlinePhoto(Buffer.from(b64, "base64"));
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Photorealistic images require DALL-E 3.");
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".md"));
  let generated = 0;
  let updated = 0;

  for (const file of files) {
    const mdPath = path.join(articlesDir, file);
    const raw = fs.readFileSync(mdPath, "utf8");
    const frontmatter = parseFrontmatter(raw);
    if (!frontmatter?.slug) continue;

    const slug = frontmatter.slug;
    if (slugFilter && slug !== slugFilter) continue;

    const title = frontmatter.title ?? slug;
    const excerpt = frontmatter.excerpt ?? "";
    const category = frontmatter.category ?? "enrollment";
    const imagePath = `/learning-center/${slug}.jpg`;
    const outputPath = path.join(outputDir, `${slug}.jpg`);
    const existingImage = frontmatter.featuredImage ?? "";

    const existingSize = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
    const skipExisting = !force && existingSize >= MIN_PHOTO_BYTES;

    if (skipExisting) {
      console.log(`skip ${slug} (photorealistic jpg exists, use --force to regenerate)`);
    } else {
      console.log(`Generating photorealistic photo for ${slug}...`);
      const buffer = await generateAiPhoto({ title, excerpt, category, slug });
      await fs.promises.writeFile(outputPath, buffer);
      generated += 1;
      console.log(`generated ${outputPath} (${Math.round(buffer.length / 1024)} KB)`);

      for (const legacy of ["png", "webp"]) {
        const legacyPath = path.join(outputDir, `${slug}.${legacy}`);
        if (fs.existsSync(legacyPath)) {
          fs.unlinkSync(legacyPath);
          console.log(`removed legacy ${legacyPath}`);
        }
      }
    }

    if (existingImage !== imagePath || existingSize < MIN_PHOTO_BYTES || force) {
      fs.writeFileSync(mdPath, setFeaturedImage(raw, imagePath));
      updated += 1;
      console.log(`updated ${file} -> ${imagePath}`);
    }
  }

  console.log(`Done. Generated ${generated} photorealistic image(s), updated ${updated} article(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
