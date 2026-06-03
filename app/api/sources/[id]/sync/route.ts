import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { processSource } from "@/lib/automation/monitor";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireDashboardUser();
    const { id } = await params;
    const supabase = createSupabaseAdmin();
    const { data: source, error } = await supabase.from("sources").select("*").eq("id", id).single();

    if (error) {
      throw error;
    }

    const result = await processSource(source);
    return NextResponse.json({ data: result });
  } catch (error) {
    return jsonError(error);
  }
}
