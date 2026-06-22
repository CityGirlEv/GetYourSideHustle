/** Learning Center hero targets — wide editorial photo, web-optimized. */
export const HERO_IMAGE_MAX_DIMENSION = 1600;
export const HERO_IMAGE_JPEG_QUALITY = 0.88;
/** Max raw file picked from disk before we compress (AI exports can be large PNGs). */
export const HERO_IMAGE_MAX_INPUT_BYTES = 30 * 1024 * 1024;
/** Max bytes after compression / before server upload. */
export const HERO_IMAGE_MAX_UPLOAD_BYTES = 16 * 1024 * 1024;

export type PreparedHeroImage = {
  base64: string;
  mimeType: "image/jpeg";
  originalSize: number;
  outputSize: number;
  width: number;
  height: number;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file"));
    };
    img.src = url;
  });
}

function scaledDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not compress image"))),
      "image/jpeg",
      quality,
    );
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read compressed image"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Could not read compressed image data"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read compressed image"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Resize and compress a hero image for Learning Center upload.
 * Large AI-generated PNGs are converted to JPEG and scaled to web-friendly dimensions.
 */
export async function prepareHeroImageForUpload(
  file: File,
  options?: { maxDimension?: number; maxBytes?: number },
): Promise<PreparedHeroImage> {
  if (file.size > HERO_IMAGE_MAX_INPUT_BYTES) {
    throw new Error(
      `Image is too large (${formatMb(file.size)}). Use a file under ${formatMb(HERO_IMAGE_MAX_INPUT_BYTES)} or export a smaller JPG from your image tool.`,
    );
  }

  const maxDimension = options?.maxDimension ?? HERO_IMAGE_MAX_DIMENSION;
  const maxBytes = options?.maxBytes ?? HERO_IMAGE_MAX_UPLOAD_BYTES;

  const img = await loadImageFromFile(file);
  const { width, height } = scaledDimensions(img.naturalWidth, img.naturalHeight, maxDimension);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image for upload");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = HERO_IMAGE_JPEG_QUALITY;
  let blob = await canvasToJpegBlob(canvas, quality);

  while (blob.size > maxBytes && quality > 0.5) {
    quality -= 0.08;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  if (blob.size > maxBytes) {
    throw new Error(
      `Could not compress image below ${formatMb(maxBytes)}. Try a simpler photo or export as JPG around ${maxDimension}px wide.`,
    );
  }

  const base64 = await blobToBase64(blob);
  return {
    base64,
    mimeType: "image/jpeg",
    originalSize: file.size,
    outputSize: blob.size,
    width,
    height,
  };
}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isHeroImageMime(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp" || ext === "jfif";
}
