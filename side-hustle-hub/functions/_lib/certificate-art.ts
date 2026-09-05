/**
 * Fancy, age-group-specific GYSH membership certificates (SVG + PDF).
 */
import { escapeHtml, SITE_NAME, SITE_URL, LOGO_URL } from "./email-brand";

export const CERT_LOGO_SIZE = 180;

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

export function certAudienceKey(raw: string | null | undefined): CertAudienceKey {
  const a = String(raw || "adult")
    .trim()
    .toLowerCase();
  if (a === "kids" || a === "kid") return "kids";
  if (a === "junior" || a === "teen" || a === "teens") return "teens";
  if (a === "senior" || a === "seniors") return "seniors";
  if (a === "adults" || a === "adult") return "adults";
  return "adults";
}

export function certificateThemeFor(audienceRaw: string | null | undefined): CertificateTheme {
  const key = certAudienceKey(audienceRaw);
  if (key === "kids") {
    return {
      key,
      corner: "Kids Side Hustle Corner",
      honor: "Glow Getter",
      title: "You're a Glow Getter!",
      subtitle: "Kids Certificate of Belonging",
      presented: "This sparkly certificate belongs to",
      seal: "GLOW",
      ribbon: "Kids · Glow Getter",
      ink: "#6b2a12",
      accent: "#c4453c",
      gold: "#e3b23c",
      goldDeep: "#c4921c",
      cream: "#fff6d8",
      cream2: "#ffe29a",
      paper: "#fffdf6",
      paper2: "#fff3c8",
    };
  }
  if (key === "teens") {
    return {
      key,
      corner: "Teens Side Hustle Corner",
      honor: "Young CEO",
      title: "Welcome, Young Hustler",
      subtitle: "Teens Certificate of Membership",
      presented: "Presented with respect to",
      seal: "CEO",
      ribbon: "Teens · Young CEO",
      ink: "#14323a",
      accent: "#0f766e",
      gold: "#d4b06a",
      goldDeep: "#b0893a",
      cream: "#f3faf7",
      cream2: "#d7efe6",
      paper: "#f8fffc",
      paper2: "#e5f6ef",
    };
  }
  if (key === "seniors") {
    return {
      key,
      corner: "Seniors Corner",
      honor: "Seniors Corner Member",
      title: "Welcome to Seniors Corner",
      subtitle: "Certificate of Membership",
      presented: "Honoring",
      seal: "WISE",
      ribbon: "Seniors Corner",
      ink: "#3a3228",
      accent: "#6b5344",
      gold: "#c4a35a",
      goldDeep: "#9a7a32",
      cream: "#f7f1e4",
      cream2: "#ead9b4",
      paper: "#fffaf2",
      paper2: "#f3e6c8",
    };
  }
  return {
    key: "adults",
    corner: "Adult Membership",
    honor: "GYSH Family Member",
    title: "Welcome to the GYSH Family",
    subtitle: "Certificate of Membership",
    presented: "Presented with pride to",
    seal: "GYSH",
    ribbon: "Adult Membership",
    ink: "#2d2a26",
    accent: "#9B2F28",
    gold: "#D7C697",
    goldDeep: "#947D64",
    cream: "#fff8e8",
    cream2: "#f3e6c4",
    paper: "#fffdf8",
    paper2: "#f7efe0",
  };
}

export function resolveCertificateHeadings(
  audienceRaw: string | null | undefined,
  template: { title: string; subtitle: string },
): { title: string; subtitle: string } {
  const theme = certificateThemeFor(audienceRaw);
  if (theme.key === "adults") {
    return {
      title: String(template.title || "").trim() || theme.title,
      subtitle: String(template.subtitle || "").trim() || theme.subtitle,
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
};

function formatIssuedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function nameFontSize(name: string): number {
  const n = String(name || "").trim().length;
  if (n > 36) return 26;
  if (n > 28) return 30;
  if (n > 20) return 34;
  return 42;
}

function wrapSvgText(
  text: string,
  x: number,
  y: number,
  maxChars: number,
  fontSize: number,
  fill: string,
): string {
  const words = text.split(/\s+/).filter(Boolean);
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
  return lines
    .slice(0, 6)
    .map(
      (line, i) =>
        `<text x="${x}" y="${y + i * (fontSize + 6)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" fill="${fill}">${line}</text>`,
    )
    .join("\n  ");
}

function cornerFlourish(x: number, y: number, rotate: number, gold: string, accent: string): string {
  return `<g transform="translate(${x} ${y}) rotate(${rotate})">
    <path d="M0 56 L0 0 L56 0" fill="none" stroke="${gold}" stroke-width="2.4" stroke-linecap="square"/>
    <path d="M8 48 L8 8 L48 8" fill="none" stroke="${accent}" stroke-width="1.3"/>
    <circle cx="8" cy="8" r="2.4" fill="${gold}"/>
    <circle cx="28" cy="8" r="1.6" fill="${accent}"/>
    <circle cx="8" cy="28" r="1.6" fill="${accent}"/>
  </g>`;
}

function star(cx: number, cy: number, r: number, fill: string): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + Math.cos(ang) * rad).toFixed(1)},${(cy + Math.sin(ang) * rad).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
}

function laurel(cx: number, cy: number, color: string): string {
  return `<g fill="none" stroke="${color}" stroke-width="1.6">
    <path d="M${cx - 58} ${cy + 10} C${cx - 48} ${cy - 28} ${cx - 18} ${cy - 42} ${cx} ${cy - 44}"/>
    <path d="M${cx + 58} ${cy + 10} C${cx + 48} ${cy - 28} ${cx + 18} ${cy - 42} ${cx} ${cy - 44}"/>
  </g>`;
}

function decorations(theme: CertificateTheme, w: number): string {
  if (theme.key === "kids") {
    return `${star(92, 118, 11, theme.gold)}
  ${star(1008, 118, 11, theme.gold)}
  ${star(120, 700, 8, theme.accent)}
  ${star(980, 700, 8, theme.accent)}
  ${star(70, 400, 7, theme.goldDeep)}
  ${star(1030, 400, 7, theme.goldDeep)}`;
  }
  if (theme.key === "teens") {
    return `<path d="M70 120 L110 120 L90 150 Z" fill="${theme.accent}" opacity="0.85"/>
  <path d="M1030 120 L990 120 L1010 150 Z" fill="${theme.accent}" opacity="0.85"/>
  <path d="M70 660 L110 660 L90 630 Z" fill="${theme.gold}" opacity="0.85"/>
  <path d="M1030 660 L990 660 L1010 630 Z" fill="${theme.gold}" opacity="0.85"/>`;
  }
  return `${laurel(w / 2, 248, theme.goldDeep)}`;
}

/** Landscape SVG certificate — email-friendly and admin-previewable. */
export function buildCertificateSvg(input: CertificateArtInput): string {
  const theme = certificateThemeFor(input.audienceRaw || input.audienceLabel);
  const dateLabel = formatIssuedDate(input.issuedAt);
  const memberName = String(input.memberName || "Side Hustler").trim();
  const w = 1100;
  const h = 780;
  const logo = CERT_LOGO_SIZE;
  const logoX = w / 2 - logo / 2;
  const logoY = 52;
  const tagline = input.footerLine || `${SITE_NAME} · ${SITE_URL}`;
  const nameSize = nameFontSize(memberName);
  const title = input.title || theme.title;
  const subtitle = input.subtitle || theme.subtitle;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(title)} for ${escapeHtml(memberName)}">
  <defs>
    <linearGradient id="paper-${theme.key}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.paper}"/>
      <stop offset="55%" stop-color="${theme.cream}"/>
      <stop offset="100%" stop-color="${theme.paper2}"/>
    </linearGradient>
    <linearGradient id="bar-${theme.key}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="50%" stop-color="${theme.gold}"/>
      <stop offset="100%" stop-color="${theme.accent}"/>
    </linearGradient>
    <linearGradient id="foil-${theme.key}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.gold}"/>
      <stop offset="100%" stop-color="${theme.goldDeep}"/>
    </linearGradient>
    <radialGradient id="medallion-${theme.key}" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${theme.cream2}"/>
      <stop offset="100%" stop-color="${theme.gold}"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#paper-${theme.key})"/>
  <rect x="18" y="18" width="${w - 36}" height="${h - 36}" fill="none" stroke="${theme.goldDeep}" stroke-width="10" rx="10"/>
  <rect x="32" y="32" width="${w - 64}" height="${h - 64}" fill="none" stroke="${theme.accent}" stroke-width="2.5" rx="6"/>
  <rect x="42" y="42" width="${w - 84}" height="${h - 84}" fill="none" stroke="${theme.gold}" stroke-width="1.5" rx="4"/>
  ${cornerFlourish(54, 54, 0, theme.gold, theme.accent)}
  ${cornerFlourish(w - 54, 54, 90, theme.gold, theme.accent)}
  ${cornerFlourish(54, h - 54, 270, theme.gold, theme.accent)}
  ${cornerFlourish(w - 54, h - 54, 180, theme.gold, theme.accent)}
  <rect x="42" y="42" width="${w - 84}" height="36" fill="url(#bar-${theme.key})"/>
  <text x="${w / 2}" y="66" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="15" fill="#fffdf8" letter-spacing="3.2" font-weight="700">${escapeHtml(theme.ribbon.toUpperCase())}</text>
  ${decorations(theme, w)}
  <circle cx="${w / 2}" cy="${logoY + logo / 2}" r="${logo / 2 + 16}" fill="url(#medallion-${theme.key})" stroke="${theme.goldDeep}" stroke-width="3"/>
  <circle cx="${w / 2}" cy="${logoY + logo / 2}" r="${logo / 2 + 8}" fill="none" stroke="${theme.accent}" stroke-width="1.25"/>
  <text x="${w / 2}" y="${logoY + logo / 2 + 8}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" fill="${theme.accent}" font-weight="800">GYSH</text>
  <image href="${LOGO_URL}" x="${logoX}" y="${logoY}" width="${logo}" height="${logo}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${w / 2}" y="268" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="14" fill="${theme.accent}" letter-spacing="3.6" font-weight="700">${escapeHtml(subtitle.toUpperCase())}</text>
  <text x="${w / 2}" y="308" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="${theme.ink}" font-weight="800">${escapeHtml(title)}</text>
  <text x="${w / 2}" y="338" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="15" fill="${theme.goldDeep}" font-style="italic">${escapeHtml(theme.presented)}</text>
  <text x="${w / 2}" y="388" text-anchor="middle" font-family="Georgia, 'Palatino Linotype', 'Times New Roman', serif" font-size="${nameSize}" fill="${theme.accent}" font-weight="800">${escapeHtml(memberName)}</text>
  <line x1="250" y1="404" x2="850" y2="404" stroke="${theme.gold}" stroke-width="2"/>
  <circle cx="550" cy="404" r="4" fill="${theme.accent}"/>
  ${wrapSvgText(escapeHtml(input.bodyText), w / 2, 436, 70, 15, theme.ink)}
  <g>
    <circle cx="168" cy="618" r="46" fill="url(#foil-${theme.key})" opacity="0.95"/>
    <circle cx="168" cy="618" r="39" fill="none" stroke="${theme.paper}" stroke-width="1.5"/>
    <text x="168" y="612" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="12" fill="#fffdf8" font-weight="700">GYSH</text>
    <text x="168" y="630" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#fffdf8">${escapeHtml(input.tierLabel)}</text>
  </g>
  <g>
    <circle cx="932" cy="618" r="46" fill="${theme.accent}"/>
    <circle cx="932" cy="618" r="39" fill="none" stroke="${theme.gold}" stroke-width="1.5"/>
    <text x="932" y="612" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="11" fill="#fffdf8" font-weight="700">${escapeHtml(theme.seal)}</text>
    <text x="932" y="630" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#fffdf8">${escapeHtml(input.audienceLabel)}</text>
  </g>
  <text x="${w / 2}" y="600" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="${theme.ink}" font-weight="700">${escapeHtml(input.tierLabel)} Member · ${escapeHtml(theme.corner)} · ${escapeHtml(dateLabel)}</text>
  <text x="${w / 2}" y="632" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" fill="${theme.ink}" font-weight="700">${escapeHtml(input.signoff)}</text>
  <text x="${w / 2}" y="662" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="12" fill="${theme.goldDeep}">${escapeHtml(theme.honor)} · ${escapeHtml(tagline)}</text>
  <text x="${w / 2}" y="700" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="${theme.accent}" font-weight="700">${escapeHtml(SITE_URL)}</text>
</svg>`;
}

function wrapPlain(text: string, maxChars: number, maxLines = 5): string[] {
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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16) / 255,
    Number.parseInt(h.slice(2, 4), 16) / 255,
    Number.parseInt(h.slice(4, 6), 16) / 255,
  ];
}

/** Landscape PDF with framed paper, gold bar, and Times name. */
export function buildCertificatePdfBase64(input: CertificateArtInput): string {
  const theme = certificateThemeFor(input.audienceRaw || input.audienceLabel);
  const dateLabel = formatIssuedDate(input.issuedAt);
  const memberName = String(input.memberName || "Side Hustler").trim();
  const title = input.title || theme.title;
  const subtitle = (input.subtitle || theme.subtitle).toUpperCase();
  const pageW = 792;
  const pageH = 612;
  const escapePdf = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const rgb = (hex: string) => hexToRgb(hex).map((n) => n.toFixed(3)).join(" ");
  const paper = rgb(theme.paper);
  const accent = rgb(theme.accent);
  const gold = rgb(theme.goldDeep);
  const ink = rgb(theme.ink);

  const content: string[] = [];
  content.push(`${paper} rg 0 0 ${pageW} ${pageH} re f`);
  content.push(`${gold} RG 8 w 24 24 744 564 re S`);
  content.push(`${accent} RG 2 w 36 36 720 540 re S`);
  content.push(`${gold} RG 1 w 46 46 700 520 re S`);
  content.push(`${accent} rg 46 542 700 24 re f`);

  const center = (text: string, y: number, size: number, font: "F1" | "F2" | "F3", color: string) => {
    const approx = Math.max(36, (pageW - text.length * size * 0.46) / 2);
    content.push("BT");
    content.push(`/${font} ${size} Tf`);
    content.push(`${color} rg`);
    content.push(`${approx.toFixed(1)} ${y} Td`);
    content.push(`(${escapePdf(text.slice(0, 220))}) Tj`);
    content.push("ET");
  };

  center(theme.ribbon.toUpperCase(), 550, 10, "F2", "1 0.99 0.97");
  center(subtitle, 500, 11, "F2", accent);
  center(title, 470, 20, "F3", ink);
  center(theme.presented, 444, 11, "F2", gold);
  center(memberName, 408, memberName.length > 24 ? 18 : 22, "F3", accent);
  content.push(`${gold} RG 1.5 w 180 392 432 0 m S`);
  let y = 368;
  for (const line of wrapPlain(input.bodyText, 88, 5)) {
    center(line, y, 10, "F2", ink);
    y -= 16;
  }
  center(`${input.tierLabel} Member · ${theme.corner} · ${dateLabel}`, 268, 11, "F1", ink);
  center(input.signoff, 242, 13, "F3", ink);
  center(`${theme.honor} · ${input.footerLine || SITE_NAME}`, 218, 9, "F2", gold);
  center(SITE_URL, 192, 12, "F1", accent);

  const stream = content.join("\n");
  const objects: string[] = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n");
  objects.push(
    `3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>endobj\n`,
  );
  objects.push(`4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream\nendobj\n`);
  objects.push("5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n");
  objects.push("6 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>endobj\n");
  objects.push("7 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>endobj\n");

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

  const bytes = new TextEncoder().encode(pdf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
