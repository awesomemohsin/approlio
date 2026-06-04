import { publishConfig, requiredEnv } from "@/lib/env";
import type { Post } from "@/lib/supabase/types";

function graphUrl(path: string) {
  const { graphVersion } = publishConfig();
  return `https://graph.facebook.com/${graphVersion}/${path}`;
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

  // 1. If we have a direct video file link, upload it as a native video
  if (post.video_url && !post.video_url.startsWith("blob:")) {
    return graphPost(`${pageId}/videos`, {
      file_url: post.video_url,
      description: message,
    });
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
      const res = await graphPost(`${pageId}/photos`, {
        url: imageUrl,
        published: "false",
      });
      if (res.id) {
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
    return graphPost(`${pageId}/photos`, {
      url: post.thumbnail_url,
      caption: message,
      published: "true",
    });
  }

  // 4. Default to standard feed link post
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
