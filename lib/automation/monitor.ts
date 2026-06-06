import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { Source } from "@/lib/supabase/types";
import { getSourceAdapter } from "@/lib/source-adapters/registry";
import type { NormalizedSourcePost } from "@/lib/source-adapters/types";
import { sendTelegramApproval } from "@/lib/automation/telegram";
import { logAction } from "@/lib/automation/audit";
import { logger } from "@/lib/logger";
import { monitorConfig } from "@/lib/env";
import { sleep } from "@/lib/sleep";
import { withRetry } from "@/lib/retry";

function normalizePublishedAt(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function importPost(source: Source, post: NormalizedSourcePost) {
  const supabase = createSupabaseAdmin();
  const { data: existing, error: lookupError } = await supabase
    .from("posts")
    .select("id")
    .eq("source_post_id", post.sourcePostId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    return { imported: false, postId: existing.id };
  }

  // Check for duplicate caption in the last 48 hours for the same profile (cross-posts across pages)
  if (post.caption) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const norm = (txt: string) => txt.replace(/\s+/g, "").toLowerCase();
    const normalizedNewCaption = norm(post.caption);

    const { data: recentPosts } = await supabase
      .from("posts")
      .select("id, original_caption")
      .eq("profile_id", source.profile_id)
      .gt("created_at", fortyEightHoursAgo);

    if (recentPosts) {
      const duplicate = recentPosts.find((p) => {
        const existingCap = p.original_caption || "";
        return norm(existingCap).includes(normalizedNewCaption) || normalizedNewCaption.includes(norm(existingCap));
      });

      if (duplicate) {
        logger.info("skipping_duplicate_caption_post", {
          sourcePostId: post.sourcePostId,
          matchingPostId: duplicate.id,
        });
        return { imported: false, postId: duplicate.id };
      }
    }
  }

  let finalCaption = post.caption || "";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", source.profile_id)
      .single();

    if (profile?.name === "Parle Bangladesh") {
      const footer = "Order Now: https://parlebangladesh.com";
      if (finalCaption) {
        if (!finalCaption.includes(footer)) {
          finalCaption = `${finalCaption}\n${footer}`;
        }
      } else {
        finalCaption = footer;
      }
    }
  } catch (err) {
    logger.error("failed_to_append_parle_bangladesh_footer", { error: err });
  }

  const { data: inserted, error } = await supabase
    .from("posts")
    .insert({
      profile_id: source.profile_id,
      source_id: source.id,
      source_post_id: post.sourcePostId,
      source_url: post.sourceUrl,
      platform: post.platform,
      thumbnail_url: post.thumbnailUrl,
      video_url: post.videoUrl,
      additional_images: post.additionalImages || [],
      original_caption: finalCaption || null,
      edited_caption: finalCaption || null,
      status: "pending",
      source_published_at: normalizePublishedAt(post.publishedAt),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await logAction(supabase, {
    postId: inserted.id,
    action: "imported",
    status: "success",
    response: {
      source_id: source.id,
      source_url: post.sourceUrl,
      platform: source.platform,
    },
  });

  try {
    const messageId = await sendTelegramApproval(inserted, source);
    if (messageId) {
      await supabase.from("posts").update({ telegram_message_id: messageId }).eq("id", inserted.id);
    }
  } catch (error) {
    await logAction(supabase, {
      postId: inserted.id,
      action: "telegram_notification",
      status: "failed",
      response: { error: error instanceof Error ? error.message : String(error) },
    });
    logger.warn("telegram_notification_failed", { postId: inserted.id, error: String(error) });
  }

  return { imported: true, postId: inserted.id };
}

export async function processSource(source: Source) {
  const supabase = createSupabaseAdmin();
  const adapter = getSourceAdapter(source.platform);

  logger.info("source_monitor_started", { sourceId: source.id, platform: source.platform });

  const posts = await withRetry(() => adapter.getLatestPosts(source), {
    attempts: 3,
    onRetry: (error, attempt) =>
      logger.warn("source_monitor_retry", { sourceId: source.id, attempt, error: String(error) }),
  });

  let imported = 0;
  for (const post of posts) {
    const result = await importPost(source, post);
    if (result.imported) {
      imported += 1;
    }
  }

  await supabase.from("sources").update({ last_checked_at: new Date().toISOString() }).eq("id", source.id);
  await logAction(supabase, {
    action: "source_synced",
    status: "success",
    response: { source_id: source.id, imported, scanned: posts.length },
  });

  logger.info("source_monitor_finished", { sourceId: source.id, imported, scanned: posts.length });
  return { sourceId: source.id, imported, scanned: posts.length };
}

export async function processAllActiveSources() {
  const supabase = createSupabaseAdmin();
  const { data: sources, error } = await supabase
    .from("sources")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const { rateLimitMs } = monitorConfig();
  const results = [];

  for (const source of sources ?? []) {
    try {
      results.push(await processSource(source));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await logAction(supabase, {
        action: "source_sync_failed",
        status: "failed",
        response: { source_id: source.id, error: message },
      });
      logger.error("source_monitor_failed", { sourceId: source.id, error: message });
      results.push({ sourceId: source.id, imported: 0, scanned: 0, error: message });
    }

    if (rateLimitMs > 0) {
      await sleep(rateLimitMs);
    }
  }

  return results;
}
