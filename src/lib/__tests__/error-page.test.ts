import { describe, it, expect } from "vitest";
import { renderErrorPage } from "../error-page";

describe("renderErrorPage", () => {
  it("returns a complete HTML document", () => {
    const html = renderErrorPage();
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain("</html>");
    expect(html).toContain("This page didn't load");
    expect(html).toContain('href="/"');
  });
});