import { chromium, type Browser } from "playwright";
import type { SourceAdapter, NormalizedSourcePost } from "@/lib/source-adapters/types";
import { stablePostId } from "@/lib/source-adapters/types";
import type { Source } from "@/lib/supabase/types";
import { monitorConfig } from "@/lib/env";

function cleanFacebookUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

function extractFacebookId(href: string) {
  const patterns = [
    /\/posts\/([^/?#]+)/i,
    /\/videos\/([^/?#]+)/i,
    /\/reel\/([^/?#]+)/i,
    /fbid=([^&#]+)/i,
    /story_fbid=([^&#]+)/i,
    /watch\/?\?v=([^&#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = href.match(pattern);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return href;
}

async function withBrowser<T>(operation: (browser: Browser) => Promise<T>) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  });

  try {
    return await operation(browser);
  } finally {
    await browser.close();
  }
}

export class FacebookAdapter implements SourceAdapter {
  platform = "facebook" as const;

  async getLatestPosts(source: Source): Promise<NormalizedSourcePost[]> {
    const { maxPostsPerSource } = monitorConfig();

    return withBrowser(async (browser) => {
      const page = await browser.newPage({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      });
      await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(3500);

      const rawPosts = await page.evaluate(() => {
        const anchors = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")];
        const postLinks = anchors
          .map((anchor) => anchor.href)
          .filter((href) =>
            ["/posts/", "/videos/", "/reel/", "story_fbid=", "fbid=", "/watch"].some((needle) =>
              href.includes(needle)
            )
          );

        const uniqueLinks = [...new Set(postLinks)].slice(0, 16);
        return uniqueLinks.map((href) => {
          const anchor = anchors.find((candidate) => candidate.href === href);
          const article = anchor?.closest('[role="article"], article, div[data-pagelet*="FeedUnit"]');
          const text = article?.textContent?.replace(/\s+/g, " ").trim() ?? "";
          const image = article?.querySelector<HTMLImageElement>("img[src]");
          const video = article?.querySelector<HTMLVideoElement>("video[src]");
          const time = article?.querySelector<HTMLTimeElement>("time[datetime]");

          return {
            href,
            text,
            image: image?.src ?? null,
            video: video?.src ?? null,
            publishedAt: time?.dateTime ?? null,
          };
        });
      });

      return rawPosts.slice(0, maxPostsPerSource).map((post) => {
        const url = cleanFacebookUrl(post.href);
        const platformId = extractFacebookId(url);

        return {
          sourcePostId: stablePostId("facebook", platformId),
          sourceUrl: url,
          platform: "facebook",
          caption: post.text.slice(0, 4000) || null,
          thumbnailUrl: post.image,
          videoUrl: post.video,
          publishedAt: post.publishedAt,
        };
      });
    });
  }

  async getPostDetails(source: Source, sourcePostId: string) {
    const posts = await this.getLatestPosts(source);
    return posts.find((post) => post.sourcePostId === sourcePostId) ?? null;
  }
}
