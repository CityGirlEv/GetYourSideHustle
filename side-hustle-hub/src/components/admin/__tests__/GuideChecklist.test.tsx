import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GuideStaticList } from "../GuideChecklist";

describe("GuideStaticList", () => {
  it("renders membership bullets without checkboxes", () => {
    const html = renderToStaticMarkup(
      createElement(GuideStaticList, {
        testId: "manual-perk-list-free",
        items: [
          { id: "free-0", text: "1. Free for every age group" },
          { id: "free-1", text: "2. Match Wizard" },
        ],
      }),
    );
    expect(html).toContain("user-guide-checklist--static");
    expect(html).toContain("1. Free for every age group");
    expect(html).not.toMatch(/type="checkbox"/);
    expect(html).not.toContain("user-guide-checklist__box");
  });
});
