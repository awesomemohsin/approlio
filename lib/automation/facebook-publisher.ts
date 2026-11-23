import { publishConfig, requiredEnv } from "@/lib/env";
import type { Post } from "@/lib/supabase/types";
import { withBrowser } from "../source-adapters/browser-helper";

function graphUrl(path: string) {
  const { graphVersion } = publishConfig();
  return `https://graph.facebook.com/${graphVersion}/${path}`;
}

async function getFreshFacebookVideoUrl(sourceUrl: string): Promise<string | null> {
  return withBrowser(async (browser) => {
    const page = await browser.newPage({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });

    await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(4000);

    const html = await page.content();
    const cleanHtml = html.replace(/\\/g, "");
    
    const hdMatch = cleanHtml.match(/"browser_native_hd_url"\s*:\s*"([^"]+)"/i);
    const sdMatch = cleanHtml.match(/"browser_native_sd_url"\s*:\s*"([^"]+)"/i);
    
    if (hdMatch?.[1]) return hdMatch[1];
    if (sdMatch?.[1]) return sdMatch[1];

    const videoSrc = await page.evaluate(() => {
      const vid = document.querySelector("video");
      return vid ? vid.src : null;
    });

    return videoSrc;
  });
}

async function getFreshFacebookImageUrls(sourceUrl: string): Promise<string[]> {
  try {
    return await withBrowser(async (browser) => {
      const page = await browser.newPage({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      });

      await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(3000);

      const images = await page.evaluate(() => {
        return [...document.querySelectorAll('div[role="article"] img, img')]
          .map((img) => (img as HTMLImageElement).src)
          .filter(
            (src) =>
              src &&
              src.includes("fbcdn.net") &&
              !src.includes("/images/emoji") &&
              !src.includes("emoji.php") &&
              !src.includes("rsrc.php") &&
              !src.includes("profile") &&
              !src.startsWith("data:")
          );
      });

      return images;
    });
  } catch (err) {
    console.warn("Failed to scrape fresh Facebook image URLs:", err);
    return [];
  }
}

export async function publishToFacebookPage(post: Post, pageId: string, pageAccessToken: string) {
  const message = (post.edited_caption ?? post.original_caption ?? "").trim();

  async function graphPost(path: string, params: Record<string, string>) {
    const body = new URLSearchParams({
      access_token: pageAccessToken,
      ...params,
    });

    const response = await fetch(graphUrl(path), {
      method: "POST",
      body,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(payload));
    }

    return payload;
  }

  async function uploadPhoto(
    imageUrl: string,
    params: { caption?: string; published?: string }
  ): Promise<{ id: string } | null> {
    // 1. Try to fetch image binary from imageUrl
    let imageBlob: Blob | null = null;
    try {
      const res = await fetch(imageUrl);
      if (res.ok) {
        imageBlob = await res.blob();
      }
    } catch (e) {
      // Ignore network error
    }

    // 2. If initial fetch failed and it's a facebook URL, try scraping fresh image URL
    if (!imageBlob && (imageUrl.includes("fbcdn.net") || post.platform === "facebook")) {
      const freshImages = await getFreshFacebookImageUrls(post.source_url);
      if (freshImages.length > 0) {
        try {
          const freshRes = await fetch(freshImages[0]);
          if (freshRes.ok) {
            imageBlob = await freshRes.blob();
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    // 3. If we have imageBlob, upload via multipart FormData (source)
    if (imageBlob) {
      try {
        const formData = new FormData();
        formData.append("access_token", pageAccessToken);
        formData.append("source", imageBlob, "photo.jpg");
        if (params.caption) formData.append("caption", params.caption);
        if (params.published) formData.append("published", params.published);

        const response = await fetch(graphUrl(`${pageId}/photos`), {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();
        if (response.ok) {
          return payload;
        }
        console.warn("Binary photo upload rejected by Graph API:", payload);
      } catch (uploadErr) {
        console.warn("Binary photo upload exception:", uploadErr);
      }
    }

    // 4. Try URL-based graphPost as fallback
    try {
      const bodyParams: Record<string, string> = {
        url: imageUrl,
        ...(params.caption ? { caption: params.caption } : {}),
        ...(params.published ? { published: params.published } : {}),
      };
      return await graphPost(`${pageId}/photos`, bodyParams);
    } catch (urlErr) {
      console.warn("URL-based photo upload failed:", urlErr);
      return null;
    }
  }

  // 1. If we have a direct video file link, upload it as a native video
  if (post.video_url && !post.video_url.startsWith("blob:")) {
    let videoUrl = post.video_url;
    const isFbVideoUrl = videoUrl.includes("fbcdn.net") || post.platform === "facebook";
    
    if (isFbVideoUrl) {
      try {
        const freshUrl = await getFreshFacebookVideoUrl(post.source_url);
        if (freshUrl) {
          videoUrl = freshUrl;
        }
      } catch (err) {
        console.warn("Failed to scrape fresh Facebook video URL, using stored one:", err);
      }

      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video file from Facebook CDN: ${videoResponse.statusText}`);
      }
      const videoBlob = await videoResponse.blob();

      const formData = new FormData();
      formData.append("access_token", pageAccessToken);
      formData.append("description", message);
      formData.append("source", videoBlob, "video.mp4");

      const response = await fetch(graphUrl(`${pageId}/videos`), {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(payload));
      }

      return payload;
    } else {
      return graphPost(`${pageId}/videos`, {
        file_url: videoUrl,
        description: message,
      });
    }
  }

  // 2. If it's a video/reel by URL, publish it as a link so Facebook embeds the player natively
  const isVideoUrl = 
    post.source_url.includes("/videos/") || 
    post.source_url.includes("/watch") || 
    post.source_url.includes("/reel/");

  if (isVideoUrl) {
    return graphPost(`${pageId}/feed`, {
      message,
      link: post.source_url,
    });
  }

  // 3. If it has multiple photos, upload each unpublished photo first and link them via attached_media
  if (post.additional_images && post.additional_images.length > 1) {
    const photoIds: string[] = [];
    for (const imageUrl of post.additional_images) {
      const res = await uploadPhoto(imageUrl, {
        published: "false",
      });
      if (res?.id) {
        photoIds.push(res.id);
      }
    }

    if (photoIds.length > 0) {
      const params: Record<string, string> = {
        message,
      };
      photoIds.forEach((id, index) => {
        params[`attached_media[${index}]`] = JSON.stringify({ media_fbid: id });
      });
      return graphPost(`${pageId}/feed`, params);
    }
  }

  // 4. Otherwise, if it has a single photo, publish it as a photo
  if (post.thumbnail_url) {
    const res = await uploadPhoto(post.thumbnail_url, {
      caption: message,
      published: "true",
    });
    if (res) {
      return res;
    }
    console.warn("Single photo upload failed; falling back to link post on feed for post:", post.id);
  }

  // 5. Default to standard feed link post
  return graphPost(`${pageId}/feed`, {
    message,
    link: post.source_url,
  });
}

export async function publishToFacebook(post: Post) {
  const pageId = requiredEnv("META_PAGE_ID");
  const pageAccessToken = requiredEnv("META_PAGE_ACCESS_TOKEN");
  return publishToFacebookPage(post, pageId, pageAccessToken);
}
