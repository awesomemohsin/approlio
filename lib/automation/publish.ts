import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { Post } from "@/lib/supabase/types";
import { logAction } from "@/lib/automation/audit";
import { publishToFacebook } from "@/lib/automation/facebook-publisher";
import { logger } from "@/lib/logger";
import { publishConfig } from "@/lib/env";
import { withRetry } from "@/lib/retry";

function nextRetryAt(retryCount: number) {
  const delayMinutes = Math.min(60, 2 ** retryCount * 5);
  return new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
}

export async function publishPost(post: Post, actor = "system") {
  const supabase = createSupabaseAdmin();

  if (post.platform !== "facebook") {
    const message = `Publishing adapter not configured for ${post.platform}`;
    await supabase
      .from("posts")
      .update({
        status: "failed",
        last_error: message,
        retry_count: post.retry_count + 1,
        next_retry_at: nextRetryAt(post.retry_count + 1),
      })
      .eq("id", post.id);
    await logAction(supabase, { postId: post.id, action: "publish_failed", status: "failed", response: { error: message }, actor });
    return { id: post.id, status: "failed", error: message };
  }

  try {
    const response = await withRetry(() => publishToFacebook(post), {
      attempts: 3,
      onRetry: (error, attempt) => logger.warn("facebook_publish_retry", { postId: post.id, attempt, error: String(error) }),
    });

    await supabase
      .from("posts")
      .update({
        status: "posted",
        published_at: new Date().toISOString(),
        published_response: response,
        last_error: null,
        next_retry_at: null,
      })
      .eq("id", post.id);

    await logAction(supabase, { postId: post.id, action: "published", status: "success", response, actor });
    logger.info("facebook_publish_success", { postId: post.id });
    return { id: post.id, status: "posted", response };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const retryCount = post.retry_count + 1;

    await supabase
      .from("posts")
      .update({
        status: "failed",
        retry_count: retryCount,
        next_retry_at: nextRetryAt(retryCount),
        last_error: message,
      })
      .eq("id", post.id);

    await logAction(supabase, { postId: post.id, action: "publish_failed", status: "failed", response: { error: message }, actor });
    logger.error("facebook_publish_failed", { postId: post.id, error: message });
    return { id: post.id, status: "failed", error: message };
  }
}

export async function publishApprovedPosts() {
  const supabase = createSupabaseAdmin();
  const { batchSize } = publishConfig();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    throw error;
  }

  const results = [];
  for (const post of posts ?? []) {
    results.push(await publishPost(post));
  }

  return results;
}

export async function retryFailedPosts() {
  const supabase = createSupabaseAdmin();
  const { batchSize } = publishConfig();
  const now = new Date().toISOString();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "failed")
    .lte("next_retry_at", now)
    .order("next_retry_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    throw error;
  }

  const results = [];
  for (const post of posts ?? []) {
    results.push(await publishPost(post));
  }

  return results;
}
