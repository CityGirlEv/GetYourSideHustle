import io
import re
import urllib.request

from PIL import Image
import numpy as np

out = r"C:\Users\evely\Documents\antigravity\eager-hypatia\side-hustle-hub\src\assets\about-tina-headshot.png"

html = urllib.request.urlopen("https://getyoursidehustle.com/", timeout=30).read().decode("utf-8", "replace")
js_paths = re.findall(r"/assets/index-[A-Za-z0-9_-]+\.js", html)
print("js", js_paths[:3])

tina = None
for j in js_paths[:3]:
    body = urllib.request.urlopen("https://getyoursidehustle.com" + j, timeout=60).read().decode("utf-8", "replace")
    m = re.search(r"about-tina-headshot-[A-Za-z0-9_-]+\.png", body)
    if m:
        tina = m.group(0)
        print("found", tina)
        break

if not tina:
    for h in ["Q2dXstaV", "IuWfiTTu", "tbNNmdW4"]:
        url = f"https://getyoursidehustle.com/assets/about-tina-headshot-{h}.png"
        try:
            urllib.request.urlopen(url, timeout=15)
            tina = f"about-tina-headshot-{h}.png"
            print("head ok", tina)
            break
        except Exception as e:
            print("miss", h, type(e).__name__)

if not tina:
    raise SystemExit("could not find production Tina thumb")

data = urllib.request.urlopen("https://getyoursidehustle.com/assets/" + tina, timeout=30).read()
with open(out, "wb") as f:
    f.write(data)
print("saved prod base", len(data))

# Trim a little off the right hair only
a = np.array(Image.open(out).convert("RGB"))
h, w = a.shape[:2]
patches = np.concatenate([a[:30, :30].reshape(-1, 3), a[:30, -30:].reshape(-1, 3)])
ch = patches.max(1) - patches.min(1)
av = patches.mean(1)
sel = patches[(ch < 25) & (av > 70) & (av < 160)]
BG = tuple(int(x) for x in (sel.mean(0) if len(sel) else patches.mean(0)).round())
print("BG", BG)

r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
avg = (r + g + b) / 3.0
chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
hair = (avg < 90) & (chroma < 60)
red = (r > g + 40) & (r > b + 40) & (r > 100)
cx = 150
# Mild: trim ~6% of right hair span only
result = a.copy()
for y in range(0, int(h * 0.88)):
    left_xs = np.where(hair[y] & (np.arange(w) < cx) & ~red[y])[0]
    right_xs = np.where(hair[y] & (np.arange(w) > cx) & ~red[y])[0]
    if len(right_xs) == 0:
        continue
    old_edge = int(right_xs.max())
    # take a little off — 6% of right span, or match closer to left + small allowance
    if len(left_xs):
        left_span = cx - int(left_xs.min())
        target = int(max(left_span * 1.12, (old_edge - cx) * 0.94))
    else:
        target = int((old_edge - cx) * 0.94)
    new_edge = cx + target
    if new_edge >= old_edge - 1:
        continue
    for x in range(cx + 1, w):
        if red[y, x]:
            continue
        if x > new_edge:
            if hair[y, x] or avg[y, x] < 100:
                result[y, x] = BG
            continue
        t = (x - cx) / max(1, new_edge - cx)
        src_x = cx + t * (old_edge - cx)
        if x < cx + 28 and avg[y, x] > 95 and not hair[y, x]:
            continue
        x0 = int(np.floor(src_x))
        x1 = min(w - 1, x0 + 1)
        u = src_x - x0
        if avg[y, x0] > 110 and not hair[y, x0] and not hair[y, x]:
            continue
        result[y, x] = ((1 - u) * a[y, x0] + u * a[y, x1]).astype(np.uint8)

# light feather at new right edge
rr, gg, bb = result[:, :, 0].astype(int), result[:, :, 1].astype(int), result[:, :, 2].astype(int)
avg2 = (rr + gg + bb) / 3
for y in range(0, int(h * 0.88)):
    xs = np.where((avg2[y] < 95) & (np.arange(w) > cx) & ~((rr[y] > gg[y] + 40) & (rr[y] > bb[y] + 40)))[0]
    if len(xs) == 0:
        continue
    edge = int(xs.max())
    for x in range(max(0, edge - 1), min(w, edge + 3)):
        if (rr[y, x] > gg[y, x] + 40) and (rr[y, x] > bb[y, x] + 40):
            continue
        alpha = max(0.0, min(1.0, (x - (edge - 1)) / 3.0))
        result[y, x] = (result[y, x] * (1 - alpha) + np.array(BG) * alpha).astype(np.uint8)

Image.fromarray(result).save(out, optimize=True)
print("saved trimmed right hair from production base")
