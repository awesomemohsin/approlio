import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireDashboardUser();
    const params = request.nextUrl.searchParams;
    const status = params.get("status");
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") ?? 25)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createSupabaseAdmin();
    let query = supabase.from("publish_logs").select("*, posts(source_url, platform)", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
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
