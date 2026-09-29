/**
 * One-shot: expand standalone "hustle" in user-facing source copy.
 * Skips the copy helper itself so regex patterns stay intact.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOLD_PHRASES = [
  "Get Your Side Hustle",
  "Grow Your Hustle",
  "Craft Hustle",
  "Find My Hustle",
  "side-hustle",
  "Side-Hustle",
  "Side-Hustler",
  "side-hustler",
  "side hustle",
  "Side Hustle",
  "SIDE HUSTLE",
];

const PHRASE_REPLACEMENTS = [
  [/\bWhat this hustle is\b/g, "What this side-hustle is"],
  [/\bthis hustle\b/g, "this side-hustle"],
  [/\bThis hustle\b/g, "This side-hustle"],
  [/\bthat hustle\b/g, "that side-hustle"],
  [/\bThat hustle\b/g, "That side-hustle"],
  [/\byour hustle\b/g, "your side hustle"],
  [/\bYour hustle\b/g, "Your side hustle"],
  [/\bmy hustle\b/g, "my side hustle"],
  [/\bMy hustle\b/g, "My side hustle"],
  [/\bour hustle\b/g, "our side hustle"],
  [/\bOur hustle\b/g, "Our side hustle"],
  [/\btheir hustle\b/g, "their side hustle"],
  [/\bthe hustle\b/g, "the side hustle"],
  [/\bThe hustle\b/g, "The side hustle"],
  [/\ba hustle\b/g, "a side hustle"],
  [/\bA hustle\b/g, "A side hustle"],
  [/\beach hustle\b/g, "each side hustle"],
  [/\bevery hustle\b/g, "every side hustle"],
  [/\bany hustle\b/g, "any side hustle"],
  [/\bone hustle\b/g, "one side hustle"],
  [/\bhustle earnings\b/g, "side hustle earnings"],
  [/\bhustle dollar\b/g, "side hustle dollar"],
  [/\bhustle plan\b/g, "side hustle plan"],
  [/\bhustle card\b/g, "side hustle card"],
  [/\bhustle calculator\b/g, "side hustle calculator"],
  [/\bhustle schedules\b/g, "side hustle schedules"],
  [/\bhustle-launch\b/g, "side-hustle-launch"],
  [/\bHustle matches\b/g, "Side Hustle matches"],
  [/\bbest hustle\b/g, "best side hustle"],
  [/\bsome hustle\b/g, "some side hustle"],
];

function expandStandaloneHustleCopy(input) {
  if (!input) return input;
  const held = [];
  let text = input;
  for (const phrase of HOLD_PHRASES) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    text = text.replace(re, (match) => {
      held.push(match);
      return `\u0000${held.length - 1}\u0000`;
    });
  }
  for (const [from, to] of PHRASE_REPLACEMENTS) {
    text = text.replace(from, to);
  }
  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => held[Number(index)] ?? "");
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".wrangler"]);
const SKIP_FILES = new Set([
  path.normalize("src/lib/side-hustle-copy.ts"),
  path.normalize("src/lib/__tests__/side-hustle-copy.test.ts"),
  path.normalize("scripts/expand-side-hustle-copy.mjs"),
]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".html"]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (EXTS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(root)) {
  const rel = path.relative(root, file);
  if (SKIP_FILES.has(path.normalize(rel))) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = expandStandaloneHustleCopy(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
    console.log(rel);
  }
}
console.log(`updated ${changed} files`);
