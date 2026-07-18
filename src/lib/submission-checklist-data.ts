/** Facebook + CMS submission checklist for the Part B Optimizer Benchmark Tool. */

import { channelForItem, type ChecklistChannelId } from "@/lib/submission-checklist-channels";

export type { ChecklistChannelId };
export {
  CHECKLIST_CHANNEL_LABELS,
  CHECKLIST_CHANNEL_SHORT,
  channelForItem,
  channelsForItem,
} from "@/lib/submission-checklist-channels";

export const SUBMISSION_CHECKLIST_ID = "pbo-submission-checklist-v4";

/** Schedule anchor — Jul 3, 2026. Evelyn starts Jul 4; Catria reviews from Jul 5. */
export const EVELYN_SCHEDULE_START = "2026-07-04";
/** @deprecated Use {@link EVELYN_SCHEDULE_START}. */
export const EVELY_SCHEDULE_START = EVELYN_SCHEDULE_START;
export const CATRIA_SCHEDULE_START = "2026-07-05";

export function addScheduleDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type ChecklistOwner = "prep" | "review" | "both";

export type AssigneeFilter = "all" | ChecklistOwner;

export type SubmissionTaskAssignee = ChecklistOwner;

/** Per-item Catria sub-task toggles — admin can drop Review or Approve independently. */
export type CatriaTaskFlags = {
  review: boolean;
  approve: boolean;
};

export const DEFAULT_CATRIA_TASK_FLAGS: CatriaTaskFlags = { review: true, approve: true };

export interface SubmissionChecklistItem {
  id: string;
  title: string;
  description: string;
  owner: ChecklistOwner;
  channel: ChecklistChannelId;
  prepDueDate?: string;
  reviewDueDate: string;
  /** Pre-checked when verified against the live site or codebase (Jul 2026 review). */
  siteVerified?: boolean;
  verificationNote?: string;
  /** Related CMS requirement ids — link to Reference tab anchors. */
  cmsRequirementIds?: string[];
  /** When false, Evelyn prep alone completes the item (internal Meta/FB ops). */
  requiresCatriaApproval?: boolean;
}

export interface SubmissionChecklistSection {
  id: string;
  title: string;
  subtitle: string;
  items: SubmissionChecklistItem[];
}

export const PREP_OWNER_LABEL = "Evelyn";
export const REVIEW_OWNER_LABEL = "Catria";

/** Checklist owner tabs — Evelyn vs Catria workspaces. */
export const PREP_OWNER_TAB_LABEL = "Ev's List";
export const REVIEW_OWNER_TAB_LABEL = "Catria's List";

/** Assignee filter pills — friendly labels on every task/result list. */
export const PREP_OWNER_FILTER_LABEL = "My Name";
export const REVIEW_OWNER_FILTER_LABEL = "Her Name";

export const ASSIGNEE_FILTER_OPTIONS: { id: AssigneeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "prep", label: PREP_OWNER_FILTER_LABEL },
  { id: "review", label: REVIEW_OWNER_FILTER_LABEL },
];

/** Reassignable checklist owners — maps to Evelyn / Catria / both labels. */
export const CHECKLIST_ASSIGNEE_OPTIONS: { id: ChecklistOwner; label: string }[] = [
  { id: "prep", label: PREP_OWNER_LABEL },
  { id: "review", label: REVIEW_OWNER_LABEL },
  { id: "both", label: "Both" },
];

export const BOTH_ASSIGNEE_LABEL = "Both";

export const CHECKLIST_OWNER_TABS: { id: AssigneeFilter | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "prep", label: PREP_OWNER_TAB_LABEL },
  { id: "review", label: REVIEW_OWNER_TAB_LABEL },
];

export interface SubmissionTaskItem {
  id: string;
  title: string;
  description: string;
  assignee: SubmissionTaskAssignee;
  /** ISO date (YYYY-MM-DD) — target submit-by date. */
  dueDate: string;
  /** Catria must approve after prep/submission. */
  reviewDueDate: string;
  /** Where this is submitted (Meta, CMS sponsor, internal sign-off, etc.). */
  submissionTarget: string;
  relatedChecklistIds?: string[];
  channel: ChecklistChannelId;
  /** When false, Evelyn submission alone completes the task (internal ops). */
  requiresCatriaApproval?: boolean;
}

type RawChecklistItem = Omit<
  SubmissionChecklistItem,
  "channel" | "reviewDueDate" | "cmsRequirementIds" | "requiresCatriaApproval"
> & {
  channel?: ChecklistChannelId;
  reviewDueDate?: string;
  prepDueDate?: string;
  cmsRequirementIds?: string[];
  requiresCatriaApproval?: boolean;
};

type RawSection = {
  id: string;
  title: string;
  subtitle: string;
  items: RawChecklistItem[];
};

type RawTask = Omit<SubmissionTaskItem, "channel" | "reviewDueDate" | "requiresCatriaApproval"> & {
  channel?: ChecklistChannelId;
  reviewDueDate?: string;
  requiresCatriaApproval?: boolean;
};

/** CMS requirement cross-links for checklist items (Reference tab anchors). */
const CHECKLIST_CMS_REQUIREMENT_MAP: Record<string, string[]> = {
  "fb-landing-url": ["educational-positioning"],
  "fb-ad-copy-draft": ["tpmo-disclaimer", "mpd"],
  "fb-creative-assets": ["no-misleading-enrollment"],
  "fb-lead-forms": ["recordkeeping"],
  "fb-privacy-policy": ["recordkeeping"],
  "fb-page-branding": ["no-misleading-enrollment", "educational-positioning"],
  "fb-copy-review": ["tpmo-disclaimer", "mpd", "educational-positioning"],
  "fb-creative-review": ["no-misleading-enrollment", "educational-positioning"],
  "fb-meta-submission": ["smid", "tpmo-sponsor-approval"],
  "cms-tpmo-disclaimer": ["tpmo-disclaimer"],
  "cms-mpd-disclaimer": ["mpd"],
  "cms-government-affiliation": ["no-misleading-enrollment"],
  "cms-educational-only": ["educational-positioning"],
  "cms-benchmark-disclaimers": ["educational-positioning"],
  "cms-lead-consent": ["recordkeeping"],
  "cms-smid": ["smid", "tpmo-sponsor-approval"],
  "cms-soa": ["soa"],
  "cms-privacy-legal": ["recordkeeping"],
  "cms-lead-audit": ["recordkeeping"],
  "cms-copy-audit": ["cfr-compliance"],
  "cms-disclaimer-placement": ["tpmo-disclaimer", "mpd"],
  "cms-smid-signoff": ["smid"],
  "cms-compliance-signoff": ["cfr-compliance"],
  "launch-phi-note": ["recordkeeping"],
  "launch-trust-banner": ["educational-positioning"],
  "launch-email-footers": ["tpmo-disclaimer"],
  "launch-e2e-qa": ["cfr-compliance"],
  "launch-readiness": ["cfr-compliance"],
  "gap-intake-disclaimers-above-fold": ["tpmo-disclaimer", "educational-positioning"],
  "gap-smid-registry": ["smid"],
  "gap-soa-agent-docs": ["soa"],
  "gap-mobile-disclaimer-placement": ["tpmo-disclaimer", "mpd"],
};

function enrichChecklistSections(sections: RawSection[]): SubmissionChecklistSection[] {
  let prepIdx = 0;
  let reviewIdx = 0;

  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const channel = item.channel ?? channelForItem(item.id);
      const reviewDueDate = item.reviewDueDate ?? addScheduleDays(CATRIA_SCHEDULE_START, reviewIdx++);
      const requiresCatriaApproval =
        item.requiresCatriaApproval ?? true;
      const enriched: SubmissionChecklistItem = {
        ...item,
        channel,
        reviewDueDate,
        cmsRequirementIds:
          item.cmsRequirementIds ?? CHECKLIST_CMS_REQUIREMENT_MAP[item.id],
        requiresCatriaApproval,
      };
      if (item.owner === "prep" && !item.prepDueDate) {
        enriched.prepDueDate = addScheduleDays(EVELYN_SCHEDULE_START, prepIdx++);
      }
      return enriched;
    }),
  }));
}

function enrichSubmissionTasks(tasks: RawTask[]): SubmissionTaskItem[] {
  let prepIdx = 0;
  let reviewIdx = 0;

  return tasks.map((task) => {
    const channel =
      task.channel ?? channelForItem(task.relatedChecklistIds?.[0] ?? task.id);
    const computedDue =
      task.assignee === "prep"
        ? addScheduleDays(EVELYN_SCHEDULE_START, prepIdx++)
        : addScheduleDays(CATRIA_SCHEDULE_START, reviewIdx);

    if (task.assignee === "prep") prepIdx++;
    else reviewIdx++;

    const reviewDueDate = addScheduleDays(CATRIA_SCHEDULE_START, reviewIdx++);

    return {
      ...task,
      channel,
      assignee: "both" as ChecklistOwner,
      dueDate: task.dueDate || computedDue,
      reviewDueDate: task.reviewDueDate ?? reviewDueDate,
      requiresCatriaApproval: task.requiresCatriaApproval ?? true,
    };
  });
}

/** External submissions and sign-offs with due dates — separate from prep/review checklist. */
const RAW_SUBMISSION_TASK_ITEMS: RawTask[] = [
  {
    id: "submit-fb-business-manager",
    title: "Meta Business Manager & ad account verified",
    description:
      "Confirm Business Manager verification, payment method, Page connection, and legal entity match TPMO/agency of record. Screenshot or note account ID in section notes.",
    assignee: "prep",
    dueDate: "2026-07-05",
    submissionTarget: "Meta Business Manager",
    relatedChecklistIds: ["fb-business-manager"],
  },
  {
    id: "submit-fb-special-ad-category",
    title: "Special Ad Category configured in Ads Manager",
    description:
      "Set Credit / Financial Products and Services (and Social Issues if required). Document audience restrictions and age targeting before first ad set is created.",
    assignee: "prep",
    dueDate: "2026-07-06",
    submissionTarget: "Meta Ads Manager",
    relatedChecklistIds: ["fb-special-ad-category", "fb-targeting-review"],
  },
  {
    id: "submit-meta-ad-review",
    title: "Meta ad submitted for review",
    description:
      "Upload creative, primary text with TPMO + MPD, headline, description, CTA, and destination URL /scenario/new. Record submission date and Ads Manager case ID.",
    assignee: "prep",
    dueDate: "2026-07-08",
    submissionTarget: "Meta Ads Manager",
    relatedChecklistIds: ["fb-meta-submission", "fb-copy-review", "fb-creative-review"],
  },
  {
    id: "submit-meta-ad-decision",
    title: "Meta ad review outcome recorded",
    description:
      "Document approved, rejected, or changes-required status. If rejected, note revision plan and resubmission date.",
    assignee: "review",
    dueDate: "2026-07-11",
    submissionTarget: "Meta Ads Manager",
    relatedChecklistIds: ["fb-meta-submission"],
  },
  {
    id: "submit-smid-filing",
    title: "SMID filed or exemption documented",
    description:
      "If TPMO marketing requires CMS filing, submit to applicable MA/Part D sponsor with SMID, filing date, and asset list. If exempt, document rationale in CMS section notes.",
    assignee: "prep",
    dueDate: "2026-07-10",
    submissionTarget: "CMS / plan sponsor TPMO portal",
    relatedChecklistIds: ["cms-smid", "cms-smid-signoff"],
  },
  {
    id: "submit-soa-workflow",
    title: "Scope of Appointment workflow published for agents",
    description:
      "Written SOA process for licensed agents before plan-specific discussions with benchmark-tool opt-ins. Include template, retention, and training acknowledgment.",
    assignee: "prep",
    dueDate: "2026-07-09",
    submissionTarget: "Internal agent compliance",
    relatedChecklistIds: ["cms-soa"],
  },
  {
    id: "submit-cms-copy-audit",
    title: "CMS marketing copy audit complete",
    description:
      "Written review of live site, ads, emails, and Learning Center against 42 CFR §422.2262 / §423.2262 — prohibited claims, disclaimers, government endorsement.",
    assignee: "review",
    dueDate: "2026-07-12",
    submissionTarget: "Internal compliance sign-off",
    relatedChecklistIds: ["cms-copy-audit", "cms-disclaimer-placement"],
  },
  {
    id: "submit-cms-compliance-signoff",
    title: "CMS compliance launch sign-off",
    description:
      "Final written approval that benchmark tool + marketing meet TPMO, MPD, privacy, and lead-handling requirements before paid traffic scales.",
    assignee: "review",
    dueDate: "2026-07-14",
    submissionTarget: "Internal compliance sign-off",
    relatedChecklistIds: ["cms-compliance-signoff"],
  },
  {
    id: "submit-launch-readiness",
    title: "Final launch readiness approval",
    description:
      "Confirm Facebook ad approval, CMS compliance, technical QA, and analytics policy — OK to turn on paid traffic or announce publicly.",
    assignee: "review",
    dueDate: "2026-07-15",
    submissionTarget: "Internal launch approval",
    relatedChecklistIds: ["launch-readiness", "launch-analytics"],
  },
];

const RAW_CHECKLIST_SECTIONS: RawSection[] = [
  {
    id: "facebook",
    title: "Facebook Marketing & Ads",
    subtitle:
      "Meta Business Manager, financial-products ad policies, Medicare-related creative rules, landing page alignment, and ad review submission.",
    items: [
      {
        id: "fb-business-manager",
        title: "Business Manager & ad account ready",
        description:
          "Meta Business Manager is verified, a payment method is on file, the Facebook Page is connected, and the ad account legal entity matches the TPMO or agency of record.",
        owner: "prep",
      },
      {
        id: "fb-special-ad-category",
        title: "Special Ad Category configured",
        description:
          "Medicare and financial-product ads typically require Credit / Financial Products and Services (and sometimes Social Issues). Confirm category selection, audience restrictions, and age targeting comply with Meta policy.",
        owner: "prep",
      },
      {
        id: "fb-landing-url",
        title: "Destination URL points to educational benchmark tool",
        description:
          "Paid traffic lands on /scenario/new (Part B Optimizer Benchmark Tool) — no login wall, no immediate lead form, and the page clearly frames educational comparison rather than enrollment.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "/scenario/new is public; EducationalIntakeForm has no login gate or lead form.",
      },
      {
        id: "fb-ad-copy-draft",
        title: "Primary text includes TPMO + Multi-Plan Disclaimer",
        description:
          "Ad primary text includes the full TPMO disclosure and MPD footer (see FACEBOOK_AD_DISCLAIMER in facebook-ad-launch.ts). Avoid “free,” “best,” “#1,” “guaranteed,” or “all plans” in headline, description, or video.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "FACEBOOK_AD_COPY.primaryText includes TPMO + MPD (facebook-ad-launch.ts).",
      },
      {
        id: "fb-creative-assets",
        title: "Creative assets are CMS/Meta safe",
        description:
          "Video and image contain no Medicare card, CMS/government logos, carrier or plan names, star ratings, premiums, readable on-screen text, or enrollment CTAs burned into the creative. Headline, description, disclaimer, and CTA live only in Ads Manager.",
        owner: "prep",
      },
      {
        id: "fb-lead-forms",
        title: "Lead forms disabled or compliant",
        description:
          "If using Instant Forms or on-Facebook lead capture, confirm TPMO consent, MPD, privacy link, and no enrollment solicitation. Default launch path should drive to the de-identified benchmark tool instead of collecting PII in-ad.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "Launch path drives to /scenario/new; ExpertOptInDialog is post-benchmark only.",
      },
      {
        id: "fb-privacy-policy",
        title: "Privacy policy reachable from ad destination",
        description:
          "Landing page and site footer link to /legal with a current privacy policy covering marketing, lead sharing with licensed agencies, and record retention.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "CMSFooter, ExpertOptInDialog, and newsletter forms link to /legal.",
      },
      {
        id: "fb-page-branding",
        title: "Facebook Page branding matches live site",
        description:
          "Page name, profile/cover imagery, and About text align with site brand, government-affiliation disclaimer, and educational positioning — consistent with organic post copy in Content Factory.",
        owner: "prep",
      },
      {
        id: "fb-copy-review",
        title: "Ad copy compliance review",
        description:
          "Confirm primary text, headline, description, and CTA use educational language only — no superlatives, enrollment promises, or missing TPMO/MPD language. Voiceover script matches approved FACEBOOK_AD_VOICEOVER_SCRIPT if using video.",
        owner: "review",
      },
      {
        id: "fb-creative-review",
        title: "Creative & landing experience review",
        description:
          "Review mobile preview end-to-end: disclaimer visible in primary text, creative passes CMS/Meta safe checklist, and destination shows BENCHMARK_SCOPE_NOTE and NO_PHI_PII_COLLECTION_NOTE near the intake flow.",
        owner: "review",
      },
      {
        id: "fb-targeting-review",
        title: "Targeting & Special Ad Category configured",
        description:
          "Configure audience geography, age floor, excluded custom audiences, and Special Ad Category settings in Ads Manager before first ad set is created.",
        owner: "prep",
      },
      {
        id: "fb-meta-submission",
        title: "Meta ad review submitted / decision recorded",
        description:
          "Submit ad in Ads Manager and document submission date, review outcome (approved, rejected, or changes required), and any appeal or revision notes.",
        owner: "prep",
        requiresCatriaApproval: true,
      },
    ],
  },
  {
    id: "cms",
    title: "CMS / Medicare Compliance",
    subtitle:
      "TPMO disclosures, educational-use positioning, marketing material filings, scope of appointment, privacy, and lead handling for a Medicare educational benchmark tool.",
    items: [
      {
        id: "cms-tpmo-disclaimer",
        title: "TPMO disclaimer on marketing surfaces",
        description:
          "TPMO_PLATFORM_DISCLAIMER appears on About, newsletter signup, expert opt-in, email footers, and other consumer touchpoints that describe the platform.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "NewsletterSignupForm, ExpertOptInDialog, CMSFooter, and email-footer.tsx.",
      },
      {
        id: "cms-mpd-disclaimer",
        title: "Multi-Plan Disclaimer (MPD) on ads and outreach",
        description:
          "MPD_DISCLAIMER is included in paid ads, Facebook posts, and any material that could be read as plan-related marketing. Copy uses educational tone — not “we offer plans.”",
        owner: "prep",
        siteVerified: true,
        verificationNote: "FACEBOOK_AD_COPY, scouting-ad-angles, and Learning Center article footers.",
      },
      {
        id: "cms-government-affiliation",
        title: "Government affiliation disclaimer visible",
        description:
          "GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER is on the home page, About page, and marketing creative. No CMS, Medicare, or government seals in ads or site chrome.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "MedicareDisclaimers in CMSFooter (all pages) and About page hero.",
      },
      {
        id: "cms-educational-only",
        title: "No enrollment solicitation in consumer copy",
        description:
          "Benchmark tool, Learning Center, and ads describe education and exploration — not “enroll now,” “apply,” or “we represent all plans.” PLAN_SCOPE_ASTERISK_DISCLAIMER appears near plan lists.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "PlanFilterBar shows PLAN_SCOPE_ASTERISK; educational copy site-wide.",
      },
      {
        id: "cms-benchmark-disclaimers",
        title: "Benchmark output disclaimers in product",
        description:
          "BENCHMARK_SCOPE_NOTE, BENCHMARK_TOOL_DISCLAIMER, and BENCHMARK_ESTIMATES_DISCLAIMER render on scenario intake, benchmark report, and PDF exports. Tool is framed as educational benchmark — not a carrier catalog.",
        owner: "prep",
        siteVerified: true,
        verificationNote:
          "Footer disclaimers, scenario report, benchmark PDF, and ScenarioNewHowItWorks educational note. Intake could use stronger above-fold BENCHMARK_SCOPE (see Gaps).",
      },
      {
        id: "cms-lead-consent",
        title: "Expert opt-in / lead consent language current",
        description:
          "ExpertOptInDialog and lead certificate flow show TPMO_PLATFORM_DISCLAIMER, ASSISTANCE_AGENCY_SHARING_NOTICE, and explicit consent before PII is collected. Marketing opt-in is separate and optional.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "ExpertOptInDialog + lead-consent.ts with separate marketing opt-in checkbox.",
      },
      {
        id: "cms-smid",
        title: "SMID filed for CMS-regulated marketing (if applicable)",
        description:
          "If running TPMO marketing that requires CMS filing, document the Sales, Marketing, and Educational Material ID (SMID), filing date, and which live assets map to that SMID.",
        owner: "prep",
      },
      {
        id: "cms-soa",
        title: "Scope of Appointment process documented",
        description:
          "Licensed agents have a documented Scope of Appointment (SOA) workflow before discussing specific plan types with a beneficiary who opted in from the benchmark tool.",
        owner: "prep",
      },
      {
        id: "cms-privacy-legal",
        title: "Privacy policy and terms published",
        description:
          "/legal is live with privacy, terms, TPMO notices, call-recording consent, and agency referral language. De-identification statement covers no PHI/MBI collection in the benchmark intake.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "/legal route with legal-content.ts sections including privacy, terms, TPMO, and delete-data.",
      },
      {
        id: "cms-lead-audit",
        title: "Lead certificate audit trail configured",
        description:
          "Admin lead certificate table captures consent timestamps, IP, source URL, assigned agent, and marketing opt-in for compliance records.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "Admin → Lead certificates table (LeadCertificateAuditTable) with Supabase lead_certificates.",
      },
      {
        id: "cms-copy-audit",
        title: "CMS marketing copy audit (42 CFR §422.2262 / §423.2262)",
        description:
          "Review live site, ads, emails, and Learning Center articles for prohibited claims, missing disclaimers, implied government endorsement, or plan-specific inducements.",
        owner: "review",
      },
      {
        id: "cms-disclaimer-placement",
        title: "TPMO / MPD placement verification on live pages",
        description:
          "Spot-check home, /scenario/new, benchmark report, About, newsletter, and opt-in dialogs in production — disclaimers are readable without scrolling past the first screen on mobile where required.",
        owner: "review",
      },
      {
        id: "cms-smid-signoff",
        title: "SMID / marketing file alignment sign-off",
        description:
          "Confirm filed SMID text matches live ad copy and landing page, or document why no SMID is required for this launch scope.",
        owner: "review",
      },
      {
        id: "cms-compliance-signoff",
        title: "CMS compliance launch sign-off",
        description:
          "Final written approval that the educational benchmark tool and accompanying marketing meet TPMO, MPD, privacy, and lead-handling requirements before paid traffic scales.",
        owner: "review",
      },
    ],
  },
  {
    id: "launch",
    title: "General Launch Prep",
    subtitle:
      "App-specific disclaimers, technical readiness, and end-to-end QA for the Part B Optimizer Benchmark Tool.",
    items: [
      {
        id: "launch-phi-note",
        title: "No PHI/PII collection messaging in intake",
        description:
          "NO_PHI_PII_COLLECTION_NOTE is visible on the benchmark intake flow and trust surfaces. Intake collects de-identified inputs only (birth year, ZIP3, etc.).",
        owner: "prep",
        siteVerified: true,
        verificationNote: "TrustBanner, home hero, IntakeWizard, and HomeHowItWorksVideo.",
      },
      {
        id: "launch-trust-banner",
        title: "Trust banner and educational framing live",
        description:
          "TrustBanner, home benchmark banner, and scenario how-it-works copy use BENCHMARK_TOOL_CTA and educational language — not plan-finding or enrollment CTAs.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "TrustBanner on AppShell, home benchmark banner, ScenarioNewHowItWorks.",
      },
      {
        id: "launch-email-footers",
        title: "Transactional email TPMO footers",
        description:
          "All outbound email templates include TPMO disclaimer in the footer (email-footer.tsx). Test sends reviewed in Admin → Email templates.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "email-footer.tsx includes TPMO, government affiliation, and benchmark disclaimers.",
      },
      {
        id: "launch-admin-noindex",
        title: "Admin and internal routes not indexed",
        description:
          "Admin, QA, and testing routes emit robots noindex,nofollow meta tags so internal tools do not appear in search results.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "Admin, QA, testing, agent, and staff routes set robots noindex.",
      },
      {
        id: "launch-production-url",
        title: "Production URL, SSL, and domain verified",
        description:
          "Canonical production domain serves HTTPS, matches ad destination URLs, and OG/meta tags on public pages reflect the live brand.",
        owner: "prep",
        siteVerified: true,
        verificationNote: "mypartb.com and www.mypartb.com serve HTTPS; canonical URLs in route head.",
      },
      {
        id: "launch-guidde-walkthrough",
        title: "Guidde agent walkthrough video (Evelyn)",
        description:
          "Evelyn records a Guidde screen walkthrough of the benchmark tool — intake, report tabs, plan filters, and PDF export. Use synthetic/de-identified inputs only (no PHI). Publish in Guidde and link from agent training or Admin → Training.",
        owner: "prep",
        channel: "website",
      },
      {
        id: "launch-analytics",
        title: "Pixels / analytics deferred until compliance sign-off",
        description:
          "Meta Pixel, conversion tracking, or third-party tags are not live until Facebook and CMS checklist items above are approved — document what will fire and when.",
        owner: "prep",
      },
      {
        id: "launch-e2e-qa",
        title: "End-to-end benchmark flow QA",
        description:
          "Walk through /scenario/new → benchmark report → optional expert opt-in on staging and production. Confirm disclaimers, PDF export, and Comparison ID / Benchmark Tool ID behavior.",
        owner: "review",
      },
      {
        id: "launch-readiness",
        title: "Final launch readiness sign-off",
        description:
          "Catria confirms Facebook ad approval, CMS compliance, and technical QA are complete — OK to turn on paid traffic or announce publicly.",
        owner: "review",
      },
    ],
  },
  {
    id: "gaps",
    title: "Compliance gaps (action items)",
    subtitle:
      "Issues found during Jul 2026 site review — resolve before scaling paid traffic. Added to checklist from production/code audit.",
    items: [
      {
        id: "gap-meta-pixel-live",
        title: "Meta Pixel is live before compliance sign-off",
        description:
          "Production loads Meta Pixel by default (__root.tsx / meta-pixel.ts) unless VITE_META_PIXEL_ENABLED=false. Disable in Cloudflare env until Facebook + CMS checklist approved, then document what events fire.",
        owner: "prep",
      },
      {
        id: "gap-intake-disclaimers-above-fold",
        title: "Stronger disclaimers above fold on /scenario/new",
        description:
          "TrustBanner shows PHI note site-wide, but intake lacks explicit BENCHMARK_SCOPE_NOTE + NO_PHI_PII_COLLECTION_NOTE directly above EducationalIntakeForm. Add for mobile ad-landing compliance.",
        owner: "prep",
      },
      {
        id: "gap-fb-business-manager",
        title: "Meta Business Manager not confirmed ready",
        description:
          "Business Manager verification, payment method, Page-to-ad-account linkage, and legal entity alignment are external — not verifiable from codebase.",
        owner: "prep",
      },
      {
        id: "gap-fb-page-branding",
        title: "Facebook Page branding alignment unverified",
        description:
          "Confirm Page name, imagery, and About text match site brand, government-affiliation disclaimer, and educational positioning.",
        owner: "prep",
      },
      {
        id: "gap-smid-registry",
        title: "SMID filing / exemption not documented",
        description:
          "No SMID registry or filing date recorded for paid ad creative and landing page assets. Document SMID or written exemption before launch.",
        owner: "prep",
      },
      {
        id: "gap-soa-agent-docs",
        title: "Scope of Appointment workflow not documented",
        description:
          "Licensed agent SOA process before plan-specific sales calls is not in admin docs or agent training materials.",
        owner: "prep",
      },
      {
        id: "gap-mobile-disclaimer-placement",
        title: "Mobile TPMO/MPD above-fold spot-check pending",
        description:
          "Catria to verify home, /scenario/new, benchmark report, About, newsletter, and opt-in dialogs on mobile — disclaimers readable without excessive scrolling.",
        owner: "review",
      },
      {
        id: "gap-email-template-qa",
        title: "Transactional email test sends not recorded",
        description:
          "Templates include TPMO footers in code; Admin → Email templates test sends should be reviewed and noted before launch.",
        owner: "review",
      },
    ],
  },
];

export const SUBMISSION_CHECKLIST_SECTIONS: SubmissionChecklistSection[] =
  enrichChecklistSections(RAW_CHECKLIST_SECTIONS);

export const SUBMISSION_TASK_ITEMS: SubmissionTaskItem[] =
  enrichSubmissionTasks(RAW_SUBMISSION_TASK_ITEMS);

export function allSubmissionChecklistItems(): SubmissionChecklistItem[] {
  return SUBMISSION_CHECKLIST_SECTIONS.flatMap((s) => s.items);
}

/** Inverted index: CMS requirement id → checklist items that reference it. */
export function checklistItemsByCmsRequirementId(): ReadonlyMap<string, SubmissionChecklistItem[]> {
  const map = new Map<string, SubmissionChecklistItem[]>();
  for (const item of allSubmissionChecklistItems()) {
    for (const reqId of item.cmsRequirementIds ?? []) {
      const list = map.get(reqId) ?? [];
      list.push(item);
      map.set(reqId, list);
    }
  }
  return map;
}

/** Global 1-based item numbers across every checklist section (including gaps). */
export function checklistItemNumberById(): ReadonlyMap<string, number> {
  const map = new Map<string, number>();
  allSubmissionChecklistItems().forEach((item, index) => {
    map.set(item.id, index + 1);
  });
  return map;
}

/** Global 1-based numbers for submission task rows. */
export function submissionTaskNumberById(): ReadonlyMap<string, number> {
  const map = new Map<string, number>();
  SUBMISSION_TASK_ITEMS.forEach((task, index) => {
    map.set(task.id, index + 1);
  });
  return map;
}

export function countChecklistItemsMatching(
  items: SubmissionChecklistItem[],
  predicate: (item: SubmissionChecklistItem) => boolean,
): number {
  return items.filter(predicate).length;
}

export type ChecklistProgressCount = {
  done: number;
  total: number;
};

/** @deprecated Use ChecklistProgressCount */
export type ChecklistOutstandingDone = ChecklistProgressCount;

/** Complete vs total counts for checklist filter bubbles and section tabs. */
export function countChecklistProgress(
  items: SubmissionChecklistItem[],
  completed: Record<string, boolean>,
  catriaApproved: Record<string, boolean>,
  catriaReviewed?: Record<string, boolean>,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): ChecklistProgressCount {
  const done = items.filter((item) =>
    isChecklistItemComplete(item, completed, catriaApproved, catriaReviewed, catriaTaskFlags),
  ).length;
  return { done, total: items.length };
}

/** @deprecated Use countChecklistProgress */
export const countChecklistOutstandingDone = countChecklistProgress;

export function siteVerifiedChecklistIds(): string[] {
  return allSubmissionChecklistItems()
    .filter((item) => item.siteVerified)
    .map((item) => item.id);
}

export function ownerLabel(owner: ChecklistOwner): string {
  if (owner === "prep") return PREP_OWNER_LABEL;
  if (owner === "review") return REVIEW_OWNER_LABEL;
  return BOTH_ASSIGNEE_LABEL;
}

export function assigneeLabel(assignee: SubmissionTaskAssignee): string {
  return ownerLabel(assignee);
}

export function formatChecklistDueDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function submissionTaskDueStatus(isoDate: string): "overdue" | "due-soon" | "upcoming" {
  const due = new Date(`${isoDate}T23:59:59`);
  const now = new Date();
  const msPerDay = 86_400_000;
  const days = Math.ceil((due.getTime() - now.getTime()) / msPerDay);
  if (days < 0) return "overdue";
  if (days <= 3) return "due-soon";
  return "upcoming";
}

export function getCatriaTaskFlags(
  itemId: string,
  overrides?: Record<string, Partial<CatriaTaskFlags>>,
): CatriaTaskFlags {
  const override = overrides?.[itemId];
  return {
    review: override?.review ?? DEFAULT_CATRIA_TASK_FLAGS.review,
    approve: override?.approve ?? DEFAULT_CATRIA_TASK_FLAGS.approve,
  };
}

/** Whether Evelyn has prep work on this checklist item. */
export function checklistItemHasPrepWork(
  item: SubmissionChecklistItem,
  itemAssignees?: Record<string, ChecklistOwner>,
): boolean {
  const assignee = getChecklistItemAssignee(item, itemAssignees);
  if (assignee === "both" || assignee === "prep") return true;
  return assignee === "review" ? true : item.owner === "prep";
}

/** Whether Catria has review / approval work on this checklist item. */
export function checklistItemHasReviewWork(
  item: SubmissionChecklistItem,
  itemAssignees?: Record<string, ChecklistOwner>,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  const flags = getCatriaTaskFlags(item.id, catriaTaskFlags);
  if (!flags.review && !flags.approve) return false;
  const assignee = getChecklistItemAssignee(item, itemAssignees);
  if (assignee === "both" || assignee === "review") return true;
  if (assignee === "prep") return item.requiresCatriaApproval === true;
  return item.owner === "review" || item.requiresCatriaApproval === true;
}

/** Default assignee — every item is shared between Evelyn and Catria. */
export function defaultChecklistItemAssignee(_item: SubmissionChecklistItem): ChecklistOwner {
  return "both";
}

/** Resolved assignee — persisted override or default from owner. */
export function getChecklistItemAssignee(
  item: SubmissionChecklistItem,
  itemAssignees?: Record<string, ChecklistOwner>,
): ChecklistOwner {
  return itemAssignees?.[item.id] ?? defaultChecklistItemAssignee(item);
}

export function checklistItemMatchesAssigneeFilter(
  item: SubmissionChecklistItem,
  filter: AssigneeFilter,
  itemAssignees?: Record<string, ChecklistOwner>,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  if (filter === "all") return true;
  const assignee = getChecklistItemAssignee(item, itemAssignees);
  if (assignee === "both") return true;
  if (filter === "prep") {
    return checklistItemHasPrepWork(item, itemAssignees) || assignee === "prep";
  }
  return checklistItemHasReviewWork(item, itemAssignees, catriaTaskFlags) || assignee === "review";
}

/** Whether Evelyn prep checkbox should render. */
export function checklistItemShowsPrepCheckbox(
  item: SubmissionChecklistItem,
  assignee: ChecklistOwner,
): boolean {
  if (assignee === "both" || assignee === "prep") return true;
  return item.owner === "prep";
}

/** Whether the Catria review checkbox should render. */
export function checklistItemShowsCatriaReviewCheckbox(
  itemId: string,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  return getCatriaTaskFlags(itemId, catriaTaskFlags).review;
}

/** Whether the Catria approve checkbox should render. */
export function checklistItemShowsCatriaApproveCheckbox(
  itemId: string,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  return getCatriaTaskFlags(itemId, catriaTaskFlags).approve;
}

/** @deprecated Use checklistItemShowsCatriaReviewCheckbox / checklistItemShowsCatriaApproveCheckbox */
export function checklistItemShowsCatriaCheckbox(
  item: SubmissionChecklistItem,
  assignee: ChecklistOwner,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  const flags = getCatriaTaskFlags(item.id, catriaTaskFlags);
  if (!flags.review && !flags.approve) return false;
  if (assignee === "both") return true;
  return item.owner === "review" || item.requiresCatriaApproval === true;
}

export function filterChecklistItemsByAssignee(
  items: SubmissionChecklistItem[],
  filter: AssigneeFilter,
  itemAssignees?: Record<string, ChecklistOwner>,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): SubmissionChecklistItem[] {
  if (filter === "all") return items;
  return items.filter((item) =>
    checklistItemMatchesAssigneeFilter(item, filter, itemAssignees, catriaTaskFlags),
  );
}

type TaskAssigneeShape = {
  assignee: ChecklistOwner;
  requiresCatriaApproval?: boolean;
  id?: string;
};

export function taskHasPrepWork(task: TaskAssigneeShape): boolean {
  return task.assignee === "prep" || task.assignee === "both";
}

export function taskHasReviewWork(
  task: TaskAssigneeShape,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  if (task.id) {
    const flags = getCatriaTaskFlags(task.id, catriaTaskFlags);
    if (!flags.review && !flags.approve) return false;
  }
  return task.assignee === "review" || task.assignee === "both" || task.requiresCatriaApproval === true;
}

export function taskMatchesAssigneeFilter(
  task: TaskAssigneeShape,
  filter: AssigneeFilter,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  if (filter === "all") return true;
  if (filter === "prep") return taskHasPrepWork(task);
  return taskHasReviewWork(task, catriaTaskFlags);
}

export function filterTasksByAssignee<T extends TaskAssigneeShape>(
  tasks: T[],
  filter: AssigneeFilter,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): T[] {
  if (filter === "all") return tasks;
  return tasks.filter((task) => taskMatchesAssigneeFilter(task, filter, catriaTaskFlags));
}

export function isChecklistItemComplete(
  item: SubmissionChecklistItem,
  completed: Record<string, boolean>,
  catriaApproved: Record<string, boolean>,
  catriaReviewed?: Record<string, boolean>,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  const flags = getCatriaTaskFlags(item.id, catriaTaskFlags);
  const prepDone = !!completed[item.id];
  const reviewDone = !flags.review || !!(catriaReviewed?.[item.id]);
  const approveDone = !flags.approve || !!catriaApproved[item.id];
  return prepDone && reviewDone && approveDone;
}

export function isSubmissionTaskComplete(
  task: TaskAssigneeShape & { id: string },
  done: Record<string, boolean>,
  approved: Record<string, boolean>,
  reviewed?: Record<string, boolean>,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  const flags = getCatriaTaskFlags(task.id, catriaTaskFlags);
  const prepDone = !!done[task.id];
  const reviewDone = !flags.review || !!(reviewed?.[task.id]);
  const approveDone = !flags.approve || !!approved[task.id];
  return prepDone && reviewDone && approveDone;
}

/** Complete vs total counts for submission / carrier task tabs. */
export function countSubmissionTasksProgress(
  tasks: Array<TaskAssigneeShape & { id: string }>,
  done: Record<string, boolean>,
  approved: Record<string, boolean>,
  reviewed?: Record<string, boolean>,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): ChecklistProgressCount {
  const doneCount = tasks.filter((task) =>
    isSubmissionTaskComplete(task, done, approved, reviewed, catriaTaskFlags),
  ).length;
  return { done: doneCount, total: tasks.length };
}

/** @deprecated Use countSubmissionTasksProgress */
export const countSubmissionTasksOutstandingDone = countSubmissionTasksProgress;

/** Workflow status for any checklist row — main, submissions, or carrier. */
export type ChecklistItemStatus = "not_started" | "in_progress" | "done";

export const CHECKLIST_ITEM_STATUS_OPTIONS: { id: ChecklistItemStatus; label: string }[] = [
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export function isChecklistItemStatus(value: unknown): value is ChecklistItemStatus {
  return value === "not_started" || value === "in_progress" || value === "done";
}

export function checklistItemStatusLabel(status: ChecklistItemStatus): string {
  return CHECKLIST_ITEM_STATUS_OPTIONS.find((opt) => opt.id === status)?.label ?? status;
}

/** Checkbox checked → Done; unchecked → Not Started. */
export function statusFromCheckboxChecked(checked: boolean): ChecklistItemStatus {
  return checked ? "done" : "not_started";
}

export function resolveChecklistItemStatus(
  itemId: string,
  itemStatuses: Record<string, ChecklistItemStatus>,
): ChecklistItemStatus {
  const status = itemStatuses[itemId];
  return isChecklistItemStatus(status) ? status : "not_started";
}

export const ALL_CHECKLIST_ITEM_STATUSES: readonly ChecklistItemStatus[] =
  CHECKLIST_ITEM_STATUS_OPTIONS.map((option) => option.id);

/** True when a strict subset of statuses is selected (filter narrows the list). */
export function isChecklistStatusFilterActive(
  selectedStatuses: ReadonlySet<ChecklistItemStatus> | readonly ChecklistItemStatus[],
): boolean {
  const size =
    selectedStatuses instanceof Set ? selectedStatuses.size : selectedStatuses.length;
  return size > 0 && size < ALL_CHECKLIST_ITEM_STATUSES.length;
}

/** Multiselect status filter — empty or all selected shows every item; otherwise ANY match. */
export function checklistItemMatchesStatusFilter(
  itemId: string,
  itemStatuses: Record<string, ChecklistItemStatus>,
  selectedStatuses: ReadonlySet<ChecklistItemStatus> | readonly ChecklistItemStatus[],
): boolean {
  const size =
    selectedStatuses instanceof Set ? selectedStatuses.size : selectedStatuses.length;
  if (size === 0 || size >= ALL_CHECKLIST_ITEM_STATUSES.length) return true;
  const status = resolveChecklistItemStatus(itemId, itemStatuses);
  if (selectedStatuses instanceof Set) return selectedStatuses.has(status);
  return selectedStatuses.includes(status);
}

export function filterByChecklistItemStatus<T extends { id: string }>(
  items: T[],
  itemStatuses: Record<string, ChecklistItemStatus>,
  selectedStatuses: ReadonlySet<ChecklistItemStatus> | readonly ChecklistItemStatus[],
): T[] {
  if (!isChecklistStatusFilterActive(selectedStatuses)) return items;
  return items.filter((item) =>
    checklistItemMatchesStatusFilter(item.id, itemStatuses, selectedStatuses),
  );
}

/** Resolved assignee for submission / carrier tasks — override or task default. */
export function getSubmissionTaskAssignee(
  task: { id: string; assignee: ChecklistOwner },
  overrides?: Record<string, ChecklistOwner>,
): ChecklistOwner {
  return overrides?.[task.id] ?? task.assignee;
}

/** Person slot on a dual-owner checklist row. */
export type ChecklistPerson = "prep" | "review";

/** Per-person workflow status derived from completion checkboxes. */
export type PersonWorkStatus = ChecklistItemStatus;

export function personWorkStatusLabel(status: PersonWorkStatus): string {
  return checklistItemStatusLabel(status);
}

/** Evelyn prep status — N/A when prep work is hidden for this item. */
export function resolvePrepPersonStatus(
  prepDone: boolean,
  showPrep: boolean,
): PersonWorkStatus {
  if (!showPrep) return "done";
  return prepDone ? "done" : "not_started";
}

/** Catria status from review / approve sub-tasks and optional flags. */
export function resolveCatriaPersonStatus(
  flags: CatriaTaskFlags,
  reviewed: boolean,
  approved: boolean,
): PersonWorkStatus {
  if (!flags.review && !flags.approve) return "done";
  if (flags.approve && approved) return "done";
  if (flags.review && reviewed) return flags.approve ? "in_progress" : "done";
  if (reviewed || approved) return "in_progress";
  return "not_started";
}

/** Per-item Evelyn / Catria workflow status overrides (fallback: derived from checkboxes). */
export type ItemPersonStatuses = Partial<Record<ChecklistPerson, ChecklistItemStatus>>;

export function resolveItemPersonStatus(
  itemId: string,
  person: ChecklistPerson,
  personStatuses: Record<string, ItemPersonStatuses> | undefined,
  derived: PersonWorkStatus,
): PersonWorkStatus {
  const stored = personStatuses?.[itemId]?.[person];
  return isChecklistItemStatus(stored) ? stored : derived;
}

/** Overall item status from checkbox progress — approve marks the row Done. */
export function deriveItemStatusFromProgress(
  prepDone: boolean,
  catriaReviewed: boolean,
  catriaApproved: boolean,
  flags: CatriaTaskFlags,
  showPrep: boolean,
): ChecklistItemStatus {
  if (flags.approve && catriaApproved) return "done";
  const hasProgress =
    (showPrep && prepDone) ||
    (flags.review && catriaReviewed) ||
    (flags.approve && catriaApproved);
  return hasProgress ? "in_progress" : "not_started";
}

export type CatriaApproveGateInput = {
  prepDone: boolean;
  showPrep: boolean;
  catriaReviewed: boolean;
  flags: CatriaTaskFlags;
};

/** Catria may only approve when Evelyn prep (if required) and Catria review (if required) are done. */
export function canCatriaApprove(input: CatriaApproveGateInput): boolean {
  if (!input.flags.approve) return false;
  const prepReady = !input.showPrep || input.prepDone;
  const reviewReady = !input.flags.review || input.catriaReviewed;
  return prepReady && reviewReady;
}

/** Human-readable reason when approve is blocked — for tooltips. */
export function catriaApproveBlockedReason(input: CatriaApproveGateInput): string | null {
  if (!input.flags.approve) return null;
  if (canCatriaApprove(input)) return null;
  const missing: string[] = [];
  if (input.showPrep && !input.prepDone) missing.push(`${PREP_OWNER_LABEL} prep`);
  if (input.flags.review && !input.catriaReviewed) missing.push(`${REVIEW_OWNER_LABEL} review`);
  if (missing.length === 0) return "Complete prerequisite steps first";
  return `Complete ${missing.join(" and ")} first`;
}

/** Whether Evelyn prep checkbox should render for this assignee + item. */
export function showsPrepPerson(
  item: SubmissionChecklistItem,
  assignee: ChecklistOwner,
): boolean {
  return checklistItemShowsPrepCheckbox(item, assignee);
}

/** Whether Catria sub-tasks apply for this assignee + item. */
export function showsCatriaPerson(
  item: SubmissionChecklistItem,
  assignee: ChecklistOwner,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  const flags = getCatriaTaskFlags(item.id, catriaTaskFlags);
  if (!flags.review && !flags.approve) return false;
  return checklistItemHasReviewWork(item, { [item.id]: assignee }, catriaTaskFlags);
}

/** Whether submission / carrier task shows Evelyn prep work. */
export function submissionTaskShowsPrep(
  task: TaskAssigneeShape,
  assignee: ChecklistOwner,
): boolean {
  return assignee === "prep" || assignee === "both";
}

/** Whether submission / carrier task shows Catria sub-tasks. */
export function submissionTaskShowsCatria(
  task: TaskAssigneeShape & { id: string },
  assignee: ChecklistOwner,
  catriaTaskFlags?: Record<string, Partial<CatriaTaskFlags>>,
): boolean {
  const flags = getCatriaTaskFlags(task.id, catriaTaskFlags);
  if (!flags.review && !flags.approve) return false;
  return taskHasReviewWork(task, catriaTaskFlags);
}

/** Next assignee after removing a person from a dual-owner row. */
export function assigneeAfterRemovingPerson(
  current: ChecklistOwner,
  person: ChecklistPerson,
): ChecklistOwner {
  if (person === "review") {
    if (current === "both" || current === "review") return "prep";
    return current;
  }
  if (current === "both" || current === "prep") return "review";
  return current;
}

export type RemoveChecklistPersonPatch = {
  assignee: ChecklistOwner;
  catriaTaskFlags?: Partial<CatriaTaskFlags>;
  clearPrep?: boolean;
  clearReview?: boolean;
  clearApprove?: boolean;
};

/** State patch when Evelyn (admin) removes a person from an item. */
export function buildRemoveChecklistPersonPatch(
  currentAssignee: ChecklistOwner,
  person: ChecklistPerson,
): RemoveChecklistPersonPatch {
  const assignee = assigneeAfterRemovingPerson(currentAssignee, person);
  if (person === "review") {
    return {
      assignee,
      catriaTaskFlags: { review: false, approve: false },
      clearReview: true,
      clearApprove: true,
    };
  }
  return {
    assignee,
    clearPrep: true,
  };
}
