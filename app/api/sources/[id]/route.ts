import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

const updateSourceSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  url: z.string().url().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDashboardUser();
    const { id } = await params;
    const payload = updateSourceSchema.parse(await request.json());
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.from("sources").update(payload).eq("id", id).select("*").single();

    if (error) {
      throw error;
    }

    await supabase.from("publish_logs").insert({
      action: "source_updated",
      status: "success",
      response: { source_id: id, changes: payload },
      actor: user.email ?? user.id,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}
