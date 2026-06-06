import { NextRequest, NextResponse } from "next/server";
import { assertTelegramSecret } from "@/lib/api-auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { answerTelegramCallback, editTelegramMessageText, editTelegramMessageCaption } from "@/lib/automation/telegram";
import { logAction } from "@/lib/automation/audit";
import { publishPost } from "@/lib/automation/publish";
import { jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";

interface TelegramUpdate {
  callback_query?: {
    id: string;
    data?: string;
    from?: {
      username?: string;
      id: number;
    };
    message?: {
      message_id: number;
      chat: {
        id: number | string;
      };
      text?: string;
      caption?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    assertTelegramSecret(request);
    const update = (await request.json()) as TelegramUpdate;
    const callback = update.callback_query;

    if (!callback?.data || !callback.message?.message_id) {
      return NextResponse.json({ ok: true });
    }

    const parts = callback.data.split(":");
    const action = parts[0]; // "approve" or "reject"
    const target = parts[1]; // connectionId or "all"

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ ok: true });
    }

    const supabase = createSupabaseAdmin();

    // 1. Fetch current post using the telegram_message_id to prevent duplicates
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("telegram_message_id", callback.message.message_id)
      .single();

    if (fetchError || !existingPost) {
      console.error("Failed to find post by Telegram message ID:", callback.message.message_id, fetchError);
      return NextResponse.json({ ok: true });
    }

    // If already approved, posted, or rejected, answer callback and update UI without republishing
    if (
      existingPost.status === "approved" ||
      existingPost.status === "posted" ||
      existingPost.status === "rejected"
    ) {
      const alertMessage = existingPost.status === "rejected" ? "Post already rejected." : "Post already approved/published.";
      await answerTelegramCallback(callback.id, alertMessage);

      if (callback.message.chat?.id) {
        const originalText = callback.message.text || callback.message.caption || "";
        // Only prepend status if it wasn't already prepended
        if (!originalText.startsWith("[APPROVED") && !originalText.startsWith("[REJECTED")) {
          const updatedText = `[${existingPost.status === "rejected" ? "REJECTED ❌" : "APPROVED ✅"}]\n\n${originalText}`;
          if (callback.message.caption !== undefined) {
            await editTelegramMessageCaption(callback.message.chat.id, callback.message.message_id, updatedText);
          } else {
            await editTelegramMessageText(callback.message.chat.id, callback.message.message_id, updatedText);
          }
        }
      }
      return NextResponse.json({ ok: true });
    }

    const actor = callback.from?.username ? `telegram:${callback.from.username}` : `telegram:${callback.from?.id ?? "unknown"}`;

    if (action === "reject") {
      // Perform reject status update
      const { data: post, error: updateError } = await supabase
        .from("posts")
        .update({ status: "rejected" })
        .eq("id", existingPost.id)
        .select("*")
        .single();

      if (updateError || !post) {
        throw updateError || new Error("Failed to update post status to rejected");
      }

      await logAction(supabase, {
        postId: existingPost.id,
        action: "rejected",
        status: "success",
        response: { via: "telegram" },
        actor,
      });

      await answerTelegramCallback(callback.id, "Post rejected.");

      if (callback.message.chat?.id) {
        const originalText = callback.message.text || callback.message.caption || "";
        const updatedText = `[REJECTED ❌]\n\n${originalText}`;
        if (callback.message.caption !== undefined) {
          await editTelegramMessageCaption(callback.message.chat.id, callback.message.message_id, updatedText);
        } else {
          await editTelegramMessageText(callback.message.chat.id, callback.message.message_id, updatedText);
        }
      }

      return NextResponse.json({ ok: true });
    }

    // action === "approve"
    // Determine connection IDs to approve for
    let targetConnectionIds: string[] = [];
    if (target === "all") {
      const { data: activeConnections } = await supabase
        .from("connections")
        .select("id")
        .eq("profile_id", existingPost.profile_id)
        .eq("active", true);
      if (activeConnections) {
        targetConnectionIds = activeConnections.map((c) => c.id);
      }
    } else if (target) {
      targetConnectionIds = [target];
    }

    if (targetConnectionIds.length > 0) {
      // Delete existing destinations
      await supabase
        .from("post_destinations")
        .delete()
        .eq("post_id", existingPost.id);

      // Insert new destinations
      const destinations = targetConnectionIds.map((connId: string) => ({
        post_id: existingPost.id,
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

    // Perform the status update to approved
    const { data: post, error: updateError } = await supabase
      .from("posts")
      .update({ status: "approved" })
      .eq("id", existingPost.id)
      .select("*")
      .single();

    if (updateError || !post) {
      throw updateError || new Error("Failed to update post status to approved");
    }

    await logAction(supabase, {
      postId: existingPost.id,
      action: "approved",
      status: "success",
      response: { via: "telegram", targetConnectionIds },
      actor,
    });

    await answerTelegramCallback(callback.id, "Post approved for publishing!");

    // Execute direct publishing
    const result = await publishPost(post, actor);

    if (callback.message.chat?.id) {
      const originalText = callback.message.text || callback.message.caption || "";
      const isSuccess = result.status === "posted";
      const statusText = isSuccess ? "APPROVED ✅" : "PUBLISH FAILED ❌";
      let updatedText = `[${statusText}]\n\n${originalText}`;
      if (!isSuccess && result.error) {
        updatedText += `\n\n⚠️ Error: ${result.error}`;
      }
      if (callback.message.caption !== undefined) {
        await editTelegramMessageCaption(callback.message.chat.id, callback.message.message_id, updatedText);
      } else {
        await editTelegramMessageText(callback.message.chat.id, callback.message.message_id, updatedText);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
