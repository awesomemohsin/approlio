import type { SourceAdapter, NormalizedSourcePost } from "@/lib/source-adapters/types";
import { stablePostId } from "@/lib/source-adapters/types";
import type { Source } from "@/lib/supabase/types";
import { monitorConfig } from "@/lib/env";

function textBetween(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim() ?? null;
}

function itemsFromXml(xml: string) {
  const itemMatches = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  return itemMatches.map((match) => match[2]);
}

function firstUrl(xml: string) {
  const enclosure = xml.match(/<enclosure\b[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1];
  const media = xml.match(/<media:(?:thumbnail|content)\b[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1];
  return enclosure ?? media ?? null;
}

export class RSSAdapter implements SourceAdapter {
  platform = "rss" as const;

  async getLatestPosts(source: Source): Promise<NormalizedSourcePost[]> {
    const response = await fetch(source.url, {
      headers: { "user-agent": "SocialAutomationBot/1.0" },
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed with ${response.status}`);
    }

    const xml = await response.text();
    const { maxPostsPerSource } = monitorConfig();

    return itemsFromXml(xml)
      .slice(0, maxPostsPerSource)
      .map((item) => {
        const guid = textBetween(item, "guid") ?? textBetween(item, "id") ?? textBetween(item, "link") ?? crypto.randomUUID();
        const link = textBetween(item, "link") ?? guid;
        const caption = textBetween(item, "title") ?? textBetween(item, "description") ?? textBetween(item, "summary");
        const mediaUrl = firstUrl(item);

        return {
          sourcePostId: stablePostId("rss", guid),
          sourceUrl: link,
          platform: "rss",
          caption,
          thumbnailUrl: mediaUrl,
          videoUrl: null,
          publishedAt: textBetween(item, "pubDate") ?? textBetween(item, "published") ?? null,
        };
      });
  }

  async getPostDetails(source: Source, sourcePostId: string) {
    const posts = await this.getLatestPosts(source);
    return posts.find((post) => post.sourcePostId === sourcePostId) ?? null;
  }
}
