import { describe, it, expect } from "vitest";
import { htmlToPlainText } from "@/lib/email-templates/overrides.server";

describe("htmlToPlainText", () => {
  it("strips tags and decodes basic entities", () => {
    const out = htmlToPlainText("<p>Hello&nbsp;<b>world</b> &amp; friends</p>");
    expect(out).toBe("Hello world & friends");
  });

  it("preserves line breaks at block boundaries", () => {
    const out = htmlToPlainText("<h1>Title</h1><p>Line 1</p><p>Line 2</p>");
    expect(out.split("\n").filter(Boolean)).toEqual(["Title", "Line 1", "Line 2"]);
  });

  it("drops <style> and <script> contents", () => {
    const out = htmlToPlainText("<style>.a{color:red}</style><script>alert(1)</script><p>Body</p>");
    expect(out).toBe("Body");
  });

  it("handles <br> as a newline", () => {
    const out = htmlToPlainText("Line A<br/>Line B<br>Line C");
    expect(out).toBe("Line A\nLine B\nLine C");
  });
});
