import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dir = path.join(root, "public", "learning-center");
const articlesDir = path.join(root, "articles");

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".png"))) {
  const slug = file.replace(/\.png$/, "");
  const src = path.join(dir, file);
  const dest = path.join(dir, `${slug}.jpg`);
  const buf = await sharp(src)
    .rotate()
    .resize(960, null, { withoutEnlargement: true, fit: "inside" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
  await fs.promises.writeFile(dest, buf);
  fs.unlinkSync(src);
  console.log(`converted ${file} -> ${slug}.jpg (${Math.round(buf.length / 1024)} KB)`);
}

for (const mdFile of fs.readdirSync(articlesDir).filter((f) => f.endsWith(".md"))) {
  const mdPath = path.join(articlesDir, mdFile);
  const raw = fs.readFileSync(mdPath, "utf8");
  const next = raw.replace(
    /^featuredImage: \/learning-center\/(.+)\.png/m,
    "featuredImage: /learning-center/$1.jpg",
  );
  if (next !== raw) {
    fs.writeFileSync(mdPath, next);
    console.log(`updated frontmatter ${mdFile}`);
  }
}
