-- "Featured In" press logos (12 slots stored as jsonb array in hero_settings)
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS featured_images jsonb NOT NULL DEFAULT '["","","","","","","","","","","",""]';
