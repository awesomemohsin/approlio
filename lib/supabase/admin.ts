import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseAdmin() {
  return createClient<Database>(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
