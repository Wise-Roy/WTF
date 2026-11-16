-- Which Razorpay mode took the payment, so test orders never mix with real ones.
-- Set from the key prefix (rzp_test_ / rzp_live_) when the order is created.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_mode text
  CHECK (payment_mode IN ('test', 'live'));

CREATE INDEX IF NOT EXISTS idx_orders_mode_paid ON orders (payment_mode, paid_at DESC);
