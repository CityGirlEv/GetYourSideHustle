/**
 * DoorDash & Uber Eats (`food-delivery`) — authored prep + playbook content.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const FOOD_DELIVERY_REALITY_CHECK = {
  title: "Know Your Real Profit",
  body: "Seeing $200 in your delivery app doesn’t necessarily mean you made $200 in profit. Delivery drivers have expenses such as fuel, maintenance, insurance, and vehicle wear. Track earnings, hours, AND miles so you know whether the side hustle is actually profitable.",
};

/** Strategy worksheet shown above freeform Notes for this guide. */
export const FOOD_DELIVERY_NOTES_WORKSHEET = `My Delivery Strategy

My Platforms:
________________________________

My Target Weekly Earnings: $________
My Target Hours Per Week: ________
My Minimum Target $/Mile: $________
My Minimum Target $/Hour: $________

Best Delivery Areas:
________________________________

Best Days/Times:
________________________________

Restaurants That Usually Have Orders Ready:
________________________________

Restaurants/Locations With Long Waits:
________________________________

Parking / Apartment / Traffic Notes:
________________________________

Weekly Results
Hours: ______   Deliveries: ______
Gross Earnings: $______   Tips: $______
Miles: ______   Expenses: $______
Estimated Net Profit: $______
Estimated Net $/Hour: $______

What I’ll Change Next Week:
________________________________`;

export const FOOD_DELIVERY_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Food delivery through DoorDash or Uber Eats is one of the easier side hustles to start because you don’t need to find your own customers or create a product. You use the delivery app to accept offers, pick up food or other eligible items, and deliver them to customers.",
  },
  {
    id: "doordash-reqs",
    label: "DoorDash basic requirements",
    detail:
      "Meet the minimum age for your location; valid driver’s license if driving; eligible car, scooter, motorcycle, or bicycle where permitted; smartphone with reliable data; Social Security number where required; consent to a background check; bank account or eligible payout method. Minimum age varies by state — Dashers undergo a background check (verify on DoorDash).",
  },
  {
    id: "uber-eats-reqs",
    label: "Uber Eats basic requirements",
    detail:
      "Meet Uber’s age requirements for your delivery method/location; valid driver’s license and required vehicle docs if delivering by car; eligible vehicle or other approved method; smartphone; pass Uber’s screening/background process; payout/banking information (verify on Uber).",
  },
  {
    id: "before-start",
    label: "Before you start (checklist)",
    detail:
      "Verify auto insurance coverage for delivery/gig work; keep registration and license current; check tire pressure, brakes, lights, and fluids; create a way to track business income and expenses; download the delivery app(s); set up mileage tracking before the first delivery; keep an emergency roadside kit in the vehicle.",
  },
  {
    id: "mileage-tip",
    label: "GYSH tip — track miles from Day 1",
    detail:
      "Don’t wait until tax season to figure out how many business miles you drove. Start tracking from Day 1.",
  },
];

export const FOOD_DELIVERY_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "DoorDash Dasher signup",
    url: "https://www.doordash.com/dasher/signup/",
    note: "Apply / manage Dasher account",
  },
  {
    label: "Uber Eats delivery",
    url: "https://www.uber.com/us/en/deliver/",
    note: "Uber delivery / Eats driver info",
  },
  {
    label: "IRS standard mileage rates",
    url: "https://www.irs.gov/tax-professionals/standard-mileage-rates",
    note: "Tax deduction rates change — verify current period; do not confuse with cash fuel cost",
  },
];

export const FOOD_DELIVERY_SUPPLIES = {
  starterKitTotal:
    "About $15–45 for must-buy gear if you already have a phone and ride — start lean, upgrade after income justifies it",
  items: [
    {
      id: "bag",
      name: "Insulated food-delivery bag",
      qty: "1",
      estCost: "$15–30",
      notes: "Essential purchase for hot/cold holds",
    },
    {
      id: "charger",
      name: "Phone charger + car charging adapter",
      qty: "1",
      estCost: "$8–20",
      notes: "Essential",
    },
    {
      id: "mount",
      name: "Phone mount",
      qty: "1",
      estCost: "$10–20",
      notes: "Essential for safe navigation",
    },
    {
      id: "powerbank",
      name: "Portable battery bank",
      qty: "1",
      estCost: "$15–30",
      optional: true,
      notes: "Recommended once you’re running longer sessions",
    },
    {
      id: "catering-bag",
      name: "Large insulated catering bag",
      qty: "1",
      estCost: "$25–50",
      optional: true,
      notes: "Buy after income justifies bigger orders",
    },
    {
      id: "drink",
      name: "Drink carrier",
      qty: "1",
      estCost: "$8–15",
      optional: true,
    },
    {
      id: "tote",
      name: "Reusable tote for larger orders",
      qty: "1",
      estCost: "$5–15",
      optional: true,
    },
  ],
};

/**
 * Survival / on-road readiness — lives on the Tools tab (not Supply List purchases).
 */
export const FOOD_DELIVERY_SURVIVAL_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
}[] = [
  {
    id: "dd_flashlight",
    name: "Small flashlight",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Night apartment numbers / dark porches · ~$5–12 if buying",
  },
  {
    id: "dd_sanitizer",
    name: "Hand sanitizer + paper towels",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Keep a set in the car · ~$5–10",
  },
  {
    id: "dd_rain",
    name: "Rain jacket / umbrella",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Wet-weather drops · ~$10–30 if you don’t already own one",
  },
  {
    id: "dd_shoes",
    name: "Comfortable walking shoes",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Apartment / multi-stop nights · use what you own first",
  },
  {
    id: "dd_roadside",
    name: "Emergency roadside kit",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Jumper cables, triangles, basic tools · ~$20–40",
  },
  {
    id: "dd_inflator",
    name: "Tire inflator / gauge",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Check pressure before peak windows · ~$15–35",
  },
  {
    id: "dd_water",
    name: "Water bottle + light snacks",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "For you — not customer tips · pack from home",
  },
];

export const FOOD_DELIVERY_PRICING = {
  tabLabel: "Earnings & Order Strategy",
  intro: [
    "You don’t set the customer’s delivery price. DoorDash and Uber Eats present offers and earnings info (DoorDash: Earn per Offer and, where available, Earn by Time — base pay, promotions, and 100% of tips per DoorDash; Uber Eats: upfront estimated earnings, pickup/dropoff, time and distance, plus promotions). Verify current app screens in your market.",
    "",
    "Think profit — not just payout. A $12 offer over 18 miles / 45 minutes can lose to an $8 offer over 4 miles / 20 minutes after fuel and time.",
    "",
    "Order evaluation formula: Offer Amount ÷ Estimated Miles = Gross $/Mile (example: $10 ÷ 5 miles = $2.00/mile). Set your own minimum based on your market and expenses.",
    "",
    "Evaluate every offer using: PAY + MILES + TIME + DESTINATION + RETURN TRIP + EXPENSES. Ask: How much does it pay? Total miles? How long? Is the restaurant fast or slow? Near other restaurants after dropoff? Unpaid miles back? Parking, tolls, or traffic?",
    "",
    "Best times to test: Lunch ~11 AM–2 PM · Dinner ~5 PM–9 PM · Weekends · Events/bad weather (demand may rise — safety first). Use busy periods, Hotspots, and promotions rather than assuming every hour pays equally.",
  ].join("\n"),
  raiseTip:
    "Raise your personal floor ($/mile and $/hour) after 2 weeks of logged sessions — not by raising a customer price. Examples only — not income guarantees.",
  items: [
    {
      id: "formula",
      label: "Gross $/mile check",
      price: "Offer ÷ estimated miles",
      notes: "Set your own minimum profitability target",
    },
    {
      id: "drop",
      label: "Single drop (typical gross + tip expectation)",
      price: "$6–14 total typical",
      notes: "Market-dependent — decline bad long deadheads",
    },
    {
      id: "stack",
      label: "Stacked / dual order",
      price: "Only if path aligns",
      notes: "Aim higher $/mile — decline bad stacks",
    },
    {
      id: "hour",
      label: "Busy dinner window (gross before expenses)",
      price: "$18–28 / hr example range",
      notes: "Track net after fuel — not app gross alone",
    },
  ],
};

/** Core launch steps (foundation + marketing titles + closing are applied by finalize). */
export const FOOD_DELIVERY_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Platform",
    desc: "Decide whether to start with DoorDash, Uber Eats, or apply to both. Add a third app later only if your market supports it and you can handle multi-apping safely.",
  },
  {
    title: "Check Eligibility",
    desc: "Review age, vehicle, driver’s license, insurance, and local requirements on each platform’s site before you apply. Confirm gig/delivery coverage with your auto insurer.",
  },
  {
    title: "Apply",
    desc: "Create your account and submit the requested information. DoorDash Dasher: https://www.doordash.com/dasher/signup/ · Uber delivery: https://www.uber.com/us/en/deliver/",
  },
  {
    title: "Complete Screening",
    desc: "Finish identity verification and any required background screening. Save approval emails in a folder named “Delivery docs.”",
  },
  {
    title: "Set Up Payment",
    desc: "Add your bank/payment information and review payout choices and any applicable fees (instant pay fees, weekly deposit, etc.).",
  },
  {
    title: "Prepare Your Vehicle",
    desc: "Check fuel/charge level, tires, lights, and maintenance. Install your phone mount and charger. Stage your insulated bag where you can reach it quickly.",
  },
  {
    title: "Set Up Mileage Tracking",
    desc: "Turn on your mileage tracker (Stride, Everlance, MileIQ, Gridwise, or a spreadsheet) before beginning delivery work and keep appropriate records from Day 1.",
  },
  {
    title: "Learn Your Delivery Zone",
    desc: "Identify restaurant clusters, shopping centers, parking issues, apartment-heavy areas, and busy periods. Note Hotspots in the app — don’t chase pins across town for weak offers.",
  },
  {
    title: "Start Your First Delivery Session",
    desc: "Start with a short 2–3 hour session rather than driving all day. Learn the app flow and your market before judging income.",
  },
  {
    title: "Evaluate Offers Before Accepting",
    desc: "Consider payout, mileage, estimated time, restaurant wait, delivery destination, and potential unpaid return miles. Use Offer ÷ Miles as a quick gross $/mile check against your personal floor.",
  },
  {
    title: "Review Your Profit",
    desc: "At the end of each session: Total Earnings − Estimated Operating Expenses = Estimated Net Profit. Then Net Profit ÷ Total Hours = Net Hourly Profit. Don’t judge success solely by what the app says you “earned.” Log results in Notes and the Revenue Calculator (Delivery Driver mode).",
  },
  {
    title: "Pick how you will tell people about your side hustle",
    desc: "App delivery sends you offers — you don’t cold-pitch neighbors. Your “marketing” is choosing platforms, keeping a clear profile photo, protecting your rating, and showing up in peak windows near restaurant clusters.",
  },
  {
    title: "Make your marketing materials",
    desc: "Prep a tip-friendly profile photo, a clean insulated bag, and a simple personal scorecard (target $/mile and $/hour). No flyer required — the app is the storefront.",
  },
  {
    title: "Carry out the marketing plan",
    desc: "Work lunch and dinner peaks, use Hotspots and promotions, multi-app only when it raises $/mile safely, and review weekly profit to change zones or hours. Safety always beats chasing surge in bad conditions.",
  },
];
