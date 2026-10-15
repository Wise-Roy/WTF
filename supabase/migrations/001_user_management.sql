-- User management migration
-- Add password_hash and is_restricted to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_restricted boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text DEFAULT '';

-- Expand profiles with more address fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS house_flat text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS street text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state text DEFAULT '';

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist (product_id);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on wishlist" ON wishlist FOR ALL USING (true) WITH CHECK (true);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback (user_id);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on feedback" ON feedback FOR ALL USING (true) WITH CHECK (true);

-- Password reset tokens (reuse magic_link_tokens with a type)
ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS token_type text DEFAULT 'magic_link';
