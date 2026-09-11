import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("public first-load code split", () => {
  it("keeps Join, Kids, About, and Admin off the eager App import graph", () => {
    const app = readFileSync(join(root, "src/App.tsx"), "utf8");
    expect(app).toContain('from "./lazy-app-pages"');
    expect(app).toContain("AUTH_READY_SAFETY_MS");
    expect(app).not.toMatch(/from "\.\/components\/JoinPage"/);
    expect(app).not.toMatch(/from "\.\/components\/KidsCorner"/);
    expect(app).not.toMatch(/from "\.\/components\/AboutPage"/);
    expect(app).not.toMatch(/from "\.\/components\/AdminPortal"/);
    expect(app).not.toMatch(/from "\.\/components\/FindMineWizardSelector"/);
  });

  it("wraps lazy routes with stale-chunk recovery", () => {
    const lazyPages = readFileSync(join(root, "src/lazy-app-pages.ts"), "utf8");
    expect(lazyPages).toContain("lazyImportWithStaleRecovery");
  });

  it("caches brand images on production so repeat visits skip the hero download", () => {
    const headers = readFileSync(join(root, "public/_headers"), "utf8");
    expect(headers).toMatch(/\/brand\/\*/);
    expect(headers).toMatch(/max-age=604800/);
    expect(headers).toMatch(/stale-while-revalidate/);
  });

  it("does not render-block on Google Fonts preload", () => {
    const html = readFileSync(join(root, "index.html"), "utf8");
    expect(html).not.toMatch(/rel=["']preload["'][^>]*as=["']style["'][^>]*fonts\.googleapis/i);
    expect(html).not.toMatch(/as=["']style["'][^>]*rel=["']preload["'][^>]*fonts\.googleapis/i);
    expect(html).toMatch(/fonts\.googleapis\.com\/css2/);
    expect(html).toMatch(/media=["']print["']/);
    expect(html).toMatch(/gysh_stale_chunk_reload/);
    expect(html).toMatch(/gysh-stale-shell-refresh/);
    expect(html).toMatch(/Update available/);
    expect(html).toMatch(/media=["']\(min-width: 768px\)["']/);
  });

  it("does not let browsers keep a stale index.html after deploy", () => {
    const headers = readFileSync(join(root, "public/_headers"), "utf8");
    expect(headers).toMatch(/\/index\.html[\s\S]*?Cache-Control:\s*no-store/);
  });

  it("loads production CSS without blocking first paint", () => {
    const vite = readFileSync(join(root, "vite.config.ts"), "utf8");
    expect(vite).toContain("gysh-async-css");
    expect(vite).toContain("this.media='all'");
  });

  it("does not fetch session popups until they open", () => {
    const app = readFileSync(join(root, "src/App.tsx"), "utf8");
    expect(app).toMatch(/betaNoticeOpen \? \(/);
    expect(app).toMatch(/scheduleDueOpen \? \(/);
  });

  it("filters lazy chunks out of HTML modulepreload in the Vite build", () => {
    const vite = readFileSync(join(root, "vite.config.ts"), "utf8");
    expect(vite).toContain("htmlModulePreloadDeps");
    expect(vite).toMatch(/hostType === ["']html["']/);
  });
});
