import { createClient } from "@supabase/supabase-js";
import { createJiti } from "jiti";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, {
  alias: {
    "@": path.join(root, "src"),
  },
});
const { buildFacebookPostSeedCopy } = jiti("../src/lib/content-factory/facebook-post-seed-copy.ts");
const { buildWorkbookFacebookPostTemplates } = jiti(
  "../src/lib/content-factory/workbook-facebook-post-templates.ts",
);

const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (!match) continue;
  const key = match[1];
  let value = match[2] || "";
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function facebookPostsForReseed() {
  const seeds = buildFacebookPostSeedCopy();
  const workbookBySlot = new Map(
    buildWorkbookFacebookPostTemplates().map((t) => [t.slotIndex, t]),
  );
  return seeds.map((seed, slotIndex) => {
    const workbook = workbookBySlot.get(slotIndex);
    if (workbook) {
      return {
        title: workbook.title,
        excerpt: workbook.excerpt,
        body: workbook.body,
      };
    }
    return seed;
  });
}

const FACEBOOK_POSTS = facebookPostsForReseed();

async function run() {
  const { data: batches, error: batchErr } = await supabase
    .from("content_batches")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(1);

  if (batchErr) {
    console.error("Error fetching batches:", batchErr);
    process.exit(1);
  }

  if (!batches?.length) {
    console.log("No content batches found in database.");
    return;
  }

  const batch = batches[0];
  console.log(`Found latest batch: ${batch.name} (ID: ${batch.id})`);

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

  for (const draft of drafts) {
    const post = FACEBOOK_POSTS[draft.slot_index];
    if (!post?.body?.trim()) continue;
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

  const hasPersonalShare = drafts.some((d) => d.slot_index === 7);
  if (!hasPersonalShare && FACEBOOK_POSTS[7]?.body?.trim()) {
    const post = FACEBOOK_POSTS[7];
    console.log(`Inserting missing slot 7: "${post.title}"`);
    const { error: insertErr } = await supabase.from("content_drafts").insert({
      batch_id: batch.id,
      type: "facebook_post",
      slot_index: 7,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      payload: { provider: "seed", platform: "facebook", slot: 8, audience: "personal_profile" },
      status: "draft",
    });
    if (insertErr) {
      console.error("Error inserting slot 7 draft:", insertErr);
    }
  }

  console.log("Successfully reseeded latest batch drafts!");
}

run();
