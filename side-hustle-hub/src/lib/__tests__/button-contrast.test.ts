import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");
const taskList = readFileSync(
  resolve(process.cwd(), "src/components/admin/TaskList.tsx"),
  "utf8",
);
const schedulePage = readFileSync(
  resolve(process.cwd(), "src/components/admin/SchedulePage.tsx"),
  "utf8",
);

/** Pull a top-level rule block that starts with the given selector line. */
function ruleBlock(selectorFragment: string): string {
  const idx = css.indexOf(selectorFragment);
  expect(idx, `missing selector near: ${selectorFragment}`).toBeGreaterThanOrEqual(0);
  const from = css.indexOf("{", idx);
  expect(from).toBeGreaterThan(idx);
  let depth = 0;
  for (let i = from; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(idx, i + 1);
    }
  }
  throw new Error(`unclosed rule for ${selectorFragment}`);
}

describe("button contrast CSS", () => {
  it("documents white labels on deep forest-green primary / active chips", () => {
    expect(css).toMatch(/--chip-active-text:\s*#ffffff/);
    expect(css).toMatch(/--grad-chip-active:\s*linear-gradient\([^;]*#3f7a52/);
    expect(css).toMatch(/--grad-join-green:\s*linear-gradient\([^;]*#3f7a52/);
    expect(css).not.toMatch(/--grad-chip-active:[^;]*#9bc87a/);

    const primary = ruleBlock(".btn-primary,\n.btn-join-green");
    expect(primary).toMatch(/color:\s*var\(--chip-active-text\)/);
    expect(primary).toMatch(/-webkit-text-fill-color:\s*var\(--chip-active-text\)/);
    expect(primary).toMatch(/background:\s*var\(--grad-join-green\)/);

    expect(css).toMatch(
      /\.nav-link-btn\.active[\s\S]{0,400}?color:\s*var\(--chip-active-text\)\s*!important/,
    );
  });

  it("forces white labels on crimson / dark partner-done buttons", () => {
    const partner = ruleBlock(".btn-partner-done,");
    expect(partner).toMatch(/color:\s*#fff\s*!important/);
    expect(partner).toMatch(/-webkit-text-fill-color:\s*#fff\s*!important/);

    expect(css).toMatch(/\.glow-badge\.pink[\s\S]{0,500}?color:\s*#fff\s*!important/);
    expect(css).toMatch(
      /\.free-guides-filter-btn\.is-active[\s\S]{0,200}?color:\s*#fff/,
    );
  });

  it("Save everything (qa-save-btn--ready) matches forest-green active chips", () => {
    const ready = ruleBlock(".qa-save-btn--ready {");
    expect(ready).toMatch(/background:\s*var\(--grad-chip-active\)\s*!important/);
    expect(ready).toMatch(/color:\s*#fff\s*!important/);
    expect(ready).not.toMatch(/#22c55e/);
  });

  it("Task List + Schedule use btn-partner-done (not btn-primary) when marked done", () => {
    expect(taskList).toContain('tinaDone ? "btn-partner-done"');
    expect(taskList).toContain('evelynDone ? "btn-partner-done"');
    expect(schedulePage).toContain('tinaDone ? "btn-partner-done"');
    expect(schedulePage).toContain('evelynDone ? "btn-partner-done"');
    expect(taskList).not.toMatch(/tinaDone \? "btn-primary"/);
    expect(schedulePage).not.toMatch(/tinaDone \? "btn-primary"/);
  });
});
