const optional = (key: string) => process.env[key]?.trim() || undefined;

export function requiredEnv(key: string) {
  const value = optional(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function siteUrl() {
  return optional("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
}

export function monitorConfig() {
  return {
    maxPostsPerSource: Number(optional("MONITOR_MAX_POSTS_PER_SOURCE") ?? 8),
    rateLimitMs: Number(optional("MONITOR_RATE_LIMIT_MS") ?? 1500),
  };
}

export function publishConfig() {
  return {
    batchSize: Number(optional("PUBLISH_BATCH_SIZE") ?? 10),
    graphVersion: optional("META_GRAPH_API_VERSION") ?? "v24.0",
  };
}

export function telegramEnabled() {
  return Boolean(optional("TELEGRAM_BOT_TOKEN") && optional("TELEGRAM_CHAT_ID"));
}

export function metaEnabled() {
  return Boolean(optional("META_PAGE_ID") && optional("META_PAGE_ACCESS_TOKEN"));
}
