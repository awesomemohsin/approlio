import { NextRequest } from "next/server";
import { requiredEnv } from "@/lib/env";

export function assertCronRequest(request: NextRequest) {
  const header = request.headers.get("authorization");
  const expected = `Bearer ${requiredEnv("CRON_SECRET")}`;

  if (header !== expected) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

export function assertTelegramSecret(request: NextRequest) {
  const expected = requiredEnv("TELEGRAM_WEBHOOK_SECRET");
  const actual = request.nextUrl.searchParams.get("secret");

  if (actual !== expected) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
