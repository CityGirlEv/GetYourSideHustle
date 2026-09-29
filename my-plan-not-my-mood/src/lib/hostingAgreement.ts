import { CLIENT_EMAIL, CLIENT_NAME, CLIENT_ROLE } from './clientIdentity';
import {
  EMAIL_FOOTER_COPY,
  EMAIL_POWERED_BY,
  EMAIL_SITE_LABEL,
  EMAIL_SITE_URL,
  EMAIL_TAGLINE,
} from './email/emailChrome';
import {
  COMPLIMENTARY_WORK,
  complimentaryRetailTotal,
  formatUsdAmount,
  type ComplimentaryWorkItem,
} from './gearSalesPlan';
import { GEAR_SALES_SPLIT_NOTE } from './gearSalesSplit';

export const HOSTING_AGREEMENT_PATH = '/admin/plan';
export const HOSTING_AGREEMENT_DOM_ID = 'ip-hosting-agreement';
export const HOSTING_AGREEMENT_TITLE = 'Phase 1 Merchandise Hosting Agreement';

export const HOST_NAME = 'Evelyn Irving';
export const HOST_STUDIO = "Muntie Ev's AI Studio";
export const HOST_ROLE = 'Host / Technical Execution Partner';
export const HOSTED_STOREFRONT = 'nonnegotiation.com';
export const ORDER_OPS_SITE = 'SnatchVault.com';
export const ORDER_OPS_STORE_URL = 'https://snatchvault.com/collections/my-plan-gear';
export const ORDER_OPS_MENU = 'Non-Negotiable';
export const ORDER_OPS_SUBMENUS = 'Tees, Hoodies, Hats';
export const BRAND_NAME = 'MY PLAN, NOT MY MOOD';

export const HOSTING_TERM_LABEL = 'Phase 1 (Aug 24 – Sep 27, 2026) plus the 90-day data window';
export const HOSTING_NOTICE_DAYS = 14;

export interface HostingParty {
  side: 'host' | 'brand';
  name: string;
  studio?: string;
  role: string;
  email?: string;
}

export interface HostingClause {
  id: string;
  heading: string;
  body: string;
}

export const HOSTING_PARTIES: HostingParty[] = [
  {
    side: 'host',
    name: HOST_NAME,
    studio: HOST_STUDIO,
    role: HOST_ROLE,
  },
  {
    side: 'brand',
    name: CLIENT_NAME,
    studio: BRAND_NAME,
    role: `${CLIENT_ROLE} / Brand Owner`,
    email: CLIENT_EMAIL,
  },
];

export const HOSTING_CLAUSES: HostingClause[] = [
  {
    id: 'purpose',
    heading: '1. Purpose',
    body: `This agreement lets ${HOST_NAME} host ${CLIENT_NAME}’s first gear drop — tees, hoodie, and hat — on SnatchVault (${ORDER_OPS_STORE_URL}) while ${CLIENT_NAME} keeps the brand, artwork, and merchandise. Shoppers open ${ORDER_OPS_MENU} on the SnatchVault home page, then ${ORDER_OPS_SUBMENUS}. The brand site (${HOSTED_STOREFRONT}) still presents the drop. It covers Phase 1 only. Gear sales split 70/30 as written here. A change to that split is a separate written addendum.`,
  },
  {
    id: 'hosted-property',
    heading: '2. What is hosted',
    body: `Orders and checkout for Angela’s drop are hosted on SnatchVault at ${ORDER_OPS_STORE_URL} (SnatchVault’s domain, not Angela’s). The SnatchVault home menu is ${ORDER_OPS_MENU}, with submenus for ${ORDER_OPS_SUBMENUS}. Product mockups and launch pages also live on ${HOSTED_STOREFRONT}. The Host operates the storefront for Phase 1; Angela owns the goods.`,
  },
  {
    id: 'term',
    heading: '3. Term',
    body: `The hosting term is ${HOSTING_TERM_LABEL}. Either party may end hosting after Phase 1 with ${HOSTING_NOTICE_DAYS} days’ written notice. Ending hosting does not cancel the $10,000 Phase 1 build fee already scoped.`,
  },
  {
    id: 'host-provides',
    heading: '4. Host provides',
    body: `Storefront hosting, SSL, catalog and checkout for the first drop, Gear Selections mockup uploads, and Phase 1 store operation. Logo design, apparel mockups, and 4 marketing videos are complimentary work (see Fees). The Host does not manufacture, ship, or insure the physical shirts.`,
  },
  {
    id: 'brand-provides',
    heading: '5. Brand owner provides',
    body: `Final design picks (up to 3 tees, 1 hoodie, 1 hat), print-ready art where needed, product copy, and decisions on price and sizes. Angela is responsible for blanks, print, shipping cost, returns, and customer product issues.`,
  },
  {
    id: 'fees',
    heading: '6. Fees',
    body: `The brand logo, apparel mockup set, and 4 marketing videos are complimentary — charged $0 — and are not part of the $10,000 sprint budget. Phase 1 hosting is not a separate invoice: Evelyn’s 30% of gear sales covers hosting, processing sales, administrative fees, and application fees. Each complimentary line shows the retail price if the Host were selling that work separately. The $10,000 still covers the five paid sprints only.`,
  },
  {
    id: 'merch-orders',
    heading: '7. Merchandise and orders',
    body: `${GEAR_SALES_SPLIT_NOTE} Returns, reprints, and chargebacks sit with the Brand Owner. The Host may pause a listing that breaks the site, law, or the brand line.`,
  },
  {
    id: 'ip',
    heading: '8. Intellectual property',
    body: `${CLIENT_NAME} owns ${BRAND_NAME} names, slogans, and garment artwork. ${HOST_NAME} / ${HOST_STUDIO} owns the website code, admin studio, and hosting platform. Complimentary logo, mockup files, and marketing videos are licensed to Angela for ${BRAND_NAME} merch and marketing; the Host may keep copies for the storefront and archive.`,
  },
  {
    id: 'data',
    heading: '9. Data',
    body: `The storefront stays de-identified at the scenario layer (year of birth and ZIP3 only). Scenario data decays after 90 days. Order records needed for fulfillment live with the shop / ${ORDER_OPS_STORE_URL} and follow that store’s rules, not this site’s 90-day scenario window.`,
  },
  {
    id: 'ending',
    heading: '10. Ending or moving the shop',
    body: `After Phase 1, Angela may move merch to her own storefront. The Host will export product copy and mockups Angela already has in Gear Selections / Asset Library. Domain, codebase, and admin studio stay with the Host unless a later agreement says otherwise.`,
  },
  {
    id: 'acceptance',
    heading: '11. Acceptance',
    body: `This is the working Phase 1 hosting agreement on the Implementation Plan. Angela reviews it (task t-34). Evelyn keeps it current (task t-33). Signing or written “agreed” in the kickoff notes is enough to run Phase 1. Outside counsel can replace this if the parties later change the 70/30 sales split or paid hosting.`,
  },
];

export function hostingFeeSchedule(
  items: ComplimentaryWorkItem[] = COMPLIMENTARY_WORK,
): ComplimentaryWorkItem[] {
  return items.filter((item) => item.complimentary);
}

export function hostingRetailTotal(
  items: ComplimentaryWorkItem[] = COMPLIMENTARY_WORK,
): number {
  return complimentaryRetailTotal(items);
}

export function hostingAgreementSearchBlob(): string {
  return [
    HOSTING_AGREEMENT_TITLE,
    HOST_NAME,
    HOST_STUDIO,
    CLIENT_NAME,
    BRAND_NAME,
    HOSTED_STOREFRONT,
    ORDER_OPS_SITE,
    ORDER_OPS_STORE_URL,
    GEAR_SALES_SPLIT_NOTE,
    ...HOSTING_CLAUSES.map((clause) => `${clause.heading} ${clause.body}`),
    ...hostingFeeSchedule().map((item) => `${item.name} ${item.retailAmount}`),
  ]
    .join(' ')
    .toLowerCase();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function hostingAgreementFileSlug(): string {
  return 'phase-1-merchandise-hosting-agreement';
}

export function hostingAgreementLogoUrl(origin = EMAIL_SITE_URL): string {
  return `${origin.replace(/\/$/, '')}/images/official_logo_seal.png`;
}

export function buildHostingAgreementDocumentHtml(origin = EMAIL_SITE_URL): string {
  const logoUrl = hostingAgreementLogoUrl(origin);
  const siteUrl = origin.replace(/\/$/, '') || EMAIL_SITE_URL;
  const fees = hostingFeeSchedule()
    .map(
      (item) => `<tr>
        <td style="border:1px solid #FED7AA;padding:10px;font-weight:800;">${escapeHtml(item.name)}</td>
        <td style="border:1px solid #FED7AA;padding:10px;">${escapeHtml(item.sprintLabel)}</td>
        <td style="border:1px solid #FED7AA;padding:10px;text-align:right;font-weight:900;">${formatUsdAmount(item.retailAmount)}</td>
        <td style="border:1px solid #FED7AA;padding:10px;text-align:right;font-weight:900;color:#C2410C;">$0</td>
      </tr>`,
    )
    .join('');
  const parties = HOSTING_PARTIES.map(
    (party) => `<p style="margin:0 0 8px;"><strong>${escapeHtml(party.role)}.</strong> ${escapeHtml(party.name)}${
      party.studio ? ` · ${escapeHtml(party.studio)}` : ''
    }${party.email ? ` · ${escapeHtml(party.email)}` : ''}</p>`,
  ).join('');
  const clauses = HOSTING_CLAUSES.map(
    (clause) => `<section style="margin:0 0 16px;">
      <h2 style="margin:0 0 6px;font-size:15px;color:#9A3412;">${escapeHtml(clause.heading)}</h2>
      <p style="margin:0;font-size:13px;line-height:1.55;color:#3F3832;">${escapeHtml(clause.body)}</p>
    </section>`,
  ).join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(HOSTING_AGREEMENT_TITLE)}</title>
    <style>
      @page { margin: 0.65in; }
      body { font-family:'Segoe UI',Arial,sans-serif;color:#1F1917;background:#FAF8F5;padding:24px;margin:0;line-height:1.45; }
      @media print { body { background:#fff;padding:0; } }
    </style>
  </head>
  <body>
    <table data-hosting-chrome="header" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border:3px solid #EA580C;border-radius:16px;margin-bottom:20px;border-collapse:separate;">
      <tr>
        <td style="width:118px;padding:16px 10px 16px 18px;vertical-align:middle;">
          <img src="${escapeHtml(logoUrl)}" alt="MY PLAN, NOT MY MOOD Logo Seal" height="96" style="height:96px;width:auto;display:block;border:0;" />
        </td>
        <td style="padding:16px 20px 16px 6px;vertical-align:middle;">
          <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#EA580C;">Hosting Agreement</div>
          <div style="font-size:22px;font-weight:900;letter-spacing:-0.4px;text-transform:uppercase;color:#9A3412;">${escapeHtml(HOSTING_AGREEMENT_TITLE)}</div>
          <div style="margin-top:8px;"><a href="${escapeHtml(siteUrl)}" style="color:#C2410C;font-weight:800;font-size:12px;text-decoration:none;">${EMAIL_SITE_LABEL}</a></div>
        </td>
      </tr>
    </table>
    <div style="background:#FFF7ED;border:2px solid #FDBA74;border-radius:16px;padding:16px 20px;margin-bottom:18px;">
      <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#EA580C;">Parties</div>
      ${parties}
    </div>
    ${clauses}
    <h2 style="margin:8px 0 8px;font-size:15px;color:#9A3412;">Complimentary work — retail if sold, charged $0</h2>
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#fff;margin-bottom:18px;">
      <tr>
        <th style="background:#EA580C;color:#fff;padding:10px;text-align:left;">Item</th>
        <th style="background:#EA580C;color:#fff;padding:10px;text-align:left;">Sprint</th>
        <th style="background:#EA580C;color:#fff;padding:10px;text-align:right;">Retail if sold</th>
        <th style="background:#EA580C;color:#fff;padding:10px;text-align:right;">Charged</th>
      </tr>
      ${fees}
      <tr>
        <td colspan="2" style="border:1px solid #FED7AA;padding:10px;font-weight:900;">Complimentary total</td>
        <td style="border:1px solid #FED7AA;padding:10px;text-align:right;font-weight:900;">${formatUsdAmount(hostingRetailTotal())}</td>
        <td style="border:1px solid #FED7AA;padding:10px;text-align:right;font-weight:900;color:#C2410C;">$0</td>
      </tr>
    </table>
    <p style="font-size:12px;color:#3F3832;">The $10,000 Phase 1 budget is unchanged. Complimentary retail is shown so the gift is visible.</p>
    <table data-hosting-chrome="footer" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;border-top:2px solid #EA580C;border-collapse:collapse;">
      <tr>
        <td style="padding:16px 8px 0;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#C2410C;">${EMAIL_TAGLINE}</p>
          <p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:#3F3832;">${EMAIL_FOOTER_COPY}</p>
          <p style="margin:0 0 6px;font-size:12px;"><a href="${escapeHtml(siteUrl)}" style="color:#C2410C;font-weight:800;text-decoration:none;">${EMAIL_SITE_LABEL}</a></p>
          <p style="margin:0;font-size:11px;color:#3F3832;">${EMAIL_POWERED_BY}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function hasHostingAgreementChrome(html: string): boolean {
  return (
    /data-hosting-chrome=["']header["']/.test(html) &&
    /data-hosting-chrome=["']footer["']/.test(html) &&
    html.includes(HOSTING_AGREEMENT_TITLE) &&
    html.includes(HOST_NAME) &&
    html.includes(CLIENT_NAME) &&
    html.includes(HOSTED_STOREFRONT)
  );
}

export function buildHostingAgreementPlanHtml(): string {
  const fees = hostingFeeSchedule()
    .map(
      (item) => `<li><strong>${escapeHtml(item.name)}</strong> — retail ${formatUsdAmount(item.retailAmount)}, charged $0 (${escapeHtml(item.sprintLabel)})</li>`,
    )
    .join('');
  const clauses = HOSTING_CLAUSES.map(
    (clause) => `<h3 class="subphase-head">${escapeHtml(clause.heading)}</h3><p class="lede">${escapeHtml(clause.body)}</p>`,
  ).join('');
  return `<div class="overview-box" id="doc-hosting-agreement">
    <div class="kicker">Hosting Agreement</div>
    <h2 class="plain">${escapeHtml(HOSTING_AGREEMENT_TITLE)}</h2>
    <p class="lede">${HOST_NAME} (${HOST_STUDIO}) hosts ${CLIENT_NAME}’s shirts on SnatchVault (${ORDER_OPS_STORE_URL}). Home menu: ${ORDER_OPS_MENU}; submenus: ${ORDER_OPS_SUBMENUS}. ${GEAR_SALES_SPLIT_NOTE} Logo, mockups, and 4 marketing videos are complimentary. Retail if sold: ${formatUsdAmount(hostingRetailTotal())}. Charged: $0. The $10,000 sprint budget does not include these lines.</p>
    <ul class="deliverable-list">${fees}</ul>
    ${clauses}
  </div>`;
}
