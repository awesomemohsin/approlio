import { NextRequest, NextResponse } from "next/server";
import { siteUrl } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const profileId = searchParams.get("state");

  if (errorParam) {
    return NextResponse.redirect(`${siteUrl()}/dashboard/settings?error=${encodeURIComponent(errorParam)}`);
  }

  if (!profileId) {
    return NextResponse.redirect(`${siteUrl()}/dashboard/settings?error=Workspace+profile_id+is+missing`);
  }

  if (!code) {
    return NextResponse.redirect(`${siteUrl()}/dashboard/settings?error=No+authorization+code+provided`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${siteUrl()}/dashboard/settings?error=Google+credentials+not+configured`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${siteUrl()}/api/auth/youtube/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange authorization code");
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // 2. Fetch YouTube channel details
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const channelData = await channelResponse.json();
    if (!channelResponse.ok) {
      throw new Error(channelData.error?.message || "Failed to fetch YouTube channel details");
    }

    const channel = channelData.items?.[0];
    if (!channel) {
      throw new Error("No YouTube channel found for this Google account");
    }

    const channelId = channel.id;
    const channelTitle = channel.snippet?.title || "Unknown YouTube Channel";
    const channelThumbnail = channel.snippet?.thumbnails?.default?.url || "";

    // 3. Upsert connection record in Supabase
    const supabase = createSupabaseAdmin();
    
    interface YoutubeTokenData {
      refresh_token?: string;
      access_token?: string;
      expires_at?: number;
    }

    // We only get refresh_token when the user consents. If they reconnect, refresh_token might be undefined.
    // In that case, we should preserve the existing refresh_token if it exists.
    let finalRefreshToken = refresh_token;
    if (!finalRefreshToken) {
      const { data: existing } = await supabase
        .from("connections")
        .select("token_data")
        .eq("platform", "youtube")
        .eq("platform_id", channelId)
        .single();
      
      if (existing && existing.token_data) {
        finalRefreshToken = (existing.token_data as YoutubeTokenData).refresh_token;
      }
    }

    const savedTokenData = {
      access_token,
      refresh_token: finalRefreshToken,
      expires_at: Date.now() + expires_in * 1000,
      channel_title: channelTitle,
      channel_thumbnail: channelThumbnail,
    };

    const { error: upsertError } = await supabase
      .from("connections")
      .upsert({
        profile_id: profileId,
        name: channelTitle,
        platform: "youtube",
        type: "youtube_channel",
        platform_id: channelId,
        token_data: savedTokenData,
        active: true,
      }, {
        onConflict: "platform,platform_id"
      });

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.redirect(`${siteUrl()}/dashboard/settings?success=Successfully+connected+YouTube+channel`);
  } catch (error) {
    console.error("YouTube OAuth error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(
      `${siteUrl()}/dashboard/settings?error=${encodeURIComponent(message)}`
    );
  }
}
