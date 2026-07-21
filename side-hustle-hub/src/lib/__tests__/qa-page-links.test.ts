import { describe, expect, it } from "vitest";
import {
  ensureFirstStepHasPageLink,
  ensureTaskNotesPageLink,
  openPageStepMarkdown,
  pageRefForTask,
  parseMarkdownLinks,
  resolveQaPage,
} from "../qa-page-links";
import { TEST_CASES } from "../gysh-test-plan";
import { AUTOMATED_PLAYWRIGHT_CASES, AUTOMATED_VITEST_CASES } from "../gysh-automated-tests";
import { ensureGuideReviewTasks, ensureSeniorPageReviewTask, ensureTaskPageLinks } from "../gysh-tasks";

describe("qa-page-links", () => {
  it("resolves view keys to site paths", () => {
    expect(resolveQaPage("login")).toEqual({ href: "/login", label: "Login", view: "login" });
    expect(resolveQaPage("dashboard")).toEqual({ href: "/", label: "Home", view: "dashboard" });
    expect(resolveQaPage("admin")).toEqual({
      href: "/admin",
      label: "Admin Studio",
      view: "admin",
    });
  });

  it("injects markdown link into step 1 without changing step count", () => {
    const steps = ["Open Login from the top header", "Enter password"];
    const next = ensureFirstStepHasPageLink(steps, "login");
    expect(next).toHaveLength(2);
    expect(next[0]).toContain("[Login](/login)");
    expect(next[1]).toBe("Enter password");
  });

  it("is idempotent", () => {
    const once = ensureFirstStepHasPageLink(["Open Login"], "login");
    const twice = ensureFirstStepHasPageLink(once, "login");
    expect(twice).toEqual(once);
  });

  it("parses markdown links", () => {
    expect(parseMarkdownLinks("Open [Guides](/guides) now")).toEqual([
      { type: "text", value: "Open " },
      { type: "link", label: "Guides", href: "/guides" },
      { type: "text", value: " now" },
    ]);
  });

  it("infers page refs for guide/senior review tasks", () => {
    expect(pageRefForTask({ id: "T-LG-airbnb", notes: "guide-review:airbnb" })?.href).toBe(
      "/guides",
    );
    expect(pageRefForTask({ id: "T-SENIOR-PAGE", notes: "page-review:senior-side-hustles" })?.href).toBe(
      "/seniors",
    );
  });

  it("prepends Open link to task notes", () => {
    const notes = ensureTaskNotesPageLink("guide-review:x", {
      id: "T-LG-x",
      notes: "guide-review:x",
      description: "Review Launch Guide: X",
    });
    expect(notes.startsWith("Open [Guides](/guides)")).toBe(true);
    expect(notes).toContain("guide-review:x");
  });

  it("puts a page link in step 1 for every catalog case that has a path", () => {
    const withPath = [...TEST_CASES, ...AUTOMATED_PLAYWRIGHT_CASES].filter((t) => t.path);
    expect(withPath.length).toBeGreaterThan(40);
    for (const t of withPath) {
      const open = openPageStepMarkdown(t.path!);
      expect(open).toBeTruthy();
      expect(t.steps[0]).toMatch(/\[[^\]]+\]\([^)]+\)/);
    }
  });

  it("covers seed review tasks and skips only non-page cases", () => {
    const all = [...TEST_CASES, ...AUTOMATED_PLAYWRIGHT_CASES, ...AUTOMATED_VITEST_CASES];
    const linked = all.filter((t) => t.path && /\[[^\]]+\]\([^)]+\)/.test(t.steps[0] ?? ""));
    const skipped = all.filter((t) => !t.path).map((t) => t.id);
    const seed = ensureTaskPageLinks(ensureSeniorPageReviewTask(ensureGuideReviewTasks([]).tasks).tasks);
    expect(linked.length).toBeGreaterThan(40);
    expect(skipped).toEqual([
      "EMAIL-001",
      "EMAIL-005",
      "VT-AUTH-001",
      "VT-JOIN-001",
      "VT-MEMBER-001",
      "VT-ROLE-001",
      "VT-PLAN-001",
      "VT-WIZARD-001",
      "VT-WORK-001",
      "VT-FIND-001",
    ]);
    expect(seed.tasks.every((t) => /^Open\s+\[/.test(t.notes))).toBe(true);
  });
});
