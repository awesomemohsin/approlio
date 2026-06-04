import { requiredEnv, siteUrl, telegramEnabled } from "@/lib/env";
import type { Post, Source } from "@/lib/supabase/types";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
}

function apiUrl(method: string) {
  return `https://api.telegram.org/bot${requiredEnv("TELEGRAM_BOT_TOKEN")}/${method}`;
}

export async function sendTelegramApproval(post: Post, source?: Source | null) {
  if (!telegramEnabled()) {
    return null;
  }

  let reviewUrl = `${siteUrl()}/dashboard/review/${post.id}`;
  if (reviewUrl.includes("localhost") || reviewUrl.includes("127.0.0.1")) {
    reviewUrl = `https://example.com/dashboard/review/${post.id}`;
  }

  const isVideo = 
    post.source_url?.includes("/videos/") || 
    post.source_url?.includes("/watch") || 
    post.source_url?.includes("/reel/");

  // Fetch workspace profile name
  let profileName = "";
  try {
    const supabase = createSupabaseAdmin();
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", post.profile_id)
      .single();
    if (profile) {
      profileName = profile.name;
    }
  } catch (err) {
    console.error("Failed to fetch profile name for Telegram notification:", err);
  }

  const caption = (post.original_caption ?? "").slice(0, 700);
  const text = [
    isVideo ? "🎥 New Facebook Video/Reel Detected" : "📸 New Facebook Post Detected",
    profileName ? `🏢 Workspace: ${profileName}` : "",
    `Source: ${source?.name ?? post.platform}`,
    "",
    "Caption Preview:",
    caption || "(No caption detected)",
  ].filter(val => val !== "").join("\n");

  let replyMarkup = {
    inline_keyboard: [
      [
        { text: "Approve to All", callback_data: "approve:all" },
        { text: "Reject", callback_data: "reject" },
      ],
      [{ text: "View Review Panel", url: reviewUrl }],
    ],
  };

  try {
    const supabase = createSupabaseAdmin();
    const { data: activeConnections } = await supabase
      .from("connections")
      .select("id, name, platform")
      .eq("profile_id", post.profile_id)
      .eq("active", true);

    if (activeConnections && activeConnections.length > 0) {
      const keyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> = [];
      
      // Individual connection buttons
      for (const c of activeConnections) {
        keyboard.push([
          { text: `Approve: ${c.name} (${c.platform})`, callback_data: `approve:${c.id}` }
        ]);
      }
      
      // All & Reject buttons
      keyboard.push([
        { text: "Approve to All", callback_data: "approve:all" },
        { text: "Reject", callback_data: "reject" }
      ]);
      
      // Review Link
      keyboard.push([{ text: "View Review Panel", url: reviewUrl }]);
      
      replyMarkup = { inline_keyboard: keyboard };
    }
  } catch (err) {
    console.error("Failed to load active connections for Telegram markup:", err);
  }

  let method = "sendMessage";
  let body: Record<string, unknown> = {
    chat_id: requiredEnv("TELEGRAM_CHAT_ID"),
    text,
    disable_web_page_preview: false,
    reply_markup: replyMarkup,
  };

  if (post.video_url && !post.video_url.startsWith("blob:")) {
    method = "sendVideo";
    body = {
      chat_id: requiredEnv("TELEGRAM_CHAT_ID"),
      video: post.video_url,
      caption: text,
      reply_markup: replyMarkup,
    };
  } else if (post.thumbnail_url) {
    method = "sendPhoto";
    body = {
      chat_id: requiredEnv("TELEGRAM_CHAT_ID"),
      photo: post.thumbnail_url,
      caption: text,
      reply_markup: replyMarkup,
    };
  }

  const response = await fetch(apiUrl(method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const responseBody = (await response.json()) as TelegramResponse;
  if (!response.ok || !responseBody.ok) {
    throw new Error(responseBody.description ?? `Telegram ${method} failed with ${response.status}`);
  }

  return responseBody.result?.message_id ?? null;
}

export async function answerTelegramCallback(callbackQueryId: string, text: string) {
  if (!telegramEnabled()) {
    return;
  }

  await fetch(apiUrl("answerCallbackQuery"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });
}

export async function editTelegramMessageText(chatId: number | string, messageId: number, text: string) {
  if (!telegramEnabled()) {
    return;
  }

  const response = await fetch(apiUrl("editMessageText"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
    }),
  });

  const body = (await response.json()) as TelegramResponse;
  if (!response.ok || !body.ok) {
    throw new Error(body.description ?? `Telegram editMessageText failed with ${response.status}`);
  }
}

export async function editTelegramMessageCaption(chatId: number | string, messageId: number, caption: string) {
  if (!telegramEnabled()) {
    return;
  }

  const response = await fetch(apiUrl("editMessageCaption"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      caption,
    }),
  });

  const body = (await response.json()) as TelegramResponse;
  if (!response.ok || !body.ok) {
    throw new Error(body.description ?? `Telegram editMessageCaption failed with ${response.status}`);
  }
}
