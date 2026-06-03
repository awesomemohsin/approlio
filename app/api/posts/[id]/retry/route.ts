import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { publishPost } from "@/lib/automation/publish";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDashboardUser();
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    const { data: post, error } = await supabase.from("posts").select("*").eq("id", id).single();

    if (error) {
      throw error;
    }

    const result = await publishPost({ ...post, status: "approved", next_retry_at: null }, user.email ?? user.id);
    return NextResponse.json({ data: result });
  } catch (error) {
    return jsonError(error);
  }
}
