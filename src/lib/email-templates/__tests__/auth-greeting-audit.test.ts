import { describe, it, expect } from "vitest";
import {
  ALL_TEMPLATES,
  renderDefaultHtml,
  renderDefaultHtmlWithMergeFields,
} from "../all-templates.server";
import { ensureEmailBranding } from "../email-branding.server";

const AUTH = ALL_TEMPLATES.filter((t) => t.kind === "auth");

describe("auth email greeting audit", () => {
  it.each(AUTH.map((t) => [t.name] as const))("%s raw and admin html", async (name) => {
    const raw = await renderDefaultHtml(name);
    const merged = await renderDefaultHtmlWithMergeFields(name);
    const branded = await ensureEmailBranding(merged, { siteUrl: "https://www.mypartb.com" });

    for (const [label, html] of [
      ["raw", raw],
      ["merged", merged],
      ["branded", branded],
    ] as const) {
      expect(html, `${label} contains Hi Jane`).not.toContain("Hi Jane");
      expect(html, `${label} contains standalone Jane`).not.toMatch(/>\s*Jane\s*[,<]/);
    }

    const heading = merged.match(/<h1[^>]*>([^<]*)</i)?.[1] ?? "";
    console.log(name, "h1:", heading);
  });
});
