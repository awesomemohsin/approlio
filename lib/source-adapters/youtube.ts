import type { SourceAdapter, NormalizedSourcePost } from "@/lib/source-adapters/types";
import { stablePostId } from "@/lib/source-adapters/types";
import type { Source } from "@/lib/supabase/types";
import { RSSAdapter } from "@/lib/source-adapters/rss";

function youtubeFeedUrl(sourceUrl: string) {
  const channelId = sourceUrl.match(/channel\/([^/?#]+)/i)?.[1];
  if (channelId) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }

  const handle = sourceUrl.match(/youtube\.com\/@([^/?#]+)/i)?.[1];
  if (handle) {
    return `https://www.youtube.com/feeds/videos.xml?user=${handle}`;
  }

  return sourceUrl;
}

export class YouTubeAdapter implements SourceAdapter {
  platform = "youtube" as const;

  async getLatestPosts(source: Source): Promise<NormalizedSourcePost[]> {
    const rss = new RSSAdapter();
    const posts = await rss.getLatestPosts({ ...source, url: youtubeFeedUrl(source.url), platform: "rss" });

    return posts.map((post) => ({
      ...post,
      platform: "youtube",
      sourcePostId: stablePostId("youtube", post.sourceUrl),
      videoUrl: post.sourceUrl,
    }));
  }

  async getPostDetails(source: Source, sourcePostId: string) {
    const posts = await this.getLatestPosts(source);
    return posts.find((post) => post.sourcePostId === sourcePostId) ?? null;
  }
}
