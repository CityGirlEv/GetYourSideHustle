import {
  GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER,
  MPD_DISCLAIMER,
} from "@/lib/medicare-disclaimers";
import { FB_POST_DISCLAIMER } from "@/lib/content-factory/facebook-post-seed-copy";
import { SITE_BRAND_NAME, SITE_BRAND_THE } from "@/lib/site-brand";
import type { ScoutingAdAngleBundle, ScoutingAdAngleId } from "@/types/scouting-report";

/** CMS/Meta creative guardrails — append to producer notes on every angle. */
export const SCOUTING_AD_CMS_CREATIVE_RULES = `CMS/Meta safe creative rules (42 CFR §422.2262 / §423.2262):
• Match home cover hero style (src/assets/home-cover-hero.png): friendly cartoon / flat-vector Medicare education — not photorealistic, not stock insurance photography.
• No readable text, headlines, premiums, or thought-bubble copy burned into image or video frames — add all copy in Ads Manager only.
• No Medicare card, CMS/government logos or seals, carrier or plan names, star ratings, or enrollment CTAs in the creative file.
• No "free," "best," "#1," "guaranteed," "all plans," or coverage promises ("your meds are covered," "keep your doctor").
• No implied government endorsement. Destination: educational benchmark (/scenario/new) — not an enrollment form or login wall.
• Video: use approved voiceover lines word-for-word; no improvised superlatives or sales claims.`;

/** Shared visual language — same family as the home page before/after hero ad. */
export const SCOUTING_CARTOON_STYLE_BASE = `Visual style — match mypartb.com home cover hero (before/after Medicare education cartoon):
• Friendly semi-flat vector cartoon illustration — warm, approachable, NOT photorealistic and NOT glossy insurance stock art.
• Palette: soft blues, sage greens, warm cream backgrounds, subtle purple accents (brand-adjacent).
• Characters: simplified cartoon proportions, expressive faces, casual everyday clothing — diverse, dignified, age-appropriate (55–72).
• Part B Optimizer branding: circular blue PB+ logo on laptop lid only — no readable URL, no full wordmark text burned into the image.
• Props: generic unlabeled papers, blank notepads, coffee mugs without readable slogans — blur or omit any document text.
• Layout options: split before/after panel with center arrow (like cover hero), OR single-panel scene when noted.`;

export const SCOUTING_CARTOON_VIDEO_STYLE = `Animated cartoon video — same illustration family as home cover hero:
• 2D flat-vector / motion-graphics cartoon (gentle parallax or subtle character animation) — NOT AI photorealistic people, NOT Hedra lip-sync realism unless explicitly restyled as cartoon.
• 9:16 vertical for Reels/Stories; soft brand colors; no on-screen text, captions, or end cards in the exported file.
• Laptop/phone screens: solid color blocks or heavily blurred UI — no readable buttons, URLs, or "Enroll" labels.`;

/** TPMO + government + MPD — required in Meta primary text (same pattern as facebook-ad-launch). */
export function scoutingAdPrimaryText(body: string): string {
  return `${body.trim()}

${FB_POST_DISCLAIMER}

${GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER}

${MPD_DISCLAIMER}`;
}

type AngleTemplate = Omit<ScoutingAdAngleBundle, "hooksUsed" | "competitorExamples"> & {
  demographicNote: string;
  voiceoverScript: string;
};

const ANGLE_TEMPLATES: Record<ScoutingAdAngleId, AngleTemplate> = {
  turning_65: {
    angleId: "turning_65",
    angleLabel: "Turning-65 enrollment clarity",
    headline: "Turning 65? Explore Medicare basics first",
    description: "Educational Part B benchmark — private until you choose to share.",
    primaryText: scoutingAdPrimaryText(
      `Turning 65 soon? Plan mailers and phone calls can feel overwhelming before you understand the basics. ${SITE_BRAND_THE} helps you run a de-identified Part B benchmark — year of birth and ZIP3 only — so you can learn how federal guidelines may apply to your situation before talking to anyone. Educational only — not enrollment advice.`,
    ),
    demographicNote: "Hispanic/Latino couple, early 60s, warm skin tones, casual home attire",
    voiceoverScript: `Turning 65 brought a stack of mail and confusing calls. We wanted to understand the basics privately first — so we tried ${SITE_BRAND_NAME}. No phone number, no email, no salesperson on the line. Just an educational benchmark on our own schedule.`,
    imagePrompt: `${SCOUTING_CARTOON_STYLE_BASE}

Demographic: Hispanic/Latino couple in their early 60s at a kitchen table.

Split before/after composition (1024×694 or 1:1 square crop of same layout):
• LEFT — "before": both look puzzled; unlabeled envelope stack, generic papers with titles turned away; thought bubbles as empty white ovals only (NO readable text inside bubbles).
• CENTER: soft green arrow pointing right.
• RIGHT — "after": same couple smiling, relieved; silver laptop open with Part B Optimizer circular PB+ logo on lid (logo only — no URL); calm morning light.

CRITICAL — CMS/Meta safe: no readable words anywhere in the art (including bubble text, mug text, or document titles); no Medicare card; no CMS seal; no carrier names; no premiums; no "Enroll" CTA.`,
    videoPrompt: `${SCOUTING_CARTOON_VIDEO_STYLE}

Demographic: Hispanic/Latino couple, early 60s — cartoon characters consistent across scenes.

~18 seconds, 3 beats:
1) Cartoon kitchen — character glances at unlabeled mail pile, gentle frustrated expression (no readable text on mail).
2) Same characters at laptop — screen is soft blue blur; PB+ logo sticker visible on lid only.
3) Close on relaxed smiles — nod to each other; educational relief, not a sales celebration.

VO (exact — lip-sync or narration, do not paraphrase):
"Turning 65 brought a stack of mail and confusing calls. We wanted to understand the basics privately first — so we tried ${SITE_BRAND_NAME}. No phone number, no email, no salesperson on the line. Just an educational benchmark on our own schedule."

CRITICAL — CMS/Meta safe: no on-screen text; no superlatives; no coverage guarantees; disclaimer only in Ads Manager primary text.`,
    cmsComplianceNotes: SCOUTING_AD_CMS_CREATIVE_RULES,
  },
  avoid_mistakes: {
    angleId: "avoid_mistakes",
    angleLabel: "Understand options before deciding",
    headline: "Learn Medicare basics on your terms",
    description: "Educational benchmark — not a plan recommendation.",
    primaryText: scoutingAdPrimaryText(
      `Medicare research can involve many paths and tradeoffs. ${SITE_BRAND_THE} is an educational benchmark tool — not enrollment advice — that helps you explore illustrative frameworks using publicly available federal guidelines before you speak with a licensed professional.`,
    ),
    demographicNote: "Black woman, early 60s, solo researcher at dining table",
    voiceoverScript: `There were so many opinions and so much mail — I needed plain-language context before I decided anything. ${SITE_BRAND_NAME} let me explore an educational benchmark privately, with no phone or email required upfront.`,
    imagePrompt: `${SCOUTING_CARTOON_STYLE_BASE}

Demographic: Black woman in her early 60s, natural silver-streaked hair, cozy cardigan.

Split before/after:
• LEFT: same character at table, hand on temple, unlabeled papers and a blank notepad — muted blue-gray mood (no red warning icons, no "mistake" labels).
• RIGHT: same character calmer, small smile, laptop with PB+ circular logo on lid; sunlit window, sage green accents.

CRITICAL — CMS/Meta safe: no guilt/shame copy on image; no "wrong plan" text; no dollar amounts; no government imagery; no agent in business suit pitching.`,
    videoPrompt: `${SCOUTING_CARTOON_VIDEO_STYLE}

Demographic: Black woman, early 60s — cartoon style.

~16 seconds:
1) Character sorts unlabeled mail — thoughtful, not panicked.
2) Opens laptop (PB+ logo on lid); screen blurred.
3) Speaks to camera (cartoon close-up) with calm, educational tone.

VO (exact):
"There were so many opinions and so much mail — I needed plain-language context before I decided anything. ${SITE_BRAND_NAME} let me explore an educational benchmark privately, with no phone or email required upfront."

CRITICAL — CMS/Meta safe: no fear-mongering; no "costly mistake" on-screen; no specific dollar claims.`,
    cmsComplianceNotes: SCOUTING_AD_CMS_CREATIVE_RULES,
  },
  cost_education: {
    angleId: "cost_education",
    angleLabel: "Cost & premium education (illustrative)",
    headline: "Understand Medicare cost basics",
    description: "Illustrative federal benchmarks — not a quote.",
    primaryText: scoutingAdPrimaryText(
      `Part B premiums, deductibles, and out-of-pocket costs vary by situation. ${SITE_BRAND_THE} shows illustrative benchmarks based on publicly available CMS parameters — not a carrier quote. Explore educational estimates privately, then verify details with Medicare.gov or a licensed agent.`,
    ),
    demographicNote: "East Asian American couple, mid 60s, reviewing notes together",
    voiceoverScript: `I wanted to understand how Part B costs work in general — not a sales pitch. ${SITE_BRAND_NAME} walked through educational, CMS-based illustrations so I could prepare questions before talking to anyone.`,
    imagePrompt: `${SCOUTING_CARTOON_STYLE_BASE}

Demographic: East Asian American couple, mid 60s, casual sweaters.

Single-panel OR soft split: characters at table with blank notepad and calculator (no visible numbers on calculator display). Laptop nearby with PB+ logo on lid. Warm, tidy kitchen — educational mood, not financial hype.

CRITICAL — CMS/Meta safe: NO $0 premium, price tags, rate charts, or "save money" text; no carrier rate cards; no Medicare card.`,
    videoPrompt: `${SCOUTING_CARTOON_VIDEO_STYLE}

Demographic: East Asian American couple, mid 60s.

~15 seconds: cartoon characters gesture to blank notepad (no figures visible), then laptop with blurred screen and PB+ logo.

VO (exact):
"I wanted to understand how Part B costs work in general — not a sales pitch. ${SITE_BRAND_NAME} walked through educational, CMS-based illustrations so I could prepare questions before talking to anyone."

CRITICAL — CMS/Meta safe: no spoken premium amounts; no "cheapest" or "lowest cost" language.`,
    cmsComplianceNotes: SCOUTING_AD_CMS_CREATIVE_RULES,
  },
  simplify_confusion: {
    angleId: "simplify_confusion",
    angleLabel: "Simplify Medicare research",
    headline: "Medicare research without the pressure",
    description: "Private educational benchmark — you stay in control.",
    primaryText: scoutingAdPrimaryText(
      `Many people feel there are too many plan types and not enough plain-language answers. ${SITE_BRAND_THE} benchmarks your situation using de-identified inputs — no phone, no email, no login unless you choose. Educational only; connect with a licensed partner only if you opt in afterward.`,
    ),
    demographicNote: "White couple, late 50s–early 60s (cover-hero analog), suburban kitchen",
    voiceoverScript: `Medicare research felt noisy — calls, mail, conflicting advice. ${SITE_BRAND_NAME} gave us a private educational benchmark to organize our questions before talking to anyone.`,
    imagePrompt: `${SCOUTING_CARTOON_STYLE_BASE}

Demographic: White couple, late 50s to early 60s — closest to home cover hero reference.

Full before/after split (strongly match home-cover-hero.png layout):
• LEFT header area: leave blank colored bars only (NO readable "CONFUSING" text — add headline in Ads Manager).
• LEFT scene: stressed couple, papers with blank backs facing camera, empty thought-bubble ovals.
• RIGHT scene: same couple smiling at laptop with PB+ logo; brighter greens/blues.

CRITICAL — CMS/Meta safe: no readable header text in image file; no Medicare card; no government seals; no competitor logos.`,
    videoPrompt: `${SCOUTING_CARTOON_VIDEO_STYLE}

Demographic: White couple, late 50s–early 60s — cartoon cover-hero analog.

~20 seconds: living room cartoon — phone buzzes (no readable caller ID), characters exchange tired look, then research together on laptop (blurred screen, PB+ logo).

VO (exact):
"Medicare research felt noisy — calls, mail, conflicting advice. ${SITE_BRAND_NAME} gave us a private educational benchmark to organize our questions before talking to anyone."

CRITICAL — CMS/Meta safe: no disparaging named competitors; no "secret" broker language; no on-screen captions.`,
    cmsComplianceNotes: SCOUTING_AD_CMS_CREATIVE_RULES,
  },
  doctors_meds: {
    angleId: "doctors_meds",
    angleLabel: "Doctors & prescriptions context",
    headline: "Questions about doctors and meds?",
    description: "Educational workbook + benchmark — verify with official sources.",
    primaryText: scoutingAdPrimaryText(
      `Many people wonder how doctors and prescriptions fit into Medicare research. ${SITE_BRAND_THE} lets you optionally note conditions and medications in a private benchmark, then compare educational frameworks — always verify networks and formularies with official plan materials or Medicare.gov.`,
    ),
    demographicNote: "South Asian woman, early 60s, organizing a personal checklist",
    voiceoverScript: `I kept a list of doctors and medications before comparing options — ${SITE_BRAND_NAME} helped me organize educational questions to ask a licensed professional later. It did not tell me what is covered; it helped me prepare.`,
    imagePrompt: `${SCOUTING_CARTOON_STYLE_BASE}

Demographic: South Asian woman, early 60s, glasses, comfortable cardigan.

Single panel: character organizing generic pill bottles (labels turned away) and a folded paper list with names blurred/blank lines. Laptop with PB+ logo nearby. Empathetic, practical mood — not clinical hospital setting.

CRITICAL — CMS/Meta safe: no readable drug names; no pharmacy logos; no "covered / not covered" badges; no formulary promises.`,
    videoPrompt: `${SCOUTING_CARTOON_VIDEO_STYLE}

Demographic: South Asian woman, early 60s.

~18 seconds: cartoon hands place blank-label bottles in a row, tap a checklist with empty lines, then open educational benchmark on laptop (blurred UI).

VO (exact):
"I kept a list of doctors and medications before comparing options — ${SITE_BRAND_NAME} helped me organize educational questions to ask a licensed professional later. It did not tell me what is covered; it helped me prepare."

CRITICAL — CMS/Meta safe: no "your meds are covered" spoken or shown; educational preparation only.`,
    cmsComplianceNotes: SCOUTING_AD_CMS_CREATIVE_RULES,
  },
  confidence_education: {
    angleId: "confidence_education",
    angleLabel: "Educational comparison — research with clarity",
    headline: "Research Medicare on your terms",
    description: `${SITE_BRAND_NAME} — educational benchmark tool.`,
    primaryText: scoutingAdPrimaryText(
      `${SITE_BRAND_THE} helps you understand Medicare options using current federal guidelines — privately, at your pace. Get a Benchmark Tool ID stored on your device, explore your report, and decide later whether to connect with a licensed partner.`,
    ),
    demographicNote: "Multiracial friend pair (Black man + white woman), early 60s, coffee-shop style table",
    voiceoverScript: `We researched together with ${SITE_BRAND_NAME} — no sales call required upfront. It felt good to explore sample educational frameworks before scheduling a licensed agent conversation.`,
    imagePrompt: `${SCOUTING_CARTOON_STYLE_BASE}

Demographic: Two friends — Black man and white woman, both early 60s, casual weekend clothing — sitting side-by-side reviewing one laptop with PB+ logo on lid. Relaxed coffee-shop or sunroom table; supportive body language (not agent handshake).

CRITICAL — CMS/Meta safe: no "guaranteed confidence" text; no star ratings; no CMS seal; no suit-and-tie agent; screen blurred.`,
    videoPrompt: `${SCOUTING_CARTOON_VIDEO_STYLE}

Demographic: Black man and white woman, early 60s — friends researching together.

~22 seconds: cartoon two-shot, conversational gestures, laptop between them (PB+ logo, blurred screen).

VO (exact):
"We researched together with ${SITE_BRAND_NAME} — no sales call required upfront. It felt good to explore sample educational frameworks before scheduling a licensed agent conversation."

CRITICAL — CMS/Meta safe: no outcome guarantees; no enrollment CTA in video file; full disclaimer in Ads Manager only.`,
    cmsComplianceNotes: SCOUTING_AD_CMS_CREATIVE_RULES,
  },
};

const PROHIBITED_COPY_RE = /\b(free|best|#1|guaranteed|all plans)\b/i;

/** Map legacy bestAngle strings to angle ids. */
export function angleIdFromLabel(label: string): ScoutingAdAngleId {
  const lower = label.toLowerCase();
  if (lower.includes("turning")) return "turning_65";
  if (lower.includes("mistake") || lower.includes("wrong")) return "avoid_mistakes";
  if (lower.includes("cost") || lower.includes("premium")) return "cost_education";
  if (lower.includes("confus") || lower.includes("simplify")) return "simplify_confusion";
  if (lower.includes("doctor") || lower.includes("med")) return "doctors_meds";
  return "confidence_education";
}

export function buildScoutingAdAngleBundles(input: {
  competitors: { companyName: string; topHooks: string[]; painPoints: string[] }[];
}): ScoutingAdAngleBundle[] {
  const angleIds = Object.keys(ANGLE_TEMPLATES) as ScoutingAdAngleId[];

  return angleIds.map((angleId) => {
    const template = ANGLE_TEMPLATES[angleId];
    const matching = input.competitors.filter((c) => {
      const blob = [...c.topHooks, ...c.painPoints].join(" ").toLowerCase();
      if (angleId === "turning_65") return /turning|65|enrollment/.test(blob);
      if (angleId === "avoid_mistakes") return /wrong|mistake|risky|too many/.test(blob);
      if (angleId === "cost_education") return /cost|premium|deductible|copay/.test(blob);
      if (angleId === "simplify_confusion") return /confus|overwhelm|too many/.test(blob);
      if (angleId === "doctors_meds") return /doctor|med|drug|prescription/.test(blob);
      return true;
    });

    const hooksUsed = [
      ...new Set(matching.flatMap((c) => c.topHooks).filter(Boolean)),
    ].slice(0, 5);

    const competitorExamples = matching.slice(0, 4).map((c) => c.companyName);

    const { demographicNote: _demo, voiceoverScript: _vo, ...bundle } = template;

    return {
      ...bundle,
      hooksUsed:
        hooksUsed.length > 0
          ? hooksUsed
          : ["General Medicare education — no competitor hook matched this run"],
      competitorExamples,
    };
  });
}

/** QA helper — scan bundle fields for CMS-banned terms in user-facing ad copy. */
export function findScoutingAdCmsViolations(bundle: ScoutingAdAngleBundle): string[] {
  const issues: string[] = [];
  if (PROHIBITED_COPY_RE.test(bundle.headline)) {
    issues.push("Prohibited term in headline");
  }
  if (PROHIBITED_COPY_RE.test(bundle.description)) {
    issues.push("Prohibited term in description");
  }
  if (!bundle.primaryText.includes("Medicare.gov") || !bundle.primaryText.includes("1-800-MEDICARE")) {
    issues.push("Missing MPD / Medicare.gov reference in primary text");
  }
  if (!/not affiliated|not endorsed/i.test(bundle.primaryText)) {
    issues.push("Missing government affiliation disclaimer in primary text");
  }
  if (!/Educational only|educational only/i.test(bundle.primaryText)) {
    issues.push("Missing educational-only notice in primary text");
  }
  if (!/cartoon|vector|cover hero/i.test(bundle.imagePrompt)) {
    issues.push("Image prompt should reference cartoon / cover hero style");
  }
  if (/photorealistic/i.test(bundle.imagePrompt)) {
    issues.push("Image prompt must not request photorealistic style");
  }
  return issues;
}

export const SCOUTING_AD_ANGLE_ORDER = Object.keys(
  ANGLE_TEMPLATES,
) as ScoutingAdAngleId[];

export const SCOUTING_AD_ANGLE_DEMOGRAPHICS: Record<ScoutingAdAngleId, string> =
  Object.fromEntries(
    (Object.keys(ANGLE_TEMPLATES) as ScoutingAdAngleId[]).map((id) => [
      id,
      ANGLE_TEMPLATES[id].demographicNote,
    ]),
  ) as Record<ScoutingAdAngleId, string>;

export const SCOUTING_AD_ANGLE_VOICEOVERS: Record<ScoutingAdAngleId, string> =
  Object.fromEntries(
    (Object.keys(ANGLE_TEMPLATES) as ScoutingAdAngleId[]).map((id) => [
      id,
      ANGLE_TEMPLATES[id].voiceoverScript,
    ]),
  ) as Record<ScoutingAdAngleId, string>;
