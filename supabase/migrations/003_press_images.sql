-- Press page images (10 images stored as jsonb array in hero_settings)
ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS press_images jsonb NOT NULL DEFAULT '["","","","","","","","","",""]';
