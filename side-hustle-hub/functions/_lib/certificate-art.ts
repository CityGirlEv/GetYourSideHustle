/**
 * Get Your Side Hustle family certificate — official mockup art with the
 * member name overlaid on the signature line.
 */
import { escapeHtml } from "./email-brand";
import { CERT_BG_HEIGHT, CERT_BG_JPEG_BASE64, CERT_BG_WIDTH } from "./certificate-bg-data";
import type { CertificateBackground } from "./certificate-background";

export const CERT_LOGO_SIZE = 78;
export const CERT_ORG_NAME = "Get Your Side Hustle";
export const CERT_TAGLINE_WORDS = ["IDEAS.", "ACTION.", "INCOME.", "FREEDOM."] as const;
export const CERT_FAMILY_SPACED = "F  A  M  I  L  Y";
export const CERT_MOTTO = "TOGETHER WE HUSTLE BRIGHTER";
export const CERT_PRESENTED = "THIS CERTIFICATE IS PROUDLY PRESENTED TO";
export const CERT_DEFAULT_BODY =
  "You're now part of a community of dreamers, doers, and creators turning ideas into action, income, and freedom.";
export const CERT_CORNER_MOTTOS = [
  { id: "tl", lines: ["Big Ideas", "Brighter Futures"] },
  { id: "tr", lines: ["Same Goals", "Bigger Impact"] },
  { id: "bl", lines: ["Dream Plan", "Hustle Thrive"] },
] as const;

const NAVY = "#1a365d";
const GOLD = "#c9a227";
const GOLD_DEEP = "#8d6b2c";
const CREAM = "#f8f3e8";
const PAPER = "#fffcf6";
const SERIF = `Georgia, 'Palatino Linotype', 'Times New Roman', serif`;

export type CertAudienceKey = "kids" | "teens" | "adults" | "seniors";

export type CertificateTheme = {
  key: CertAudienceKey;
  corner: string;
  honor: string;
  title: string;
  subtitle: string;
  presented: string;
  seal: string;
  ribbon: string;
  ink: string;
  accent: string;
  gold: string;
  goldDeep: string;
  cream: string;
  cream2: string;
  paper: string;
  paper2: string;
};

/** Expand the GYSH acronym so the certificate leads with the full name. */
export function spellOutGysh(text: string): string {
  return String(text || "").replace(/\bGYSH\b/g, CERT_ORG_NAME);
}

export function certAudienceKey(raw: string | null | undefined): CertAudienceKey {
  const a = String(raw || "adult")
    .trim()
    .toLowerCase();
  if (a === "kids" || a === "kid") return "kids";
  if (a === "junior" || a === "teen" || a === "teens") return "teens";
  if (a === "senior" || a === "seniors") return "seniors";
  return "adults";
}

export function certificateThemeFor(audienceRaw: string | null | undefined): CertificateTheme {
  const key = certAudienceKey(audienceRaw);
  const shared = {
    presented: CERT_PRESENTED,
    ink: NAVY,
    accent: NAVY,
    gold: GOLD,
    goldDeep: GOLD_DEEP,
    cream: CREAM,
    cream2: "#ead9b0",
    paper: PAPER,
    paper2: "#f3ead6",
  };
  if (key === "kids") {
    return {
      ...shared,
      key,
      corner: "Kids Side Hustle Corner",
      honor: "Glow Getter",
      title: "You're a Glow Getter!",
      subtitle: "Certificate of Belonging",
      seal: "GLOW",
      ribbon: "Kids · Glow Getter",
    };
  }
  if (key === "teens") {
    return {
      ...shared,
      key,
      corner: "Teens Side Hustle Corner",
      honor: "Young CEO",
      title: "Welcome, Young Hustler",
      subtitle: "Certificate of Membership",
      seal: "CEO",
      ribbon: "Teens · Young CEO",
    };
  }
  if (key === "seniors") {
    return {
      ...shared,
      key,
      corner: "Seniors Corner",
      honor: "Seniors Corner Member",
      title: "Welcome to Seniors Corner",
      subtitle: "Certificate of Membership",
      seal: "WISE",
      ribbon: "Seniors Corner",
    };
  }
  return {
    ...shared,
    key: "adults",
    corner: "Adult Membership",
    honor: "Family Member",
    title: "Welcome to the Family",
    subtitle: "Certificate of Membership",
    seal: "FAMILY",
    ribbon: "Adult Membership",
  };
}

export function resolveCertificateHeadings(
  audienceRaw: string | null | undefined,
  template: { title: string; subtitle: string },
): { title: string; subtitle: string } {
  const theme = certificateThemeFor(audienceRaw);
  if (theme.key === "adults") {
    return {
      title: spellOutGysh(String(template.title || "").trim() || theme.title),
      subtitle: spellOutGysh(String(template.subtitle || "").trim() || theme.subtitle),
    };
  }
  return { title: theme.title, subtitle: theme.subtitle };
}

export type CertificateArtInput = {
  title: string;
  subtitle: string;
  memberName: string;
  bodyText: string;
  signoff: string;
  footerLine: string;
  tierLabel: string;
  audienceLabel: string;
  issuedAt: string;
  audienceRaw?: string | null;
  background?: Pick<CertificateBackground, "mime" | "width" | "height" | "base64">;
};

function nameFontSize(name: string): number {
  const n = String(name || "").trim().length;
  if (n > 36) return 16;
  if (n > 28) return 18;
  if (n > 22) return 20;
  return 24;
}

function wrapLines(text: string, maxChars: number, maxLines = 3): string[] {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

/** Cover the mockup "YOUR NAME HERE" line and print the member name. */
function nameOverlay(cx: number, name: string, w: number, h: number): string {
  const lines = wrapLines(name, 32, 2);
  const size = lines.length > 1 ? Math.max(14, Math.round(h * 0.023)) : nameFontSize(name);
  const coverY = Math.round(h * (392 / 682));
  const coverH = Math.max(28, Math.round(h * (34 / 682)));
  const coverW = Math.round(w * (500 / 1024));
  const startY = lines.length > 1 ? coverY + 14 : coverY + Math.round(coverH * 0.65);
  return `<g>
    <rect x="${cx - coverW / 2}" y="${coverY}" width="${coverW}" height="${coverH}" fill="#f4ead6"/>
    ${lines
      .map(
        (line, i) =>
          `<text x="${cx}" y="${startY + i * (size + 2)}" text-anchor="middle" font-family="${SERIF}" font-size="${size}" font-weight="700" fill="${NAVY}">${escapeHtml(line)}</text>`,
      )
      .join("\n    ")}
  </g>`;
}

function resolveBackground(
  input: CertificateArtInput,
): Pick<CertificateBackground, "mime" | "width" | "height" | "base64"> {
  if (input.background?.base64 && input.background.width && input.background.height) {
    return input.background;
  }
  return {
    mime: "image/jpeg",
    width: CERT_BG_WIDTH,
    height: CERT_BG_HEIGHT,
    base64: CERT_BG_JPEG_BASE64,
  };
}

/** Landscape SVG: official family certificate mockup with the member name overlaid. */
export function buildCertificateSvg(input: CertificateArtInput): string {
  const memberName = String(input.memberName || "Side Hustler").trim();
  const bg = resolveBackground(input);
  const w = bg.width;
  const h = bg.height;
  const cx = w / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Get Your Side Hustle family certificate for ${escapeHtml(memberName)}">
  <image href="data:${bg.mime};base64,${bg.base64}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>
  ${nameOverlay(cx, memberName, w, h)}
</svg>`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16) / 255,
    Number.parseInt(h.slice(2, 4), 16) / 255,
    Number.parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function jpegBytes(input: CertificateArtInput): Uint8Array {
  const bg = resolveBackground(input);
  const bin = atob(bg.base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function latin1FromBytes(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return s;
}

/** Landscape PDF of the official mockup with the member name overlaid. */
export function buildCertificatePdfBase64(input: CertificateArtInput): string {
  const memberName = String(input.memberName || "Side Hustler").trim();
  const bg = resolveBackground(input);
  const pageW = 792;
  const pageH = 612;
  const imgScale = Math.min(pageW / bg.width, pageH / bg.height);
  const imgW = bg.width * imgScale;
  const imgH = bg.height * imgScale;
  const imgX = (pageW - imgW) / 2;
  const imgY = (pageH - imgH) / 2;
  const escapePdf = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const navy = hexToRgb(NAVY).map((n) => n.toFixed(3)).join(" ");
  const nameSize = memberName.length > 28 ? 11 : memberName.length > 22 ? 13 : 15;
  const namePdfX = pageW / 2 - memberName.length * nameSize * 0.22;
  const nameSvgY = bg.height * (414 / 682);
  const namePdfY = imgY + (1 - nameSvgY / bg.height) * imgH;

  const stream = [
    "q",
    `${imgW.toFixed(2)} 0 0 ${imgH.toFixed(2)} ${imgX.toFixed(2)} ${imgY.toFixed(2)} cm`,
    "/Im1 Do",
    "Q",
    "BT",
    `/F3 ${nameSize} Tf`,
    `${navy} rg`,
    `${Math.max(36, namePdfX).toFixed(1)} ${namePdfY.toFixed(1)} Td`,
    `(${escapePdf(memberName.slice(0, 80))}) Tj`,
    "ET",
  ].join("\n");

  const jpeg = jpegBytes(input);
  const jpegAscii = latin1FromBytes(jpeg);

  const objects: string[] = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n");
  objects.push(
    `3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /Font << /F3 5 0 R >> /XObject << /Im1 6 0 R >> >> >>endobj\n`,
  );
  objects.push(`4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream\nendobj\n`);
  objects.push("5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>endobj\n");
  objects.push(
    `6 0 obj<< /Type /XObject /Subtype /Image /Width ${bg.width} /Height ${bg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>stream\n${jpegAscii}\nendstream\nendobj\n`,
  );

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return btoa(latin1FromBytes(Uint8Array.from(pdf, (ch) => ch.charCodeAt(0) & 0xff)));
}
