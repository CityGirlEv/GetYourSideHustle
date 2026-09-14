/**
 * Basic Invitation Creator (`basic-invitation-creator`, Guide #035).
 * Digital invitation design in Canva — print/share files, not a print shop.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const BASIC_INVITATION_REALITY_CHECK = {
  title: "PROOF EVERY NAME AND DATE — REVENUE IS NOT PROFIT",
  body: [
    "This is a digital design service: you create simple customized invitations for birthdays, showers, graduations, anniversaries, reunions, and other appropriate events, then deliver finished files for printing or electronic sharing.",
    "",
    "GROSS REVENUE is what the client pays you (base design + add-ons + rush + extra revisions).",
    "ESTIMATED PROFIT is revenue minus paid assets, software, payment fees, advertising, optional test printing, and other expenses.",
    "",
    "Confirm names, dates, times, addresses, RSVP details, and spelling before final delivery.",
    "Require client approval of the final proof. State how many revision rounds are included.",
    "Keep an original editable copy. Export the formats the client actually needs.",
    "Screen colors and printed colors can differ. Do not guarantee print results from every outside printer.",
    "",
    "Use properly licensed fonts, graphics, photos, templates, and design assets.",
    "Do not copy another designer’s invitation. Do not use copyrighted characters, logos, celebrity images, team logos, or protected artwork without appropriate rights.",
    "Verify commercial-use rights for Canva and third-party assets. Terms change — check current licensing.",
    "Protect private event and customer information. Do not publicly post invitations that contain addresses, phone numbers, private RSVP links, or other personal details without permission.",
    "",
    "Tagline: Design It. Proof It. Deliver the Files.",
  ].join("\n"),
};

export const BASIC_INVITATION_NOTES_WORKSHEET = `MY BASIC INVITATION CREATOR PLAN

CLIENT
Name: ________
Phone/Email: ________
Event: ________
Deadline: ________

EVENT DETAILS
Honoree/Host: ________
Event Date: ________
Time: ________
Venue: ________
Address: ________
RSVP: ________
RSVP Deadline: ________
Theme: ________
Colors: ________
Special Wording: ________

DESIGN
Invitation Size: ________
Digital / Print / Both: ________
Style: ________
Template/Custom: ________
Graphics/Photos: ________
File Format Needed: ________

PROJECT
Quoted Price: $____
Deposit: $____
Included Revisions: ________
Rush Fee: $____
Add-Ons: ________
Final Balance: $____

PROOF
Names Checked: ☐
Date Checked: ☐
Time Checked: ☐
Address Checked: ☐
RSVP Checked: ☐
Spelling Checked: ☐
Client Approved: ☐

DELIVERY
Final File(s): ________
Delivery Date: ________
Editable Source Saved: ☐
Payment Complete: ☐

RESULTS
Gross Revenue: $____
Expenses: $____
Estimated Profit: $____
Hours Worked: ____
Profit Per Hour: $____

FOLLOW-UP
Testimonial Requested: ☐
Referral Requested: ☐
Matching Item Opportunity: ________
Repeat Client: ☐

Marketing Channel 1: ________
Marketing Channel 2: ________
Marketing Channel 3: ________

GYSH PRO TIP
Proof the names and dates twice.
Then proof them again.

BASE DESIGN + ADD-ONS + RUSH + EXTRA REVISIONS = GROSS REVENUE.
REVENUE − EXPENSES = PROFIT.

BEGINNER CHALLENGE
Complete one paid invitation:
1. Pick 2–3 invitation types you will offer.
2. Make 2 sample designs (no private addresses).
3. Write packages and revision limits.
4. Collect exact event details.
5. Design in Canva.
6. Proof spelling, date, time, venue, RSVP.
7. Get written client approval.
8. Export the right files.
9. Deliver and get paid.
10. Track revenue vs profit.
11. Ask for a referral or matching add-on.
`;

export const BASIC_INVITATION_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Design party or event invitations in Canva and export print/share files. Simple customized invitations for birthdays, showers, graduations, anniversaries, reunions, and celebrations — then deliver finished digital files. Tagline: Design It. Proof It. Deliver the Files. Category: Digital Design / Invitations. Beginner · 3 - 10 hrs/week · $15 – $50 / project (examples only).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer or tablet that can run Canva · Reliable internet · Smartphone for client communication · Client intake method · Payment method · Parent/guardian involvement for minors (accounts, payments, and client contact).",
  },
  {
    id: "proof",
    label: "Proof before you deliver",
    detail:
      "Confirm all names, dates, times, addresses, RSVP details, and spelling. Require client approval of the final proof. Keep an original editable copy. Screen colors and printed colors can differ — do not guarantee every outside printer’s result.",
  },
  {
    id: "copyright",
    label: "Licensing and copyright",
    detail:
      "Use properly licensed fonts, graphics, photos, templates, and design assets. Do not copy another designer. Do not use copyrighted characters, logos, celebrity images, team logos, or protected artwork without appropriate rights. Verify commercial-use rights. Platform terms can change.",
  },
  {
    id: "privacy",
    label: "Client and event privacy",
    detail:
      "Protect private event and customer information. Do not publicly post client invitations containing addresses, phone numbers, private RSVP links, or other personal details without permission.",
  },
];

export const BASIC_INVITATION_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Invitation design — verify current commercial-use terms" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Client intake" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "File organization and delivery" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Deadlines" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Projects, revenue, expenses, profit" },
];

export const BASIC_INVITATION_SUPPLIES = {
  starterKitTotal: "About $0–25 if you already have a computer — keep physical supplies minimal",
  items: [
    {
      id: "computer",
      name: "Computer or tablet capable of running Canva",
      qty: "1 (usually already owned)",
      estCost: "$0",
      notes: "Essential — this is a digital design business",
    },
    {
      id: "internet",
      name: "Reliable internet",
      qty: "1 connection",
      estCost: "$0",
      notes: "Essential — Canva, file delivery, client messages",
    },
    {
      id: "phone",
      name: "Smartphone for client communication",
      qty: "1 (usually already owned)",
      estCost: "$0",
      notes: "Essential — proofs, approvals, payment reminders",
    },
    {
      id: "checklist",
      name: "Notebook or digital intake checklist",
      qty: "1",
      estCost: "$0–5",
      notes: "Essential — names, date, time, venue, RSVP, theme, colors",
    },
    {
      id: "printer",
      name: "Optional printer for test prints",
      qty: "1",
      estCost: "$0 (if owned)",
      notes: "Optional — you do not need to print for the client",
      optional: true,
    },
    {
      id: "cardstock",
      name: "Optional quality paper / cardstock for testing only",
      qty: "1 small pack",
      estCost: "$6–12",
      notes: "Optional — test prints only, not inventory",
      optional: true,
    },
    {
      id: "samples",
      name: "Optional sample portfolio prints",
      qty: "a few sheets",
      estCost: "$0–8",
      notes: "Optional — show style without posting private client details",
      optional: true,
    },
  ],
};

export const BASIC_INVITATION_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Invitation design, templates, export PDF Print / PNG — verify commercial-use rights for assets",
    url: "https://www.canva.com/",
  },
  {
    id: "forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Client intake: event details, wording, colors, file format, deadline",
    url: "https://forms.google.com/",
  },
  {
    id: "drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Organize editable sources and deliver final files",
    url: "https://drive.google.com/",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Proof deadlines and delivery dates",
    url: "https://calendar.google.com/",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Projects, quoted price, expenses, and profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "email",
    name: "Email / messaging",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Client communication, proofs, and approvals",
  },
  {
    id: "payments",
    name: "Payment / invoicing tool",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Collect the design fee — not the client’s party budget",
  },
  {
    id: "convert",
    name: "Optional PDF / image conversion",
    freePlanAvailable: true,
    costNote: "Only if a client needs a format Canva does not export well",
    optional: true,
  },
  {
    id: "stock",
    name: "Optional stock / font resources",
    freePlanAvailable: true,
    costNote: "Only with appropriate commercial-use rights — verify current terms",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Canva + Google Forms + Google Drive + Google Sheets + Payment Tool",
  },
];

export const BASIC_INVITATION_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "BASIC INVITATION CREATOR — PRICING EXAMPLES",
    "",
    "Displayed earning potential: $15 – $50 / project (examples only).",
    "",
    "These are examples only, not guarantees.",
    "",
    "GROSS REVENUE = Base Design Fee + Add-Ons + Rush Fee (if any) + Extra Revision Fees (if any).",
    "ESTIMATED PROFIT = Gross Revenue − paid design assets − software allocation − payment fees − advertising − printing/shipping only if YOU provide it − other expenses.",
    "",
    "REVENUE is not PROFIT.",
    "",
    "Define what is included before starting: size, digital vs print files, number of versions, included revisions, and turnaround.",
    "",
    "STARTER RANGES — EXAMPLES ONLY",
    "Simple invitation using a customized template: approximately $15–$25",
    "Custom single invitation design: approximately $25–$50",
    "Invitation plus matching digital RSVP/social graphic: approximately $35–$75",
    "Additional revision rounds: optional extra fee",
    "Rush service: optional extra fee",
    "Matching thank-you card, save-the-date, menu, sign, or insert: optional add-on",
    "",
    "Price for design complexity, customization, number of versions/sizes, included revisions, turnaround, and commercial-use design assets.",
  ].join("\n"),
  raiseTip:
    "Charge more for custom illustration, extra sizes, matching suites, or rush. Displayed $15 – $50 / project is examples only — not income guarantees.",
  items: [
    { id: "template", label: "Simple customized template invitation", price: "$15–$25", notes: "Examples only" },
    { id: "custom", label: "Custom single invitation design", price: "$25–$50", notes: "Examples only" },
    { id: "suite", label: "Invitation + matching RSVP / social graphic", price: "$35–$75", notes: "Examples only" },
    { id: "revisions", label: "Extra revision rounds", price: "Optional extra fee", notes: "State how many rounds are included" },
    { id: "rush", label: "Rush service", price: "Optional extra fee", notes: "Examples only" },
    { id: "addon", label: "Matching thank-you / save-the-date / menu / sign / insert", price: "Add-on", notes: "Examples only" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const BASIC_INVITATION_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Invitation Types, Styles, and Packages",
    desc: [
      "Write a short menu so clients know what you design.",
      "",
      "Typical types:",
      "☐ Birthday",
      "☐ Shower",
      "☐ Graduation",
      "☐ Anniversary / reunion",
      "☐ Other appropriate celebration",
      "",
      "Decide digital-only vs print-ready files. Write what is included: size, number of versions, included revision rounds, and turnaround.",
      "Write what you will NOT do (for example: printing 200 copies, copying a Disney character, or last-minute same-hour delivery unless you charge rush).",
    ].join("\n"),
  },
  {
    title: "Create Sample Designs and a Small Portfolio",
    desc: [
      "Make 2–4 sample invitations using fictional names and a fake venue — never a real client address.",
      "Show 2–3 styles (clean, floral, bold) so buyers can point at a direction.",
      "Save editable Canva copies in Google Drive (Tools tab).",
      "Do not use copyrighted characters, team logos, or another designer’s layout.",
    ].join("\n"),
  },
  {
    title: "Set Up Client Intake and Collect Event Details",
    desc: [
      "Open Google Forms from the Tools tab for intake.",
      "",
      "Collect:",
      "☐ Client name and contact",
      "☐ Event type and honoree/host",
      "☐ Exact date, time, venue, address",
      "☐ RSVP name, method, and deadline",
      "☐ Theme, colors, special wording",
      "☐ Invitation size and digital vs print files",
      "☐ Deadline and rush need",
      "☐ Quoted package and included revisions",
      "",
      "Confirm spelling of every name before you design. Younger helpers: parent/guardian manages payments and client contact.",
    ].join("\n"),
  },
  {
    title: "Design the Invitation in Canva, Proof, and Export",
    desc: [
      "Open Canva from the Tools tab (https://www.canva.com/). Duplicate a licensed template or your sample — do not copy another designer’s invitation.",
      "Place the client’s exact wording. Keep fonts readable at print size.",
      "",
      "Proof before you send:",
      "☐ Names",
      "☐ Date",
      "☐ Time",
      "☐ Venue / address",
      "☐ RSVP line",
      "☐ Spelling",
      "",
      "Keep an original editable copy. Export the formats they asked for (often PDF Print + PNG for sharing).",
      "Screen colors and printed colors can differ. Do not guarantee every outside printer’s result.",
      "Verify commercial-use rights for fonts, photos, and graphics. Terms can change.",
    ].join("\n"),
  },
  {
    title: "Get Client Approval, Revisions, Delivery, and Payment",
    desc: [
      "Send a proof and require written approval before calling it final.",
      "Stay inside the included revision rounds. Extra rounds are an extra fee you quoted.",
      "Deliver files via Google Drive or email. Do not post the client’s address or private RSVP link on your public portfolio without permission.",
      "Collect the quoted fee (deposit + balance). Give a simple receipt.",
      "Save the editable source for a fast matching thank-you or reprint.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "You need hosts planning parties and events. Pick only 2 or 3 channels at first.",
      "",
      "Beginner options:",
      "☐ Friends / family referrals",
      "☐ Facebook",
      "☐ Instagram",
      "☐ Local / community groups where allowed",
      "☐ Event planners, decorators, bakers, and party vendors for referrals",
      "☐ Portfolio / sample posts (no private client details)",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Tell 10 trusted people this week.",
      "- Share one sample (fake address) in one parent-approved group.",
      "- Ask 2 party vendors if they need an invitation designer.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a birthday invitation or party invite you can customize as a SAMPLE (fake names — no real addresses).",
      "",
      "Create:",
      "☐ A one-page service menu and prices",
      "☐ 2–3 sample invitations (fictional details)",
      "☐ What is included / not included (revisions, file types)",
      "☐ How clients send event details and pay you",
      "",
      "Sample:",
      "“I design party invitations in Canva and send print/share files. Simple customized template $____ · custom design $____. Matching RSVP graphic available.”",
      "",
      "Do not post a real client’s home address on your flyer.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Do the 2–3 channels you chose.",
      "",
      "This week:",
      "☐ Share the menu with your referral list",
      "☐ Post one sample (no private details) where allowed",
      "☐ Ask one happy client or vendor for a referral",
      "",
      "Track yes / maybe / no. Younger helpers: a parent/guardian manages public posts.",
    ].join("\n"),
  },
  {
    title: "Protect Copyright, Licensing, and Client Privacy",
    desc: [
      "Before you deliver or post a portfolio piece:",
      "☐ Commercial-use rights checked for fonts/graphics/photos/templates",
      "☐ No copyrighted characters, logos, celebrity images, or team logos without rights",
      "☐ Client permission before sharing their real invitation publicly",
      "☐ No private addresses, phones, or RSVP links on public posts",
      "",
      "Verify current Canva / third-party licensing because terms change. Do not invent rules.",
    ].join("\n"),
  },
  {
    title: "Ask for Referrals and Matching Add-Ons",
    desc: [
      "After a happy delivery, ask for a testimonial and a referral.",
      "Offer matching add-ons only if you can deliver them: thank-you card, save-the-date, menu, sign, or insert — quoted separately.",
      "Do not pressure. Write the next event date if they mention one.",
    ].join("\n"),
  },
  {
    title: "Track Revenue, Profit, and Repeat Business",
    desc: [
      "Record:",
      "☐ Base design fees",
      "☐ Add-on revenue",
      "☐ Rush fees",
      "☐ Extra revision revenue",
      "☐ Paid graphics / assets / fonts",
      "☐ Software allocation",
      "☐ Payment processing",
      "☐ Advertising",
      "☐ Test printing (only if you did it)",
      "☐ Other expenses",
      "☐ Estimated profit, hours, profit per project, and profit per hour",
      "",
      "Open Google Sheets from the Tools tab. Revenue is not profit.",
    ].join("\n"),
  },
];

export function basicInvitationToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Canva + Google Forms + Google Drive + Google Sheets + Payment Tool.",
    "",
    "Apps belong here. Test paper and optional sample prints live on the Supply List — you do not need inventory.",
    "",
    "Verify current Canva commercial-use terms. Parent/guardian manages accounts, payments, and client contact for minors.",
  ].join("\n");
}

/** Invitation-design profit. Revenue is not profit. */
export function computeBasicInvitationProfit(input: {
  templateInvites?: number;
  templatePrice?: number;
  customDesigns?: number;
  customPrice?: number;
  addOnRevenue?: number;
  rushFees?: number;
  extraRevisionRevenue?: number;
  paidAssets?: number;
  software?: number;
  paymentProcessing?: number;
  advertising?: number;
  testPrinting?: number;
  otherExpenses?: number;
  laborHours?: number;
  projectsCompleted?: number;
}): {
  templateRevenue: number;
  customRevenue: number;
  addOnRevenue: number;
  rushFees: number;
  extraRevisionRevenue: number;
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerProject: number | null;
  profitPerHour: number | null;
  averageRevenuePerClient: number | null;
  averageProjectPrice: number | null;
  profitMarginPercent: number;
} {
  const templateInvites = Math.max(0, Number(input.templateInvites) || 0);
  const customDesigns = Math.max(0, Number(input.customDesigns) || 0);
  const templateRevenue = templateInvites * Math.max(0, Number(input.templatePrice) || 0);
  const customRevenue = customDesigns * Math.max(0, Number(input.customPrice) || 0);
  const addOnRevenue = Math.max(0, Number(input.addOnRevenue) || 0);
  const rushFees = Math.max(0, Number(input.rushFees) || 0);
  const extraRevisionRevenue = Math.max(0, Number(input.extraRevisionRevenue) || 0);
  const grossRevenue = templateRevenue + customRevenue + addOnRevenue + rushFees + extraRevisionRevenue;
  const totalExpenses =
    Math.max(0, Number(input.paidAssets) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.paymentProcessing) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.testPrinting) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const hours = Math.max(0, Number(input.laborHours) || 0);
  const projectsCompleted = Math.max(0, Number(input.projectsCompleted) || 0);
  return {
    templateRevenue,
    customRevenue,
    addOnRevenue,
    rushFees,
    extraRevisionRevenue,
    grossRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerProject: projectsCompleted > 0 ? estimatedProfit / projectsCompleted : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    averageRevenuePerClient: projectsCompleted > 0 ? grossRevenue / projectsCompleted : null,
    averageProjectPrice: projectsCompleted > 0 ? grossRevenue / projectsCompleted : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
