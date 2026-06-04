import type { Post } from "@/lib/supabase/types";

export async function publishToYouTubeChannel(post: Post, channelId: string, accessToken: string) {
  const videoUrl = post.video_url;
  if (!videoUrl) {
    throw new Error("YouTube publishing requires a video file. Caption-only or image-only posts are not supported.");
  }

  const title = (post.edited_caption ?? post.original_caption ?? "Social Video").trim().slice(0, 100) || "Social Video";
  const description = (post.edited_caption ?? post.original_caption ?? "").trim();

  // 1. Download video file content
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video from URL: ${videoResponse.statusText}`);
  }
  const videoBuffer = await videoResponse.arrayBuffer();

  // 2. Construct multipart/related payload
  const boundary = "youtube_upload_boundary_multipart";
  
  const metadata = {
    snippet: {
      title,
      description,
      categoryId: "22", // People & Blogs (general category)
    },
    status: {
      privacyStatus: "public",
      selfDeclaredMadeForKids: false,
    },
  };

  const metadataPart = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    ""
  ].join("\r\n");

  const mediaHeader = [
    `--${boundary}`,
    "Content-Type: video/mp4",
    "",
    ""
  ].join("\r\n");

  const mediaFooter = `\r\n--${boundary}--`;

  const encoder = new TextEncoder();
  const metadataBuffer = encoder.encode(metadataPart);
  const mediaHeaderBuffer = encoder.encode(mediaHeader);
  const mediaFooterBuffer = encoder.encode(mediaFooter);

  const totalLength = metadataBuffer.length + mediaHeaderBuffer.length + videoBuffer.byteLength + mediaFooterBuffer.length;
  const bodyBuffer = new Uint8Array(totalLength);
  
  let offset = 0;
  bodyBuffer.set(metadataBuffer, offset);
  offset += metadataBuffer.length;
  bodyBuffer.set(mediaHeaderBuffer, offset);
  offset += mediaHeaderBuffer.length;
  bodyBuffer.set(new Uint8Array(videoBuffer), offset);
  offset += videoBuffer.byteLength;
  bodyBuffer.set(mediaFooterBuffer, offset);

  // 3. Perform upload request
  const uploadResponse = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": String(totalLength),
      },
      body: bodyBuffer,
    }
  );

  const responseText = await uploadResponse.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { text: responseText };
  }

  if (!uploadResponse.ok) {
    throw new Error(
      responseData.error?.message || 
      `YouTube API error (${uploadResponse.status}): ${JSON.stringify(responseData)}`
    );
  }

  return responseData;
}
