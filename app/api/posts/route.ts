import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireDashboardUser, getRequiredProfileId, jsonError } from "@/lib/route-utils";
import type { PostStatus, SourcePlatform } from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireDashboardUser();

    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") ?? 12)));
    const status = params.get("status") as PostStatus | null;
    const platform = params.get("platform") as SourcePlatform | null;
    const id = params.get("id");
    const search = params.get("search")?.trim();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const profileId = getRequiredProfileId(request);
    const supabase = createSupabaseAdmin();
    let query = supabase
      .from("posts")
      .select("*, sources(name,url)", { count: "exact" })
      .eq("profile_id", profileId);

    if (status) {
      query = query.eq("status", status);
    }

    if (id) {
      query = query.eq("id", id);
    }

    if (platform) {
      query = query.eq("platform", platform);
    }

    if (search) {
      query = query.or(
        `original_caption.ilike.%${search}%,edited_caption.ilike.%${search}%,source_url.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data, count: count ?? 0, page, pageSize });
  } catch (error) {
    return jsonError(error);
  }
}
