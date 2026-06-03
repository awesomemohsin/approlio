import type { SourceAdapter, NormalizedSourcePost } from "@/lib/source-adapters/types";
import { stablePostId } from "@/lib/source-adapters/types";
import type { Source } from "@/lib/supabase/types";
import { monitorConfig } from "@/lib/env";

export class WebsiteAdapter implements SourceAdapter {
  platform = "website" as const;

  async getLatestPosts(source: Source): Promise<NormalizedSourcePost[]> {
    const response = await fetch(source.url, {
      headers: { "user-agent": "SocialAutomationBot/1.0" },
    });

    if (!response.ok) {
      throw new Error(`Website fetch failed with ${response.status}`);
    }

    const html = await response.text();
    const baseUrl = new URL(source.url);
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map((match) => {
        const href = new URL(match[1], baseUrl).toString();
        const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        return { href, text };
      })
      .filter((link) => link.href.startsWith(baseUrl.origin));

    const unique = Array.from(new Map(links.map((link) => [link.href, link])).values());
    const { maxPostsPerSource } = monitorConfig();

    return unique.slice(0, maxPostsPerSource).map((link) => ({
      sourcePostId: stablePostId("website", link.href),
      sourceUrl: link.href,
      platform: "website",
      caption: link.text || null,
      thumbnailUrl: html.match(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? null,
      videoUrl: null,
      publishedAt: null,
    }));
  }

  async getPostDetails(source: Source, sourcePostId: string) {
    const posts = await this.getLatestPosts(source);
    return posts.find((post) => post.sourcePostId === sourcePostId) ?? null;
  }
}
