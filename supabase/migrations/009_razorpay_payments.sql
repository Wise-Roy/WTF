-- Razorpay payment fields on orders.
-- An order is inserted as 'pending' with a razorpay_order_id and only becomes
-- 'paid' after the payment signature is verified server-side.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- One order row per Razorpay order, so a replayed verify cannot fan out
CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_id_key
  ON orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at DESC);
