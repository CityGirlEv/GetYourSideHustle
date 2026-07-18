const ids = ["z5QnFyQ41KY", "q70tGavSm9E", "gacSdfqtJDM", "d97e8cPOTH8"];
for (const id of ids) {
  const res = await fetch(`https://www.youtube.com/watch?v=${id}`);
  const t = await res.text();
  const title = t.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(" - YouTube", "");
  const ch = t.match(/"channelId":"([^"]+)"/);
  console.log(id, "|", title, "|", ch && ch[1]);
}
