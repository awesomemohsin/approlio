import type { Source, SourcePlatform } from "@/lib/supabase/types";

export interface NormalizedSourcePost {
  sourcePostId: string;
  sourceUrl: string;
  platform: SourcePlatform;
  caption: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  publishedAt: string | null;
}

export interface SourceAdapter {
  platform: SourcePlatform;
  getLatestPosts(source: Source): Promise<NormalizedSourcePost[]>;
  getPostDetails(source: Source, sourcePostId: string): Promise<NormalizedSourcePost | null>;
}

export function stablePostId(platform: SourcePlatform, value: string) {
  return `${platform}:${value}`.replace(/\s+/g, "-").toLowerCase();
}
