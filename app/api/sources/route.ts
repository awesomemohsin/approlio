import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

const sourceSchema = z.object({
  name: z.string().min(1).max(120),
  platform: z.enum(["facebook", "youtube", "tiktok", "rss", "website"]),
  url: z.string().url(),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireDashboardUser();
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.from("sources").select("*").order("created_at", { ascending: false });

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
    const payload = sourceSchema.parse(await request.json());
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.from("sources").insert(payload).select("*").single();

    if (error) {
      throw error;
    }

    await supabase.from("publish_logs").insert({
      action: "source_created",
      status: "success",
      response: { source_id: data.id },
      actor: user.email ?? user.id,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
