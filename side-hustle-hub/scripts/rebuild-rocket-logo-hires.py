"""Rebuild gysh-logo-rocket.png: cream knockout + 4x LANCZOS for retina-safe downscale."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
# Prefer pre-knockout backup; fall back to current rocket.
SRC_CANDIDATES = [
    ROOT / "src" / "assets" / "gysh-logo-rocket.bak-cream.png",
    ROOT / "src" / "assets" / "gysh-logo-rocket.png",
]
OUTS = [
    ROOT / "src" / "assets" / "gysh-logo-rocket.png",
    ROOT / "public" / "brand" / "gysh-logo-rocket.png",
]
SCALE = 4


def is_bg_like(rr: float, gg: float, bb: float, aa: float) -> bool:
    if aa < 8:
        return True
    chroma = max(rr, gg, bb) - min(rr, gg, bb)
    if rr > 195 and gg > 185 and bb > 165 and chroma < 55:
        return True
    if rr > 175 and gg > 165 and bb > 145 and chroma < 45 and (rr + gg + bb) / 3 > 175:
        return True
    return False


def is_logo_color(rr: float, gg: float, bb: float, aa: float) -> bool:
    if aa < 8:
        return False
    chroma = max(rr, gg, bb) - min(rr, gg, bb)
    if gg > rr + 15 and gg > bb + 10 and gg > 80:
        return True
    if bb > rr + 10 and bb > gg and bb > 40:
        return True
    if rr > 160 and gg > 80 and bb < 120 and rr > bb + 40:
        return True
    if (
        gg > 40
        and rr < 120
        and bb < 100
        and (gg + rr) > bb + 30
        and chroma > 15
        and (rr + gg + bb) / 3 < 140
    ):
        return True
    if (rr + gg + bb) / 3 < 90 and chroma < 40 and aa > 100:
        return True
    if 120 < (rr + gg + bb) / 3 < 190 and chroma < 25 and aa > 80:
        return True
    return False


def cream_soft_alpha(rr: float, gg: float, bb: float, aa: float) -> float:
    if aa < 8:
        return 0.0
    cr, cg, cb = 236.0, 226.0, 210.0
    dist = ((rr - cr) ** 2 + (gg - cg) ** 2 + (bb - cb) ** 2) ** 0.5
    dist_w = ((rr - 245) ** 2 + (gg - 240) ** 2 + (bb - 230) ** 2) ** 0.5
    d = min(dist, dist_w)
    chroma = max(rr, gg, bb) - min(rr, gg, bb)
    lightness = (rr + gg + bb) / 3
    if lightness > 170 and chroma < 55:
        if d < 22:
            return 0.0
        if d < 55:
            t = (d - 22) / (55 - 22)
            return aa * t
    return aa


def knockout_cream(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA")).astype(np.float32)
    h, w = arr.shape[:2]
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]

    bg = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg_like(r[y, x], g[y, x], b[y, x], a[y, x]):
                bg[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg_like(r[y, x], g[y, x], b[y, x], a[y, x]) and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx]:
                if is_bg_like(r[ny, nx], g[ny, nx], b[ny, nx], a[ny, nx]):
                    bg[ny, nx] = True
                    q.append((ny, nx))

    out_a = np.zeros((h, w), dtype=np.float32)
    for y in range(h):
        for x in range(w):
            rr, gg, bb, aa = r[y, x], g[y, x], b[y, x], a[y, x]
            if is_logo_color(rr, gg, bb, aa):
                out_a[y, x] = aa
            elif bg[y, x]:
                out_a[y, x] = 0.0
            else:
                out_a[y, x] = cream_soft_alpha(rr, gg, bb, aa)

    arr[:, :, 3] = out_a
    # Zero RGB on fully transparent pixels (cleaner compositing)
    clear = out_a < 8
    arr[clear, 0:3] = 0

    ys, xs = np.where(out_a > 12)
    if len(xs) == 0:
        raise SystemExit("No content left after transparency pass")
    pad = 2
    x1, x2 = max(0, int(xs.min()) - pad), min(w - 1, int(xs.max()) + pad)
    y1, y2 = max(0, int(ys.min()) - pad), min(h - 1, int(ys.max()) + pad)
    final = arr[y1 : y2 + 1, x1 : x2 + 1, :].astype(np.uint8)
    return Image.fromarray(final, "RGBA")


def main() -> None:
    src = next((p for p in SRC_CANDIDATES if p.exists()), None)
    if src is None:
        raise SystemExit("No source rocket logo found")
    print("source", src)

    cut = knockout_cream(Image.open(src))
    print("knockout size", cut.size)

    hi = cut.resize((cut.width * SCALE, cut.height * SCALE), Image.Resampling.LANCZOS)
    # Gentle sharpen after upscale — helps crisp edges when CSS downscales
    hi = hi.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=2))
    print("hires size", hi.size)

    arr = np.array(hi)
    print(f"trans%={(arr[:, :, 3] < 10).mean() * 100:.1f}")
    print("corners", arr[0, 0].tolist(), arr[0, -1].tolist())

    for out in OUTS:
        out.parent.mkdir(parents=True, exist_ok=True)
        hi.save(out, "PNG", optimize=True)
        print("saved", out, out.stat().st_size)


if __name__ == "__main__":
    main()
