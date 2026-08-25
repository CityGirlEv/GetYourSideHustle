import React, { useEffect, useState } from "react";
import { 
  Check, 
  AlertTriangle, 
  Award,
  ArrowRight,
  TrendingUp,
  Coins,
  LogIn,
} from "lucide-react";
import { fetchMemberProgress, saveMemberProgress } from "../lib/gysh-member-progress";
import {
  adultGuideMinTier,
  FREE_GUIDE_SIGNUP_NOTE,
  guideTierBadgeLabel,
  guideTierMembershipNote,
  guideTierShortLabel,
  resolveGuideAccess,
} from "../lib/guide-access";
import { JoinToUnlockCta } from "./JoinToUnlockCta";
import { MembershipLockBadge } from "./MembershipLockBadge";

interface GuideStep {
  title: string;
  desc: string;
}

interface GuideData {
  id: string;
  name: string;
  timeframe: string;
  estEarnings: string;
  bestFor: string;
  steps: GuideStep[];
  proTip: string;
  pitfall: string;
}

interface StepByStepGuidesProps {
  selectedHustleId?: string;
  onGoToCalculator: (hustleId: string) => void;
  isLoggedIn?: boolean;
  membershipTier?: string | null;
  onGoToJoin?: () => void;
  onGoToLogin?: () => void;
  onBackToCatalog?: () => void;
}

export const StepByStepGuides: React.FC<StepByStepGuidesProps> = ({ 
  selectedHustleId = "airbnb",
  onGoToCalculator,
  isLoggedIn = false,
  membershipTier = null,
  onGoToJoin,
  onGoToLogin,
  onBackToCatalog,
}) => {
  const [activeGuideId, setActiveGuideId] = useState<string>(selectedHustleId);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [stepsOpen, setStepsOpen] = useState(false);
  const effectiveTier = membershipTier ?? (isLoggedIn ? "free" : null);
  const activeMinTier = adultGuideMinTier(activeGuideId);
  const activeAccess = resolveGuideAccess({
    isMember: isLoggedIn,
    membershipTier: effectiveTier,
    minTier: activeMinTier,
  });
  const guideIsFree = activeMinTier === "free";
  const unlocked = activeAccess.unlocked;

  useEffect(() => {
    setActiveGuideId(selectedHustleId);
    setStepsOpen(false);
  }, [selectedHustleId]);

  useEffect(() => {
    if (!unlocked) {
      setCompletedSteps({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const payload = await fetchMemberProgress<Record<string, boolean>>("launch_guide_steps");
        if (!cancelled) setCompletedSteps(payload ?? {});
      } catch {
        /* keep empty; member can still check boxes and retry save */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  // Keep IDs/names aligned with src/lib/launch-guides.ts (LAUNCH_GUIDES) so
  // Admin Task List auto-creates "Review Launch Guide: …" items for new hustles.
  const guides: GuideData[] = [
    {
      id: "airbnb",
      name: "Airbnb Hosting",
      timeframe: "2 - 4 weeks",
      estEarnings: "$1,500 - $8,000 / month",
      bestFor: "Property owners or sublease managers looking to monetize space.",
      proTip: "Invest in a high-quality smart lock (e.g., Yale or Schlage) that integrates with Airbnb to auto-generate keypad codes for guests upon check-in. It saves hours of manual work.",
      pitfall: "Not checking local regulations or HOA rules. Many cities require short-term rental (STR) permits, and violating HOAs can result in major fines.",
      steps: [
        { title: "Market & Feasibility Audit", desc: "Use tools like AirDNA to check average occupancy, nightly rates, and municipal regulations in your ZipCode." },
        { title: "Secure STR Permits & Insurance", desc: "Apply for local city licenses and purchase short-term rental-specific liability insurance." },
        { title: "Furnish & Style (Cozy Aesthetic)", desc: "Buy durable, photogenic furniture. Focus on comfortable mattresses, high-speed WiFi, and guest amenities (coffee, shampoo)." },
        { title: "Professional Photography & Copy", desc: "Hire a real estate photographer. Write an engaging title focusing on unique features (e.g., 'Cozy Oasis with Hot Tub')." },
        { title: "Build the Listing & Pricing Strategy", desc: "Create your Airbnb account, set clear house rules, and turn on dynamic pricing (PriceLabs or Wheelhouse) to maximize high-season occupancy." },
        { title: "Automate Cleaning & Communication", desc: "Partner with local cleaners via TurnoverBnB to auto-schedule cleaning sessions based on checkout times." }
      ]
    },
    {
      id: "pod",
      name: "Print-on-Demand (POD)",
      timeframe: "1 - 2 weeks",
      estEarnings: "$200 - $3,000 / month",
      bestFor: "Creatives and designers who want zero inventory risk.",
      proTip: "Don't design for everyone. Focus on hyperspecific niches (e.g., 'Retro Coffee-Loving Software Engineers'). People buy items that represent their specific identity.",
      pitfall: "Copying trademarked text or copyrighted art. Etsy and Amazon will permanently ban stores that violate IP laws.",
      steps: [
        { title: "Select Niches & Run Keyword Audits", desc: "Use Etsy Search or Google Trends to find low-competition, passionate niches (hobbies, professions, humor)." },
        { title: "Create Printify or Printful Accounts", desc: "Register with a POD supplier and link it to your sales channel (Etsy shop, Shopify, or eBay)." },
        { title: "Draft Eye-Catching Designs", desc: "Create transparent PNG designs (300 DPI) using Canva, Illustrator, or Figma. Focus on clean typography and aesthetic color palettes." },
        { title: "Publish Listings with SEO Tags", desc: "Optimize title keywords, description tags, and upload realistic mockups (Placeit) so customers see how the item looks in real life." },
        { title: "Promote on Pinterest & TikTok", desc: "Create aesthetic boards showing lifestyle mockups or record short-form video hooks of the products." },
        { title: "Iterate Based on Traffic Data", desc: "Check which listings get views/favorites, double down on what works, and phase out low-performing designs." }
      ]
    },
    {
      id: "dropshipping",
      name: "Dropshipping Business",
      timeframe: "2 - 3 weeks",
      estEarnings: "$500 - $10,000 / month",
      bestFor: "Digital marketers ready to run paid advertisements.",
      proTip: "Order a sample of the product to your house first. You must verify shipping times, product build quality, and record custom video ad creatives.",
      pitfall: "Relying on low-quality suppliers with 30-day shipping times. Modern consumers expect delivery in under 10 days; long waits lead to refunds and bank chargebacks.",
      steps: [
        { title: "Perform Competitor & TikTok Research", desc: "Find viral products with high problem-solving value or a strong wow-factor using TikTok's Ad Library." },
        { title: "Source Suppliers on Alibaba or Zendrop", desc: "Establish agreements with reliable suppliers offering fast-shipping lines (5-10 days to US/Europe)." },
        { title: "Construct Shopify Landing Pages", desc: "Set up a clean, single-product Shopify store. Use trust badges, customer reviews, and clear return policies." },
        { title: "Produce High-Clickrate Video Ads", desc: "Record or edit 3 unique hook variations (first 3 seconds) and a solid call-to-action for Facebook/TikTok Ads." },
        { title: "Launch Paid Marketing Tests", desc: "Run budget testing campaigns ($20-50/day) targeting broad interest matches. Analyze CTR (aim for >2%) and CPA." },
        { title: "Optimize Cart & Scale Budgets", desc: "Use upsells to increase Average Order Value (AOV) and gradually increase ad spend on profitable target assets." }
      ]
    },
    {
      id: "digital-products",
      name: "Digital Products",
      timeframe: "2 - 6 weeks",
      estEarnings: "$200 - $10,000 / month",
      bestFor: "Creators who want to sell their own downloads — ebooks, printables, templates, and courses (not affiliate links).",
      proTip: "Ship one small product fast (a 10-page printable or short ebook) before building a big course. Book publishing is a flagship Digital example — kids can start with storybooks with a parent.",
      pitfall: "Mixing Digital Products with Affiliate Marketing. Your own downloads are Digital; promoting other brands’ products for commissions is Affiliate — keep the lanes separate.",
      steps: [
        {
          title: "Pick One Digital Offer",
          desc: "Ebook, printable pack, planner, template kit, or mini-course. Write a one-sentence promise for the buyer — one clear line naming who it’s for and the result they get (e.g. “A 10-page budget planner that helps busy parents track spending in 10 minutes a week”).",
        },
        { title: "Create the Asset", desc: "Draft in Canva/Google Docs/Notion. For books, follow the Book Publishing guide (KDP / print + ebook)." },
        { title: "Package & Price", desc: "Export clean PDFs or file packs. Price a starter offer ($7–$27) so buyers can say yes quickly." },
        { title: "Set Up Delivery", desc: "Use Gumroad, Payhip, Stan, or Shopify digital downloads so purchase → instant delivery works without you emailing files." },
        { title: "Landing Page & Proof", desc: "One clear page: who it’s for, what’s inside, a sample preview, and a buy button. Add 2–3 testimonials when you have them." },
        { title: "Launch & Iterate", desc: "Share with your list/community, note what questions buyers ask, then improve the product or add a sequel pack." },
      ],
    },
    {
      id: "affiliate",
      name: "Affiliate Marketing",
      timeframe: "3 - 6 weeks",
      estEarnings: "$100 - $15,000 / month",
      bestFor: "Creators who share products from other companies and earn a commission when someone buys through their unique link.",
      proTip: "Start with programs that are easy to join (Amazon Associates, TikTok Shop / Creator, a brand you already use). Recurring SaaS commissions are a later upgrade — not day one.",
      pitfall: "Spamming bare links. Platforms and buyers expect honest reviews, tutorials, or demos — and a clear affiliate disclosure.",
      steps: [
        {
          title: "Pick Your Niche + Where You’ll Share",
          desc: "Choose a topic you know (beauty, gadgets, home, software, etc.) and a place you’ll post — TikTok, YouTube, Instagram, a blog, or email.",
        },
        {
          title: "Join 1–2 Beginner Programs & Get Your Links",
          desc: "Sign up for programs that give you tracking links — Amazon Associates, TikTok Shop / Creator Marketplace, Shopify apps, POD suppliers, dropshipping brands, or software partners. You promote their products; they pay you a commission on clicks that convert.",
        },
        {
          title: "Create Value-First Content",
          desc: "Film or write honest reviews, demos, and how-tos. Mention the product naturally and include your affiliate link (same idea as creators on YouTube/TikTok).",
        },
        {
          title: "Disclose & Comply",
          desc: "Say clearly that links are affiliate links. Follow each platform’s and FTC disclosure rules so you stay in good standing.",
        },
        {
          title: "Grow With Comparisons & Email (Optional)",
          desc: "Add comparison posts (“A vs B”) and a simple freebie + email follow-up once you have a few wins.",
        },
        {
          title: "Track What Converts",
          desc: "Check which posts and links earn commissions. Double down on winners; pause weak ones.",
        },
      ],
    },
    {
      id: "amazon",
      name: "Amazon FBA (Fulfillment by Amazon)",
      timeframe: "4 - 8 weeks",
      estEarnings: "$1,000 - $25,000 / month",
      bestFor: "Aspiring physical brand builders with capital ready to invest.",
      proTip: "Perform deep product differentiation. Don't sell the exact same item as 50 other listings. Bundle it, change the color, improve the packaging, or fix a common complaint found in negative competitor reviews.",
      pitfall: "Running out of stock during your launch phase. Amazon's organic ranking algorithm penalizes listings that go out of stock, destroying your PPC progress.",
      steps: [
        {
          title: "Understand Amazon FBA in Plain English",
          desc: "You choose a product; a manufacturer makes it; Amazon stores, packs, ships, and handles returns. Plan for samples plus a small first inventory order (often $1,000+). This guide is for beginners — paid tools come later.",
        },
        {
          title: "Validate a Simple Product Idea (Free First)",
          desc: "Use Amazon search, Best Seller ranks, and customer reviews before paying for Jungle Scout or Helium 10. Look for steady demand that isn’t overcrowded with hundreds of near-identical listings.",
        },
        {
          title: "Source Suppliers & Request Samples",
          desc: "Contact reputable suppliers (often via Alibaba). Negotiate pricing and packaging, then order samples before a bulk shipment.",
        },
        {
          title: "Open Seller Central & Prep Your Business Basics",
          desc: "Create an Amazon Seller account. Set up a simple business structure (many start with an LLC) and gather tax/ID info Amazon asks for.",
        },
        {
          title: "Ship Inventory to Amazon & Build Your Listing",
          desc: "Use a freight forwarder or supplier DDP option to send goods to Amazon. Write clear title/bullets/photos that explain benefits, not just features.",
        },
        {
          title: "Launch Ads & Early Reviews Carefully",
          desc: "Start small Sponsored Products ads on your main keywords. Use Amazon Vine or ethical early-review paths for your first reviews — never buy fake ones.",
        },
      ],
    },
    {
      id: "social",
      name: "Social Influencer & Creator",
      timeframe: "4 - 12 weeks",
      estEarnings: "$500 - $20,000 / month",
      bestFor: "Charismatic storytellers who enjoy editing and content creation.",
      proTip: "Post consistently at the same time every day. Algorithms favor accounts with predictable publishing cadences. Batch-create content on weekends to stay ahead.",
      pitfall: "Buying fake followers. Brands run analytics checks (like HypeAuditor) before sponsorships. Low engagement rates (under 1.5%) reveal fake metrics instantly.",
      steps: [
        { title: "Define Content Pillars & Target Viewer", desc: "Determine your theme (e.g., personal finance tips for Gen Z, coding tutorials, style makeovers)." },
        { title: "Create Channel Accounts & Bios", desc: "Optimize profiles across TikTok, IG, and YouTube Shorts. Use a high-quality headshot and clear, benefits-driven bio description." },
        { title: "Batch-Record Short-form Videos", desc: "Script and film 10-15 short-form clips. Start with strong hooks (first 2 seconds), add subtitles, and keep edits fast-paced." },
        { title: "Implement Daily Publishing Cadence", desc: "Post 1-2 videos daily. Use trending audio tracks, niche-relevant tags, and pinned comments to start discussion." },
        { title: "Assemble Sponsor Media Kits", desc: "Create a 1-page PDF showing audience demographics (age, location), engagement rate, and past video metrics." },
        { title: "Sign Brand Sponsor Contracts", desc: "Register on creator marketplaces (TikTok Creator Marketplace, Cohley) and pitch brands direct sponsorship deals." }
      ]
    },
    {
      id: "web-leads",
      name: "Local Website Lead Finder",
      timeframe: "1 - 3 weeks",
      estEarnings: "$800 - $6,000 / month",
      bestFor: "People who like outreach, local business, and light web builds.",
      proTip: "Lead with a free 60-second screen recording of their broken mobile site or missing Google Business Profile. Shame-free proof closes faster than a generic sales pitch.",
      pitfall: "Building a full site before a signed deposit. Scope creep kills margins — sell a fixed package (audit → 5-page site → hosting) with clear revision limits.",
      steps: [
        { title: "Pick a ZipCode + Niche Lane", desc: "Choose 1–2 niches (dentists, HVAC, salons, contractors) within a 20-mile radius so your samples and outreach feel local." },
        { title: "Build a Lead List", desc: "Use Google Maps / Bing Places to find businesses with no site, a 2015 WordPress theme, or no mobile layout. Log name, phone, URL, and pain notes." },
        { title: "Run Quick Website Audits", desc: "Score speed, mobile, contact CTA, and booking path. Turn each into a 1-page PDF or Loom with 3 fixes and a package price." },
        { title: "Outreach Cadence", desc: "Call, text, or drop by with the audit. Aim for 20 touches/day. Offer a low-ticket audit ($150–$400) as the door opener." },
        { title: "Build & Sell Packages", desc: "Deliver a clean Cloudflare/Framer/WordPress site with booking link, NAP consistency, and basic SEO. Collect 50% deposit up front." },
        { title: "Stack Recurring Revenue", desc: "Add monthly hosting + edits ($49–$149). Ask every client for 2 referrals and one Google review." }
      ]
    },
    {
      id: "ai-assets",
      name: "AI Asset Studio",
      timeframe: "1 - 2 weeks",
      estEarnings: "$500 - $5,000 / month",
      bestFor: "Creatives who want productized design work without agency overhead.",
      proTip: "Sell kits, not hours: Logo Pack, Launch Creative Pack, 30-Day Social Kit. Fixed prices beat hourly every time.",
      pitfall: "Delivering raw AI dumps with no brand polish. Clients pay for taste — always refine typography, spacing, and color consistency before handoff.",
      steps: [
        {
          title: "Choose Your Design Tools",
          desc: "Pick any AI image tool you can access (ChatGPT/Gemini image, Adobe Firefly, Midjourney, etc.) plus a free or paid editor (Canva, Photopea, or Figma). Build a small prompt library for logo concepts, ad creatives, and social templates. Save brand colors/fonts once so every kit looks consistent.",
        },
        { title: "Define 3 Productized Kits", desc: "Write clear deliverables, turnaround (3–7 days), and prices ($150 / $450 / $900). Put them on a simple order form." },
        { title: "Build Portfolio Samples", desc: "Make 6 before/after or brand-kit mockups in niches you want (cafés, coaches, contractors)." },
        { title: "Find Clients", desc: "Pitch local website leads, Etsy sellers, and Instagram businesses. Offer a starter kit at a launch discount for testimonials." },
        { title: "Delivery System", desc: "Use a shared folder (Drive/Dropbox) with source files, web exports, and a mini brand guide PDF." },
        { title: "Upsell & Retain", desc: "Monthly creative retainer (8–12 assets) or pair with website packages for higher ticket closes." }
      ]
    },
    {
      id: "property-mgmt",
      name: "Property Management",
      timeframe: "3 - 6 weeks",
      estEarnings: "$1,000 - $8,000 / month",
      bestFor: "Operators with Airbnb/STR experience who want recurring door-based income.",
      proTip: "Start with 1–2 doors for friends/family at a clear fee (e.g. 20% of STR revenue). Document every SOP before you pitch strangers.",
      pitfall: "Mixing personal funds with owner money and skipping written agreements. Use a simple PM contract, separate accounts, and itemized owner reports monthly.",
      steps: [
        { title: "Choose LTR vs STR Lane", desc: "Long-term rentals = steadier; STR = higher % fees and more turns. Pick one to start, especially if you already know Airbnb ops." },
        { title: "Legal & Insurance Basics", desc: "Check licensing, write a one-page service agreement, and confirm liability coverage for managed properties." },
        { title: "Vendor Bench", desc: "Lock in cleaner, handyman, landscaper, and locksmith with after-hours contacts. Your speed is the product." },
        { title: "Owner Pitch Deck", desc: "Show projected net, your fee, communication cadence, and a sample owner dashboard/report." },
        { title: "Onboard First Doors", desc: "Photograph, list, price, and set guest/tenant messaging templates. Automate turnover scheduling where possible." },
        { title: "Scale with SOPs", desc: "Guides for every turn, weekly owner update, and a waitlist for new doors before you hire help." }
      ]
    },
    {
      id: "handyman",
      name: "Handyman Services",
      timeframe: "1 - 2 weeks",
      estEarnings: "$800 - $5,000 / month",
      bestFor: "Hands-on folks with basic tools who want local cash jobs fast.",
      proTip: "Specialize in punch lists for Airbnb hosts and property managers — they need reliable same-week help and refer constantly.",
      pitfall: "Taking jobs outside your skill/insurance lane (electrical, structural, plumbing permits). Know local rules and subcontract specialty work.",
      steps: [
        { title: "Define Your Service Menu", desc: "List 8–12 jobs you can do well: TV mounts, paint touch-ups, furniture assembly, faucet swaps, drywall patches." },
        { title: "Tool & Insurance Check", desc: "Assemble a starter kit and get liability insurance. Decide truck/van vs borrow access." },
        { title: "Pricing Sheet", desc: "Hourly + trip fee, or flat rates for common jobs. Post clearly so quotes are fast." },
        { title: "Get Listed Locally", desc: "Nextdoor, Facebook Marketplace/groups, Angi, and Google Business Profile with before/after photos." },
        { title: "Warm Outreach", desc: "Message local PMs, Airbnb hosts, and landlords with availability windows and a sample punch-list rate." },
        { title: "Systems for Repeat Work", desc: "Simple invoice (Wave/Stripe), photo proof after every job, and a quarterly maintenance offer." }
      ]
    },
    {
      id: "rideshare",
      name: "Rideshare (Uber / Lyft)",
      timeframe: "3 - 7 days",
      estEarnings: "$600 - $3,500 / month",
      bestFor: "Drivers who want flexible hours and immediate payouts.",
      proTip: "Treat it like shifts, not random driving. Airport, Friday/Saturday nights, and event end-times beat random midday cruising.",
      pitfall: "Ignoring true costs — gas, maintenance, depreciation, and taxes. Track every mile and set a minimum $/hour before you go online.",
      steps: [
        { title: "Eligibility & Vehicle Check", desc: "Confirm year/model requirements, insurance, background check, and required docs for Uber/Lyft in your city." },
        { title: "App Onboarding", desc: "Complete signup, vehicle inspection if needed, and set up instant pay / tax info." },
        { title: "Cost Baseline", desc: "Calculate break-even $/hour including gas and wear. Decide your minimum acceptable net." },
        { title: "Peak Window Plan", desc: "Map your first 4 weeks of shifts (airport, nightlife, stadium). Use AI Timing Scout ideas for ZipCode blocks." },
        { title: "Safety & Ratings Ops", desc: "Keep car clean, water optional, navigation ready. Protect a 4.9+ rating — it unlocks better quests." },
        { title: "Optimize & Stack", desc: "Compare Uber vs Lyft quests weekly; consider food delivery as a filler between ride lulls." }
      ]
    },
    {
      id: "food-delivery",
      name: "DoorDash / Uber Eats",
      timeframe: "1 - 5 days",
      estEarnings: "$400 - $2,500 / month",
      bestFor: "Anyone needing low-barrier income with a bike, scooter, or car.",
      proTip: "Multi-app during dinner rush (Dash + Eats) and decline long deadhead trips. Hotspot parking near restaurant clusters beats chasing pins across town.",
      pitfall: "Accepting every order. Long miles for low tips destroy hourly rate — learn your market's decline discipline early.",
      steps: [
        { title: "Pick Your Apps", desc: "Sign up for DoorDash and Uber Eats (add Grubhub if strong locally). Complete background checks." },
        { title: "Gear Up", desc: "Insulated bag, phone mount, portable charger, and a simple mileage tracker." },
        { title: "Zone Recon", desc: "Scout 2–3 restaurant-dense zones near you. Note parking rules and peak kitchen hours." },
        { title: "Shift Schedule", desc: "Commit to dinner (5–9pm) + weekend lunch for 2 weeks before judging income." },
        { title: "Acceptance Discipline", desc: "Set rules (e.g. $1.50+/mile, under 6 miles, stacked only if path aligns)." },
        { title: "Pair with Timing Scout", desc: "Use AI Timing Scout notes for weather, events, and payday weekends to lift average hourly." }
      ]
    },
    {
      id: "ai-timing",
      name: "AI Timing Scout",
      timeframe: "1 - 2 weeks",
      estEarnings: "$300 - $3,000 / month",
      bestFor: "Research-minded Side Hustlers who want to boost gig earnings or sell hotspot playbooks.",
      proTip: "Publish a weekly ZipCode brief (Fri for weekend, Sun for weekdays). Drivers pay for timely, local specificity — not generic national tips.",
      pitfall: "Overpromising guaranteed earnings. Frame guides as strategy + data, not income promises, and update them when markets shift.",
      steps: [
        { title: "Pick a Market", desc: "Choose your metro or a nearby city with dense rideshare/delivery. Define 5–8 ZipCode clusters." },
        { title: "Data Inputs", desc: "Pull events calendars, airport schedules, weather, sports, concerts, and payday patterns. Feed into ChatGPT/Claude with a fixed prompt template." },
        { title: "Build the Playbook Template", desc: "For each daypart: best ZipCodes, avoid zones, expected surge windows, and parking notes." },
        { title: "Validate Live", desc: "Drive or deliver 2 weeks while logging actual $/hour vs predictions. Refine the model." },
        { title: "Monetize Path A (Personal)", desc: "Use the scout privately to raise your own gig hourly rate." },
        { title: "Monetize Path B (Sell)", desc: "Sell weekly PDF/Telegram briefs to local drivers ($15–$49). Collect testimonials and iterate." }
      ]
    },
    {
      id: "ai-agents",
      name: "AI Agents for Side Hustlers",
      timeframe: "2 - 4 weeks",
      estEarnings: "$1,000 - $10,000 / month",
      bestFor: "Builders who can productize agent setups (lead find, scheduling, research) for other Side Hustlers.",
      proTip: "Sell outcomes, not tools: '20 local website leads every Monday' beats 'custom GPT.' Package agents with a short how-to and a care retainer.",
      pitfall: "Building one-off snowflakes for every client. Standardize 3 agent products with clear inputs/outputs before custom work.",
      steps: [
        { title: "Define 3 Agent Products", desc: "e.g. Local Lead Scout, Booking/Follow-up Agent, Research Brief Agent. Write I/O, tools, and success metrics for each." },
        { title: "Build Reference Agents", desc: "Use your Muntie Ev / Antigravity stack (or Cursor + APIs) to ship working demos with sample runs." },
        { title: "How-to Curriculum", desc: "Document soul/identity prompts, memory, and command panels so clients (or you) can maintain agents." },
        { title: "Pricing & Packaging", desc: "Setup fee ($500–$2,500) + monthly care ($99–$499). Offer a starter workshop seat via Training Circles." },
        { title: "Find Buyers", desc: "Pitch GYSH community, local website closers, PMs, and creators who drown in repetitive tasks." },
        { title: "Deliver & Retain", desc: "Onboard with a recorded walkthrough, weekly run logs, and a change-request cadence so retainers stick." }
      ]
    },
    {
      id: "book-publishing",
      name: "Book Publishing",
      timeframe: "4 - 12 weeks",
      estEarnings: "$200 - $8,000 / month",
      bestFor: "A Digital side hustle for writers and storytellers (Tina's lane); kids can publish storybooks with a parent.",
      proTip: "Ship a minimum viable book first — clean formatting, strong cover, and a clear reader promise — then iterate with ads and a series plan. Don't wait for perfect.",
      pitfall: "Spending months on a cover and zero weeks on distribution or launch. KDP + IngramSpark + a simple email/landing funnel beats a pretty unread manuscript.",
      steps: [
        {
          title: "Choose Format & Audience",
          desc: "Kids picture book, coloring books, journals, chapter series, nonfiction guide, or memoir. Write a one-sentence promise and target reader age — one clear line of who it’s for and the outcome (e.g. “A bedtime picture book that helps ages 3–6 feel brave about the first day of school”).",
        },
        { title: "Manuscript & Edit Pass", desc: "Finish a draft, then do a structure edit + proofread (beta readers or a freelance editor for polish)." },
        { title: "Cover & Interior Layout", desc: "Commission or design a market-fit cover; format print + ebook interiors (Vellum, Atticus, or a formatter)." },
        { title: "Accounts & ISBNs", desc: "Set up KDP (and IngramSpark for wide print). Decide KDP Select vs wide ebook distribution." },
        { title: "Upload & Publish", desc: "Upload files, set pricing, categories, and keywords. Order a proof copy before going live." },
        { title: "Launch & Royalties Loop", desc: "Announce via social/email, run a soft promo week, track royalties, and outline book two while momentum is warm." }
      ]
    }
  ];

  const activeGuide = guides.find(g => g.id === activeGuideId) || guides[0];

  // Calculate completion percentage for the active guide
  const activeStepsCount = activeGuide.steps.length;
  const activeCompletedSteps = activeGuide.steps.filter((_, idx) => 
    completedSteps[`${activeGuide.id}-${idx}`]
  ).length;
  const progressPercent = activeStepsCount > 0 ? (activeCompletedSteps / activeStepsCount) * 100 : 0;

  const toggleStep = (stepIdx: number) => {
    if (!unlocked) return;
    const key = `${activeGuide.id}-${stepIdx}`;
    setCompletedSteps((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };
      void saveMemberProgress("launch_guide_steps", next).catch(() => {
        /* surface via next reload; avoid blocking UI */
      });
      return next;
    });
  };

  if (!unlocked) {
    return (
      <div className="launch-guides-catalog" data-testid="launch-guides-locked">
        {onBackToCatalog && (
          <button type="button" className="btn btn-outline" onClick={onBackToCatalog} style={{ width: "fit-content", marginBottom: 12 }}>
            ← Back to all guides
          </button>
        )}
        <section className="glass launch-guides-catalog-banner">
          <div>
            <div className="free-guide-card-badges" style={{ marginBottom: 8 }}>
              <span className={`glow-badge ${guideIsFree ? "free" : "pink"}`}>
                {guideTierBadgeLabel(activeMinTier)}
              </span>
              <MembershipLockBadge
                minTier={activeMinTier}
                unlocked={false}
                data-testid={`guide-lock-badge-${activeGuide.id}`}
              />
            </div>
            <h2 style={{ fontSize: "1.35rem", color: "var(--charcoal)", margin: "0 0 6px" }}>
              {activeGuide.name} guide
            </h2>
            <p style={{ margin: 0, color: "var(--text-primary)", fontSize: "1rem", maxWidth: 560 }}>
              {activeGuide.bestFor} {guideTierMembershipNote(activeMinTier)}.
              {guideIsFree ? ` ${FREE_GUIDE_SIGNUP_NOTE}.` : ""}
            </p>
          </div>
          <div className="launch-guides-catalog-actions">
            {onGoToLogin && (
              <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
                <LogIn size={16} /> Sign in
              </button>
            )}
            <JoinToUnlockCta access={activeAccess} onJoin={onGoToJoin} onUpgrade={onGoToJoin} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="launch-guide-detail" data-testid="launch-guide-detail">
      {onBackToCatalog && (
        <div className="launch-guide-detail__back">
          <button type="button" className="btn btn-outline" onClick={onBackToCatalog}>
            ← Back to all guides
          </button>
        </div>
      )}

      {/* Sidebar Selector */}
      <nav className="launch-guide-detail__sidebar" aria-label="Select guide">
        <span className="launch-guide-detail__sidebar-label">Select Guide</span>
        {guides.map((g) => {
          const gMin = adultGuideMinTier(g.id);
          const gAccess = resolveGuideAccess({
            isMember: isLoggedIn,
            membershipTier: effectiveTier,
            minTier: gMin,
          });
          const gFree = gMin === "free";
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setActiveGuideId(g.id);
                setStepsOpen(false);
              }}
              className={`nav-link-btn launch-guide-detail__nav-btn${activeGuideId === g.id ? " active" : ""}`}
              style={{ opacity: gAccess.unlocked ? 1 : 0.75 }}
            >
              <span className="launch-guide-detail__nav-name">{g.name}</span>
              <span className="launch-guide-detail__nav-meta">
                <span className={`glow-badge ${gFree ? "free" : "pink"} launch-guide-detail__tier`}>
                  {guideTierShortLabel(gMin)}
                </span>
                {!gAccess.unlocked && (
                  <MembershipLockBadge
                    minTier={gMin}
                    unlocked={false}
                    data-testid={`guide-lock-badge-nav-${g.id}`}
                  />
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Guide Content */}
      <div className="glass launch-guide-detail__main">
        {/* Header summary */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px", borderBottom: "1px solid var(--border-color)", paddingBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px 12px", marginBottom: "6px" }}>
              <span className={`glow-badge ${guideIsFree ? "free" : "purple"}`} style={{ marginBottom: 0 }}>
                {guideTierBadgeLabel(activeMinTier)}
              </span>
              <h2 style={{ fontSize: "1.75rem", color: "var(--charcoal)", margin: 0, lineHeight: 1.2 }}>
                {activeGuide.name} Setup
              </h2>
            </div>
            <p style={{ color: "var(--text-primary)", fontSize: "1rem", maxWidth: "600px" }}>{activeGuide.bestFor}</p>
          </div>

          <div style={{ 
            background: "rgba(255,255,255,0.01)", 
            padding: "16px", 
            borderRadius: "12px", 
            border: "1px solid var(--border-color)",
            fontSize: "0.95rem",
            minWidth: "220px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}><Coins size={14} /> Startup Time:</span>
              <strong style={{ color: "var(--charcoal)" }}>{activeGuide.timeframe}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}><TrendingUp size={14} /> Est. Return:</span>
              <strong style={{ color: "var(--accent-emerald)" }}>{activeGuide.estEarnings}</strong>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "8px" }}>
            <span>Launch Roadmap Progress</span>
            <span style={{ fontWeight: 700, color: progressPercent === 100 ? "var(--accent-emerald)" : "var(--charcoal)" }}>
              {activeCompletedSteps} of {activeStepsCount} Completed ({Math.round(progressPercent)}%)
            </span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ 
              width: `${progressPercent}%`, 
              height: "100%", 
              background: progressPercent === 100 ? "var(--grad-emerald)" : "var(--grad-primary)",
              borderRadius: "9999px",
              transition: "width var(--transition-normal)"
            }} />
          </div>
        </div>

        {/* Checklist Steps — collapsed by default */}
        <div style={{ marginBottom: "32px" }}>
          <button
            type="button"
            className="kids-guide-steps-toggle"
            onClick={() => setStepsOpen((o) => !o)}
            aria-expanded={stepsOpen}
            data-testid="launch-guide-steps-toggle"
          >
            {stepsOpen
              ? "Hide steps"
              : `Show ${activeStepsCount} step${activeStepsCount === 1 ? "" : "s"}`}
          </button>
          {stepsOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: 12 }}>
              {activeGuide.steps.map((step, idx) => {
                const isDone = !!completedSteps[`${activeGuide.id}-${idx}`];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`checklist-item ${isDone ? "completed" : ""}`}
                  >
                    <div className="checklist-checkbox">
                      {isDone && <Check size={12} />}
                    </div>
                    <div className="checklist-text">
                      <strong
                        style={{
                          color: isDone ? "var(--text-muted)" : "var(--charcoal)",
                          fontSize: "0.95rem",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {idx + 1}. {step.title}
                      </strong>
                      <span
                        style={{
                          color: isDone ? "var(--text-muted)" : "var(--text-secondary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {step.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pro Tip & Pitfall callouts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ 
            padding: "20px", 
            borderRadius: "12px", 
            border: "1px solid rgba(16, 185, 129, 0.15)", 
            background: "rgba(16, 185, 129, 0.015)" 
          }}>
            <h4 style={{ color: "var(--accent-emerald)", fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Award size={16} /> Professional Secret
            </h4>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.6 }}>{activeGuide.proTip}</p>
          </div>

          <div style={{ 
            padding: "20px", 
            borderRadius: "12px", 
            border: "1px solid rgba(239, 68, 68, 0.15)", 
            background: "rgba(239, 68, 68, 0.015)" 
          }}>
            <h4 style={{ color: "#ef4444", fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <AlertTriangle size={16} /> High-Risk Pitfall
            </h4>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.6 }}>{activeGuide.pitfall}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: "32px", borderTop: "1px solid var(--border-color)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
            Ready to calculate your customized returns?
          </span>
          <button 
            onClick={() => onGoToCalculator(activeGuide.id)}
            className="btn btn-outline"
            style={{ fontSize: "0.95rem", gap: "6px" }}
          >
            Launch Revenue Calculator <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
};
