import { NextRequest, NextResponse } from "next/server";
import { assertCronRequest } from "@/lib/api-auth";
import { processAllActiveSources } from "@/lib/automation/monitor";
import { jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    assertCronRequest(request);
    const results = await processAllActiveSources();
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return jsonError(error);
  }
}
