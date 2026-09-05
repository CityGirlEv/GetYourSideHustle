import { CLIENT_DISPLAY_NAME, CLIENT_EMAIL, CLIENT_NAME, CLIENT_ROLE } from './clientIdentity';

export const PLAN_LIVING_DOCUMENT_LINE = 'Living Document — updates as sprints land';
export const PLAN_TECH_PARTNER = "Muntie Ev's AI Agents";
export const PLAN_EXEC_TITLE = 'Executive Summary & Philosophy';
export const PLAN_OVERVIEW_TITLE = 'Overall Description of the Project';
export const PLAN_ORIGIN_TITLE = 'Where the Idea Came From';
export const PLAN_AMOUNT_TITLE = 'How We Got to This Amount';
export const PLAN_PARTNER_TITLE = "Muntie Ev — Background, Experience & Credentials";

export const FLAT_RATE_OFFER_HEADLINE =
  'Munties is prepared to offer Angela a flat-rate $10,000 project.';

export const FLAT_RATE_OFFER_DETAIL =
  'This proposal rewrite emphasizes Gear and Socials in Phase 1. Shirt sales start immediately. Socials are built in parallel — they do not gate the shop. Memberships wait for the next phase — Join stays Coming Soon until then.';

export const HOW_WE_GOT_TO_THIS_AMOUNT =
  'How we got to $10,000: after the August 27 meeting, Angela asked to lean into organic tee-shirt sales rather than a full platform, memberships, and retainers build. The earlier $24,000 plan with a pre-payment discount is archived as Previous Budget. The committed number is a flat $10,000 for the gear launch and organic socials, modeled from Angela’s 6.2K personal Facebook following — no paid ads.';

export const ANGELA_NIECE_ORIGIN = `The idea for MY PLAN, NOT MY MOOD came to Angela Harris through her niece. Watching someone she loves almost let a temporary feeling decide a lasting outcome, Angela named what she has been teaching for years as an empowerment speaker and author: the mood gets a vote, but the plan gets the final decision. That family moment became the brand — feel it, follow the plan anyway.`;

export const MUNTIE_EV_BIO = `Muntie Ev (Evelyn Harris) is the founder of Muntie Ev's AI Studio (muntiesaiagents.com) and the Technical Execution Partner for this build. She holds a Bachelor's in Computer Science and a Master's in Software Engineering, with over 30 years in the field. She brings ideas to life — taking a brand vision from conversation to a working platform people can use, with the pages, tools, and emails already in the plan. She designs and ships production web applications, AI agent systems, and brand platforms — including Get Your Side Hustle, Part B Optimizer, and MY PLAN, NOT MY MOOD. Her credentials are in the work: product architecture, full-stack engineering (React, TypeScript, Vite, Tailwind, Supabase, Cloudflare), QA automation, secure admin portals, and living implementation plans that stay in the client's voice. She leads this engagement as Super Admin / Dev — scope, build, test, and launch.`;

export const DEFAULT_PROPOSAL_TEXT = `MY PLAN, NOT MY MOOD is a premium lifestyle, apparel, personal accountability, and digital productivity brand founded by ${CLIENT_DISPLAY_NAME}, powered by Muntie Ev's AI Studio (muntiesaiagents.com). The brand is built on a foundational human truth: 'Do not let a temporary mood determine a permanent outcome. Feel it. Follow the Plan anyway.'

${ANGELA_NIECE_ORIGIN}`;

export const PROJECT_OVERVIEW_TEXT = `${FLAT_RATE_OFFER_HEADLINE} ${FLAT_RATE_OFFER_DETAIL} Phase 1 is the gear launch — T-shirt design and the first drop (3 shirt styles, 1 hoodie, and 1 hat, with Angela selecting the first 2–3 designs), Shop Gear, the pertinent launch pages, Phase 1 email, and organic socials. Each sprint has an organic-only ROI modeled from Angela’s 6.2K personal Facebook following — no paid ads. Memberships are the next phase; Join shows Coming Soon. Phase 3 (mood tools, planners, Content Factory retainers) stays open. ${HOW_WE_GOT_TO_THIS_AMOUNT} Prepared for ${CLIENT_DISPLAY_NAME} (${CLIENT_ROLE}) with technical execution by ${PLAN_TECH_PARTNER}.`;

export interface PlanRoadmapIntro {
  livingDocument: string;
  preparedFor: string;
  clientRole: string;
  clientName: string;
  clientEmail: string;
  techPartner: string;
  execTitle: string;
  execSummary: string;
  originTitle: string;
  originStory: string;
  amountTitle: string;
  amountStory: string;
  partnerTitle: string;
  partnerBio: string;
}

export function ensureAngelaNieceOrigin(notes: string): string {
  if (/niece/i.test(notes)) return notes;
  return `${notes.trim()}\n\n${ANGELA_NIECE_ORIGIN}`;
}

export function planRoadmapIntro(execSummary = DEFAULT_PROPOSAL_TEXT): PlanRoadmapIntro {
  return {
    livingDocument: PLAN_LIVING_DOCUMENT_LINE,
    preparedFor: CLIENT_DISPLAY_NAME,
    clientRole: CLIENT_ROLE,
    clientName: CLIENT_NAME,
    clientEmail: CLIENT_EMAIL,
    techPartner: PLAN_TECH_PARTNER,
    execTitle: PLAN_EXEC_TITLE,
    execSummary,
    originTitle: PLAN_ORIGIN_TITLE,
    originStory: ANGELA_NIECE_ORIGIN,
    amountTitle: PLAN_AMOUNT_TITLE,
    amountStory: HOW_WE_GOT_TO_THIS_AMOUNT,
    partnerTitle: PLAN_PARTNER_TITLE,
    partnerBio: MUNTIE_EV_BIO,
  };
}
