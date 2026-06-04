import { NextResponse } from "next/server";
import { siteUrl, publishConfig } from "@/lib/env";

export async function GET() {
  const clientId = process.env.META_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Meta OAuth credentials not configured. Please add META_CLIENT_ID to .env.local" },
      { status: 500 }
    );
  }

  const { graphVersion } = publishConfig();
  const redirectUri = `${siteUrl()}/api/auth/facebook/callback`;
  // We need permission to show pages, manage posts on them, and read engagement.
  const scope = "pages_show_list,pages_read_engagement,pages_manage_posts,public_profile";

  const authUrl = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);

  return NextResponse.redirect(authUrl.toString());
}
