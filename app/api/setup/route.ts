import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  name text DEFAULT '',
  phone text DEFAULT '',
  address_line1 text DEFAULT '',
  city text DEFAULT '',
  zip text DEFAULT '',
  country text DEFAULT 'IN',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  status text DEFAULT 'pending',
  total numeric(10,2) NOT NULL,
  items jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  related_order_id uuid REFERENCES orders(id),
  message text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_users') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    CREATE POLICY allow_all_users ON users FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_magic_link_tokens') THEN
    ALTER TABLE magic_link_tokens ENABLE ROW LEVEL SECURITY;
    CREATE POLICY allow_all_magic_link_tokens ON magic_link_tokens FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY allow_all_profiles ON profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_orders') THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    CREATE POLICY allow_all_orders ON orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_support_queries') THEN
    ALTER TABLE support_queries ENABLE ROW LEVEL SECURITY;
    CREATE POLICY allow_all_support_queries ON support_queries FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return NextResponse.json(
      {
        error: "SUPABASE_SERVICE_ROLE_KEY is required for setup. Add it to .env.local",
        hint: "Get it from Supabase Dashboard > Settings > API > service_role key",
        alternative: "Or run the SQL in supabase-schema.sql manually via the Supabase SQL Editor",
      },
      { status: 400 }
    );
  }

  try {
    // Use Supabase's pg endpoint to run raw SQL
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    });

    // Try the SQL API endpoint instead
    const sqlRes = await fetch(`${supabaseUrl}/pg`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    });

    if (sqlRes.ok) {
      return NextResponse.json({ status: "ok", message: "Tables created" });
    }

    const text = await sqlRes.text();
    return NextResponse.json(
      {
        status: "error",
        message: "Could not run SQL via API. Please run supabase-schema.sql manually.",
        detail: text,
      },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: "Run supabase-schema.sql manually via the Supabase SQL Editor",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
