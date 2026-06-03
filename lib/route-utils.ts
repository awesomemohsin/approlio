import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function requireDashboardUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return user;
}

export function jsonError(error: unknown) {
  if (error instanceof Response) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  return NextResponse.json({ error: message }, { status: 500 });
}
