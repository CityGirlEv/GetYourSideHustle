/**
 * Local Event Content Creator (`local-event-content-creator`, Guide #083).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const LOCAL_EVENT_CONTENT_REALITY_CHECK = {
  title: "YOU DO NOT NEED TO BE A PROFESSIONAL VIDEOGRAPHER",
  body: [
    "This side-hustle is about useful, fast smartphone content — not producing a wedding film or cinematic commercial.",
    "",
    "Clients may need: short vertical clips, event photos, behind-the-scenes footage, vendor or booth clips, crowd/atmosphere shots, simple recap reels, or social-media-ready content.",
    "",
    "Start with the phone you already own and learn to capture clean, steady, useful content.",
    "",
    "Tagline: Capture the Moment. Create the Recap. Get Paid.",
  ].join("\n"),
};

/** Event Content Creator Planner shown above freeform Notes for this guide. */
export const LOCAL_EVENT_CONTENT_NOTES_WORKSHEET = `MY LOCAL EVENT CONTENT PLAN

Starter Package:
__________
Starting Price:
$____
Travel Area:
__________

Marketing Channels:
1. __________
2. __________
3. __________

CLIENT / EVENT
Client:
__________
Event:
__________
Date:
__________
Location:
__________
Start/End:
__________
Contact Person:
__________
Agreed Price:
$____
Deliverables:
__________
Editing Included:
__________
Delivery Deadline:
__________

Important Moments:
1. __________
2. __________
3. __________
4. __________
5. __________

Do Not Capture:
__________
Permission/Privacy Notes:
__________

RESULTS
Hours:
____
Revenue:
$____
Expenses:
$____
Profit:
$____
Delivered:
☐ Yes
☐ No
Client Happy:
☐ Yes
☐ Needs Revision
Testimonial Requested:
☐ Yes
☐ No
Portfolio Permission:
☐ Yes
☐ No
Rebook:
☐ Yes
☐ Maybe
☐ No
What Worked:
__________
What I Will Improve:
__________

GYSH PRO TIP
DON'T TRY TO FILM EVERYTHING.
Clients usually value USEFUL moments more than hundreds of random clips.
Before the event, find out what matters most.
Then capture:
THE PEOPLE
+ THE ENERGY
+ THE DETAILS
+ THE IMPORTANT MOMENTS
+ THE STORY
A phone full of footage is not the goal.
Content the client can actually USE is the goal.

ELITE CHALLENGE
Create ONE sample event-content package.
Use a safe event or practice setup where you have permission.
Create:
10 strong photos
8 short vertical clips
1 simple 15–30 second recap
Then organize everything into a clean delivery folder.
That becomes the beginning of your portfolio.`;

export const LOCAL_EVENT_CONTENT_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Use your smartphone to capture short video clips, photos, and simple event recap content for school events, markets, community gatherings, small businesses, nonprofits, clubs, and other local organizations. Tagline: Capture the Moment. Create the Recap. Get Paid. Category: Content Creation / Local Services. Best for teens, adults, seniors / retirees. Beginner · Very low startup · Flexible / events / weekends · Local / on-site · Per project / recurring · 3–10 hrs/week · Elite Membership · $15–$50 / project (examples).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Smartphone with a good working camera · Enough phone storage · Reliable transportation to local events · Basic photo/video skills · Ability to follow a shot list · Basic editing skills or willingness to learn · Reliable communication · File-delivery method.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "CapCut · Canva · Google Drive or Dropbox · Small tripod or stabilizer · Portable charger · Clip-on microphone when needed · Basic lighting knowledge.",
  },
  {
    id: "before",
    label: "Before every event",
    detail:
      "Get clear permission from the client/organizer to capture content. Ask about restrictions on photographing or recording attendees. Be especially careful with children/minors, schools, private events, and sensitive locations. Follow venue rules and applicable privacy/recording laws. Never promise professional photography/videography services you are not qualified to provide.",
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
    label: "Google Docs",
    url: "https://docs.google.com/",
    note: "Marketing plan / shot list",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Leads / jobs / income",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Bookings",
  },
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Local businesses / venues",
  },
];

export const LOCAL_EVENT_CONTENT_SUPPLIES = {
  starterKitTotal:
    "About $0–40 — use the phone you already own. Do not buy expensive camera gear before proving people will pay for your service.",
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
      id: "powerbank",
      name: "Portable battery pack",
      qty: "1",
      estCost: "$15–30",
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
      id: "transport",
      name: "Reliable transportation",
      qty: "1",
      estCost: "$0+",
      notes: "Essential",
    },
    {
      id: "shotlist",
      name: "Notes / shot list",
      qty: "1",
      estCost: "$0–3",
      notes: "Essential",
    },
    {
      id: "delivery",
      name: "File-delivery method",
      qty: "1",
      estCost: "$0",
      notes: "Essential — Drive / Dropbox",
    },
    {
      id: "tripod",
      name: "Small tripod",
      qty: "1",
      estCost: "$10–25",
      notes: "Useful",
      optional: true,
    },
    {
      id: "gimbal",
      name: "Phone stabilizer / gimbal",
      qty: "1",
      estCost: "$30–80",
      notes: "Useful — buy later if needed",
      optional: true,
    },
    {
      id: "cloth",
      name: "Microfiber lens cloth",
      qty: "1",
      estCost: "$0–5",
      notes: "Useful — clean lens before shooting",
      optional: true,
    },
    {
      id: "earbuds",
      name: "Earbuds / headphones",
      qty: "1",
      estCost: "$0–15",
      notes: "Useful",
      optional: true,
    },
    {
      id: "light",
      name: "Simple phone light",
      qty: "1",
      estCost: "$10–25",
      notes: "Useful",
      optional: true,
    },
    {
      id: "bag",
      name: "Small bag",
      qty: "1",
      estCost: "$0–15",
      notes: "Useful",
      optional: true,
    },
    {
      id: "water",
      name: "Water",
      qty: "1",
      estCost: "$0–3",
      notes: "Useful",
      optional: true,
    },
    {
      id: "mic",
      name: "Clip-on microphone",
      qty: "1",
      estCost: "$10–40",
      notes: "Optional",
      optional: true,
    },
    {
      id: "cloud",
      name: "Extra phone storage / cloud plan",
      qty: "1",
      estCost: "$0+",
      notes: "Optional",
      optional: true,
    },
    {
      id: "backdrop",
      name: "Basic backdrop for vendor/product shots",
      qty: "1",
      estCost: "$0–20",
      notes: "Optional",
      optional: true,
    },
    {
      id: "second-device",
      name: "Second phone / device",
      qty: "1",
      estCost: "$0+",
      notes: "Optional",
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
    name: "Smartphone Camera",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Capture photos and short vertical clips",
  },
  {
    id: "lec_gallery",
    name: "Photos / Gallery app",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Review and select shots",
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
    id: "lec_native",
    name: "Native phone editing tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Light photo/clip edits",
  },
  {
    id: "lec_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Client delivery",
    url: "https://drive.google.com/",
  },
  {
    id: "lec_dropbox",
    name: "Dropbox",
    freePlanAvailable: true,
    costNote: "Alternate file delivery",
    url: "https://www.dropbox.com/",
    optional: true,
  },
  {
    id: "lec_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Marketing plan / shot list",
    url: "https://docs.google.com/",
  },
  {
    id: "lec_notes",
    name: "Notes",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Shot list and event notes",
  },
  {
    id: "lec_calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Bookings",
    url: "https://calendar.google.com/",
  },
  {
    id: "lec_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Leads / jobs / income",
    url: "https://sheets.google.com/",
  },
  {
    id: "lec_ig",
    name: "Instagram",
    freePlanAvailable: true,
    costNote: "Portfolio when appropriate",
    optional: true,
  },
  {
    id: "lec_fb",
    name: "Facebook",
    freePlanAvailable: true,
    costNote: "Local outreach",
    optional: true,
  },
  {
    id: "lec_tiktok",
    name: "TikTok",
    freePlanAvailable: true,
    costNote: "Sample vertical content when appropriate",
    optional: true,
  },
  {
    id: "lec_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Finding local businesses / venues",
    url: "https://maps.google.com/",
  },
  {
    id: "lec_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Smartphone + CapCut + Canva + Google Drive + Google Sheets",
  },
];

export const LOCAL_EVENT_CONTENT_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "STARTER PRICING EXAMPLES — displayed range: $15–$50/project (examples).",
    "",
    "Always define what is included BEFORE the event: time + deliverables + editing + delivery date + price.",
    "",
    "Pricing can vary by event length, travel, number of photos/clips, editing, turnaround time, number of finished videos, special requests, and usage expectations.",
    "",
    "Example: 60 minutes on-site + 15 edited photos + 10 short vertical clips + 1 simple recap reel = agreed project price.",
    "",
    "Examples only — not income guarantees.",
  ].join("\n"),
  raiseTip:
    "After a few strong events, raise rates or add Reel / same-day / caption packages. Examples only — not income guarantees.",
  items: [
    {
      id: "quick",
      label: "QUICK CONTENT CAPTURE — short event visit · small set of usable clips/photos",
      price: "$15–$25 / project",
      notes: "Starter package",
    },
    {
      id: "mini",
      label: "EVENT MINI — more coverage plus organized clips/photos",
      price: "$25–$40 / project",
      notes: "Common beginner booking",
    },
    {
      id: "recap",
      label: "SIMPLE EVENT RECAP — capture plus a simple edited recap or social-ready deliverable",
      price: "$40–$50+ / project",
      notes: "Content + simple recap",
    },
    {
      id: "range",
      label: "DISPLAYED STARTER RANGE",
      price: "$15–$50 / project",
      notes: "Examples only — not income guarantees",
    },
  ],
};

/**
 * Core launch steps (exactly 11). Steps 3–5 are the required marketing block
 * (Choose channels / Make materials / Carry out), tailored to local events.
 */
export const LOCAL_EVENT_CONTENT_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Event Content Services",
    desc: [
      "Pick a simple starter service.",
      "",
      "Examples:",
      "☐ Event photos",
      "☐ Short vertical video clips",
      "☐ Behind-the-scenes clips",
      "☐ Vendor booth content",
      "☐ Speaker/activity clips",
      "☐ Crowd/atmosphere content",
      "☐ Simple recap reel",
      "☐ Social-media content bundle",
      "",
      "Start with what you can confidently create using your current phone.",
      "",
      "Write:",
      "My Starter Service: __________",
    ].join("\n"),
  },
  {
    title: "Build One Starter Package",
    desc: [
      "Create one easy-to-understand offer.",
      "",
      "Example:",
      "",
      "LOCAL EVENT CONTENT MINI",
      "Includes:",
      "Up to 60 minutes on-site",
      "10–15 edited photos",
      "8–12 short vertical clips",
      "Files delivered digitally",
      "Starting Price: $____",
      "",
      "Clearly state:",
      "Event time included · Number/type of deliverables · Whether editing is included · Delivery timeframe · Travel area",
      "",
      "Do not promise unlimited content.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about your service.",
      "",
      "Do not try everything at once. Pick only 2 or 3 this month.",
      "",
      "Good channels for this side-hustle:",
      "☐ Facebook",
      "☐ Instagram",
      "☐ TikTok",
      "☐ Email",
      "☐ Text/referrals",
      "☐ Local business outreach",
      "☐ Community organizations",
      "☐ Schools/clubs where appropriate",
      "☐ Event organizers",
      "☐ Local markets/vendors",
      "",
      "Open Google Docs from the Tools tab.",
      "At the top write:",
      "What I Sell: __________",
      "Starting Price: $____",
      "See Suggested Pricing for starter examples.",
      "",
      "Choose exactly 2 or 3 channels. Then write ONE measurable goal for each.",
      "",
      "Examples:",
      "Contact 10 local event organizers",
      "Post 3 sample videos this week",
      "Introduce myself to 5 market vendors",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a small marketing kit.",
      "",
      "Make:",
      "1. One simple service flyer",
      "2. 3–6 sample photos/clips",
      "3. One short portfolio/sample reel",
      "4. One message you can send to prospects",
      "5. Clear starting price or “packages start at…”",
      "",
      "Sample copy:",
      "",
      "NEED FRESH CONTENT FROM YOUR NEXT EVENT?",
      "",
      "I capture smartphone photos, vertical clips, behind-the-scenes moments, and simple recap content for local events, businesses, clubs, nonprofits, and community organizations.",
      "",
      "Packages start at $____.",
      "Message me for availability.",
      "",
      "Use your own work or properly licensed material in your portfolio.",
      "Never present someone else’s content as yours.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use ONLY the 2 or 3 channels you selected.",
      "",
      "Possible actions:",
      "☐ Contact 8–12 relevant local prospects",
      "☐ Message event organizers",
      "☐ Introduce yourself to market vendors",
      "☐ Contact small businesses hosting events",
      "☐ Share sample content on your selected social channel",
      "☐ Ask trusted contacts for referrals",
      "",
      "Sample outreach:",
      "“Hi! I create quick smartphone photo and video content for local events. I can capture vertical clips, photos, behind-the-scenes moments, and a simple recap that you can use on social media. My starter packages begin at $____. Do you have an upcoming event where you could use fresh content?”",
      "",
      "Track:",
      "Date | Prospect | Channel | Response | Follow-Up",
      "",
      "Do not spam. Personalize outreach when possible. Reply promptly.",
    ].join("\n"),
  },
  {
    title: "Book & Define the Job",
    desc: [
      "Before accepting the event, confirm:",
      "",
      "Client/organization: __________",
      "Event type: __________",
      "Date: __________",
      "Location: __________",
      "Start/end time: __________",
      "Contact person: __________",
      "What they want captured: __________",
      "What NOT to capture: __________",
      "Number/type of deliverables: __________",
      "Editing included?: __________",
      "Delivery deadline: __________",
      "Price: $____",
      "Payment method: __________",
      "Permission/release requirements: __________",
      "Rules involving attendees/minors: __________",
      "Venue restrictions: __________",
      "",
      "Get important expectations in writing.",
    ].join("\n"),
  },
  {
    title: "Create Your Shot List",
    desc: [
      "Before the event, create a short shot list.",
      "",
      "Possible shots:",
      "☐ Venue exterior/sign",
      "☐ Setup",
      "☐ Decorations/details",
      "☐ Hosts",
      "☐ Vendors",
      "☐ Products",
      "☐ Speakers",
      "☐ Activities",
      "☐ Crowd atmosphere",
      "☐ Hands/details",
      "☐ Wide shots",
      "☐ Medium shots",
      "☐ Close-ups",
      "☐ Vertical clips",
      "☐ Closing moment",
      "",
      "Ask:",
      "“What are the 5 things you absolutely want captured?”",
      "",
      "Put those at the top of the list.",
    ].join("\n"),
  },
  {
    title: "Capture the Event",
    desc: [
      "Arrive early enough to get oriented.",
      "",
      "Before shooting:",
      "☐ Clean phone lens",
      "☐ Check battery",
      "☐ Check storage",
      "☐ Confirm contact person",
      "☐ Review restrictions",
      "☐ Confirm important moments",
      "",
      "During the event:",
      "Capture short steady clips · Mix wide, medium, and close shots · Shoot vertical content when intended for Reels/TikTok/Shorts · Get multiple angles · Avoid excessive zoom · Watch lighting · Capture natural movement",
      "",
      "Do not block guests or disrupt the event.",
      "Respect anyone the client says should not be photographed/recorded.",
    ].join("\n"),
  },
  {
    title: "Organize & Edit the Content",
    desc: [
      "After the event:",
      "1. Back up the files",
      "2. Remove obvious unusable clips",
      "3. Organize the best content",
      "4. Edit only what the package includes",
      "5. Check orientation",
      "6. Check sound where relevant",
      "7. Correct obvious exposure/cropping issues",
      "8. Export in the agreed format",
      "",
      "For a simple recap:",
      "Start with a strong opening clip · Use short clips · Keep pacing moving · Add captions/text if included · Use properly licensed/platform-appropriate music · End with a useful closing shot or client CTA if requested",
      "",
      "Do not over-edit simple content packages.",
    ].join("\n"),
  },
  {
    title: "Deliver & Get Approval",
    desc: [
      "Deliver using the agreed method.",
      "",
      "Examples: Google Drive folder · Dropbox folder · Approved direct delivery",
      "",
      "Organize files clearly.",
      "",
      "Example:",
      "EVENT NAME",
      "/ Photos",
      "/ Vertical Clips",
      "/ Finished Recap",
      "",
      "Send:",
      "“Your event content is ready! Here is the delivery link: ________. Please review it and let me know if anything included in our agreed package needs attention.”",
      "",
      "If revisions are included, clearly limit them to the agreed scope.",
    ].join("\n"),
  },
  {
    title: "Turn One Event into More Work",
    desc: [
      "After successful delivery, ask:",
      "“Would you like me to help with your next event?”",
      "",
      "Also ask for:",
      "☐ Testimonial",
      "☐ Referral",
      "☐ Permission to show selected work in portfolio",
      "☐ Upcoming event dates",
      "☐ Monthly/recurring content needs",
      "",
      "Possible recurring clients:",
      "Markets · Restaurants · Boutiques · Churches · Nonprofits · Clubs · Community organizations · Sports organizations · Event planners · Local venues",
      "",
      "Build:",
      "ONE EVENT → GOOD CONTENT → HAPPY CLIENT → TESTIMONIAL → REFERRAL → NEXT EVENT",
    ].join("\n"),
  },
];

export function localEventContentToolsDisclaimer(): string {
  return [
    "Beginner stack: Smartphone + CapCut + Canva + Google Drive + Google Sheets.",
    "",
    "This is smartphone social content for local events — not professional videography or cinematic commercials.",
    "",
    "Always confirm photo/video permission, especially at schools and youth events.",
    "Never promise professional photography/videography services you are not qualified to provide.",
  ].join("\n");
}
