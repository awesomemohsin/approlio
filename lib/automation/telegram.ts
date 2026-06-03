import { requiredEnv, siteUrl, telegramEnabled } from "@/lib/env";
import type { Post, Source } from "@/lib/supabase/types";

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

  const reviewUrl = `${siteUrl()}/dashboard/review/${post.id}`;
  const caption = (post.original_caption ?? "").slice(0, 700);
  const text = [
    "New Facebook Post Detected",
    "",
    `Source: ${source?.name ?? post.platform}`,
    "",
    "Caption Preview:",
    caption || "(No caption detected)",
  ].join("\n");

  const response = await fetch(apiUrl("sendMessage"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: requiredEnv("TELEGRAM_CHAT_ID"),
      text,
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: [
          [{ text: "Review", url: reviewUrl }],
          [{ text: "Reject", callback_data: `reject:${post.id}` }],
        ],
      },
    }),
  });

  const body = (await response.json()) as TelegramResponse;
  if (!response.ok || !body.ok) {
    throw new Error(body.description ?? `Telegram sendMessage failed with ${response.status}`);
  }

  return body.result?.message_id ?? null;
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
