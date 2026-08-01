import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public/robots.txt", () => {
  const body = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");

  it("is plain robots syntax, not HTML", () => {
    expect(body).not.toMatch(/<!doctype html>/i);
    expect(body).toMatch(/^User-agent:\s*\*/m);
    expect(body).toMatch(/^Allow:\s*\//m);
  });

  it("blocks API and admin crawling", () => {
    expect(body).toMatch(/^Disallow:\s*\/api\//m);
    expect(body).toMatch(/^Disallow:\s*\/admin/m);
  });

  it("declares a sitemap", () => {
    expect(body).toMatch(/^Sitemap:\s*https:\/\/getyoursidehustle\.com\/sitemap\.xml/m);
  });
});
