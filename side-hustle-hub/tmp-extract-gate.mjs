import fs from "fs";

const hub = fs.readFileSync("dist/assets/WorkshopsHub-Kr4ADALH.js", "utf8");
const app = fs.readFileSync("dist/assets/index-2COF8yIg.js", "utf8");

const start = hub.indexOf("function ye({onAddWorkshopSeat");
console.log("--- ye function start ---");
console.log(hub.slice(start, start + 4500));

console.log("\n\n--- app WorkshopsHub jsx ---");
for (const k of ["WorkshopsHub", "isLoggedIn:t", "onGoToLogin", "workshopRegisterId:e"]) {
  let idx = 0;
  let n = 0;
  while ((idx = app.indexOf(k, idx)) !== -1 && n < 6) {
    console.log(`\n==== ${k} @ ${idx} ====`);
    console.log(app.slice(Math.max(0, idx - 220), idx + 500));
    idx += k.length;
    n++;
  }
}
