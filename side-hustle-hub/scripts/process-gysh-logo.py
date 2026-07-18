"""Crop black padding and make cream/opaque background transparent for GYSH logo."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path(
    r"C:\Users\evely\.cursor\projects\c-Users-evely-Documents-antigravity-muntie-ev-ai-studio-main"
    r"\assets\c__Users_evely_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_image-3475f6f0-8c00-44a2-a3a7-893bd5f041fb.png"
)
OUT = Path(__file__).resolve().parents[1] / "src" / "assets" / "gysh-logo.png"


def is_bg_like(rr: float, gg: float, bb: float, aa: float) -> bool:
    """Cream / near-white / empty / near-black padding."""
    if aa < 8:
        return True
    if rr < 28 and gg < 28 and bb < 28:
        return True
    chroma = max(rr, gg, bb) - min(rr, gg, bb)
    if rr > 195 and gg > 185 and bb > 165 and chroma < 55:
        return True
    if rr > 175 and gg > 165 and bb > 145 and chroma < 45 and (rr + gg + bb) / 3 > 175:
        return True
    return False


def cream_soft_alpha(rr: float, gg: float, bb: float, aa: float) -> float:
    if aa < 8:
        return 0.0
    if rr < 28 and gg < 28 and bb < 28:
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


def is_logo_color(rr: float, gg: float, bb: float, aa: float) -> bool:
    if aa < 8:
        return False
    chroma = max(rr, gg, bb) - min(rr, gg, bb)
    # green cursive
    if gg > rr + 15 and gg > bb + 10 and gg > 80:
        return True
    # blue text / accents
    if bb > rr + 10 and bb > gg and bb > 40:
        return True
    # orange / yellow flame
    if rr > 160 and gg > 80 and bb < 120 and rr > bb + 40:
        return True
    # olive rocket body
    if (
        gg > 40
        and rr < 120
        and bb < 100
        and (gg + rr) > bb + 30
        and chroma > 15
        and (rr + gg + bb) / 3 < 140
    ):
        return True
    # dark charcoal tagline text
    if (rr + gg + bb) / 3 < 90 and chroma < 40 and aa > 100:
        return True
    # light grey sparkle
    if 120 < (rr + gg + bb) / 3 < 190 and chroma < 25 and aa > 80:
        return True
    return False


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    arr = np.array(im).astype(np.float32)

    # Drop empty/black top bar; logo panel starts ~y=129 on this asset
    y0 = 129
    cropped = arr[y0:, :, :].copy()
    ch, cw = cropped.shape[:2]
    r, g, b, a = cropped[:, :, 0], cropped[:, :, 1], cropped[:, :, 2], cropped[:, :, 3]

    bg = np.zeros((ch, cw), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(cw):
        for y in (0, ch - 1):
            if is_bg_like(r[y, x], g[y, x], b[y, x], a[y, x]):
                bg[y, x] = True
                q.append((y, x))
    for y in range(ch):
        for x in (0, cw - 1):
            if is_bg_like(r[y, x], g[y, x], b[y, x], a[y, x]) and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < ch and 0 <= nx < cw and not bg[ny, nx]:
                if is_bg_like(r[ny, nx], g[ny, nx], b[ny, nx], a[ny, nx]):
                    bg[ny, nx] = True
                    q.append((ny, nx))

    cream_mask = np.vectorize(is_bg_like, otypes=[bool])(r, g, b, a)
    protect = np.vectorize(is_logo_color, otypes=[bool])(r, g, b, a)

    out_a = np.zeros((ch, cw), dtype=np.float32)
    for y in range(ch):
        for x in range(cw):
            if protect[y, x]:
                out_a[y, x] = a[y, x]
            elif bg[y, x] or cream_mask[y, x]:
                soft = cream_soft_alpha(r[y, x], g[y, x], b[y, x], a[y, x])
                out_a[y, x] = 0.0 if bg[y, x] and is_bg_like(r[y, x], g[y, x], b[y, x], a[y, x]) else soft
            else:
                out_a[y, x] = cream_soft_alpha(r[y, x], g[y, x], b[y, x], a[y, x])

    cropped[:, :, 3] = out_a

    alpha = cropped[:, :, 3]
    ys, xs = np.where(alpha > 12)
    if len(xs) == 0:
        raise SystemExit("No content left after transparency pass")
    pad = 4
    x1, x2 = max(0, int(xs.min()) - pad), min(cw - 1, int(xs.max()) + pad)
    y1, y2 = max(0, int(ys.min()) - pad), min(ch - 1, int(ys.max()) + pad)
    final = cropped[y1 : y2 + 1, x1 : x2 + 1, :].astype(np.uint8)

    result = Image.fromarray(final, "RGBA")
    print("cropped size", result.size)

    # Upscale for header (~540px wide). Source panel is ~155px wide.
    scale = 4
    up = result.resize((result.width * scale, result.height * scale), Image.Resampling.LANCZOS)
    print("upscaled", up.size)

    ua = np.array(up)
    print(f"transparent pct {(ua[:, :, 3] < 10).mean() * 100:.1f}%")
    print(f"opaque pct {(ua[:, :, 3] > 200).mean() * 100:.1f}%")
    print("corners", ua[0, 0], ua[0, -1], ua[-1, 0], ua[-1, -1])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    up.save(OUT, "PNG", optimize=True)
    print("saved", OUT)


if __name__ == "__main__":
    main()
