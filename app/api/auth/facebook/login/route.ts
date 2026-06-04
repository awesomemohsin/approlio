import { NextRequest, NextResponse } from "next/server";
import { siteUrl, publishConfig } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profile_id");

  if (!profileId) {
    return NextResponse.json(
      { error: "Workspace profile_id is required to initiate Facebook login" },
      { status: 400 }
    );
  }

  const clientId = process.env.META_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Meta OAuth credentials not configured. Please add META_CLIENT_ID to .env.local" },
      { status: 500 }
    );
  }

  const { graphVersion } = publishConfig();
  const redirectUri = `${siteUrl()}/api/auth/facebook/callback`;
  const scope = "pages_show_list,pages_read_engagement,pages_manage_posts,public_profile";

  const authUrl = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", profileId);

  return NextResponse.redirect(authUrl.toString());
}
