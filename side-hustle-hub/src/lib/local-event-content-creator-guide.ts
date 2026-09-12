/**
 * Local Event Content Creator (`local-event-content-creator`, Guide #083).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const LOCAL_EVENT_CONTENT_REALITY_CHECK = {
  title: "YOU DON'T NEED TO BE A PROFESSIONAL VIDEOGRAPHER",
  body: [
    "This hustle is about quick, useful SOCIAL CONTENT — not producing a wedding film or cinematic commercial.",
    "",
    "Clients may need: short vertical clips, event photos, behind-the-scenes moments, vendor/activity clips, crowd/atmosphere shots, a short recap Reel, or a simple recap post.",
    "",
    "Tagline: Capture the Moment. Create the Recap. Get Paid.",
  ].join("\n"),
};

/** Event Content Creator Planner shown above freeform Notes for this guide. */
export const LOCAL_EVENT_CONTENT_NOTES_WORKSHEET = `MY EVENT CONTENT CREATOR PLAN

Starter Package: __________
Price: $____
Service Area: __________

MARKETING CHANNELS:
1. __________
2. __________
3. __________

EVENT:
Client/Organization: __________
Event: __________
Date: __________
Location: __________
Contact: __________

DELIVERABLES:
Photos: ______
Clips: ______
Reels: ______
Other: __________

MUST CAPTURE:
1. __________
2. __________
3. __________

DO NOT CAPTURE:
____________________

Price: $____
Expenses: $____
Profit: $____
Hours: ______

Delivery Date: __________
Delivered: ☐

Testimonial Requested: ☐
Referral Requested: ☐
Portfolio Permission: ☐
Next Event Opportunity: __________

GYSH PRO TIP — DON'T SELL “PHOTOS.” SELL CONTENT THEY CAN USE.
The organizer doesn't just need 20 random pictures.
They need content that helps them show what happened, thank attendees,
highlight vendors, promote the next event, and keep social pages active.

Think: “What will they want to POST tomorrow?”

BEGINNER CHALLENGE:
Attend one parent-approved/local event where photography is allowed
and create a SAMPLE EVENT RECAP:
5 strong photos + 5 short vertical clips + 1 simple recap.
Now you have something to show your first potential client.`;

export const LOCAL_EVENT_CONTENT_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Use your smartphone to capture short video clips, photos, and simple event recap content for school events, markets, community gatherings, small businesses, nonprofits, clubs, and other local organizations. Category: Content Creation / Local Business Services. Best for teens, adults, seniors / retirees. Beginner · Very low startup · Flexible / events / weekends · Local events · Per project / recurring · 3–10 hrs/week · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Smartphone with a good camera · Enough phone storage · Charged battery · Reliable transportation · Basic photo/video skills · Basic editing ability · Ability to transfer files · Permission to capture the event.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "Portable charger · Small tripod/gimbal · Canva · CapCut or similar editor · Google Drive / Dropbox.",
  },
  {
    id: "permission",
    label: "IMPORTANT — permission & privacy",
    detail:
      "Confirm what may and may not be photographed. Be especially careful at schools, youth events, private events, and medical/community-service events. Never assume you have permission to photograph/post identifiable people, especially minors. Follow organizer rules and applicable consent/release requirements.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — sell usable content",
    detail:
      "Don't sell “photos.” Sell content they can use — show what happened, thank attendees, highlight vendors, promote the next event, and keep social pages active. Ask: what will they want to POST tomorrow?",
  },
];

export const LOCAL_EVENT_CONTENT_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "CapCut",
    url: "https://www.capcut.com/",
    note: "Video editing / short Reels",
  },
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Graphics and recap posts",
  },
  {
    label: "Google Drive",
    url: "https://drive.google.com/",
    note: "Client delivery folders",
  },
  {
    label: "Dropbox",
    url: "https://www.dropbox.com/",
    note: "Alternate file delivery",
  },
  {
    label: "Google Photos",
    url: "https://photos.google.com/",
    note: "Organize and select shots",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Bookings",
  },
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Event locations",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Leads / jobs / income",
  },
];

export const LOCAL_EVENT_CONTENT_SUPPLIES = {
  starterKitTotal:
    "About $0–40 — use the phone you already own; optional power bank / small tripod later. Do NOT buy expensive camera equipment to start.",
  items: [
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential — already owned",
    },
    {
      id: "charger",
      name: "Charger",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "storage",
      name: "Available phone storage",
      qty: "enough for event",
      estCost: "$0",
      notes: "Essential — free space before you arrive",
    },
    {
      id: "data",
      name: "Internet / data access",
      qty: "1",
      estCost: "$0",
      notes: "Essential for delivery when needed",
    },
    {
      id: "transport",
      name: "Transportation to the event",
      qty: "1",
      estCost: "$0+",
      notes: "Essential",
    },
    {
      id: "powerbank",
      name: "Portable battery",
      qty: "1",
      estCost: "$15–30",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "tripod",
      name: "Small tripod",
      qty: "1",
      estCost: "$10–25",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "gimbal",
      name: "Gimbal",
      qty: "1",
      estCost: "$30–80",
      notes: "Helpful — buy later if needed",
      optional: true,
    },
    {
      id: "light",
      name: "Phone light",
      qty: "1",
      estCost: "$10–25",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "cloth",
      name: "Cleaning cloth",
      qty: "1",
      estCost: "$0–5",
      notes: "Helpful — clean lens before shooting",
      optional: true,
    },
    {
      id: "bag",
      name: "Small bag",
      qty: "1",
      estCost: "$0–15",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "shotlist",
      name: "Shot checklist (printed)",
      qty: "1",
      estCost: "$0–3",
      notes: "Helpful",
      optional: true,
    },
  ],
};

export const LOCAL_EVENT_CONTENT_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "lec_camera",
    name: "Phone Camera",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Capture photos and short vertical clips",
  },
  {
    id: "lec_capcut",
    name: "CapCut",
    freePlanAvailable: true,
    costNote: "Video editing / short Reels",
    url: "https://www.capcut.com/",
  },
  {
    id: "lec_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Graphics / recaps",
    url: "https://www.canva.com/",
  },
  {
    id: "lec_drive",
    name: "Google Drive / Dropbox",
    freePlanAvailable: true,
    costNote: "Client delivery",
    url: "https://drive.google.com/",
  },
  {
    id: "lec_photos",
    name: "Google Photos / Photos",
    freePlanAvailable: true,
    costNote: "Organization and selection",
    url: "https://photos.google.com/",
  },
  {
    id: "lec_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Bookings",
    url: "https://calendar.google.com/",
  },
  {
    id: "lec_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Event locations",
    url: "https://maps.google.com/",
  },
  {
    id: "lec_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Leads / jobs / income",
    url: "https://sheets.google.com/",
  },
  {
    id: "lec_social",
    name: "Instagram / Facebook",
    freePlanAvailable: true,
    costNote: "Portfolio when appropriate",
    optional: true,
  },
  {
    id: "lec_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Smartphone + CapCut + Canva + Google Drive",
  },
];

export const LOCAL_EVENT_CONTENT_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "STARTER EXAMPLES — displayed range: $15–$50/project (examples).",
    "",
    "Always agree BEFORE the event: Time + Deliverables + Editing + Delivery Date + Price.",
    "",
    "As experience, portfolio quality, editing, event length, and deliverables increase, larger custom packages may exceed the starter $15–$50 examples.",
    "",
    "Examples only — not income guarantees. Pricing varies by market, experience, deliverables, and travel.",
  ].join("\n"),
  raiseTip:
    "After a few strong events, raise rates or add Reel / same-day / caption packages. Examples only — not income guarantees.",
  items: [
    {
      id: "mini",
      label: "MINI CONTENT CAPTURE — 15–20 minutes · 5–10 usable photos/clips",
      price: "$15–$25",
      notes: "Starter package",
    },
    {
      id: "event-mini",
      label: "EVENT MINI — 30–45 minutes · 10–20 usable photos/clips",
      price: "$25–$40",
      notes: "Common beginner booking",
    },
    {
      id: "recap",
      label: "EVENT RECAP — 45–60 minutes · content collection + simple recap",
      price: "$40–$50+",
      notes: "Content + simple recap",
    },
    {
      id: "range",
      label: "DISPLAYED STARTER RANGE",
      price: "$15–$50 / project",
      notes: "Examples only — not income guarantees",
    },
    {
      id: "reel",
      label: "Add-on: Edited Reel",
      price: "Additional fee",
    },
    {
      id: "hour",
      label: "Add-on: Additional hour",
      price: "Additional fee",
    },
    {
      id: "same-day",
      label: "Add-on: Same-day delivery",
      price: "Additional fee",
    },
    {
      id: "clips",
      label: "Add-on: Additional edited clips",
      price: "Additional fee",
    },
    {
      id: "canva",
      label: "Add-on: Canva recap graphic",
      price: "Additional fee",
    },
    {
      id: "caption",
      label: "Add-on: Caption writing",
      price: "Additional fee",
    },
    {
      id: "location",
      label: "Add-on: Additional location",
      price: "Additional fee",
    },
  ],
};

/**
 * Core launch steps (exactly 11). Steps 3–5 are the required marketing block
 * (Choose channels / Make materials / Carry out), tailored to local events.
 * Foundation + closing are applied by finalize.
 */
export const LOCAL_EVENT_CONTENT_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Event Services",
    desc: [
      "Start simple.",
      "",
      "I Offer:",
      "☐ Photos",
      "☐ Short vertical video clips",
      "☐ Behind-the-scenes content",
      "☐ Vendor/activity clips",
      "☐ Event recap",
      "☐ Simple edited Reel",
      "☐ Recap caption/post",
      "",
      "Events I Want:",
      "☐ Markets",
      "☐ Community events",
      "☐ School events where permitted",
      "☐ Sports/community programs",
      "☐ Fundraisers",
      "☐ Church/community gatherings",
      "☐ Small business events",
      "☐ Pop-ups",
      "☐ Other: __________",
    ].join("\n"),
  },
  {
    title: "Build Your Starter Package",
    desc: [
      "Choose ONE easy offer.",
      "",
      "Example:",
      "",
      "LOCAL EVENT MINI",
      "30 minutes",
      "10–15 usable photos/clips",
      "Digital delivery",
      "$____",
      "",
      "Optional Add-On:",
      "Simple recap Reel + $____",
      "",
      "Keep your first offer easy to explain and deliver.",
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
      "☐ Direct outreach to event organizers",
      "☐ Local businesses",
      "☐ Vendor/market organizers",
      "☐ Facebook community/business groups",
      "☐ Instagram",
      "☐ Email",
      "☐ Text/referrals",
      "☐ Community organizations",
      "☐ Schools/clubs where appropriate",
      "☐ Local nonprofits",
      "☐ Networking at events",
      "",
      "Write at top of your marketing plan:",
      "Service: __________",
      "Starter Price: $____",
      "Area Served: __________",
      "",
      "Set measurable goals:",
      "☐ Contact _____ organizers",
      "☐ Contact _____ local businesses",
      "☐ Post _____ portfolio examples",
      "☐ Ask _____ people for referrals",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "1. Simple Canva flyer/service graphic",
      "2. 3–6 sample photos/clips",
      "3. Short portfolio/reel if possible",
      "4. Short outreach message",
      "",
      "Sample:",
      "",
      "LOCAL EVENT CONTENT CREATOR",
      "",
      "Hosting an event?",
      "",
      "I capture quick photos and short vertical video clips you can use for your social media and event recap.",
      "",
      "☐ Photos",
      "☐ Short Video Clips",
      "☐ Behind-the-Scenes",
      "☐ Event Recap Content",
      "",
      "Packages starting at $____",
      "Serving: __________",
      "Contact: __________",
      "",
      "OUTREACH MESSAGE:",
      "",
      "“Hi! I saw you're hosting __________. I create affordable social content for local events — short clips, photos and recap content that organizers can use after the event. My starter package is $____. I'd love to send you a few examples.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2–3 channels you selected.",
      "",
      "This week:",
      "☐ Contact 8–12 relevant organizers/businesses",
      "☐ Send your short pitch",
      "☐ Share portfolio examples",
      "☐ Post in selected local channels",
      "☐ Ask for referrals",
      "",
      "Look for upcoming: markets, festivals, fundraisers, pop-ups, community events, business openings, sports events, workshops, school/community activities where permitted.",
      "",
      "Track:",
      "Date | Organization | Event | Channel | Response | Follow-Up",
      "",
      "Follow up politely if there is no response.",
    ].join("\n"),
  },
  {
    title: "Book & Define the Job",
    desc: [
      "Before accepting, confirm:",
      "",
      "Event: __________",
      "Date: __________",
      "Location: __________",
      "Arrival: __________",
      "End Time: __________",
      "Price: $____",
      "",
      "Deliverables:",
      "_____ Photos",
      "_____ Raw Clips",
      "_____ Edited Clips",
      "_____ Reel(s)",
      "_____ Recap Post/Caption",
      "",
      "Delivery Deadline: __________",
      "",
      "Also confirm:",
      "What should be captured? · What should NOT be captured? · Who can be photographed? · Where can you go? · Who is your event contact?",
      "",
      "Get agreement in writing when practical.",
    ].join("\n"),
  },
  {
    title: "Create Your Shot List",
    desc: [
      "Don't arrive and randomly record everything.",
      "",
      "Create:",
      "☐ Venue/sign",
      "☐ Setup",
      "☐ Organizer",
      "☐ Vendors",
      "☐ Products/displays",
      "☐ Activities",
      "☐ Crowd atmosphere where permitted",
      "☐ Close-up details",
      "☐ Wide shots",
      "☐ Vertical clips",
      "☐ Key event moment",
      "☐ Closing shot",
      "",
      "Ask organizer:",
      "“What are the 3 things you MOST want captured?”",
    ].join("\n"),
  },
  {
    title: "Capture the Event",
    desc: [
      "Arrive 10–15 minutes early when appropriate.",
      "",
      "Before:",
      "☐ Clean camera lens",
      "☐ Charge phone",
      "☐ Check storage",
      "☐ Review shot list",
      "",
      "Capture a MIX:",
      "WIDE — show the event",
      "MEDIUM — people/activity",
      "CLOSE — details/products/signage",
      "",
      "For video: record several short, steady vertical clips.",
      "",
      "Avoid recording everything from one spot.",
      "",
      "Respect privacy and organizer restrictions.",
    ].join("\n"),
  },
  {
    title: "Organize & Edit",
    desc: [
      "After event:",
      "☐ Remove unusable shots",
      "☐ Choose strongest content",
      "☐ Lightly correct photos if needed",
      "☐ Trim clips",
      "☐ Create agreed Reel/recap",
      "☐ Check spelling",
      "☐ Confirm correct event/business names",
      "☐ Keep within agreed deliverables",
      "",
      "Don't bury the client in hundreds of bad files.",
      "",
      "Deliver the BEST usable content.",
    ].join("\n"),
  },
  {
    title: "Deliver & Get Approval",
    desc: [
      "Create organized delivery folders:",
      "",
      "EVENT NAME",
      "├── Photos",
      "├── Video Clips",
      "└── Edited Content",
      "",
      "Send through agreed delivery method.",
      "",
      "Message:",
      "“Your event content is ready! I've included the photos/clips and the agreed recap content here: __________. Thank you for having me capture your event.”",
      "",
      "Ask:",
      "“Is everything you expected included?”",
    ].join("\n"),
  },
  {
    title: "Turn One Event into More Events",
    desc: [
      "After successful delivery:",
      "",
      "Ask for:",
      "☐ Testimonial",
      "☐ Referral",
      "☐ Permission to use selected work in portfolio",
      "☐ Next event booking",
      "",
      "Message:",
      "“I'm glad you enjoyed the content! If you have another event coming up, I'd love to help again. And if you know another organizer who needs event content, referrals are always appreciated.”",
      "",
      "Then contact appropriate vendors/businesses you met at the event ONLY when appropriate and permitted.",
      "",
      "One event can lead to:",
      "Organizer → Vendor → Business → Another Event → Recurring Client",
    ].join("\n"),
  },
];

export function localEventContentToolsDisclaimer(): string {
  return [
    "Beginner stack: Smartphone + CapCut + Canva + Google Drive.",
    "",
    "This is smartphone social content for local events — not professional videography or cinematic commercials.",
    "",
    "Always confirm photo/video permission, especially at schools and youth events.",
  ].join("\n");
}
