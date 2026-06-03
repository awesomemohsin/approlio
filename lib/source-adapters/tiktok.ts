import type { SourceAdapter, NormalizedSourcePost } from "@/lib/source-adapters/types";
import { stablePostId } from "@/lib/source-adapters/types";
import type { Source } from "@/lib/supabase/types";
import { monitorConfig } from "@/lib/env";
import { withBrowser } from "./browser-helper";

export class TikTokAdapter implements SourceAdapter {
  platform = "tiktok" as const;

  async getLatestPosts(source: Source): Promise<NormalizedSourcePost[]> {
    const { maxPostsPerSource } = monitorConfig();

    return withBrowser(async (browser) => {
      const page = await browser.newPage({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      });
      await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(3000);

      const links = (await page.evaluate(`(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="/video/"]'));
        const mapped = anchors.map((anchor) => {
          const img = anchor.querySelector("img[src]");
          return {
            href: anchor.href,
            text: anchor.textContent ? anchor.textContent.replace(/\\s+/g, " ").trim() : "",
            image: img ? img.src : null,
          };
        });
        return mapped.filter((link, index, all) => all.findIndex((item) => item.href === link.href) === index);
      })()`)) as Array<{ href: string; text: string; image: string | null }>;

      return links.slice(0, maxPostsPerSource).map((link) => ({
        sourcePostId: stablePostId("tiktok", link.href.match(/\/video\/([^/?#]+)/)?.[1] ?? link.href),
        sourceUrl: link.href,
        platform: "tiktok",
        caption: link.text || null,
        thumbnailUrl: link.image,
        videoUrl: link.href,
        publishedAt: null,
      }));
    });
  }

  async getPostDetails(source: Source, sourcePostId: string) {
    const posts = await this.getLatestPosts(source);
    return posts.find((post) => post.sourcePostId === sourcePostId) ?? null;
  }
}
