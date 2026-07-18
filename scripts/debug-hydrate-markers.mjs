import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(3_000);

const markers = await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Site navigation"]');
  const all = [...document.querySelectorAll("[data-ts-hydrate-when]")];
  const containingNav = all.filter((el) => nav && el.contains(nav));
  const navAncestors = [];
  let p = nav?.parentElement;
  while (p) {
    if (p.hasAttribute("data-ts-hydrate-when")) {
      navAncestors.push({
        when: p.getAttribute("data-ts-hydrate-when"),
        id: p.getAttribute("data-ts-hydrate-id"),
        tag: p.tagName,
        class: p.className?.slice?.(0, 80),
      });
    }
    p = p.parentElement;
  }
  return {
    totalMarkers: all.length,
    markersContainingNav: containingNav.map((el) => ({
      when: el.getAttribute("data-ts-hydrate-when"),
      id: el.getAttribute("data-ts-hydrate-id"),
      tag: el.tagName,
    })),
    navAncestors,
    navHtml: nav?.outerHTML?.slice(0, 300),
  };
});

console.log(JSON.stringify(markers, null, 2));
await browser.close();
