import { NextRequest, NextResponse } from "next/server";
import { assertCronRequest } from "@/lib/api-auth";
import { publishApprovedPosts, retryFailedPosts } from "@/lib/automation/publish";
import { jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    assertCronRequest(request);
    const [published, retried] = await Promise.all([publishApprovedPosts(), retryFailedPosts()]);
    return NextResponse.json({ ok: true, published, retried });
  } catch (error) {
    return jsonError(error);
  }
}
