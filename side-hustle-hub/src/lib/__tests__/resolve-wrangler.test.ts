import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveWranglerBin,
  wranglerBinCandidates,
} from "../../../scripts/resolve-wrangler.mjs";

describe("resolveWranglerBin", () => {
  const root = path.join("C:", "project", "side-hustle-hub");

  it("prefers the local node_modules wrangler when it exists", () => {
    const local = path.resolve(root, "node_modules/wrangler/bin/wrangler.js");
    const found = resolveWranglerBin(root, (candidate) => candidate === local);
    expect(found).toBe(local);
  });

  it("falls back to the sibling Muntie wrangler", () => {
    const muntie = path.resolve(
      root,
      "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
    );
    const found = resolveWranglerBin(root, (candidate) => candidate === muntie);
    expect(found).toBe(muntie);
  });

  it("returns null when neither install exists", () => {
    expect(resolveWranglerBin(root, () => false)).toBeNull();
  });

  it("lists local before Muntie", () => {
    const [first, second] = wranglerBinCandidates(root);
    expect(first).toMatch(/node_modules[\\/]wrangler[\\/]bin[\\/]wrangler\.js$/);
    expect(second).toMatch(/muntie-ev-ai-studio-main/);
  });
});
