import { EMAIL_TEMPLATE_CATALOG } from "../../../functions/_lib/email-template-content";
import { describe, expect, it } from "vitest";
import {
  EMAIL_TEMPLATE_REVIEW_CASES,
  EMAIL_TEMPLATE_REVIEW_CATALOG,
  emailTemplateReviewCaseId,
  needsEmailTemplatePlacementHeal,
} from "../gysh-email-template-review-cases";

describe("email template review cases", () => {
  it("covers every catalog template once, assigned to Candace", () => {
    expect(EMAIL_TEMPLATE_REVIEW_CATALOG.length).toBe(22);
    expect(EMAIL_TEMPLATE_REVIEW_CASES).toHaveLength(22);
    const ids = new Set(EMAIL_TEMPLATE_REVIEW_CASES.map((c) => c.id));
    expect(ids.size).toBe(22);
    expect(ids.has("EMAIL-TPL-membership_subscribed")).toBe(true);
    expect(ids.has("EMAIL-TPL-membership_upgraded")).toBe(true);
    expect(ids.has("EMAIL-TPL-alacarte_purchased")).toBe(true);
    expect(ids.has("EMAIL-TPL-credit_pack_purchased")).toBe(true);
    expect(EMAIL_TEMPLATE_REVIEW_CATALOG.map((t) => t.slug)).toEqual(
      EMAIL_TEMPLATE_CATALOG.map((t) => t.slug),
    );
    for (const tpl of EMAIL_TEMPLATE_REVIEW_CATALOG) {
      const id = emailTemplateReviewCaseId(tpl.slug);
      const c = EMAIL_TEMPLATE_REVIEW_CASES.find((x) => x.id === id);
      expect(c).toBeTruthy();
      expect(c!.assignees).toEqual(["candace"]);
      expect(c!.title).toContain(tpl.name);
      expect(c!.path).toBe(`/admin?tab=email&template=${tpl.slug}`);
      expect(c!.steps[0]).toContain(`](/admin?tab=email&template=${tpl.slug})`);
      expect(c!.steps.join(" ")).toMatch(/Your hustle, your results/i);
    }
  });

  it("does not heal placement for graded Fail/Pass/Cond cases", () => {
    expect(
      needsEmailTemplatePlacementHeal({
        status: "fail",
        sprint: 3,
        due: "08/01/26",
        assignee: "evelyn",
        wantSprint: 4,
        wantDue: "08/25/26",
      }),
    ).toBe(false);
    expect(
      needsEmailTemplatePlacementHeal({
        status: "not_run",
        sprint: 3,
        due: "08/01/26",
        assignee: "evelyn",
        wantSprint: 4,
        wantDue: "08/25/26",
      }),
    ).toBe(true);
  });
});
