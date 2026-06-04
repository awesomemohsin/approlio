import type { Browser } from "playwright";
import type { SourceAdapter, NormalizedSourcePost } from "@/lib/source-adapters/types";
import { stablePostId } from "@/lib/source-adapters/types";
import type { Source } from "@/lib/supabase/types";
import { monitorConfig } from "@/lib/env";
import { withBrowser } from "./browser-helper";

function cleanFacebookUrl(rawUrl: string, platformId: string) {
  try {
    if (rawUrl.includes("/posts/")) {
      return `https://www.facebook.com/posts/${platformId}`;
    }
    if (rawUrl.includes("/videos/")) {
      return `https://www.facebook.com/videos/${platformId}`;
    }
    if (rawUrl.includes("/reel/")) {
      return `https://www.facebook.com/reel/${platformId}`;
    }
    if (rawUrl.includes("/watch")) {
      return `https://www.facebook.com/watch/?v=${platformId}`;
    }
    if (rawUrl.includes("/photo/") || rawUrl.includes("fbid=") || rawUrl.includes("story_fbid=")) {
      return `https://www.facebook.com/photo/?fbid=${platformId}`;
    }
    const parsed = new URL(rawUrl);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function cleanPostText(text: string) {
  return text
    .replace(/Online status indicator|Active Status indicator|Active/gi, "")
    .replace(/· Shared with Public|· Shared with Friends|Shared with Public/gi, "")
    .replace(/\b\d+[hdm]\b/g, "")
    .replace(/… See more|See more|See less/gi, "")
    .replace(/\s+/g, " ")
    .trim();
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

      // Scroll down to trigger lazy loading of actual feed posts
      for (let i = 0; i < 3; i++) {
        await page.evaluate("window.scrollBy(0, 800)");
        await page.waitForTimeout(1500);
      }

      const rawPosts = (await page.evaluate(`(() => {
        const anchors = [...document.querySelectorAll("a[href]")];
        const postLinks = anchors
          .filter((anchor) => {
            const href = anchor.href;
            const text = anchor.textContent?.trim() || "";
            const label = anchor.getAttribute("aria-label") || "";
            
            const isPostPattern = ["/posts/", "/videos/", "/reel/", "story_fbid=", "fbid=", "/watch"].some((needle) =>
              href.includes(needle)
            );
            if (!isPostPattern) return false;

            if (anchor.tabIndex === -1) return false;
            if (label.toLowerCase().includes("profile") || label.toLowerCase().includes("cover")) return false;
            if (!text && !label) return false;

            return true;
          })
          .map((anchor) => anchor.href);

        return { postLinks };
      })()`)) as { postLinks: string[] };

      // Parse IDs and clean URLs first
      const parsedCandidates = rawPosts.postLinks
        .map((rawHref) => {
          const id = extractFacebookId(rawHref);
          const cleanedUrl = cleanFacebookUrl(rawHref, id);
          return { rawHref, id, cleanedUrl };
        })
        .filter((c) => c.id !== c.rawHref);

      // Deduplicate by cleaned URL
      const uniquePostsMap = new Map<string, typeof parsedCandidates[0]>();
      for (const item of parsedCandidates) {
        if (!uniquePostsMap.has(item.cleanedUrl)) {
          uniquePostsMap.set(item.cleanedUrl, item);
        }
      }
      
      const uniquePosts = [...uniquePostsMap.values()].slice(0, maxPostsPerSource);

      const evaluatedPosts = (await page.evaluate(
        `(() => {
          const uniqueList = ${JSON.stringify(uniquePosts)};
          const allRawPostLinks = ${JSON.stringify(rawPosts.postLinks)};
          const anchors = [...document.querySelectorAll("a[href]")];

          const extractId = (href) => {
            const patterns = [
              /\\/posts\\/([^/?#]+)/i,
              /\\/videos\\/([^/?#]+)/i,
              /\\/reel\\/([^/?#]+)/i,
              /fbid=([^&#]+)/i,
              /story_fbid=([^&#]+)/i,
              /watch\\/?\\?v=([^&#]+)/i,
            ];
            for (const p of patterns) {
              const m = href.match(p);
              if (m && m[1]) return decodeURIComponent(m[1]);
            }
            return href;
          };

          const cleanUrl = (raw, id) => {
            if (raw.includes("/posts/")) return "https://www.facebook.com/posts/" + id;
            if (raw.includes("/videos/")) return "https://www.facebook.com/videos/" + id;
            if (raw.includes("/reel/")) return "https://www.facebook.com/reel/" + id;
            if (raw.includes("/watch")) return "https://www.facebook.com/watch/?v=" + id;
            if (raw.includes("/photo/") || raw.includes("fbid=") || raw.includes("story_fbid=")) {
              return "https://www.facebook.com/photo/?fbid=" + id;
            }
            return raw;
          };

          return uniqueList.map(({ rawHref, cleanedUrl, id }) => {
            const anchor = anchors.find((candidate) => candidate.href === rawHref);
            if (!anchor) {
              return { cleanedUrl, id, text: "", image: null, video: null, publishedAt: null };
            }

            // Walk up to find the bounding post container
            let current = anchor.parentElement;
            let bestContainer = current;
            let currentText = current ? current.textContent : "";
            let stableCount = 0;

            while (current && current.tagName !== "BODY" && current.tagName !== "HTML") {
              const nextText = current.textContent || "";
              if (nextText.length > currentText.length + 10) {
                bestContainer = current;
                currentText = nextText;
                stableCount = 0;
              } else {
                stableCount++;
              }

              const otherAnchors = [...current.querySelectorAll("a[href]")].filter((a) => {
                if (!allRawPostLinks.includes(a.href)) return false;
                const otherId = extractId(a.href);
                const otherCleaned = cleanUrl(a.href, otherId);
                return otherCleaned !== cleanedUrl;
              });

              if (otherAnchors.length > 0) {
                break;
              }

              if (stableCount >= 4) {
                break;
              }

              current = current.parentElement;
            }

            if (!bestContainer) {
              return { cleanedUrl, id, text: "", image: null, video: null, publishedAt: null };
            }

            // Try to extract clean text using div[dir="auto"] first, otherwise fallback to textContent
            const textNodes = [...bestContainer.querySelectorAll('div[dir="auto"]')];
            let text = "";
            if (textNodes.length > 0) {
              const textBlocks = textNodes.map((el) => el.textContent?.trim()).filter(Boolean);
              const uniqueBlocks = [];
              for (const block of textBlocks) {
                const cleanBlock = block.replace(/\\s+/g, "").toLowerCase();
                let isDuplicate = false;
                for (let i = 0; i < uniqueBlocks.length; i++) {
                  const existing = uniqueBlocks[i];
                  const cleanExisting = existing.replace(/\\s+/g, "").toLowerCase();
                  if (cleanBlock.includes(cleanExisting)) {
                    uniqueBlocks[i] = block;
                    isDuplicate = true;
                    break;
                  } else if (cleanExisting.includes(cleanBlock)) {
                    isDuplicate = true;
                    break;
                  }
                }
                if (!isDuplicate) {
                  uniqueBlocks.push(block);
                }
              }
              text = uniqueBlocks.join("\\n");
            } else {
              text = bestContainer.textContent?.replace(/\\s+/g, " ").trim() ?? "";
            }

            const images = [...bestContainer.querySelectorAll("img")]
              .map((img) => img.src)
              .filter(
                (src) =>
                  src &&
                  !src.includes("/images/emoji/") &&
                  !src.includes("rsrc.php") &&
                  !src.includes("profile") &&
                  !src.startsWith("data:")
              );

            const videos = [...bestContainer.querySelectorAll("video")].map((vid) => vid.src).filter(Boolean);

            const timeEl = bestContainer.querySelector("time[datetime]");
            const publishedAt = timeEl ? timeEl.getAttribute("datetime") : null;

            return {
              cleanedUrl,
              id,
              text,
              image: images[0] || null,
              video: videos[0] || null,
              publishedAt,
            };
          });
        })()`
      )) as Array<{
        cleanedUrl: string;
        id: string;
        text: string;
        image: string | null;
        video: string | null;
        publishedAt: string | null;
      }>;

      // Extract the video mapping from page content to resolve direct MP4 CDN URLs
      const html = await page.content();
      const cleanHtml = html.replace(/\\/g, "");
      const videoMap = new Map<string, string>();
      const regex = /dash_manifest_url":"https:[^"]+?v=(\d+)/g;
      let match;
      while ((match = regex.exec(cleanHtml)) !== null) {
        const id = match[1];
        const index = match.index;
        const sub = cleanHtml.slice(index, index + 3000);
        const hdMatch = sub.match(/"browser_native_hd_url"\s*:\s*"([^"]+)"/i);
        const sdMatch = sub.match(/"browser_native_sd_url"\s*:\s*"([^"]+)"/i);
        const videoUrl = (hdMatch ? hdMatch[1] : null) || (sdMatch ? sdMatch[1] : null);
        if (videoUrl) {
          videoMap.set(id, videoUrl);
        }
      }

      return evaluatedPosts.map((post) => {
        const directVideoUrl = videoMap.get(post.id) || null;
        return {
          sourcePostId: stablePostId("facebook", post.id),
          sourceUrl: post.cleanedUrl,
          platform: "facebook",
          caption: cleanPostText(post.text).slice(0, 4000) || null,
          thumbnailUrl: post.image,
          videoUrl: directVideoUrl || post.video,
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
