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

  let reviewUrl = `${siteUrl()}/dashboard/review/${post.id}`;
  if (reviewUrl.includes("localhost") || reviewUrl.includes("127.0.0.1")) {
    reviewUrl = `https://example.com/dashboard/review/${post.id}`;
  }
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
          [
            { text: "Approve", callback_data: `approve:${post.id}` },
            { text: "Reject", callback_data: `reject:${post.id}` },
          ],
          [{ text: "View Review Panel", url: reviewUrl }],
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
