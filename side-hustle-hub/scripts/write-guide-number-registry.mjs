import { readFileSync, writeFileSync } from "node:fs";

const m = JSON.parse(readFileSync("scripts/_guide-number-snapshot.json", "utf8"));
const body = Object.entries(m)
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  .join("\n");
const out = `/**
 * Pinned Side Hustle Library guide numbers (#001…).
 * Never renumber existing ids when membership tier changes.
 * New guides get the next free number via guide-numbers.ts.
 */
export const PINNED_GUIDE_NUMBERS: Readonly<Record<string, string>> = {
${body}
};
`;
writeFileSync("src/lib/guide-number-registry.ts", out, "utf8");
console.log("wrote registry", Object.keys(m).length);
