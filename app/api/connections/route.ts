import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireDashboardUser, getRequiredProfileId, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireDashboardUser();
    const profileId = getRequiredProfileId(request);
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireDashboardUser();
    const profileId = getRequiredProfileId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Connection ID is required" }, { status: 400 });
    }

    const { active } = await request.json();
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("connections")
      .update({ active })
      .eq("id", id)
      .eq("profile_id", profileId)
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

export async function DELETE(request: NextRequest) {
  try {
    await requireDashboardUser();
    const profileId = getRequiredProfileId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Connection ID is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", id)
      .eq("profile_id", profileId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
