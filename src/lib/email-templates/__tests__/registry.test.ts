import { describe, it, expect } from "vitest";
import { TEMPLATES } from "../registry";

describe("email template registry", () => {
  it("registers the new-registration-admin template", () => {
    const t = TEMPLATES["new-registration-admin"];
    expect(t).toBeDefined();
    expect(typeof t.component).toBe("function");
    expect(t.previewData).toBeTruthy();
  });

  it("resolves a dynamic subject including the registrant name", () => {
    const t = TEMPLATES["new-registration-admin"];
    const subjectFn = t.subject as (data: Record<string, unknown>) => string;
    expect(typeof subjectFn).toBe("function");
    expect(subjectFn({ firstName: "Jane", lastName: "Doe" })).toMatch(/Jane Doe/);
    expect(subjectFn({})).toMatch(/new beta registration/i);
  });
});
