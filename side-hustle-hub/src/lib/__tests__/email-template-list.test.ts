import { describe, expect, it } from "vitest";
import { EMAIL_TEMPLATE_CATALOG } from "../../../functions/_lib/email-template-content";
import { emailTemplateMatchesQuery, emailTemplateSaveEnabled, shouldHydrateEmailTemplateDraft, emailTemplateLogLabel } from "../email-template-list";

const merch = EMAIL_TEMPLATE_CATALOG.find((t) => t.slug === "membership_merch_ready");

describe("emailTemplateMatchesQuery", () => {
  it("finds the GYSHFamily hat/tee email by t-shirt, discount, or merch wording", () => {
    expect(merch).toBeTruthy();
    expect(merch!.name).toMatch(/GYSHFamily/i);
    expect(merch!.name).toMatch(/t-shirt discount/i);
    expect(merch!.name).toMatch(/hat or tee/i);
    expect(merch!.description).toMatch(/GYSHFamily/);
    for (const q of ["t-shirt", "tee", "discount", "GYSHFamily", "hat", "merch", "100%"]) {
      expect(emailTemplateMatchesQuery(merch!, q), q).toBe(true);
    }
    expect(emailTemplateMatchesQuery(merch!, "password reset")).toBe(false);
  });

  it("shows every template when the query is blank", () => {
    expect(emailTemplateMatchesQuery(merch!, "  ")).toBe(true);
  });
});

describe("emailTemplateSaveEnabled", () => {
  it("keeps Save clickable while a template is selected and idle", () => {
    expect(emailTemplateSaveEnabled(false, true)).toBe(true);
    expect(emailTemplateSaveEnabled(true, true)).toBe(false);
    expect(emailTemplateSaveEnabled(false, false)).toBe(false);
  });
});

describe("shouldHydrateEmailTemplateDraft", () => {
  it("does not replace the editor after Save reloads the same template", () => {
    expect(shouldHydrateEmailTemplateDraft("membership_merch_ready", "membership_merch_ready")).toBe(
      false,
    );
    expect(shouldHydrateEmailTemplateDraft("", "membership_merch_ready")).toBe(true);
    expect(shouldHydrateEmailTemplateDraft("welcome_free", "membership_merch_ready")).toBe(true);
  });
});

describe("emailTemplateLogLabel", () => {
  it("shows the GYSHFamily hat/tee name instead of the merch slug", () => {
    const catalog = [{ slug: "membership_merch_ready", name: "GYSHFamily t-shirt discount · hat or tee" }];
    expect(emailTemplateLogLabel("membership_merch_ready", catalog)).toBe(
      "GYSHFamily t-shirt discount · hat or tee",
    );
    expect(emailTemplateLogLabel("test_membership_merch_ready", catalog)).toBe(
      "[TEST] GYSHFamily t-shirt discount · hat or tee",
    );
  });
});
