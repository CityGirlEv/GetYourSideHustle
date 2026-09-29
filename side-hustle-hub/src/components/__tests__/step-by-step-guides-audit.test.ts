import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../StepByStepGuides.tsx"),
  "utf8",
);

describe("StepByStepGuides audit placement", () => {
  it("puts the Audit area after Tips & pitfalls and gates it to Admin/QA", () => {
    const tips = src.indexOf('data-testid="launch-guide-tips-toggle"');
    const audit = src.indexOf("launch-guide-audit-area-");
    const changeLog = src.indexOf("<GuideChangeLogPanel");
    expect(tips).toBeGreaterThan(-1);
    expect(audit).toBeGreaterThan(tips);
    expect(changeLog).toBeGreaterThan(tips);

    const auditBlock = src.slice(Math.max(0, audit - 200), audit + 120);
    expect(auditBlock).toMatch(/staffCatalog\s*\?/);
  });
});
