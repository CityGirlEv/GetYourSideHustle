/** Helpers for agenda invite rich-text (HTML) email bodies. */

export function looksLikeHtml(raw: string): boolean {
  return /<\/?(?:p|div|br|b|strong|i|em|u|span|font|ul|ol|li|a|h[1-6])\b/i.test(String(raw || ""));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unescapeBasicHtmlEntities(s: string): string {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

const LINK_STYLE =
  "color:#9B2F28;font-weight:700;text-decoration:underline;word-break:break-all;";

/** Turn bare http(s) URLs into clickable anchors (text may already be HTML-escaped). */
export function linkifyBareUrls(text: string): string {
  return String(text || "").replace(/(https?:\/\/[^\s<]+)/gi, (raw) => {
    let url = raw;
    let trailing = "";
    while (url.length > 0) {
      const last = url.slice(-1);
      if (/[.,;:!?]$/.test(last)) {
        trailing = last + trailing;
        url = url.slice(0, -1);
        continue;
      }
      if (last === ")") {
        const opens = (url.match(/\(/g) || []).length;
        const closes = (url.match(/\)/g) || []).length;
        if (closes > opens) {
          trailing = ")" + trailing;
          url = url.slice(0, -1);
          continue;
        }
      }
      break;
    }
    if (!/^https?:\/\//i.test(url)) return raw;
    const href = escapeHtml(unescapeBasicHtmlEntities(url));
    // No target="_blank" here — Chrome blocks that as a popup inside our Admin modal
    // (about:blank#blocked). href alone is enough for real email clients.
    return `<a href="${href}" contenteditable="false" style="${LINK_STYLE}">${url}</a>${trailing}`;
  });
}

/** Linkify URLs in HTML without modifying existing <a>…</a> blocks. */
export function linkifyEmailHtml(html: string): string {
  const parts = String(html || "").split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi);
  return parts
    .map((part) => {
      if (!/^<a\b/i.test(part)) return linkifyBareUrls(part);
      // Drop target=_blank (Chrome popup-blocks it in our Admin dialog) and keep href.
      let next = part
        .replace(/\s*target\s*=\s*(["']).*?\1/gi, "")
        .replace(/\s*rel\s*=\s*(["']).*?\1/gi, "");
      if (!/contenteditable=/i.test(next)) {
        next = next.replace(/^<a\b/i, '<a contenteditable="false"');
      }
      return next;
    })
    .join("");
}

/** Plain draft → paragraph HTML with clickable links. */
export function plainTextToEditorHtml(text: string): string {
  const blocks = String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return "<p><br></p>";
  return blocks
    .map((block) => {
      const withBreaks = linkifyBareUrls(escapeHtml(block).replace(/\n/g, "<br>"));
      return `<p>${withBreaks}</p>`;
    })
    .join("");
}

/** Load saved draft into the editor (always linkify bare URLs). */
export function toEditorHtml(raw: string): string {
  const s = String(raw || "").trim();
  if (!s) return "<p><br></p>";
  if (looksLikeHtml(s)) return linkifyEmailHtml(s);
  return plainTextToEditorHtml(s);
}

export function htmlToPlainText(html: string): string {
  return String(html || "")
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isEmptyEmailHtml(html: string): boolean {
  return !htmlToPlainText(html);
}

/** Unique http(s) URLs from HTML and/or plain text (for preview “open link” lists). */
export function extractHttpUrls(htmlOrText: string): string[] {
  const raw = String(htmlOrText || "");
  const found: string[] = [];
  for (const m of raw.matchAll(/\bhref\s*=\s*["'](https?:\/\/[^"']+)["']/gi)) {
    found.push(unescapeBasicHtmlEntities(m[1] || ""));
  }
  const plain = htmlToPlainText(raw);
  for (const m of plain.matchAll(/https?:\/\/[^\s<]+/gi)) {
    found.push(m[0] || "");
  }
  const cleaned = found
    .map((u) => u.replace(/[.,;:!?)]+$/g, "").trim())
    .filter((u) => /^https?:\/\//i.test(u));
  return [...new Set(cleaned)];
}

/**
 * Preview HTML for the modal: turn <a href> into spans with data-href so we can
 * navigate same-tab via click handler (Chrome blocks target=_blank in this dialog).
 */
export function htmlForVisualEmailPreview(html: string): string {
  return linkifyEmailHtml(html)
    .replace(/<a\b([^>]*)>/gi, (_full, attrs: string) => {
      const m = /\bhref\s*=\s*["']([^"']+)["']/i.exec(String(attrs || ""));
      const href = m ? escapeHtml(unescapeBasicHtmlEntities(m[1] || "")) : "";
      return `<span class="agenda-email-preview-linkish" data-href="${href}" role="link" tabindex="0" style="${LINK_STYLE};cursor:pointer">`;
    })
    .replace(/<\/a>/gi, "</span>");
}
