import fs from "fs";
const s = fs.readFileSync("dist/assets/index-2COF8yIg.js", "utf8");
const keys = ["ai-marketing-video", "ai-scene-production-packs", "register"];
for (const k of keys) {
  let idx = 0;
  let n = 0;
  while ((idx = s.indexOf(k, idx)) !== -1 && n < 3) {
    console.log("\n====", k, idx, "====");
    console.log(s.slice(Math.max(0, idx - 180), idx + 280));
    idx += k.length;
    n++;
  }
}
