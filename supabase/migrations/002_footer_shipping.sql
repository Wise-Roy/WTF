-- Shipping settings, edited from the admin Footer tab and used by the bag drawer
ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 500;
ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric DEFAULT 5000;
