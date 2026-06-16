import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

// CMS marketing rules (42 CFR §422.2262 / §423.2262) prohibit unqualified
// superlatives and absolute claims about Medicare plans. This test scans every
// page/component for forbidden verbiage so we never ship copy that could be
// flagged in a CMS marketing review.

const ROOTS = ["src/routes", "src/components", "src/pages"];
const EXT = new Set([".tsx", ".ts", ".mdx", ".md"]);

// Files allowed to contain the phrases (test plan, this file, etc.).
const ALLOWLIST = new Set<string>([
  "src/lib/test-plan.ts",
  "src/lib/__tests__/cms-verbiage.test.ts",
]);

const FORBIDDEN: Array<{ label: string; pattern: RegExp }> = [
  { label: "'best Medicare plan'", pattern: /best\s+medicare\s+plan/i },
  { label: "'#1 plan' / '#1 Medicare'", pattern: /#\s*1\s+(?:plan|medicare)/i },
  {
    label: "'all Medicare plans' / 'every plan'",
    pattern: /\b(?:all|every)\s+medicare\s+plans?\b/i,
  },
  {
    label: "'guaranteed savings/coverage/approval'",
    pattern: /\bguaranteed\s+(?:savings|coverage|approval|enrollment|acceptance)\b/i,
  },
  {
    label: "'free Medicare' / 'free plan'",
    pattern: /\bfree\s+(?:medicare|plan|coverage|insurance)\b/i,
  },
  { label: "'lowest price guaranteed'", pattern: /\blowest\s+price\s+guaranteed\b/i },
  { label: "'cheapest Medicare plan'", pattern: /\bcheapest\s+medicare\s+plan/i },
];

function walk(dir: string): string[] {
  let out: string[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue;
      out = out.concat(walk(p));
    } else if (EXT.has(extname(name))) {
      out.push(p);
    }
  }
  return out;
}

const files = ROOTS.flatMap(walk).filter((f) => !ALLOWLIST.has(f));

describe("CMS-compliant verbiage", () => {
  it("scans a non-trivial number of source files", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const { label, pattern } of FORBIDDEN) {
    it(`contains no instances of ${label}`, () => {
      const hits: string[] = [];
      for (const f of files) {
        const text = readFileSync(f, "utf8");
        const lines = text.split("\n");
        lines.forEach((line, i) => {
          if (pattern.test(line)) hits.push(`${f}:${i + 1}: ${line.trim()}`);
        });
      }
      expect(hits, `Forbidden CMS phrase ${label} found:\n${hits.join("\n")}`).toEqual([]);
    });
  }
});
