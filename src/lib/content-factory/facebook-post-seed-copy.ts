import {
  MEDICARE_GOV_URL,
  MEDICARE_PLAN_COMPARE_URL,
} from "@/lib/medicare-disclaimers";
import { seedProductionUrl } from "@/lib/content-factory/seed-production-url";
import { SITE_BRAND_NAME, SITE_BRAND_THE } from "@/lib/site-brand";

export interface FacebookPostSeedCopy {
  title: string;
  excerpt: string;
  body: string;
}

/** Standard TPMO-safe footer on every Facebook post. */
export const FB_POST_DISCLAIMER =
  "Educational only. We do not sell insurance or solicit enrollments. We are not affiliated with or endorsed by Medicare, CMS, or any government agency.";

/** One-line pointer to the site / tool on educational posts. */
export const FB_POST_SITE_LINE = `More guides and comparison tools at ${seedProductionUrl("/")} — ${SITE_BRAND_NAME} is independent, salesperson-free Medicare education (not a government website).`;

export const FB_POST_OFFICIAL_COMPARE_LINE = `Compare plans on the official Medicare tool: ${MEDICARE_PLAN_COMPARE_URL}`;

export const FB_POST_OFFICIAL_VERIFY_LINE = `Verify rules and deadlines on ${MEDICARE_GOV_URL} or with your State Health Insurance Assistance Program (SHIP).`;

/** Static Facebook post copy for slots filled directly from batch seed (not workbook templates). */
export function buildFacebookPostSeedCopy(): FacebookPostSeedCopy[] {
  return [
    {
      title: "New guide: What Is Medicare Prior Authorization?",
      excerpt: "Learning Center launch post — Prior Auth plain-language overview.",
      body: `Prior authorizations can delay care you thought was covered — and the rules are not always obvious before you enroll.

We just published a plain-language Learning Center guide: "What Is Medicare Prior Authorization? A Plain-Language Overview." Read how prior auth works in Medicare Advantage and Part D, and how to protect yourself from surprise denials:

👉 ${seedProductionUrl("/learning-center/what-is-medicare-prior-authorization")}

${FB_POST_SITE_LINE}

${FB_POST_DISCLAIMER}

#MedicareEducation #PriorAuthorization #Turning65`,
    },
    {
      title: "The Medigap Open Enrollment Window: Why Timing Matters",
      excerpt: "Share Article 2 and invite friends to follow our page.",
      body: `If you are new to Medicare Part B, you generally have a one-time six-month Medigap open enrollment window where guaranteed-issue rules protect you.

Missing this window is one of the most common regrets we hear about, as you may face medical underwriting later if you try to switch to a supplemental plan.

Read our plain-language guide on why timing is critical:
👉 ${seedProductionUrl("/learning-center/medigap-open-enrollment-window-explained")}

${FB_POST_OFFICIAL_VERIFY_LINE}

📌 Help us spread the word! Invite friends or family members who are turning 65 to follow the ${SITE_BRAND_THE} page for transparent, non-sales education.

${FB_POST_SITE_LINE}

${FB_POST_DISCLAIMER}

#MedicareEducation #Medigap #Turning65`,
    },
    {
      title: "A $0 premium is not the same as $0 total cost",
      excerpt: "Educational post linking to Article 3 on Medicare Advantage premiums.",
      body: `Many Medicare Advantage plans advertise a $0 monthly premium. Copays, deductibles, and out-of-network bills can still add up.

Compare the full cost picture — not just the headline premium. Read our plain-language guide on what $0 premiums really mean:
👉 ${seedProductionUrl("/learning-center/medicare-advantage-zero-premium-explained")}

${FB_POST_OFFICIAL_COMPARE_LINE}

${FB_POST_SITE_LINE}

${FB_POST_DISCLAIMER}

#MedicareEducation #ComparePlans #MedicareAdvantage`,
    },
    {
      title: "Workbook page post (filled from template at batch create)",
      excerpt: "Page post — workbook PDF + Still Working article.",
      body: "",
    },
    {
      title: "TV ads make Medicare sound simple — compare the documents",
      excerpt: "Reminder to read Evidence of Coverage, not just marketing perks.",
      body: `Dental and vision perks are easy to understand in Medicare ads. Networks, prior authorization, and cost-sharing rules often live deeper in the plan booklet.

Match ad claims to the official Evidence of Coverage — not just the commercial.

Read how to compare plans without the sales pressure:
👉 ${seedProductionUrl("/learning-center/how-to-compare-medicare-plans-without-the-sales-pressure")}

${FB_POST_OFFICIAL_COMPARE_LINE}

${FB_POST_SITE_LINE}

${FB_POST_DISCLAIMER}

#MedicareEducation #ComparePlans`,
    },
    {
      title: "Is your doctor in network for next year?",
      excerpt: "Educational post linking to the doctor network Learning Center guide.",
      body: `Plan networks can change every contract year. A doctor who was in network last year may not be next year.

Before you assume you can keep the same care team, walk through our plain-language checklist:

👉 ${seedProductionUrl("/learning-center/is-your-doctor-in-network-next-year")}

${FB_POST_OFFICIAL_COMPARE_LINE}

${FB_POST_SITE_LINE}

${FB_POST_DISCLAIMER}

#MedicareEducation #ProviderNetworks`,
    },
    {
      title: "Part D formulary changes can surprise you mid-year",
      excerpt: "Educational post on prescription tier changes and appeals.",
      body: `Each Part D plan maintains its own drug list. A medication can move tiers or require prior authorization without much fanfare.

Keep your bottle handy when comparing plans on the official Medicare tool:

👉 ${MEDICARE_PLAN_COMPARE_URL}

More Part D education and free guides at ${seedProductionUrl("/learning-center")} — powered by ${SITE_BRAND_NAME}.

${FB_POST_DISCLAIMER}

#MedicareEducation #PartD`,
    },
    {
      title: "Workbook personal share (filled from template at batch create)",
      excerpt: "Personal profile share for workbook PDF.",
      body: "",
    },
  ];
}
