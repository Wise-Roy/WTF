-- Year a design first dropped, shown on the collections hover. Optional for existing products.
ALTER TABLE products ADD COLUMN IF NOT EXISTS prod_launch_year integer
  CHECK (prod_launch_year BETWEEN 1900 AND 2100);
