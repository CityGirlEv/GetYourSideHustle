import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const inputPath = path.join(root, "src", "assets", "home-cover-hero.png");
const backupPath = path.join(root, "src", "assets", "home-cover-hero-raw.png");

/** Tilted card outline in the hero illustration (clockwise). */
const CARD_POLYGON = [
  [568, 246],
  [704, 222],
  [742, 302],
  [604, 332],
];

/** Generic insurance-card palette (not Medicare red/white/blue). */
const REPLACEMENT = {
  red: [0, 56, 136],
  blue: [4, 120, 87],
  white: [230, 210, 185],
};

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function classifyCardPixel(r, g, b, y) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (r > 75 && g < 85 && b < 85 && r - g > 25 && r - b > 25) {
    return "red";
  }
  if (b > 55 && r < 75 && g < 100 && b - r > 15 && b >= g - 8) {
    return "blue";
  }
  if (
    y > 276 &&
    r > 82 &&
    g < 115 &&
    b < 115 &&
    r > g + 8 &&
    r > b + 8
  ) {
    return "blue";
  }
  if (r > 145 && g > 138 && b > 132 && max - min < 55) {
    return "white";
  }
  return null;
}

async function main() {
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
  }

  const { data, info } = await sharp(backupPath).raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const channels = info.channels;
  const minX = Math.min(...CARD_POLYGON.map(([x]) => x));
  const maxX = Math.max(...CARD_POLYGON.map(([x]) => x));
  const minY = Math.min(...CARD_POLYGON.map(([, y]) => y));
  const maxY = Math.max(...CARD_POLYGON.map(([, y]) => y));

  let changed = 0;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!pointInPolygon(x, y, CARD_POLYGON)) continue;

      const index = (y * width + x) * channels;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const kind = classifyCardPixel(r, g, b, y);
      if (!kind) continue;

      const next = REPLACEMENT[kind];
      data[index] = next[0];
      data[index + 1] = next[1];
      data[index + 2] = next[2];
      changed += 1;
    }
  }

  const outputBuffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels },
  })
    .jpeg({ quality: 93, mozjpeg: true })
    .toBuffer();

  fs.rmSync(inputPath, { force: true });
  fs.writeFileSync(inputPath, outputBuffer);

  console.log(`Recolored ${changed} card pixels in ${path.relative(root, inputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
