import { publishConfig, requiredEnv } from "@/lib/env";
import type { Post } from "@/lib/supabase/types";

function graphUrl(path: string) {
  const { graphVersion } = publishConfig();
  return `https://graph.facebook.com/${graphVersion}/${path}`;
}

async function graphPost(path: string, params: Record<string, string>) {
  const body = new URLSearchParams({
    access_token: requiredEnv("META_PAGE_ACCESS_TOKEN"),
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

export async function publishToFacebook(post: Post) {
  const pageId = requiredEnv("META_PAGE_ID");
  const message = (post.edited_caption ?? post.original_caption ?? "").trim();

  if (post.video_url) {
    return graphPost(`${pageId}/videos`, {
      file_url: post.video_url,
      description: message,
    });
  }

  if (post.thumbnail_url) {
    return graphPost(`${pageId}/photos`, {
      url: post.thumbnail_url,
      caption: message,
      published: "true",
    });
  }

  return graphPost(`${pageId}/feed`, {
    message,
    link: post.source_url,
  });
}
