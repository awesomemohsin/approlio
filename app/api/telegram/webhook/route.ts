import { NextRequest, NextResponse } from "next/server";
import { assertTelegramSecret } from "@/lib/api-auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { answerTelegramCallback } from "@/lib/automation/telegram";
import { logAction } from "@/lib/automation/audit";
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
    if (action !== "reject" || !postId) {
      return NextResponse.json({ ok: true });
    }

    const actor = callback.from?.username ? `telegram:${callback.from.username}` : `telegram:${callback.from?.id ?? "unknown"}`;
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("posts").update({ status: "rejected" }).eq("id", postId);

    if (error) {
      throw error;
    }

    await logAction(supabase, {
      postId,
      action: "rejected",
      status: "success",
      response: { via: "telegram" },
      actor,
    });
    await answerTelegramCallback(callback.id, "Post rejected");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
