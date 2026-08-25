import { describe, expect, it } from "vitest";
import {
  EMAIL_TEMPLATE_REVIEW_CASES,
  EMAIL_TEMPLATE_REVIEW_CATALOG,
  emailTemplateReviewCaseId,
} from "../gysh-email-template-review-cases";

describe("email template review cases", () => {
  it("covers every catalog template once, assigned to Candace", () => {
    expect(EMAIL_TEMPLATE_REVIEW_CATALOG.length).toBe(18);
    expect(EMAIL_TEMPLATE_REVIEW_CASES).toHaveLength(18);
    const ids = new Set(EMAIL_TEMPLATE_REVIEW_CASES.map((c) => c.id));
    expect(ids.size).toBe(18);
    for (const tpl of EMAIL_TEMPLATE_REVIEW_CATALOG) {
      const id = emailTemplateReviewCaseId(tpl.slug);
      const c = EMAIL_TEMPLATE_REVIEW_CASES.find((x) => x.id === id);
      expect(c).toBeTruthy();
      expect(c!.assignees).toEqual(["candace"]);
      expect(c!.title).toContain(tpl.name);
      expect(c!.path).toBe(`/admin?tab=email&template=${tpl.slug}`);
      expect(c!.steps[0]).toContain(`](/admin?tab=email&template=${tpl.slug})`);
    }
  });
});
