import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { logAction } from "@/lib/automation/audit";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

const updatePostSchema = z.object({
  edited_caption: z.string().max(5000).optional(),
  status: z.enum(["pending", "approved", "posted", "rejected", "failed"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDashboardUser();
    const { id } = await params;
    const payload = updatePostSchema.parse(await request.json());
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.from("posts").update(payload).eq("id", id).select("*").single();
    if (error) {
      throw error;
    }

    if (payload.status) {
      await logAction(supabase, {
        postId: id,
        action: payload.status === "rejected" ? "rejected" : payload.status === "approved" ? "approved" : "status_updated",
        status: "success",
        response: { status: payload.status },
        actor: user.email ?? user.id,
      });
    }

    if (payload.edited_caption !== undefined) {
      await logAction(supabase, {
        postId: id,
        action: "caption_edited",
        status: "success",
        response: {},
        actor: user.email ?? user.id,
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}
