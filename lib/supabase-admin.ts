import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Without the service role the client is just an anon client, and every admin
// write fails as an RLS violation instead of as the config error it is.
if (!serviceRoleKey) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is not set — admin writes will fail RLS.");
}

// Use service role if available, otherwise fall back to anon key
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || anonKey
);
