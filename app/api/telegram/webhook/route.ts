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

    if (!callback?.data) {
      return NextResponse.json({ ok: true });
    }

    const [action, postId] = callback.data.split(":");
    if ((action !== "approve" && action !== "reject") || !postId) {
      return NextResponse.json({ ok: true });
    }

    const status = action === "approve" ? "approved" : "rejected";
    const actor = callback.from?.username ? `telegram:${callback.from.username}` : `telegram:${callback.from?.id ?? "unknown"}`;
    const supabase = createSupabaseAdmin();
    const { data: post, error } = await supabase.from("posts").update({ status }).eq("id", postId).select("*").single();

    if (error) {
      throw error;
    }

    await logAction(supabase, {
      postId,
      action: status === "approved" ? "approved" : "rejected",
      status: "success",
      response: { via: "telegram" },
      actor,
    });

    const alertMessage = action === "approve" ? "Post approved for publishing!" : "Post rejected.";
    await answerTelegramCallback(callback.id, alertMessage);

    if (action === "approve" && post) {
      await publishPost(post, actor);
    }

    if (callback.message?.message_id && callback.message?.chat?.id) {
      const originalText = callback.message.text || callback.message.caption || "";
      const updatedText = `[${action === "approve" ? "APPROVED ✅" : "REJECTED ❌"}]\n\n${originalText}`;
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
