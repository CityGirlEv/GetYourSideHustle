"""Patch MATCH FINDER WIZARD → GYSH MATCH FINDER WIZARD on hero art."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SRC = Path(__file__).resolve().parents[1] / "src" / "assets" / "match-finder-wizard-hero.png"


def find_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\ARIALBD.TTF",
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\impact.ttf",
        r"C:\Windows\Fonts\verdana.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    # Approximate banner region from layout (top-center green brush stroke)
    # Sample around known text band: ~22–32% down the image
    y0, y1 = int(h * 0.195), int(h * 0.275)
    x0, x1 = int(w * 0.18), int(w * 0.82)

    # Sample green fill from left edge of banner (avoid white letters)
    greens: list[tuple[int, int, int]] = []
    for yy in range(y0, y1, 2):
        for xx in (x0 + 4, x0 + 10, x1 - 10, x1 - 4):
            r, g, b, a = im.getpixel((xx, yy))
            if g > r + 20 and g > b + 10 and g > 60:
                greens.append((r, g, b))
    if not greens:
        fill = (45, 90, 55, 255)
    else:
        # median-ish
        greens.sort()
        mid = greens[len(greens) // 2]
        fill = (*mid, 255)

    draw = ImageDraw.Draw(im)
    # Soft cover of old text area with banner green (slightly wider for GYSH)
    pad = 4
    draw.rounded_rectangle(
        [x0 - 8, y0 - 2, x1 + 8, y1 + 2],
        radius=10,
        fill=fill,
    )

    text = "GYSH MATCH FINDER WIZARD"
    # Fit font to band width
    size = 28
    font = find_font(size)
    while size > 10:
        font = find_font(size)
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        if tw <= (x1 - x0 - 10) and th <= (y1 - y0 - 4):
            break
        size -= 1

    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (w - tw) // 2 - bbox[0]
    ty = y0 + ((y1 - y0) - th) // 2 - bbox[1]

    # Slight italic/slant feel via affine offset not available easily — keep bold white
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    im.save(SRC, "PNG")
    print(f"Patched {SRC} with font size {size}, fill={fill[:3]}")


if __name__ == "__main__":
    main()
