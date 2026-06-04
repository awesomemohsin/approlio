import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  try {
    await requireDashboardUser();
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireDashboardUser();
    const payload = profileSchema.parse(await request.json());
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        name: payload.name,
        active: true,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Auto-create default workflow settings for the new profile
    await supabase
      .from("settings")
      .insert({
        profile_id: data.id,
        key: "ask_for_destination_on_approval",
        value: true,
      });

    await supabase.from("publish_logs").insert({
      action: "profile_created",
      status: "success",
      response: { profile_id: data.id, name: data.name },
      actor: user.email ?? user.id,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireDashboardUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      active: z.boolean().optional(),
    });
    
    const payload = updateSchema.parse(body);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id)
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
    const user = await requireDashboardUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    // Check how many profiles exist - we must not allow deleting the last profile
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (count !== null && count <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last remaining business profile" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    await supabase.from("publish_logs").insert({
      action: "profile_deleted",
      status: "success",
      response: { profile_id: id },
      actor: user.email ?? user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
