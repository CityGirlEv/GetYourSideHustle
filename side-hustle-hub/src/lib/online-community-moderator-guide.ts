/**
 * Online Community Moderator (`online-community-moderator`, Guide #089).
 * Facebook Groups + Discord from a written playbook. Plain data only.
 */

export const COMMUNITY_MODERATOR_REALITY_CHECK = {
  title: "MODERATE FROM A WRITTEN PLAYBOOK, NOT FROM YOUR MOOD",
  body: [
    "Help Facebook Groups, Discord servers, and other online communities stay organized and welcoming by reviewing membership requests and posts, greeting members, answering routine questions, enforcing written rules consistently, removing spam, documenting actions, and escalating serious issues to the owner.",
    "",
    "The owner defines purpose, who may join, content rules, approval standards, spam rules, warning/mute/removal process, ban authority, appeal process, escalation contacts, emergency process, response times, coverage schedule, and privacy rules.",
    "Use the least access needed. Never share or request the owner’s password. Do not promise 24/7 monitoring unless specifically contracted and staffed.",
    "Not a therapist, attorney, investigator, emergency dispatcher, or law-enforcement officer.",
    "",
    "Never download, forward, or broadly screenshot suspected illegal sexual content involving minors. Use current platform reporting and the owner’s legally reviewed process.",
    "Teen helpers: age-appropriate communities only; an adult owner controls safeguarding.",
    "",
    "Tagline: Clear Rules. Calm Responses. Safer Communities.",
  ].join("\n"),
};

export const COMMUNITY_MODERATOR_NOTES_WORKSHEET = `MY ONLINE COMMUNITY MODERATOR PLAN

SERVICE SETUP
Platforms: ________
Community Types: ________
Tasks Offered: ________
Tasks Excluded: ________
Small Project Price: $____
Hourly Rate: $____
Weekly/Monthly Package: $____
Overage Rate: $____
Coverage Days/Times/Time Zone: ________

CLIENT / COMMUNITY
Client: ________
Community Name: ________
Platform: ________
Public/Private: ________
Members: ____
Average Activity: ________
Minors Present: ☐ Yes ☐ No
Owner Contact: ________
Backup Contact: ________
Permissions granted (least privilege): ________
Owner password requested/shared: ☐ Never
Playbook saved: ☐
Escalation matrix saved: ☐

SHIFT LOG
Date: ________
Hours: ____
Membership requests: ____
Posts/comments reviewed: ____
Spam removed: ____
Escalations: ____
Handoff sent: ☐

WEEKLY REPORT
Hours: ____  Approvals/declines: ____  Spam: ____  Escalations: ____
Overage concerns: ________
Wellbeing note: ________

MONTHLY RESULTS
Small projects: ____
Recurring hours: ____
Service revenue: $____
Expenses: $____
Estimated profit: $____
Total hours: ____
Effective profit per hour: $____
`;

export const COMMUNITY_MODERATOR_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Scheduled Facebook Group and Discord moderation from a written playbook: approvals, welcome, spam removal, rule reminders, and escalation logs. 10 hrs/week. Displayed $15 – $50 / project is examples only for small starter projects.",
  },
  {
    id: "access",
    label: "Least privilege — no owner password",
    detail:
      "Client-approved moderator/admin role with only necessary permissions. Unique password and two-factor authentication on the helper’s own login. Confirm how access will be removed when the job ends.",
  },
  {
    id: "decline",
    label: "Decline illegal or unsafe work",
    detail:
      "Decline illegal activity, deceptive engagement, harassment-for-hire, fake accounts, purchased members, raids, ban evasion, or pressure to ignore platform rules. Teen helpers are not assigned adult-content spaces, graphic content, or high-risk private reports.",
  },
];

export const COMMUNITY_MODERATOR_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Facebook Groups", url: "https://www.facebook.com/groups/", note: "Assigned permissions only" },
  { label: "Facebook Groups Help Center", url: "https://www.facebook.com/help/groups" },
  { label: "Facebook Manage People and Content", url: "https://www.facebook.com/help/1686671141596230" },
  { label: "Facebook Manage Posts", url: "https://www.facebook.com/help/131887213640898" },
  { label: "Facebook Admin Assist", url: "https://www.facebook.com/help/436275657385753" },
  { label: "Meta Community Standards", url: "https://transparency.meta.com/policies/community-standards/" },
  { label: "Discord", url: "https://discord.com/" },
  { label: "Discord Community Guidelines", url: "https://discord.com/guidelines" },
  { label: "Discord Safety Center", url: "https://discord.com/safety" },
  { label: "Discord AutoMod", url: "https://discord.com/safety/auto-moderation-in-discord" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Playbook, rules, reports" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Shift log and time" },
  { label: "Canva", url: "https://www.canva.com/", note: "Service graphic — no real member data" },
];

export const COMMUNITY_MODERATOR_SUPPLIES = {
  starterKitTotal: "About $0–20 — do not store member private information on paper",
  items: [
    { id: "computer", name: "Computer or smartphone + charger", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Reliable internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "headphones", name: "Headphones for live audio/video communities", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "calendar", name: "Calendar + time tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "checklist", name: "Secure digital checklist (no sensitive member data on paper)", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "charger", name: "Portable charger", qty: "1", estCost: "$8–15", notes: "Helpful", optional: true },
    { id: "monitor", name: "Second monitor", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
  ],
};

export const COMMUNITY_MODERATOR_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "fb-groups", name: "Facebook Groups", freePlanAvailable: true, planLabelApplicable: false, costNote: "Review and manage the client’s group with assigned permissions", url: "https://www.facebook.com/groups/" },
  { id: "fb-help", name: "Facebook Groups Help Center", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current group administration and moderation guidance", url: "https://www.facebook.com/help/groups" },
  { id: "fb-people", name: "Facebook Manage People and Content", freePlanAvailable: true, planLabelApplicable: false, costNote: "Membership, posts, and Admin Assist", url: "https://www.facebook.com/help/1686671141596230" },
  { id: "fb-posts", name: "Facebook Manage Posts", freePlanAvailable: true, planLabelApplicable: false, costNote: "Post approval and management", url: "https://www.facebook.com/help/131887213640898" },
  { id: "fb-assist", name: "Facebook Admin Assist", freePlanAvailable: true, planLabelApplicable: false, costNote: "Automation criteria — test before relying on it", url: "https://www.facebook.com/help/436275657385753" },
  { id: "meta-cs", name: "Meta Community Standards", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current platform-wide content standards", url: "https://transparency.meta.com/policies/community-standards/" },
  { id: "discord", name: "Discord", freePlanAvailable: true, planLabelApplicable: false, costNote: "Client server and assigned moderator role", url: "https://discord.com/" },
  { id: "discord-gl", name: "Discord Community Guidelines", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current platform rules", url: "https://discord.com/guidelines" },
  { id: "discord-safety", name: "Discord Safety Center", freePlanAvailable: true, planLabelApplicable: false, costNote: "Safety, reporting, privacy, and policy resources", url: "https://discord.com/safety" },
  { id: "automod", name: "Discord AutoMod", freePlanAvailable: true, planLabelApplicable: false, costNote: "Keyword/spam filters — audit false positives", url: "https://discord.com/safety/auto-moderation-in-discord" },
  { id: "google_docs", name: "Google Docs", freePlanAvailable: true, costNote: "Moderation playbook, rules, templates, and reports", url: "https://docs.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Shift log, queue counts, incident categories, time, revenue, expenses", url: "https://sheets.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Client intake or approved member feedback", url: "https://forms.google.com/" },
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Coverage schedule, live events, report deadlines", url: "https://calendar.google.com/" },
  { id: "passwords", name: "Password manager", freePlanAvailable: true, costNote: "Unique credentials — never the owner’s password", url: "https://bitwarden.com/" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Service graphic with fake or anonymized sample data only", url: "https://www.canva.com/" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Platform + Written Rules + Moderation Playbook + Escalation Matrix + Saved Replies + Shift Checklist + Action Log + Weekly Report" },
];

export const COMMUNITY_MODERATOR_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "ONLINE COMMUNITY MODERATOR — REPLACE PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not guarantees.",
    "Use the displayed $15–$50 range for small, clearly limited starter projects. Ongoing moderation should be priced by scheduled time, activity volume, responsibility, risk, and reporting requirements.",
    "",
    "Rules / welcome-post review: $15 – $30",
    "Small approval-queue or spam cleanup: $20 – $50",
    "Saved-reply / FAQ starter kit: $25 – $50",
    "One-hour live event / launch coverage: $25 – $50",
    "Community audit: $40 – $100+",
    "Hourly scheduled moderation: $15 – $30+ per hour (planning example)",
    "Weekly starter coverage: $75 – $250+",
    "Monthly retainer: $300 – $1,200+",
    "",
    "Formula: Estimated Scheduled Hours × Target Hourly Rate + Setup/Audit Time + Live Event or After-Hours Premium + Additional Platform + Reporting/Admin Time + Other Approved Add-Ons = Project or Retainer Quote.",
    "Do not bill the same scheduled hour twice unless clients knowingly agreed to a shared-coverage arrangement.",
  ].join("\n"),
  raiseTip: "Always define what is NOT included. “Keep my group friendly” is not a usable scope. Examples only.",
  items: [
    { id: "rules", label: "Rules / welcome-post review", price: "$15–$30", notes: "One short rules page, welcome post, or FAQ" },
    { id: "queue", label: "Small approval-queue or spam cleanup", price: "$20–$50", notes: "Defined queue or stated time limit" },
    { id: "replies", label: "Saved-reply / FAQ starter kit", price: "$25–$50", notes: "Welcome, reminder, warning, decline, escalation templates" },
    { id: "event", label: "One-hour live event / launch coverage", price: "$25–$50", notes: "Written playbook" },
    { id: "audit", label: "Community audit", price: "$40–$100+", notes: "Larger or high-risk communities cost more" },
    { id: "hourly", label: "Hourly scheduled moderation", price: "$15–$30+ / hr", notes: "Planning example" },
    { id: "weekly", label: "Weekly starter coverage", price: "$75–$250+", notes: "About 3–10 scheduled hours" },
    { id: "monthly", label: "Monthly retainer", price: "$300–$1,200+", notes: "Included-hour limit and overage rate" },
  ],
};

export const COMMUNITY_MODERATOR_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Community, Role & Boundaries",
    desc: [
      "Write a one-sentence scope: “I help [COMMUNITY] stay organized by [APPROVED TASKS] during [SCHEDULE], using the owner’s written rules and escalation process.”",
      "Choose duties: review membership requests; approve/decline queued posts; welcome new members; answer routine FAQs; remove spam; give approved reminders or warnings; mute/remove/ban only within assigned authority; escalate disputes and serious safety issues; monitor scheduled live events; provide shift or weekly reports.",
      "Excluded: 24/7 monitoring; legal/medical/crisis advice; private investigations; unapproved account access; owner-only decisions; work outside scheduled hours.",
    ].join("\n"),
  },
  {
    title: "Audit the Rules, Queues, Permissions & Risks",
    desc: [
      "Review the community with the owner: purpose and target members; rules and pinned/welcome content; membership questions; post/comment approval settings; roles and permissions; channels/categories; spam/scam patterns; self-promotion rules; recurring member questions; automation and keyword filters; appeal process; incident history; communities involving minors; live-event schedule; privacy and recordkeeping.",
      "Create a FIX NOW / FIX LATER / OWNER DECISION list.",
      "Request the least permission needed. Use platform roles rather than shared passwords. Confirm how access will be removed when the job ends.",
    ].join("\n"),
  },
  {
    title: "Set Your Packages, Schedule & Service Terms",
    desc: [
      "Choose starter offers using the upgraded Suggested Pricing section.",
      "Write: Small Project $____ for ________ · Hourly Rate $____ · Weekly Hours Included · Monthly Hours Included · Overage Rate $____ · Coverage Days/Times/Time Zone · Live Event Rate $____ · Report Frequency · Urgent Contact.",
      "Define: platform(s); tasks; queue or member-volume assumptions; response-time goal; actions allowed without approval; owner-only decisions; handoff at the end of each shift; after-hours process; payment and cancellation terms.",
      "Do not accept “always be available” as a 10-hour-per-week agreement.",
    ].join("\n"),
  },
  {
    title: "Build the Moderation Playbook & Escalation Matrix",
    desc: [
      "LEVEL 1 — ROUTINE: welcome, FAQ, clear approval/decline, duplicate post, obvious spam. Action: use approved reply/action and log the result.",
      "LEVEL 2 — NEEDS JUDGMENT: heated conflict, repeated rule-breaking, unclear promotion, possible scam, member appeal. Action: pause, gather only necessary context, use approved temporary action if authorized, and escalate to the owner.",
      "LEVEL 3 — URGENT / PLATFORM OR SAFETY ISSUE: credible threats, doxxing, suspected exploitation, account compromise, dangerous illegal activity, serious self-harm concern, or prohibited graphic/sexual content. Action: do not investigate or confront. Follow the client’s urgent protocol, use current platform reporting tools, notify the designated owner immediately, and contact emergency services only when the approved protocol and circumstances require it.",
      "Never download, forward, or broadly screenshot suspected illegal sexual content involving minors. Use current platform reporting and the owner’s legally reviewed process.",
      "For every action define: Rule | Allowed Action | Saved Reply | Owner Approval? | Platform Report? | Log Field | Appeal Path.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about the service. Pick only 2 or 3 this month.",
      "",
      "☐ Personal/referral network",
      "☐ Facebook admin and business-owner groups where promotion is permitted",
      "☐ Discord community-owner networks where appropriate",
      "☐ LinkedIn",
      "☐ Local small-business or nonprofit groups",
      "☐ Coaches, creators, course owners, membership owners, and podcasters",
      "☐ Virtual-assistant or community-management referrals",
      "☐ Freelance marketplace profile",
      "",
      "Write one measurable goal per channel.",
      "Examples:",
      "- Contact 10 warm business/community-owner leads",
      "- Ask 5 virtual assistants or social-media managers for referrals",
      "- Publish 2 helpful moderation tips and one service offer",
      "",
      "Do not enter communities only to spam the moderator service.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "",
      "Headline: NEED HELP KEEPING YOUR ONLINE COMMUNITY ORGANIZED?",
      "Facebook Group and Discord moderation support",
      "Post Approvals • Member Welcome • Spam Removal • Rule Reminders • Escalation Logs",
      "Starter projects from $____ · Scheduled weekly support available · Contact: ________",
      "",
      "Create: one-sentence service promise; short task list; starter pricing; coverage/time-zone language; platform experience; security/privacy statement; sample weekly report with fake or anonymized data; referral message; client intake form.",
      "Never use real member names, screenshots, private messages, disciplinary details, or client community data in a portfolio without documented permission and appropriate redaction.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week use only the 2–3 selected channels.",
      "",
      "Warm outreach sample:",
      "“Hi! I provide scheduled Facebook Group and Discord moderation support—approving posts, welcoming members, removing spam, answering routine questions, and escalating issues from a written playbook. I’m opening a few starter projects and recurring coverage blocks. Would you like my service list?”",
      "",
      "Track: Date | Prospect | Platform | Community Size | Need | Response | Follow-Up | Call/Trial Booked",
      "On a discovery call ask about activity, coverage, problems, risk, permissions, owner availability, budget, and desired result.",
      "Do not promise that moderation will eliminate every conflict, scam, harmful post, platform action, or member complaint.",
    ].join("\n"),
  },
  {
    title: "Onboard Securely & Test the Workflow",
    desc: [
      "Before the first shift: sign the service/scope agreement; receive role-based access—not the owner’s password; turn on two-factor authentication; confirm platform, group/server, and role; review current rules and platform policies; save owner and backup contacts; confirm coverage hours and time zone; confirm action limits; test saved replies; test escalation handoff; test automation on low-risk rules; confirm reporting format; confirm where authorized records are stored.",
      "Run a short supervised trial using sample or low-risk items from the queue.",
      "Do not change roles, rules, channels, bots, automation, bans, or privacy settings outside the written authority.",
    ].join("\n"),
  },
  {
    title: "Run a Consistent Daily Moderation Shift",
    desc: [
      "Start-of-shift checklist: 1. Review owner/team updates 2. Check urgent alerts and reports 3. Review membership requests 4. Review queued posts/comments 5. Remove clear spam using approved rules 6. Welcome approved members 7. Answer routine FAQs 8. Watch active discussions and live events 9. Escalate unclear or serious issues 10. Update the action log 11. Send handoff notes.",
      "Use neutral language. Refer to the rule and next step, not the member’s personality.",
      "Sample reminder: “Hi [Name], this post was paused because Rule __ requires ________. You may repost after ________. If you believe this was a mistake, please use ________ for review.”",
      "Avoid public arguments. When the shift ends, use the agreed handoff rather than silently continuing unpaid work.",
    ].join("\n"),
  },
  {
    title: "Handle Incidents, Reports & Appeals",
    desc: [
      "When something is reported: 1. Protect immediate community safety within assigned authority 2. Identify the relevant community and platform rule 3. Preserve only the minimum approved information needed 4. Record the link/message ID, time, category, and action where appropriate 5. Escalate based on the matrix 6. Use the current platform reporting process when required 7. Document the owner’s final decision 8. Apply the approved appeal path 9. Review whether rules, filters, or staffing need improvement.",
      "Do not make medical, legal, criminal, or identity conclusions. Do not promise confidentiality you cannot provide. Do not share incident details with friends, other clients, or unrelated moderators.",
      "After a raid or spam surge, change only the controls authorized by the owner, document what changed, review false positives, and restore normal settings deliberately.",
    ].join("\n"),
  },
  {
    title: "Report Results, Protect Wellbeing & Renew the Work",
    desc: [
      "Weekly report: scheduled hours worked; membership requests reviewed; posts/comments reviewed; approvals/declines; spam removed; warnings/mutes/removals/bans by category; issues escalated; typical response time where tracked; common member questions; automation false positives; recommendations requiring owner approval; overage or coverage concerns.",
      "Protect wellbeing: schedule screen breaks; mute non-urgent notifications outside coverage; rotate high-risk duties when possible; tell the owner when content is affecting your wellbeing; use the escalation process instead of carrying serious cases alone.",
      "At renewal, review scope, volume, hours, risk, results, rate, and whether backup coverage is needed.",
      "CLEAR RULES → SECURE ACCESS → CONSISTENT ACTIONS → FAST ESCALATION → USEFUL REPORTS → RENEWAL",
    ].join("\n"),
  },
];

export function onlineCommunityModeratorToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: One Platform + Written Rules + Moderation Playbook + Escalation Matrix + Saved Replies + Shift Checklist + Action Log + Weekly Report.",
    "",
    "Platform features, role permissions, automation, reporting flows, Community Standards, and Community Guidelines change. Verify CURRENT official rules and client permissions before acting.",
    "Automation can reduce repetitive work, but it should be tested and audited. A bad keyword rule can block innocent members just as efficiently as spam. Keep human review and an appeal path where appropriate.",
  ].join("\n");
}

export function computeOnlineCommunityModeratorProfit(input: {
  moderatorSmallProjects?: number;
  averageProjectFee?: number;
  recurringHours?: number;
  averageHourlyRate?: number;
  liveEventIncome?: number;
  auditSetupIncome?: number;
  otherApprovedServiceIncome?: number;
  internetPhone?: number;
  softwareSecurity?: number;
  equipment?: number;
  advertisingPlatformFees?: number;
  paymentFees?: number;
  training?: number;
  otherExpenses?: number;
  moderationHours?: number;
  setupAuditHours?: number;
  reportsAdminHours?: number;
  marketingHours?: number;
}): {
  projectRevenue: number;
  recurringRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const projectRevenue =
    Math.max(0, Number(input.moderatorSmallProjects) || 0) *
    Math.max(0, Number(input.averageProjectFee) || 0);
  const recurringRevenue =
    Math.max(0, Number(input.recurringHours) || 0) *
    Math.max(0, Number(input.averageHourlyRate) || 0);
  const grossServiceRevenue =
    projectRevenue +
    recurringRevenue +
    Math.max(0, Number(input.liveEventIncome) || 0) +
    Math.max(0, Number(input.auditSetupIncome) || 0) +
    Math.max(0, Number(input.otherApprovedServiceIncome) || 0);
  const totalExpenses =
    Math.max(0, Number(input.internetPhone) || 0) +
    Math.max(0, Number(input.softwareSecurity) || 0) +
    Math.max(0, Number(input.equipment) || 0) +
    Math.max(0, Number(input.advertisingPlatformFees) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.training) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.moderationHours) || 0) +
    Math.max(0, Number(input.setupAuditHours) || 0) +
    Math.max(0, Number(input.reportsAdminHours) || 0) +
    Math.max(0, Number(input.marketingHours) || 0);
  return {
    projectRevenue,
    recurringRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
