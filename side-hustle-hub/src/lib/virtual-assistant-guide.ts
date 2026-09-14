/**
 * Virtual Assistant (`virtual-assistant`, Guide #114).
 * Pro Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project (examples).
 * Plain data only — no imports from guide-tools.
 */

export const VIRTUAL_ASSISTANT_REALITY_CHECK = {
  title: "ASSIST THE WORK; DO NOT IMPERSON THE OWNER OR MAKE UNAUTHORIZED DECISIONS",
  body: [
    "Provide defined remote administrative support such as inbox organization, calendar upkeep, document formatting, data entry, research, meeting preparation, customer follow-up, or simple workflow maintenance. Work inside written authority, use secure client-controlled access, document what you changed, and send questions or sensitive decisions back to the client.",
    "",
    "A virtual assistant may prepare, organize, draft, schedule, and follow an approved process. The client still controls business commitments, money, legal or medical decisions, employment actions, final publication, and any authority not explicitly delegated.",
    "",
    "Before accepting work, define: exact tasks and exclusions; deliverables, deadlines, and response windows; hours or fixed scope; required approvals; systems and data involved; account-access method; who may receive messages or files; confidentiality and retention rules; revision/change-request limits; emergency escalation contact; payment, cancellation, and offboarding.",
    "",
    "Never ask a client to send passwords in ordinary email or chat. Prefer separate named user access, least-privilege permissions, and multi-factor authentication.",
    "",
    "Do not impersonate the owner. Do not send, publish, purchase, delete, hire, fire, commit funds, or speak as the business unless the written scope names that exact action and the required approval has already been given.",
    "",
    "Do not offer bookkeeping, tax, legal, medical, human-resources, investment, licensed, or regulated work unless you are properly qualified and the scope is lawful. Administrative entry is not the same as professional judgment.",
    "",
    "Tagline: Clear Tasks. Secure Access. Dependable Follow-Through.",
  ].join("\n"),
};

export const VIRTUAL_ASSISTANT_NOTES_WORKSHEET = `NOTES: VIRTUAL ASSISTANT

CLIENT SNAPSHOT
Client/Business: ______________________________
Primary Contact: ______________________________
Authorized Task Owner: ________________________
Service Package: ______________________________
Start/End Date: _______________________________
Payment/Deposit: ______________________________

SCOPE AND APPROVALS
Included Tasks: _______________________________
Excluded Tasks: _______________________________
Deliverable/Volume: ___________________________
Turnaround/Response Window: ___________________
Included Hours/Time Cap: ______________________
Revision Limit: _______________________________
Approval Required Before: _____________________
Emergency Escalation Contact: _________________

ACCESS AND DATA
Approved Systems: _____________________________
Access Type/Permission Level: _________________
Named User / Role-Based Access: Yes / No
MFA Confirmed: Yes / No
Sensitive Data Present: Yes / No
Approved Storage/Transfer: ____________________
Retention/Deletion Date: ______________________
Access Removed at Close: Yes / No

TASK HANDOFF
Completed: ___________________________________
Pending: _____________________________________
Decisions Needed: _____________________________
Files/Records Changed: ________________________
Time Used: ___________________________________
Next Deadline: ________________________________

BUSINESS TRACKER
Prospects Contacted: ____
Discovery Calls: ____
Paid Trials: ____
Active Clients: ____
Invoices Sent: $____
Payments Collected: $____
Total Expenses: $____
Total Hours: ____
Monthly Profit: $____
Effective Hourly Profit: $____

RED FLAGS — PAUSE OR DECLINE
- Client refuses a written scope or identity check
- Request involves suspicious payments, gift cards, crypto, reshipping, or identity verification
- Client wants shared credentials sent through insecure channels
- Request requires deception, fake reviews, impersonation, or unauthorized access
- Task involves regulated judgment beyond your qualifications
- Client asks you to conceal activity from an owner, customer, platform, or authority
- Data is more sensitive than the approved system or agreement can protect
- Client repeatedly expands scope without approving time or fees

GYSH PRO TIP
Sell a reliable result, not “anything you need.” A small repeatable package with a clear input, approval point, and handoff is easier to price, deliver, secure, and improve.

STARTER CHALLENGE
Create one one-page service package today. Include the deliverable, client inputs, turnaround, price, time cap, exclusions, approval point, and handoff. Then identify five legitimate businesses that clearly need that exact result.

SCOPE → SECURE ACCESS → PAID TRIAL → APPROVALS → QUALITY CHECK → HANDOFF → OFFBOARD
`;

export const VIRTUAL_ASSISTANT_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Provide defined remote administrative support such as inbox organization, calendar upkeep, document formatting, data entry, research, meeting preparation, customer follow-up, or simple workflow maintenance. Work inside written authority; do not impersonate the owner or make unauthorized decisions. Pro Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project is examples only, not guarantees. Category: Administrative Services / Remote Business Support. Beginner–Intermediate; specialized work may require training. Startup $0 – low. Remote / online. Hourly block / retainer / fixed-scope project. Best for organized communicators who follow instructions, protect confidential information, and enjoy improving everyday workflows.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable computer, internet, and phone access · professional written communication · calendar and deadline discipline · ability to follow a checklist and document work · defined service menu and boundaries · client intake, scope, approval, and handoff process · secure account-access and file-transfer process · invoice/payment method · time, revenue, expense, and task tracker.",
  },
  {
    id: "before",
    label: "Before every project",
    detail:
      "Confirm the client identity, task owner, authorized systems, approved recipients, deadline, source of truth, sensitive-data level, approval point, escalation route, and definition of done. Define exact tasks and exclusions; deliverables, deadlines, and response windows; hours or fixed scope; required approvals; systems and data involved; account-access method; who may receive messages or files; confidentiality and retention rules; revision/change-request limits; emergency escalation contact; payment, cancellation, and offboarding. Never ask a client to send passwords in ordinary email or chat. Prefer named or role-based user access, least-privilege permissions, and multi-factor authentication.",
  },
  {
    id: "boundaries",
    label: "Service boundaries and declines",
    detail:
      "Do not offer bookkeeping, tax, legal, medical, human-resources, investment, licensed, or regulated work unless you are properly qualified and the scope is lawful. Administrative entry is not the same as professional judgment. Refuse suspicious money movement, account creation, identity verification, gift-card purchases, reshipping, review manipulation, or credential-sharing requests. Pause if the client refuses a written scope or identity check, wants shared passwords through insecure channels, asks you to impersonate the owner, conceal activity, or expand work without approving time or fees. Client industry rules may be stricter than a general VA workflow. Health, finance, education, legal, government, and children’s data can create special privacy, security, training, or contractual requirements. Ask the client to identify applicable rules and provide approved systems; do not guess.",
  },
  {
    id: "protect",
    label: "Protect client information",
    detail:
      "Collect only what the task requires. Use client-created accounts or role-based access where available. Turn on multi-factor authentication. Keep work and personal accounts separate. Do not download sensitive files unless necessary. Do not paste confidential information into unapproved AI tools. Report a suspected breach or mistaken send immediately. Return or delete access and data at offboarding as agreed. If the helper is under 18, a parent or guardian should approve the client, contract, communications, payment method, meetings, and any account access. A teen should not take owner passwords, handle regulated records, or impersonate a business owner.",
  },
];

export const VIRTUAL_ASSISTANT_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "FTC Cybersecurity for Small Business", url: "https://www.ftc.gov/business-guidance/small-businesses/cybersecurity", note: "Current small-business cybersecurity practices, including least-privilege access and multi-factor authentication" },
  { label: "FTC Protecting Personal Information", url: "https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business", note: "Guide for businesses on collecting, storing, and disposing of personal information" },
  { label: "FTC Data Breach Response Guide", url: "https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business", note: "Steps if client information is exposed or sent to the wrong person" },
  { label: "SBA Licenses and Permits", url: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits", note: "Federal, state, and local license/permit starting point — a general VA is not a licensed professional by default" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center", note: "Federal self-employment and estimated-tax starting point" },
];

export const VIRTUAL_ASSISTANT_SUPPLIES = {
  starterKitTotal: "About $0–25",
  items: [
    { id: "computer", name: "Reliable computer and updated browser", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Stable internet and backup contact method", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "headset", name: "Headset for calls when needed", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "calendar", name: "Calendar and task manager", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "docs", name: "Word processor and spreadsheet tool", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "cloud", name: "Secure cloud file system", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "pwm", name: "Password manager and multi-factor authentication", qty: "1", estCost: "$0–4/mo", notes: "Essential" },
    { id: "templates", name: "Intake, scope, approval, time-log, handoff, invoice, and offboarding templates", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "backup", name: "Backup/storage method approved by the client", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "time-tracker", name: "Time, revenue, expense, and task tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "monitor", name: "Second monitor", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "scanner", name: "Scanner or scanning app", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "video", name: "Video-meeting tool", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "esign", name: "E-signature tool", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "screen-record", name: "Screen-recording tool for process documentation", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "workspace", name: "Noise-controlled workspace", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "email-profile", name: "Business email and separate browser profile", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
  ],
};

export const VIRTUAL_ASSISTANT_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "gws", name: "Google Workspace", freePlanAvailable: true, costNote: "Documents, calendars, email, and client-controlled collaboration — use named user access, not shared owner passwords", url: "https://workspace.google.com/" },
  { id: "m365", name: "Microsoft 365", freePlanAvailable: true, costNote: "Documents, calendars, email, and client-controlled collaboration under current terms", url: "https://www.microsoft.com/microsoft-365" },
  { id: "trello", name: "Trello", freePlanAvailable: true, costNote: "Task tracking under current terms and client approval", url: "https://trello.com/" },
  { id: "asana", name: "Asana", freePlanAvailable: true, costNote: "Task tracking under current terms and client approval", url: "https://asana.com/", optional: true },
  { id: "clickup", name: "ClickUp", freePlanAvailable: true, costNote: "Task tracking under current terms and client approval", url: "https://clickup.com/", optional: true },
  { id: "notion", name: "Notion", freePlanAvailable: true, costNote: "Task tracking and SOPs under current terms and client approval", url: "https://www.notion.so/", optional: true },
  { id: "zoom", name: "Zoom", freePlanAvailable: true, costNote: "Meetings and handoffs", url: "https://zoom.us/" },
  { id: "meet", name: "Google Meet", freePlanAvailable: true, costNote: "Meetings and handoffs", url: "https://meet.google.com/" },
  { id: "teams", name: "Microsoft Teams", freePlanAvailable: true, costNote: "Meetings and handoffs", url: "https://www.microsoft.com/microsoft-teams" },
  { id: "pwm", name: "Password manager + multi-factor authentication", freePlanAvailable: true, costNote: "Protect helper accounts — never ask a client to send passwords in ordinary email or chat", url: "https://bitwarden.com/" },
  { id: "ftc-cyber", name: "FTC Cybersecurity for Small Business", freePlanAvailable: true, planLabelApplicable: false, costNote: "Least-privilege access, multi-factor authentication, and small-business security practices", url: "https://www.ftc.gov/business-guidance/small-businesses/cybersecurity" },
  { id: "ftc-pii", name: "FTC Protecting Personal Information", freePlanAvailable: true, planLabelApplicable: false, costNote: "Collect, store, and dispose of personal information only as the task requires", url: "https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business" },
  { id: "ftc-breach", name: "FTC Data Breach Response Guide", freePlanAvailable: true, planLabelApplicable: false, costNote: "Report a suspected breach or mistaken send immediately", url: "https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business" },
  { id: "sba-licenses", name: "SBA Licenses and Permits", freePlanAvailable: true, planLabelApplicable: false, costNote: "Confirm whether a task requires a license before offering it", url: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits" },
  { id: "irs", name: "IRS Self-Employed Individuals Tax Center", freePlanAvailable: true, planLabelApplicable: false, costNote: "Federal self-employment and estimated-tax starting point", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Service Package + One Intake Form + One Scope Template + Secure Access + Task Board + Time Cap + Approval Checkpoint + Handoff Note" },
];

export const VIRTUAL_ASSISTANT_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "VIRTUAL ASSISTANT — REPLACE PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not guarantees.",
    "Use $15–$50 only for a tightly defined starter task. Recurring support, complex systems, urgent work, or tasks involving higher responsibility should be priced separately.",
    "",
    "STARTER TASK: $15 – $50 — one small defined deliverable such as formatting a short document, cleaning a limited contact list, or organizing a small folder under written instructions.",
    "FOCUSED ADMIN BLOCK: $25 – $75+ — up to 1–2 hours of approved administrative work with a task list, time cap, and handoff note.",
    "RECURRING WEEKLY SUPPORT: $100 – $400+ per month — a reserved weekly block for a defined set of repeat tasks. Set included hours, communication windows, rollover policy, and overage rate.",
    "SPECIALIZED PROJECT: custom quote — CRM cleanup, launch coordination, detailed research, complex document production, or workflow setup should be quoted from the actual scope and risk.",
    "",
    "Possible add-ons: rush or after-hours work; additional revision round; meeting attendance and action notes; new system setup or migration; advanced formatting; large data cleanup; additional department or stakeholder; licensed software purchased for the client.",
    "",
    "Formula: Estimated Work Time + Communication/Admin Time + Complexity/Risk + Software/Direct Costs + Rush/Add-Ons = Quote.",
    "State whether the quote is hourly, a capped block, a project fee, or a retainer. If hourly, use a written time cap before exceeding the estimate. If fixed-fee, identify the exact deliverable and what triggers a change order.",
    "",
    "Monthly examples — not guarantees: 4 starter tasks × $35 = $140 gross/month; 2 weekly-support clients × $200 = $400 gross/month; one $300 retainer + two $50 tasks = $400 gross/month.",
    "",
    "Gross revenue is NOT profit. Subtract software, equipment, internet allocation, payment fees, insurance, training, subcontracting, and taxes. Do not count an unsigned proposal or unpaid invoice as collected revenue. Track retainers against included hours so a “monthly package” does not become unlimited work. Do not buy software, subscriptions, domains, postage, ads, or other items for a client without written approval and a reimbursement rule. Examples only; not guaranteed.",
  ].join("\n"),
  raiseTip:
    "Define tasks, exclusions, hours or deliverables, approvals, access, turnaround, revision limits, and offboarding in writing. Track invoiced vs. collected revenue separately. Examples only — not guarantees. Never impersonate the owner or quote licensed work you are not qualified to perform.",
  items: [
    { id: "starter", label: "Starter task", price: "$15–$50", notes: "One small defined deliverable under written instructions" },
    { id: "admin-block", label: "Focused admin block", price: "$25–$75+", notes: "Up to 1–2 hours with a task list, time cap, and handoff note" },
    { id: "weekly", label: "Recurring weekly support", price: "$100–$400+/mo", notes: "Reserved weekly block; include hours, communication windows, rollover, overage rate" },
    { id: "specialized", label: "Specialized project", price: "Custom quote", notes: "CRM cleanup, launch coordination, detailed research, complex documents, or workflow setup" },
    { id: "rush", label: "Rush or after-hours add-on", price: "Quote", notes: "Shorter turnaround or work outside the agreed window" },
    { id: "revision", label: "Additional revision round", price: "Quote", notes: "Beyond the included revision limit" },
    { id: "meetings", label: "Meeting attendance and action notes", price: "Quote", notes: "Live attendance plus a written action list" },
  ],
};

export const VIRTUAL_ASSISTANT_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose the Tasks You Will and Will Not Offer",
    desc: [
      "Select a narrow starting menu: inbox triage, calendar maintenance, document formatting, data entry, meeting prep, research summaries, CRM updates, or customer follow-up.",
      "Write: Starting Menu: ________ · Ideal Client Type: ________ · Systems You Can Support: ________ · Response Window: ________ · Tasks Requiring Credentials, Training, or Professional Judgment You Will Decline: ________",
      "List tasks you will not offer: bookkeeping, tax, legal, medical, human-resources, investment, licensed, or regulated work unless you are properly qualified and the scope is lawful. Administrative entry is not the same as professional judgment.",
      "Refuse work that requires impersonating the owner, sending as the owner without named authority, moving money, buying gift cards, reshipping, creating accounts in someone else’s name, or sharing passwords through ordinary email or chat.",
      "A small, named menu is easier to market, price, secure, and hand off than “I can do anything remotely.”",
    ].join("\n"),
  },
  {
    title: "Build One Clear Package and Price",
    desc: [
      "Define deliverable, included hours or records, tools, communication window, turnaround, revision limit, client responsibilities, exclusions, and add-ons. Set a written cap for hourly work.",
      "Write: Package Name: ________ · Deliverable: ________ · Included Hours / Records: ________ · Tools: ________ · Communication Window: ________ · Turnaround: ________ · Revision Limit: ________ · Client Inputs: ________ · Exclusions: ________ · Fee / Deposit: $____ · Add-Ons: ________ · Time Cap: ________ · Change-Order Trigger: ________",
      "Use $15 – $50 / project only for a tightly defined starter task. Recurring support, complex systems, urgent work, or higher-responsibility tasks should be priced separately.",
      "State whether the quote is hourly, a capped block, a project fee, or a retainer. If hourly, stop at the written cap until the client approves more time. If fixed-fee, identify the exact deliverable and what triggers a change order.",
      "Do not buy software, subscriptions, domains, postage, ads, or other items for a client without written approval and a reimbursement rule.",
    ].join("\n"),
  },
  {
    title: "Create the Client Operating System",
    desc: [
      "Prepare inquiry, intake, scope, confidentiality, access, task-board, time-log, approval, handoff, invoice, and offboarding templates. Create a folder and naming convention for each client.",
      "Intake should capture: client identity; authorized task owner; systems; approved recipients; deadline; source of truth; sensitive-data level; approval point; escalation route; definition of done.",
      "Scope template should name included tasks, exclusions, hours or deliverables, required approvals, access method, confidentiality, revision limits, payment, cancellation, and offboarding.",
      "Handoff note should cover: completed; pending; decisions needed; files/records changed; time used; next deadline.",
      "Keep personal and client work in separate folders, browser profiles, and accounts. Collect only what the task requires.",
    ].join("\n"),
  },
  {
    title: "Secure Your Workspace and Access",
    desc: [
      "Update devices, enable screen lock and multi-factor authentication, use a password manager, separate client profiles, and test backups.",
      "Ask clients for named or role-based access instead of shared credentials whenever possible. Use the minimum access necessary. The FTC recommends limiting sensitive-information access to people who need it and requiring multi-factor authentication for employees, contractors, and others who access systems.",
      "Never ask a client to send passwords in ordinary email or chat. Prefer client-created accounts, least-privilege permissions, and a written access-removal date.",
      "Do not download sensitive files unless necessary. Do not paste confidential, personal, health, financial, legal, or proprietary material into unapproved AI tools. Keep work and personal accounts separate.",
      "If a suspected breach or mistaken send occurs, stop, document what happened, and report it to the authorized contact immediately using the agreed channel.",
    ].join("\n"),
  },
  {
    title: "Create Honest Marketing Materials",
    desc: [
      "Write a one-sentence service statement, package description, sample workflow, turnaround, starting price, and call to action.",
      "Service statement: “I help [TYPE OF CLIENT] with [DEFINED TASK]. My starter package includes [DELIVERABLE], [TURNAROUND], and one handoff note for $____.”",
      "Create: one-page service sheet; defined starter package; exclusions list; sample intake and scope; fictional or permission-based before/after of a formatted document or organized folder; process diagram (intake → scope → secure access → paid trial → checkpoints → handoff); call-to-action.",
      "Use self-created or permission-based samples; never display client data or imply experience you do not have. Do not show real inboxes, calendars, customer lists, or confidential files in a portfolio.",
      "Marketing claims must be truthful. Do not promise unlimited availability, licensed professional judgment, or that you will act as the owner. Do not invent results, client logos, or reviews.",
    ].join("\n"),
  },
  {
    title: "Contact Suitable Clients",
    desc: [
      "A channel is one way potential clients hear about the service. Choose only 2 or 3 this month.",
      "Good channels: warm referrals; local business groups; professional networks; freelance platforms; direct outreach to businesses with a clear administrative need; complementary providers such as bookkeepers, web designers, or accountants who do not offer the same admin tasks.",
      "Write one measurable goal per channel. Examples: ask 10 trusted contacts for a referral; contact 8 local businesses with a defined admin bottleneck; share 3 process tips in one professional network; request 3 introductions from complementary providers.",
      "Sample message: “I help [TYPE OF CLIENT] with [DEFINED TASK]. My starter package includes [DELIVERABLE], [TURNAROUND], and one handoff note for $____. Would you like to see the scope?”",
      "Track outreach, replies, calls, proposals, contracts, assignments, invoices, and payments. Do not scrape directories, add strangers to a promotional list without permission, or send a “free full week of work” to prove the service. A paid starter task demonstrates the process without donating a retainer.",
    ].join("\n"),
  },
  {
    title: "Qualify the Client and Scope",
    desc: [
      "Verify the business/contact, desired outcome, authorized task owner, volume, deadline, systems, data sensitivity, approval chain, and payment.",
      "Confirm: Client Identity: ________ · Authorized Task Owner: ________ · Desired Outcome: ________ · Volume: ________ · Deadline: ________ · Systems: ________ · Sensitive-Data Level: ________ · Approval Chain: ________ · Access Method: ________ · Payment: ________",
      "Refuse suspicious money movement, account creation, identity verification, gift-card purchases, reshipping, review manipulation, or credential-sharing requests.",
      "Pause or decline if the client refuses a written scope or identity check; wants shared credentials through insecure channels; asks you to impersonate the owner; requires deception, fake reviews, or unauthorized access; asks you to conceal activity from an owner, customer, platform, or authority; or the data is more sensitive than the approved system or agreement can protect.",
      "Health, finance, education, legal, government, and children’s data can create special privacy, security, training, or contractual requirements. Ask the client to identify applicable rules and provide approved systems; do not guess.",
    ].join("\n"),
  },
  {
    title: "Onboard and Run a Small Paid Trial",
    desc: [
      "Sign the scope, collect the deposit if used, receive approved access, confirm the source of truth, and complete one limited task. Ask questions early and record all assumptions.",
      "Confirm named or role-based access, permission level, multi-factor authentication, approved storage/transfer, authorized recipients, and the access-removal plan. Never request passwords in ordinary email or chat.",
      "Complete one tightly limited starter task or paid trial inside the written time cap. Document what you changed and what still needs a client decision.",
      "Do not expand into extra folders, extra inboxes, extra departments, or extra hours during the trial unless the client approves a change order.",
      "If access, identity, or authority is unclear, stop. A paid trial is still paid work with a defined deliverable—not unpaid “see if we like each other” labor.",
    ].join("\n"),
  },
  {
    title: "Complete the Work with Checkpoints",
    desc: [
      "Follow the task list, log time, save versions, flag blockers, and stop at the approval boundary.",
      "Never send, publish, purchase, delete, or commit the client without the authorization defined in the scope. Do not impersonate the owner or make unauthorized decisions.",
      "Checkpoint pattern: Task | Source of Truth | Action Taken | Files Changed | Time Used | Blocker | Approval Needed | Next Step.",
      "Flag questions instead of guessing names, dates, prices, recipients, or policy. If the work would exceed the time cap, pause and request approval before continuing.",
      "AI may assist with low-risk drafts only when the client approves the tool and data use. Verify every fact, name, date, calculation, link, and instruction. Never upload confidential, personal, health, financial, legal, or proprietary material to an unapproved system.",
    ].join("\n"),
  },
  {
    title: "Quality-Check and Hand Off",
    desc: [
      "Check names, dates, links, recipients, attachments, calculations, formatting, permissions, and completion criteria.",
      "Confirm you stayed inside included tasks, the time cap, approved systems, and authorized recipients. Confirm you did not send, publish, purchase, delete, or commit anything that required approval and did not receive it.",
      "Send a concise handoff: completed, pending, decisions needed, files changed, time used, and next deadline.",
      "Handoff message: “Completed: ________. Pending: ________. Decisions needed: ________. Files/records changed: ________. Time used: ________. Next deadline: ________.”",
      "Do not leave the client hunting through chat history for what changed. A clear handoff is part of the deliverable.",
    ].join("\n"),
  },
  {
    title: "Close, Offboard, and Improve",
    desc: [
      "Confirm acceptance, invoice and payment, remove access that is no longer needed, return/delete files as agreed, and document the final state.",
      "Measure total hours, profit, rework, and task fit before offering a retainer or referral request. Do not count an unsigned proposal or unpaid invoice as collected revenue. Track retainers against included hours so a monthly package does not become unlimited work.",
      "Offboarding checklist: acceptance confirmed; invoice sent; payment collected; named access removed or asked to be revoked; files returned or deleted as agreed; MFA/device sessions reviewed; final state documented; lessons recorded.",
      "Ask for honest feedback and permission before using a testimonial or sample. Request a referral only after a calm, accepted delivery.",
      "SCOPE → SECURE ACCESS → PAID TRIAL → APPROVALS → QUALITY CHECK → HANDOFF → OFFBOARD",
    ].join("\n"),
  },
];

export function virtualAssistantToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: One Service Package + One Intake Form + One Scope Template + Secure Access + Task Board + Time Cap + Approval Checkpoint + Handoff Note.",
    "Never ask a client to send passwords in ordinary email or chat. Prefer named or role-based user access, least-privilege permissions, and multi-factor authentication. Do not impersonate the owner or make unauthorized decisions.",
    "Client industry rules may be stricter than a general VA workflow. Health, finance, education, legal, government, and children’s data can create special privacy, security, training, or contractual requirements. Ask the client to identify applicable rules and provide approved systems; do not guess.",
    "Do not offer bookkeeping, tax, legal, medical, human-resources, investment, licensed, or regulated work unless you are properly qualified and the scope is lawful. Administrative entry is not the same as professional judgment.",
    "AI may assist with low-risk drafts only when the client approves the tool and data use. Verify every fact, name, date, calculation, link, and instruction. Never upload confidential, personal, health, financial, legal, or proprietary material to an unapproved system.",
    "Licenses, tax rules, privacy requirements, and platform terms change. Check current official FTC, SBA, IRS, and client-industry resources before accepting work that involves sensitive data or regulated judgment.",
  ].join("\n");
}

export function computeVirtualAssistantProfit(input: {
  vaStarterTasksCompleted?: number;
  averageStarterTaskFee?: number;
  retainerRevenueCollected?: number;
  specialProjectRevenueCollected?: number;
  approvedAddOnRevenue?: number;
  otherEarnedRevenue?: number;
  softwareSubscriptions?: number;
  equipmentInternetAllocation?: number;
  paymentFees?: number;
  trainingInsuranceProfessionalServices?: number;
  approvedCostsNotReimbursed?: number;
  otherExpenses?: number;
  taskWorkHours?: number;
  meetingsMessagesAdminHours?: number;
  marketingSalesHours?: number;
  revisionReworkHours?: number;
}): {
  starterTaskRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const starterTaskRevenue =
    Math.max(0, Number(input.vaStarterTasksCompleted) || 0) *
    Math.max(0, Number(input.averageStarterTaskFee) || 0);
  const grossServiceRevenue =
    starterTaskRevenue +
    Math.max(0, Number(input.retainerRevenueCollected) || 0) +
    Math.max(0, Number(input.specialProjectRevenueCollected) || 0) +
    Math.max(0, Number(input.approvedAddOnRevenue) || 0) +
    Math.max(0, Number(input.otherEarnedRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.softwareSubscriptions) || 0) +
    Math.max(0, Number(input.equipmentInternetAllocation) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.trainingInsuranceProfessionalServices) || 0) +
    Math.max(0, Number(input.approvedCostsNotReimbursed) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.taskWorkHours) || 0) +
    Math.max(0, Number(input.meetingsMessagesAdminHours) || 0) +
    Math.max(0, Number(input.marketingSalesHours) || 0) +
    Math.max(0, Number(input.revisionReworkHours) || 0);
  return {
    starterTaskRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
