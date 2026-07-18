const urls = [
  "https://www.youtube.com/@KevinaStarrStories/about",
  "https://www.youtube.com/@KevinaStarrStories",
];

for (const url of urls) {
  const res = await fetch(url);
  const t = await res.text();
  console.log("\n===", url, "===");
  const desc =
    t.match(/"description":\{"simpleText":"([\s\S]*?)"\}/) ||
    t.match(/"description":"((?:\\.|[^"\\])*)"/);
  if (desc) {
    console.log(
      "DESC:",
      desc[1]
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\u0026/g, "&")
        .slice(0, 2000),
    );
  }
  const channel = t.match(/"channelId":"([^"]+)"/);
  console.log("channelId", channel && channel[1]);
  const subs = t.match(/"subscriberCountText":\{"simpleText":"([^"]+)"\}/);
  console.log("subs", subs && subs[1]);
  const vids = [...t.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]);
  console.log("videos", [...new Set(vids)].slice(0, 6));
}
