import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import type { LeadMagnetPdfAssets, LeadMagnetPdfSource } from "@/lib/lead-magnet-pdf";

/** Facebook feed / link preview friendly (1.91:1). */
export const WORKBOOK_SOCIAL_TEASER_WIDTH = 1200;
export const WORKBOOK_SOCIAL_TEASER_HEIGHT = 630;

export const WORKBOOK_TEASER_CHECKLIST = [
  "List every prescription + exact dosage",
  "Doctors, specialists & hospitals to keep",
  "Employer coverage (if still working)",
  "Questions for Medicare.gov & SHIP",
  "Official sources to verify before enrolling",
] as const;

const TEASER_JPEG_QUALITY = 0.92;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not export teaser image"))),
      "image/jpeg",
      TEASER_JPEG_QUALITY,
    );
  });
}

/** Draw a checklist-style Facebook teaser — browser only. */
export function drawWorkbookSocialTeaser(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  source: LeadMagnetPdfSource,
  logoImage?: HTMLImageElement | null,
): void {
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#eff6ff");
  bg.addColorStop(1, "#dbeafe");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const paperX = 72;
  const paperY = 48;
  const paperW = width - paperX * 2;
  const paperH = height - paperY - 56;

  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, paperX, paperY, paperW, paperH, 12);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  roundRect(ctx, paperX, paperY, paperW, paperH, 12);
  ctx.stroke();

  const innerX = paperX + 40;
  let y = paperY + 44;

  ctx.fillStyle = "#1d4ed8";
  ctx.font = "bold 22px Helvetica, Arial, sans-serif";
  ctx.fillText(SITE_BRAND_NAME, innerX, y);
  y += 22;
  ctx.font = "bold 18px Helvetica, Arial, sans-serif";
  ctx.fillText(PUBLIC_WEBSITE_HOST, innerX, y);
  y += 28;

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 34px Helvetica, Arial, sans-serif";
  const title = source.title.trim() || "Medicare at 65 Planning Workbook";
  ctx.fillText(title, innerX, y);
  y += 28;

  ctx.fillStyle = "#475569";
  ctx.font = "18px Helvetica, Arial, sans-serif";
  ctx.fillText("Free printable PDF checklist · Educational only", innerX, y);
  y += 36;

  ctx.fillStyle = "#047857";
  ctx.font = "bold 16px Helvetica, Arial, sans-serif";
  ctx.fillText("FREE PDF — no email signup", innerX, y);
  y += 32;

  ctx.strokeStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(innerX, y);
  ctx.lineTo(paperX + paperW - 40, y);
  ctx.stroke();
  y += 28;

  ctx.font = "20px Helvetica, Arial, sans-serif";
  for (const line of WORKBOOK_TEASER_CHECKLIST) {
    const box = 22;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    roundRect(ctx, innerX, y - box + 4, box, box, 4);
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.fillText(line, innerX + box + 14, y + 2);
    y += 38;
  }

  if (logoImage) {
    const logoW = 160;
    const logoH = 44;
    const logoX = width - paperX - logoW - 8;
    const logoY = paperY + 12;
    ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "15px Helvetica, Arial, sans-serif";
  ctx.fillText("Attach this image to your Facebook post · Link to PDF in post text", paperX, height - 24);
}

async function loadLogoImage(dataUrl: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!dataUrl || typeof document === "undefined") return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

export async function buildWorkbookSocialTeaserBlob(
  source: LeadMagnetPdfSource,
  assets: LeadMagnetPdfAssets = {},
): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("Workbook teaser image requires a browser");
  }
  const canvas = document.createElement("canvas");
  canvas.width = WORKBOOK_SOCIAL_TEASER_WIDTH;
  canvas.height = WORKBOOK_SOCIAL_TEASER_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create teaser canvas");
  const logoImage = await loadLogoImage(assets.logoDataUrl);
  drawWorkbookSocialTeaser(ctx, canvas.width, canvas.height, source, logoImage);
  return canvasToJpegBlob(canvas);
}

export async function buildWorkbookSocialTeaserObjectUrl(
  source: LeadMagnetPdfSource,
  assets: LeadMagnetPdfAssets = {},
): Promise<string> {
  const blob = await buildWorkbookSocialTeaserBlob(source, assets);
  return URL.createObjectURL(blob);
}

export async function workbookSocialTeaserToBase64(
  source: LeadMagnetPdfSource,
  assets: LeadMagnetPdfAssets = {},
): Promise<string> {
  const blob = await buildWorkbookSocialTeaserBlob(source, assets);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read teaser image"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Could not read teaser image data"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read teaser image"));
    reader.readAsDataURL(blob);
  });
}
