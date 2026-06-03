import { chromium } from "playwright";
import type { SourceAdapter, NormalizedSourcePost } from "@/lib/source-adapters/types";
import { stablePostId } from "@/lib/source-adapters/types";
import type { Source } from "@/lib/supabase/types";
import { monitorConfig } from "@/lib/env";

export class TikTokAdapter implements SourceAdapter {
  platform = "tiktok" as const;

  async getLatestPosts(source: Source): Promise<NormalizedSourcePost[]> {
    const { maxPostsPerSource } = monitorConfig();
    const browser = await chromium.launch({ headless: true, args: ["--disable-dev-shm-usage", "--no-sandbox"] });

    try {
      const page = await browser.newPage({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      });
      await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(3000);

      const links = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLAnchorElement>('a[href*="/video/"]')]
          .map((anchor) => ({
            href: anchor.href,
            text: anchor.textContent?.replace(/\s+/g, " ").trim() ?? "",
            image: anchor.querySelector<HTMLImageElement>("img[src]")?.src ?? null,
          }))
          .filter((link, index, all) => all.findIndex((item) => item.href === link.href) === index)
      );

      return links.slice(0, maxPostsPerSource).map((link) => ({
        sourcePostId: stablePostId("tiktok", link.href.match(/\/video\/([^/?#]+)/)?.[1] ?? link.href),
        sourceUrl: link.href,
        platform: "tiktok",
        caption: link.text || null,
        thumbnailUrl: link.image,
        videoUrl: link.href,
        publishedAt: null,
      }));
    } finally {
      await browser.close();
    }
  }

  async getPostDetails(source: Source, sourcePostId: string) {
    const posts = await this.getLatestPosts(source);
    return posts.find((post) => post.sourcePostId === sourcePostId) ?? null;
  }
}
