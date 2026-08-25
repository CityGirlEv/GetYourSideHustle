/** GYSH Beta Tester Confidentiality and Non-Disclosure Agreement. */

export const BETA_NDA_TITLE = "GYSH Beta Tester Confidentiality and Non-Disclosure Agreement";
export const BETA_NDA_PROGRAM = "Beta Testing Program";
export const BETA_NDA_EFFECTIVE_LABEL = "Date accepted by Beta Tester";
/** Immutable version stamp stored with each acceptance so later revisions stay auditable. */
export const BETA_NDA_VERSION = "GYSH-BETA-NDA-v1.0";

export type BetaNdaBlock = { type: "p"; text: string } | { type: "list"; items: string[] };

export type BetaNdaSection = {
  id: string;
  heading: string;
  blocks: BetaNdaBlock[];
};

export const BETA_NDA_INTRO: string[] = [
  "This Beta Tester Confidentiality and Non-Disclosure Agreement (“Agreement”) is entered into between **Get Your Side Hustle (“GYSH”)** and the individual participating in the GYSH beta testing program (“Beta Tester”).",
  "By accepting this Agreement and accessing the GYSH beta testing environment, the Beta Tester agrees to the following terms.",
];

export const BETA_NDA_SECTIONS: BetaNdaSection[] = [
  {
    id: "purpose",
    heading: "1. Purpose",
    blocks: [
      {
        type: "p",
        text: "GYSH is providing the Beta Tester with temporary access to certain pre-release products, services, features, technology, content, business processes, and other materials for the limited purpose of evaluating GYSH and providing testing feedback before public release.",
      },
      {
        type: "p",
        text: "Participation in the beta program does not grant the Beta Tester any ownership rights in GYSH or its products, content, technology, branding, or intellectual property.",
      },
    ],
  },
  {
    id: "confidential-information",
    heading: "2. Confidential Information",
    blocks: [
      {
        type: "p",
        text: "“Confidential Information” includes non-public information disclosed or made available to the Beta Tester through participation in the GYSH beta program, including but not limited to:",
      },
      {
        type: "list",
        items: [
          "Pre-release versions of the GYSH website or applications",
          "The GYSH Match Wizard and its functionality",
          "Questions, logic, workflows, recommendation methods, and results",
          "User flows and product functionality",
          "Membership structures and unreleased pricing",
          "Business models and business strategies",
          "Product plans and future features",
          "Technical architecture and system behavior",
          "Screenshots, screen recordings, demonstrations, prototypes, and testing materials",
          "Test cases and testing procedures",
          "Bugs, errors, vulnerabilities, or defects discovered during testing",
          "Internal documentation",
          "Marketing plans and launch strategies",
          "Proprietary written, graphic, audio, or video content",
          "Any other information that a reasonable person would understand to be confidential or pre-release",
        ],
      },
      {
        type: "p",
        text: "Information does not become non-confidential merely because the Beta Tester remembers it rather than retaining a physical or electronic copy.",
      },
    ],
  },
  {
    id: "responsibilities",
    heading: "3. Beta Tester Responsibilities",
    blocks: [
      { type: "p", text: "The Beta Tester agrees to:" },
      {
        type: "list",
        items: [
          "Use Confidential Information only for authorized GYSH beta testing.",
          "Keep beta access credentials private.",
          "Not share access to the beta testing environment with another person.",
          "Not copy, reproduce, distribute, sell, publish, or disclose Confidential Information except as authorized by GYSH.",
          "Not post screenshots, screen recordings, videos, descriptions, results, or other information about the beta program on social media, websites, forums, Discord servers, groups, or other public or private communities without prior authorization from GYSH.",
          "Not publicly discuss unreleased GYSH features or functionality.",
          "Promptly report discovered bugs, errors, vulnerabilities, or other issues to GYSH rather than publicly disclosing them.",
          "Not intentionally attempt to access systems, accounts, information, or areas of the GYSH platform outside the scope of authorized testing.",
          "Not use information learned during testing to create or assist in creating a competing or substantially copied product.",
        ],
      },
    ],
  },
  {
    id: "testing-materials-and-feedback",
    heading: "4. Testing Materials and Feedback",
    blocks: [
      { type: "p", text: "The Beta Tester may provide GYSH with feedback including:" },
      {
        type: "list",
        items: [
          "Bug reports",
          "Suggestions",
          "Comments",
          "Recommendations",
          "Usability observations",
          "Test results",
          "Ideas for improvements",
        ],
      },
      {
        type: "p",
        text: "The Beta Tester grants GYSH permission to use beta-testing feedback for the development, improvement, operation, and marketing of GYSH without additional payment or obligation.",
      },
      {
        type: "p",
        text: "The Beta Tester retains ownership of any pre-existing intellectual property they owned before participating in the GYSH beta program.",
      },
    ],
  },
  {
    id: "screenshots-and-recordings",
    heading: "5. Screenshots and Recordings",
    blocks: [
      {
        type: "p",
        text: "Screenshots, screen recordings, photographs, or recordings of the beta environment may be created only for purposes of submitting testing feedback to GYSH unless GYSH provides permission for another use.",
      },
      {
        type: "p",
        text: "Such materials may not be publicly posted, distributed, or shared without prior authorization from GYSH.",
      },
    ],
  },
  {
    id: "exceptions",
    heading: "6. Exceptions",
    blocks: [
      {
        type: "p",
        text: "Confidential Information does not include information that the Beta Tester can demonstrate:",
      },
      {
        type: "list",
        items: [
          "Was publicly available before GYSH disclosed it;",
          "Becomes publicly available through no breach of this Agreement;",
          "Was lawfully known to the Beta Tester before disclosure by GYSH;",
          "Was lawfully received from another source without a confidentiality obligation; or",
          "Was independently developed without use of GYSH Confidential Information.",
        ],
      },
      {
        type: "p",
        text: "Nothing in this Agreement prohibits disclosures required by applicable law, court order, subpoena, or lawful government request.",
      },
      {
        type: "p",
        text: "Where legally permitted, the Beta Tester should provide GYSH reasonable notice of such a request before disclosure.",
      },
    ],
  },
  {
    id: "beta-access",
    heading: "7. Beta Access",
    blocks: [
      {
        type: "p",
        text: "Participation in the beta program is temporary and may be modified, suspended, or terminated by GYSH.",
      },
      {
        type: "p",
        text: "GYSH may revoke beta access if a participant violates this Agreement, misuses the beta environment, or engages in conduct that threatens the security or integrity of GYSH systems or users.",
      },
      {
        type: "p",
        text: "Upon termination of beta participation, the Beta Tester must discontinue use of beta access and, when requested, delete confidential testing materials in their possession.",
      },
    ],
  },
  {
    id: "beta-software",
    heading: "8. Beta Software and Services",
    blocks: [
      { type: "p", text: "The Beta Tester understands that beta products may:" },
      {
        type: "list",
        items: [
          "Contain bugs or errors;",
          "Operate differently than the final released product;",
          "Change during the testing period;",
          "Be temporarily unavailable; or",
          "Include incomplete functionality.",
        ],
      },
      { type: "p", text: "Beta access is provided for evaluation and testing purposes." },
    ],
  },
  {
    id: "compensation-and-rewards",
    heading: "9. Compensation and Rewards",
    blocks: [
      {
        type: "p",
        text: "Participation in the GYSH beta program may qualify a Beta Tester for rewards based upon criteria established by GYSH, which may include:",
      },
      {
        type: "list",
        items: [
          "Number of completed test cases;",
          "Recorded testing time;",
          "Quality and usefulness of feedback; and",
          "Identification of significant defects or usability issues.",
        ],
      },
      {
        type: "p",
        text: "Potential rewards may include complimentary GYSH membership, Consulting Sessions, or other benefits announced for the applicable testing round.",
      },
      {
        type: "p",
        text: "Meeting time or test-count thresholds does not excuse fraudulent, incomplete, duplicate, automated, or bad-faith testing.",
      },
      {
        type: "p",
        text: "GYSH reserves the right to review testing activity and determine final reward eligibility.",
      },
    ],
  },
  {
    id: "intellectual-property",
    heading: "10. Intellectual Property",
    blocks: [
      {
        type: "p",
        text: "All rights, title, and interest in GYSH products and materials—including trademarks, branding, software, content, designs, workflows, methodologies, documentation, and proprietary technology—remain the property of their respective owners.",
      },
      {
        type: "p",
        text: "Nothing in this Agreement transfers ownership of GYSH intellectual property to the Beta Tester.",
      },
    ],
  },
  {
    id: "no-public-announcement",
    heading: "11. No Public Announcement",
    blocks: [
      {
        type: "p",
        text: "Participation in the GYSH beta program does not authorize the Beta Tester to publicly announce that they are working for, partnering with, representing, or acting as an agent of GYSH.",
      },
      {
        type: "p",
        text: "Beta Testers are independent participants providing product feedback.",
      },
    ],
  },
  {
    id: "confidentiality-period",
    heading: "12. Confidentiality Period",
    blocks: [
      {
        type: "p",
        text: "The Beta Tester’s confidentiality obligations continue during participation in the beta program and for **three (3) years following the end of participation**.",
      },
      {
        type: "p",
        text: "Information qualifying as a legally protected trade secret will remain protected for as long as it continues to qualify for such protection under applicable law.",
      },
    ],
  },
  {
    id: "violations",
    heading: "13. Violations",
    blocks: [
      {
        type: "p",
        text: "The Beta Tester acknowledges that unauthorized disclosure of Confidential Information may cause harm to GYSH.",
      },
      {
        type: "p",
        text: "GYSH may pursue remedies available under applicable law if this Agreement is violated.",
      },
    ],
  },
  {
    id: "entire-agreement",
    heading: "14. Entire Agreement",
    blocks: [
      {
        type: "p",
        text: "This Agreement represents the understanding between GYSH and the Beta Tester concerning confidentiality related to the GYSH beta testing program and supersedes prior discussions concerning the same subject.",
      },
      {
        type: "p",
        text: "If any provision is found unenforceable, the remaining provisions will continue in effect to the extent permitted by law.",
      },
    ],
  },
  {
    id: "electronic-acceptance",
    heading: "15. Electronic Acceptance",
    blocks: [
      {
        type: "p",
        text: "By electronically selecting **“I Agree,” “Accept NDA,” “Sign,”** or a similar acknowledgment and submitting their name through the GYSH beta testing portal, the Beta Tester confirms that:",
      },
      {
        type: "list",
        items: [
          "They have read this Agreement;",
          "They understand its terms;",
          "They voluntarily agree to be bound by it; and",
          "They intend their electronic acceptance to constitute their agreement to these terms.",
        ],
      },
    ],
  },
];

export type BetaNdaAcceptanceInput = {
  agreed?: unknown;
  legalName?: unknown;
  email?: unknown;
  signature?: unknown;
  acceptedAt?: unknown;
  ndaVersion?: unknown;
};

function normalizePersonName(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

/** ISO date (YYYY-MM-DD) for the acceptance line. */
export function betaNdaTodayDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Validate electronic NDA acceptance. Returns null when the payload is ready to store.
 */
export function betaNdaAcceptanceError(input: BetaNdaAcceptanceInput): string | null {
  const version = String(input.ndaVersion ?? BETA_NDA_VERSION).trim();
  if (version !== BETA_NDA_VERSION) {
    return "This NDA version is out of date. Refresh and accept the current agreement.";
  }
  if (input.agreed !== true) {
    return "Accept the Beta Tester NDA to apply.";
  }
  const legalName = normalizePersonName(input.legalName);
  if (legalName.length < 2) {
    return "Enter your full legal name on the NDA.";
  }
  const email = String(input.email ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return "Enter the email on the NDA.";
  }
  const signature = normalizePersonName(input.signature);
  if (!signature) {
    return "Type your name as your electronic signature.";
  }
  if (signature.toLowerCase() !== legalName.toLowerCase()) {
    return "Electronic signature must match your full legal name.";
  }
  return null;
}

export function formatBetaNdaAcceptanceNote(
  input: { legalName: string; email: string; acceptedAt: string },
): string {
  const name = normalizePersonName(input.legalName);
  const email = String(input.email).trim().toLowerCase();
  const day = String(input.acceptedAt || "").slice(0, 10) || betaNdaTodayDate();
  return `NDA accepted ${day} by ${name} <${email}>`;
}

/**
 * Public register must send a valid NDA payload when applying as a Beta Tester.
 * Returns null when no beta application is requested, or when acceptance is valid.
 */
export function betaNdaRegisterError(
  applyBetaTester: boolean,
  nda: BetaNdaAcceptanceInput | null | undefined,
  accountEmail: string,
): string | null {
  if (!applyBetaTester) return null;
  const err = betaNdaAcceptanceError(nda ?? {});
  if (err) return err;
  const ndaEmail = String(nda?.email ?? "")
    .trim()
    .toLowerCase();
  const account = String(accountEmail ?? "")
    .trim()
    .toLowerCase();
  if (ndaEmail !== account) {
    return "NDA email must match your account email.";
  }
  return null;
}

export function betaNdaPlainText(): string {
  const parts = [
    BETA_NDA_TITLE,
    "Get Your Side Hustle (GYSH)",
    BETA_NDA_PROGRAM,
    `Effective Date: ${BETA_NDA_EFFECTIVE_LABEL}`,
    ...BETA_NDA_INTRO.map(stripEmphasis),
  ];
  for (const section of BETA_NDA_SECTIONS) {
    parts.push(section.heading);
    for (const block of section.blocks) {
      if (block.type === "p") parts.push(stripEmphasis(block.text));
      else parts.push(...block.items.map(stripEmphasis));
    }
  }
  parts.push("Get Your Side Hustle (GYSH)", "getyoursidehustle.com");
  return parts.join("\n");
}

function stripEmphasis(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}
