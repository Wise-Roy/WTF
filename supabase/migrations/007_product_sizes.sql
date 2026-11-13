-- Available sizes per product, as labels from the sizing chart (XS .. 4XL).
-- Existing products start with no sizes; admin picks them on the next edit.
ALTER TABLE products ADD COLUMN IF NOT EXISTS prod_sizes jsonb NOT NULL DEFAULT '[]';
