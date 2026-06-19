import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env file manually
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const FACEBOOK_POSTS = [
  {
    title: "Welcome to Part B Optimizer! Learn about Medicare Prior Authorization",
    excerpt: "Welcome post introducing the page and linking to our first Learning Center article.",
    body: `Welcome to the Part B Optimizer page! 🌟\n\nTurning 65 comes with a lot of decisions — and unfortunately, a lot of high-pressure sales calls. We’re here to change that.\n\nOur mission is simple: to provide calm, clear, and completely unbiased Medicare education. No sales pitches, no pushy agents, and no government affiliation — just honest resources to help you take control of your healthcare journey.\n\nTo kick things off, we’ve just published our very first Learning Center guide: "What Is Medicare Prior Authorization? A Plain-Language Overview." If you've ever wondered how prior authorizations work and how to protect yourself from surprise coverage denials, read our walkthrough here:\n\n👉 https://mypartb.com/learning-center/what-is-medicare-prior-authorization\n\nLike our page to follow along as we share weekly tips, checklists, and official resources.\n\nEducational purposes only. We do not sell insurance or solicit enrollments. We are not affiliated with or endorsed by Medicare, CMS, or any government agency.\n\n#MedicareEducation #Turning65 #MedicareSimplified #HealthcareTransparency`,
  },
  {
    title: "The Medigap Open Enrollment Window: Why Timing Matters",
    excerpt: "Share Article 2 and invite friends to follow our page.",
    body: `If you are new to Medicare Part B, you generally have a one-time six-month Medigap open enrollment window where guaranteed-issue rules protect you.\n\nMissing this window is one of the most common regrets we hear about, as you may face medical underwriting later if you try to switch to a supplemental plan.\n\nRead our plain-language guide on why timing is critical:\n👉 https://mypartb.com/learning-center/medigap-open-enrollment-window-explained\n\n📌 Help us spread the word! Invite friends or family members who are turning 65 to follow the Part B Optimizer page for transparent, non-sales education.\n\nEducational only. Verify your state's supplemental insurance rules.\n\n#MedicareEducation #Medigap #Turning65`,
  },
  {
    title: "A $0 premium is not the same as $0 total cost",
    excerpt: "Educational post linking to Article 3 on Medicare Advantage premiums.",
    body: `Many Medicare Advantage plans advertise a $0 monthly premium. Copays, deductibles, and out-of-network bills can still add up.\n\nCompare the full cost picture — not just the headline premium. Read our plain-language guide on what $0 premiums really mean:\n👉 https://mypartb.com/learning-center/medicare-advantage-zero-premium-explained\n\nEducational only — not a solicitation to enroll.\n\n#MedicareEducation #ComparePlans #MedicareAdvantage`,
  },
  {
    title: "Still working at 65? Check employer size first",
    excerpt: "Educational post on Medicare and employer coverage coordination.",
    body: `Turning 65 while you still have employer health coverage?\n\nBefore you defer Part B, confirm whether your employer has 20 or more employees — that detail changes whether Medicare is primary or secondary.\n\nEducational only. Verify your timeline with SSA and Medicare.gov.\n\n#MedicareEducation #Turning65`,
  },
  {
    title: "TV ads make Medicare sound simple — compare the documents",
    excerpt: "Reminder to read Evidence of Coverage, not just marketing perks.",
    body: `Dental and vision perks are easy to understand in Medicare ads. Networks, prior authorization, and cost-sharing rules often live deeper in the plan booklet.\n\nMatch ad claims to official plan documents before you choose.\n\nEducational only — not a solicitation to enroll.\n\n#MedicareEducation`,
  },
  {
    title: "Is your doctor in network for next year?",
    excerpt: "Annual reminder to verify provider directories before enrollment.",
    body: `Plan networks can change every contract year. A doctor who was in network last year may not be next year.\n\nVerify providers on Medicare.gov Plan Finder before you assume you can keep the same care team.\n\n#MedicareEducation`,
  },
  {
    title: "Part D formulary changes can surprise you mid-year",
    excerpt: "Educational post on prescription tier changes and appeals.",
    body: `Each Part D plan maintains its own drug list. A medication can move tiers or require prior authorization without much fanfare.\n\nKeep your bottle handy when comparing plans on Medicare.gov.\n\n#MedicareEducation #PartD`,
  },
];

async function run() {
  // 1. Get latest batch
  const { data: batches, error: batchErr } = await supabase
    .from("content_batches")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(1);

  if (batchErr) {
    console.error("Error fetching batches:", batchErr);
    process.exit(1);
  }

  if (!batches || batches.length === 0) {
    console.log("No content batches found in database.");
    return;
  }

  const batch = batches[0];
  console.log(`Found latest batch: ${batch.name} (ID: ${batch.id})`);

  // 2. Fetch facebook posts for this batch
  const { data: drafts, error: draftsErr } = await supabase
    .from("content_drafts")
    .select("id, slot_index, title")
    .eq("batch_id", batch.id)
    .eq("type", "facebook_post");

  if (draftsErr) {
    console.error("Error fetching drafts:", draftsErr);
    process.exit(1);
  }

  console.log(`Found ${drafts.length} facebook post drafts in this batch.`);

  // 3. Update each draft to match the new templates
  for (const draft of drafts) {
    const post = FACEBOOK_POSTS[draft.slot_index];
    if (post) {
      console.log(`Updating Slot ${draft.slot_index} (ID: ${draft.id}) to: "${post.title}"`);
      const { error: updateErr } = await supabase
        .from("content_drafts")
        .update({
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draft.id);

      if (updateErr) {
        console.error(`Error updating draft ${draft.id}:`, updateErr);
      }
    }
  }

  console.log("Successfully reseeded latest batch drafts!");
}

run();
