import type { SourcePlatform } from "@/lib/supabase/types";
import type { SourceAdapter } from "@/lib/source-adapters/types";
import { FacebookAdapter } from "@/lib/source-adapters/facebook";
import { YouTubeAdapter } from "@/lib/source-adapters/youtube";
import { TikTokAdapter } from "@/lib/source-adapters/tiktok";
import { RSSAdapter } from "@/lib/source-adapters/rss";
import { WebsiteAdapter } from "@/lib/source-adapters/website";

const adapters: Record<SourcePlatform, SourceAdapter> = {
  facebook: new FacebookAdapter(),
  youtube: new YouTubeAdapter(),
  tiktok: new TikTokAdapter(),
  rss: new RSSAdapter(),
  website: new WebsiteAdapter(),
};

export function getSourceAdapter(platform: SourcePlatform) {
  const adapter = adapters[platform];
  if (!adapter) {
    throw new Error(`No adapter registered for platform: ${platform}`);
  }
  return adapter;
}

export function listSourceAdapters() {
  return Object.values(adapters);
}
