/**
 * Appointment Setter (`appointment-setter`, Guide #034).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const APPOINTMENT_SETTER_REALITY_CHECK = {
  title: "YOUR JOB IS TO GET THE APPOINTMENT ON THE CALENDAR",
  body: [
    "You do not have to be the salesperson.",
    "",
    "Your basic workflow:",
    "INQUIRY → RESPOND → CHECK AVAILABILITY → BOOK → CONFIRM → REMIND → UPDATE",
    "",
    "Tagline: Turn Interested Leads Into Booked Appointments.",
  ].join("\n"),
};

/** Appointment Setting planner shown above freeform Notes for this guide. */
export const APPOINTMENT_SETTER_NOTES_WORKSHEET = `MY APPOINTMENT SETTING BUSINESS

Ideal Client:
____________________

Starter Offer:
____________________

Price:
$____

MY MARKETING CHANNELS:

1. __________
2. __________
3. __________

CLIENT:

Business: __________
Contact: __________
Services: __________

Calendar:
____________________

Booking Rules:
____________________

Available Hours:
____________________

Cancellation Policy:
____________________

Approved Script:
____________________

REPORTING:

Qualified Inquiries: _____
Appointments Booked: _____
Rescheduled: _____
Cancelled: _____
No Response: _____
Booking Rate: _____%

Hours Worked: _____
Revenue: $____
Expenses: $____
Profit: $____

What Worked:
____________________

What Needs Improvement:
____________________

Next Follow-Up:
____________________

GYSH PRO TIP — FAST + ACCURATE + FRIENDLY WINS.
Someone who asked about an appointment is already interested.
Make the next step EASY: “Would Tuesday at 2:00 or Wednesday at 11:00 work better?”
That's usually stronger than “When would you like to come in?”
Give people a simple next decision while staying within the client's approved availability.

BEGINNER CHALLENGE:
Create a SAMPLE APPOINTMENT SYSTEM:
1 shared-calendar example + 1 lead tracker + 1 new-inquiry script + 1 confirmation + 1 reminder + 1 weekly report.
Now you have a simple workflow to show a potential client.`;

export const APPOINTMENT_SETTER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help coaches, tutors, consultants, beauty professionals, home-service providers, and other busy professionals turn inquiries into scheduled appointments using an approved script and shared calendar. Services can include appointment booking, confirmations, reminders, rescheduling, cancellations, and basic follow-up. Category: Virtual Assistance / Scheduling. Best for teens, adults, seniors / retirees. Beginner · $0–very low startup · Flexible / recurring · Remote · Per project / hourly / recurring · 3–10 hrs/week · Starter Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable internet · Phone/computer · Professional communication · Calendar skills · Attention to detail · Ability to follow scripts/processes · Reliable availability.",
  },
  {
    id: "client-provides",
    label: "Client must provide",
    detail:
      "Services offered · Calendar access · Available appointment times · Appointment length · Scheduling rules · Approved messages/scripts · Cancellation/reschedule policy · Escalation contact.",
  },
  {
    id: "privacy",
    label: "PRIVACY",
    detail:
      "Only access information needed to perform the job. Do not share client/customer information, download unnecessary customer lists, use customer information personally, or promise prices/services not approved by the client.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — offer two times",
    detail:
      "Fast + accurate + friendly wins. Offer two approved times instead of an open-ended “when works?” — keep every reply within the client's rules.",
  },
];

export const APPOINTMENT_SETTER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Shared scheduling",
  },
  {
    label: "Calendly",
    url: "https://calendly.com/",
    note: "Booking links when the client uses them",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Lead / inquiry tracking",
  },
  {
    label: "Google Docs",
    url: "https://docs.google.com/",
    note: "Scripts and processes",
  },
  {
    label: "Gmail",
    url: "https://mail.google.com/",
    note: "Email outreach and confirmations",
  },
  {
    label: "Google Meet",
    url: "https://meet.google.com/",
    note: "Client meetings when needed",
  },
  {
    label: "Zoom",
    url: "https://zoom.us/",
    note: "Client meetings when needed",
  },
  {
    label: "Google Drive",
    url: "https://drive.google.com/",
    note: "Client files",
  },
];

export const APPOINTMENT_SETTER_SUPPLIES = {
  starterKitTotal:
    "About $0–20 — startup can be $0 if you already have a phone/computer and internet",
  items: [
    {
      id: "computer",
      name: "Computer / tablet",
      qty: "1",
      estCost: "$0",
      notes: "Essential — already owned",
    },
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "internet",
      name: "Reliable internet",
      qty: "1",
      estCost: "$0+",
      notes: "Essential",
    },
    {
      id: "email",
      name: "Email",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "calendar",
      name: "Shared calendar access",
      qty: "1",
      estCost: "$0",
      notes: "Essential — client provides",
    },
    {
      id: "scripts",
      name: "Client scripts (printed or Docs)",
      qty: "1 set",
      estCost: "$0–5",
      notes: "Essential",
    },
    {
      id: "tracker",
      name: "Tracking system (Sheets)",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "headset",
      name: "Headset",
      qty: "1",
      estCost: "$15–40",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "work-phone",
      name: "Separate work phone / number",
      qty: "1",
      estCost: "$0–15/mo",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "quiet",
      name: "Quiet workspace",
      qty: "1",
      estCost: "$0",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "monitor",
      name: "Second monitor",
      qty: "1",
      estCost: "$0+",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "faq",
      name: "Client FAQ sheet",
      qty: "1",
      estCost: "$0–3",
      notes: "Helpful",
      optional: true,
    },
  ],
};

export const APPOINTMENT_SETTER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "as_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Shared scheduling",
    url: "https://calendar.google.com/",
  },
  {
    id: "as_calendly",
    name: "Calendly",
    freePlanAvailable: true,
    costNote: "Booking links when the client uses them",
    url: "https://calendly.com/",
    optional: true,
  },
  {
    id: "as_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Lead / inquiry tracking",
    url: "https://sheets.google.com/",
  },
  {
    id: "as_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Scripts and processes",
    url: "https://docs.google.com/",
  },
  {
    id: "as_gmail",
    name: "Gmail / Outlook",
    freePlanAvailable: true,
    costNote: "Email confirmations and outreach",
    url: "https://mail.google.com/",
  },
  {
    id: "as_meet",
    name: "Zoom / Google Meet",
    freePlanAvailable: true,
    costNote: "Client meetings when needed",
    url: "https://meet.google.com/",
    optional: true,
  },
  {
    id: "as_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Client files",
    url: "https://drive.google.com/",
  },
  {
    id: "as_crm",
    name: "Client CRM",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Use when the client provides one",
    optional: true,
  },
  {
    id: "as_phone",
    name: "Business phone / text system",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Use when the client provides one",
    optional: true,
  },
  {
    id: "as_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Shared Calendar + Email/Text + Google Sheets + Client Script",
  },
];

export const APPOINTMENT_SETTER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "STARTER EXAMPLES — displayed range: $15–$50/project (examples).",
    "",
    "Do NOT promise that every lead will book.",
    "",
    "Define what is included: number of leads/inquiries, number of follow-ups, booking, confirmation, reminders, rescheduling, reporting.",
    "",
    "Avoid unlimited follow-up for one small flat fee.",
    "",
    "As experience grows, recurring clients may prefer hourly pricing, a weekly package, a monthly retainer, or a per-appointment arrangement.",
    "",
    "Examples only — not income guarantees. Pricing varies by volume, complexity, and client systems.",
  ].join("\n"),
  raiseTip:
    "After a few clean reports, offer a weekly/monthly retainer for ongoing calendar coverage. Examples only — not income guarantees.",
  items: [
    {
      id: "small",
      label: "SMALL SCHEDULING PROJECT",
      price: "$15–$25",
      notes: "Starter project",
    },
    {
      id: "followup",
      label: "APPOINTMENT FOLLOW-UP PROJECT",
      price: "$25–$40",
      notes: "Common beginner booking",
    },
    {
      id: "larger",
      label: "LARGER SCHEDULING / REMINDER PROJECT",
      price: "$40–$50+",
      notes: "Higher volume or more touchpoints",
    },
    {
      id: "range",
      label: "DISPLAYED STARTER RANGE",
      price: "$15–$50 / project",
      notes: "Examples only — not income guarantees",
    },
    {
      id: "hourly",
      label: "Hourly (as experience grows)",
      price: "Agree in writing",
    },
    {
      id: "weekly",
      label: "Weekly package / monthly retainer",
      price: "Recurring — define scope",
      notes: "Predictable income opportunity after you prove results",
    },
  ],
};

/**
 * Core launch steps (exactly 11). Steps 3–5 are the required marketing block
 * (Choose channels / Make materials / Carry out), tailored to appointment setting.
 * Foundation + closing are applied by finalize.
 */
export const APPOINTMENT_SETTER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Who You Help",
    desc: [
      "Good beginner clients:",
      "☐ Coaches",
      "☐ Tutors",
      "☐ Consultants",
      "☐ Beauty professionals",
      "☐ Photographers",
      "☐ Real-estate professionals",
      "☐ Home-service professionals",
      "☐ Fitness professionals",
      "☐ Small local businesses",
      "☐ Other appointment-based businesses",
      "",
      "Start with businesses where appointments are easy to understand.",
    ].join("\n"),
  },
  {
    title: "Create Your Starter Offer",
    desc: [
      "Example:",
      "",
      "APPOINTMENT SETTING MINI",
      "",
      "I will:",
      "☐ Respond to approved inquiries",
      "☐ Offer available appointment times",
      "☐ Book appointments",
      "☐ Send confirmations",
      "☐ Send reminders",
      "☐ Track results",
      "",
      "Up to _____ inquiries/leads",
      "",
      "Price: $____",
      "Time Period: __________",
      "",
      "Be clear about what is NOT included.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about you.",
      "",
      "Pick ONLY 2 or 3 this month.",
      "",
      "Good channels:",
      "☐ LinkedIn",
      "☐ Email",
      "☐ Local business outreach",
      "☐ Facebook business groups",
      "☐ Entrepreneur groups",
      "☐ Professional referrals",
      "☐ Virtual-assistant communities",
      "☐ Networking groups",
      "☐ Direct outreach to appointment-based businesses",
      "",
      "Write:",
      "Service: Appointment Setting",
      "Starter Price: $____",
      "Ideal Client: __________",
      "",
      "Set measurable goals:",
      "☐ Contact _____ businesses",
      "☐ Send _____ introductions",
      "☐ Ask _____ people for referrals",
      "☐ Post _____ service offers",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "1. Simple service graphic",
      "2. Short description",
      "3. Outreach message",
      "4. Sample appointment tracker",
      "",
      "SAMPLE:",
      "",
      "NEED HELP KEEPING YOUR CALENDAR FULL?",
      "",
      "Appointment Setting Support",
      "☐ Respond to Inquiries",
      "☐ Schedule Appointments",
      "☐ Send Confirmations",
      "☐ Send Reminders",
      "☐ Handle Rescheduling",
      "☐ Track Follow-Ups",
      "",
      "Starting at $____",
      "Contact: __________",
      "",
      "OUTREACH MESSAGE:",
      "",
      "“Hi! I provide appointment-setting support for busy professionals. I can help respond to approved inquiries, schedule appointments, send reminders, handle rescheduling, and keep your calendar organized. If scheduling is taking time away from your business, I'd be happy to discuss your current process.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2–3 channels selected.",
      "",
      "This week:",
      "☐ Contact 8–12 appropriate businesses",
      "☐ Send your introduction",
      "☐ Share service information",
      "☐ Ask for referrals",
      "☐ Follow up with interested businesses",
      "",
      "Look for businesses that depend on appointments, receive regular inquiries, have busy owners, miss follow-ups, or need scheduling help.",
      "",
      "Track:",
      "Date | Business | Contact | Channel | Response | Follow-Up",
      "",
      "Do not spam.",
    ].join("\n"),
  },
  {
    title: "Learn the Client's Booking Rules",
    desc: [
      "Before touching the calendar, document:",
      "",
      "Services: __________",
      "Appointment Lengths: __________",
      "Available Days: __________",
      "Available Hours: __________",
      "Buffer Time: __________",
      "Booking Link: __________",
      "",
      "Know:",
      "☐ Who can book",
      "☐ What information to collect",
      "☐ Which calendar to use",
      "☐ How far ahead to schedule",
      "☐ Cancellation rules",
      "☐ Reschedule rules",
      "☐ What requires client approval",
      "☐ When to escalate",
      "",
      "Never guess.",
    ].join("\n"),
  },
  {
    title: "Create Your Approved Scripts",
    desc: [
      "Create templates with client approval.",
      "",
      "NEW INQUIRY:",
      "“Hi _____! Thanks for reaching out to _____. I'd be happy to help you schedule. We currently have _____ or _____ available. Which works better for you?”",
      "",
      "CONFIRMATION:",
      "“Great! You're scheduled for _____ on _____ at _____. You'll receive the appointment details shortly.”",
      "",
      "REMINDER:",
      "“Just a reminder about your appointment with _____ tomorrow at _____. Please reply if you need to reschedule.”",
      "",
      "RESCHEDULE:",
      "“No problem. Let's find another time that works.”",
      "",
      "Use the client's tone and approved wording.",
    ].join("\n"),
  },
  {
    title: "Work the Inquiries",
    desc: [
      "For each approved lead/inquiry:",
      "☐ Review request",
      "☐ Respond using approved script",
      "☐ Answer permitted basic questions",
      "☐ Offer available times",
      "☐ Record response",
      "☐ Follow approved follow-up schedule",
      "☐ Escalate questions you cannot answer",
      "",
      "Do NOT invent:",
      "Prices · Policies · Availability · Discounts · Services · Guarantees",
    ].join("\n"),
  },
  {
    title: "Book, Confirm & Remind",
    desc: [
      "Once the person chooses a time:",
      "☐ Verify correct person",
      "☐ Verify service",
      "☐ Verify date",
      "☐ Verify time/time zone when relevant",
      "☐ Add appointment",
      "☐ Send confirmation",
      "☐ Send required details",
      "☐ Schedule reminder",
      "",
      "Double-check before saving.",
      "",
      "A wrong appointment creates work for everyone.",
    ].join("\n"),
  },
  {
    title: "Handle Changes & Track Results",
    desc: [
      "For cancellations/reschedules:",
      "☐ Follow client policy",
      "☐ Update calendar immediately",
      "☐ Confirm new time",
      "☐ Record outcome",
      "",
      "Track:",
      "Inquiries Received: _____",
      "People Contacted: _____",
      "Appointments Booked: _____",
      "Rescheduled: _____",
      "Cancelled: _____",
      "No Response: _____",
      "No-Shows if provided: _____",
      "",
      "Booking Rate:",
      "Appointments Booked ÷ Qualified Inquiries × 100",
      "",
      "Example:",
      "20 qualified inquiries · 8 appointments booked",
      "8 ÷ 20 = 40% booking rate",
      "",
      "Do not count spam, duplicates, or clearly unqualified contacts as qualified inquiries when measuring performance.",
    ].join("\n"),
  },
  {
    title: "Report & Get Rebooked",
    desc: [
      "Send client a simple report.",
      "",
      "APPOINTMENT REPORT",
      "Period: __________",
      "",
      "Qualified Inquiries: _____",
      "Appointments Booked: _____",
      "Rescheduled: _____",
      "Cancelled: _____",
      "No Response: _____",
      "Booking Rate: _____%",
      "",
      "Common Questions: ____________________",
      "Problems: ____________________",
      "Recommended Process Improvements: ____________________",
      "",
      "Then ask:",
      "“Would you like me to continue managing appointment follow-up next week/month?”",
      "",
      "Recurring scheduling can turn a small project into predictable monthly income.",
    ].join("\n"),
  },
];

export function appointmentSetterToolsDisclaimer(): string {
  return [
    "Beginner stack: Shared Calendar + Email/Text + Google Sheets + Client Script.",
    "",
    "Use the CLIENT'S approved system whenever possible.",
    "",
    "Never invent prices, policies, availability, discounts, services, or guarantees — escalate anything outside the approved script.",
  ].join("\n");
}

/** Booking rate helper (qualified inquiries only). */
export function computeAppointmentBookingRate(
  appointmentsBooked: number,
  qualifiedInquiries: number,
): number | null {
  const booked = Math.max(0, Number(appointmentsBooked) || 0);
  const qualified = Math.max(0, Number(qualifiedInquiries) || 0);
  if (qualified <= 0) return null;
  return (booked / qualified) * 100;
}

/** Weekly appointment-setter profit math. */
export function computeAppointmentSetterProfit(input: {
  projectPrice: number;
  projectsPerWeek: number;
  recurringClientRevenue: number;
  hoursWorked: number;
  softwarePhoneExpense: number;
  otherExpenses: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  effectiveHourlyRate: number | null;
} {
  const price = Math.max(0, Number(input.projectPrice) || 0);
  const projects = Math.max(0, Number(input.projectsPerWeek) || 0);
  const recurring = Math.max(0, Number(input.recurringClientRevenue) || 0);
  const weeklyRevenue = price * projects + recurring;
  const weeklyExpenses =
    Math.max(0, Number(input.softwarePhoneExpense) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const hours = Math.max(0, Number(input.hoursWorked) || 0);
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    effectiveHourlyRate: hours > 0 ? weeklyProfit / hours : null,
  };
}
