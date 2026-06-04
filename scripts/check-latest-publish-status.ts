import { createSupabaseAdmin } from "@/lib/supabase/admin";

async function main() {
  const supabase = createSupabaseAdmin();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, status, source_post_id, created_at, published_response")
    .eq("profile_id", "2b39606f-ec8f-435d-92e3-ea467dd79ca9")
    .order("created_at", { ascending: false })
    .limit(3);

  console.log("Latest posts in database:", JSON.stringify(posts, null, 2));
}

main().catch(console.error);
