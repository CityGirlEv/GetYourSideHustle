// Auto-discovered automated tests (Vitest unit tests + Playwright e2e tests).
//
// We load the source of every *.test.ts(x) and *.spec.ts(x) file at build
// time via Vite's `import.meta.glob` and parse out the describe/it/test names
// so the Testing Portal can show them alongside the manual TEST_CASES list.
//
// These are read-only entries — users can still re-assign / annotate them
// from the UI, just like manual or custom tests.
import type { TestCase } from "./test-plan";

// Vitest unit tests live in src/**/__tests__/*.test.ts(x)
const unitFiles = import.meta.glob("/src/**/*.test.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// Playwright e2e tests live in /e2e/*.spec.ts
const e2eFiles = import.meta.glob("/e2e/**/*.spec.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

type Parsed = { describes: string[]; tests: string[] };

// Extract top-level describe() titles and every it()/test() title from a
// source file. Quote-tolerant; ignores `.skip` / `.todo` variants but keeps
// them in the list so users can see they exist.
function parseTestFile(src: string): Parsed {
  const describes: string[] = [];
  const tests: string[] = [];
  const reDescribe = /\bdescribe(?:\.\w+)?\s*\(\s*(['"`])([^'"`]+?)\1/g;
  const reTest = /\b(?:it|test)(?:\.\w+)?\s*\(\s*(['"`])([^'"`]+?)\1/g;
  let m: RegExpExecArray | null;
  while ((m = reDescribe.exec(src))) describes.push(m[2]);
  while ((m = reTest.exec(src))) tests.push(m[2]);
  return { describes, tests };
}

function shortFile(path: string): string {
  // /src/lib/__tests__/budget.test.ts -> budget.test.ts
  // /e2e/smoke.spec.ts -> smoke.spec.ts
  return path.split("/").pop() || path;
}

function idSlug(s: string): string {
  return s.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).toUpperCase();
}

function buildCases(
  files: Record<string, string>,
  area: string,
  idPrefix: string,
): TestCase[] {
  const out: TestCase[] = [];
  for (const [path, src] of Object.entries(files)) {
    const file = shortFile(path);
    const { describes, tests } = parseTestFile(src);
    const suite = describes[0] || file.replace(/\.(test|spec)\.tsx?$/, "");
    tests.forEach((title, i) => {
      const id = `${idPrefix}-${idSlug(file)}-${String(i + 1).padStart(2, "0")}`;
      out.push({
        id,
        area,
        title: `${suite}: ${title}`,
        priority: "P2",
        preconditions: `Automated — runs via ${idPrefix === "UNIT" ? "vitest" : "playwright"} in ${file}`,
        steps: [
          idPrefix === "UNIT"
            ? `Run: bunx vitest run ${path.replace(/^\//, "")}`
            : `Run: bunx playwright test ${path.replace(/^\//, "")}`,
        ],
        expected: "Test passes in CI",
        assignee: "Unassigned",
      });
    });
  }
  // Stable order by id so the list doesn't shuffle between renders.
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

export const UNIT_TEST_CASES: TestCase[] = buildCases(unitFiles, "Unit (Vitest)", "UNIT");
export const E2E_TEST_CASES: TestCase[] = buildCases(e2eFiles, "E2E (Playwright)", "E2E");
export const AUTOMATED_TEST_CASES: TestCase[] = [...UNIT_TEST_CASES, ...E2E_TEST_CASES];