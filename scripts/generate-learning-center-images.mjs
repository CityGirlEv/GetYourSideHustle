/**
 * Learning Center hero images — cohesive flat-vector series (default) or DALL-E 3 when OPENAI_API_KEY is set.
 *
 * Usage:
 *   node scripts/generate-learning-center-images.mjs           # missing images only
 *   node scripts/generate-learning-center-images.mjs --force   # regenerate all
 *   node scripts/generate-learning-center-images.mjs my-slug   # one article
 *   OPENAI_API_KEY=sk-... node scripts/generate-learning-center-images.mjs --ai --force
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import {
  buildFeaturedImagePrompt,
  PALETTE,
  SCENE_MOTIFS,
} from "./learning-center-image-prompts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const articlesDir = path.join(root, "articles");
const outputDir = path.join(root, "public", "learning-center");

const args = process.argv.slice(2);
const force = args.includes("--force");
const useAi = args.includes("--ai");
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

/** Shared scene: couple at table + topic accent — matches prior-auth DALL-E composition */
function buildVectorScene(motif) {
  const p = PALETTE;
  const couple = `
    <ellipse cx="430" cy="430" rx="280" ry="24" fill="${p.navy}" opacity="0.08"/>
    <rect x="250" y="330" width="360" height="18" rx="9" fill="${p.navy}" opacity="0.12"/>
    <rect x="280" y="250" width="300" height="90" rx="12" fill="${p.white}" opacity="0.95"/>
    <rect x="300" y="270" width="180" height="8" rx="4" fill="${p.blueLight}"/>
    <rect x="300" y="288" width="140" height="8" rx="4" fill="${p.blueLight}" opacity="0.7"/>
    <rect x="300" y="306" width="160" height="8" rx="4" fill="${p.blueLight}" opacity="0.5"/>
    <circle cx="350" cy="220" r="34" fill="${p.warm1}"/>
    <path d="M316 220 C316 188 384 188 384 220 L384 250 L316 250 Z" fill="${p.warm2}"/>
    <circle cx="430" cy="215" r="36" fill="${p.warm1}"/>
    <path d="M394 215 C394 178 466 178 466 215 L466 252 L394 252 Z" fill="${p.warm3}"/>
    <rect x="500" y="300" width="70" height="10" rx="5" fill="${p.blue}"/>
    <circle cx="535" cy="285" r="8" fill="${p.blueDeep}"/>
  `;

  const accents = {
    "split-path": `
      <rect x="860" y="180" width="150" height="150" rx="20" fill="${p.white}" opacity="0.92"/>
      <rect x="1040" y="180" width="150" height="150" rx="20" fill="${p.white}" opacity="0.92"/>
      <circle cx="935" cy="255" r="28" fill="${p.blue}"/>
      <circle cx="1115" cy="255" r="28" fill="${p.green}"/>
      <path d="M980 255 H1070" stroke="${p.navy}" stroke-width="4" stroke-linecap="round" opacity="0.35"/>`,
    "premium-chart": `
      <rect x="880" y="320" width="280" height="140" rx="16" fill="${p.white}" opacity="0.92"/>
      <rect x="920" y="360" width="36" height="70" rx="8" fill="${p.blueLight}"/>
      <rect x="980" y="330" width="36" height="100" rx="8" fill="${p.blue}"/>
      <rect x="1040" y="350" width="36" height="80" rx="8" fill="${p.amber}"/>
      <rect x="1100" y="340" width="36" height="90" rx="8" fill="${p.blueDeep}"/>`,
    calendar: `
      <rect x="900" y="170" width="240" height="210" rx="18" fill="${p.white}" opacity="0.95"/>
      <rect x="900" y="170" width="240" height="48" rx="18" fill="${p.blue}"/>
      ${Array.from({ length: 9 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const highlight = i === 4;
        return `<rect x="${930 + col * 68}" y="${240 + row * 42}" width="48" height="30" rx="8" fill="${highlight ? p.blue : p.blueLight}" opacity="${highlight ? 0.95 : 0.45}"/>`;
      }).join("")}`,
    "compare-grid": `
      <rect x="880" y="180" width="130" height="170" rx="16" fill="${p.white}" opacity="0.92"/>
      <rect x="1030" y="180" width="130" height="170" rx="16" fill="${p.white}" opacity="0.92"/>
      <rect x="905" y="205" width="80" height="10" rx="5" fill="${p.blue}"/>
      <rect x="1055" y="205" width="80" height="10" rx="5" fill="${p.green}"/>
      ${[0, 1, 2, 3].map((r) => `<rect x="905" y="${230 + r * 22}" width="60" height="8" rx="4" fill="${p.blueLight}"/>`).join("")}
      ${[0, 1, 2, 3].map((r) => `<rect x="1055" y="${230 + r * 22}" width="60" height="8" rx="4" fill="${p.blueLight}"/>`).join("")}`,
    "approval-shield": `
      <circle cx="1010" cy="250" r="95" fill="${p.white}" opacity="0.25"/>
      <path d="M1010 160 C930 160 870 185 840 210 V290 C840 350 920 390 1010 420 C1100 390 1180 350 1180 290 V210 C1150 185 1090 160 1010 160 Z" fill="${p.blue}" opacity="0.92"/>
      <path d="M970 285 L995 315 L1065 245" stroke="${p.white}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    "milestone-65": `
      <circle cx="1010" cy="260" r="88" fill="${p.blue}" opacity="0.9"/>
      <text x="1010" y="285" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="${p.white}">65</text>`,
    checklist: `
      <rect x="900" y="190" width="260" height="52" rx="12" fill="${p.white}" opacity="0.92"/>
      <rect x="900" y="258" width="260" height="52" rx="12" fill="${p.white}" opacity="0.92"/>
      <rect x="900" y="326" width="260" height="52" rx="12" fill="${p.white}" opacity="0.92"/>
      <circle cx="930" cy="216" r="12" fill="${p.green}"/>
      <circle cx="930" cy="284" r="12" fill="${p.blue}"/>
      <circle cx="930" cy="352" r="12" fill="${p.blueLight}"/>`,
    timeline: `
      <path d="M880 290 H1140" stroke="${p.blue}" stroke-width="8" stroke-linecap="round"/>
      ${[910, 980, 1050, 1110].map((x, i) => `<circle cx="${x}" cy="290" r="${i === 2 ? 16 : 12}" fill="${i === 2 ? p.amber : p.blue}"/>`).join("")}`,
    "work-calendar": `
      <rect x="900" y="200" width="110" height="90" rx="14" fill="${p.blueDeep}" opacity="0.85"/>
      <rect x="1040" y="180" width="130" height="170" rx="16" fill="${p.white}" opacity="0.92"/>
      <rect x="1065" y="205" width="80" height="12" rx="6" fill="${p.blue}"/>`,
    "seven-month-window": `
      <rect x="910" y="180" width="220" height="190" rx="22" fill="${p.white}" opacity="0.94"/>
      <path d="M910 180 H1130 V240 H910 Z" fill="${p.blue}"/>
      <circle cx="1020" cy="290" r="42" fill="${p.amber}" opacity="0.9"/>
      <text x="1020" y="302" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="${p.white}">7</text>`,
    "question-shield": `
      <circle cx="1010" cy="250" r="80" fill="${p.blue}" opacity="0.9"/>
      <text x="1010" y="278" text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="700" fill="${p.white}">?</text>`,
    "special-door": `
      <rect x="930" y="170" width="160" height="220" rx="16" fill="${p.white}" opacity="0.94"/>
      <rect x="930" y="170" width="160" height="48" rx="16" fill="${p.green}"/>
      <circle cx="1065" cy="290" r="10" fill="${p.blueDeep}"/>`,
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="540" viewBox="0 0 1260 540" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.sky}"/>
      <stop offset="45%" stop-color="${p.blueLight}"/>
      <stop offset="100%" stop-color="${p.blue}"/>
    </linearGradient>
  </defs>
  <rect width="1260" height="540" fill="url(#bg)"/>
  <circle cx="1080" cy="90" r="160" fill="${p.white}" opacity="0.18"/>
  <circle cx="140" cy="460" r="120" fill="${p.white}" opacity="0.14"/>
  <circle cx="760" cy="120" r="70" fill="${p.white}" opacity="0.22"/>
  ${couple}
  ${accents[motif] ?? accents.checklist}
  <ellipse cx="180" cy="470" rx="40" ry="52" fill="${p.green}" opacity="0.55"/>
  <rect x="155" y="468" width="50" height="28" rx="8" fill="${p.navy}" opacity="0.12"/>
</svg>`;
}

async function generateVectorPng(slug, category) {
  const motif = SCENE_MOTIFS[slug] ?? "checklist";
  const svg = buildVectorScene(motif);
  return sharp(Buffer.from(svg)).png({ quality: 92, compressionLevel: 9 }).toBuffer();
}

async function generateAiPng({ title, excerpt, category }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for --ai mode");

  const prompt = buildFeaturedImagePrompt({ title, excerpt, category });
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      size: "1792x1024",
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
  return Buffer.from(b64, "base64");
}

async function main() {
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
    const imagePath = `/learning-center/${slug}.png`;
    const outputPath = path.join(outputDir, `${slug}.png`);
    const existingImage = frontmatter.featuredImage ?? "";

    const skipExistingGood =
      !force &&
      fs.existsSync(outputPath) &&
      fs.statSync(outputPath).size > 50_000 &&
      slug === "what-is-medicare-prior-authorization";

    if (skipExistingGood) {
      console.log(`skip ${slug} (keeping existing DALL-E image)`);
    } else if (!force && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 80_000 && !useAi) {
      console.log(`skip ${slug} (png already exists, use --force to regenerate)`);
    } else {
      let buffer;
      if (useAi && process.env.OPENAI_API_KEY) {
        console.log(`AI generating ${slug}...`);
        buffer = await generateAiPng({ title, excerpt, category });
      } else {
        buffer = await generateVectorPng(slug, category);
      }
      await sharp(buffer).png({ quality: 92 }).toFile(outputPath);
      generated += 1;
      console.log(`generated ${outputPath}`);

      // Remove legacy webp if present
      const legacyWebp = path.join(outputDir, `${slug}.webp`);
      if (fs.existsSync(legacyWebp)) fs.unlinkSync(legacyWebp);
    }

    if (existingImage !== imagePath || force) {
      fs.writeFileSync(mdPath, setFeaturedImage(raw, imagePath));
      updated += 1;
      console.log(`updated ${file} -> ${imagePath}`);
    }
  }

  console.log(`Done. Generated ${generated} image(s), updated ${updated} article(s).`);
  if (!process.env.OPENAI_API_KEY) {
    console.log("Tip: set OPENAI_API_KEY and run with --ai --force for DALL-E images matching the prior-auth style.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
