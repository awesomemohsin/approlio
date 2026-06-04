import { createSupabaseAdmin } from "../lib/supabase/admin";

async function main() {
  const supabase = createSupabaseAdmin();
  
  console.log("=== Profiles ===");
  const { data: profiles, error: pError } = await supabase.from("profiles").select("*");
  if (pError) console.error(pError);
  else console.log(profiles);

  console.log("\n=== Sources ===");
  const { data: sources, error: sError } = await supabase.from("sources").select("*");
  if (sError) console.error(sError);
  else console.log(sources);
}

main().catch(console.error);
