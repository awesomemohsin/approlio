import { createSupabaseAdmin } from "@/lib/supabase/admin";

async function main() {
  const supabase = createSupabaseAdmin();
  console.log("Locating buggy Parle Products posts...");

  const sourcePostIds = [
    "facebook:pfbid02iggqvcek2nh1vj898ugejq6kww5ydfpcmlpsl3ux1nqbwrpaqvxurkk4ssvverfnl",
    "facebook:438773122131424",
    "facebook:983785924296805",
    "facebook:pfbid0ef5hso2kmz4lpetayt1jr9eqotdavccjhfbnmyx66tjdaear6q4mzbevdmctvtupl"
  ];

  const { data: posts } = await supabase
    .from("posts")
    .select("id")
    .in("source_post_id", sourcePostIds)
    .eq("profile_id", "2b39606f-ec8f-435d-92e3-ea467dd79ca9");

  if (!posts || posts.length === 0) {
    console.log("No buggy posts found in database.");
    return;
  }

  const postIds = posts.map(p => p.id);
  console.log(`Found ${postIds.length} posts to delete:`, postIds);

  await supabase.from("post_destinations").delete().in("post_id", postIds);
  await supabase.from("posts").delete().in("id", postIds);
  console.log("Buggy posts deleted successfully!");
}

main().catch(console.error);
