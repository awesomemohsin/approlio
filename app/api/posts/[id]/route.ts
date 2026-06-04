import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { logAction } from "@/lib/automation/audit";
import { requireDashboardUser, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

const updatePostSchema = z.object({
  edited_caption: z.string().max(5000).optional(),
  status: z.enum(["pending", "approved", "posted", "rejected", "failed"]).optional(),
  connectionIds: z.array(z.string().uuid()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDashboardUser();
    const { id } = await params;
    const body = await request.json();
    const payload = updatePostSchema.parse(body);
    const supabase = createSupabaseAdmin();

    // Remove connectionIds from payload before updating the posts table
    const { connectionIds, ...dbUpdatePayload } = payload;

    const { data, error } = await supabase.from("posts").update(dbUpdatePayload).eq("id", id).select("*").single();
    if (error) {
      throw error;
    }

    if (payload.status === "approved") {
      let targetConnectionIds = connectionIds || [];
      if (targetConnectionIds.length === 0) {
        const { data: activeConnections } = await supabase
          .from("connections")
          .select("id")
          .eq("profile_id", data.profile_id)
          .eq("active", true);
        if (activeConnections) {
          targetConnectionIds = activeConnections.map((c) => c.id);
        }
      }

      if (targetConnectionIds.length > 0) {
        // Delete any existing post destinations for this post
        await supabase
          .from("post_destinations")
          .delete()
          .eq("post_id", id);

        const destinations = targetConnectionIds.map((connId: string) => ({
          post_id: id,
          connection_id: connId,
          status: "pending" as const,
        }));

        const { error: destError } = await supabase
          .from("post_destinations")
          .insert(destinations);

        if (destError) {
          throw destError;
        }
      }

      await logAction(supabase, {
        postId: id,
        action: "approved",
        status: "success",
        response: { status: "approved", connectionIds: targetConnectionIds },
        actor: user.email ?? user.id,
      });
    } else if (payload.status) {
      await logAction(supabase, {
        postId: id,
        action: payload.status === "rejected" ? "rejected" : "status_updated",
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
