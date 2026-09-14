/**
 * TikTok/Facebook Setup (`group-setup-helper`, Guide #063).
 * Help a client set up TikTok, a Facebook Page, or a Facebook Group/community.
 * Setup is not full social media management. The client owns the account.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const GROUP_SETUP_HELPER_REALITY_CHECK = {
  title: "SETUP IS NOT THE SAME AS FULL SOCIAL MEDIA MANAGEMENT",
  body: [
    "This starter service is about getting the client’s new social/community presence organized and ready to launch.",
    "",
    "You may help with:",
    "- Profile/page/group basics",
    "- Bio/about copy",
    "- Rules or community guidelines",
    "- Welcome/pinned post",
    "- Starter content ideas",
    "- Basic posting plan",
    "- Simple Canva graphics",
    "- Admin/moderator structure where applicable",
    "- Basic privacy/settings review with the client",
    "",
    "Do NOT promise:",
    "- Viral videos",
    "- Guaranteed followers",
    "- Guaranteed sales",
    "- Guaranteed engagement",
    "- Platform verification",
    "",
    "The CLIENT should own the account. Do not create accounts under your own identity for clients or keep their passwords unnecessarily.",
    "",
    "Do not imply that you work for, are endorsed by, or are officially affiliated with TikTok or Facebook/Meta.",
    "",
    "Tagline: Set It Up. Welcome People In. Give Them Something to Follow.",
  ].join("\n"),
};

export const GROUP_SETUP_HELPER_NOTES_WORKSHEET = `MY TIKTOK/FACEBOOK SETUP SERVICE

Starter Package: ________
Price: $____
Delivery Time: ________
Included Revisions: ____

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT SETUP

Client: ________
Platform: ________
Account/Page/Group: ________
Purpose: ________
Audience: ________
Name/Handle: ________
Bio/About: ________
Link: ________
CTA: ________
Brand Colors: ________
Rules Needed: ________
Welcome Post: ☐
Starter Content: ☐
7-Day Plan: ☐

CONTENT IDEAS
1. ________
2. ________
3. ________

HANDOFF
Client owns account: ☐
Admin roles checked: ☐
Rules delivered: ☐
Welcome content delivered: ☐
Starter content delivered: ☐
Calendar delivered: ☐
Source files delivered: ☐
Unnecessary access removed: ☐

Project Revenue: $____
Expenses: $____
Estimated Profit: $____
Hours: ____
Effective Profit/Hour: $____

Client Happy: ☐ Yes ☐ Needs Attention
Ongoing Support Offered: ☐
Rebooked: ☐ Yes ☐ Maybe ☐ No

What Worked: ________
What I Will Improve: ________

GYSH PRO TIP
DON’T HAND A CLIENT AN EMPTY PAGE.
A setup feels much more complete when the client opens it and already sees:
A CLEAR PROFILE + RULES/BOUNDARIES + A WELCOME + STARTER CONTENT + WHAT TO POST NEXT
You are not just creating an account. You are creating the STARTING SYSTEM.

STARTER CHALLENGE
Build a SAMPLE COMMUNITY LAUNCH KIT for a fictional business or group.
Create:
1. Bio/About section
2. 5 simple community rules
3. Welcome post
4. 3 starter posts/video concepts
5. 7-day content plan
6. One Canva graphic
Use fictional details so you have a portfolio sample without exposing a real client’s account.`;

export const GROUP_SETUP_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help a client set up the basic structure for a new TikTok presence, Facebook Page, or Facebook Group/community — profile basics, channels or sections where applicable, rules, welcome content, starter posts, and a simple launch plan. Tagline: Set It Up. Welcome People In. Give Them Something to Follow. Category: Social Media / Community Setup. Best for Teens where platform rules permit, Adults, Seniors / Retirees. Beginner · Very low startup · Flexible · Remote / Local · Per project / optional ongoing support · 3 - 10 hrs/week · Starter Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Smartphone or computer · Internet · Basic TikTok/Facebook familiarity · Canva or similar simple design tool · Basic writing/editing skills · Client-approved brand/business/community information · Clear project scope.",
  },
  {
    id: "before-starting",
    label: "Before starting, confirm",
    detail:
      "Which platform(s) — Facebook Page, Facebook Group, TikTok account/presence, or combination · Purpose/audience · Brand/community name · Bio/about information · Logo/profile image · Contact/link information · Community rules needed · Content topics · Who will be account owner/admin · What access you are authorized to have · Deadline · Number of starter posts · Revision limit.",
  },
  {
    id: "access",
    label: "Access and policies",
    detail:
      "Use official platform roles/permissions where available instead of sharing passwords. Verify current platform features, age rules, account requirements, permissions, and policies because they can change. Do not keep client passwords unnecessarily. The client should own the account.",
  },
];

export const GROUP_SETUP_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "TikTok", url: "https://www.tiktok.com/", note: "Creator / business presence" },
  { label: "TikTok Help Center", url: "https://support.tiktok.com/", note: "Current features, age rules, and policies" },
  { label: "Facebook Pages", url: "https://www.facebook.com/business/pages", note: "Page setup — labels can change" },
  { label: "Facebook Groups", url: "https://www.facebook.com/groups/create", note: "Group / community setup" },
  { label: "Facebook Help Center", url: "https://www.facebook.com/help", note: "Current Page/Group features and policies" },
  { label: "Canva", url: "https://www.canva.com/", note: "Simple profile, cover, and post graphics" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Bio, rules, and welcome copy" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Content plan and tracking" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "7-day launch plan" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "File sharing" },
  { label: "Dropbox", url: "https://www.dropbox.com/", note: "File sharing" },
];

export const GROUP_SETUP_HELPER_SUPPLIES = {
  starterKitTotal:
    "About $0–15 to start — do not buy expensive social-media software for a beginner setup service",
  items: [
    { id: "device", name: "Smartphone / computer", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet access", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "brand", name: "Client brand / community details", qty: "1", estCost: "$0", notes: "Essential — client provides" },
    { id: "logo", name: "Logo / profile image if available", qty: "1", estCost: "$0", notes: "Essential — client provides" },
    { id: "photos", name: "Client-approved photos / assets", qty: "1 set", estCost: "$0", notes: "Essential — licensed/owned only" },
    { id: "notes", name: "Notes / checklist", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "files", name: "File-sharing method", qty: "1", estCost: "$0", notes: "Essential — Drive or Dropbox" },
    { id: "canva", name: "Canva", qty: "1", estCost: "$0", notes: "Helpful — free plan first", optional: true },
    { id: "docs", name: "Google Docs", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "drive", name: "Google Drive", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "sheets", name: "Google Sheets", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "calendar", name: "Calendar", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "brandkit", name: "Client brand colors / fonts", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "ideas", name: "Content idea list", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
  ],
};

export const GROUP_SETUP_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "gs_tiktok",
    name: "TikTok",
    freePlanAvailable: true,
    costNote: "Creator or business presence — verify current features and age rules",
    url: "https://www.tiktok.com/",
  },
  {
    id: "gs_tiktok_help",
    name: "TikTok Help Center",
    freePlanAvailable: true,
    costNote: "Official feature, age, and policy instructions (they change)",
    url: "https://support.tiktok.com/",
  },
  {
    id: "gs_fb_pages",
    name: "Facebook Pages",
    freePlanAvailable: true,
    costNote: "Page setup — use current labels in Help Center",
    url: "https://www.facebook.com/business/pages",
  },
  {
    id: "gs_fb_groups",
    name: "Facebook Groups",
    freePlanAvailable: true,
    costNote: "Group / community setup where applicable",
    url: "https://www.facebook.com/groups/create",
  },
  {
    id: "gs_fb_help",
    name: "Facebook Help Center",
    freePlanAvailable: true,
    costNote: "Official Page/Group settings and policies",
    url: "https://www.facebook.com/help",
  },
  {
    id: "gs_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple profile, cover, and starter graphics",
    url: "https://www.canva.com/",
  },
  {
    id: "gs_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Bio, rules, welcome copy, and handoff notes",
    url: "https://docs.google.com/",
  },
  {
    id: "gs_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Intake checklist on your phone",
  },
  {
    id: "gs_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Content plan and prospect tracker",
    url: "https://sheets.google.com/",
  },
  {
    id: "gs_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "7-day launch plan",
    url: "https://calendar.google.com/",
  },
  {
    id: "gs_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Share source files with the client",
    url: "https://drive.google.com/",
  },
  {
    id: "gs_dropbox",
    name: "Dropbox",
    freePlanAvailable: true,
    costNote: "Alternate file sharing",
    url: "https://www.dropbox.com/",
    optional: true,
  },
  {
    id: "gs_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "TikTok/Facebook + Canva + Google Docs + Google Sheets",
  },
];

export const GROUP_SETUP_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Keep displayed pricing: $15 – $50 / project (examples).",
    "",
    "Define exactly what is included before starting. Do not offer unlimited revisions.",
    "Do not promise viral videos, followers, sales, engagement, or platform verification.",
  ].join("\n"),
  raiseTip:
    "Possible add-ons: extra starter posts, Canva graphics, additional platform, content calendar, extra revision round, or ongoing weekly posting/support. Displayed range: $15 – $50 / project (examples). Examples only — not income guarantees.",
  items: [
    {
      id: "quick",
      label: "Quick setup",
      price: "$15–$20",
      notes: "Basic profile/page/group organization, bio/about copy, and simple settings checklist",
    },
    {
      id: "starter",
      label: "Starter community setup",
      price: "$25–$35",
      notes: "Setup assistance + rules + welcome post + 3 starter content ideas/posts",
    },
    {
      id: "full",
      label: "Full basic launch setup",
      price: "$40–$50+",
      notes: "More complete setup across agreed features, starter graphics/content, and basic launch calendar",
    },
    { id: "posts", label: "Add-on: Extra starter posts", price: "Agree in advance" },
    { id: "graphics", label: "Add-on: Canva graphics", price: "Agree in advance" },
    { id: "platform", label: "Add-on: Additional platform", price: "Agree in advance" },
    { id: "calendar", label: "Add-on: Content calendar", price: "Agree in advance" },
    { id: "revision", label: "Add-on: Additional revision round", price: "Agree in advance" },
    { id: "ongoing", label: "Add-on: Ongoing weekly posting/support", price: "Agree in advance" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only — never ✓. */
export const GROUP_SETUP_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Client’s Community or Channel Goal",
    desc: [
      "Ask:",
      "- What is this account/page/group for?",
      "- Who should follow/join?",
      "- What should people learn, feel, or do?",
      "- Is it a brand, business, hobby, support community, club, creator presence, or local group?",
      "- Which platform(s) are included?",
      "",
      "Write:",
      "Purpose: ________",
      "Audience: ________",
      "Main Topic: ________",
      "Primary CTA: ________",
      "",
      "Do not start designing before you understand the purpose.",
      "Treat Facebook Page, Facebook Group, and TikTok as related but not identical — use channels/sections only where that platform actually has them.",
    ].join("\n"),
  },
  {
    title: "Create One Clear Starter Package",
    desc: [
      "Example:",
      "",
      "SOCIAL/COMMUNITY STARTER SETUP",
      "Includes:",
      "- 1 agreed platform setup",
      "- Basic profile/about organization",
      "- Rules/community guidelines where applicable",
      "- 1 welcome/pinned post",
      "- 3 starter content pieces/ideas",
      "- 1 basic 7-day content plan",
      "- Up to 2 revision rounds",
      "",
      "Starting Price: $____",
      "Delivery: ____ days",
      "",
      "Specify whether the client publishes content or you are authorized to publish it.",
      "See Suggested Pricing — $15 – $50 / project (examples).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about your service. Pick only 2 or 3 this month.",
      "",
      "Good channels:",
      "☐ Referrals",
      "☐ Facebook",
      "☐ LinkedIn",
      "☐ Local business/community groups",
      "☐ Small-business networking",
      "☐ Friends/family",
      "☐ Direct outreach to appropriate small organizations",
      "☐ Community organizations",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write:",
      "What I Sell: TikTok/Facebook Setup",
      "Starting Price: $____",
      "Ideal Client: ________",
      "",
      "Set ONE measurable goal per selected channel. Examples:",
      "- Contact 8 small businesses/organizations",
      "- Post 3 examples/tips",
      "- Ask 5 people for referrals",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "- Simple service graphic",
      "- Short service description",
      "- Starter package/pricing",
      "- 1–3 sample welcome posts or mockups",
      "- Contact method",
      "",
      "Sample:",
      "",
      "STARTING A NEW FACEBOOK COMMUNITY OR TIKTOK PRESENCE?",
      "",
      "I can help organize the basics:",
      "- Profile/About Setup",
      "- Community Rules",
      "- Welcome Post",
      "- Starter Content",
      "- Simple Launch Plan",
      "",
      "Packages start at $____.",
      "",
      "You own and control your account.",
      "",
      "Do not imply that you work for, are endorsed by, or are officially affiliated with TikTok or Facebook/Meta.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only your selected 2–3 channels.",
      "",
      "This week:",
      "- Contact 8–12 appropriate prospects",
      "- Share examples",
      "- Ask for referrals",
      "- Respond promptly",
      "- Follow up once when appropriate",
      "",
      "Sample:",
      "“Hi! I help new businesses and community organizers get their Facebook/TikTok presence set up and launch-ready — profile basics, rules, welcome content, starter posts, and a simple content plan. My starter projects begin at $____.”",
      "",
      "Track: Date | Prospect | Channel | Response | Follow-Up",
      "",
      "Do not spam or mass-message unrelated people.",
    ].join("\n"),
  },
  {
    title: "Collect the Client’s Setup Information",
    desc: [
      "CLIENT: ________",
      "PLATFORM(S): ________",
      "PAGE/GROUP/ACCOUNT TYPE: ________",
      "NAME: ________",
      "PURPOSE: ________",
      "AUDIENCE: ________",
      "BIO/ABOUT: ________",
      "WEBSITE/LINK: ________",
      "CONTACT INFO: ________",
      "BRAND COLORS: ________",
      "LOGO/PROFILE IMAGE: ________",
      "CONTENT TOPICS: ________",
      "CTA: ________",
      "RULES NEEDED: ________",
      "ADMINS/MODERATORS: ________",
      "DEADLINE: ________",
      "",
      "Confirm everything in writing.",
      "Use official platform roles/permissions where available instead of sharing passwords.",
    ].join("\n"),
  },
  {
    title: "Organize the Profile/Page/Group Basics",
    desc: [
      "With client authorization:",
      "- Confirm correct name/handle where available",
      "- Add client-approved profile image/logo",
      "- Add cover image where applicable",
      "- Add bio/about description",
      "- Add approved link/contact information",
      "- Review relevant visibility/privacy/settings with client",
      "- Confirm correct owner/admin structure",
      "",
      "Do not change security, ownership, monetization, payment, or sensitive settings without explicit client approval.",
      "Verify current platform features and labels in official Help Centers — they can change.",
    ].join("\n"),
  },
  {
    title: "Create Rules & the Welcome Experience",
    desc: [
      "For a community/group, draft simple rules such as:",
      "1. Be respectful",
      "2. Stay on topic",
      "3. No spam",
      "4. No harassment/hate",
      "5. Protect private information",
      "6. Follow platform/community policies",
      "",
      "Tailor rules to the client’s community.",
      "",
      "Create a welcome/pinned post:",
      "“Welcome to [NAME]! This community is for [AUDIENCE/PURPOSE]. Start by introducing yourself and telling us [simple prompt]. Please review our community rules before posting.”",
      "",
      "For a TikTok creator/business presence without group rules, use this step to define comment/community boundaries, moderation expectations, and a welcome/introduction video concept.",
    ].join("\n"),
  },
  {
    title: "Create the Starter Content",
    desc: [
      "Build at least 3 useful starter pieces.",
      "",
      "Suggested mix:",
      "POST 1 — Welcome / Who We Are",
      "POST 2 — Helpful Tip / Value",
      "POST 3 — Conversation Starter / CTA",
      "",
      "For TikTok:",
      "- Intro video concept",
      "- Helpful tip video",
      "- Question/story/behind-the-scenes concept",
      "",
      "For Facebook:",
      "- Welcome/pinned post",
      "- Value post",
      "- Engagement/community post",
      "",
      "Each content item should include:",
      "Hook · Main Message · CTA · Visual/Video Idea",
      "",
      "Use only client-owned/licensed media.",
    ].join("\n"),
  },
  {
    title: "Build the 7-Day Launch Plan",
    desc: [
      "Create a simple plan the client can actually follow.",
      "",
      "Example:",
      "Day 1 — Welcome/intro",
      "Day 2 — Helpful tip",
      "Day 3 — Question/poll",
      "Day 4 — Behind the scenes",
      "Day 5 — Resource/product/service highlight",
      "Day 6 — Community conversation",
      "Day 7 — Recap/CTA",
      "",
      "Do not recommend posting just to fill space. Match frequency to the client’s capacity.",
      "",
      "Add:",
      "Who posts? ________",
      "Who responds to comments? ________",
      "Who handles moderation? ________",
    ].join("\n"),
  },
  {
    title: "Hand Off, Review & Offer Next-Step Support",
    desc: [
      "Before closing:",
      "- Review profile/page/group with client",
      "- Confirm owner/admin access",
      "- Confirm rules",
      "- Confirm welcome/pinned content",
      "- Deliver starter content",
      "- Deliver 7-day plan",
      "- Deliver Canva/source files promised",
      "- Remove unnecessary access when project ends",
      "- Confirm client knows basic posting/moderation workflow",
      "",
      "Ask: “Would you like help creating next month’s starter content or maintaining a simple content calendar?”",
      "",
      "SETUP → WELCOME → STARTER CONTENT → CONSISTENT POSTING → COMMUNITY RESPONSE → NEXT PROJECT",
    ].join("\n"),
  },
];

export function groupSetupHelperToolsDisclaimer(): string {
  return "Beginner stack: TikTok/Facebook + Canva + Google Docs + Google Sheets. Use official platform Help Center instructions for current feature-specific steps — labels and policies can change. The client should own the account. Do not keep passwords unnecessarily. Do not imply TikTok or Facebook/Meta affiliation.";
}

/** Weekly TikTok/Facebook setup profit math. */
export function computeGroupSetupHelperProfit(input: {
  averageProjectPrice: number;
  projectsPerWeek: number;
  addOnRevenue?: number;
  softwareDesign?: number;
  advertising?: number;
  travel?: number;
  otherExpenses?: number;
  averageHoursPerProject?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const price = Math.max(0, Number(input.averageProjectPrice) || 0);
  const projects = Math.max(0, Number(input.projectsPerWeek) || 0);
  const addOns = Math.max(0, Number(input.addOnRevenue) || 0);
  const weeklyRevenue = price * projects + addOns;
  const weeklyExpenses =
    Math.max(0, Number(input.softwareDesign) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const hoursPer = Math.max(0, Number(input.averageHoursPerProject) || 0);
  const weeklyHours = hoursPer * projects;
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
