import type { Json } from "@/lib/supabase/types";
import type { createSupabaseAdmin } from "@/lib/supabase/admin";

type SupabaseAdmin = ReturnType<typeof createSupabaseAdmin>;

export async function logAction(
  supabase: SupabaseAdmin,
  input: {
    postId?: string | null;
    action: string;
    status: string;
    response?: Json;
    actor?: string;
  }
) {
  await supabase.from("publish_logs").insert({
    post_id: input.postId ?? null,
    action: input.action,
    status: input.status,
    response: input.response ?? {},
    actor: input.actor ?? "system",
  });
}
