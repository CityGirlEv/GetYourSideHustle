/** Canonical GYSH Privacy Policy copy (effective August 23, 2026). */

export const PRIVACY_POLICY_TITLE = "Get Your Side Hustle Privacy Policy";
export const PRIVACY_POLICY_EFFECTIVE_DATE = "August 23, 2026";

export type PrivacyPolicyBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

export type PrivacyPolicySection = {
  id: string;
  heading: string;
  blocks: PrivacyPolicyBlock[];
};

export const PRIVACY_POLICY_INTRO: string[] = [
  "Get Your Side Hustle (“GYSH,” “we,” “us,” or “our”) respects your privacy and is committed to protecting the personal information of our users.",
  "This Privacy Policy explains how information may be collected, used, stored, and shared when you visit **getyoursidehustle.com**, create an account, use the Get Your Side Hustle Match Wizard, participate in our programs, purchase a membership or service, or otherwise interact with GYSH.",
];

export const PRIVACY_POLICY_SECTIONS: PrivacyPolicySection[] = [
  {
    id: "information-we-may-collect",
    heading: "1. Information We May Collect",
    blocks: [
      { type: "p", text: "Depending on how you use GYSH, we may collect information such as:" },
      {
        type: "list",
        items: [
          "Name",
          "Email address",
          "Age or age range",
          "Account and login information",
          "Information you voluntarily provide through forms, questionnaires, surveys, or the Match Wizard",
          "Side-hustle interests, preferences, goals, skills, and availability",
          "Membership and purchase information",
          "Communications you send to us",
          "Feedback, beta-testing results, or support requests",
          "Device, browser, IP address, and general usage information",
          "Cookies and similar technologies used to operate and improve the website",
        ],
      },
      {
        type: "p",
        text: "Payment card information may be processed by third-party payment processors. GYSH does not intend to directly store full payment-card numbers on its own servers.",
      },
    ],
  },
  {
    id: "how-we-use-information",
    heading: "2. How We Use Information",
    blocks: [
      { type: "p", text: "We may use information to:" },
      {
        type: "list",
        items: [
          "Create and manage user accounts",
          "Provide personalized side-hustle recommendations",
          "Operate the GYSH Match Wizard",
          "Deliver memberships, guides, workshops, tools, and other services",
          "Process purchases and subscriptions",
          "Communicate with users regarding their accounts or services",
          "Respond to questions and provide support",
          "Improve the functionality, security, and user experience of GYSH",
          "Conduct testing, analytics, and product development",
          "Prevent fraud, misuse, or security incidents",
          "Comply with applicable legal obligations",
        ],
      },
      {
        type: "p",
        text: "We may also send promotional or educational communications when permitted by law. Users may unsubscribe from marketing emails using the unsubscribe link provided in those messages.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    heading: "3. Children’s Privacy",
    blocks: [
      {
        type: "p",
        text: "GYSH includes content and experiences intended for families, including children and teenagers.",
      },
      { type: "p", text: "We take children's privacy seriously." },
      {
        type: "p",
        text: "For users **under age 13**, GYSH will seek to comply with the Children’s Online Privacy Protection Act (“COPPA”) and other applicable children's privacy laws.",
      },
      {
        type: "p",
        text: "Where parental consent is legally required, we will obtain verifiable permission from a parent or legal guardian before knowingly collecting personal information from a child under 13, except where an applicable legal exception permits limited collection.",
      },
      {
        type: "p",
        text: "We seek to collect only information reasonably necessary for a child to participate in the applicable GYSH experience.",
      },
      { type: "p", text: "Parents or legal guardians may contact us to:" },
      {
        type: "list",
        items: [
          "Request information about personal information collected from their child",
          "Review information associated with their child",
          "Request correction or deletion of their child’s personal information",
          "Withdraw consent for future collection or use of their child’s information",
        ],
      },
      {
        type: "p",
        text: "We may take reasonable steps to verify that a person making such a request is the child’s parent or legal guardian.",
      },
    ],
  },
  {
    id: "teen-users",
    heading: "4. Teen Users",
    blocks: [
      {
        type: "p",
        text: "Users between the ages of 13 and 17 should use GYSH with the knowledge and involvement of a parent or legal guardian where appropriate.",
      },
      {
        type: "p",
        text: "Certain services, memberships, purchases, agreements, or features may require participation or authorization from an adult.",
      },
    ],
  },
  {
    id: "payments-and-subscriptions",
    heading: "5. Payments and Subscriptions",
    blocks: [
      {
        type: "p",
        text: "Payments and recurring membership charges may be processed by third-party payment providers, such as Stripe or another payment processor identified during checkout.",
      },
      {
        type: "p",
        text: "Those providers process payment information according to their own privacy policies and security practices.",
      },
      {
        type: "p",
        text: "GYSH may receive limited transaction information such as payment status, subscription status, transaction amount, customer identifier, and limited billing information necessary to manage your account.",
      },
    ],
  },
  {
    id: "cookies-analytics",
    heading: "6. Cookies, Analytics, and Similar Technologies",
    blocks: [
      { type: "p", text: "GYSH may use cookies and similar technologies to:" },
      {
        type: "list",
        items: [
          "Keep users signed in",
          "Remember preferences",
          "Understand how visitors use the website",
          "Measure website performance",
          "Improve features and content",
          "Protect the website from fraud or abuse",
        ],
      },
      {
        type: "p",
        text: "We may use third-party analytics or technology providers to assist with these functions.",
      },
      {
        type: "p",
        text: "Where required by applicable law, users will be provided appropriate choices regarding non-essential cookies or tracking technologies.",
      },
    ],
  },
  {
    id: "when-we-may-share",
    heading: "7. When We May Share Information",
    blocks: [
      {
        type: "p",
        text: "We may share information with trusted service providers that help us operate GYSH, including providers of:",
      },
      {
        type: "list",
        items: [
          "Website hosting and cloud infrastructure",
          "Authentication and account management",
          "Payment processing",
          "Email delivery",
          "Analytics",
          "Customer support",
          "Security",
          "Database and technical services",
        ],
      },
      {
        type: "p",
        text: "These providers are permitted to access information only as necessary to perform services for us and subject to applicable contractual or legal requirements.",
      },
      {
        type: "p",
        text: "We may also disclose information when reasonably necessary to comply with law, respond to lawful legal process, protect our rights or users, investigate fraud or security issues, or complete a business transaction such as a merger, acquisition, or sale.",
      },
    ],
  },
  {
    id: "sale-of-personal-information",
    heading: "8. Sale of Personal Information",
    blocks: [
      {
        type: "p",
        text: "GYSH does not intend to sell personal information for monetary compensation.",
      },
      {
        type: "p",
        text: "If our practices change or if applicable law defines certain advertising or data-sharing activities as a “sale” or “sharing,” we will provide any notices and choices required by applicable law.",
      },
    ],
  },
  {
    id: "data-retention",
    heading: "9. Data Retention",
    blocks: [
      {
        type: "p",
        text: "We retain personal information only for as long as reasonably necessary to provide our services, fulfill the purposes described in this Privacy Policy, meet legal or accounting obligations, resolve disputes, and protect the security of GYSH.",
      },
      {
        type: "p",
        text: "Information collected from children will not be retained longer than reasonably necessary for the purpose for which it was collected, consistent with applicable law.",
      },
    ],
  },
  {
    id: "data-security",
    heading: "10. Data Security",
    blocks: [
      {
        type: "p",
        text: "We use reasonable administrative, technical, and organizational safeguards designed to protect personal information.",
      },
      {
        type: "p",
        text: "However, no website, database, transmission method, or online service can guarantee absolute security.",
      },
      {
        type: "p",
        text: "Users are responsible for protecting their account credentials and should contact us promptly if they believe their account has been compromised.",
      },
    ],
  },
  {
    id: "privacy-choices-and-rights",
    heading: "11. Your Privacy Choices and Rights",
    blocks: [
      {
        type: "p",
        text: "Depending on where you live, applicable law may provide rights concerning your personal information, including the right to:",
      },
      {
        type: "list",
        items: [
          "Request access to personal information we maintain about you",
          "Request correction of inaccurate information",
          "Request deletion of certain information",
          "Obtain information about how your data is used",
          "Opt out of certain uses or disclosures",
          "Withdraw consent where processing relies on consent",
          "Exercise privacy rights without unlawful discrimination",
        ],
      },
      {
        type: "p",
        text: "We may need to verify your identity before completing certain requests.",
      },
      {
        type: "p",
        text: "Parents and legal guardians may also exercise applicable rights concerning information collected from their children.",
      },
    ],
  },
  {
    id: "california-privacy-rights",
    heading: "12. California Privacy Rights",
    blocks: [
      {
        type: "p",
        text: "California residents may have additional rights under applicable California privacy laws, including rights to know, access, correct, delete, and in certain circumstances opt out of the sale or sharing of personal information.",
      },
      {
        type: "p",
        text: "GYSH will honor applicable California privacy rights based on the requirements that apply to our business and data-processing activities.",
      },
    ],
  },
  {
    id: "third-party-websites",
    heading: "13. Third-Party Websites and Services",
    blocks: [
      {
        type: "p",
        text: "GYSH may contain links to websites, social platforms, resources, products, or services operated by third parties.",
      },
      {
        type: "p",
        text: "We are not responsible for the privacy practices, security, or content of third-party websites or services.",
      },
      {
        type: "p",
        text: "We encourage users to review the privacy policies of those providers before submitting personal information.",
      },
    ],
  },
  {
    id: "changes-to-this-policy",
    heading: "14. Changes to This Privacy Policy",
    blocks: [
      {
        type: "p",
        text: "We may update this Privacy Policy as GYSH develops or as legal, technical, or business requirements change.",
      },
      {
        type: "p",
        text: "When material changes are made, we may update the effective date, post a notice on the website, or provide additional notification where required by law.",
      },
      {
        type: "p",
        text: "Continued use of GYSH after an updated policy becomes effective constitutes acceptance of the updated policy to the extent permitted by law.",
      },
    ],
  },
  {
    id: "contact-us",
    heading: "15. Contact Us",
    blocks: [
      {
        type: "p",
        text: "Questions, privacy requests, and parental requests concerning this Privacy Policy may be submitted through the contact information provided on **getyoursidehustle.com**.",
      },
      { type: "p", text: "**Get Your Side Hustle (GYSH)**" },
      { type: "p", text: "Website: **getyoursidehustle.com**" },
      {
        type: "p",
        text: "For privacy or children’s privacy requests, please use the GYSH contact form or the designated privacy email address listed on our website.",
      },
    ],
  },
];

export function privacyPolicyPlainText(): string {
  const parts = [
    PRIVACY_POLICY_TITLE,
    `Effective Date: ${PRIVACY_POLICY_EFFECTIVE_DATE}`,
    ...PRIVACY_POLICY_INTRO.map(stripEmphasis),
  ];
  for (const section of PRIVACY_POLICY_SECTIONS) {
    parts.push(section.heading);
    for (const block of section.blocks) {
      if (block.type === "p") parts.push(stripEmphasis(block.text));
      else parts.push(...block.items.map(stripEmphasis));
    }
  }
  return parts.join("\n");
}

function stripEmphasis(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}
