import { test, expect } from "@playwright/test";

test.describe("GYSH smoke", () => {
  test("homepage loads with dashboard title", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("page-title")).toContainText("Get Your Side Hustle");
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("homepage Pick Your Path sits in hero before Who is GYSH for", async ({ page }) => {
    await page.goto("/");
    const path = page.getByTestId("home-match-family");
    const audience = page.getByTestId("home-audience");
    await expect(path.getByRole("heading", { name: /Pick Your Path/i })).toBeVisible();
    await expect(audience.getByRole("heading", { name: /Who is GYSH for/i })).toBeVisible();
    const pathBeforeAudience = await page.evaluate(() => {
      const a = document.querySelector('[data-testid="home-match-family"]');
      const b = document.querySelector('[data-testid="home-audience"]');
      if (!a || !b) return false;
      return Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(pathBeforeAudience).toBe(true);
  });

  test("mobile viewport: public pages do not overflow horizontally", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });
    const paths = [
      "/",
      "/join",
      "/membership",
      "/kids",
      "/seniors",
      "/guides",
      "/workshops",
      "/community",
      "/about",
      "/login",
      "/match",
      "/calculators",
      "/newsletter",
      "/contact",
      "/privacy",
    ];
    const leaks: string[] = [];
    for (const path of paths) {
      await page.goto(path);
      const extra = await page.evaluate(() => {
        const doc = document.documentElement;
        return Math.ceil(doc.scrollWidth - doc.clientWidth);
      });
      if (extra > 2) leaks.push(`${path} +${extra}px`);
    }
    expect(leaks).toEqual([]);
  });

  test("mobile viewport: header logo fits", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const logo = await page.evaluate(() => {
      const el = document.querySelector(".brand-header-logo") as HTMLImageElement | null;
      const r = el?.getBoundingClientRect();
      return { height: r?.height ?? 0, width: r?.width ?? 0 };
    });
    expect(logo.height).toBeGreaterThan(40);
    expect(logo.height).toBeLessThanOrEqual(80);
    expect(logo.width).toBeLessThanOrEqual(280);
  });

  test("mobile viewport: Join page community graphic and plans fit portrait", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/join");
    await expect(page.getByTestId("join-page")).toBeVisible();
    await expect(page.getByTestId("membership-page")).toBeVisible();
    const layout = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const img = document.querySelector(".membership-hero-media img");
      const pageEl = document.querySelector('[data-testid="membership-page"]');
      const hero = document.querySelector(".membership-hero");
      const ir = img?.getBoundingClientRect();
      const pr = pageEl?.getBoundingClientRect();
      const hr = hero?.getBoundingClientRect();
      return {
        vw,
        imgW: Math.round(ir?.width ?? 0),
        pageW: Math.round(pr?.width ?? 0),
        heroW: Math.round(hr?.width ?? 0),
        extra: Math.ceil(document.documentElement.scrollWidth - vw),
      };
    });
    expect(layout.imgW).toBeGreaterThan(240);
    expect(layout.imgW).toBeLessThanOrEqual(layout.vw);
    expect(layout.pageW).toBeLessThanOrEqual(layout.vw);
    expect(layout.heroW).toBeLessThanOrEqual(layout.vw);
    expect(layout.extra).toBeLessThanOrEqual(2);
  });

  test("mobile menu: Login stays visible and page scroll is locked", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator(".top-header.open")).toBeVisible();
    const login = page.getByTestId("header-login");
    await expect(login).toBeVisible();
    const locked = await page.evaluate(() => {
      const loginEl = document.querySelector('[data-testid="header-login"]') as HTMLElement | null;
      const header = document.querySelector(".top-header.open") as HTMLElement | null;
      if (!loginEl || !header) return { ok: false };
      const lr = loginEl.getBoundingClientRect();
      const hr = header.getBoundingClientRect();
      const inView =
        lr.top >= hr.top - 1 &&
        lr.bottom <= hr.bottom + 1 &&
        lr.height > 0;
      return {
        ok: true,
        inView,
        menuOpenClass: document.documentElement.classList.contains("gysh-mobile-menu-open"),
        bodyOverflow: getComputedStyle(document.body).overflow,
      };
    });
    expect(locked.ok).toBe(true);
    expect(locked.inView).toBe(true);
    expect(locked.menuOpenClass).toBe(true);
    expect(locked.bodyOverflow).toMatch(/hidden/);
    await login.click();
    await expect(page.getByTestId("login-page")).toBeVisible();
  });

  test("tablet viewport: public pages stay in portrait width", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad portrait
    const paths = ["/", "/join", "/membership", "/kids", "/seniors", "/guides", "/workshops", "/community"];
    const leaks: string[] = [];
    for (const path of paths) {
      await page.goto(path);
      const extra = await page.evaluate(() => {
        const doc = document.documentElement;
        return Math.ceil(doc.scrollWidth - doc.clientWidth);
      });
      if (extra > 2) leaks.push(`${path} +${extra}px`);
    }
    expect(leaks).toEqual([]);
    await page.goto("/");
    await expect(page.getByTestId("home-match-family")).toBeVisible();
    await expect(page.getByTestId("home-audience")).toBeVisible();
  });

  test("Home nav returns to home headline", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-find-mine").click();
    await expect(page.getByTestId("find-mine-selector")).toBeVisible();
    await page.getByTestId("nav-home").click();
    await expect(page.getByTestId("page-title")).toContainText("Get Your Side Hustle");
  });

  test("Workshops nav opens workshops view", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-workshops").click();
    await expect(page.getByTestId("page-title")).toContainText("Workshops");
  });

  test("Kids/Teens Corner nav opens kids view", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-kids").click();
    await expect(page.getByTestId("page-title")).toContainText("Kids & Teens Corner");
    await expect(page.getByTestId("kids-stories-tab")).toBeVisible();
    await expect(page.getByTestId("kids-stories-tab")).toHaveText(/Stories/i);
  });

  test("Match Wizard shows age selector then routes Adult / Kids / Senior", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-find-mine").click();
    await expect(page.getByTestId("find-mine-selector")).toBeVisible();
    await page.getByTestId("page-how-it-works").click();
    await expect(page.getByTestId("page-how-panel")).toBeVisible();
    await expect(page.getByTestId("find-mine-selector-lead")).toContainText(
      "four Match Wizards — Kids, Teens, Adult, and Senior",
    );
    await expect(page.getByTestId("find-mine-family-note")).toContainText("GYSH Coach");
    await expect(page.getByTestId("find-mine-card-kids")).toBeVisible();
    await expect(page.getByTestId("find-mine-card-junior")).toBeVisible();
    await expect(page.getByTestId("find-mine-card-adult")).toBeVisible();
    await expect(page.getByTestId("find-mine-card-senior")).toBeVisible();

    await page.getByTestId("find-mine-card-adult").click();
    await expect(page.getByTestId("page-title")).toContainText("Match Wizard");
    await expect(page.getByRole("heading", { name: "What is your startup budget?" })).toBeVisible();

    await page.getByTestId("nav-find-mine").click();
    await page.getByTestId("find-mine-card-kids").click();
    await expect(page.getByTestId("page-title")).toContainText("Kids & Teens Corner");
    await expect(page.getByRole("heading", { name: /Kid.?s Side Hustles/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Match Wizard/i })).toBeVisible();
    await expect(page.getByText("Find My Hustle", { exact: true })).toHaveCount(0);

    await page.getByTestId("nav-find-mine").click();
    await page.getByTestId("find-mine-card-senior").click();
    await expect(page.getByTestId("page-title")).toContainText("GYSH Seniors Corner");
  });

  test("Guides nav opens library", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-guides").click();
    await expect(page.getByTestId("page-title")).toContainText(/GYSH Guide/i);
    await expect(page.getByTestId("free-guides-page")).toBeVisible();
  });

  test("Guests see membership lock badges naming required tiers", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-guides").click();
    await expect(page.getByTestId("free-guides-page")).toBeVisible();
    await expect(page.getByTestId("guide-lock-badge-handyman").first()).toContainText(/Locked · Join Free/i);
    await expect(page.getByTestId("guide-lock-badge-rideshare").first()).toContainText(/Locked · Needs Starter/i);
    await expect(page.getByTestId("guide-lock-badge-affiliate").first()).toContainText(/Locked · Needs Pro/i);
    await expect(page.getByTestId("guide-lock-badge-digital-products").first()).toContainText(
      /Locked · Needs Elite/i,
    );
  });

  test("Free Guides filters All / Free / Kids", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-guides").click();
    await expect(page.getByTestId("free-guides-page")).toBeVisible();
    await expect(page.getByTestId("free-guides-filters")).toBeVisible();

    await page.getByTestId("free-guides-filter-free").click();
    await expect(page.getByRole("heading", { name: "GYSH Adult / Senior Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Kids Guides" })).toBeVisible();
    await expect(page.locator(".free-guide-card.is-gated")).toHaveCount(0);

    await page.getByTestId("free-guides-filter-kids").click();
    await expect(page.getByRole("heading", { name: "GYSH Kids Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Adult / Senior Guides" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "GYSH Teens Guides" })).toHaveCount(0);

    await page.getByTestId("free-guides-filter-all").click();
    await expect(page.getByRole("heading", { name: "GYSH Adult / Senior Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Kids Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GYSH Teens Guides" })).toBeVisible();
  });

  test("Membership nav opens tiers and Kids credits", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-join").click();
    await expect(page.getByTestId("page-title")).toContainText("Join GYSH");
    await expect(page.getByTestId("membership-page")).toBeVisible();
    await expect(page.getByTestId("membership-hero-dashboard-note")).toContainText("Member Dashboard");
    await expect(page.getByTestId("membership-hero-dashboard-note")).toContainText("referral");
    await expect(page.getByTestId("membership-see-plans")).toContainText("See Memberships");
    await expect(page.getByTestId("membership-see-plans")).toContainText("pricing");
    await expect(page.getByTestId("membership-see-plans-hint")).toContainText("Scrolls to Free–Elite pricing");
    await page.getByTestId("membership-see-plans").click();
    await expect(page.getByTestId("membership-plans")).toBeFocused();
    await expect(page.getByTestId("membership-tier-free")).toBeVisible();
    await expect(page.getByTestId("membership-tier-free")).toContainText("Free — start here");
    await expect(page.getByTestId("membership-free-start-badge")).toBeVisible();
    await page.getByTestId("membership-benefits-toggle-free").click();
    await expect(page.getByTestId("membership-benefits-free")).toContainText("Match Wizard");
    await expect(page.getByTestId("membership-tier-starter")).toBeVisible();
    await expect(page.getByTestId("membership-tier-pro")).toBeVisible();
    await expect(page.getByTestId("membership-tier-elite")).toBeVisible();
    await expect(page.getByTestId("membership-advance-billing-note")).toContainText(
      "collected in advance",
    );
    await page.getByTestId("membership-billing-yearly").check();
    await expect(page.getByTestId("membership-yearly-equiv-starter")).toBeVisible();
    await expect(page.getByTestId("membership-yearly-price-starter")).toBeVisible();
    await expect(page.getByTestId("membership-schedule-suite")).toBeVisible();
    await expect(page.getByTestId("membership-schedule-suite")).toContainText(/Pro/i);
    await expect(page.getByTestId("membership-schedule-suite")).toHaveJSProperty("open", true);
    await expect(page.getByTestId("membership-compare")).toHaveJSProperty("open", false);
    await expect(page.getByTestId("membership-tier-glossary")).toHaveJSProperty("open", false);
    await page.getByTestId("membership-tier-glossary").locator("summary").click();
    await expect(page.getByTestId("membership-tier-glossary")).toHaveJSProperty("open", true);
    await page.getByTestId("membership-compare").locator("summary").click();
    await expect(page.getByTestId("membership-compare")).toHaveJSProperty("open", true);
    await expect(page.getByTestId("membership-compare")).toContainText("Feature");
    // Military & Veterans callout deferred to Sprint 6 (T-MEM-MILITARY discount).
    await expect(page.getByTestId("membership-military-veteran")).toHaveCount(0);

    // Membership plans section, then schedule suite (military callout hidden until S5).
    const sectionOrder = await page.evaluate(() => {
      const ids = ["membership-plans", "membership-schedule-suite"];
      return ids.map((id) => {
        const el = document.querySelector(`[data-testid="${id}"]`);
        if (!el) return -1;
        let pos = 0;
        let n: Element | null = el;
        while (n && n.previousElementSibling) {
          pos += 1;
          n = n.previousElementSibling;
        }
        return pos;
      });
    });
    expect(sectionOrder[0]).toBeGreaterThanOrEqual(0);
    expect(sectionOrder[1]).toBeGreaterThan(sectionOrder[0]);

    await page.getByTestId("membership-audience-kids").click();
    await expect(page.getByTestId("membership-see-plans")).toContainText("Kids");
    await expect(page.getByTestId("membership-military-veteran")).toHaveCount(0);
    await expect(page.getByTestId("membership-credit-packs")).toBeVisible();
    await expect(page.getByTestId("membership-credit-pack-boost")).toContainText("25 credits");
    await expect(page.getByTestId("membership-credit-pack-family")).toContainText("300 credits");
    await expect(page.getByTestId("membership-credits")).toBeVisible();
    await expect(page.getByTestId("membership-alacarte")).toBeVisible();
    await page.getByTestId("membership-audience-adult").click();
    await expect(page.getByTestId("membership-alacarte-add-consult-30")).toBeVisible();
    await page.getByTestId("membership-alacarte-add-consult-30").click();
    await expect(page.getByTestId("membership-alacarte-cart-count")).toContainText("1");
    await expect(page.getByTestId("membership-alacarte-cart-line-consult-30")).toBeVisible();
    await expect(page.getByTestId("membership-alacarte-cart-checkout")).toBeVisible();
  });

  test("Join parent-funded packs checkout before a la carte and link Schedule Suite", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByTestId("membership-page")).toBeVisible();
    await expect(page.getByTestId("membership-schedule-suite-dashboard-link")).toHaveAttribute(
      "href",
      "/my-dashboard#schedule",
    );
    await expect(page.getByTestId("membership-pillar-schedule-link")).toHaveAttribute(
      "href",
      "#gysh-schedule-suite",
    );
    await expect(page.getByTestId("membership-credit-packs")).toBeVisible();
    await expect(page.getByTestId("membership-alacarte")).toBeVisible();
    await expect(page.getByTestId("membership-schedule-suite")).toBeVisible();
    const priceOrder = await page.evaluate(() => {
      const ids = ["membership-credit-packs", "membership-alacarte", "membership-schedule-suite"];
      return ids.map((id) => {
        const el = document.querySelector(`[data-testid="${id}"]`);
        if (!el) return -1;
        let pos = 0;
        let n: Element | null = el;
        while (n && n.previousElementSibling) {
          pos += 1;
          n = n.previousElementSibling;
        }
        return pos;
      });
    });
    expect(priceOrder[0]).toBeGreaterThanOrEqual(0);
    expect(priceOrder[1]).toBeGreaterThan(priceOrder[0]!);
    expect(priceOrder[2]).toBeGreaterThan(priceOrder[1]!);

    await expect(page.getByTestId("membership-credit-pack-boost")).toContainText("25 credits");
    await expect(page.getByTestId("membership-credit-pack-family")).toContainText("300 credits");
    await page.getByTestId("membership-credit-pack-add-boost").click();
    await expect(page.getByTestId("membership-alacarte-cart-line-boost")).toBeVisible();
    await expect(page.getByTestId("membership-alacarte-cart-count")).toContainText("1");
    await expect(page.getByTestId("membership-alacarte-cart-checkout")).toContainText("$5");
    await page.getByTestId("membership-alacarte-cart-clear-top").click();
    await expect(page.getByTestId("membership-alacarte-cart-empty")).toBeVisible();
  });

  test("header Cart opens a-la-carte checkout panel", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByTestId("membership-alacarte-add-consult-30")).toBeVisible();
    await page.getByTestId("membership-alacarte-add-consult-30").click();
    await expect(page.getByTestId("header-cart-count")).toContainText("1");
    await page.getByTestId("nav-home").click();
    await page.getByTestId("header-cart").click();
    await expect(page.getByTestId("membership-alacarte-cart")).toBeVisible();
    await expect(page.getByTestId("membership-alacarte-cart-checkout")).toBeVisible();
    await expect(page.getByTestId("membership-alacarte-cart-clear-top")).toBeVisible();
    await page.getByTestId("membership-alacarte-cart-clear-top").click();
    await expect(page.getByTestId("membership-alacarte-cart-empty")).toBeVisible();
  });

  test("Seniors nav opens GYSH Seniors Corner view", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-seniors").click();
    await expect(page.getByTestId("page-title")).toContainText("GYSH Seniors Corner");
    await expect(page.getByTestId("seniors-page")).toBeVisible();
  });

  test("login page does not expose passwords in the DOM", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByTestId("login-page")).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("gysh123");
    expect(bodyText).not.toContain("tina123");
    expect(bodyText).not.toMatch(/Testing Credentials/i);
  });

  test("footer links navigate About, Join, Contact, and Privacy Policy", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("button", { name: "About" }).click();
    await expect(page.getByTestId("page-title")).toContainText("About GYSH");
    await footer.getByRole("button", { name: "Join" }).click();
    await expect(page.getByTestId("page-title")).toContainText("Join GYSH");
    await footer.getByRole("button", { name: "Contact Us" }).click();
    await expect(page.getByTestId("page-title")).toContainText("Contact Us");
    await footer.getByTestId("footer-privacy").click();
    await expect(page.getByTestId("page-title")).toContainText("Privacy Policy");
    await expect(page.getByTestId("privacy-page")).toBeVisible();
    await expect(page).toHaveURL(/\/privacy$/);
  });

  test("Privacy Policy page shows published policy from footer and /privacy", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo").getByTestId("footer-privacy")).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByTestId("page-title")).toContainText("Privacy Policy");
    await expect(page.getByTestId("privacy-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Get Your Side Hustle Privacy Policy" })).toBeVisible();
    await expect(page.getByTestId("privacy-effective-date")).toContainText("August 23, 2026");
    await expect(page.getByRole("heading", { name: /Children’s Privacy/i })).toBeVisible();
    await expect(page.getByText(/Children’s Online Privacy Protection Act/)).toBeVisible();
    await page.getByTestId("privacy-contact").click();
    await expect(page.getByTestId("contact-page")).toBeVisible();
  });

  test("Newsletter page is members-only from header, footer, and /newsletter", async ({ page }) => {
    await page.goto("/newsletter");
    await expect(page).toHaveURL(/\/newsletter$/);
    await expect(page.getByTestId("page-title")).toContainText("Newsletter");
    await expect(page.getByTestId("newsletter-page")).toBeVisible();
    await expect(page.getByTestId("nav-newsletter")).toBeVisible();
    await expect(page.getByTestId("newsletter-lock")).toBeVisible();
    await expect(page.getByTestId("newsletter-join")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Newsletter #1/i })).toBeVisible();
    await expect(page.locator('[data-testid^="newsletter-body-"]')).toHaveCount(0);
    await page.getByRole("contentinfo").getByTestId("footer-newsletter").click();
    await expect(page.getByTestId("newsletter-page")).toBeVisible();
  });

  test("header nav opens About, Join, and Contact", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-about").click();
    await expect(page.getByTestId("page-title")).toContainText("About GYSH");
    await page.getByTestId("nav-join").click();
    await expect(page.getByTestId("page-title")).toContainText("Join GYSH");
    await page.getByTestId("nav-contact").click();
    await expect(page.getByTestId("page-title")).toContainText("Contact Us");
  });

  test("Join GYSH page shows Create account CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-join").click();
    await expect(page.getByTestId("join-page")).toBeVisible();
    await expect(page.getByTestId("join-create-or-upgrade")).toContainText(/Create account \/ Join/i);
    await expect(page.getByTestId("membership-browse-guides")).toContainText(/Browse free guides/i);
    await expect(page.getByTestId("membership-plan-bubbles")).toHaveCount(0);
  });

  test("Choose Starter opens signup with Starter plan selected", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByTestId("join-page")).toBeVisible();
    await page.getByTestId("membership-choose-starter").click();
    await expect(page.getByTestId("membership-signup-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Create your GYSH Membership/i })).toBeVisible();
    await expect(page.getByTestId("membership-signup-tier")).toHaveValue("starter");
    await expect(page.getByTestId("membership-signup-submit")).toContainText(/Starter/i);
    await expect(page.getByTestId("membership-signup-beta-role")).toBeVisible();
    await expect(page.getByLabel(/Apply as a Beta Tester/i)).toBeVisible();
  });

  test("Beta Tester NDA page shows GYSH-BETA-NDA-v1.1 from footer and /beta-nda", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByTestId("footer-beta-nda").click();
    await expect(page.getByTestId("page-title")).toContainText("Beta Tester NDA");
    await expect(page.getByTestId("beta-nda-page")).toBeVisible();
    await expect(page.getByTestId("beta-nda-version")).toContainText("GYSH-BETA-NDA-v1.1");
    await page.goto("/beta-nda");
    await expect(page.getByRole("heading", { name: /Confidentiality and Non-Disclosure/i })).toBeVisible();
  });

  test("Beta Tester Credit Guide shows earn rules from footer and /beta-credits", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByTestId("footer-beta-credits").click();
    await expect(page.getByTestId("page-title")).toContainText("Credit Guide");
    await expect(page.getByTestId("beta-credits-page")).toBeVisible();
    await expect(page.getByTestId("beta-credits-reward-table")).toContainText("P0");
    await expect(page.getByTestId("beta-credits-zero-note")).toContainText("0");
    await expect(page.getByTestId("beta-program-pdf")).toBeVisible();
    await expect(page.getByTestId("beta-program-word")).toBeVisible();
    await expect(page.getByTestId("beta-credits-open-points")).toBeVisible();
    await expect(page.getByTestId("beta-credits-membership-glossary")).toContainText(/four plans only/i);
    await expect(page.getByTestId("beta-credits-membership-glossary")).toContainText(/no Starter\+ or Pro\+/i);
    await page.goto("/beta-credits");
    await expect(page.getByRole("heading", { name: /Beta Tester Credit Guide/i })).toBeVisible();
  });

  test("Beta Tester Points page is reachable from footer and /beta-points", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByTestId("footer-beta-points").click();
    await expect(page.getByTestId("page-title")).toContainText("Beta Tester Points");
    await expect(page.getByTestId("beta-points-page")).toBeVisible();
    await page.goto("/beta-points");
    await expect(page.getByRole("heading", { name: /Beta Tester Points/i })).toBeVisible();
  });

  test("Apply as Beta Tester shows NDA fields on membership signup", async ({ page }) => {
    await page.goto("/membership");
    await expect(page.getByTestId("membership-signup-page")).toBeVisible();
    await page.getByTestId("membership-signup-beta-role").check();
    await expect(page.getByTestId("membership-signup-nda-panel")).toBeVisible();
    await expect(page.getByTestId("membership-signup-nda-legal-name")).toBeVisible();
    await expect(page.getByTestId("membership-signup-nda-agree")).toBeVisible();
    await expect(page.getByLabel(/I have read and agree/i)).toBeVisible();
  });

  test("Beta testing dashboard asks guests to create a tester profile", async ({ page }) => {
    await page.goto("/beta-testing");
    await expect(page.getByTestId("beta-tester-dashboard")).toBeVisible();
    await expect(page.getByTestId("page-title")).toContainText("Beta Tester");
    await expect(page.getByTestId("beta-dash-create-profile")).toBeVisible();
  });

  test("Membership signup shows Stripe checkout for Adult Starter", async ({ page }) => {
    await page.goto("/membership");
    await expect(page.getByTestId("membership-signup-page")).toBeVisible();
    await page.getByTestId("membership-signup-audience").selectOption("adult");
    await page.getByTestId("membership-signup-tier").selectOption("starter");
    await expect(page.getByTestId("membership-signup-submit")).toContainText(/Starter checkout/i);
  });

  test("Contact form exposes required Name, Email, Message fields", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-contact").click();
    await expect(page.getByTestId("contact-page")).toBeVisible();
    const form = page.getByTestId("contact-form");
    await expect(form.getByLabel("Name")).toBeVisible();
    await expect(form.getByLabel("Email")).toHaveAttribute("type", "email");
    await expect(form.getByLabel("Message")).toBeVisible();
    await expect(form.getByRole("button", { name: /Send message/i })).toBeVisible();
  });

  test("Seniors Join Senior Team tab shows interest signup CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-seniors").click();
    await page.getByTestId("seniors-tab-join").click();
    await expect(page.getByRole("heading", { name: /Join the Senior Side Hustle team/i })).toBeVisible();
    await expect(page.getByTestId("seniors-join-cta-btn")).toBeVisible();
    await expect(page.getByRole("button", { name: /Create free GYSH account/i })).toBeVisible();
  });

  test("homepage does not show the beta notice until login or preview", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("beta-phase-popup")).toHaveCount(0);
  });

  test("Login form requires email and password", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Login" }).click();
    const login = page.getByTestId("login-page");
    await expect(login.locator('input[type="email"]')).toHaveAttribute("required", "");
    await expect(login.locator('input[type="password"]').first()).toHaveAttribute("required", "");
    await expect(login.getByRole("button", { name: "Log In" })).toBeVisible();
    await expect(login.getByRole("button", { name: "Join GYSH" })).toBeVisible();
  });
});
