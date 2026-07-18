"""Remove near-black background from GYSH rocket logo → transparent PNG."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path(__file__).resolve().parents[1] / "src" / "assets" / "gysh-logo-rocket.png"
OUT = SRC  # overwrite in place


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    # Soft key: pure/near-black bg → transparent; keep dark blue ink & banner.
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            mx = max(r, g, b)
            mn = min(r, g, b)
            # Neutral dark (background): low channel max and low saturation
            if mx <= 28 and (mx - mn) <= 12:
                pixels[x, y] = (r, g, b, 0)
            elif mx <= 48 and (mx - mn) <= 10:
                # Soft edge fade
                alpha = int(255 * (mx - 28) / 20)
                pixels[x, y] = (r, g, b, max(0, min(255, alpha)))

    img.save(OUT, "PNG")
    print(f"Wrote transparent logo: {OUT}")


if __name__ == "__main__":
    main()
