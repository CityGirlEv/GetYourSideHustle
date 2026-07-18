import { SITE_BRAND_NAME, SITE_BRAND_THE } from "@/lib/site-brand";
import {
  FB_POST_DISCLAIMER,
  FB_POST_OFFICIAL_COMPARE_LINE,
  FB_POST_SITE_LINE,
} from "@/lib/content-factory/facebook-post-seed-copy";
import { seedProductionUrl } from "@/lib/content-factory/seed-production-url";
import {
  DEFAULT_WORKBOOK_SLUG,
  leadMagnetPdfPublicPath,
} from "@/lib/content-factory/lead-magnet-paths";

/** Facebook Post 4 — publish on the Part B Optimizer Benchmark Tool Facebook Page. */
const WORKBOOK_PAGE_FB_SLOT = 3;
/** Facebook Post 8 — share to personal profile (after the page post). */
const WORKBOOK_PERSONAL_FB_SLOT = 7;

const WORKBOOK_ARTICLE_SLUG = "turning-65-and-still-working";

export interface WorkbookFacebookPostTemplate {
  slotIndex: number;
  title: string;
  excerpt: string;
  body: string;
  audience: "facebook_page" | "personal_profile";
}

/** Built at call time so PDF/article URLs always use production mypartb.com. */
export function buildWorkbookFacebookPostTemplates(): WorkbookFacebookPostTemplate[] {
  const articleUrl = seedProductionUrl(`/learning-center/${WORKBOOK_ARTICLE_SLUG}`);
  const workbookUrl = seedProductionUrl("/workbook");
  const optimizerUrl = seedProductionUrl("/");
  const pdfUrl = seedProductionUrl(leadMagnetPdfPublicPath(DEFAULT_WORKBOOK_SLUG));

  return [
    {
      slotIndex: WORKBOOK_PAGE_FB_SLOT,
      title: "Still working at 65? Free Medicare planning workbook (PDF)",
      excerpt: "Page post — pairs with the Still Working article + checklist teaser image + PDF link.",
      audience: "facebook_page",
      body: `📋 FREE printable PDF workbook — PBO Turning 65 Workbook

Still working at 65? Employer coverage and Medicare rules can overlap in confusing ways. Read our plain-language guide first:

👉 ${articleUrl}

Then download this fill-in checklist and gather your facts before you compare plans:

• Employer coverage details (if you're still working) — the 20-employee rule and when to delay Part B
• Every prescription and exact dosage
• Doctors, specialists, and hospitals you want to keep
• Questions to verify with Medicare.gov and SHIP

👉 Download the PDF free — no email signup:
${pdfUrl}

When you post on Facebook: attach the checklist teaser photo (generated in the calendar) as the post image so people see what the PDF looks like. Put the download link in the post text — do not upload the PDF file as the image.

Save it, print it, or share the link with someone turning 65 this year.

${FB_POST_OFFICIAL_COMPARE_LINE}

Follow ${SITE_BRAND_THE} for calm, non-sales Medicare education each week.

${FB_POST_SITE_LINE}

Educational PDF only — not enrollment advice. ${FB_POST_DISCLAIMER}

#MedicareEducation #Turning65 #StillWorking #MedicarePlanning #FreePDF`,
    },
    {
      slotIndex: WORKBOOK_PERSONAL_FB_SLOT,
      title: "Turning 65 soon — or already on Medicare?",
      excerpt: "Personal share — free Medicare checklist workbook + Part B Optimizer Benchmark Tool, no pitch.",
      audience: "personal_profile",
      body: `𝗧𝘂𝗿𝗻𝗶𝗻𝗴 𝟲𝟱 𝘀𝗼𝗼𝗻 — 𝗼𝗿 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗼𝗻 𝗠𝗲𝗱𝗶𝗰𝗮𝗿𝗲?

The nonstop sales calls and aggressive "free reviews" are exhausting. I didn't want another sales pitch; I just wanted to see how plans actually compare for my doctors and prescriptions—completely on my own, without the pressure.

That's why I created this simple, printable workbook to help you get your facts in one place before you look at a single plan.

📥 Download the Free Medicare Checklist & Workbook here (No email required, no pitch):
👉 ${pdfUrl}

What's inside the printable PDF:

The Provider Tracker: A clean space for every doctor and hospital you need to keep.

The Rx Log: Track exact dosages so you don't guess on coverage.

Working Past 65? Quick notes to map out employer coverage vs. Medicare.

The Direct Questions: Exactly what to double-check on Medicare.gov or with a SHIP counselor.

Once you have your facts down on paper, you can use ${SITE_BRAND_NAME} at ${optimizerUrl} to search and compare plans entirely on your own terms, 100% salesperson-free.

${FB_POST_OFFICIAL_COMPARE_LINE}

If you're turning 65, already on Medicare and hunting for a better fit, or just trying to prep before open enrollment, I hope this helps.

Tag a friend who is fighting the Medicare spam right now, and follow the ${SITE_BRAND_NAME} page for calm, non-sales education.

Educational PDF only — not enrollment advice. ${FB_POST_DISCLAIMER}

#MedicareEducation #Turning65 #StillWorking #MedicarePlanning #FreePDF

@followers
@highlight`,
    },
  ];
}

export function workbookFacebookPostTemplate(
  slotIndex: number,
): WorkbookFacebookPostTemplate | undefined {
  return buildWorkbookFacebookPostTemplates().find((t) => t.slotIndex === slotIndex);
}

/** True when draft copy looks like the current workbook promo (not an old tip post). */
export function draftHasWorkbookFacebookCopy(
  draft: Pick<{ title: string; body: string }, "title" | "body"> | undefined,
): boolean {
  if (!draft) return false;
  if (/localhost|127\.0\.0\.1/i.test(draft.body)) return false;
  return /planning workbook|pbo turning 65|medicare at 65 planning workbook|printable workbook|medicare checklist|provider tracker/i.test(
    `${draft.title}\n${draft.body}`,
  );
}
