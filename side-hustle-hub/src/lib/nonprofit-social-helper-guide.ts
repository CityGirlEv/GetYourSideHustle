/**
 * Church/Nonprofit Social Media Helper (`nonprofit-social-helper`, Guide #046).
 * Approved event reminders, volunteer spotlights, and recurring community posts.
 * You post for the organization — not as yourself. Plain data only (no guide-tools imports).
 */

export const NONPROFIT_SOCIAL_HELPER_REALITY_CHECK = {
  title: "YOU ARE POSTING FOR AN ORGANIZATION, NOT SPEAKING FOR YOURSELF",
  body: [
    "Every post should follow the church/nonprofit’s approved voice, policies, privacy rules, and authorization process.",
    "",
    "Before publishing, know:",
    "- Who approves content",
    "- Which platforms are included",
    "- What information is public",
    "- Who may appear in photos",
    "- Whether minors appear",
    "- Which events/programs may be promoted",
    "- Who handles comments/messages",
    "- Which topics require leadership approval",
    "",
    "Never post confidential member/client information, private prayer/care details, donor information, internal disputes, financial details, children’s identifying information, or sensitive stories without explicit authorization.",
    "",
    "Do not promise fundraising results, attendance, reach, followers, or engagement.",
    "",
    "Tagline: Keep the Mission Visible. Keep the Community Informed.",
  ].join("\n"),
};

export const NONPROFIT_SOCIAL_HELPER_NOTES_WORKSHEET = `MY CHURCH/NONPROFIT SOCIAL MEDIA SERVICE

Starter Package: ________
Price: $____
Platforms: ________
Posts Included: ____
Graphics Included: ____
Revision Rounds: ____
Draft/Schedule/Publish: ________

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT

Organization: ________
Mission: ________
Audience: ________
Primary CTA: ________
Approver: ________
Platforms: ________
Posting Frequency: ________
Brand Colors: ________
Logo Received: ☐
Photo/Media Rules: ________
Minor/Privacy Rules: ________
Comment/DM Rules: ________

CONTENT PILLARS

1. ------------------------------------------------------------------------
2. ------------------------------------------------------------------------
3. ------------------------------------------------------------------------
4. ------------------------------------------------------------------------

UPCOMING CONTENT

Event Reminders: ________
Volunteer Spotlights: ________
Program Updates: ________
Community Resources: ________
Other: ________

APPROVAL CHECK

Facts Verified: ☐
Date/Time Verified: ☐
Links Verified: ☐
Photo Permission: ☐
Minor Consent if applicable: ☐
Caption Approved: ☐
Graphic Approved: ☐
Scheduled/Published: ☐

RESULTS

Posts Published: ____
Best Post/Topic: ________
Reach/Views: ________
Engagement: ________
Clicks/Responses: ________
What Worked: ________
What To Improve: ________

BUSINESS RESULTS

Project/Monthly Revenue: $____
Expenses: $____
Estimated Profit: $____
Hours: ____
Effective Profit/Hour: $____

Recurring Support Offered: ☐
Rebooked: ☐ Yes ☐ Maybe ☐ No

GYSH PRO TIP
CHURCHES AND NONPROFITS USUALLY DON’T HAVE A SHORTAGE OF THINGS HAPPENING.
THEY HAVE A SHORTAGE OF TIME TO TURN THOSE THINGS INTO CONSISTENT CONTENT.
Your value is building a repeatable flow:
WHAT’S HAPPENING? → GET THE DETAILS → CREATE THE POST → GET APPROVAL → PUBLISH → REVIEW → REPEAT
Consistency becomes much easier when you collect next month’s events, programs, volunteer stories, and announcements BEFORE the month begins.

PRO CHALLENGE
Build a FICTIONAL 2-WEEK NONPROFIT CONTENT PACK.
Create:
1. One event reminder
2. One volunteer spotlight
3. One program update
4. One community-resource post
5. One engagement post
6. One thank-you post
7. Matching simple Canva graphics
8. A 2-week content calendar
9. An approval tracker
Use fictional names/photos/details so the sample can be shown safely to prospective organizations.`;

export const NONPROFIT_SOCIAL_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help churches and nonprofits keep their social pages active with approved event reminders, volunteer spotlights, program updates, community announcements, and simple recurring content. Tagline: Keep the Mission Visible. Keep the Community Informed. Category: Social Media / Community Support. Best for Teens where appropriate, Adults, Seniors / Retirees. Beginner to intermediate · Very low startup · Flexible / recurring · Remote / local · Per project / recurring monthly support · 3 - 10 hrs/week · Pro Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Smartphone/computer · Reliable internet · Basic social media skills · Clear writing · Canva/basic graphics ability · Calendar skills · Client-approved account access · Content approval process · Strong privacy judgment.",
  },
  {
    id: "before-starting",
    label: "Before starting, confirm",
    detail:
      "Organization name · Mission · Audience · Platforms · Brand colors/logo · Posting frequency · Upcoming events · Programs/services · Volunteer spotlight process · Photo/media permissions · Minor/privacy rules · Who approves posts · Who responds to comments/DMs · Emergency/correction process · Scope and price.",
  },
  {
    id: "access",
    label: "Access and authorization",
    detail:
      "Use official platform roles/permissions when available instead of casually sharing passwords. Verify current platform features and policies. You post for the organization, not as yourself.",
  },
];

export const NONPROFIT_SOCIAL_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Simple graphics" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Captions and service sheet" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Content calendar and approval tracker" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Posting schedule" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Approved photos and files" },
  { label: "Facebook", url: "https://www.facebook.com/", note: "Client-approved Page posting" },
  { label: "Instagram", url: "https://www.instagram.com/", note: "Client-approved posting where included" },
  { label: "TikTok", url: "https://www.tiktok.com/", note: "Where appropriate and authorized" },
  { label: "YouTube", url: "https://www.youtube.com/", note: "Where included in scope" },
  { label: "Meta Business Help", url: "https://www.facebook.com/business/help", note: "Current Page roles, permissions, and policies" },
];

export const NONPROFIT_SOCIAL_HELPER_SUPPLIES = {
  starterKitTotal:
    "About $0–20 to start — use only organization-owned, licensed, permission-cleared, or otherwise authorized media",
  items: [
    { id: "device", name: "Smartphone / computer", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet access", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "logo", name: "Organization logo", qty: "1", estCost: "$0", notes: "Essential — client provides" },
    { id: "brand", name: "Brand colors / fonts if available", qty: "1", estCost: "$0", notes: "Essential — client provides" },
    { id: "events", name: "Event / program information", qty: "1 set", estCost: "$0", notes: "Essential — client provides" },
    { id: "photos", name: "Approved photos", qty: "1 set", estCost: "$0", notes: "Essential — permission-cleared only" },
    { id: "calendar", name: "Content calendar", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "notes", name: "Notes / checklist", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "canva", name: "Canva", qty: "1", estCost: "$0", notes: "Helpful — free plan first", optional: true },
    { id: "drive", name: "Google Drive", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "docs", name: "Google Docs", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "sheets", name: "Google Sheets", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "gcal", name: "Calendar", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "tripod", name: "Tripod", qty: "1", estCost: "$10–25", notes: "Helpful", optional: true },
    { id: "charger", name: "Portable charger", qty: "1", estCost: "$10–20", notes: "Helpful", optional: true },
    { id: "mic", name: "Basic phone microphone for approved interviews/video", qty: "1", estCost: "$10–30", notes: "Helpful", optional: true },
  ],
};

export const NONPROFIT_SOCIAL_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "nsh_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple event and spotlight graphics",
    url: "https://www.canva.com/",
  },
  {
    id: "nsh_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Captions, service sheet, and sample posts",
    url: "https://docs.google.com/",
  },
  {
    id: "nsh_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Event details and approval checklist",
  },
  {
    id: "nsh_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Content calendar, approval tracker, and metrics",
    url: "https://sheets.google.com/",
  },
  {
    id: "nsh_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Posting schedule",
    url: "https://calendar.google.com/",
  },
  {
    id: "nsh_facebook",
    name: "Facebook",
    freePlanAvailable: true,
    costNote: "Client-approved Page — use official roles, not shared passwords",
    url: "https://www.facebook.com/",
  },
  {
    id: "nsh_instagram",
    name: "Instagram",
    freePlanAvailable: true,
    costNote: "Where included in the client’s platforms",
    url: "https://www.instagram.com/",
  },
  {
    id: "nsh_tiktok",
    name: "TikTok",
    freePlanAvailable: true,
    costNote: "Where appropriate and authorized — verify current age and policy rules",
    url: "https://www.tiktok.com/",
    optional: true,
  },
  {
    id: "nsh_youtube",
    name: "YouTube",
    freePlanAvailable: true,
    costNote: "Where included in scope",
    url: "https://www.youtube.com/",
    optional: true,
  },
  {
    id: "nsh_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Approved photos and source files",
    url: "https://drive.google.com/",
  },
  {
    id: "nsh_onedrive",
    name: "OneDrive",
    freePlanAvailable: true,
    costNote: "Alternate file sharing where the client already uses it",
    url: "https://www.microsoft.com/en-us/microsoft-365/onedrive/online-cloud-storage",
    optional: true,
  },
  {
    id: "nsh_dropbox",
    name: "Dropbox",
    freePlanAvailable: true,
    costNote: "Alternate file sharing where approved",
    url: "https://www.dropbox.com/",
    optional: true,
  },
  {
    id: "nsh_insights",
    name: "Native platform insights / analytics",
    freePlanAvailable: true,
    costNote: "Use only where access is authorized — metrics are information, not guarantees",
  },
  {
    id: "nsh_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Canva + Docs + Calendar + Client’s Primary Social Platform",
  },
];

export const NONPROFIT_SOCIAL_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Keep displayed pricing: $15 – $50 / project (examples).",
    "",
    "Recurring support can be priced separately: weekly or monthly package based on number of posts, platforms, graphics, approval rounds, and community-management duties.",
    "Do not offer unlimited posts or revisions for a small project fee.",
    "Do not promise fundraising results, attendance, reach, followers, or engagement.",
    "Donations or fundraising proceeds collected by the organization are not your business revenue.",
  ].join("\n"),
  raiseTip:
    "Possible add-ons: extra graphics, extra platform, event-day content, short-form video, monthly calendar, additional revisions, scheduling/publishing, basic analytics report. Displayed range: $15 – $50 / project (examples). Examples only — not income guarantees.",
  items: [
    {
      id: "quick",
      label: "Quick content project",
      price: "$15–$20",
      notes: "One event reminder, volunteer spotlight, or simple approved graphic/post",
    },
    {
      id: "batch",
      label: "Small content batch",
      price: "$25–$35",
      notes: "About 3–5 simple approved posts/graphics",
    },
    {
      id: "starter",
      label: "Starter content package",
      price: "$40–$50+",
      notes: "Larger agreed batch, simple content calendar, or multi-post campaign within defined scope",
    },
    { id: "graphics", label: "Add-on: Extra graphics", price: "Agree in advance" },
    { id: "platform", label: "Add-on: Extra platform", price: "Agree in advance" },
    { id: "event-day", label: "Add-on: Event-day content", price: "Agree in advance" },
    { id: "video", label: "Add-on: Short-form video", price: "Agree in advance" },
    { id: "monthly-cal", label: "Add-on: Monthly calendar", price: "Agree in advance" },
    { id: "revisions", label: "Add-on: Additional revisions", price: "Agree in advance" },
    { id: "schedule", label: "Add-on: Scheduling / publishing", price: "Agree in advance" },
    { id: "analytics", label: "Add-on: Basic analytics report", price: "Agree in advance" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ or - only — never ✓. */
export const NONPROFIT_SOCIAL_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Organization’s Content Goals",
    desc: [
      "Ask:",
      "- What is the mission?",
      "- Who is the audience?",
      "- What does the organization need people to KNOW?",
      "- What should people DO after seeing a post?",
      "- Which programs/events need visibility?",
      "- What content should never be posted?",
      "",
      "Choose content pillars such as:",
      "☐ Events",
      "☐ Volunteer Spotlights",
      "☐ Program Updates",
      "☐ Community Resources",
      "☐ Educational Tips",
      "☐ Success/Impact Stories with permission",
      "☐ Announcements",
      "☐ Calls for Volunteers",
      "☐ Donation/Fundraising Messages when authorized",
      "☐ Faith/community messages where appropriate",
      "",
      "Write:",
      "Mission: ________",
      "Audience: ________",
      "Primary CTA: ________",
      "Top 3 Content Pillars: ________",
    ].join("\n"),
  },
  {
    title: "Create Your Starter Package",
    desc: [
      "Example:",
      "",
      "COMMUNITY SOCIAL STARTER",
      "- 5 approved posts",
      "- Up to 5 simple Canva graphics",
      "- Event reminders",
      "- Volunteer/program spotlight",
      "- 2-week content calendar",
      "- 1 revision round",
      "",
      "Price: $____",
      "Platforms Included: ________",
      "Turnaround: ________",
      "",
      "Define whether you:",
      "DRAFT ONLY",
      "SCHEDULE",
      "PUBLISH",
      "RESPOND TO COMMENTS/MESSAGES",
      "",
      "These are different responsibilities and should be priced accordingly.",
      "See Suggested Pricing — $15 – $50 / project (examples).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way organizations hear about your service. Pick only 2 or 3 this month.",
      "",
      "Strong channels:",
      "☐ Referrals",
      "☐ Local churches",
      "☐ Local nonprofits",
      "☐ Community organizations",
      "☐ LinkedIn",
      "☐ Facebook community/business groups",
      "☐ Volunteer networks",
      "☐ Local networking",
      "☐ Email outreach to appropriate organizations",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write:",
      "What I Offer: Church/Nonprofit Social Media Help",
      "Starting Price: $____",
      "Ideal Organization: ________",
      "",
      "Set ONE measurable goal per selected channel. Examples:",
      "- Contact 8 organizations",
      "- Ask 5 people for referrals",
      "- Attend 1 community networking event",
      "- Share 2 sample nonprofit-style posts",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "- One-page service sheet",
      "- Short introduction",
      "- 3–5 fictional/sample posts",
      "- Simple package/pricing",
      "- Contact information",
      "",
      "Sample:",
      "",
      "DOES YOUR CHURCH OR NONPROFIT HAVE GREAT THINGS HAPPENING — BUT NOBODY HAS TIME TO POST THEM?",
      "",
      "I can help with:",
      "- Event Reminders",
      "- Volunteer Spotlights",
      "- Program Updates",
      "- Simple Graphics",
      "- Content Calendars",
      "- Consistent Community Updates",
      "",
      "Starter projects begin at $____.",
      "",
      "Your organization approves the message before it goes live.",
      "",
      "Never use a real organization’s logo, member photos, testimonials, or stories in your portfolio without permission.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2–3 channels selected.",
      "",
      "This week:",
      "- Contact 8–12 appropriate organizations/contacts",
      "- Ask for referrals",
      "- Share your service sheet",
      "- Show sample content",
      "- Follow up professionally",
      "",
      "Sample:",
      "“Hi! I help churches and nonprofits stay consistent on social media with event reminders, volunteer spotlights, program updates, simple graphics, and content calendars. My starter projects begin at $____.”",
      "",
      "Track: Date | Organization | Channel | Contact | Need | Response | Follow-Up",
      "",
      "Do not spam organizations or imply affiliation before they hire you.",
    ].join("\n"),
  },
  {
    title: "Build the Content & Approval System",
    desc: [
      "Create one source of truth.",
      "",
      "Track: Post Date | Platform | Content Pillar | Topic/Event | Caption | Graphic/Media | CTA | Approval Status | Approver | Publish Status | Results/Notes",
      "",
      "Approval statuses:",
      "IDEA",
      "DRAFT",
      "NEEDS REVIEW",
      "APPROVED",
      "SCHEDULED",
      "PUBLISHED",
      "CORRECTION NEEDED",
      "",
      "Define:",
      "Who sends event details?",
      "Who supplies photos?",
      "Who approves?",
      "How far ahead are posts due?",
      "What happens when information changes?",
      "",
      "Never publish an unapproved sensitive post just because a deadline is close.",
    ].join("\n"),
  },
  {
    title: "Create Event Reminders That Answer the Basics",
    desc: [
      "Every event reminder should clearly answer: WHAT? WHO? WHEN? WHERE? COST if any? REGISTRATION/LINK? CONTACT? CTA?",
      "",
      "Example structure:",
      "",
      "[EVENT NAME] IS COMING!",
      "",
      "Date: ________",
      "Time: ________",
      "Location: ________",
      "Who It’s For: ________",
      "Register/Learn More: ________",
      "",
      "CTA: “Share this with someone who should join us.”",
      "",
      "Verify dates, times, addresses, registration links, accessibility details, and contact information before publishing.",
    ].join("\n"),
  },
  {
    title: "Create Volunteer & Impact Spotlights Safely",
    desc: [
      "Spotlights should celebrate people without oversharing.",
      "",
      "Collect:",
      "Name/display name approved: ________",
      "Role: ________",
      "Approved photo: ☐",
      "Approved quote: ☐",
      "Permission to publish: ☐",
      "Organization approval: ☐",
      "",
      "Simple structure:",
      "MEET [NAME]",
      "What they help with",
      "Why they volunteer",
      "Short approved quote",
      "Thank-you CTA",
      "",
      "For minors or vulnerable populations, follow the organization’s consent/privacy rules and obtain required guardian/organizational authorization.",
      "",
      "Never turn someone’s hardship, health, finances, housing status, counseling, care, or personal story into content without appropriate explicit authorization.",
    ].join("\n"),
  },
  {
    title: "Build & Schedule a Consistent Content Mix",
    desc: [
      "Create a realistic calendar.",
      "",
      "Example week:",
      "MON — Program/resource update",
      "WED — Volunteer/community spotlight",
      "FRI — Event reminder",
      "SUN/Weekend — Mission/community message where appropriate",
      "",
      "Use a mix: INFORM ENGAGE INVITE CELEBRATE THANK REMIND",
      "",
      "Do not make every post a donation request.",
      "",
      "For recurring events, schedule reminders at useful intervals rather than posting identical content repeatedly.",
      "",
      "Before scheduling:",
      "- Verify facts",
      "- Check links",
      "- Check spelling",
      "- Confirm media rights",
      "- Confirm approval",
    ].join("\n"),
  },
  {
    title: "Publish, Monitor & Report",
    desc: [
      "If publishing is included:",
      "- Use authorized account access",
      "- Publish/schedule approved content",
      "- Confirm the post appears correctly",
      "- Correct approved factual errors promptly",
      "- Follow client rules for comments/messages",
      "",
      "Escalate:",
      "- Complaints",
      "- Threats",
      "- Media inquiries",
      "- Sensitive member issues",
      "- Financial questions",
      "- Legal allegations",
      "- Crisis communications",
      "- Harassment",
      "- Requests involving private information",
      "",
      "Do not argue from the organization’s account.",
      "",
      "Track simple metrics: Posts Published | Reach/Views where available | Engagement | Link Clicks where available | Event Responses where available | Follower Growth where useful | Top-Performing Topic",
      "",
      "Metrics provide information, not guarantees.",
    ].join("\n"),
  },
  {
    title: "Turn the Project Into a Recurring Content System",
    desc: [
      "At the end of the project/month, review:",
      "- Which posts performed best?",
      "- Which events need reminders?",
      "- Which programs need visibility?",
      "- Are there upcoming volunteer needs?",
      "- Which content was hardest to approve?",
      "- What should be prepared earlier?",
      "",
      "Create next month’s draft calendar.",
      "",
      "Ask: “Would you like me to manage a consistent monthly batch so your updates don’t stop when everyone gets busy?”",
      "",
      "MISSION → CONTENT PLAN → APPROVAL → CONSISTENT POSTS → COMMUNITY AWARENESS → REVIEW → NEXT MONTH",
    ].join("\n"),
  },
];

export function nonprofitSocialHelperToolsDisclaimer(): string {
  return "Beginner stack: Canva + Docs + Calendar + Client’s Primary Social Platform. Use the client’s approved tools and official platform roles. Verify current platform features and policies rather than hard-coding steps. You post for the organization, not as yourself. Parent/guardian involvement for minors.";
}

/** Weekly church/nonprofit social-helper profit math. Org donations are not helper revenue. */
export function computeNonprofitSocialHelperProfit(input: {
  averageProjectFee: number;
  projectsPerWeek: number;
  monthlyRecurringClientRevenue?: number;
  addOnRevenue?: number;
  software?: number;
  travel?: number;
  advertising?: number;
  otherExpenses?: number;
  hoursPerProject?: number;
  recurringClientHoursPerWeek?: number;
}): {
  weeklyProjectRevenue: number;
  weeklyRecurringEquivalent: number;
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.averageProjectFee) || 0);
  const projects = Math.max(0, Number(input.projectsPerWeek) || 0);
  const weeklyProjectRevenue = fee * projects;
  const weeklyRecurringEquivalent =
    Math.max(0, Number(input.monthlyRecurringClientRevenue) || 0) / 4.33;
  const addOns = Math.max(0, Number(input.addOnRevenue) || 0);
  const weeklyRevenue = weeklyProjectRevenue + weeklyRecurringEquivalent + addOns;
  const weeklyExpenses =
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const projectHours = Math.max(0, Number(input.hoursPerProject) || 0) * projects;
  const recurringHours = Math.max(0, Number(input.recurringClientHoursPerWeek) || 0);
  const weeklyHours = projectHours + recurringHours;
  return {
    weeklyProjectRevenue,
    weeklyRecurringEquivalent,
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
