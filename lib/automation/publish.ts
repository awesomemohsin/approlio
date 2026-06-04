import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { Post, Connection, Json } from "@/lib/supabase/types";
import { logAction } from "@/lib/automation/audit";
import { publishToFacebook, publishToFacebookPage } from "@/lib/automation/facebook-publisher";
import { publishToYouTubeChannel } from "@/lib/automation/youtube-publisher";
import { logger } from "@/lib/logger";
import { publishConfig } from "@/lib/env";
import { withRetry } from "@/lib/retry";
import { SupabaseClient } from "@supabase/supabase-js";

function nextRetryAt(retryCount: number) {
  const delayMinutes = Math.min(60, 2 ** retryCount * 5);
  return new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
}

interface ConnectionTokenData {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

async function getValidGoogleToken(connection: Connection, supabase: SupabaseClient): Promise<string> {
  const tokenData = connection.token_data as ConnectionTokenData;
  const expiresAt = tokenData.expires_at;

  // If token is still valid for at least 5 minutes, return it
  if (expiresAt && expiresAt > Date.now() + 5 * 60 * 1000 && tokenData.access_token) {
    return tokenData.access_token;
  }

  if (!tokenData.refresh_token) {
    throw new Error(`No refresh token available for YouTube connection ${connection.name}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not configured in environment variables");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokenData.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to refresh YouTube token: ${data.error_description || data.error}`);
  }

  const newAccessToken = data.access_token as string;
  const newExpiresIn = data.expires_in as number;

  const updatedTokenData = {
    ...tokenData,
    access_token: newAccessToken,
    expires_at: Date.now() + newExpiresIn * 1000,
  };

  await supabase
    .from("connections")
    .update({ token_data: updatedTokenData })
    .eq("id", connection.id);

  return newAccessToken;
}

async function publishPostToConnection(post: Post, connection: Connection, supabase: SupabaseClient) {
  if (connection.platform === "facebook") {
    const tokenData = connection.token_data as ConnectionTokenData;
    if (!tokenData || !tokenData.access_token) {
      throw new Error(`Facebook connection "${connection.name}" is missing access token`);
    }
    return publishToFacebookPage(post, connection.platform_id, tokenData.access_token);
  } else if (connection.platform === "youtube") {
    const accessToken = await getValidGoogleToken(connection, supabase);
    return publishToYouTubeChannel(post, connection.platform_id, accessToken);
  } else {
    throw new Error(`Publishing adapter not configured for platform: ${connection.platform}`);
  }
}

export async function publishPost(post: Post, actor = "system") {
  const supabase = createSupabaseAdmin();

  // 1. Fetch destination entries mapped to this post
  const { data: destinationsResult, error: destError } = await supabase
    .from("post_destinations")
    .select("*, connections(*)")
    .eq("post_id", post.id);

  if (destError) {
    logger.error("fetch_destinations_failed", { postId: post.id, error: destError.message });
  }

  let destinations = destinationsResult;

  // 2. If no destinations exist, auto-insert active connections for this platform
  if (!destinations || destinations.length === 0) {
    const { data: activeConnections } = await supabase
      .from("connections")
      .select("*")
      .eq("platform", post.platform)
      .eq("active", true);

    if (activeConnections && activeConnections.length > 0) {
      const destInserts = activeConnections.map(c => ({
        post_id: post.id,
        connection_id: c.id,
        status: "pending" as const,
      }));

      await supabase.from("post_destinations").insert(destInserts);

      const reloaded = await supabase
        .from("post_destinations")
        .select("*, connections(*)")
        .eq("post_id", post.id);
      
      destinations = reloaded.data || [];
    }
  }

  // 3. Fallback: If still no destinations, run legacy flow if Facebook, or fail
  if (!destinations || destinations.length === 0) {
    if (post.platform !== "facebook") {
      const message = `No active publishing destinations connected for platform: ${post.platform}`;
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

    // Legacy Facebook fallback
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

  // 4. Modern flow: Publish to each destination that has not yet succeeded
  let allSucceeded = true;
  const errors: string[] = [];
  const responses: Record<string, Json> = {};

  for (const dest of destinations) {
    if (dest.status === "posted") {
      responses[dest.connection_id] = dest.published_response;
      continue;
    }

    const connection = dest.connections as unknown as Connection;
    if (!connection) {
      const err = `Connection details not found for destination ID ${dest.connection_id}`;
      errors.push(err);
      allSucceeded = false;
      await supabase
        .from("post_destinations")
        .update({ status: "failed", last_error: err })
        .eq("id", dest.id);
      continue;
    }

    try {
      const response = await withRetry(
        () => publishPostToConnection(post, connection, supabase),
        {
          attempts: 3,
          onRetry: (error, attempt) => 
            logger.warn("destination_publish_retry", { 
              postId: post.id, 
              connectionName: connection.name, 
              attempt, 
              error: String(error) 
            }),
        }
      );

      await supabase
        .from("post_destinations")
        .update({
          status: "posted",
          published_at: new Date().toISOString(),
          published_response: response,
          last_error: null,
        })
        .eq("id", dest.id);

      responses[connection.id] = response;
      logger.info("destination_publish_success", { postId: post.id, connectionName: connection.name });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      errors.push(`${connection.name}: ${errMsg}`);
      allSucceeded = false;

      await supabase
        .from("post_destinations")
        .update({
          status: "failed",
          last_error: errMsg,
        })
        .eq("id", dest.id);

      logger.error("destination_publish_failed", { postId: post.id, connectionName: connection.name, error: errMsg });
    }
  }

  // 5. Update main post entry based on overall results
  if (allSucceeded) {
    await supabase
      .from("posts")
      .update({
        status: "posted",
        published_at: new Date().toISOString(),
        published_response: responses,
        last_error: null,
        next_retry_at: null,
      })
      .eq("id", post.id);

    await logAction(supabase, { postId: post.id, action: "published", status: "success", response: responses, actor });
    return { id: post.id, status: "posted", responses };
  } else {
    const combinedError = errors.join(" | ");
    const retryCount = post.retry_count + 1;

    await supabase
      .from("posts")
      .update({
        status: "failed",
        retry_count: retryCount,
        next_retry_at: nextRetryAt(retryCount),
        last_error: combinedError,
      })
      .eq("id", post.id);

    await logAction(supabase, { postId: post.id, action: "publish_failed", status: "failed", response: { errors, responses }, actor });
    return { id: post.id, status: "failed", error: combinedError };
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

export async function cleanupDatabase() {
  const supabase = createSupabaseAdmin();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // 1. Auto-reject pending posts older than 3 days
    const { error: rejectError } = await supabase
      .from("posts")
      .update({ status: "rejected", last_error: "Auto-rejected after 3 days of inactivity" })
      .eq("status", "pending")
      .lt("created_at", threeDaysAgo);

    if (rejectError) {
      logger.error("auto_reject_failed", { error: rejectError.message });
    } else {
      logger.info("auto_reject_completed");
    }
  } catch (error) {
    logger.error("cleanup_database_failed", { error: error instanceof Error ? error.message : String(error) });
  }
}

