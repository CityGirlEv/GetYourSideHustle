import fs from "fs";
const s = fs.readFileSync("dist/assets/index-2COF8yIg.js", "utf8");
// Find effectivePortalLogin / isLoggedIn assignment near App
const needles = [
  "previewingAsGuest",
  "effectivePortalLogin",
  "hasFreeMemberSession",
  "hasMemberAccess",
  "setIsLoggedIn",
];
for (const k of needles) {
  const idx = s.indexOf(k);
  console.log(k, idx);
  if (idx >= 0) console.log(s.slice(idx - 120, idx + 200), "\n");
}

// Find const N= or ,N= pattern near isLoggedIn usage for workshops
const w = s.indexOf("t===`workshops`&&(0,M.jsx)(Kc,{isLoggedIn:N");
console.log("\n--- workshops jsx context vars ---");
console.log(s.slice(w - 50, w + 280));

// Search for N= assignment that's boolean login
let idx = 0;
let n = 0;
while ((idx = s.indexOf("N=", idx)) !== -1 && n < 40) {
  const snippet = s.slice(idx, idx + 80);
  if (snippet.includes("isLoggedIn") || snippet.includes("preview") || snippet.includes("guest") || snippet.includes("hasMember") || snippet.includes("authReady")) {
    console.log("N=", snippet);
  }
  idx += 2;
  n++;
}
