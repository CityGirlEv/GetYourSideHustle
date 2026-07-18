import React, { useEffect, useState } from "react";
import { 
  Check, 
  AlertTriangle, 
  Award,
  ArrowRight,
  TrendingUp,
  Coins,
  Lock,
  LogIn,
  UserPlus,
} from "lucide-react";
import { fetchMemberProgress, saveMemberProgress } from "../lib/gysh-member-progress";
import { LAUNCH_GUIDES } from "../lib/launch-guides";

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
  onGoToJoin?: () => void;
  onGoToLogin?: () => void;
  onBackToCatalog?: () => void;
}

export const StepByStepGuides: React.FC<StepByStepGuidesProps> = ({ 
  selectedHustleId = "airbnb",
  onGoToCalculator,
  isLoggedIn = false,
  onGoToJoin,
  onGoToLogin,
  onBackToCatalog,
}) => {
  const [activeGuideId, setActiveGuideId] = useState<string>(selectedHustleId);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const freeGuideIds = new Set(LAUNCH_GUIDES.filter((g) => g.free).map((g) => g.id));
  const guideIsFree = freeGuideIds.has(activeGuideId);
  const unlocked = isLoggedIn || guideIsFree;

  useEffect(() => {
    setActiveGuideId(selectedHustleId);
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
        { title: "Market & Feasibility Audit", desc: "Use tools like AirDNA to check average occupancy, nightly rates, and municipal regulations in your ZIP code." },
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
      id: "affiliate",
      name: "Affiliate Marketing",
      timeframe: "3 - 6 weeks",
      estEarnings: "$100 - $15,000 / month",
      bestFor: "Writers, bloggers, and review content creators.",
      proTip: "Focus on promoting high-ticket SaaS tools (software with monthly subscriptions). They offer recurring commissions, meaning you get paid every month the user stays.",
      pitfall: "Spamming links everywhere. Without providing genuine educational value or detailed tutorials, social platforms will block your posts and people won't buy.",
      steps: [
        { title: "Choose a Domain / Industry Vertical", desc: "Pick a niche you understand (e.g., marketing tools, fitness tech, personal finance) to build credibility." },
        { title: "Apply to Premium Networks", desc: "Join Amazon Associates, ClickBank, Impact.com, or individual SaaS partner programs directly." },
        { title: "Launch Content Hubs", desc: "Establish a blog, YouTube channel, or email list to host your guides, comparison sheets, and tutorials." },
        { title: "Create Comparison & Review Articles", desc: "Write exhaustive reviews (e.g., 'Tool A vs Tool B: The Honest Truth'). Focus on resolving user query search intent." },
        { title: "Set Up Lead Magnets & Email Funnels", desc: "Collect emails using a free PDF guide. Follow up with value-first automated newsletters containing affiliate solutions." },
        { title: "Monitor CTR & Conversion Analytics", desc: "Track which landing pages drive clicks. Optimize buttons and call-outs to increase affiliate link CTR." }
      ]
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
        { title: "Perform Junglescout/Helium10 Audits", desc: "Find high-volume, low-review niches with steady year-round demand." },
        { title: "Source Suppliers & Request Samples", desc: "Contact gold-rated suppliers on Alibaba. Negotiate pricing, packaging customization, and order sample sets." },
        { title: "Register Amazon Seller Central", desc: "Establish your business entity (LLC), apply for an Amazon Seller account, and register your trademark for brand registry." },
        { title: "Arrange Freight Shipping (FOB/DDP)", desc: "Coordinate with a freight forwarder to ship goods from the manufacturer directly to Amazon fulfillment centers." },
        { title: "Build Optimized Product Detail Pages", desc: "Create high-converting infographics, write bullet points explaining benefits, and upload 3D render images." },
        { title: "Launch PPC & Review Campaigns", desc: "Run Sponsored Products ads targeting high-intent keywords. Use Amazon Vine to secure your first 5-10 trusted customer reviews." }
      ]
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
        { title: "Pick a ZIP + Niche Lane", desc: "Choose 1–2 niches (dentists, HVAC, salons, contractors) within a 20-mile radius so your samples and outreach feel local." },
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
        { title: "Set Up Your AI Stack", desc: "Pick Midjourney/Flux + Canva Pro or Figma. Create a prompt library for logos, ads, and social templates." },
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
        { title: "Peak Window Plan", desc: "Map your first 4 weeks of shifts (airport, nightlife, stadium). Use AI Timing Scout ideas for ZIP blocks." },
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
      proTip: "Publish a weekly ZIP brief (Fri for weekend, Sun for weekdays). Drivers pay for timely, local specificity — not generic national tips.",
      pitfall: "Overpromising guaranteed earnings. Frame guides as strategy + data, not income promises, and update them when markets shift.",
      steps: [
        { title: "Pick a Market", desc: "Choose your metro or a nearby city with dense rideshare/delivery. Define 5–8 ZIP clusters." },
        { title: "Data Inputs", desc: "Pull events calendars, airport schedules, weather, sports, concerts, and payday patterns. Feed into ChatGPT/Claude with a fixed prompt template." },
        { title: "Build the Playbook Template", desc: "For each daypart: best ZIPs, avoid zones, expected surge windows, and parking notes." },
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
      bestFor: "Writers and storytellers (Tina's lane) ready to turn manuscripts into royalty income.",
      proTip: "Ship a minimum viable book first — clean formatting, strong cover, and a clear reader promise — then iterate with ads and a series plan. Don't wait for perfect.",
      pitfall: "Spending months on a cover and zero weeks on distribution or launch. KDP + IngramSpark + a simple email/landing funnel beats a pretty unread manuscript.",
      steps: [
        { title: "Choose Format & Audience", desc: "Kids picture book, chapter series, nonfiction guide, or memoir. Write a one-sentence promise and target reader age." },
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
            <span className="glow-badge pink" style={{ marginBottom: 8 }}>Members only</span>
            <h2 style={{ fontSize: "1.35rem", color: "var(--charcoal)", margin: "0 0 6px" }}>
              {activeGuide.name} guide
            </h2>
            <p style={{ margin: 0, color: "var(--text-primary)", fontSize: "1rem", maxWidth: 560 }}>
              {activeGuide.bestFor} Full step-by-step details unlock when you sign in as a member.
            </p>
          </div>
          <div className="launch-guides-catalog-actions">
            {onGoToLogin && (
              <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
                <LogIn size={16} /> Sign in
              </button>
            )}
            {onGoToJoin && (
              <button type="button" className="btn btn-primary" onClick={onGoToJoin}>
                <UserPlus size={16} /> Join GYSH
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "32px" }}>
      {onBackToCatalog && (
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="button" className="btn btn-outline" onClick={onBackToCatalog} style={{ width: "fit-content" }}>
            ← Back to all guides
          </button>
        </div>
      )}
      
      {/* Sidebar Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", paddingLeft: "8px" }}>
          Select Guide
        </span>
        {guides.map((g) => {
          const gFree = freeGuideIds.has(g.id);
          const gUnlocked = isLoggedIn || gFree;
          return (
          <button
            key={g.id}
            type="button"
            onClick={() => setActiveGuideId(g.id)}
            className={`nav-link-btn ${activeGuideId === g.id ? "active" : ""}`}
            style={{ padding: "10px 14px", fontSize: "1rem", opacity: gUnlocked ? 1 : 0.7 }}
          >
            {g.name}
            {gFree && <span className="glow-badge free" style={{ marginLeft: 6, fontSize: "0.9375rem", padding: "2px 8px" }}>Free</span>}
            {!gUnlocked && <Lock size={12} style={{ marginLeft: 6, flexShrink: 0 }} />}
          </button>
          );
        })}
      </div>

      {/* Main Guide Content */}
      <div className="glass" style={{ padding: "32px", borderRadius: "20px" }}>
        {/* Header summary */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px", borderBottom: "1px solid var(--border-color)", paddingBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px 12px", marginBottom: "6px" }}>
              <span className={`glow-badge ${guideIsFree ? "free" : "purple"}`} style={{ marginBottom: 0 }}>
                {guideIsFree ? "Free guide" : "Launch Guide"}
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

        {/* Checklist Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
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
                  <strong style={{ color: isDone ? "var(--text-muted)" : "var(--charcoal)", fontSize: "0.95rem", display: "block", marginBottom: "4px" }}>
                    {idx + 1}. {step.title}
                  </strong>
                  <span style={{ color: isDone ? "var(--text-muted)" : "var(--text-secondary)", fontSize: "0.95rem" }}>
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
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
