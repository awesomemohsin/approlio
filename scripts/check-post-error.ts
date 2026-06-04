import { createSupabaseAdmin } from "../lib/supabase/admin";

async function main() {
  const supabase = createSupabaseAdmin();
  const postId = "b1af3c67-971a-462a-8401-00a884d4a7e8";
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  console.log("Post Details:");
  console.log(`Video URL: ${post.video_url}`);
  console.log(`Last Error: ${post.last_error}`);
}

main().catch(console.error);
