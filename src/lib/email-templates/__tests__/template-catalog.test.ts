import { describe, it, expect } from "vitest";
import {
  buildEmailTemplateCatalog,
  catalogToCsv,
  catalogToMarkdown,
} from "@/lib/email-templates/template-catalog";

describe("email template catalog", () => {
  it("includes every registered template with triggers and merge fields", () => {
    const doc = buildEmailTemplateCatalog();
    expect(doc.templates.length).toBeGreaterThanOrEqual(17);
    const agent = doc.templates.find((t) => t.name === "agent-assignment");
    expect(agent?.trigger).toMatch(/assign/i);
    expect(agent?.invokedFrom.join(" ")).toMatch(/assignAgent/);
    expect(agent?.mergeFields.length).toBeGreaterThan(0);
    expect(doc.systemDependencies.some((d) => d.includes("Resend"))).toBe(true);
  });

  it("exports CSV and markdown", () => {
    const doc = buildEmailTemplateCatalog();
    expect(catalogToCsv(doc)).toContain("name,displayName,kind");
    expect(catalogToMarkdown(doc)).toContain("## Templates");
    expect(catalogToMarkdown(doc)).toContain("agent-assignment");
  });

  it("notes custom overrides when provided", () => {
    const doc = buildEmailTemplateCatalog({ overriddenNames: new Set(["welcome"]) });
    const welcome = doc.templates.find((t) => t.name === "welcome");
    expect(welcome?.notes).toMatch(/override/i);
  });
});
