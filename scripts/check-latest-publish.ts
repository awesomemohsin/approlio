import { createSupabaseAdmin } from "@/lib/supabase/admin";

async function main() {
  const supabase = createSupabaseAdmin();
  console.log("Checking latest post destinations...");
  const { data: dests } = await supabase
    .from("post_destinations")
    .select("*, posts(*)")
    .order("created_at", { ascending: false })
    .limit(1);

  console.log("Latest Post Destination:\n", JSON.stringify(dests, null, 2));

  if (dests && dests.length > 0) {
    const postId = dests[0].post_id;
    const { data: logs } = await supabase
      .from("publish_logs")
      .select("*")
      .eq("post_id", postId);

    console.log("Publish Logs for this post:\n", JSON.stringify(logs, null, 2));
  }
}

main().catch(console.error);
