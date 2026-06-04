import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireDashboardUser();
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("settings")
      .select("*");

    if (error) {
      throw error;
    }

    // Convert list to key-value map
    const settingsMap = (data || []).reduce((acc: Record<string, unknown>, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    // Ensure default for ask_for_destination_on_approval exists
    if (settingsMap["ask_for_destination_on_approval"] === undefined) {
      settingsMap["ask_for_destination_on_approval"] = true;
    }

    return NextResponse.json({ data: settingsMap });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireDashboardUser();
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Setting key is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}
