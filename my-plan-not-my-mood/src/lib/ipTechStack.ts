export const DOC_TECH_STACK_ID = 'doc-tech-stack';

export interface IpTechnology {
  category: string;
  name: string;
  purpose: string;
}

/** Canonical stack printed on the IP Plan (on-screen, Word, and PDF). */
export const IP_TECHNOLOGIES: IpTechnology[] = [
  {
    category: 'Frontend',
    name: 'React 18 + Vite 6 + TypeScript',
    purpose: 'Storefront, mood tool, receipts, and admin console',
  },
  {
    category: 'Styling',
    name: 'Tailwind CSS 3 + Lucide',
    purpose: 'Brand system, responsive layouts, and iconography',
  },
  {
    category: 'Hosting',
    name: 'Cloudflare Pages + DNS / SSL',
    purpose: 'Live site at nonnegotiation.com with edge SSL',
  },
  {
    category: 'Database & Auth',
    name: 'Supabase (PostgreSQL + Auth)',
    purpose: 'Accounts, mood logs, receipts, and order history',
  },
  {
    category: 'Payments',
    name: 'Stripe',
    purpose: 'Cart checkout and membership payments',
  },
  {
    category: 'Fulfillment',
    name: 'Printful / Monster Digital',
    purpose: 'Print-on-demand routing for apparel and planners',
  },
  {
    category: 'Email',
    name: 'Klaviyo / Resend',
    purpose: 'Transactional mail, welcome flows, and plan check-ins',
  },
  {
    category: 'Ads & Social',
    name: 'Meta + TikTok Business Manager',
    purpose: 'Pixels, campaigns, and official channel setup',
  },
  {
    category: 'Analytics',
    name: 'PostHog / Google Analytics 4',
    purpose: 'Mood, cart, challenge, and purchase events',
  },
  {
    category: 'QA',
    name: 'Vitest + Playwright',
    purpose: 'Unit coverage and Testing Portal E2E matrix',
  },
];

export function buildTechStackDocumentHtml(): string {
  const rows = IP_TECHNOLOGIES.map(
    (tech) => `<tr>
      <td class="tech-cat">${tech.category}</td>
      <td class="tech-name">${tech.name}</td>
      <td class="tech-purpose">${tech.purpose}</td>
    </tr>`,
  ).join('');

  return `
    <div class="tech-banner" id="${DOC_TECH_STACK_ID}">
      <div class="kicker">Platform Stack</div>
      <h2 class="plain">Technologies in this Implementation Plan</h2>
      <p class="lede">The build uses this stack across Phase 1 sprints, included architecture, and Phase 2 add-ons.</p>
      <table class="tech-table" width="100%" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th align="left">Layer</th>
            <th align="left">Technology</th>
            <th align="left">Used for</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
