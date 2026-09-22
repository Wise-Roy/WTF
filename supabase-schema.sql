-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Magic link tokens
CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Profiles
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

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  status text DEFAULT 'pending',
  total numeric(10,2) NOT NULL,
  items jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Support queries
CREATE TABLE IF NOT EXISTS support_queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  related_order_id uuid REFERENCES orders(id),
  message text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS but allow all for now (dev mode)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_queries ENABLE ROW LEVEL SECURITY;

-- Permissive policies for dev
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on magic_link_tokens" ON magic_link_tokens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on support_queries" ON support_queries FOR ALL USING (true) WITH CHECK (true);
