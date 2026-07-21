/** Quick prod smoke: fetch HTML + JS and look for boot errors. */
import { createRequire } from "node:module";

const origin = process.argv[2] || "https://getyoursidehustle.com";

async function main() {
  const htmlRes = await fetch(origin + "/");
  const html = await htmlRes.text();
  console.log("HTML", htmlRes.status);
  const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  const cssMatch = html.match(/href="(\/assets\/index-[^"]+\.css)"/);
  console.log("JS ref", jsMatch?.[1]);
  console.log("CSS ref", cssMatch?.[1]);
  if (!jsMatch) {
    console.error("No JS bundle in HTML");
    process.exit(1);
  }
  const jsUrl = origin + jsMatch[1];
  const jsRes = await fetch(jsUrl);
  const js = await jsRes.text();
  console.log("JS", jsRes.status, "bytes", js.length);
  // Spot common crash patterns
  for (const needle of ["Cannot access", "before initialization", "is not defined", "Unexpected token"]) {
    if (js.includes(needle)) console.log("needle in bundle:", needle);
  }
  // Try dynamic import in node (may fail on DOM APIs — still catches syntax)
  try {
    const blob = new Blob([js], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    await import(url);
    console.log("JS import: ok (no throw during module eval)");
  } catch (e) {
    console.log("JS import error:", e?.message || e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
