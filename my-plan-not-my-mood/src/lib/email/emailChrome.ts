export const EMAIL_SITE_URL = 'https://nonnegotiation.com';
export const EMAIL_SITE_LABEL = 'nonnegotiation.com';
export const EMAIL_BRAND = 'MY PLAN, NOT MY MOOD';
export const EMAIL_TAGLINE = 'Feel it. Follow the Plan anyway.';
export const EMAIL_FOOTER_COPY =
  'Do not let a temporary mood determine a permanent outcome. MY PLAN, NOT MY MOOD is a brand under NonNegotiation — founded by Angela.';
export const EMAIL_POWERED_BY = "Powered by Muntie Ev's AI Studio";

export function emailLogoUrl(siteUrl = EMAIL_SITE_URL): string {
  return `${siteUrl.replace(/\/$/, '')}/images/official_logo_seal.png`;
}

export function hasEmailChrome(html: string): boolean {
  return /data-email-chrome=["']myplan["']/.test(html);
}

export function wrapEmailHtml(innerHtml: string, siteUrl = EMAIL_SITE_URL): string {
  if (hasEmailChrome(innerHtml)) return innerHtml;
  const site = siteUrl.replace(/\/$/, '') || EMAIL_SITE_URL;
  const logo = emailLogoUrl(site);
  return `
<table data-email-chrome="myplan" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;margin:0;padding:24px 12px;font-family:Inter,Arial,sans-serif;color:#1F1917;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:2px solid #1F1917;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#FFEDD5;border-bottom:3px solid #C2410C;padding:20px 24px;text-align:center;">
            <img src="${logo}" alt="${EMAIL_BRAND} logo" width="88" height="88" style="display:block;margin:0 auto 10px auto;border:0;" />
            <div style="font-size:20px;font-weight:900;letter-spacing:-0.4px;text-transform:uppercase;">
              MY PLAN, <span style="color:#C2410C;font-style:italic;">NOT MY MOOD</span>
            </div>
            <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#3F3832;margin-top:6px;">Accountability Protocol</div>
            <a href="${site}" style="display:inline-block;margin-top:10px;color:#C2410C;font-weight:800;font-size:13px;text-decoration:none;">${EMAIL_SITE_LABEL}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            ${innerHtml}
          </td>
        </tr>
        <tr>
          <td style="background:#FAF8F5;border-top:2px solid #E5DFD3;padding:18px 24px;text-align:center;">
            <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;color:#C2410C;">${EMAIL_TAGLINE}</p>
            <p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:#3F3832;">${EMAIL_FOOTER_COPY}</p>
            <p style="margin:0 0 6px 0;font-size:12px;">
              <a href="${site}" style="color:#C2410C;font-weight:800;text-decoration:none;">${site}</a>
            </p>
            <p style="margin:0;font-size:11px;color:#3F3832;">${EMAIL_POWERED_BY}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  `.trim();
}
