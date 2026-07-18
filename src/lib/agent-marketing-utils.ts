import { AGENCY_REFERRAL_NOTICE } from "@/lib/medicare-disclaimers";
import { SITE_BRAND_NAME, SITE_BRAND_THE } from "@/lib/site-brand";
import { PRODUCTION_SITE_ORIGIN, PUBLIC_WEBSITE_HOST } from "@/lib/site-url";

export interface MarketingContent {
  topic: string;
  seoArticle: {
    title: string;
    metaDescription: string;
    body: string;
  };
  facebookPost: {
    text: string;
    cta: string;
    link: string;
  };
  infographicConcept: {
    title: string;
    panels: { title: string; description: string }[];
  };
  videoScript: {
    hook: string;
    body: string;
    cta: string;
  };
  newsletterDraft: {
    subject: string;
    previewText: string;
    body: string;
  };
  faqContent: {
    question: string;
    answer: string;
  }[];
}

export interface ComplianceCheck {
  id: string;
  name: string;
  status: "pass" | "fail";
  description: string;
}

export const TRENDING_TOPICS = [
  "Medicare Advantage vs. Medigap",
  "What Happens When You Turn 65?",
  "Can I Keep My Doctor?",
  "Understanding Medicare Costs",
  "Medicare Enrollment Deadlines",
  "Common Medicare Mistakes",
];

const MANDATORY_SEO_FOOTER =
  `Ready to better understand your Medicare options? Visit ${PRODUCTION_SITE_ORIGIN} and compare your choices with ${SITE_BRAND_THE}.`;

export function generateMarketingContent(topic: string): MarketingContent {
  const normalizedTopic = topic.trim();

  // Custom contents for pre-seeded topics
  if (normalizedTopic.toLowerCase().includes("advantage vs. medigap")) {
    return {
      topic: "Medicare Advantage vs. Medigap",
      seoArticle: {
        title: "Medicare Advantage vs. Medigap: Which is Right for You?",
        metaDescription: "Understand the key differences between Medicare Advantage and Medigap plans so you can make an informed choice with confidence.",
        body: `When you enroll in Medicare, one of the most critical decisions you will face is choosing between Medicare Advantage (Part C) and Medicare Supplement Insurance (Medigap). Both pathways offer valuable benefits, but they operate in completely different ways.

Medicare Advantage plans serve as an "all-in-one" alternative to Original Medicare. Offered by private insurance carriers approved by Medicare, these plans combine Part A, Part B, and often Part D (prescription drug coverage) into a single plan. They typically feature low monthly premiums, but they require you to use a network of doctors and charge copayments when you receive care.

In contrast, Medigap policies work alongside your Original Medicare coverage. They help pay for out-of-pocket costs like deductibles and copayments that Original Medicare doesn't cover. With Medigap, you retain the freedom to see any doctor in the nation who accepts Medicare, and your monthly costs are highly predictable, though the monthly premium is higher than Medicare Advantage.

Choosing between the two depends on your budget, healthcare needs, and preference for doctor networks.

${MANDATORY_SEO_FOOTER}`,
      },
      facebookPost: {
        text: `Are you confused by the differences between Medicare Advantage and Medigap? You are not alone! ${SITE_BRAND_THE} is here to help. Compare your choices side-by-side on our independent educational platform and choose the right option with confidence.`,
        cta: "Learn More",
        link: PRODUCTION_SITE_ORIGIN,
      },
      infographicConcept: {
        title: "Advantage vs Medigap Comparison",
        panels: [
          { title: "Plan Structure", description: "Advantage: All-in-one private network. Medigap: Supplement to Original Medicare." },
          { title: "Doctor Choice", description: "Advantage: Limited network (HMO/PPO). Medigap: Any doctor accepting Medicare nationwide." },
          { title: "Monthly Costs", description: "Advantage: Low premium, pay as you go. Medigap: Higher premium, low out-of-pocket costs." },
        ],
      },
      videoScript: {
        hook: "Medicare Advantage or Medigap? It's one of the biggest decisions you'll make when turning 65.",
        body: "Advantage plans offer low premiums and bundled benefits, but keep you in a network. Medigap costs more monthly but covers almost all out-of-pocket gaps and lets you see any Medicare doctor nationwide.",
        cta: `Head to ${PUBLIC_WEBSITE_HOST} right now to compare your Medicare options side-by-side using our free, de-identified comparison tools.`,
      },
      newsletterDraft: {
        subject: "Medicare Advantage vs. Medigap: The Unbiased Breakdown",
        previewText: "Learn how to choose between Medicare Advantage and Medigap without the sales pitch.",
        body: `Hello,

Deciding between Medicare Advantage and Medigap is a critical step in your Medicare journey. 

Medicare Advantage plans bundle your coverage, often with additional perks like dental or vision, but bind you to regional provider networks. Medigap, on the other hand, covers the cost gaps of Original Medicare and allows you to visit any provider nationwide, but carries a higher monthly premium.

At ${SITE_BRAND_THE}, we believe you deserve unbiased information. As an independent educational technology platform, we help you compare these options side-by-side.

Best regards,
${SITE_BRAND_THE} Team`,
      },
      faqContent: [
        {
          question: "Can I have both Medicare Advantage and a Medigap plan?",
          answer: "No. It is illegal for anyone to sell you a Medigap policy if you are enrolled in a Medicare Advantage plan.",
        },
        {
          question: "Which plan is more predictable for medical costs?",
          answer: "Medigap plans are generally much more predictable because they cover most deductibles and copays, leaving you with little to no unexpected out-of-pocket costs.",
        },
      ],
    };
  }

  if (normalizedTopic.toLowerCase().includes("turn 65") || normalizedTopic.toLowerCase().includes("turning 65")) {
    return {
      topic: "What Happens When You Turn 65?",
      seoArticle: {
        title: "Turning 65: Your Step-by-Step Guide to Medicare Enrollment",
        metaDescription: "Learn about the Initial Enrollment Period (IEP), enrollment guidelines, and how to avoid lifelong Medicare late-enrollment penalties.",
        body: `Turning 65 is a major milestone, and for most Americans, it marks the entry point into Medicare. Navigating this transition can feel overwhelming, but understanding the key timelines makes it simple.

Your primary window for signing up is the Initial Enrollment Period (IEP). This is a seven-month window that begins three months before the month you turn 65, includes your birth month, and extends for three months after. If you miss this period and don't have creditable employer coverage, you could face lifelong premium penalties for Part B and Part D.

Original Medicare consists of Part A (Hospital Insurance) and Part B (Medical Insurance). Part A is usually premium-free if you or your spouse worked and paid Medicare taxes for at least 10 years. Part B requires a monthly premium set by the federal government.

Additionally, you'll want to evaluate if you need a Prescription Drug Plan (Part D) or additional coverage like Medigap or Medicare Advantage.

${MANDATORY_SEO_FOOTER}`,
      },
      facebookPost: {
        text: `Turning 65 soon? Medicare enrollment doesn't have to be a headache. Discover key deadlines, compare your coverage options side-by-side, and avoid lifelong penalties. Visit ${SITE_BRAND_THE} to get started.`,
        cta: "Learn More",
        link: PRODUCTION_SITE_ORIGIN,
      },
      infographicConcept: {
        title: "Initial Enrollment Period Timeline",
        panels: [
          { title: "Months -3 to -1", description: "First 3 months to sign up. Coverage begins the month you turn 65." },
          { title: "Birth Month", description: "Enrollment during your birthday month. Coverage starts the following month." },
          { title: "Months +1 to +3", description: "Final months of IEP. Coverage starts 1-2 months after sign-up." },
        ],
      },
      videoScript: {
        hook: "If you're turning 65, you need to hear this: missing your Medicare enrollment window could cost you for the rest of your life.",
        body: "Your Initial Enrollment Period is 7 months long. Sign up during the first 3 months to make sure your coverage starts the day you turn 65 and you avoid late-enrollment penalties.",
        cta: `Visit ${PUBLIC_WEBSITE_HOST} to learn more about turning 65 and compare plans anonymously.`,
      },
      newsletterDraft: {
        subject: "Turning 65? Your Medicare Countdown Starts Now",
        previewText: "Avoid costly penalties with our 7-month Initial Enrollment Period checklist.",
        body: `Hello,

Turning 65 is an exciting milestone, but it also means it's time to tackle Medicare.

Your Initial Enrollment Period (IEP) is a crucial 7-month window. If you miss it and don't qualify for a Special Enrollment Period (such as active group employer coverage), you could face a 10% premium penalty on Part B for every 12-month period you could have had it, but didn't.

Our independent educational platform makes it easy to understand Medicare parts A, B, C, and D.

Best regards,
${SITE_BRAND_THE} Team`,
      },
      faqContent: [
        {
          question: "When should I sign up if I want coverage starting exactly at age 65?",
          answer: "You should enroll in the three months prior to your birth month. This ensures your coverage begins on the first day of your birth month.",
        },
        {
          question: "Is Medicare enrollment automatic at 65?",
          answer: "Only if you are already receiving Social Security benefits. Otherwise, you must actively sign up during your IEP.",
        },
      ],
    };
  }

  // Fallback for custom topics or other pre-seeded topics
  const cleanTopic = normalizedTopic.charAt(0).toUpperCase() + normalizedTopic.slice(1);
  return {
    topic: cleanTopic,
    seoArticle: {
      title: `${cleanTopic}: A Guide for Medicare Beneficiaries`,
      metaDescription: `Discover the facts about ${cleanTopic} and how it impacts your Medicare choices and out-of-pocket healthcare costs.`,
      body: `Understanding ${cleanTopic} is essential for making smart decisions about your Medicare coverage. Medicare can be complex, and finding clear, unbiased information is the first step toward getting the care you deserve.

When evaluating how ${cleanTopic} fits into your overall healthcare plan, consider factors such as monthly premiums, deductibles, copayments, and your access to trusted providers. 

${SITE_BRAND_THE} operates as an independent educational platform and Third-Party Marketing Organization (TPMO). We focus on providing consumers with the resources and comparison tools they need to understand their options. ${AGENCY_REFERRAL_NOTICE}

${MANDATORY_SEO_FOOTER}`,
    },
    facebookPost: {
      text: `Have questions about ${cleanTopic}? We've got answers. ${SITE_BRAND_THE} is an independent educational platform that helps you compare plans and understand your options without the sales pressure.`,
      cta: "Learn More",
      link: PRODUCTION_SITE_ORIGIN,
    },
    infographicConcept: {
      title: `Understanding ${cleanTopic}`,
      panels: [
        { title: "Key Fact", description: `How ${cleanTopic} interacts with Original Medicare.` },
        { title: "What to Look For", description: "Check premiums, deductibles, and doctor networks." },
        { title: "Next Steps", description: "Use side-by-side comparison tools to evaluate." },
      ],
    },
    videoScript: {
      hook: `Confused about ${cleanTopic}? Let's break it down in 30 seconds.`,
      body: `Understanding ${cleanTopic} is crucial for managing your out-of-pocket costs under Medicare. Compare how different plan types cover this topic.`,
      cta: `Go to ${PUBLIC_WEBSITE_HOST} to run a free, de-identified comparison today.`,
    },
    newsletterDraft: {
      subject: `What You Need to Know About ${cleanTopic}`,
      previewText: `Unbiased insights into ${cleanTopic} and your Medicare options.`,
      body: `Hello,

Today, we're taking a closer look at ${cleanTopic}.

Navigating Medicare requires understanding how specific rules, networks, and plan costs interact. Our goal is to empower you with educational tools to make comparisons easy.

Best regards,
${SITE_BRAND_THE} Team`,
    },
    faqContent: [
      {
        question: `How does ${cleanTopic} impact Medicare costs?`,
        answer: `Depending on the plan type you choose, ${cleanTopic} may be covered differently. Medicare Advantage networks or Medigap policies can affect your out-of-pocket costs.`,
      },
      {
        question: "Where can I get unbiased help?",
        answer: `You can compare options on independent educational platforms like ${SITE_BRAND_THE}, or consult official government resources like Medicare.gov.`,
      },
    ],
  };
}

export function checkMarketingCompliance(content: MarketingContent): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  // Rule 1: No government/Medicare affiliation claims
  const forbiddenGovTerms = [
    "official medicare agency",
    "government-appointed",
    "we are medicare",
    "affiliated with medicare",
    "represent the federal government",
    "represent medicare",
    "we are the government",
  ];
  let govViolation = false;
  const allText = JSON.stringify(content).toLowerCase();
  for (const term of forbiddenGovTerms) {
    if (allText.includes(term)) {
      govViolation = true;
      break;
    }
  }
  checks.push({
    id: "COMP-001",
    name: "No Federal/Government Affiliation Claims",
    status: govViolation ? "fail" : "pass",
    description: "Ensures the content does not state or imply affiliation with Medicare, CMS, or the federal government.",
  });

  // Rule 2: No insurance agency/carrier claims
  const forbiddenAgencyTerms = [
    "we sell insurance",
    "our insurance carrier",
    "we are an insurance company",
    "we are an insurance agency",
    "our insurance agency",
    "our insurance agents",
  ];
  let agencyViolation = false;
  for (const term of forbiddenAgencyTerms) {
    if (allText.includes(term)) {
      agencyViolation = true;
      break;
    }
  }
  checks.push({
    id: "COMP-002",
    name: "No Direct Insurance Broker/Agency Representation",
    status: agencyViolation ? "fail" : "pass",
    description: "Ensures the platform is positioned as an independent educational resource and TPMO, not an insurance agency selling plans.",
  });

  // Rule 3: TPMO / independent educational platform disclaimer present
  const requiredDisclaimerTerms = [
    "independent educational",
    "independent educational platform",
    "third-party marketing organization",
    "tpmo",
  ];
  let disclaimerPresent = false;
  for (const term of requiredDisclaimerTerms) {
    if (allText.includes(term)) {
      disclaimerPresent = true;
      break;
    }
  }
  checks.push({
    id: "COMP-003",
    name: "Independent Educational & TPMO Disclaimer",
    status: disclaimerPresent ? "pass" : "fail",
    description: "Verifies the presence of branding text highlighting our role as an independent educational tool or TPMO.",
  });

  // Rule 4: Mandatory SEO article CTA footer check
  const articleBody = content.seoArticle.body;
  const endsWithFooter = articleBody.trim().endsWith(MANDATORY_SEO_FOOTER);
  checks.push({
    id: "COMP-004",
    name: "Mandatory SEO Article Footer",
    status: endsWithFooter ? "pass" : "fail",
    description: `Verifies that the SEO article body ends exactly with: "${MANDATORY_SEO_FOOTER}"`,
  });

  return checks;
}
