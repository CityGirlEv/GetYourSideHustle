/**
 * One-shot generator for src/lib/side-hustle-catalog.ts
 * Run: node scripts/generate-side-hustle-catalog.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "src", "lib", "side-hustle-catalog.ts");

const $ = (n) => `$${n}`;

function base(partial) {
  return {
    fullDescription: partial.description,
    whatYouDo: partial.whatYouDo ?? [
      "Deliver the core service or digital product described",
      "Price a simple starter offer",
      "Find first customers through people you already know",
    ],
    whoItsGoodFor: partial.whoItsGoodFor ?? "People who match the skills and schedule notes below",
    skillsNeeded: partial.skillsNeeded ?? ["Reliability", "Clear communication"],
    toolsNeeded: partial.toolsNeeded ?? ["Phone or computer", "Basic supplies for the job"],
    pricingApproach:
      partial.pricingApproach ??
      "Start with a simple flat rate or hourly rate; raise prices after 3–5 happy customers. Examples only — not income guarantees.",
    earningsExample:
      partial.earningsExample ??
      "Example only: 4 jobs/week at a starter rate can be a few hundred dollars per month before expenses — results vary; not a guarantee.",
    firstCustomerTips:
      partial.firstCustomerTips ??
      "Ask family, neighbors your parents/guardians know, church/community boards, or local Facebook groups. Lead with one clear offer.",
    sampleOffer:
      partial.sampleOffer ??
      "“I’ll complete [specific task] for [flat price] this week — satisfaction guaranteed or we make it right.”",
    howToStartToday: partial.howToStartToday ?? [
      "Write a one-sentence offer",
      "List tools you already have",
      "Message 3 trusted people today",
    ],
    launchSteps: partial.launchSteps ?? [
      { title: "Define the offer", body: "One clear service, price, and turnaround." },
      { title: "Prep your kit", body: "Gather tools, templates, or samples." },
      { title: "Reach out", body: "Contact 5 warm leads with your sample offer." },
      { title: "Deliver & ask for a review", body: "Do great work; request a short testimonial." },
      { title: "Repeat weekly", body: "Batch outreach so you don’t wait for luck." },
    ],
    tips: partial.tips ?? ["Keep promises small and finishable", "Track every dollar in a simple log"],
    safetyNotes: partial.safetyNotes ?? "",
    adultSupervisionRequired: partial.adultSupervisionRequired ?? false,
    pay: partial.pay,
    tags: partial.tags,
    fit: partial.fit,
    schedule: partial.schedule,
    startup: partial.startup,
    relatedGuideIds: partial.relatedGuideIds ?? [],
    ...partial,
  };
}

/** Existing adult catalog — preserve IDs + enrich M2M audiences */
const existingAdult = [
  base({
    id: "airbnb",
    name: "Airbnb Hosting",
    description:
      "Rent out spare rooms, guest houses, or entire properties on the world's largest homestay platform for short-term travellers.",
    audiences: ["adult", "senior"],
    category: "Real Estate",
    minTier: "starter",
    freeWizardEligible: false,
    startupCost: "Over $1,000",
    zeroStart: false,
    locationMode: "local",
    difficulty: "Medium",
    timeReq: "10 - 20 hrs/week",
    potentialIncome: "$1,500 - $8,000/mo",
    type: "Active / Passive",
    gradient: "pink",
    iconName: "airbnb",
    details: [
      "No property ownership required if doing rental arbitrage",
      "Dynamic pricing maximizes earnings based on weekends/seasonality",
      "High startup costs (furniture, decor, locks)",
    ],
    libraryTags: ["weekend"],
    matchTags: ["operations", "local", "physical", "hosting"],
    relatedGuideIds: ["airbnb"],
  }),
  base({
    id: "pod",
    name: "Print-on-Demand (POD)",
    description:
      "Design custom shirts, mugs, and merchandise, and sell them via Etsy or Shopify with zero warehousing or inventory costs.",
    audiences: ["adult", "junior", "senior"],
    category: "E-Commerce",
    minTier: "elite",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "online",
    difficulty: "Easy",
    timeReq: "5 - 10 hrs/week",
    potentialIncome: "$200 - $3,000/mo",
    type: "Passive",
    gradient: "purple",
    iconName: "pod",
    details: [
      "100% passive once designs are published",
      "Zero upfront product cost - items printed only when sold",
      "Competitive niche requiring good keyword SEO",
    ],
    libraryTags: ["zero-start", "no-experience", "weekend", "after-work"],
    matchTags: ["creative", "marketing", "online", "passive"],
    relatedGuideIds: ["pod"],
  }),
  base({
    id: "dropshipping",
    name: "Dropshipping",
    description:
      "Build an online storefront and source products directly from suppliers who package and ship orders straight to customers.",
    audiences: ["adult"],
    category: "E-Commerce",
    minTier: "elite",
    freeWizardEligible: false,
    startupCost: "$100 - $1,000",
    zeroStart: false,
    locationMode: "online",
    difficulty: "Hard",
    timeReq: "15 - 25 hrs/week",
    potentialIncome: "$500 - $10,000/mo",
    type: "Active",
    gradient: "cyan",
    iconName: "dropshipping",
    details: [
      "High dependency on Facebook/TikTok advertising campaigns",
      "Customer service & supplier relations require active attention",
      "Enormous scaling capability",
    ],
    libraryTags: ["after-work"],
    matchTags: ["marketing", "operations", "online", "scale"],
    relatedGuideIds: ["dropshipping"],
  }),
  base({
    id: "digital-products",
    name: "Digital Products",
    description:
      "Create and sell your own digital downloads — ebooks, printables, planners, templates, and mini-courses. Book publishing is a classic Digital path.",
    audiences: ["adult", "junior", "senior"],
    category: "Digital",
    minTier: "elite",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "online",
    difficulty: "Medium",
    timeReq: "8 - 20 hrs/week",
    potentialIncome: "$200 - $10,000/mo",
    type: "Passive / Product",
    gradient: "purple",
    iconName: "digital-products",
    details: [
      "No inventory — deliver PDFs, files, or course access instantly",
      "Book publishing (KDP / print + ebook) is a flagship Digital example",
      "Kids and teens can start with short storybooks and simple printables",
    ],
    libraryTags: ["zero-start", "ai-powered", "weekend", "after-work"],
    matchTags: ["creative", "marketing", "tech", "passive", "online"],
    relatedGuideIds: ["digital-products"],
  }),
  base({
    id: "affiliate",
    name: "Affiliate Marketing",
    description:
      "Earn a commission when someone buys through your unique link — Amazon, TikTok Shop, brand programs, software partners, and more.",
    audiences: ["adult", "junior", "senior"],
    category: "Marketing",
    minTier: "pro",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "online",
    difficulty: "Medium",
    timeReq: "5 - 15 hrs/week",
    potentialIncome: "$100 - $15,000/mo",
    type: "Passive",
    gradient: "emerald",
    iconName: "affiliate",
    details: [
      "Separate from Digital Products — you promote other brands",
      "Start with easy programs (Amazon, brands you already use)",
      "Honest reviews beat bare link spam — always disclose affiliates",
    ],
    libraryTags: ["zero-start", "after-work", "weekend"],
    matchTags: ["marketing", "creative", "passive", "online"],
    relatedGuideIds: ["affiliate"],
    fit: "Writers and reviewers who enjoy recommending products",
    schedule: "Batch content on your calendar",
    startup: "Low — free programs to start",
  }),
  base({
    id: "amazon",
    name: "Amazon FBA Seller",
    description:
      "Launch your own physical product brand on Amazon. Amazon stores, packages, ships, and handles returns on your behalf.",
    audiences: ["adult"],
    category: "E-Commerce",
    minTier: "pro",
    freeWizardEligible: false,
    startupCost: "Over $1,000",
    zeroStart: false,
    locationMode: "online",
    difficulty: "Hard",
    timeReq: "20 - 30 hrs/week",
    potentialIncome: "$1,000 - $25,000/mo",
    type: "Active",
    gradient: "amber",
    iconName: "amazon",
    details: [
      "Requires manufacturing partnerships (typically via Alibaba)",
      "High earning potential in Amazon's organic buyer network",
      "Complex supply chain and Amazon catalog SEO rules",
    ],
    libraryTags: [],
    matchTags: ["operations", "marketing", "scale", "online"],
    relatedGuideIds: ["amazon"],
  }),
  base({
    id: "social",
    name: "Social Influencer",
    description:
      "Build a highly engaged audience around your interests, and monetize with brand sponsors, affiliate links, and creator funds.",
    audiences: ["adult", "junior"],
    category: "Creative",
    minTier: "pro",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "both",
    difficulty: "Medium",
    timeReq: "15 - 30 hrs/week",
    potentialIncome: "$500 - $20,000/mo",
    type: "Active",
    gradient: "pink",
    iconName: "social",
    details: [
      "Builds a personal brand that can launch secondary businesses",
      "Requires consistent video publishing cadences",
      "High rates for sponsorship integrations with engaged audiences",
    ],
    libraryTags: ["zero-start", "ai-powered", "after-work"],
    matchTags: ["creative", "marketing", "brand", "online", "people"],
    relatedGuideIds: ["social"],
  }),
  base({
    id: "web-leads",
    name: "Local Website Lead Finder",
    description:
      "Find local businesses with weak or missing websites, then pitch audits, rebuilds, or done-for-you sites that convert walk-ins into online bookings.",
    audiences: ["adult", "senior"],
    category: "Local Services",
    minTier: "elite",
    freeWizardEligible: false,
    startupCost: "$100 - $500",
    zeroStart: false,
    locationMode: "both",
    difficulty: "Medium",
    timeReq: "10 - 20 hrs/week",
    potentialIncome: "$800 - $6,000/mo",
    type: "Active",
    gradient: "cyan",
    iconName: "web-leads",
    details: [
      "Google Maps + website audits surface endless local prospects",
      "Sell audits first ($150–$400), then build packages ($800–$3,500+)",
      "Recurring hosting/maintenance retainers stack monthly income",
    ],
    libraryTags: ["after-work"],
    matchTags: ["marketing", "tech", "local", "people"],
    relatedGuideIds: ["web-leads"],
  }),
  base({
    id: "ai-assets",
    name: "AI Asset Studio",
    description:
      "Create brand logos, ad creatives, social kits, and packaging visuals with AI tools — then deliver polished asset packs to clients.",
    audiences: ["adult", "junior", "senior"],
    category: "AI / Creative",
    minTier: "elite",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "online",
    difficulty: "Easy",
    timeReq: "8 - 15 hrs/week",
    potentialIncome: "$500 - $5,000/mo",
    type: "Active",
    gradient: "purple",
    iconName: "ai-assets",
    details: [
      "Low overhead: AI image tool + simple editor + clean delivery folder",
      "Productize kits (logo pack, launch creatives, 30-day social set)",
      "Pairs perfectly with website lead-finder outreach",
    ],
    libraryTags: ["zero-start", "ai-powered", "no-experience", "fastest-dollar", "after-work"],
    matchTags: ["creative", "tech", "ai", "marketing", "online"],
    relatedGuideIds: ["ai-assets"],
  }),
  base({
    id: "property-mgmt",
    name: "Property Management",
    description:
      "Manage rentals or short-term stays for owners who want hands-off ops — leasing, guest turns, vendors, and owner reporting.",
    audiences: ["adult", "senior"],
    category: "Real Estate",
    minTier: "starter",
    freeWizardEligible: false,
    startupCost: "$200 - $1,000",
    zeroStart: false,
    locationMode: "local",
    difficulty: "Medium",
    timeReq: "15 - 25 hrs/week",
    potentialIncome: "$1,000 - $8,000/mo",
    type: "Active",
    gradient: "amber",
    iconName: "property-mgmt",
    details: [
      "Earn 8–12% of rent (LTR) or 15–25% of booking revenue (STR)",
      "Leverage cleaning/vendor networks you already trust",
      "Scale by adding doors, not hours, once SOPs exist",
    ],
    libraryTags: ["weekend"],
    matchTags: ["operations", "local", "physical", "hosting"],
    relatedGuideIds: ["property-mgmt"],
  }),
  base({
    id: "handyman",
    name: "Handyman Services",
    description:
      "Offer small repairs, installs, painting, and punch-list jobs to homeowners and landlords who need reliable local help.",
    audiences: ["adult", "senior"],
    category: "Local Services",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$200 - $800",
    zeroStart: false,
    locationMode: "local",
    difficulty: "Easy",
    timeReq: "10 - 25 hrs/week",
    potentialIncome: "$800 - $5,000/mo",
    type: "Active",
    gradient: "emerald",
    iconName: "handyman",
    details: [
      "Start with Nextdoor, Facebook groups, and landlord referrals",
      "Tool kit + truck/van access is the main barrier",
      "Upsell recurring maintenance for Airbnb hosts & PMs",
    ],
    libraryTags: ["fastest-dollar", "weekend", "no-experience"],
    matchTags: ["hands_on", "local", "physical", "flexible"],
    relatedGuideIds: ["handyman"],
    fit: "Handy homeowners comfortable with light tools",
    schedule: "Job-by-job, daytime preferred",
    startup: "Low–medium — basic tools + insurance check",
  }),
  base({
    id: "rideshare",
    name: "Rideshare (Uber / Lyft)",
    description:
      "Drive passengers on Uber or Lyft during peak windows — airport runs, nightlife, events — for flexible cash flow.",
    audiences: ["adult", "senior"],
    category: "Gig Economy",
    minTier: "starter",
    freeWizardEligible: false,
    startupCost: "$50 - $300",
    zeroStart: false,
    locationMode: "local",
    difficulty: "Easy",
    timeReq: "10 - 30 hrs/week",
    potentialIncome: "$600 - $3,500/mo",
    type: "Active / Gig",
    gradient: "pink",
    iconName: "rideshare",
    details: [
      "Income hinges on hours + surge timing, not ads",
      "Track mileage for tax deductions from day one",
      "Pair with AI Timing Scout to chase higher $/hour windows",
    ],
    libraryTags: ["fastest-dollar", "after-work", "weekend"],
    matchTags: ["vehicle", "flexible", "local"],
    relatedGuideIds: ["rideshare"],
    fit: "Licensed drivers with flexible hours",
    schedule: "You pick peak blocks",
    startup: "Vehicle + platform approval",
  }),
  base({
    id: "food-delivery",
    name: "DoorDash / Uber Eats",
    description:
      "Deliver restaurant orders on DoorDash, Uber Eats, or similar apps — stack multi-app shifts and hotspot zones.",
    audiences: ["adult", "senior"],
    category: "Gig Economy",
    minTier: "starter",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "local",
    difficulty: "Easy",
    timeReq: "8 - 25 hrs/week",
    potentialIncome: "$400 - $2,500/mo",
    type: "Active / Gig",
    gradient: "amber",
    iconName: "food-delivery",
    details: [
      "Lowest barrier: bike, scooter, or car + insulated bag",
      "Peak dinner + weekend lunch windows pay best",
      "Use AI Timing Scout to pick ZipCode/time blocks before you drive",
    ],
    libraryTags: ["zero-start", "fastest-dollar", "after-work", "weekend", "no-experience"],
    matchTags: ["vehicle", "flexible", "local", "physical"],
    relatedGuideIds: ["food-delivery"],
    safetyNotes: "Follow each app’s age, vehicle, and insurance rules for your city.",
  }),
  base({
    id: "ai-timing",
    name: "AI Timing Scout",
    description:
      "Use AI plus local ZipCode data to map the best hours and areas for rideshare and delivery — then sell playbooks or use them yourself.",
    audiences: ["adult", "senior"],
    category: "AI / Gig",
    minTier: "elite",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "both",
    difficulty: "Medium",
    timeReq: "5 - 12 hrs/week",
    potentialIncome: "$300 - $3,000/mo",
    type: "Guide / Hybrid",
    gradient: "cyan",
    iconName: "ai-timing",
    details: [
      "Research-heavy: weather, events, airport schedules, tips forums",
      "Sell weekly hotspot guides to local drivers ($15–$49)",
      "Or keep the edge private and boost your own gig earnings",
    ],
    libraryTags: ["zero-start", "ai-powered", "after-work"],
    matchTags: ["tech", "ai", "vehicle", "local"],
    relatedGuideIds: ["ai-timing"],
  }),
  base({
    id: "ai-agents",
    name: "AI Agents for Side Hustlers",
    description:
      "Build and sell custom AI agents that handle lead finding, scheduling, research, and follow-ups.",
    audiences: ["adult"],
    category: "AI / Tech",
    minTier: "elite",
    freeWizardEligible: false,
    startupCost: "$50 - $400",
    zeroStart: false,
    locationMode: "online",
    difficulty: "Hard",
    timeReq: "10 - 20 hrs/week",
    potentialIncome: "$1,000 - $10,000/mo",
    type: "Active / Productized",
    gradient: "purple",
    iconName: "ai-agents",
    details: [
      "Productize: lead scout, booking agent, research brief agent",
      "Charge setup ($500–$2,500) + monthly agent care retainers",
      "Ties directly to Evelyn/Muntie agent expertise & Training Circles",
    ],
    libraryTags: ["ai-powered"],
    matchTags: ["tech", "ai", "marketing", "scale"],
    relatedGuideIds: ["ai-agents"],
  }),
  base({
    id: "book-publishing",
    name: "Book Publishing",
    description:
      "Write, publish, and market books (print + ebook + audiobook) — a core Digital side hustle from manuscript to KDP/IngramSpark.",
    audiences: ["adult", "senior"],
    category: "Digital",
    minTier: "pro",
    freeWizardEligible: false,
    startupCost: "$100 - $1,000",
    zeroStart: false,
    locationMode: "online",
    difficulty: "Medium",
    timeReq: "10 - 20 hrs/week",
    potentialIncome: "$200 - $8,000/mo",
    type: "Active / Royalty",
    gradient: "amber",
    iconName: "book-publishing",
    details: [
      "A Digital Products path — your own content, not affiliate links",
      "KDP + wide distribution for print and ebook reach",
      "Royalties stack while you write the next title",
    ],
    libraryTags: ["after-work", "weekend"],
    matchTags: ["creative", "marketing", "passive", "online"],
    relatedGuideIds: ["book-publishing"],
  }),
];

/** Existing kids/teens — preserve IDs */
const existingKids = [
  base({
    id: "dog-walk",
    name: "Neighborhood Dog Walker",
    description:
      "Help out busy neighbors by taking their friendly dogs for fun outdoor walks around the neighborhood.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Local / Pets",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0",
    zeroStart: true,
    locationMode: "local",
    difficulty: "Easy",
    timeReq: "2 - 8 hrs/week",
    potentialIncome: "$10 – $20 / walk",
    type: "Active / Local",
    gradient: "emerald",
    iconName: "handyman",
    details: [
      "Walk dogs you already know with an adult nearby",
      "Short leash and familiar sidewalks only",
      "Set a simple per-walk rate",
    ],
    libraryTags: ["zero-start", "no-experience", "fastest-dollar", "weekend", "after-work"],
    matchTags: ["animals", "outdoors", "physical", "local", "helping"],
    relatedGuideIds: ["handyman", "kids-kindness-share"],
  adultSupervisionRequired: true,
    safetyNotes: "Always walk with an adult nearby. Stick to familiar sidewalks.",
    pay: "$10 – $20 / walk",
    tags: {
      ages: ["mid", "older"],
      interests: ["animals", "outdoors"],
      place: ["outdoor"],
      time: ["short", "medium"],
    },
    fit: "Animal lovers with reliable local routes",
    schedule: "Flexible; peak around work hours",
    startup: "$0 with leash/bags from owner",
  }),
  base({
    id: "yard-help",
    name: "Yard & Garden Helper",
    description:
      "Help rake leaves, water flowers, pull weeds, or shovel snow — great for fresh air and pocket money.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Local / Outdoor",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0 – $25",
    zeroStart: true,
    locationMode: "local",
    difficulty: "Easy",
    timeReq: "3 - 10 hrs/week",
    potentialIncome: "$15 – $30 / yard",
    type: "Active / Local",
    gradient: "emerald",
    iconName: "handyman",
    details: ["Hand tools only for kids", "Gloves and sunscreen", "Track earnings in Piggy Bank"],
    libraryTags: ["zero-start", "no-experience", "weekend", "fastest-dollar"],
    matchTags: ["outdoors", "helping", "physical", "local"],
    relatedGuideIds: ["handyman", "kids-piggy-first-goal"],
  adultSupervisionRequired: true,
    safetyNotes: "Never use heavy power tools alone.",
    pay: "$15 – $30 / yard",
    tags: {
      ages: ["mid", "older"],
      interests: ["outdoors", "helping"],
      place: ["outdoor"],
      time: ["medium", "long"],
    },
  }),
  base({
    id: "crafts",
    name: "Creative Crafts & Maker Sales",
    description:
      "Draw stickers, bake clay charms, sew, or make simple handmade goods to sell to friends, fairs, Etsy, or markets.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Creative",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "Less than $25",
    zeroStart: false,
    locationMode: "both",
    difficulty: "Medium",
    timeReq: "4 - 12 hrs/week",
    potentialIncome: "$1 – $5 / item · market weekends",
    type: "Product / Creative",
    gradient: "pink",
    iconName: "pod",
    details: ["Start with a tiny sample set", "Price with a parent/mentor", "School fairs and community boards work"],
    libraryTags: ["no-experience", "weekend", "after-work"],
    matchTags: ["creative", "indoor", "helping", "passive"],
    relatedGuideIds: ["pod", "kids-craft-hustle", "pricing-crafts"],
  adultSupervisionRequired: true,
    pay: "$1 – $5 / item",
    tags: {
      ages: ["young", "mid", "older"],
      interests: ["creative"],
      place: ["indoor", "either"],
      time: ["short", "medium", "long"],
    },
    fit: "Hobby crafters ready to price and ship",
    schedule: "Batch-friendly weekends",
    startup: "Low — supplies + simple booth or listing",
  }),
  base({
    id: "tech-helper",
    name: "Senior Tech Helper / Smartphone Tutor",
    description:
      "Help grandparents or neighbors learn to send pictures, make video calls, set up phones, or play simple online games. Enriched to cover Senior Tech Helper + Smartphone Tutor.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Local / Tech",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0",
    zeroStart: true,
    locationMode: "both",
    difficulty: "Easy",
    timeReq: "2 - 8 hrs/week",
    potentialIncome: "$10 – $25 / hour",
    type: "Active / Service",
    gradient: "cyan",
    iconName: "ai-assets",
    details: ["Teach one skill per session", "Only help people parents know", "Never share passwords"],
    libraryTags: ["zero-start", "no-experience", "after-work", "weekend", "fastest-dollar"],
    matchTags: ["tech", "helping", "people", "indoor"],
    relatedGuideIds: ["kids-kindness-share", "ai-peer-class"],
    adultSupervisionRequired: true,
    safetyNotes: "Never share private codes; only help neighbors parents know well.",
    pay: "$10 – $20 / hour",
    tags: {
      ages: ["mid", "older"],
      interests: ["tech", "helping"],
      place: ["indoor", "either"],
      time: ["short", "medium"],
    },
  }),
  base({
    id: "homework",
    name: "Tutor / Homework Helper & Reading Buddy",
    description:
      "Help younger kids practice reading, spelling, or easy math — patience pays. Covers tutoring, homework help, and reading buddy roles.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Education",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0",
    zeroStart: true,
    locationMode: "both",
    difficulty: "Medium",
    timeReq: "3 - 10 hrs/week",
    potentialIncome: "$10 – $40 / hour",
    type: "Active / Education",
    gradient: "amber",
    iconName: "book-publishing",
    details: ["Public spaces or parents present", "Keep sessions short", "Bring flashcards or easy readers"],
    libraryTags: ["zero-start", "after-work", "weekend", "no-experience"],
    matchTags: ["helping", "people", "indoor", "creative"],
    relatedGuideIds: ["junior-give-back-teach"],
    adultSupervisionRequired: true,
    pay: "$10 – $15 / hour",
    tags: {
      ages: ["older"],
      interests: ["helping"],
      place: ["indoor", "either"],
      time: ["short", "medium"],
    },
    fit: "Teachers, bilingual speakers, patient older students",
    schedule: "Afternoons / evenings",
    startup: "Low — flyers and trusted intros",
  }),
  base({
    id: "book-publishing-kids",
    name: "Book Publishing (Storybooks)",
    description:
      "Write and illustrate a short storybook — a Digital side hustle kids can do with a parent.",
    audiences: ["kids", "junior"],
    category: "Digital",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0 – $50",
    zeroStart: true,
    locationMode: "online",
    difficulty: "Medium",
    timeReq: "4 - 12 hrs/week",
    potentialIncome: "Gifts · fair sales · ebook royalties (parent-managed)",
    type: "Creative / Digital",
    gradient: "amber",
    iconName: "book-publishing",
    details: ["Parent owns publishing accounts", "Start with family editions", "Never share personal info online"],
    libraryTags: ["zero-start", "weekend", "after-work"],
    matchTags: ["creative", "indoor", "tech"],
    relatedGuideIds: ["book-publishing", "digital-products"],
    adultSupervisionRequired: true,
    pay: "Gifts · fair sales · ebook royalties (parent-managed)",
    tags: {
      ages: ["young", "mid", "older"],
      interests: ["creative"],
      place: ["indoor", "either"],
      time: ["medium", "long"],
    },
  }),
  base({
    id: "create-games-kids",
    name: "Create Games with AI (Kids)",
    description:
      "Invent simple game ideas with a parent nearby — use kid-friendly AI tools for stories, characters, and level ideas.",
    audiences: ["kids"],
    category: "AI / Creative",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0",
    zeroStart: true,
    locationMode: "online",
    difficulty: "Easy",
    timeReq: "2 - 8 hrs/week",
    potentialIncome: "School fair / family tips · or just for fun",
    type: "Creative / AI",
    gradient: "purple",
    iconName: "ai-agents",
    details: ["Parent nearby always", "Parent-approved apps only", "Share at school fair or family night"],
    libraryTags: ["zero-start", "ai-powered", "no-experience", "weekend"],
    matchTags: ["creative", "tech", "ai", "indoor"],
    relatedGuideIds: ["kids-games-ai"],
    adultSupervisionRequired: true,
    pay: "School fair / family tips · or just for fun!",
    tags: {
      ages: ["young", "mid"],
      interests: ["creative", "tech", "ai"],
      place: ["indoor"],
      time: ["short", "medium", "long"],
    },
  }),
  base({
    id: "create-games-junior",
    name: "Create Games with AI (Teens)",
    description:
      "Use AI for game concepts, sprites, dialogue, and simple web or mobile prototypes — publish school projects or itch.io demos with guardian approval.",
    audiences: ["junior"],
    category: "AI / Creative",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0 – $50",
    zeroStart: true,
    locationMode: "online",
    difficulty: "Medium",
    timeReq: "5 - 15 hrs/week",
    potentialIncome: "Tips · school credit · itch.io / commissions ($0 – $200+)",
    type: "Creative / AI",
    gradient: "purple",
    iconName: "ai-agents",
    details: ["Parent-approved accounts", "Tiny scope first", "Guardian OK before publishing paid work"],
    libraryTags: ["zero-start", "ai-powered", "after-work", "weekend"],
    matchTags: ["creative", "tech", "ai", "indoor"],
    relatedGuideIds: ["junior-games-ai"],
    adultSupervisionRequired: true,
    pay: "Tips · school credit · itch.io / commissions ($0 – $200+)",
    tags: {
      ages: ["mid", "older"],
      interests: ["creative", "tech", "ai"],
      place: ["indoor"],
      time: ["medium", "long"],
    },
  }),
];

/** Existing senior-only opportunities (keep IDs; expand audiences where appropriate) */
const existingSenior = [
  base({
    id: "consulting",
    name: "Career & Industry Consulting",
    description:
      "Share decades of expertise with freelancers, small businesses, or career-changers who need seasoned advice.",
    audiences: ["adult", "senior"],
    category: "Professional",
    minTier: "starter",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "both",
    difficulty: "Medium",
    timeReq: "4 - 12 hrs/week",
    potentialIncome: "$50 – $200 / hour (examples)",
    type: "Active / Expertise",
    gradient: "cyan",
    iconName: "web-leads",
    details: ["Hourly or project packages", "LinkedIn + local networking", "Productize a signature workshop"],
    libraryTags: ["zero-start", "after-work", "weekend"],
    matchTags: ["people", "marketing", "operations", "helping"],
    relatedGuideIds: ["start-consulting"],
    fit: "Former managers, specialists, and tradespeople",
    schedule: "You set the hours",
    startup: "Low — LinkedIn or local networking",
  }),
  base({
    id: "tutoring",
    name: "Tutoring & Skills Coaching",
    description:
      "Math, reading, languages, music, or professional skills — in person or video. Steady demand from families and adult learners.",
    audiences: ["junior", "adult", "senior"],
    category: "Education",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0",
    zeroStart: true,
    locationMode: "both",
    difficulty: "Medium",
    timeReq: "3 - 12 hrs/week",
    potentialIncome: "$20 – $60 / hour (examples)",
    type: "Active / Education",
    gradient: "amber",
    iconName: "book-publishing",
    details: ["Public or supervised sessions for minors", "Niche your subject", "Package 4-session starters"],
    libraryTags: ["zero-start", "after-work", "weekend"],
    matchTags: ["helping", "people", "indoor", "creative"],
    relatedGuideIds: ["homework"],
    fit: "Teachers, coaches, bilingual speakers, musicians",
    schedule: "Afternoons / evenings as you like",
    startup: "Low — flyers, Nextdoor, tutoring platforms",
  }),
  base({
    id: "handyman-light",
    name: "Light Handyman & Home Help",
    description:
      "Small fixes, furniture assembly, declutter coaching, or seasonal yard touch-ups — skip heavy demolition.",
    audiences: ["adult", "senior"],
    category: "Local Services",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$50 – $200",
    zeroStart: false,
    locationMode: "local",
    difficulty: "Easy",
    timeReq: "5 - 15 hrs/week",
    potentialIncome: "$40 – $80 / hour (examples)",
    type: "Active / Local",
    gradient: "emerald",
    iconName: "handyman",
    details: ["Pace yourself", "Insurance check", "Pair with STR turnovers"],
    libraryTags: ["fastest-dollar", "weekend", "no-experience"],
    matchTags: ["hands_on", "local", "physical", "flexible"],
    relatedGuideIds: ["handyman", "senior-handyman"],
    fit: "Handy homeowners comfortable with light tools",
    schedule: "Job-by-job, daytime preferred",
    startup: "Low–medium — basic tools + insurance check",
  }),
  base({
    id: "pet-sitting",
    name: "Pet Sitting & Dog Walking",
    description:
      "Care for neighbors’ pets while they travel — walks, drop-ins, or overnight stays. Warm work that stays local. (Deduped with Dog Walker enrichment on dog-walk.)",
    audiences: ["junior", "adult", "senior"],
    category: "Local / Pets",
    minTier: "free",
    freeWizardEligible: true,
    startupCost: "$0",
    zeroStart: true,
    locationMode: "local",
    difficulty: "Easy",
    timeReq: "4 - 14 hrs/week",
    potentialIncome: "$25 – $75 / day drop-in (examples)",
    type: "Active / Local",
    gradient: "emerald",
    iconName: "handyman",
    details: ["Trust network + keys protocol", "Holiday peaks", "Written care notes"],
    libraryTags: ["zero-start", "fastest-dollar", "weekend", "no-experience"],
    matchTags: ["animals", "local", "helping", "flexible"],
    relatedGuideIds: ["dog-walk", "neighborhood-errands"],
  adultSupervisionRequired: true,
    fit: "Animal lovers with reliable transportation",
    schedule: "Flexible; peak around holidays",
    startup: "Low — trust network + keys protocol",
  }),
  base({
    id: "str-cohost",
    name: "Airbnb / STR Co-Hosting",
    description:
      "Help hosts with guest messaging, turnover checklists, or local hospitality — without owning the property yourself.",
    audiences: ["adult", "senior"],
    category: "Real Estate",
    minTier: "starter",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "local",
    difficulty: "Medium",
    timeReq: "6 - 20 hrs/week",
    potentialIncome: "% of booking revenue (examples)",
    type: "Active / Hospitality",
    gradient: "pink",
    iconName: "airbnb",
    details: ["Partner with an existing host", "SOPs for messaging and turns", "Share duties"],
    libraryTags: ["zero-start", "weekend", "after-work"],
    matchTags: ["operations", "local", "hosting", "people"],
    relatedGuideIds: ["airbnb", "safe-cohost"],
    fit: "Organized hosts or hospitality veterans",
    schedule: "Part-time blocks; can share duties",
    startup: "Low if partnering with an existing host",
  }),
  base({
    id: "bookkeeping",
    name: "Bookkeeping & Admin Support",
    description:
      "Invoice tracking, QuickBooks basics, or calendar ops for solopreneurs who outgrow spreadsheets.",
    audiences: ["adult", "senior"],
    category: "Professional",
    minTier: "starter",
    freeWizardEligible: false,
    startupCost: "Less than $100",
    zeroStart: true,
    locationMode: "online",
    difficulty: "Medium",
    timeReq: "5 - 15 hrs/week",
    potentialIncome: "$25 – $60 / hour (examples)",
    type: "Active / Admin",
    gradient: "cyan",
    iconName: "digital-products",
    details: ["Remote-friendly", "Weekly rhythm", "Software you may already know"],
    libraryTags: ["zero-start", "after-work"],
    matchTags: ["operations", "tech", "indoor", "helping"],
    relatedGuideIds: ["start-consulting"],
    fit: "Former office admins, accountants, detail people",
    schedule: "Remote-friendly weekly rhythm",
    startup: "Low — software you may already know",
  }),
  base({
    id: "teaching",
    name: "Community Teaching & Workshops",
    description:
      "Lead classes at libraries, senior centers, churches, or online — cooking, genealogy, photography, writing, or life skills.",
    audiences: ["adult", "senior"],
    category: "Education",
    minTier: "starter",
    freeWizardEligible: false,
    startupCost: "$0 – $100",
    zeroStart: true,
    locationMode: "both",
    difficulty: "Medium",
    timeReq: "3 - 10 hrs/week",
    potentialIncome: "$50 – $200 / session (examples)",
    type: "Active / Teaching",
    gradient: "amber",
    iconName: "book-publishing",
    details: ["One session or a short series", "Venue partnerships", "Handouts as digital upsells"],
    libraryTags: ["zero-start", "weekend", "after-work"],
    matchTags: ["people", "creative", "helping", "indoor"],
    relatedGuideIds: ["start-consulting"],
    fit: "Natural teachers and storytellers",
    schedule: "One session or a short series",
    startup: "Low — venue + simple materials",
  }),
  base({
    id: "ai-peers",
    name: "AI Peer Helper for Seniors",
    description:
      "Help peers learn ChatGPT and everyday AI tools at a friendly pace — office hours style, not tech jargon.",
    audiences: ["senior"],
    category: "AI / Education",
    minTier: "pro",
    freeWizardEligible: false,
    startupCost: "$0",
    zeroStart: true,
    locationMode: "both",
    difficulty: "Easy",
    timeReq: "2 - 8 hrs/week",
    potentialIncome: "$15 – $40 / hour (examples)",
    type: "Active / Education",
    gradient: "purple",
    iconName: "ai-assets",
    details: ["Peer-to-peer tone", "Library or community rooms", "Small group classes"],
    libraryTags: ["zero-start", "ai-powered", "no-experience", "weekend"],
    matchTags: ["tech", "ai", "helping", "people"],
    relatedGuideIds: ["ai-peer-class"],
    fit: "Patient tech-curious seniors",
    schedule: "Daytime preferred",
    startup: "$0",
  }),
];

/** Helper to stamp free local/digital new hustles */
function freeLocal(p) {
  return base({
    minTier: "free",
    freeWizardEligible: true,
    zeroStart: p.zeroStart ?? true,
    startupCost: p.startupCost ?? "$0",
    locationMode: p.locationMode ?? "local",
    difficulty: p.difficulty ?? "Easy",
    timeReq: p.timeReq ?? "2 - 8 hrs/week",
    potentialIncome: p.potentialIncome ?? "$10 – $40 / job (examples)",
    type: p.type ?? "Active / Local",
    gradient: p.gradient ?? "emerald",
    iconName: p.iconName ?? "handyman",
    libraryTags: p.libraryTags ?? ["zero-start", "no-experience", "weekend", "fastest-dollar"],
    matchTags: p.matchTags ?? ["local", "helping", "physical"],
    relatedGuideIds: p.relatedGuideIds ?? ["handyman", "neighborhood-errands"],
    adultSupervisionRequired: p.adultSupervisionRequired ?? true,
    details: p.details ?? ["Start with people you know", "Keep jobs small", "Write a clear flat price"],
    ...p,
  });
}

function freeOnline(p) {
  return base({
    minTier: "free",
    freeWizardEligible: true,
    zeroStart: p.zeroStart ?? true,
    startupCost: p.startupCost ?? "$0",
    locationMode: p.locationMode ?? "online",
    difficulty: p.difficulty ?? "Easy",
    timeReq: p.timeReq ?? "3 - 10 hrs/week",
    potentialIncome: p.potentialIncome ?? "$15 – $50 / project (examples)",
    type: p.type ?? "Active / Digital",
    gradient: p.gradient ?? "purple",
    iconName: p.iconName ?? "ai-assets",
    libraryTags: p.libraryTags ?? ["zero-start", "ai-powered", "after-work", "no-experience"],
    matchTags: p.matchTags ?? ["tech", "creative", "online", "ai"],
    relatedGuideIds: p.relatedGuideIds ?? ["ai-assets", "digital-products"],
    adultSupervisionRequired: p.adultSupervisionRequired ?? false,
    details: p.details ?? ["Use free tools first", "Deliver a sample", "Ask for a testimonial"],
    ...p,
  });
}

/** Proposed list — new IDs only where no equivalent exists */
const proposedNew = [
  freeOnline({
    id: "ai-social-helper",
    name: "AI Social Media Helper",
    description: "Draft captions, hashtags, and simple content calendars with AI for local businesses or creators.",
    audiences: ["junior", "adult", "senior"],
    category: "AI / Marketing",
    matchTags: ["ai", "marketing", "creative", "online", "after-work"],
    relatedGuideIds: ["social", "ai-assets"],
  }),
  freeOnline({
    id: "fb-marketplace-helper",
    name: "Facebook Marketplace Listing Helper",
    description: "Photograph, write, and post Marketplace listings for neighbors clearing closets or garages.",
    audiences: ["junior", "adult", "senior"],
    category: "Local / Digital",
    locationMode: "both",
    iconName: "amazon",
    matchTags: ["marketing", "local", "helping", "creative"],
    relatedGuideIds: ["affiliate", "handyman"],
    adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "canva-flyer-creator",
    name: "Canva Flyer Creator",
    description: "Design simple flyers, yard-sale signs, and event graphics in Canva for neighbors and small groups.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Creative",
    iconName: "pod",
    matchTags: ["creative", "marketing", "online", "indoor"],
    relatedGuideIds: ["ai-assets", "pod"],
    adultSupervisionRequired: true,
    libraryTags: ["zero-start", "no-experience", "weekend", "after-work", "fastest-dollar"],
  }),
  freeOnline({
    id: "virtual-assistant",
    name: "Virtual Assistant",
    description: "Help solopreneurs with email triage, calendar booking, light research, and file organizing.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    minTier: "starter",
    freeWizardEligible: true,
    matchTags: ["operations", "tech", "helping", "online"],
    relatedGuideIds: ["bookkeeping", "start-consulting"],
    libraryTags: ["zero-start", "after-work"],
  }),
  freeOnline({
    id: "online-research-assistant",
    name: "Online Research Assistant",
    description: "Run focused web research briefs — vendors, travel options, product comparisons — delivered as tidy notes.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    matchTags: ["tech", "helping", "indoor", "online"],
    relatedGuideIds: ["ai-timing", "digital-products"],
  }),
  freeOnline({
    id: "google-business-helper",
    name: "Google Business Profile Helper",
    description: "Help local shops claim, complete, and tidy Google Business profiles with photos and categories.",
    audiences: ["junior", "adult", "senior"],
    category: "Local / Marketing",
    locationMode: "both",
    matchTags: ["marketing", "local", "tech", "helping"],
    relatedGuideIds: ["web-leads"],
  }),
  freeOnline({
    id: "review-response-assistant",
    name: "Customer Review Response Assistant",
    description: "Draft polite, on-brand replies to Google/Yelp reviews for local businesses.",
    audiences: ["junior", "adult", "senior"],
    category: "Marketing",
    matchTags: ["marketing", "writing", "helping", "online", "ai"],
    relatedGuideIds: ["ai-social-helper", "social"],
  }),
  freeOnline({
    id: "short-form-video-editor",
    name: "Short-Form Video Editor",
    description: "Cut vertical clips, add captions, and package Reels/TikToks for creators or shops.",
    audiences: ["junior", "adult"],
    category: "Creative",
    minTier: "starter",
    freeWizardEligible: true,
    matchTags: ["creative", "tech", "marketing", "online"],
    relatedGuideIds: ["social"],
    libraryTags: ["after-work", "ai-powered"],
  }),
  freeOnline({
    id: "ugc-creator",
    name: "UGC Creator",
    description: "Film simple product demos and authentic testimonials brands can reuse in ads.",
    audiences: ["junior", "adult"],
    category: "Creative",
    minTier: "starter",
    freeWizardEligible: false,
    zeroStart: true,
    matchTags: ["creative", "marketing", "brand", "online"],
    relatedGuideIds: ["social"],
  }),
  freeOnline({
    id: "ai-promo-video",
    name: "AI Promotional Video Creator",
    description: "Combine AI script + stock/AI visuals into short promo videos for local offers.",
    audiences: ["junior", "adult", "senior"],
    category: "AI / Creative",
    matchTags: ["ai", "creative", "marketing", "online"],
    relatedGuideIds: ["ai-assets", "social"],
  }),
  freeOnline({
    id: "resume-linkedin-helper",
    name: "Resume & LinkedIn Helper",
    description: "Rewrite resumes and polish LinkedIn About sections with clear, honest wording.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    matchTags: ["writing", "helping", "people", "online"],
    relatedGuideIds: ["start-consulting"],
  }),
  freeOnline({
    id: "digital-organizer",
    name: "Digital Organizer",
    description: "Sort cloud folders, photo libraries, and messy downloads into labeled systems clients can keep.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    matchTags: ["tech", "operations", "helping", "indoor"],
    relatedGuideIds: ["bookkeeping"],
  }),
  // tech-helper already covers Senior Tech Helper + Smartphone Tutor
  freeOnline({
    id: "community-newsletter-creator",
    name: "Community Newsletter Creator",
    description: "Write a short weekly neighborhood or club newsletter with events, tips, and shout-outs.",
    audiences: ["junior", "adult", "senior"],
    category: "Marketing",
    matchTags: ["writing", "marketing", "people", "creative"],
    relatedGuideIds: ["social", "affiliate"],
  }),
  freeOnline({
    id: "proofreader",
    name: "Proofreader",
    description: "Catch typos and clarity issues in flyers, blogs, school papers, and small-business copy.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    matchTags: ["writing", "helping", "indoor", "online"],
    relatedGuideIds: ["digital-products"],
  }),
  freeOnline({
    id: "transcription-notes-helper",
    name: "Transcription & Notes Helper",
    description: "Turn voice memos or meeting recordings into clean bullet notes clients can act on.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    matchTags: ["tech", "writing", "helping", "online"],
  relatedGuideIds: ["ai-assets"],
  }),
  freeOnline({
    id: "digital-cookbook-creator",
    name: "Digital Cookbook Creator",
    description: "Collect family recipes into a simple PDF cookbook with photos and tips.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Digital",
    matchTags: ["creative", "indoor", "passive"],
    relatedGuideIds: ["digital-products", "book-publishing-kids"],
  adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "family-history-organizer",
    name: "Family History Organizer",
    description: "Interview relatives, scan keepsakes, and build a simple family history binder or digital album.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Creative",
    matchTags: ["creative", "helping", "indoor", "people"],
    relatedGuideIds: ["digital-products"],
    adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "digital-photo-organizer",
    name: "Digital Photo Organizer",
    description: "Sort years of phone photos into albums by event/year and remove obvious duplicates.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    matchTags: ["tech", "helping", "indoor", "creative"],
    relatedGuideIds: ["digital-organizer"],
  }),
  freeOnline({
    id: "local-content-photographer",
    name: "Local Business Content Photographer",
    description: "Shoot simple phone photos of storefronts, menus, and products for social and Google profiles.",
    audiences: ["junior", "adult", "senior"],
    category: "Creative",
    locationMode: "local",
    matchTags: ["creative", "local", "marketing", "physical"],
    relatedGuideIds: ["ai-assets", "web-leads"],
    adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "local-event-content-creator",
    name: "Local Event Content Creator",
    description: "Capture short clips and recap posts for school events, markets, and community gatherings.",
    audiences: ["junior", "adult"],
    category: "Creative",
    locationMode: "both",
    matchTags: ["creative", "marketing", "people", "local"],
    relatedGuideIds: ["social"],
    adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "nonprofit-social-helper",
    name: "Church/Nonprofit Social Media Helper",
    description: "Post event reminders and volunteer spotlights for churches and nonprofits that need consistent updates.",
    audiences: ["junior", "adult", "senior"],
    category: "Marketing",
    matchTags: ["marketing", "helping", "people", "creative"],
    relatedGuideIds: ["social", "ai-social-helper"],
  }),
  freeOnline({
    id: "travel-research-assistant",
    name: "Travel Research Assistant",
    description: "Compare flights, lodging, and itineraries into a one-page travel brief for busy planners.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    matchTags: ["tech", "helping", "online", "indoor"],
    relatedGuideIds: ["online-research-assistant"],
  }),
  freeOnline({
    id: "online-community-moderator",
    name: "Online Community Moderator",
    description: "Keep Facebook/Discord groups friendly — approve posts, welcome members, escalate issues.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    minTier: "starter",
    freeWizardEligible: true,
    matchTags: ["people", "tech", "helping", "online"],
    relatedGuideIds: ["social"],
  }),
  freeOnline({
    id: "group-setup-helper",
    name: "Discord/Facebook Group Setup Helper",
    description: "Create channels/rules, welcome posts, and starter content for new community groups.",
    audiences: ["junior", "adult"],
    category: "Tech",
    matchTags: ["tech", "marketing", "online"],
    relatedGuideIds: ["online-community-moderator"],
  }),
  freeOnline({
    id: "website-tester",
    name: "Website Tester",
    description: "Click through small-business sites and deliver a bug/clarity checklist with screenshots.",
    audiences: ["junior", "adult", "senior"],
    category: "Tech",
    matchTags: ["tech", "helping", "online", "indoor"],
    relatedGuideIds: ["web-leads"],
  }),
  freeOnline({
    id: "ai-prompt-helper",
    name: "Learn AI using ChatGPT",
    description: "Learn how to use ChatGPT for writing, planning, and everyday tasks — practice prompts and simple workflows you can reuse.",
    audiences: ["junior", "adult", "senior"],
    category: "AI",
    matchTags: ["ai", "tech", "creative", "online"],
    relatedGuideIds: ["ai-assets", "ai-agents"],
  }),
  freeOnline({
    id: "digital-product-formatter",
    name: "Digital Product Formatter",
    description: "Turn rough drafts into clean PDFs, worksheets, and slide decks ready to sell or share.",
    audiences: ["junior", "adult", "senior"],
    category: "Digital",
    matchTags: ["creative", "tech", "operations", "online"],
    relatedGuideIds: ["digital-products"],
  }),
  freeOnline({
    id: "local-business-ai-setup",
    name: "Local Business AI Setup Helper",
    description: "Set up simple AI reply templates and FAQ helpers for shops that are new to ChatGPT.",
    audiences: ["adult", "senior"],
    category: "AI / Local",
    locationMode: "both",
    matchTags: ["ai", "local", "tech", "helping"],
    relatedGuideIds: ["ai-agents", "web-leads"],
  }),
  freeOnline({
    id: "appointment-setter",
    name: "Appointment Setter",
    description: "Book calls and reminders for coaches, tutors, and local pros from a shared calendar.",
    audiences: ["junior", "adult", "senior"],
    category: "Professional",
    matchTags: ["operations", "people", "helping", "online"],
    relatedGuideIds: ["virtual-assistant"],
  }),
  freeOnline({
    id: "lead-followup-assistant",
    name: "Lead Follow-Up Assistant",
    description: "Send polite follow-up texts/emails to warm leads so local pros stop dropping the ball.",
    audiences: ["junior", "adult", "senior"],
    category: "Marketing",
    matchTags: ["marketing", "people", "helping", "online"],
    relatedGuideIds: ["web-leads", "virtual-assistant"],
  }),
  freeOnline({
    id: "virtual-receptionist",
    name: "Virtual Receptionist",
    description: "Answer FAQs, route messages, and confirm appointments for small offices during set hours.",
    audiences: ["adult", "senior"],
    category: "Professional",
    minTier: "starter",
    freeWizardEligible: true,
    matchTags: ["people", "operations", "helping", "online"],
    relatedGuideIds: ["virtual-assistant"],
  }),
  // LOCAL / SERVICE
  freeLocal({
    id: "errand-runner",
    name: "Errand Runner",
    description: "Run short local errands — pharmacy pickups, returns, and store dashes for busy neighbors.",
    audiences: ["junior", "adult", "senior"],
    matchTags: ["local", "helping", "vehicle", "flexible"],
    safetyNotes: "Teens: parent-approved errands only; never enter strangers’ homes alone.",
  }),
  // pet-sitting + dog-walk already cover Pet Sitter / Dog Walker
  freeLocal({
    id: "house-sitter",
    name: "House Sitter",
    description: "Watch a trusted family’s home — mail, lights, plants — while they travel.",
    audiences: ["junior", "adult", "senior"],
    matchTags: ["local", "helping", "flexible", "indoor"],
    safetyNotes: "Only for families you know well; written checklist required.",
  }),
  freeLocal({
    id: "plant-watering",
    name: "Plant Watering Service",
    description: "Water indoor/outdoor plants on a schedule for neighbors on vacation or who travel often.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["outdoors", "helping", "local", "indoor"],
    relatedGuideIds: ["yard-help", "kids-kindness-share"],
  }),
  freeLocal({
    id: "trash-can-service",
    name: "Trash Can Service",
    description: "Roll bins to the curb and back on trash day for neighbors who need a hand.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["local", "helping", "physical", "outdoors"],
    relatedGuideIds: ["yard-help"],
  }),
  freeLocal({
    id: "porch-package-helper",
    name: "Porch Package Helper",
    description: "Move packages inside or to a safe spot for neighbors who miss deliveries.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["local", "helping", "physical"],
    safetyNotes: "Only for neighbors parents know; never open packages.",
  }),
  freeLocal({
    id: "neighborhood-helper",
    name: "Neighborhood Helper",
    description: "A flexible mini-service: small chores, notes, and check-ins for nearby households who already know you.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["local", "helping", "people", "flexible"],
    relatedGuideIds: ["neighborhood-errands", "kids-kindness-share"],
  }),
  freeLocal({
    id: "closet-organizer",
    name: "Closet Organizer",
    description: "Sort clothes into keep/donate/sell piles and leave closets easier to use.",
    audiences: ["junior", "adult", "senior"],
    matchTags: ["indoor", "helping", "operations", "local"],
    locationMode: "local",
  }),
  freeLocal({
    id: "garage-sale-helper",
    name: "Garage Sale Helper",
    description: "Price, table, and sell items at garage sales — or run the table while owners restock.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["local", "people", "helping", "marketing"],
    relatedGuideIds: ["fb-marketplace-helper"],
  }),
  freeLocal({
    id: "estate-sale-listing-helper",
    name: "Estate Sale Listing Helper",
    description: "Photograph and list estate or downsizing items online with clear titles and prices.",
    audiences: ["adult", "senior"],
    matchTags: ["marketing", "helping", "local", "online"],
    locationMode: "both",
    relatedGuideIds: ["fb-marketplace-helper"],
  }),
  freeLocal({
    id: "personal-shopper",
    name: "Personal Shopper",
    description: "Pick up groceries or specific items with a written list and receipt photo for busy clients.",
    audiences: ["junior", "adult", "senior"],
    matchTags: ["local", "helping", "vehicle", "people"],
    safetyNotes: "Use prepaid lists or parent payment methods for teens.",
  }),
  freeLocal({
    id: "airbnb-turnover-checker",
    name: "Airbnb Turnover Checker",
    description: "Walk through STR checklists — towels, trash, basics restock — and report issues to the host.",
    audiences: ["junior", "adult", "senior"],
    matchTags: ["operations", "local", "hosting", "helping"],
    relatedGuideIds: ["airbnb", "str-cohost", "property-mgmt"],
    minTier: "starter",
    freeWizardEligible: true,
    zeroStart: true,
  }),
  // tutoring/homework covers Tutor; reading buddy enriched into homework
  freeLocal({
    id: "youth-sports-helper",
    name: "Youth Sports Practice Helper",
    description: "Help coaches with cones, water, and kid check-ins at practices — not coaching credentials required.",
    audiences: ["junior", "adult", "senior"],
    matchTags: ["outdoors", "people", "helping", "physical"],
  }),
  freeLocal({
    id: "birthday-party-helper",
    name: "Birthday Party Helper",
    description: "Assist with setup, games, and cleanup at kids’ parties for tired parents.",
    audiences: ["junior", "adult"],
    matchTags: ["people", "helping", "local", "indoor"],
  }),
  freeLocal({
    id: "kids-party-game-host",
    name: "Kids Party Game Host",
    description: "Lead simple party games and activities with a short prepared plan and supplies list.",
    audiences: ["junior", "adult"],
    matchTags: ["people", "creative", "helping", "indoor"],
    relatedGuideIds: ["birthday-party-helper"],
  }),
  // LOW-COST / KID-FRIENDLY
  freeLocal({
    id: "lemonade-stand",
    name: "Lemonade / Drink Stand",
    description: "Classic sidewalk drink stand with parent help on pricing, hygiene, and location.",
    audiences: ["kids", "junior"],
    matchTags: ["outdoors", "people", "creative", "local"],
    relatedGuideIds: ["kids-piggy-first-goal"],
    libraryTags: ["zero-start", "no-experience", "weekend", "fastest-dollar"],
  }),
  // yard-help covers Yard Cleanup + Leaf Raking enrichment
  freeLocal({
    id: "leaf-raking",
    name: "Leaf Raking Service",
    description: "Focused leaf-raking packages for neighbors who want curb appeal without hiring a full landscaper. (Pairs with Yard & Garden Helper.)",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["outdoors", "physical", "local", "helping"],
    relatedGuideIds: ["yard-help"],
  }),
  freeLocal({
    id: "mailbox-cleaning",
    name: "Mailbox Cleaning Service",
    description: "Wipe, tidy, and lightly polish neighborhood mailboxes with owner permission.",
    audiences: ["kids", "junior"],
    matchTags: ["local", "helping", "outdoors", "physical"],
  }),
  freeLocal({
    id: "toy-organizer",
    name: "Toy Organizer",
    description: "Sort playrooms into labeled bins so kids can find toys and parents can breathe.",
    audiences: ["kids", "junior", "adult"],
    matchTags: ["indoor", "helping", "operations"],
    relatedGuideIds: ["closet-organizer"],
  }),
  freeLocal({
    id: "car-interior-cleanup",
    name: "Car Interior Cleanup Helper",
    description: "Vacuum crumbs, wipe surfaces, and bag trash from family cars (no chemicals kids shouldn’t use).",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["local", "helping", "physical", "vehicle"],
  }),
  freeLocal({
    id: "holiday-decorating-helper",
    name: "Holiday Decorating Helper",
    description: "Help hang indoor decorations and pack them away after the season — ladders only with adults.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["indoor", "helping", "people", "seasonal"],
    libraryTags: ["zero-start", "weekend", "no-experience", "fastest-dollar"],
  }),
  freeLocal({
    id: "gift-wrapping",
    name: "Gift Wrapping Service",
    description: "Wrap gifts neatly for holidays and birthdays with bows and simple tags.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["creative", "indoor", "helping", "weekend"],
    locationMode: "both",
  }),
  freeLocal({
    id: "recycling-helper",
    name: "Neighborhood Recycling Helper",
    description: "Sort recyclables and walk bins out on the right day for neighbors who need help.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["outdoors", "helping", "local", "physical"],
  }),
  freeOnline({
    id: "greeting-card-creator",
    name: "Greeting Card Creator",
    description: "Make handmade or Canva greeting cards for birthdays, thanks, and holidays.",
    audiences: ["kids", "junior", "adult", "senior"],
    category: "Creative",
    matchTags: ["creative", "indoor", "helping"],
    relatedGuideIds: ["crafts", "canva-flyer-creator"],
    adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "custom-bookmark-creator",
    name: "Custom Bookmark Creator",
    description: "Design laminated bookmarks with quotes or art for school fairs and gifts.",
    audiences: ["kids", "junior"],
    category: "Creative",
    matchTags: ["creative", "indoor"],
    relatedGuideIds: ["crafts"],
    adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "friendship-bracelet-maker",
    name: "Friendship Bracelet Maker",
    description: "Weave friendship bracelets to sell at school events or gift as kindness bonuses.",
    audiences: ["kids", "junior"],
    category: "Creative",
    matchTags: ["creative", "indoor", "people"],
    relatedGuideIds: ["crafts", "kids-kindness-share"],
    adultSupervisionRequired: true,
  }),
  // crafts covers Simple Craft Seller
  freeLocal({
    id: "mothers-helper",
    name: "Babysitter's Helper / Mother's Helper",
    description: "Help a parent at home with toys, snacks, and play — always with the parent present (not solo babysitting).",
    audiences: ["kids", "junior"],
    matchTags: ["people", "helping", "indoor"],
    safetyNotes: "Parent must remain home. This is helper work, not unsupervised childcare.",
    relatedGuideIds: ["kids-kindness-share"],
  }),
  freeOnline({
    id: "homework-organizer",
    name: "Homework Organizer",
    description: "Help classmates set up folders, planners, and weekly homework checklists (with teacher/parent OK).",
    audiences: ["kids", "junior"],
    matchTags: ["helping", "indoor", "operations"],
    relatedGuideIds: ["homework"],
    adultSupervisionRequired: true,
  }),
  freeLocal({
    id: "vacation-mail-plant-helper",
    name: "Vacation Plant Helper",
    description: "Water plants on a schedule for trusted neighbors while they travel — plants only, never mail or packages.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["local", "helping", "flexible"],
    relatedGuideIds: ["plant-watering", "house-sitter"],
  }),
  freeOnline({
    id: "closet-cleanout-listing",
    name: "Closet Clean-Out Listing Helper",
    description: "Help photograph and list donated/sold closet items after an organizing session.",
    audiences: ["junior", "adult", "senior"],
    locationMode: "both",
    matchTags: ["marketing", "helping", "local", "online"],
    relatedGuideIds: ["closet-organizer", "fb-marketplace-helper"],
  }),
  freeOnline({
    id: "family-photo-slideshow",
    name: "Family Photo Slideshow Creator",
    description: "Turn family photos into a simple slideshow video for reunions and celebrations.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["creative", "tech", "indoor", "helping"],
    relatedGuideIds: ["digital-photo-organizer"],
    adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "basic-invitation-creator",
    name: "Basic Invitation Creator",
    description: "Design party or event invitations in Canva and export print/share files.",
    audiences: ["kids", "junior", "adult", "senior"],
    matchTags: ["creative", "marketing", "indoor"],
    relatedGuideIds: ["canva-flyer-creator"],
    adultSupervisionRequired: true,
  }),
  freeOnline({
    id: "local-resource-list-creator",
    name: "Local Resource List Creator",
    description: "Compile neighborhood resources — parks, tutors, repair folks — into a shareable list people will pay a small fee for.",
    audiences: ["junior", "adult", "senior"],
    locationMode: "both",
    matchTags: ["research", "local", "helping", "online"],
    relatedGuideIds: ["online-research-assistant"],
  }),
];

const all = [...existingAdult, ...existingKids, ...existingSenior, ...proposedNew];

// Dedupe by id (first wins)
const seen = new Set();
const SIDE_HUSTLES = [];
for (const h of all) {
  if (seen.has(h.id)) continue;
  seen.add(h.id);
  SIDE_HUSTLES.push(h);
}

function tsString(s) {
  return JSON.stringify(s ?? "");
}

function emitRecord(h) {
  const lines = [];
  lines.push("  {");
  lines.push(`    id: ${tsString(h.id)},`);
  lines.push(`    name: ${tsString(h.name)},`);
  lines.push(`    description: ${tsString(h.description)},`);
  if (h.fullDescription) lines.push(`    fullDescription: ${tsString(h.fullDescription)},`);
  lines.push(`    audiences: ${JSON.stringify(h.audiences)},`);
  lines.push(`    category: ${tsString(h.category)},`);
  lines.push(`    minTier: ${tsString(h.minTier)},`);
  lines.push(`    freeWizardEligible: ${h.freeWizardEligible},`);
  lines.push(`    startupCost: ${tsString(h.startupCost)},`);
  lines.push(`    zeroStart: ${!!h.zeroStart},`);
  lines.push(`    locationMode: ${tsString(h.locationMode)},`);
  lines.push(`    difficulty: ${tsString(h.difficulty)},`);
  lines.push(`    timeReq: ${tsString(h.timeReq)},`);
  lines.push(`    potentialIncome: ${tsString(h.potentialIncome)},`);
  lines.push(`    type: ${tsString(h.type)},`);
  lines.push(`    gradient: ${tsString(h.gradient)},`);
  lines.push(`    iconName: ${tsString(h.iconName)},`);
  lines.push(`    details: ${JSON.stringify(h.details)},`);
  lines.push(`    libraryTags: ${JSON.stringify(h.libraryTags ?? [])},`);
  lines.push(`    matchTags: ${JSON.stringify(h.matchTags ?? [])},`);
  if (h.whatYouDo) lines.push(`    whatYouDo: ${JSON.stringify(h.whatYouDo)},`);
  if (h.whoItsGoodFor) lines.push(`    whoItsGoodFor: ${tsString(h.whoItsGoodFor)},`);
  if (h.skillsNeeded) lines.push(`    skillsNeeded: ${JSON.stringify(h.skillsNeeded)},`);
  if (h.toolsNeeded) lines.push(`    toolsNeeded: ${JSON.stringify(h.toolsNeeded)},`);
  if (h.pricingApproach) lines.push(`    pricingApproach: ${tsString(h.pricingApproach)},`);
  if (h.earningsExample) lines.push(`    earningsExample: ${tsString(h.earningsExample)},`);
  if (h.firstCustomerTips) lines.push(`    firstCustomerTips: ${tsString(h.firstCustomerTips)},`);
  if (h.sampleOffer) lines.push(`    sampleOffer: ${tsString(h.sampleOffer)},`);
  if (h.howToStartToday) lines.push(`    howToStartToday: ${JSON.stringify(h.howToStartToday)},`);
  if (h.launchSteps) lines.push(`    launchSteps: ${JSON.stringify(h.launchSteps)},`);
  if (h.tips) lines.push(`    tips: ${JSON.stringify(h.tips)},`);
  if (h.safetyNotes) lines.push(`    safetyNotes: ${tsString(h.safetyNotes)},`);
  if (h.adultSupervisionRequired) lines.push(`    adultSupervisionRequired: true,`);
  if (h.relatedGuideIds?.length) lines.push(`    relatedGuideIds: ${JSON.stringify(h.relatedGuideIds)},`);
  if (h.pay) lines.push(`    pay: ${tsString(h.pay)},`);
  if (h.tags) lines.push(`    tags: ${JSON.stringify(h.tags)},`);
  if (h.fit) lines.push(`    fit: ${tsString(h.fit)},`);
  if (h.schedule) lines.push(`    schedule: ${tsString(h.schedule)},`);
  if (h.startup) lines.push(`    startup: ${tsString(h.startup)},`);
  lines.push("  }");
  return lines.join("\n");
}

const header = `/**
 * Shared Side Hustle catalog (MANY-TO-MANY audiences).
 * Source of truth for wizards, library filters, and demographic browse.
 * Generated/maintained for GYSH library expansion — preserve existing IDs.
 *
 * BEFORE: 16 adult + 8 kids/teens + 11 senior opportunities (siloed).
 * Free wizard pools target ≥15 eligible hustles per demographic.
 * Schedule Suite remains Pro+ (see membership.ts / hustle-schedule.ts).
 */

import type { TierId } from "./membership";

export type HustleAgeGroup = "kids" | "junior" | "adult" | "senior";

export type LibraryTag =
  | "zero-start"
  | "ai-powered"
  | "fastest-dollar"
  | "no-experience"
  | "weekend"
  | "after-work";

export type LocationMode = "online" | "local" | "both";

export type SideHustleLaunchStep = { title: string; body: string };

export type SideHustleRecord = {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  whatYouDo?: string[];
  whoItsGoodFor?: string;
  audiences: HustleAgeGroup[];
  category: string;
  minTier: TierId;
  /** Eligible in Free/guest wizard pools (separate from paid tools). */
  freeWizardEligible: boolean;
  startupCost: string;
  zeroStart: boolean;
  locationMode: LocationMode;
  difficulty: "Easy" | "Medium" | "Hard";
  timeReq: string;
  potentialIncome: string;
  type: string;
  gradient: "pink" | "purple" | "cyan" | "emerald" | "amber";
  iconName: string;
  details: string[];
  libraryTags: LibraryTag[];
  matchTags: string[];
  skillsNeeded?: string[];
  toolsNeeded?: string[];
  pricingApproach?: string;
  earningsExample?: string;
  firstCustomerTips?: string;
  sampleOffer?: string;
  howToStartToday?: string[];
  launchSteps?: SideHustleLaunchStep[];
  tips?: string[];
  safetyNotes?: string;
  adultSupervisionRequired?: boolean;
  relatedGuideIds?: string[];
  pay?: string;
  tags?: {
    ages?: Array<"young" | "mid" | "older">;
    interests?: Array<"animals" | "creative" | "outdoors" | "helping" | "tech" | "ai">;
    place?: Array<"outdoor" | "indoor" | "either">;
    time?: Array<"short" | "medium" | "long">;
  };
  fit?: string;
  schedule?: string;
  startup?: string;
};

export const FREE_WIZARD_MIN = 8;

/**
 * Curated Free Wizard allowlist (~30 unique hustles shared across demographics).
 * Free Wizard eligibility ≠ free paid tools (Schedule Suite stays Pro+).
 */
export const FREE_WIZARD_HUSTLE_IDS = [
  "dog-walk",
  "yard-help",
  "crafts",
  "tech-helper",
  "homework",
  "pet-sitting",
  "plant-watering",
  "handyman",
  "handyman-light",
  "canva-flyer-creator",
  "gift-wrapping",
  "lemonade-stand",
  "trash-can-service",
  "neighborhood-helper",
  "greeting-card-creator",
  "leaf-raking",
  "porch-package-helper",
  "garage-sale-helper",
  "car-interior-cleanup",
  "holiday-decorating-helper",
  "recycling-helper",
  "vacation-mail-plant-helper",
  "basic-invitation-creator",
  "digital-cookbook-creator",
  "family-photo-slideshow",
  "errand-runner",
  "tutoring",
  "proofreader",
  "friendship-bracelet-maker",
  "toy-organizer",
] as const;

export const SIDE_HUSTLES: SideHustleRecord[] = [
`;

const helpers = `
];

/** Cap Free Wizard to the curated allowlist (shared across demographics). */
{
  const allow = new Set<string>(FREE_WIZARD_HUSTLE_IDS);
  for (const h of SIDE_HUSTLES) {
    h.freeWizardEligible = allow.has(h.id);
  }
}

export function allSideHustles(): SideHustleRecord[] {
  return SIDE_HUSTLES;
}

export function hustleById(id: string): SideHustleRecord | undefined {
  return SIDE_HUSTLES.find((h) => h.id === id);
}

export function hustlesForAudience(age: HustleAgeGroup): SideHustleRecord[] {
  return SIDE_HUSTLES.filter((h) => h.audiences.includes(age));
}

/** Free/guest wizard pool for a demographic (≥ FREE_WIZARD_MIN when catalog is complete). */
export function freeWizardPool(age: HustleAgeGroup): SideHustleRecord[] {
  return hustlesForAudience(age).filter((h) => h.freeWizardEligible);
}

export function wizardPoolForTier(
  age: HustleAgeGroup,
  opts: { isMember: boolean; tier?: TierId | null },
): SideHustleRecord[] {
  const full = hustlesForAudience(age);
  if (!opts.isMember) return freeWizardPool(age);
  const tier = (opts.tier || "free").toLowerCase() as TierId;
  if (tier === "free") return freeWizardPool(age);
  return full;
}

export type SideHustleFilterOpts = {
  audience?: HustleAgeGroup | "all";
  zeroStart?: boolean;
  locationMode?: LocationMode | "all";
  libraryTag?: LibraryTag | "all";
  under25?: boolean;
  under100?: boolean;
  noMoneyStartHere?: boolean;
  query?: string;
};

function parseCostCeiling(startupCost: string): number | null {
  const s = startupCost.toLowerCase();
  if (s.includes("$0") || s.includes("less than $25") || s.startsWith("$0")) return 0;
  if (s.includes("less than $100") || s.includes("under $100")) return 99;
  const m = s.match(/\\$(\\d+)/);
  return m ? Number(m[1]) : null;
}

export function filterSideHustles(opts: SideHustleFilterOpts): SideHustleRecord[] {
  let list = SIDE_HUSTLES.slice();
  if (opts.audience && opts.audience !== "all") {
    list = list.filter((h) => h.audiences.includes(opts.audience as HustleAgeGroup));
  }
  if (opts.noMoneyStartHere || opts.zeroStart) {
    list = list.filter((h) => h.zeroStart);
  }
  if (opts.locationMode && opts.locationMode !== "all") {
    list = list.filter(
      (h) => h.locationMode === opts.locationMode || h.locationMode === "both",
    );
  }
  if (opts.libraryTag && opts.libraryTag !== "all") {
    list = list.filter((h) => h.libraryTags.includes(opts.libraryTag as LibraryTag));
  }
  if (opts.under25) {
    list = list.filter((h) => {
      const c = parseCostCeiling(h.startupCost);
      return h.zeroStart || (c !== null && c <= 25) || /less than \\$25|\\$0/i.test(h.startupCost);
    });
  }
  if (opts.under100) {
    list = list.filter((h) => {
      const c = parseCostCeiling(h.startupCost);
      return (
        h.zeroStart ||
        (c !== null && c < 100) ||
        /less than \\$100|under \\$100|\\$0|\\$50/i.test(h.startupCost)
      );
    });
  }
  if (opts.query?.trim()) {
    const q = opts.query.trim().toLowerCase();
    list = list.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q) ||
        h.matchTags.some((t) => t.includes(q)),
    );
  }
  return list;
}

/** Bridge to existing HustleCard shape. */
export function toHustleCard(h: SideHustleRecord) {
  return {
    id: h.id,
    name: h.name,
    description: h.description,
    startupCost: h.startupCost,
    timeReq: h.timeReq,
    difficulty: h.difficulty,
    potentialIncome: h.potentialIncome,
    type: h.type,
    gradient: h.gradient,
    category: h.category,
    iconName: h.iconName,
    details: h.details,
  };
}

export function adultBrowseHustles() {
  return hustlesForAudience("adult").map(toHustleCard);
}

export function toSeniorOpportunity(h: SideHustleRecord) {
  return {
    id: h.id,
    name: h.name,
    desc: h.description,
    fit: h.fit ?? h.whoItsGoodFor ?? "Good fit when the match tags align",
    schedule: h.schedule ?? h.timeReq,
    startup: h.startup ?? h.startupCost,
  };
}

export function seniorBrowseOpportunities() {
  return hustlesForAudience("senior").map(toSeniorOpportunity);
}

export function kidsScoreEntries(mode: "kids" | "junior") {
  return hustlesForAudience(mode)
    .filter((h) => h.tags)
    .map((h) => ({
      id: h.id,
      audiences: h.audiences.filter((a): a is "kids" | "junior" => a === "kids" || a === "junior"),
      tags: h.tags!,
    }));
}

export function freeWizardPoolCounts() {
  return {
    kids: freeWizardPool("kids").length,
    junior: freeWizardPool("junior").length,
    adult: freeWizardPool("adult").length,
    senior: freeWizardPool("senior").length,
  };
}

export function buildLaunchKit(hustleId: string) {
  const h = hustleById(hustleId);
  const guideIds = h?.relatedGuideIds ?? [];
  return {
    hustleId,
    guideIds,
    scheduleSuiteLockedForFree: true as const,
    note: "Schedule Builder stays Pro or higher — Free can discover and start, not unlock paid planning tools.",
  };
}

/** Core IDs that must never disappear. */
export const PRESERVED_HUSTLE_IDS = [
  "airbnb",
  "pod",
  "dropshipping",
  "digital-products",
  "affiliate",
  "amazon",
  "social",
  "web-leads",
  "ai-assets",
  "property-mgmt",
  "handyman",
  "rideshare",
  "food-delivery",
  "ai-timing",
  "ai-agents",
  "book-publishing",
  "dog-walk",
  "yard-help",
  "crafts",
  "tech-helper",
  "homework",
  "book-publishing-kids",
  "create-games-kids",
  "create-games-junior",
  "consulting",
  "tutoring",
  "handyman-light",
  "pet-sitting",
  "str-cohost",
  "bookkeeping",
  "teaching",
  "ai-peers",
] as const;
`;

const body = SIDE_HUSTLES.map(emitRecord).join(",\n");
writeFileSync(outPath, header + body + helpers, "utf8");
console.log("Wrote", outPath);
console.log("Total hustles", SIDE_HUSTLES.length);
for (const age of ["kids", "junior", "adult", "senior"]) {
  const n = SIDE_HUSTLES.filter((h) => h.audiences.includes(age) && h.freeWizardEligible).length;
  console.log("free pool", age, n);
}
