import { NextRequest, NextResponse } from "next/server";
import { siteUrl, publishConfig } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam || errorDescription) {
    const errorMsg = errorDescription || errorParam || "Facebook auth failed";
    return NextResponse.redirect(`${siteUrl()}/dashboard/settings?error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${siteUrl()}/dashboard/settings?error=No+authorization+code+provided`);
  }

  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;
  const { graphVersion } = publishConfig();

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${siteUrl()}/dashboard/settings?error=Meta+credentials+not+configured`);
  }

  try {
    // 1. Exchange authorization code for short-lived access token
    const tokenUrl = new URL(`https://graph.facebook.com/${graphVersion}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("redirect_uri", `${siteUrl()}/api/auth/facebook/callback`);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error?.message || "Failed to exchange authorization code for Meta token");
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange short-lived token for long-lived user token
    const exchangeUrl = new URL(`https://graph.facebook.com/${graphVersion}/oauth/access_token`);
    exchangeUrl.searchParams.set("grant_type", "fb_exchange_token");
    exchangeUrl.searchParams.set("client_id", clientId);
    exchangeUrl.searchParams.set("client_secret", clientSecret);
    exchangeUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const exchangeResponse = await fetch(exchangeUrl.toString());
    const exchangeData = await exchangeResponse.json();

    if (!exchangeResponse.ok) {
      throw new Error(exchangeData.error?.message || "Failed to retrieve long-lived user token");
    }

    const longLivedUserToken = exchangeData.access_token;

    // 3. Retrieve the user's Facebook Pages
    const accountsUrl = new URL(`https://graph.facebook.com/${graphVersion}/me/accounts`);
    accountsUrl.searchParams.set("access_token", longLivedUserToken);
    accountsUrl.searchParams.set("limit", "100");

    const accountsResponse = await fetch(accountsUrl.toString());
    const accountsData = await accountsResponse.json();

    if (!accountsResponse.ok) {
      throw new Error(accountsData.error?.message || "Failed to retrieve Facebook Pages");
    }

    const pages = accountsData.data || [];
    if (pages.length === 0) {
      return NextResponse.redirect(`${siteUrl()}/dashboard/settings?error=No+Facebook+Pages+found+under+this+account`);
    }

    const supabase = createSupabaseAdmin();
    let connectedCount = 0;

    for (const page of pages) {
      // page.access_token is the long-lived page token since we fetched it with a long-lived user token.
      const pageId = page.id;
      const pageName = page.name;
      const pageAccessToken = page.access_token;

      // Upsert connection
      const { error: upsertError } = await supabase
        .from("connections")
        .upsert({
          name: pageName,
          platform: "facebook",
          type: "facebook_page",
          platform_id: pageId,
          token_data: {
            access_token: pageAccessToken,
            category: page.category,
            tasks: page.tasks,
          },
          active: true,
        }, {
          onConflict: "platform,platform_id"
        });

      if (upsertError) {
        console.error(`Error saving Page ${pageName}:`, upsertError);
      } else {
        connectedCount++;
      }
    }

    return NextResponse.redirect(
      `${siteUrl()}/dashboard/settings?success=Successfully+connected+${connectedCount}+Facebook+Page(s)`
    );
  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(
      `${siteUrl()}/dashboard/settings?error=${encodeURIComponent(message)}`
    );
  }
}
