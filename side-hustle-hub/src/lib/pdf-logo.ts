/** Browser-only PDF logo (Vite asset URL). Keep out of Pages Functions bundles. */
import gyshLogoUrl from "../assets/gysh-logo-pdf.png";

const LOGO_CREAM_HEX = "#F7F3ED";

let logoDataUrlCache: string | undefined;

async function trimLogoToDataUrl(srcUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(srcUrl);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const w = bmp.width;
    const h = bmp.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return undefined;
    }
    ctx.drawImage(bmp, 0, 0);
    bmp.close();

    const { data } = ctx.getImageData(0, 0, w, h);
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const a = data[i + 3]!;
        if (a < 8) continue;
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        if (r < 18 && g < 18 && b < 18) continue;
        const chroma = Math.max(r, g, b) - Math.min(r, g, b);
        if (r > 220 && g > 210 && b > 190 && chroma < 40) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX <= minX || maxY <= minY) {
      return canvas.toDataURL("image/png");
    }

    const pad = 4;
    const sx = Math.max(0, minX - pad);
    const sy = Math.max(0, minY - pad);
    const sw = Math.min(w - sx, maxX - minX + 1 + pad * 2);
    const sh = Math.min(h - sy, maxY - minY + 1 + pad * 2);
    const scale = sw < 400 ? 2 : 1;
    const out = document.createElement("canvas");
    out.width = Math.round(sw * scale);
    out.height = Math.round(sh * scale);
    const octx = out.getContext("2d");
    if (!octx) return canvas.toDataURL("image/png");
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";
    octx.fillStyle = LOGO_CREAM_HEX;
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, out.width, out.height);
    return out.toDataURL("image/png");
  } catch {
    return undefined;
  }
}

export async function loadPdfLogoDataUrl(): Promise<string | undefined> {
  if (logoDataUrlCache) return logoDataUrlCache;
  const trimmed = await trimLogoToDataUrl(gyshLogoUrl);
  if (trimmed) {
    logoDataUrlCache = trimmed;
    return trimmed;
  }
  try {
    const res = await fetch(gyshLogoUrl);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    logoDataUrlCache = dataUrl;
    return dataUrl;
  } catch {
    return undefined;
  }
}
