import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireDashboardUser, getRequiredProfileId, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireDashboardUser();
    const profileId = getRequiredProfileId(request);
    const supabase = createSupabaseAdmin();

    // 1. Fetch sources and posts IDs for log filtering
    const [sourcesRes, postsRes] = await Promise.all([
      supabase.from("sources").select("id").eq("profile_id", profileId),
      supabase.from("posts").select("id").eq("profile_id", profileId),
    ]);

    const sourceIds = sourcesRes.data?.map((s) => s.id) || [];
    const postIds = postsRes.data?.map((p) => p.id) || [];

    // 2. Query stats & recent data
    const [
      totalSources,
      pendingApproval,
      approvedContent,
      failedPosts,
      recentPostsResult,
      recentLogsResult,
    ] = await Promise.all([
      supabase.from("sources").select("*", { count: "exact", head: true }).eq("profile_id", profileId),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("profile_id", profileId).eq("status", "pending"),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("profile_id", profileId).eq("status", "approved"),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("profile_id", profileId).eq("status", "failed"),
      supabase.from("posts").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(500),
      supabase.from("publish_logs").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

    if (recentPostsResult.error) throw recentPostsResult.error;
    if (recentLogsResult.error) throw recentLogsResult.error;

    // Filter logs in memory to associate them with this workspace profile
    const filteredLogs = (recentLogsResult.data || [])
      .filter((log) => {
        if (log.post_id && postIds.includes(log.post_id)) {
          return true;
        }
        const responseObj = log.response as Record<string, unknown> | null;
        const sourceId = responseObj?.source_id;
        if (typeof sourceId === "string" && sourceIds.includes(sourceId)) {
          return true;
        }
        return false;
      })
      .slice(0, 5);

    return NextResponse.json({
      data: {
        totalSources: totalSources.count ?? 0,
        pendingApproval: pendingApproval.count ?? 0,
        approvedContent: approvedContent.count ?? 0,
        failedPosts: failedPosts.count ?? 0,
        posts: recentPostsResult.data || [],
        logs: filteredLogs,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
